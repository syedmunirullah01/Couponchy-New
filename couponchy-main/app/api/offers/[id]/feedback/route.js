import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/offers/[id]/feedback
 * Cast a community success/failure vote for an offer.
 * Rate limited to one vote per user IP address per offer within 24 hours.
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const voteType = body.voteType || body.vote_type;

    if (!voteType || !["success", "failure"].includes(voteType)) {
      return NextResponse.json(
        { error: "Invalid voteType. Must be 'success' or 'failure'." },
        { status: 400 }
      );
    }

    // 1. Resolve User IP Address
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 2. Anti-Abuse Check: One vote per IP per offer within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existingVotes, error: checkError } = await supabase
      .from("offer_feedback")
      .select("id")
      .eq("offer_id", id)
      .eq("ip_address", ip)
      .gte("created_at", twentyFourHoursAgo);

    if (checkError) {
      return NextResponse.json(
        { error: `Database check error: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json(
        { error: "You have already voted on this coupon in the last 24 hours." },
        { status: 429 }
      );
    }

    // 3. Record Feedback
    const { error: insertError } = await supabase
      .from("offer_feedback")
      .insert({
        offer_id: id,
        ip_address: ip,
        vote_type: voteType,
      });

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to record feedback: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 4. Fetch and update offer totals
    const { data: offer, error: fetchError } = await supabase
      .from("offers")
      .select("success_count, failure_count")
      .eq("id", id)
      .single();

    if (fetchError || !offer) {
      return NextResponse.json(
        { error: `Failed to load offer stats: ${fetchError?.message || "Not found"}` },
        { status: 404 }
      );
    }

    let newSuccessCount = offer.success_count || 0;
    let newFailureCount = offer.failure_count || 0;

    if (voteType === "success") {
      newSuccessCount += 1;
    } else {
      newFailureCount += 1;
    }

    const totalVotes = newSuccessCount + newFailureCount;
    const newSuccessRate = totalVotes > 0 ? Math.round((newSuccessCount / totalVotes) * 100) : 0;

    const updatePayload = {
      success_count: newSuccessCount,
      failure_count: newFailureCount,
      success_rate: newSuccessRate,
      updated_at: new Date().toISOString()
    };

    if (voteType === "success") {
      updatePayload.last_worked_at = new Date().toISOString();
    } else {
      updatePayload.last_failed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("offers")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update offer validation totals: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      successCount: newSuccessCount,
      failureCount: newFailureCount,
      successRate: newSuccessRate,
      message: "Feedback recorded successfully."
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
