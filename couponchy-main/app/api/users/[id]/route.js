import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { getPermissionsForRole, ROLE_LABELS } from "@/lib/access-control";
import { requirePermission } from "@/server/auth";

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || user.role,
    permissions: getPermissionsForRole(user.role, user.permissions),
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const access = await requirePermission("settings");
  if (access.error) {
    return access.error;
  }

  try {
    const payload = await request.json();

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updatePayload = {
      updated_at: new Date().toISOString()
    };

    if (payload?.name !== undefined) {
      updatePayload.name = payload.name.trim();
    }

    if (payload?.email !== undefined) {
      updatePayload.email = payload.email.trim().toLowerCase();
    }

    if (payload?.role !== undefined) {
      updatePayload.role = payload.role;
    }

    if (payload?.permissions !== undefined) {
      updatePayload.permissions = getPermissionsForRole(payload.role || user.role, payload.permissions);
    } else if (payload?.role !== undefined) {
      updatePayload.permissions = getPermissionsForRole(payload.role, user.permissions);
    }

    if (payload?.isActive !== undefined) {
      if (access.session.user.id === user.id && payload.isActive === false) {
        return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
      }
      updatePayload.is_active = Boolean(payload.isActive);
    }

    if (payload?.password) {
      if (payload.password.trim().length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
      }
      updatePayload.password = await bcrypt.hash(payload.password.trim(), 10);
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data: sanitizeUser(updatedUser) });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to update user." }, { status: 400 });
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const access = await requirePermission("settings");
  if (access.error) {
    return access.error;
  }

  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (access.session.user.id === user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
