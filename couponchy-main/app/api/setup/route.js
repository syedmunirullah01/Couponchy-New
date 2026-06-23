import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ROLE_PERMISSIONS } from "@/lib/access-control";
import bcrypt from "bcryptjs";

// ONE-TIME SETUP ROUTE - Delete this file after use!
export async function GET() {
  try {
    const email = "maxshopk@gmail.com";
    const password = "Testing123/";

    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      throw new Error(checkError.message);
    }

    if (existing) {
      return NextResponse.json({ message: "Admin already exists" }, { status: 200 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { error: insertError } = await supabase
      .from("users")
      .insert({
        name: "Primary Admin",
        email,
        password: hashedPassword,
        role: "admin",
        permissions: ROLE_PERMISSIONS.admin,
        is_active: true,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({ message: "Admin created successfully!", email }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
