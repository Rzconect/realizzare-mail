import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data: lists, error } = await supabase
      .from("lists")
      .select("id, name, description, subscriber_count, type, created_at, updated_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching lists:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, lists: lists || [] });
  } catch (err: any) {
    console.error("Error in GET /api/lists:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Nome da lista é obrigatório." }, { status: 400 });
    }

    const supabase = getSupabase();

    const newList = {
      org_id: "00000000-0000-0000-0000-000000000001",
      name: name.trim(),
      description: description?.trim() || "",
      subscriber_count: 0,
      type: "list",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("lists")
      .insert(newList)
      .select()
      .single();

    if (error) {
      console.error("Error inserting list:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, list: data });
  } catch (err: any) {
    console.error("Error in POST /api/lists:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
