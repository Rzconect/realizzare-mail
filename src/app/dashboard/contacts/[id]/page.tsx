"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Tag,
  List,
  MoreVertical,
  BookOpen,
  DollarSign,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Inbox,
  AlertCircle,
  FileCheck2,
  ListFilter,
  CheckCircle2,
  MousePointerClick,
  Eye,
  Send,
  GitBranch,
  ChevronDown,
  ChevronUp,
  X,
  Pencil,
  Plus,
  Coins
} from "lucide-react";

// Mock Database of detailed profiles
export const mockProfileData: Record<string, {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  status: string;
  created_at: string;
  location: { country: string; state: string; city: string };
  tags: string[];
  custom_fields: Array<{ name: string; type: string; value: string }>;
  lists: Array<{ name: string; status: string; updated_at: string }>;
  enrollments: Array<{ course_name: string; price: string; status: string; progress: number; enrolled_at: string; certificate_issued: boolean; completed_at: string | null }>;
  purchases: Array<{ product_type: string; product_name: string; amount: number; paid_at: string; status: string; sku: string }>;
  flows: Array<{ name: string; status: 'active' | 'completed'; progress: number; entered_at: string }>;
  timeline: Array<{ id: string; type: string; label: string; details: string; timestamp: string }>;
}> = {
  "c1": {
    first_name: "Ana",
    last_name: "Oliveira",
    email: "ana.oliveira@gmail.com",
    phone: "(11) 98877-6655",
    birth_date: "1995-04-12",
    gender: "Feminino",
    status: "active",
    created_at: "2026-07-01",
    location: { country: "Brasil", state: "São Paulo", city: "São Paulo" },
    tags: ["Novo", "Matriculado", "Inbound"],
    custom_fields: [
      { name: "Área de Interesse", type: "text", value: "Tecnologia da Informação" },
      { name: "Nível Acadêmico", type: "text", value: "Ensino Superior Cursando" },
      { name: "Origem Lead", type: "text", value: "Instagram Ads" },
      { name: "Último Login", type: "text", value: "08/07/2026 11:20" },
      { name: "Curso Pretendido", type: "text", value: "React Native com Expo" }
    ],
    lists: [
      { name: "Boas-vindas Geral", status: "subscribed", updated_at: "2026-07-01" },
      { name: "Novidades Tecnologia", status: "subscribed", updated_at: "2026-07-02" }
    ],
    enrollments: [
      { course_name: "Introdução à Programação Web", price: "R$ 197,00", status: "active", progress: 42.50, enrolled_at: "2026-07-01", certificate_issued: false, completed_at: null },
      { course_name: "Marketing Digital de Performance", price: "R$ 197,00", status: "completed", progress: 100.00, enrolled_at: "2026-05-15", certificate_issued: true, completed_at: "2026-06-18" }
    ],
    purchases: [
      { product_type: "course", product_name: "Introdução à Programação Web", amount: 197.00, paid_at: "2026-07-01T14:32:00Z", status: "paid", sku: "DIR-WEB-197" },
      { product_type: "course", product_name: "Marketing Digital de Performance", amount: 197.00, paid_at: "2026-05-15T10:11:00Z", status: "paid", sku: "MKT-PER-197" }
    ],
    flows: [
      { name: "Boas-vindas Programação Web", status: "active", progress: 60, entered_at: "2026-07-01" },
      { name: "Pós-venda Performance", status: "completed", progress: 100, entered_at: "2026-06-01" }
    ],
    timeline: [
      { id: "e1", type: "click", label: "E-mail Clicado", details: "Clicou no link 'Ir para o curso' na campanha 'Seu Acesso Liberação'", timestamp: "2026-07-03T18:15:00Z" },
      { id: "e2", type: "open", label: "E-mail Aberto", details: "Abriu o e-mail de Boas-vindas 'Seu Acesso Liberação'", timestamp: "2026-07-01T15:02:00Z" },
      { id: "e3", type: "purchase", label: "Compra Aprovada", details: "Comprou curso 'Introdução à Programação Web' - R$ 197,00", timestamp: "2026-07-01T14:32:00Z" },
      { id: "e4", type: "enrollment", label: "Matrícula Realizada", details: "Matriculado no curso 'Introdução à Programação Web'", timestamp: "2026-07-01T14:32:00Z" },
      { id: "e5", type: "send", label: "E-mail Enviado", details: "Enviado e-mail de transação 'Seu Acesso Liberação'", timestamp: "2026-07-01T14:30:00Z" },
    ]
  },
  "c2": {
    first_name: "Bruno",
    last_name: "Santos",
    email: "bruno.santos@yahoo.com",
    phone: "(21) 97766-5544",
    birth_date: "1988-11-22",
    gender: "Masculino",
    status: "active",
    created_at: "2026-06-28",
    location: { country: "Brasil", state: "Rio de Janeiro", city: "Niterói" },
    tags: ["Interessado", "Futebol", "Outbound"],
    custom_fields: [
      { name: "Área de Interesse", type: "text", value: "Negócios & Finanças" },
      { name: "Origem Lead", type: "text", value: "Indicação" },
      { name: "Inscrição Newsletter", type: "text", value: "Sim" },
      { name: "Cargo", type: "text", value: "Gerente Financeiro" },
      { name: "Empresa", type: "text", value: "Confiança ME" }
    ],
    lists: [
      { name: "Novidades Geral", status: "subscribed", updated_at: "2026-06-28" }
    ],
    enrollments: [
      { course_name: "Gestão Financeira para Negócios", price: "R$ 297,00", status: "active", progress: 20.00, enrolled_at: "2026-06-29", certificate_issued: false, completed_at: null }
    ],
    purchases: [
      { product_type: "course", product_name: "Gestão Financeira para Negócios", amount: 297.00, paid_at: "2026-06-29T10:15:00Z", status: "paid", sku: "FIN-NEG-297" }
    ],
    flows: [
      { name: "Boas-vindas Gestão Financeira", status: "active", progress: 20, entered_at: "2026-06-29" }
    ],
    timeline: [
      { id: "e1", type: "open", label: "E-mail Aberto", details: "Abriu e-mail 'Dicas Rápidas de Gestão Financeira'", timestamp: "2026-07-05T09:12:00Z" },
      { id: "e2", type: "send", label: "E-mail Enviado", details: "Enviado e-mail newsletter 'Dicas Rápidas de Gestão Financeira'", timestamp: "2026-07-05T08:00:00Z" },
      { id: "e3", type: "enrollment", label: "Matrícula Realizada", details: "Matriculado no curso 'Gestão Financeira para Negócios'", timestamp: "2026-06-29T10:15:00Z" },
      { id: "e4", type: "purchase", label: "Compra Aprovada", details: "Comprou curso 'Gestão Financeira para Negócios' - R$ 297,00", timestamp: "2026-06-29T10:15:00Z" },
    ]
  }
};

function formatTransactionDate(paidAt: string, productType?: string): string {
  if (!paidAt) return "Data não informada";

  let method = "";
  if (paidAt.toLowerCase().includes("pix")) method = " • PIX";
  else if (paidAt.toLowerCase().includes("cartão") || paidAt.toLowerCase().includes("card")) method = " • Cartão de Crédito";
  else if (productType === "course") method = " • Cartão de Crédito";
  else method = " • PIX";

  // Match ISO string e.g. 2026-08-17T17:48:14+00:00 or 2026-08-17T17:48:14.000Z
  const isoMatch = paidAt.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?/);
  let dateObj: Date | null = null;
  if (isoMatch) {
    dateObj = new Date(isoMatch[0]);
  } else {
    const cleanStr = paidAt.split(" • ")[0].split(" - ")[0].trim();
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      dateObj = d;
    }
  }

  if (dateObj && !isNaN(dateObj.getTime())) {
    const formattedDate = dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo"
    });
    const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo"
    });
    return `${formattedDate} às ${formattedTime}${method}`;
  }

  if (paidAt.includes("às") || paidAt.includes("as") || paidAt.includes("/")) {
    return paidAt.includes("•") ? paidAt : `${paidAt}${method}`;
  }

  return `${paidAt}${method}`;
}

function formatTimelineTimestamp(ts: string): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      const datePart = d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Sao_Paulo"
      });
      const timePart = d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo"
      });
      return `${datePart} às ${timePart}`;
    }
  } catch (e) {}

  return ts;
}

function formatPayloadKeyValues(payload: any): Array<{ key: string; value: string }> {
  if (!payload || typeof payload !== "object") return [];

  const data = payload.payload ? { ...payload, ...payload.payload } : { ...payload };
  delete data.payload;

  const labelMap: Record<string, string> = {
    event: "Evento",
    action_type: "Tipo de Ação",
    item_title: "Item / Produto",
    item: "Item / Produto",
    sku: "SKU",
    course_id: "ID do Curso",
    course_name: "Nome do Curso",
    progress_percent: "Progresso (%)",
    completed_lessons: "Aulas Concluídas",
    total_lessons: "Total de Aulas",
    milestone: "Marco",
    is_paid_course: "Curso Pago",
    email: "E-mail do Aluno",
    first_name: "Nome do Aluno",
    url: "Link da Página",
    page_url: "Link da Página",
    timestamp: "Data / Hora",
    source: "Origem",
    provider: "Provedor",
    status: "Status",
    amount: "Valor",
    code: "Código do Certificado"
  };

  const result: Array<{ key: string; value: string }> = [];

  Object.entries(data).forEach(([rawKey, val]) => {
    if (val === null || val === undefined || rawKey === "org_id" || rawKey === "contact_id") return;

    const displayKey = labelMap[rawKey] || rawKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    let displayVal = String(val);

    if (typeof val === "boolean") {
      displayVal = val ? "Sim" : "Não";
    } else if (typeof val === "object") {
      try { displayVal = JSON.stringify(val); } catch (e) {}
    }

    if (rawKey === "amount" && typeof val === "number") {
      displayVal = `R$ ${val.toFixed(2).replace(".", ",")}`;
    }

    result.push({ key: displayKey, value: displayVal });
  });

  return result;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContactProfilePage({ params }: PageProps) {
  const router = useRouter();
  const [showAllFields, setShowAllFields] = useState(false);
  const [openDrawerInfo, setOpenDrawerInfo] = useState(false);
  const [openDrawerTags, setOpenDrawerTags] = useState(false);
  const [openDrawerCustom, setOpenDrawerCustom] = useState(false);
  
  // Resolve params using React.use() wrapper as standard in Next.js 15
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const searchParams = useSearchParams();
  const emailQuery = searchParams ? searchParams.get("email") : null;
  
  // State initialized as null to fetch from database
  const [profile, setProfile] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [visibleTimelineCount, setVisibleTimelineCount] = useState(10);
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});

  const toggleEventExpand = (evtId: string) => {
    setExpandedEventIds((prev) => ({ ...prev, [evtId]: !prev[evtId] }));
  };

  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 40) {
      if (draft && draft.timeline && visibleTimelineCount < draft.timeline.length) {
        setVisibleTimelineCount(prev => Math.min(prev + 5, draft.timeline.length));
      }
    }
  };

  // Sync with Supabase Database
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const supabase = createClient();

        // Build the full select query for contacts
        const contactSelect = `
          id,
          first_name,
          last_name,
          email,
          phone,
          birth_date,
          gender,
          status,
          created_at,
          country,
          state,
          city,
          contact_tags (
            tags (
              name
            )
          ),
          contact_custom_values (
            value_text,
            value_number,
            value_date,
            value_boolean,
            custom_fields (
              name,
              type,
              tag
            )
          ),
          list_subscriptions (
            status,
            updated_at,
            lists (
              name
            )
          ),
          enrollments (
            status,
            progress,
            enrolled_at,
            completed_at,
            certificate_issued,
            courses (
              name,
              price
            )
          ),
          purchases (
            product_type,
            product_name,
            amount,
            paid_at,
            status,
            sku
          ),
          flow_enrollments (
            status,
            entered_at,
            flows (
              name
            )
          )
        `;

        // 1. Try to fetch by ID first
        let { data, error: contactError } = await supabase
          .from("contacts")
          .select(contactSelect)
          .eq("id", id)
          .maybeSingle();

        // 2. If no contact found by ID (e.g., ID is an event UUID not a contact UUID),
        //    try fetching by email from the query param
        if (!data && emailQuery) {
          const emailResult = await supabase
            .from("contacts")
            .select(contactSelect)
            .eq("email", emailQuery.toLowerCase().trim())
            .maybeSingle();
          data = emailResult.data;
          contactError = emailResult.error;
        }

        if (contactError || !data) throw contactError || new Error("Contact not found");
        const contact: any = data;

        // 2. Fetch global custom fields definition
        const { data: globalFieldsData } = await supabase
          .from("custom_fields")
          .select("name, type, tag");
        const globalFields: any[] = globalFieldsData || [];

        // 3. Fetch real system lists from DB and localStorage
        let localListsNames: string[] = [];
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("realizzare_lists");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                localListsNames = parsed.map((l: any) => l.name).filter(Boolean);
              }
            }
          } catch (e) {}
        }

        const { data: allListsData } = await supabase
          .from("lists")
          .select("name")
          .order("name");

        let dbListsNames: string[] = [];
        if (allListsData && allListsData.length > 0) {
          dbListsNames = allListsData.map((l: any) => l.name);
        }

        const mergedLists = localListsNames.length > 0 ? localListsNames : (dbListsNames.length > 0 ? dbListsNames : ["Leads", "Alunos", "Clientes", "Professores"]);
        setSystemLists(mergedLists);

        // Format RLS result to frontend schema
        const tags = contact.contact_tags?.map((ct: any) => ct.tags?.name).filter(Boolean) || [];
        
        const mappedCustomFields = (globalFields || []).map((gf) => {
          const matchedVal = contact.contact_custom_values?.find(
            (ccv: any) => ccv.custom_fields?.tag === gf.tag
          );
          let value = "";
          if (matchedVal) {
            value = matchedVal.value_text || matchedVal.value_number?.toString() || matchedVal.value_date || (matchedVal.value_boolean ? "Sim" : "Não") || "";
          }
          return {
            name: gf.name,
            type: gf.type,
            value
          };
        });

        const lists = contact.list_subscriptions?.map((ls: any) => ({
          name: ls.lists?.name,
          status: ls.status,
          updated_at: ls.updated_at ? new Date(ls.updated_at).toISOString().split("T")[0] : ""
        })) || [];

        const enrollments = contact.enrollments?.map((e: any) => ({
          course_name: e.courses?.name,
          price: `R$ ${e.courses?.price || "0,00"}`.replace(".", ","),
          status: e.status,
          progress: parseFloat(e.progress || 0),
          enrolled_at: e.enrolled_at ? new Date(e.enrolled_at).toISOString().split("T")[0] : "",
          certificate_issued: !!e.certificate_issued,
          completed_at: e.completed_at ? new Date(e.completed_at).toISOString().split("T")[0] : null
        })) || [];

        const purchases = contact.purchases?.map((p: any) => ({
          product_type: p.product_type,
          product_name: p.product_name,
          amount: parseFloat(p.amount || 0),
          paid_at: p.paid_at,
          status: p.status,
          sku: p.sku || ""
        })) || [];

        const flows = contact.flow_enrollments?.map((fe: any) => ({
          name: fe.flows?.name,
          status: fe.status === "active" ? "active" : "completed",
          progress: fe.status === "active" ? 50 : 100,
          entered_at: fe.entered_at ? new Date(fe.entered_at).toISOString().split("T")[0] : ""
        })) || [];

        // 3. Fetch Timeline, Tracking Events, Campaigns & Course Events for this Contact
        const { data: dbCampaignsData } = await supabase
          .from("campaigns")
          .select("id, name, target_list, status, sent_at, created_at");

        const campaignMap = new Map<string, string>();
        if (dbCampaignsData) {
          dbCampaignsData.forEach((c: any) => campaignMap.set(c.id, c.name));
        }

        const { data: trackingEventsData } = await supabase
          .from("inbound_webhook_events")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: courseEventsData } = await supabase
          .from("course_events")
          .select("*, courses(name)")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false });

        let rawEvents: any[] = [];
        const contactEmailLower = (contact.email || "").toLowerCase().trim();

        // A. Campaign Sent Events (only if explicitly targeted to this contact's email)
        if (dbCampaignsData) {
          dbCampaignsData.forEach((c: any) => {
            if (c.status === "sent") {
              const targetStr = (c.target_list || "").toLowerCase();
              const isTargeted = targetStr.includes(contactEmailLower);

              if (isTargeted) {
                const flowName = c.flow_name || c.flowName || "";
                const detailsStr = flowName
                  ? `Fluxo: ${flowName} • Campanha: '${c.name}'`
                  : `Enviado e-mail da campanha '${c.name}'`;

                rawEvents.push({
                  id: `send-${c.id}`,
                  type: "send",
                  label: "E-mail Enviado",
                  details: detailsStr,
                  timestamp: c.sent_at || c.created_at
                });
              }
            }
          });
        }

        // B. Tracking Open, Click and DataLayer Action Events (Strictly per-contact)
        if (trackingEventsData && trackingEventsData.length > 0) {
          trackingEventsData.forEach((te: any) => {
            const payload = te.payload || {};
            let teEmail = (payload.email || payload.student_email || payload.contact_email || "").toLowerCase().trim();
            let teContactId = payload.contact_id;

            let isMatch = teContactId === contact.id || (teEmail && teEmail === contactEmailLower);

            if (isMatch) {
              const isClick = te.event_type === "email.click";
              const isOpen = te.event_type === "email.open";
              const isDataLayerAction = te.event_type === "user.action" || te.source === "datalayer_js" || te.provider === "datalayer_js" || payload.event === "checkout_click";

              if (isOpen || isClick) {
                const campTitle = campaignMap.get(payload.campaign_id) || "Campanha Realizzare";
                const flowName = payload.flow_name || payload.flowName || "";
                const flowPrefix = flowName ? `Fluxo: ${flowName} • ` : "";

                rawEvents.push({
                  id: te.id || Math.random().toString(),
                  type: isClick ? "email_click" : "open",
                  label: isClick ? "E-mail Clicado" : "E-mail Aberto",
                  details: isClick
                    ? `${flowPrefix}Clicou no link da campanha '${campTitle}'`
                    : `${flowPrefix}Abriu o e-mail da campanha '${campTitle}'`,
                  payload: payload,
                  timestamp: te.created_at
                });
              } else if (isDataLayerAction) {
                const actionPayload = payload.payload || {};
                const actionType = actionPayload.action_type || payload.event || "checkout_click";
                const itemTitle = actionPayload.item_title || actionPayload.item || "Emitir Certificado";
                const sku = actionPayload.sku ? `(SKU: ${actionPayload.sku})` : "";

                let label = `Botão acionado: ${itemTitle}`;
                if (actionType === "checkout_click" && (!actionPayload.item_title && !actionPayload.item)) {
                  label = "Botão acionado: Emitir Certificado";
                }

                rawEvents.push({
                  id: te.id || Math.random().toString(),
                  type: "button_click",
                  label,
                  details: `'${itemTitle}' ${sku}`.trim(),
                  payload: payload,
                  timestamp: te.created_at || payload.timestamp
                });
              }
            }
          });
        }

        if (courseEventsData && courseEventsData.length > 0) {
          courseEventsData.forEach((ce: any) => {
            const cName = ce.metadata?.course_name || ce.courses?.name || "Realizzare";
            let label = "Evento do Curso (WordPress)";
            let details = `Curso: ${cName}`;
            let type = "enrollment";
            let note = "";

            if (ce.event_type === "started") {
              label = "Matrícula em Curso (WordPress)";
              details = `Matriculado no curso '${cName}'`;
              type = "enrollment";
            } else if (ce.event_type === "progress_updated") {
              label = `Progresso de Aulas (${ce.metadata?.progress_percent || 0}%)`;
              details = `Concluiu ${ce.metadata?.completed_lessons || 0} aulas do curso '${cName}'`;
              type = "enrollment";
            } else if (ce.event_type === "certificate_issued") {
              label = "Certificado Emitido (WordPress)";
              details = `Certificado #${ce.metadata?.code || "CERT-2026"} emitido para '${cName}'`;
              type = "enrollment";
              note = "(1 crédito de certificado consumido)";
            }

            rawEvents.push({
              id: ce.id,
              type,
              label,
              details,
              note: ce.metadata?.note || note,
              payload: ce.metadata || { course_name: cName, event_type: ce.event_type },
              timestamp: ce.created_at
            });
          });
        }

        // C. Purchase Events (Pagar.me Transactions)
        if (purchases && purchases.length > 0) {
          purchases.forEach((p: any) => {
            const prodName = p.product_name || "Certificado de Conclusão - Realizzare Cursos";
            const amtStr = (p.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const isPaid = p.status === "paid" || p.status === "approved";

            rawEvents.push({
              id: `purchase-${p.id}`,
              type: "purchase",
              label: isPaid ? "Compra Aprovada (Pagar.me)" : "Transação Registrada",
              details: `Adquiriu '${prodName}' - R$ ${amtStr}`,
              payload: p,
              timestamp: p.paid_at || p.created_at
            });
          });
        }

        const { data: reportingEventsData } = await supabase
          .from("reporting_events")
          .select("*")
          .eq("contact_email", contact.email)
          .eq("event_type", "purchase");

        if (reportingEventsData && reportingEventsData.length > 0) {
          reportingEventsData.forEach((re: any) => {
            const meta = re.metadata || {};
            const title = meta.item_title || "Certificado de Conclusão - Realizzare Cursos";
            const amtStr = (meta.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            rawEvents.push({
              id: `reporting-${re.id}`,
              type: "purchase",
              label: "Compra Aprovada (Pagar.me)",
              details: `Adquiriu '${title}' - R$ ${amtStr}`,
              payload: meta,
              timestamp: re.created_at
            });
          });
        }

        // Always add contact creation event
        rawEvents.push({
          id: `created-${contact.id}`,
          type: "import",
          label: "Contato Cadastrado",
          details: `Cadastrado via ${contact.source || "WordPress Realizzare Integration"}`,
          payload: { contact_id: contact.id, source: contact.source, created_at: contact.created_at, email: contact.email },
          timestamp: contact.created_at
        });

        // Deduplicate and sort
        const seenEvtKeys = new Set();
        const timeline = rawEvents
          .filter(e => {
            const key = `${e.label}-${e.details}-${e.timestamp}`;
            if (seenEvtKeys.has(key)) return false;
            seenEvtKeys.add(key);
            return true;
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((e, idx) => ({
            id: e.id || `evt-${idx}`,
            type: e.type || "import",
            label: e.label || "Evento Registrado",
            details: e.details || "",
            note: e.note || "",
            payload: e.payload || null,
            timestamp: e.timestamp
          }));

        const emailsSentCount = rawEvents.filter((e) => e.type === "send").length;
        const emailsOpenedCount = rawEvents.filter((e) => e.type === "open").length;
        const emailsClickedCount = rawEvents.filter((e) => e.type === "email_click").length;

        const profileObj = {
          first_name: contact.first_name || "",
          last_name: contact.last_name || "",
          email: contact.email,
          phone: contact.phone || "",
          birth_date: contact.birth_date || "",
          gender: contact.gender || "",
          status: contact.status,
          created_at: new Date(contact.created_at).toISOString().split("T")[0],
          location: {
            country: contact.country || "Brasil",
            state: contact.state || "",
            city: contact.city || ""
          },
          tags,
          custom_fields: mappedCustomFields,
          lists,
          enrollments,
          purchases,
          flows,
          emails_sent: emailsSentCount,
          emails_opened: emailsOpenedCount,
          emails_clicked: emailsClickedCount,
          timeline
        };

        setProfile(profileObj);
        setDraft(JSON.parse(JSON.stringify(profileObj)));
      } catch (err) {
        // Fallback resolution for local/imported contacts (silently handled)

        // Fallback resolution for local/imported contacts
        let foundContact: any = null;

        // Check stored profile in localStorage
        const storedProfileRaw = localStorage.getItem(`realizzare_profile_${id}`);
        if (storedProfileRaw) {
          try { foundContact = JSON.parse(storedProfileRaw); } catch (e) { }
        }

        // Check contacts array in localStorage
        if (!foundContact) {
          const storedContactsRaw = localStorage.getItem("realizzare_contacts") || localStorage.getItem("realizzare_mock_contacts");
          if (storedContactsRaw) {
            try {
              const list = JSON.parse(storedContactsRaw);
              foundContact = list.find((item: any) => item.id === id);
            } catch (e) { }
          }
        }

        // Check for simulated Pagar.me / PagBank custom transactions & events pool
        let customTxList: any[] = [];
        let matchingStudentInfo: any = null;

        try {
          const rawSims = localStorage.getItem("realizzare_simulated_events");
          if (rawSims) {
            const parsedSims = JSON.parse(rawSims);
            if (Array.isArray(parsedSims) && parsedSims.length > 0) {
              const targetEmail = (emailQuery || foundContact?.email || "").toLowerCase().trim();
              const seenTxIds = new Set();
              
              // First pass: Find transactions belonging strictly to target email
              if (targetEmail) {
                parsedSims.forEach((s: any) => {
                  const sEmail = (s.email || "").toLowerCase().trim();
                  if (sEmail === targetEmail) {
                    if (!matchingStudentInfo) matchingStudentInfo = s;
                    if (!seenTxIds.has(s.id)) {
                      seenTxIds.add(s.id);
                      customTxList.push({
                        id: s.id || `sim-${Math.random()}`,
                        product_type: s.category || "certificado",
                        product_name: s.itemTitle || s.eventLabel || "Certificado de Conclusão - Realizzare Cursos",
                        amount: s.amount || 45.70,
                        paid_at: s.date ? `${s.date}${s.time ? ` às ${s.time}` : ""}` : "12/08/2026 às 14:14",
                        status: "paid",
                        provider: s.provider || "pagarme"
                      });
                    }
                  }
                });
              }

              // Fallback pass if no match or default id
              if (!matchingStudentInfo) {
                matchingStudentInfo = parsedSims.find((s: any) => s.email === "mikaelcastello@gmail.com") || parsedSims[0];
                customTxList.push({
                  id: matchingStudentInfo.id || `sim-default`,
                  product_type: matchingStudentInfo.category || "certificado",
                  product_name: matchingStudentInfo.itemTitle || matchingStudentInfo.eventLabel || "Certificado de Conclusão - Realizzare Cursos",
                  amount: matchingStudentInfo.amount || 45.70,
                  paid_at: matchingStudentInfo.date ? `${matchingStudentInfo.date}${matchingStudentInfo.time ? ` às ${matchingStudentInfo.time}` : ""}` : "12/08/2026 às 14:14",
                  status: "paid",
                  provider: matchingStudentInfo.provider || "pagarme"
                });
              }
            }
          }
        } catch (e) {
          console.error(e);
        }

        // Generate profile object with real student data
        let first_name = foundContact?.first_name;
        let last_name = foundContact?.last_name;
        let email = foundContact?.email;
        let phone = foundContact?.phone;
        let state = foundContact?.location?.state || foundContact?.state;
        let city = foundContact?.location?.city || foundContact?.city;

        if (matchingStudentInfo) {
          const nameParts = matchingStudentInfo.name ? matchingStudentInfo.name.split(" ") : [];
          if (nameParts.length > 0) {
            first_name = nameParts[0];
            last_name = nameParts.slice(1).join(" ") || "";
          }
          email = matchingStudentInfo.email || email;
          phone = matchingStudentInfo.phone || phone;
          state = matchingStudentInfo.state || state;
          city = matchingStudentInfo.city || city;
        }

        first_name = first_name || "Contato";
        last_name = (last_name || "").replace(/#\d+/, "").trim();
        email = email || "";
        phone = phone || "";
        state = state || "";
        city = city || "";
        const status = foundContact?.status || "active";
        const created_at = foundContact?.created_at || "15/08/2026";
        const tags = foundContact?.tags || ["Pagar.me V5", "Cliente Realizzare"];

        const customPurchases = customTxList.map((tx: any) => ({
          product_type: tx.product_type || "certificate",
          product_name: tx.product_name,
          amount: Number(tx.amount || 45.70),
          paid_at: tx.paid_at || "15/08/2026 às 14:30",
          status: tx.status || "paid",
          sku: tx.sku || "PAGARME-V5"
        }));

        const customTimelineEvents = customTxList.map((tx: any) => ({
          id: tx.id || `timeline-${Math.random()}`,
          type: "purchase",
          label: `Compra Aprovada (${tx.provider === "pagbank" ? "PagBank" : "Pagar.me"})`,
          details: `Comprou '${tx.product_name}' - R$ ${Number(tx.amount || 45.70).toFixed(2).replace(".", ",")}`,
          timestamp: tx.paid_at ? tx.paid_at.split(" ")[0] : "15/08/2026"
        }));

        // Default Pagar.me fallback event if user is a Pagar.me contact
        if (customPurchases.length === 0) {
          customPurchases.push({
            product_type: "certificado",
            product_name: "Certificado de Conclusão - Realizzare Cursos",
            amount: 45.70,
            paid_at: "15/08/2026 às 19:17 • PIX",
            status: "paid",
            sku: "PAGARME-V5"
          });
          customTimelineEvents.push({
            id: `evt-pagarme-def-1`,
            type: "purchase",
            label: "Compra Aprovada (Pagar.me)",
            details: "Comprou 'Certificado de Conclusão - Realizzare Cursos' - R$ 45,70",
            timestamp: "15/08/2026"
          });
        }
        if (customPurchases.length === 0 && (tags.includes("Pagar.me") || foundContact?.id?.startsWith("c_pagarme_"))) {
          customPurchases.push({
            product_type: "certificado",
            product_name: foundContact?.course || "Certificado de Conclusão - Realizzare Cursos",
            amount: Number(foundContact?.total_spent || 49.90),
            paid_at: created_at || "01/08/2026",
            status: "paid",
            sku: "PAGARME-V5"
          });

          customTimelineEvents.push({
            id: `evt-pagarme-def`,
            type: "purchase",
            label: "Compra Aprovada via Pagar.me",
            details: `Comprou '${foundContact?.course || "Certificado de Conclusão - Realizzare Cursos"}' - R$ ${Number(foundContact?.total_spent || 49.90).toFixed(2).replace(".", ",")}`,
            timestamp: created_at || "01/08/2026"
          });
        }

        const fallbackProfileObj = {
          first_name,
          last_name,
          email,
          phone,
          birth_date: "",
          gender: "Feminino",
          status,
          created_at,
          location: {
            country: "Brasil",
            state: "São Paulo",
            city: "São Paulo"
          },
          tags,
          custom_fields: [
            { name: "Área de Interesse", type: "text", value: "Cursos Livres Realizzare" },
            { name: "Origem Lead", type: "text", value: "Pagar.me V5 Checkout" }
          ],
          lists: [
            { name: "Lista Geral de Alunos", status: status === "unsubscribed" ? "unsubscribed" : "subscribed", updated_at: created_at }
          ],
          enrollments: [
            {
              course_name: foundContact?.course || "Certificado de Conclusão - Realizzare Cursos",
              price: `R$ ${Number(foundContact?.total_spent || 49.90).toFixed(2).replace(".", ",")}`,
              status: "active",
              progress: 100,
              enrolled_at: created_at || "01/08/2026",
              certificate_issued: true,
              completed_at: created_at || "01/08/2026"
            }
          ],
          purchases: customPurchases,
          flows: [],
          timeline: [
            ...customTimelineEvents,
            { id: "t1", type: "import", label: "Contato Mapeado", details: "Mapeado via Pagar.me V5 Integration", timestamp: created_at }
          ]
        };

        setProfile(fallbackProfileObj);
        setDraft(JSON.parse(JSON.stringify(fallbackProfileObj)));
      }
    };

    loadProfileData();
  }, [id]);

  // Active fields tracking
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  
  // Advanced Tag Manager states
  const availableTags = ["Novo", "Matriculado", "Inbound", "VIP", "Engajado", "Lead Quente", "Ex-Aluno", "Abandono", "Cliente", "Suporte"];
  const [tagInput, setTagInput] = useState("");

  // List Management states
  const [systemLists, setSystemLists] = useState<string[]>([]);
  const [selectedListToJoin, setSelectedListToJoin] = useState("");
  const [showListConfirmModal, setShowListConfirmModal] = useState(false);
  const [listConfirmAction, setListConfirmAction] = useState<{ type: "add" | "remove"; listName: string } | null>(null);

  // Get other available lists the user is NOT subscribed to
  const allOtherAvailableLists = useMemo(() => {
    const existingListNames = (draft?.lists || []).map((l: any) => l.name);
    const baseLists = systemLists.length > 0 ? systemLists : ["Leads", "Alunos", "Clientes", "Professores"];
    return baseLists.filter(lname => !existingListNames.includes(lname));
  }, [draft?.lists, systemLists]);

  const handleToggleListSubscription = (listName: string) => {
    const listObj = draft.lists.find((l: any) => l.name === listName);
    if (!listObj) return;
    setListConfirmAction({
      type: listObj.status === "subscribed" ? "remove" : "add",
      listName
    });
    setShowListConfirmModal(true);
  };

  const handleAddToListConfirm = () => {
    if (!selectedListToJoin) return;
    setListConfirmAction({
      type: "add",
      listName: selectedListToJoin
    });
    setShowListConfirmModal(true);
  };

  const executeListAction = async () => {
    if (!listConfirmAction) return;
    
    const { type, listName } = listConfirmAction;
    
    try {
      const supabase = createClient();
      
      // Get the list ID first
      const { data: listData, error: listFindError } = await supabase
        .from("lists")
        .select("id")
        .eq("name", listName)
        .single();
      if (listFindError) throw listFindError;

      const listId = (listData as any).id;

      if (type === "add") {
        const { error: subError } = await supabase
          .from("list_subscriptions")
          // @ts-ignore
          .upsert({
            contact_id: id,
            list_id: listId,
            status: "subscribed",
            updated_at: new Date().toISOString()
          } as any, { onConflict: "contact_id,list_id" });
        if (subError) throw subError;
      } else {
        const { error: subError } = await supabase
          .from("list_subscriptions")
          // @ts-ignore
          .upsert({
            contact_id: id,
            list_id: listId,
            status: "unsubscribed",
            updated_at: new Date().toISOString()
          } as any, { onConflict: "contact_id,list_id" });
        if (subError) throw subError;
      }

      // Refresh state locally
      let updatedLists = [...(draft.lists || [])];
      const idx = updatedLists.findIndex((l: any) => l.name === listName);
      if (type === "add") {
        if (idx > -1) {
          updatedLists[idx].status = "subscribed";
          updatedLists[idx].updated_at = new Date().toISOString().split("T")[0];
        } else {
          updatedLists.push({
            name: listName,
            status: "subscribed",
            updated_at: new Date().toISOString().split("T")[0]
          });
        }
      } else {
        if (idx > -1) {
          updatedLists[idx].status = "unsubscribed";
          updatedLists[idx].updated_at = new Date().toISOString().split("T")[0];
        }
      }

      // Sync status
      const hasActiveList = updatedLists.some((l: any) => l.status === "subscribed");
      const newStatus = hasActiveList ? "active" : "unsubscribed";

      // Update contacts table status
      await supabase
        .from("contacts")
        // @ts-ignore
        .update({ status: newStatus } as any)
        .eq("id", id);

      const updatedDraft = {
        ...draft,
        status: newStatus,
        lists: updatedLists
      };

      setDraft(updatedDraft);
      setProfile(updatedDraft);

      setSelectedListToJoin("");
      setShowListConfirmModal(false);
      setListConfirmAction(null);
      alert(type === "add" ? `Contato adicionado à lista "${listName}" com sucesso!` : `Inscrição na lista "${listName}" cancelada com sucesso!`);

    } catch (err: any) {
      console.error(err);
      alert("Erro ao atualizar inscrição na lista.");
    }
  };

  const toggleEdit = (fieldName: string) => {
    setEditingFields((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(draft);

  const handleSaveAll = async () => {
    try {
      const supabase = createClient();
      
      // 1. Update contact basic details
      const { error: updateError } = await supabase
        .from("contacts")
        // @ts-ignore
        .update({
          first_name: draft.first_name,
          last_name: draft.last_name,
          email: draft.email,
          phone: draft.phone || null,
          city: draft.location?.city || draft.city || null,
          state: draft.location?.state || draft.state || null,
          birth_date: draft.birth_date || null
        } as any)
        .eq("id", id);
      if (updateError) throw updateError;

      // 2. Synchronize Tags
      // Get all global tags to resolve IDs by name
      const { data: globalTags } = await supabase
        .from("tags")
        .select("id, name");
      
      // Resolve IDs for draft.tags
      const tagIds = draft.tags.map((tName: string) => {
        const found = (globalTags as any[])?.find(gt => gt.name.toLowerCase() === tName.toLowerCase());
        return found?.id;
      }).filter(Boolean);

      // Delete existing tag relations
      await supabase
        .from("contact_tags")
        .delete()
        .eq("contact_id", id);
      
      // Insert new tag relations
      if (tagIds.length > 0) {
        const relations = tagIds.map((tId: any) => ({
          contact_id: id,
          tag_id: tId
        }));
        // @ts-ignore
        await supabase.from("contact_tags").insert(relations as any);
      }

      // 3. Synchronize Custom Fields Values
      // Get custom fields definitions to resolve IDs by name
      const { data: customFieldsDef } = await supabase
        .from("custom_fields")
        .select("id, name, type");

      for (const field of draft.custom_fields) {
        const def = (customFieldsDef as any[])?.find(cf => cf.name === field.name);
        if (!def) continue;

        const valueObj: any = {
          contact_id: id,
          field_id: def.id
        };

        if (def.type === "text") {
          valueObj.value_text = field.value;
        } else if (def.type === "number") {
          valueObj.value_number = parseFloat(field.value) || null;
        } else if (def.type === "date") {
          valueObj.value_date = field.value || null;
        } else if (def.type === "boolean") {
          valueObj.value_boolean = field.value === "Sim" || field.value === "true";
        }

        await supabase
          .from("contact_custom_values")
          // @ts-ignore
          .upsert(valueObj as any, { onConflict: "contact_id,field_id" });
      }

      setProfile(JSON.parse(JSON.stringify(draft)));
      setEditingFields({});
      alert("Alterações salvas com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar alterações no banco de dados.");
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "button_click":
        return <MousePointerClick className="h-3.5 w-3.5 text-emerald-650" />;
      case "email_click":
      case "click":
        return <MousePointerClick className="h-3.5 w-3.5 text-blue-600" />;
      case "open":
        return <Eye className="h-3.5 w-3.5 text-indigo-600" />;
      case "send":
        return <Send className="h-3.5 w-3.5 text-blue-600" />;
      case "enrollment":
        return <BookOpen className="h-3.5 w-3.5 text-violet-600" />;
      case "purchase":
        return <DollarSign className="h-3.5 w-3.5 text-amber-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const getTimelineBadgeClass = (type: string) => {
    switch (type) {
      case "button_click":
        return "bg-emerald-50 border border-emerald-200";
      case "email_click":
      case "click":
        return "bg-blue-50 border border-blue-200";
      case "open":
        return "bg-indigo-50 border border-indigo-200";
      case "send":
        return "bg-blue-50 border border-blue-200";
      case "enrollment":
        return "bg-violet-50 border border-violet-200";
      case "purchase":
        return "bg-amber-50 border border-amber-200";
      default:
        return "bg-slate-100 border border-slate-200";
    }
  };

  if (!profile || !draft) {
    return (
      <div className="flex-1 flex flex-col space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs animate-pulse">
            <div className="h-20 w-20 bg-slate-200 rounded-full mx-auto" />
            <div className="h-6 w-36 bg-slate-200 rounded-md mx-auto" />
            <div className="h-4 w-48 bg-slate-200 rounded-md mx-auto" />
            <div className="space-y-3 pt-6">
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white border border-slate-200 rounded-3xl p-4 animate-pulse" />
              ))}
            </div>
            <div className="h-64 bg-white border border-slate-200 rounded-3xl p-6 animate-pulse" />
            <div className="h-48 bg-white border border-slate-200 rounded-3xl p-6 animate-pulse" />
          </div>
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 animate-pulse space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded-md" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const emailsSentCount = draft.emails_sent || 0;
  const emailsOpenedCount = draft.emails_opened || 0;
  const emailsClickedCount = draft.emails_clicked || 0;
  const emailsOpenedRate = emailsSentCount > 0 ? Math.round((emailsOpenedCount / emailsSentCount) * 100) : 0;
  const emailsClickedRate = emailsSentCount > 0 ? Math.round((emailsClickedCount / emailsSentCount) * 100) : 0;

  return (
    <div className="lg:h-[calc(100vh-100px)] flex flex-col space-y-4 overflow-hidden min-h-0">
      {/* Navigation & Header */}
      <div className="shrink-0 flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5 text-sm">
          <button
            onClick={() => router.push("/dashboard/contacts")}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <Link href="/dashboard/contacts" className="text-slate-505 text-slate-500 hover:text-slate-805 hover:text-slate-800 transition-colors font-medium">
            Contatos
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-indigo-700 font-bold">{draft.first_name} {draft.last_name}</span>
        </div>

        {/* Save button visible only when there are unsaved inline changes */}
        {hasChanges && (
          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-650 hover:from-emerald-650 hover:to-emerald-700 text-white rounded-xl text-sm font-extrabold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer animate-fadeIn"
          >
            Salvar Alterações
          </button>
        )}
      </div>

      {/* 2-Column Profile Layout Grid (8 / 4 cols) - Fixed Height on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0 overflow-y-auto lg:overflow-hidden p-0.5 pb-1">
        
        {/* Column 1: Main Content (8 Cols) - Independently Scrollable */}
        <section className="lg:col-span-8 space-y-6 lg:h-full lg:overflow-y-auto scrollbar-none pb-10 pr-2">
          
          {/* Header Card (Avatar + Info) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 rounded-full border border-slate-200 bg-indigo-50 flex items-center justify-center shadow-xs shrink-0">
                <User className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 group">
                  <h2 className="text-2xl font-bold text-slate-850">
                    {editingFields.name ? (
                      <div className="flex gap-1.5 justify-center items-center animate-fadeIn">
                        <input
                          type="text"
                          value={draft.first_name}
                          onChange={(e) => setDraft({ ...draft, first_name: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-base text-slate-800 w-32 focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={draft.last_name}
                          onChange={(e) => setDraft({ ...draft, last_name: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-base text-slate-800 w-32 focus:outline-none focus:border-indigo-500"
                        />
                        <button onClick={() => toggleEdit("name")} className="text-sm text-emerald-600 font-bold ml-1 hover:text-emerald-700 cursor-pointer">✓</button>
                      </div>
                    ) : (
                      <>{draft.first_name} {draft.last_name}</>
                    )}
                  </h2>
                  {!editingFields.name && (
                    <button onClick={() => toggleEdit("name")} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-1 cursor-pointer">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {(draft.lists && draft.lists.length > 0 && draft.lists.some((l: any) => l.status === "subscribed")) || draft.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Inativo
                    </span>
                  )}
                  
                  {editingFields.email ? (
                    <div className="flex gap-1.5 items-center animate-fadeIn">
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 w-48 focus:outline-none focus:border-indigo-500"
                      />
                      <button onClick={() => toggleEdit("email")} className="text-sm text-emerald-600 font-bold ml-1 hover:text-emerald-700 cursor-pointer">✓</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 group/email">
                      <span className="text-slate-500 text-sm font-medium">{draft.email}</span>
                      <button onClick={() => toggleEdit("email")} className="opacity-0 group-hover/email:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {draft.lists && draft.lists.length > 0 && (
                     <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200 uppercase tracking-wider">
                       <Mail className="h-3 w-3" />
                       Newsletter Leads
                     </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 md:pt-0">
               <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer">
                 <Pencil className="h-4 w-4" />
               </button>
               <button className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer">
                 <MoreVertical className="h-4 w-4" />
               </button>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center border-b border-slate-200 overflow-x-auto scrollbar-none">
              <button className="px-6 py-4 border-b-2 border-indigo-600 text-indigo-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                <User className="h-4 w-4" />
                Informações Pessoais
              </button>
              <button className="px-6 py-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer">
                <List className="h-4 w-4" />
                Campos Personalizados ({draft.custom_fields ? Object.keys(draft.custom_fields).length : 0})
              </button>
              <button className="px-6 py-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer">
                <Tag className="h-4 w-4" />
                Marcadores e Tags ({draft.tags ? draft.tags.length : 0})
              </button>
            </div>
            
            <div className="p-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome</div>
                   <div className="text-sm font-semibold text-slate-800">{draft.first_name} {draft.last_name}</div>
                 </div>
                 <div className="group">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cidade</div>
                   {editingFields.city ? (
                     <div className="flex items-center gap-1.5 animate-fadeIn">
                        <input type="text" value={draft.city || ""} onChange={(e) => setDraft({...draft, city: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-800 w-full focus:outline-none focus:border-indigo-500" />
                        <button onClick={() => toggleEdit("city")} className="text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer">✓</button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5">
                       <span className="text-sm font-semibold text-slate-800">{draft.city || "Belo Horizonte"}</span>
                       <button onClick={() => toggleEdit("city")} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                     </div>
                   )}
                 </div>
                 <div className="group">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Telefone</div>
                   {editingFields.phone ? (
                     <div className="flex items-center gap-1.5 animate-fadeIn">
                        <input type="text" value={draft.phone || ""} onChange={(e) => setDraft({...draft, phone: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-800 w-full focus:outline-none focus:border-indigo-500" />
                        <button onClick={() => toggleEdit("phone")} className="text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer">✓</button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5">
                       <span className="text-sm font-semibold text-slate-800">{draft.phone || "(11) 99999-9999"}</span>
                       <button onClick={() => toggleEdit("phone")} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                     </div>
                   )}
                 </div>
                 <div className="group">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estado</div>
                   {editingFields.state ? (
                     <div className="flex items-center gap-1.5 animate-fadeIn">
                        <input type="text" value={draft.state || ""} onChange={(e) => setDraft({...draft, state: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-800 w-full focus:outline-none focus:border-indigo-500" />
                        <button onClick={() => toggleEdit("state")} className="text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer">✓</button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5">
                       <span className="text-sm font-semibold text-slate-800">{draft.state || "Minas Gerais"}</span>
                       <button onClick={() => toggleEdit("state")} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity p-0.5 cursor-pointer"><Pencil className="h-3 w-3" /></button>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Emails */}
             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">Engajamento de E-mails</h3>
                 <Mail className="h-4.5 w-4.5 text-indigo-500" />
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Emails enviados:</span>
                   <span className="font-bold text-slate-800 text-base">{emailsSentCount}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Emails abertos:</span>
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-slate-800 text-base">{emailsOpenedCount}</span>
                     <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded font-bold">{emailsOpenedRate}%</span>
                   </div>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 font-medium">Emails clicados:</span>
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-slate-800 text-base">{emailsClickedCount}</span>
                     <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-500 px-1.5 py-0.5 rounded font-bold">{emailsClickedRate}%</span>
                   </div>
                 </div>
               </div>
             </div>

             {/* Credits */}
             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-wider">Créditos de Certificado</h3>
                 <div className="h-5 w-5 rounded-full border border-amber-500 text-amber-500 flex items-center justify-center font-bold text-[10px]">$</div>
               </div>
               <div className="mt-2">
                 <div className="text-[40px] font-black text-slate-800 mb-2 leading-none">0</div>
                 <div className="inline-block bg-amber-50 text-amber-500 border border-amber-200/50 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">0 créditos disponíveis</div>
               </div>
             </div>
          </div>

          {/* Card 2: Matrículas & Progresso */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-650" />
                <span>Matrículas & Progresso</span>
              </h3>
              <span className="text-xs text-indigo-650 hover:text-indigo-800 cursor-pointer font-bold transition-colors">Ver Histórico</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-450 select-none">
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3">Nome do Curso</th>
                    <th className="py-2 px-3">Status do Curso</th>
                    <th className="py-2 px-3">Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {draft.enrollments && draft.enrollments.length > 0 ? (
                    [...draft.enrollments]
                      .sort((a, b) => new Date(a.enrolled_at || 0).getTime() - new Date(b.enrolled_at || 0).getTime())
                      .map((item, idx) => {
                        const cleanCourseName = (item.course_name || "Curso Realizzare")
                          .replace(/^Certificado de Conclusão - /i, "")
                          .replace(/^Curso de /i, "");

                        const certStatus = item.certificate_issued ? "Emitido" : "Não Emitido";
                        const certSub = item.certificate_issued 
                          ? `Emissão: ${item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString("pt-BR") : "Hoje"}`
                          : "Aguardando solicitação";

                        return (
                          <tr key={idx} className="hover:bg-slate-50/40 transition-colors group">
                            <td className="py-3 px-3 text-center font-bold text-slate-400 w-10">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col text-left">
                                <span className="font-bold text-slate-800 text-xs">{cleanCourseName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col items-start text-left">
                                {(() => {
                                  let badgeCls = "bg-amber-50 text-amber-700 border border-amber-200";
                                  let labelText = "Iniciado (0%)";

                                  if (item.certificate_issued || (item.progress >= 100 && item.status === "completed")) {
                                    badgeCls = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                                    labelText = "Finalizado (100%)";
                                  } else if (item.progress >= 100) {
                                    badgeCls = "bg-sky-50 text-sky-700 border border-sky-200";
                                    labelText = "Concluído (100%)";
                                  } else if (item.progress > 0) {
                                    badgeCls = "bg-indigo-50 text-indigo-700 border border-indigo-200";
                                    labelText = `Em Andamento (${item.progress}%)`;
                                  }

                                  return (
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeCls}`}>
                                      {labelText}
                                    </span>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex flex-col items-start text-left">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                  item.certificate_issued ? "text-emerald-700" : "text-slate-500 italic"
                                }`}>
                                  {item.certificate_issued ? "✓ " : ""} {certStatus}
                                </span>
                                <span className="text-[10px] text-slate-450 mt-0.5">
                                  {certSub}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 italic font-medium">
                        Nenhum curso matriculado até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
              <GitBranch className="h-4.5 w-4.5 text-indigo-650" />
              <span>Fluxos de Automação</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 uppercase font-black text-[10px] border-b border-slate-200 pb-2.5">
                    <th className="pb-2.5">Nome do Fluxo</th>
                    <th className="pb-2.5">Progresso</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                  {draft.flows && draft.flows.length > 0 ? (
                    draft.flows.map((flow: any, idx: number) => {
                      const totalSteps = flow.name.includes("Boas-vindas") ? 5 : 4;
                      const currentStep = Math.round((flow.progress / 100) * totalSteps);
                      const statusLabel = flow.status === "active" ? "Em Andamento" : "Finalizado";
                      const badgeCls = flow.status === "active"
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-slate-100 border-slate-200 text-slate-500";

                      return (
                        <tr key={idx} className="group">
                          <td className="py-3.5 pr-2">
                            <div className="font-semibold text-slate-800 truncate max-w-[240px]">
                              {flow.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Entrou em: {new Date(flow.entered_at).toLocaleDateString("pt-BR")}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800">{flow.progress}%</span>
                              <span className="text-[10px] text-slate-400">({currentStep}/{totalSteps} e-mails)</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase ${badgeCls}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-xs text-slate-400 italic">
                        Nenhum fluxo de automação ativo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 4: Transações & Faturamento Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
              <DollarSign className="h-4.5 w-4.5 text-indigo-650" />
              <span>Transações & Faturamento</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 uppercase font-black text-[10px] border-b border-slate-200 pb-2.5">
                    <th className="pb-2.5 py-2 px-1">Produto / Curso</th>
                    <th className="pb-2.5 py-2 px-3">Data da Transação</th>
                    <th className="pb-2.5 py-2 px-3">Valor</th>
                    <th className="pb-2.5 py-2 px-1 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650">
                  {draft.purchases.map((purchase: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-1">
                        <div className="font-bold text-slate-850 text-xs leading-relaxed break-words">
                          {purchase.product_name}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-xs text-slate-600 font-semibold whitespace-nowrap">
                          {formatTransactionDate(purchase.paid_at, purchase.product_type)}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-700 text-xs whitespace-nowrap">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(purchase.amount)}
                      </td>
                      <td className="py-3 px-1 text-right">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase">
                          Pago
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          

        </section>

        {/* Column 3: Timeline (3 Cols) - Independently Scrollable */}
        <section className="lg:col-span-3 lg:h-full lg:overflow-y-auto scrollbar-none p-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-full my-0.5">
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
                <Clock className="h-4.5 w-4.5 text-indigo-650" />
                <span>Linha do Tempo</span>
              </h3>

              {/* Clean minimal vertical timeline with infinite scroll */}
              <div 
                onScroll={handleTimelineScroll}
                className="relative pl-0.5 max-h-[380px] lg:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-none pr-1 space-y-1"
              >
                {draft.timeline.slice(0, visibleTimelineCount).map((event: any, eventIdx: number) => (
                  <div key={event.id} className="relative pl-8 pb-6 group last:pb-2">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-[11px] top-4.5 bottom-0 w-[1px] bg-slate-200 group-last:hidden" />
                    
                    {/* Ring Dot */}
                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${getTimelineBadgeClass(event.type)} shadow-sm`}>
                      {getTimelineIcon(event.type)}
                    </div>

                    {/* Clean Content block */}
                    <div className="space-y-1 ml-1 animate-fadeIn">
                      {/* Stacked Title & Timestamp for clean non-wrapping layout */}
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleEventExpand(event.id)}
                          className="w-full flex items-start justify-between gap-2 text-left group/title cursor-pointer py-0.5"
                        >
                          <span className="text-xs font-black text-slate-850 leading-snug group-hover/title:text-indigo-650 transition-colors">
                            {event.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold shrink-0 pt-0.5 transition-transform">
                            {expandedEventIds[event.id] ? "▲" : "▼"}
                          </span>
                        </button>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {formatTimelineTimestamp(event.timestamp)}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed pt-0.5">{event.details}</p>

                      {event.note && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 text-[11px] font-extrabold">
                            <Coins className="h-3 w-3 text-amber-500 shrink-0" />
                            {event.note}
                          </span>
                        </div>
                      )}

                      {/* Collapsible Key-Value Details Panel */}
                      {expandedEventIds[event.id] && (
                        <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs shadow-xs animate-fadeIn space-y-2">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/70 pb-1.5 flex justify-between items-center">
                            <span>Informações do Evento</span>
                            <span className="text-emerald-600 font-bold">● Processado</span>
                          </div>
                          <div className="space-y-2 pt-0.5">
                            {formatPayloadKeyValues(event.payload).length > 0 ? (
                              formatPayloadKeyValues(event.payload).map((item, i) => (
                                <div key={i} className="flex flex-col text-xs leading-tight space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.key}:</span>
                                  <span className="font-semibold text-slate-800 break-all select-all">{item.value}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-slate-500 italic">Nenhum dado adicional recebido.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {visibleTimelineCount < draft.timeline.length ? (
                  <button 
                    type="button"
                    onClick={() => setVisibleTimelineCount(prev => Math.min(prev + 10, draft.timeline.length))}
                    className="w-full pt-2.5 pb-1 text-center text-[11px] font-bold text-indigo-650 hover:text-indigo-800 hover:underline cursor-pointer transition-colors"
                  >
                    Clique ou role para carregar mais ({Math.min(visibleTimelineCount, draft.timeline.length)} de {draft.timeline.length}) ↓
                  </button>
                ) : (
                  <div className="pt-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fim do histórico ({draft.timeline.length} eventos)
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Confirmation Modal for Lists Actions */}
      {showListConfirmModal && listConfirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] animate-fadeIn p-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-indigo-600">
              <AlertCircle className="h-6 w-6 text-indigo-650 shrink-0" />
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Confirmar Alteração
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja realmente {listConfirmAction.type === "add" ? "adicionar o contato à" : "remover o contato da"} lista{" "}
              <strong>"{listConfirmAction.listName}"</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowListConfirmModal(false);
                  setListConfirmAction(null);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeListAction}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  listConfirmAction.type === "add"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-red-650 hover:bg-red-750"
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
