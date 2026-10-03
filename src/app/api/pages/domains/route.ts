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
    const { data: dbRecords, error } = await supabase
      .from("reporting_events")
      .select("*")
      .eq("event_type", "landing_domain")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching landing domains:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const domains = (dbRecords || []).map((r) => r.metadata || r);
    return NextResponse.json({ success: true, domains });
  } catch (err: any) {
    console.error("Error in GET /api/pages/domains:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { domain, cnameHost, cnameTarget } = body;

    if (!domain) {
      return NextResponse.json({ success: false, error: "Domínio é obrigatório." }, { status: 400 });
    }

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");

    const host = cnameHost || cleanDomain.split(".")[0] || "conteudo";
    const target = cnameTarget || "cname.realizzareconect.com.br";
    const isNative = cleanDomain === "realizzareconect.com.br";

    const supabase = getSupabase();
    const id = `dom-${cleanDomain.replace(/[^a-z0-9]/g, "-")}`;
    const rawUuid = `00000000-0000-0000-0001-${cleanDomain.replace(/[^a-zA-Z0-9]/g, "").padStart(12, "0").slice(0, 12)}`;

    const domainRecord = {
      id,
      domain: cleanDomain,
      status: isNative ? "connected" : "pending",
      cnameHost: host,
      cnameTarget: target,
      lastCheck: isNative ? "Nativo" : "Pendente de validação",
      createdAt: new Date().toISOString()
    };

    await supabase.from("reporting_events").upsert({
      id: rawUuid,
      org_id: "00000000-0000-0000-0000-000000000001",
      contact_email: "sistema@realizzarecursos.com.br",
      event_type: "landing_domain",
      metadata: domainRecord
    });

    return NextResponse.json({ success: true, domain: domainRecord });
  } catch (err: any) {
    console.error("Error in POST /api/pages/domains:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ success: false, error: "Domínio é obrigatório." }, { status: 400 });
    }

    const cleanDomain = domain.trim().toLowerCase();
    const supabase = getSupabase();
    const rawUuid = `00000000-0000-0000-0001-${cleanDomain.replace(/[^a-zA-Z0-9]/g, "").padStart(12, "0").slice(0, 12)}`;

    await supabase
      .from("reporting_events")
      .delete()
      .eq("id", rawUuid)
      .eq("event_type", "landing_domain");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/pages/domains:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
