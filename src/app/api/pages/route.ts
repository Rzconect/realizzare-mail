import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PAGES = [
  {
    id: "page-preferences-01",
    name: "Página de Preferências de E-mail",
    slug: "preferences",
    url: "https://realizzarecursos.com.br/preferences",
    status: "published",
    views: 342,
    conversions: 89,
    conversionRate: 26.0,
    conversionGoal: "form_submission",
    metaDescription: "Gerencie as categorias de e-mails, cursos e avisos que você deseja receber.",
    isNative: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-10-02T18:30:00.000Z",
    htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preferências de Comunicação - Realizzare Cursos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-150 p-8 space-y-6">
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
      </div>
      <h1 class="text-2xl font-black text-slate-900">Gerenciar Preferências de E-mail</h1>
      <p class="text-sm text-slate-500">Escolha quais comunicações você gostaria de continuar recebendo da Realizzare Cursos.</p>
    </div>

    <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
      <span class="text-xs font-semibold text-slate-500">Seu e-mail:</span>
      <span class="text-xs font-bold text-slate-800 bg-white px-3 py-1 rounded-xl border border-slate-200">{{email}}</span>
    </div>

    <div class="space-y-3">
      <label class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer bg-white">
        <div>
          <span class="font-bold text-sm text-slate-800 block">Novos Cursos & Lançamentos</span>
          <span class="text-xs text-slate-400">Avisos em primeira mão sobre cursos gratuitos e materiais de estudo.</span>
        </div>
        <input type="checkbox" checked class="w-5 h-5 text-indigo-600 rounded accent-indigo-600">
      </label>

      <label class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer bg-white">
        <div>
          <span class="font-bold text-sm text-slate-800 block">Promoções e Cupons de Desconto</span>
          <span class="text-xs text-slate-400">Descontos exclusivos para emissão de certificados válidos em todo o Brasil.</span>
        </div>
        <input type="checkbox" checked class="w-5 h-5 text-indigo-600 rounded accent-indigo-600">
      </label>

      <label class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer bg-white">
        <div>
          <span class="font-bold text-sm text-slate-800 block">Dicas de Estudo e Carreira</span>
          <span class="text-xs text-slate-400">Artigos e orientações semanais para enriquecer seu currículo e crescer na carreira.</span>
        </div>
        <input type="checkbox" checked class="w-5 h-5 text-indigo-600 rounded accent-indigo-600">
      </label>

      <label class="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer bg-white">
        <div>
          <span class="font-bold text-sm text-slate-800 block">Notificações Acadêmicas</span>
          <span class="text-xs text-slate-400">Lembretes de progresso, prazos de avaliação e emissão de certificados.</span>
        </div>
        <input type="checkbox" checked class="w-5 h-5 text-indigo-600 rounded accent-indigo-600">
      </label>
    </div>

    <button type="button" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-sm">
      Salvar Minhas Preferências
    </button>

    <div class="text-center pt-2">
      <a href="/unsubscribe" class="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
        Deseja cancelar todas as comunicações? Cancelar inscrição completa
      </a>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "page-unsubscribe-02",
    name: "Página de Descadastro / Opt-out",
    slug: "unsubscribe",
    url: "https://realizzarecursos.com.br/unsubscribe",
    status: "published",
    views: 128,
    conversions: 24,
    conversionRate: 18.75,
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
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex items-center justify-center p-4">
  <div class="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-150 p-8 space-y-6">
    <div class="text-center space-y-3">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mb-2">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      </div>
      <h1 class="text-2xl font-black text-slate-900">Inscrição Cancelada com Sucesso</h1>
      <p class="text-sm text-slate-500">Lamentamos ver você partir. Seu e-mail <strong class="text-slate-800">{{email}}</strong> foi removido de nossas listas de transmissão.</p>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
      <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Poderia nos contar o motivo do cancelamento?</h2>
      <div class="space-y-2 text-xs">
        <label class="flex items-center gap-2 cursor-pointer text-slate-650">
          <input type="radio" name="reason" value="too_many" class="text-indigo-600 accent-indigo-600">
          <span>Recebo e-mails com muita frequência</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-slate-650">
          <input type="radio" name="reason" value="not_relevant" class="text-indigo-600 accent-indigo-600">
          <span>O conteúdo não é mais relevante para mim</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-slate-650">
          <input type="radio" name="reason" value="never_subscribed" class="text-indigo-600 accent-indigo-600">
          <span>Nunca me inscrevi nesta lista</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer text-slate-650">
          <input type="radio" name="reason" value="other" class="text-indigo-600 accent-indigo-600">
          <span>Outro motivo</span>
        </label>
      </div>
      <button type="button" class="mt-2 text-xs font-bold text-indigo-650 hover:text-indigo-850 transition-colors">
        Enviar Feedback
      </button>
    </div>

    <div class="pt-2 flex flex-col sm:flex-row gap-3">
      <a href="/preferences" class="flex-1 text-center py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
        Ajustar Preferências
      </a>
      <button type="button" class="flex-1 text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors">
        Reativar Inscrição
      </button>
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

    const { data: dbRecords, error } = await supabase
      .from("reporting_events")
      .select("*")
      .eq("event_type", "page_item")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not query reporting_events for pages, returning default:", error);
      return NextResponse.json({ success: true, pages: DEFAULT_PAGES });
    }

    if (!dbRecords || dbRecords.length === 0) {
      // Seed default pages
      for (const p of DEFAULT_PAGES) {
        await supabase.from("reporting_events").insert({
          id: p.id.replace("page-", "").padEnd(36, "0").slice(0, 36),
          org_id: "00000000-0000-0000-0000-000000000001",
          contact_email: "sistema@realizzarecursos.com.br",
          event_type: "page_item",
          metadata: p
        });
      }
      return NextResponse.json({ success: true, pages: DEFAULT_PAGES });
    }

    const pages = dbRecords.map((r) => r.metadata || r);
    return NextResponse.json({ success: true, pages });
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
    // Deterministic UUID for Supabase reporting_events
    const rawUuid = page.id.includes("-") && page.id.length === 36
      ? page.id
      : `00000000-0000-0000-0000-${page.id.replace(/[^a-zA-Z0-9]/g, "").padStart(12, "0").slice(0, 12)}`;

    if (action === "upsert") {
      const pageToSave = {
        ...page,
        updatedAt: new Date().toISOString()
      };

      const { error } = await supabase.from("reporting_events").upsert({
        id: rawUuid,
        org_id: "00000000-0000-0000-0000-000000000001",
        contact_email: "sistema@realizzarecursos.com.br",
        event_type: "page_item",
        metadata: pageToSave
      });

      if (error) {
        console.error("Error upserting page:", error);
      }
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
