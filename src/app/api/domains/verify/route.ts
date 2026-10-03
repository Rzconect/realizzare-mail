import { NextResponse } from "next/server";
import { Resolver } from "dns/promises";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawDomain = body.domain;

    if (!rawDomain || typeof rawDomain !== "string") {
      return NextResponse.json(
        { success: false, error: "Domínio é obrigatório." },
        { status: 400 }
      );
    }

    // Clean domain
    const cleanDomain = rawDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");

    // Native platform domain is always verified
    if (cleanDomain === "realizzareconect.com.br") {
      return NextResponse.json({
        success: true,
        verified: true,
        status: "connected",
        domain: cleanDomain,
        cnameRecords: ["cname.realizzareconect.com.br"],
        message: "Domínio nativo da plataforma Realizzare Mail ativo e operacional."
      });
    }

    // Perform REAL DNS check via Google and Cloudflare Public DNS
    const resolver = new Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);

    let cnameRecords: string[] = [];
    let isCnameResolved = false;
    let dnsErrorCode: string | null = null;

    try {
      cnameRecords = await resolver.resolveCname(cleanDomain);
      isCnameResolved = true;
    } catch (err: any) {
      dnsErrorCode = err.code || err.message;
    }

    const expectedTarget = "cname.realizzareconect.com.br";
    let verified = false;
    let message = "";

    if (isCnameResolved && cnameRecords.length > 0) {
      const matchingCname = cnameRecords.some(
        (target) =>
          target.toLowerCase().includes("realizzareconect.com.br") ||
          target.toLowerCase() === expectedTarget
      );

      if (matchingCname) {
        verified = true;
        message = `Conexão validada com sucesso! O registro DNS CNAME de "${cleanDomain}" está ativo e apontando corretamente para "${expectedTarget}".`;
      } else {
        verified = false;
        message = `O domínio "${cleanDomain}" possui um registro CNAME apontando para "${cnameRecords[0]}", mas precisa apontar para "${expectedTarget}". Atualize seu provedor DNS.`;
      }
    } else {
      // Check if maybe an A record was configured instead of CNAME
      let hasARecord = false;
      try {
        const aRecords = await resolver.resolve4(cleanDomain);
        if (aRecords && aRecords.length > 0) {
          hasARecord = true;
        }
      } catch {
        // ignore
      }

      verified = false;
      if (hasARecord) {
        message = `O subdomínio "${cleanDomain}" possui um registro tipo A, mas nossa infraestrutura requer um registro tipo CNAME apontando para "${expectedTarget}".`;
      } else {
        message = `Nenhum apontamento CNAME encontrado no DNS público para "${cleanDomain}" (${dnsErrorCode || "não publicado"}). Se você configurou recentemente na sua hospedagem, aguarde alguns instantes até a propagação mundial e clique em Testar novamente.`;
      }
    }

    // Persist verified status in DB if this domain was saved as a landing_domain
    try {
      const supabase = getSupabase();
      const { data: existingRecords } = await supabase
        .from("reporting_events")
        .select("id, metadata")
        .eq("event_type", "landing_domain");

      if (existingRecords && existingRecords.length > 0) {
        for (const item of existingRecords) {
          if (item.metadata?.domain?.toLowerCase() === cleanDomain) {
            await supabase
              .from("reporting_events")
              .update({
                metadata: {
                  ...item.metadata,
                  status: verified ? "connected" : "pending",
                  lastCheck: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                }
              })
              .eq("id", item.id);
          }
        }
      }
    } catch (saveErr) {
      console.warn("Could not update domain record in DB:", saveErr);
    }

    return NextResponse.json({
      success: true,
      verified,
      status: verified ? "connected" : "pending",
      domain: cleanDomain,
      cnameRecords,
      expectedTarget,
      message
    });
  } catch (err: any) {
    console.error("Error in POST /api/domains/verify:", err);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        status: "pending",
        error: err.message || "Erro interno ao consultar DNS."
      },
      { status: 500 }
    );
  }
}
