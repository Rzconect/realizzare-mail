import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PAGES = [
  {
    id: "page-preferences-01",
    name: "Página de Preferências de E-mail",
    slug: "preferences",
    url: "https://realizzareconect.com.br/preferences",
    status: "published",
    views: 0,
    conversions: 0,
    conversionRate: 0,
    conversionGoal: "form_submission",
    metaDescription: "Gerencie as categorias de e-mails, cursos e avisos que você deseja receber da Realizzare.",
    isNative: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-10-02T18:30:00.000Z",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciar Preferências - Realizzare Cursos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col justify-center items-center p-4 font-sans text-slate-800">
  <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
    <!-- Header -->
    <div class="p-6 bg-indigo-600 text-white text-center space-y-2">
      <div class="inline-flex p-3 bg-white/10 rounded-full mb-1">
        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
      </div>
      <h1 class="text-xl font-bold tracking-tight">Gerenciar Preferências</h1>
      <p class="text-xs text-indigo-100 max-w-sm mx-auto font-medium">
        Selecione o tipo de conteúdo que deseja receber.
      </p>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div class="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
          A
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">E-mail atual</p>
          <p className="text-sm font-bold text-slate-800 truncate">{{email}}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Suas Inscrições</h3>
        
        <div class="space-y-3">
          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked class="w-4 h-4 mt-0.5 text-indigo-600 rounded accent-indigo-600">
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-800">Novos Cursos & Lançamentos</p>
              <p class="text-xs text-slate-400">Avisos em primeira mão sobre cursos gratuitos e materiais de estudo.</p>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked class="w-4 h-4 mt-0.5 text-indigo-600 rounded accent-indigo-600">
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-800">Promoções e Cupons de Desconto</p>
              <p class="text-xs text-slate-400">Descontos exclusivos para emissão de certificados válidos.</p>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked class="w-4 h-4 mt-0.5 text-indigo-600 rounded accent-indigo-600">
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-800">Dicas de Estudo e Carreira</p>
              <p class="text-xs text-slate-400">Artigos e orientações semanais para enriquecer seu currículo.</p>
            </div>
          </label>

          <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked class="w-4 h-4 mt-0.5 text-indigo-600 rounded accent-indigo-600">
            <div class="flex-1">
              <p class="text-sm font-bold text-slate-800">Notificações Acadêmicas</p>
              <p class="text-xs text-slate-400">Lembretes de progresso, prazos de avaliação e certificados.</p>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-2">
        <button type="button" class="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
          Salvar Preferências
        </button>
      </div>

      <div class="text-center pt-1">
        <a href="/unsubscribe" class="text-xs text-slate-500 hover:text-red-500 underline transition-colors">
          Cancelar inscrição de todos os e-mails
        </a>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "page-unsubscribe-02",
    name: "Página de Descadastro / Opt-out",
    slug: "unsubscribe",
    url: "https://realizzareconect.com.br/unsubscribe",
    status: "published",
    views: 0,
    conversions: 0,
    conversionRate: 0,
    conversionGoal: "button_click",
    metaDescription: "Página de cancelamento de inscrição de e-mails da Realizzare Cursos.",
    isNative: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-10-02T19:15:00.000Z",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cancelamento de Inscrição - Realizzare Cursos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col justify-center items-center p-4 font-sans text-slate-800">
  <div class="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
    <!-- Header Bar -->
    <div class="p-6 bg-indigo-600 text-white text-center space-y-2">
      <div class="inline-flex p-3 bg-white/10 rounded-full backdrop-blur-md mb-1">
        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      </div>
      <h1 class="text-xl font-bold tracking-tight">Inscrição Cancelada com Sucesso</h1>
      <p class="text-xs text-white/80 max-w-sm mx-auto font-medium leading-relaxed">
        Lamentamos ver você partir. Seu e-mail foi removido de nossas listas de transmissão.
      </p>
    </div>

    <!-- Content Body -->
    <div class="p-6 space-y-6">
      <!-- Status Alert Box -->
      <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <svg class="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <div class="space-y-1 text-xs">
          <p class="font-bold text-emerald-900">
            O endereço <span class="underline font-mono">{{email}}</span> foi descadastrado.
          </p>
          <p class="text-emerald-700">
            Você não receberá mais boletins informativos ou e-mails de marketing da Realizzare Cursos.
          </p>
        </div>
      </div>

      <!-- Undo / Re-subscribe Option -->
      <div class="text-center pt-1 pb-2 border-b border-slate-100">
        <p class="text-xs text-slate-500 mb-2">Foi um engano ou clicou sem querer?</p>
        <button type="button" class="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer">
          Reativar minha inscrição
        </button>
      </div>

      <!-- Feedback Form -->
      <div class="space-y-3 pt-1">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>Por que você decidiu se descadastrar? (Opcional)</span>
        </div>

        <div class="space-y-2 text-xs text-slate-650">
          <label class="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors">
            <input type="radio" name="reason" value="too_many" class="text-indigo-600 accent-indigo-600">
            <span>Recebo e-mails com muita frequência</span>
          </label>
          <label class="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors">
            <input type="radio" name="reason" value="not_relevant" class="text-indigo-600 accent-indigo-600">
            <span>O conteúdo não é relevante para meu momento</span>
          </label>
          <label class="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors">
            <input type="radio" name="reason" value="never_subscribed" class="text-indigo-600 accent-indigo-600">
            <span>Nunca me cadastrei nesta lista</span>
          </label>
          <label class="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors">
            <input type="radio" name="reason" value="other" class="text-indigo-600 accent-indigo-600">
            <span>Outro motivo</span>
          </label>
        </div>

        <button type="button" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
          Enviar Feedback
        </button>
      </div>

      <!-- Manage Preferences Link -->
      <div class="pt-2 text-center text-xs">
        <a href="/preferences" class="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
          Prefere ajustar quais e-mails recebe? Clique aqui para gerenciar preferências
        </a>
      </div>
    </div>

    <!-- Footer Branding -->
    <div class="bg-slate-100/70 border-t border-slate-200 p-4 text-center text-[11px] text-slate-400 font-medium">
      Realizzare Cursos • Plataforma de Ensino a Distância
    </div>
  </div>
</body>
</html>`
  }
];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Fetch saved page items
    const { data: dbRecords } = await supabase
      .from("reporting_events")
      .select("*")
      .eq("event_type", "page_item")
      .order("created_at", { ascending: false });

    // 2. Fetch all real tracking events for accurate counts
    const { data: trackingEvents } = await supabase
      .from("reporting_events")
      .select("event_type, metadata")
      .in("event_type", ["page_view", "page_conversion"]);

    // Calculate real metrics per slug
    const viewsMap: Record<string, number> = {};
    const convsMap: Record<string, number> = {};

    (trackingEvents || []).forEach((evt) => {
      const slug = evt.metadata?.slug || evt.metadata?.page_id;
      if (!slug) return;
      if (evt.event_type === "page_view") {
        viewsMap[slug] = (viewsMap[slug] || 0) + 1;
      } else if (evt.event_type === "page_conversion") {
        convsMap[slug] = (convsMap[slug] || 0) + 1;
      }
    });

    const basePages = dbRecords && dbRecords.length > 0
      ? dbRecords.map((r) => r.metadata || r)
      : DEFAULT_PAGES;

    // Attach real live metrics
    const pagesWithRealMetrics = basePages.map((p) => {
      const realViews = viewsMap[p.slug] || viewsMap[p.id] || 0;
      const realConvs = convsMap[p.slug] || convsMap[p.id] || 0;
      const rate = realViews > 0 ? Number(((realConvs / realViews) * 100).toFixed(1)) : 0;

      return {
        ...p,
        views: realViews,
        conversions: realConvs,
        conversionRate: rate,
        url: p.slug === "preferences"
          ? "https://realizzareconect.com.br/preferences"
          : (p.slug === "unsubscribe" ? "https://realizzareconect.com.br/unsubscribe" : (p.url ? p.url.replace(/\/p\//, "/") : `https://realizzareconect.com.br/${p.slug}`))
      };
    });

    return NextResponse.json({ success: true, pages: pagesWithRealMetrics });
  } catch (err: any) {
    console.error("Error fetching pages:", err);
    return NextResponse.json({ success: true, pages: DEFAULT_PAGES });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, page } = body;

    if (!action || !page || !page.id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabase();
    const rawUuid = page.id.includes("-") && page.id.length === 36
      ? page.id
      : `00000000-0000-0000-0000-${page.id.replace(/[^a-zA-Z0-9]/g, "").padStart(12, "0").slice(0, 12)}`;

    if (action === "upsert") {
      const pageToSave = {
        ...page,
        updatedAt: new Date().toISOString()
      };

      await supabase.from("reporting_events").upsert({
        id: rawUuid,
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: "sistema@realizzarecursos.com.br",
        event_type: "page_item",
        metadata: pageToSave
      });

      return NextResponse.json({ success: true, page: pageToSave });
    }

    if (action === "delete") {
      await supabase
        .from("reporting_events")
        .delete()
        .eq("id", rawUuid)
        .eq("event_type", "page_item");

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Error saving page:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
