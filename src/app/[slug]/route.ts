import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

const RESERVED_SLUGS = new Set([
  "dashboard",
  "login",
  "api",
  "preferences",
  "unsubscribe",
  "flows",
  "sdk",
  "p",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml"
]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || RESERVED_SLUGS.has(slug.toLowerCase())) {
      return new Response("Página não encontrada", { status: 404 });
    }

    const supabase = getSupabase();

    // 1. Fetch page items from reporting_events
    const { data: records, error } = await supabase
      .from("reporting_events")
      .select("metadata")
      .eq("event_type", "page_item");

    if (error) {
      console.error("Error loading public page:", error);
    }

    const matched = (records || []).find((r: any) => {
      const p = r.metadata;
      return p && p.slug && p.slug.toLowerCase() === slug.toLowerCase();
    });

    const page = matched?.metadata;

    if (!page || !page.htmlContent) {
      return new Response(
        `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Página Não Encontrada - Realizzare</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col justify-center items-center p-4 font-sans text-slate-800">
  <div class="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-3">
    <div class="h-12 w-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
      404
    </div>
    <h1 class="text-lg font-black text-slate-900">Página Não Encontrada</h1>
    <p class="text-xs text-slate-500">A página que você está procurando não existe ou ainda não foi publicada.</p>
    <div class="pt-2">
      <a href="https://realizzareconect.com.br" class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs">
        Voltar para a Realizzare
      </a>
    </div>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        }
      );
    }

    // 2. Track page view in reporting_events
    await supabase.from("reporting_events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      contact_email: "",
      event_type: "page_view",
      metadata: {
        page_id: page.id,
        slug: page.slug,
        type: "view",
        timestamp: new Date().toISOString()
      }
    });

    // 3. Return full rendered HTML directly as text/html
    return new Response(page.htmlContent, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    });
  } catch (err: any) {
    console.error("Public page server error:", err);
    return new Response("Erro interno ao carregar a página", { status: 500 });
  }
}
