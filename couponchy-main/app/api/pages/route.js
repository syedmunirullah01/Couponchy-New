import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/server/repositories/settings-repository";
import { requirePermission } from "@/server/auth";

export async function GET() {
  const access = await requirePermission("pages");
  if (access.error) {
    return access.error;
  }

  try {
    const settings = await getSettings();
    return NextResponse.json({ data: settings.pages || {} });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load custom pages." }, { status: 500 });
  }
}

export async function PUT(request) {
  const access = await requirePermission("pages");
  if (access.error) {
    return access.error;
  }

  try {
    const payload = await request.json();
    const settings = await updateSettings({ pages: payload });
    return NextResponse.json({ data: settings.pages || {} });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to save custom pages." }, { status: 400 });
  }
}
