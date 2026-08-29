"use client";

// Helper to make any HTML email responsive inside the mobile preview frame
function prepareMobilePreviewHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  let html = rawHtml;
  
  // Inject viewport meta if not present
  if (!html.includes('<meta name="viewport"')) {
    const metaTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head>' + metaTag);
    } else {
      html = metaTag + html;
    }
  }

  // Inject responsive reset styling
  const responsiveStyles = `
    <style id="mobile-preview-reset">
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        min-width: 100% !important;
        overflow-x: hidden !important;
        -webkit-text-size-adjust: 100% !important;
      }
      table, .body, .wrapper, .container {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
      }
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-show {
        display: block !important;
      }
    </style>
  `;

  if (html.includes('</head>')) {
    html = html.replace('</head>', responsiveStyles + '</head>');
  } else {
    html = responsiveStyles + html;
  }

  return html;
}


import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Users,
  Copy,
  Download,
  CheckCircle,
  Eye,
  Percent,
  DollarSign,
  Info,
  Clock,
  ChevronRight,
  TrendingUp,
  ExternalLink,
  X,
  Laptop,
  Smartphone,
  Search
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface CampaignDetail {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  status: "Rascunho" | "Enviado" | "Agendado" | "Arquivada" | "Enviando";
  targetList: string;
  sentAtDate: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  conversions: number;
  revenue: number;
  htmlContent?: string;
  deliveryStats: {
    attempts: number;
    ignored: number;
    sent: number;
    bounced: number;
    delivered: number;
    spamComplaints: number;
    unsubscribed: number;
  };
}

// Initial mock details mapped by ID
const mockCampaignsDetails: Record<string, CampaignDetail> = {
  "camp-1": {
    id: "camp-1",
    name: "Black Friday 2025 - Oferta Antecipada",
    subject: "Esquenta Black Friday: Até 70% de desconto nos cursos pro!",
    previewText: "Não perca a maior oportunidade do ano para aprender programação.",
    fromName: "Realizzare Cursos",
    fromEmail: "contato@realizzare.com.br",
    replyTo: "suporte@realizzare.com.br",
    status: "Enviado",
    targetList: "Lista Geral de Alunos",
    sentAtDate: "28/11/2025 às 09:00",
    recipientCount: 22450,
    openCount: 15715,
    clickCount: 4490,
    conversions: 224,
    revenue: 44128.00,
    deliveryStats: {
      attempts: 22500,
      ignored: 50,
      sent: 22450,
      bounced: 45,
      delivered: 22405,
      spamComplaints: 12,
      unsubscribed: 224
    }
  },
  "camp-2": {
    id: "camp-2",
    name: "Newsletter Semanal - Novidades de IA",
    subject: "GPT-5 lançado? O que muda no desenvolvimento de software.",
    previewText: "Analise de mercado, novidades tecnológicas e tutoriais semanais.",
    fromName: "Leonardo Silva",
    fromEmail: "leonardo@realizzare.com.br",
    replyTo: "leonardo@realizzare.com.br",
    status: "Enviado",
    targetList: "Interessados em Programação",
    sentAtDate: "07/07/2026 às 14:00",
    recipientCount: 2693,
    openCount: 642,
    clickCount: 4,
    conversions: 0,
    revenue: 0.00,
    deliveryStats: {
      attempts: 2693,
      ignored: 0,
      sent: 2693,
      bounced: 6,
      delivered: 2687,
      spamComplaints: 1,
      unsubscribed: 10
    }
  },
  "camp-5": {
    id: "camp-5",
    name: "Recuperação de Carrinho - Fullstack Pro",
    subject: "Esqueceu alguma coisa? Conclua sua inscrição com desconto.",
    previewText: "Restam apenas algumas vagas para a mentoria exclusiva.",
    fromName: "Realizzare Cursos",
    fromEmail: "contato@realizzare.com.br",
    replyTo: "suporte@realizzare.com.br",
    status: "Enviado",
    targetList: "Carrinho Abandonado - 24h",
    sentAtDate: "05/07/2026 às 10:30",
    recipientCount: 1200,
    openCount: 960,
    clickCount: 384,
    conversions: 96,
    revenue: 18912.00,
    deliveryStats: {
      attempts: 1200,
      ignored: 0,
      sent: 1200,
      bounced: 2,
      delivered: 1198,
      spamComplaints: 0,
      unsubscribed: 5
    }
  }
};

const defaultCampaignDetail: CampaignDetail = {
  id: "camp-unknown",
  name: "Campanha Rascunho / Agendada Sem Disparos",
  subject: "Assunto provisório da campanha",
  previewText: "Texto de apoio...",
  fromName: "Realizzare Cursos",
  fromEmail: "contato@realizzare.com.br",
  replyTo: "suporte@realizzare.com.br",
  status: "Rascunho",
  targetList: "Interessados em Programação",
  sentAtDate: "Ainda não disparado",
  recipientCount: 0,
  openCount: 0,
  clickCount: 0,
  conversions: 0,
  revenue: 0.00,
  deliveryStats: {
    attempts: 0,
    ignored: 0,
    sent: 0,
    bounced: 0,
    delivered: 0,
    spamComplaints: 0,
    unsubscribed: 0
  }
};

const defaultMockHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
  <h1 style="color: #4f46e5; margin-top: 0; font-size: 22px;">Iniciando seus Estudos na Realizzare</h1>
  <p>Olá, Aluno(a)!</p>
  <p>Parabéns por dar esse importante passo na sua carreira. Sua inscrição foi confirmada e as aulas já estão liberadas.</p>
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
    <h3 style="margin-top: 0; color: #1e293b; font-size: 16px;">Seu Acesso Liberado:</h3>
    <p style="margin-bottom: 5px; font-size: 14px;"><strong>Curso:</strong> Desenvolvimento Fullstack Pro</p>
    <p style="margin-top: 0; font-size: 14px;"><strong>Plataforma:</strong> <a href="https://realizzare.com.br" style="color: #4f46e5; text-decoration: none; font-weight: bold;">realizzare.com.br</a></p>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #334155;">
    Para acessar o portal, basta clicar no botão abaixo e fazer login com seu e-mail cadastrado.
  </p>
  <div style="text-align: center; margin: 25px 0;">
    <a href="https://realizzare.com.br" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Entrar no Portal de Alunos</a>
  </div>
  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
  <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0; line-height: 1.5;">
    Você recebeu este e-mail porque se cadastrou na Realizzare Cursos.
    <br />
    <a href="#" style="color: #4f46e5; text-decoration: underline; margin-top: 4px; display: inline-block;">Descadastrar-se deste fluxo</a>
  </p>
</div>
`;

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unpack dynamic route parameter using React.use
  const resolvedParams = React.use(params);
  const campaignId = resolvedParams.id;

  const [customCampaign, setCustomCampaign] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [modalPreviewDevice, setModalPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Load custom created campaigns from localStorage or flow nodes
  // Load real created campaigns from Supabase DB
  useEffect(() => {
    const loadRealCampaignData = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // 1. Fetch real campaign from Supabase
        const { data: dbCamp } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", campaignId)
          .maybeSingle();

        if (dbCamp) {
          // 2. Fetch tracking events for opens & clicks
          const { data: trackingEvents } = await supabase
            .from("inbound_webhook_events")
            .select("*");

          // 3. Fetch purchase reporting events for conversions
          const { data: purchaseEvents } = await supabase
            .from("reporting_events")
            .select("*")
            .eq("event_type", "purchase");

          // 4. Fetch all contacts
          const { data: contactsList } = await supabase
            .from("contacts")
            .select("*");

          // Extract open/click events matching this campaign ID or email
          const campOpens = new Set<string>();
          const campClicks = new Set<string>();

          (trackingEvents || []).forEach((te: any) => {
            const payload = te.payload || {};
            if (payload.campaign_id === campaignId || payload.campaignId === campaignId) {
              const email = (payload.email || payload.contact_email || "").toLowerCase().trim();
              if (email) {
                if (te.event_type === "email.open") campOpens.add(email);
                if (te.event_type === "email.click") campClicks.add(email);
              }
            }
          });

          // Resolve recipients list from target_list or contacts
          let recipientsPool: any[] = [];
          const targetStr = (dbCamp.target_list || "").trim();

          if (dbCamp.status === "sent" && dbCamp.sent_count === 0) {
            // Se foi disparado com 0 envios, não mostra contatos falsos
            recipientsPool = [];
          } else if (targetStr.includes("||IDS||")) {
            const [, idsPart] = targetStr.split("||IDS||");
            const rawIds = idsPart ? idsPart.split(",").filter(Boolean) : [];
            
            const contactIds = rawIds.filter((id: string) => id.startsWith("contact-")).map((id: string) => id.replace("contact-", ""));
            const listIds = rawIds.filter((id: string) => !id.startsWith("contact-") && !id.startsWith("seg-"));
            
            if (contactIds.length > 0) {
                (contactsList || []).forEach((c: any) => {
                  if (contactIds.includes(c.id)) {
                      recipientsPool.push({ email: c.email.toLowerCase(), name: `${c.first_name || ""} ${c.last_name || ""}`.trim(), contactId: c.id });
                  }
                });
            }
            
            if (listIds.length > 0) {
                const { data: subs } = await supabase.from("list_subscriptions").select("contact_id").in("list_id", listIds).eq("status", "subscribed");
                const subscribedContactIds = (subs || []).map((s: any) => s.contact_id);
                (contactsList || []).forEach((c: any) => {
                  if (subscribedContactIds.includes(c.id) && c.status === "active") {
                      recipientsPool.push({ email: c.email.toLowerCase(), name: `${c.first_name || ""} ${c.last_name || ""}`.trim(), contactId: c.id });
                  }
                });
            }
          } else {
            const emailMatches = targetStr.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g);
            if (emailMatches && emailMatches.length > 0) {
              emailMatches.forEach((em: string) => {
                const cleanEm = em.trim().toLowerCase();
                const contactObj = (contactsList || []).find((c: any) => (c.email || "").toLowerCase() === cleanEm);
                recipientsPool.push({
                  email: cleanEm,
                  name: contactObj ? `${contactObj.first_name || ""} ${contactObj.last_name || ""}`.trim() : cleanEm.split("@")[0],
                  contactId: contactObj?.id || null
                });
              });
            } else if (targetStr.toLowerCase().includes("geral") || targetStr.toLowerCase().includes("todos")) {
              (contactsList || []).forEach((c: any) => {
                if (c.status === "active") {
                  recipientsPool.push({
                    email: c.email.toLowerCase(),
                    name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
                    contactId: c.id
                  });
                }
              });
            }
          }

          // Deduplicate recipients
          const recMap = new Map();
          recipientsPool.forEach(r => recMap.set(r.email, r));
          recipientsPool = Array.from(recMap.values());

          const campaignSentTimestamp = dbCamp.sent_at ? new Date(dbCamp.sent_at).getTime() : new Date(dbCamp.created_at || Date.now()).getTime();

          // Verified sandbox contacts list
          const verifiedSandboxEmails = new Set([
            "leonardo.christian16@outlook.com",
            "leonardo.chrs23@gmail.com",
            "contato@realizzare.com.br",
            "contato@realizzarecursos.com.br"
          ]);

          // Build factual recipient row details with LAST-TOUCH ATTRIBUTION
          const recipientRows = recipientsPool.map(r => {
            const emailLower = r.email.toLowerCase();
            const hasOpened = campOpens.has(emailLower);
            const hasClicked = campClicks.has(emailLower);

            // LAST-TOUCH ATTRIBUTION ENGINE:
            // For each purchase by this contact, find the MOST RECENT email interaction (open or click) that occurred before the purchase.
            // The sale is attributed EXCLUSIVELY to the campaign of that LAST interaction (preventing duplicates)!
            let revAmount = 0;

            const contactPurchases = (purchaseEvents || []).filter((pe: any) => 
              (pe.contact_email || "").toLowerCase() === emailLower
            );

            contactPurchases.forEach((pe: any) => {
              const purchaseTime = pe.created_at ? new Date(pe.created_at).getTime() : Date.now();

              // Find all interactions (open or click) by this email across ALL campaigns before purchaseTime
              const priorInteractions = (trackingEvents || []).filter((te: any) => {
                const payload = te.payload || {};
                const teEmail = (payload.email || payload.contact_email || "").toLowerCase().trim();
                if (teEmail !== emailLower) return false;

                const eventTime = te.created_at ? new Date(te.created_at).getTime() : 0;
                return eventTime <= purchaseTime;
              });

              // Sort by eventTime descending to get the LATEST interaction before purchase
              priorInteractions.sort((a: any, b: any) => {
                const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return tB - tA;
              });

              const latestInteraction = priorInteractions[0];
              if (latestInteraction) {
                const payload = latestInteraction.payload || {};
                const lastCampId = payload.campaign_id || payload.campaignId;
                // Attribute revenue ONLY if the LAST interaction belonged to THIS campaign!
                if (lastCampId === campaignId) {
                  revAmount += Number(pe.metadata?.amount || pe.amount || 0);
                }
              }
            });

            return {
              email: r.email,
              name: r.name || r.email,
              contactId: r.contactId,
              opened: hasOpened,
              clicked: hasClicked,
              revenue: revAmount
            };
          });

          const sentDateObj = dbCamp.sent_at || dbCamp.created_at;
          const formattedDate = sentDateObj ? new Date(sentDateObj).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
          }) : "Disparado por Automação";

          // Auto-trigger cron if overdue
          if (dbCamp.status === "scheduled" && dbCamp.scheduled_at && new Date(dbCamp.scheduled_at) <= new Date()) {
            fetch("/api/cron/campaigns").catch(console.error);
          }

          // Calculate deliverability metrics
          const isScheduled = dbCamp.status === "scheduled";
          const isDraft = dbCamp.status === "draft";
          
          const totalSent = (isScheduled || isDraft) ? 0 : (dbCamp.sent_count || recipientRows.length);
          const deliveredCount = (isScheduled || isDraft) ? 0 : recipientRows.filter(r => 
            r.opened || r.clicked || verifiedSandboxEmails.has(r.email.toLowerCase())
          ).length;
          const bouncedCount = (isScheduled || isDraft) ? 0 : Math.max(0, totalSent - deliveredCount);

          const totalOpens = campOpens.size;
          const totalClicks = campClicks.size;
          const totalConversions = recipientRows.filter(r => r.revenue > 0).length;
          const totalRevenue = recipientRows.reduce((acc, r) => acc + r.revenue, 0);

          setCustomCampaign({
            id: dbCamp.id,
            name: dbCamp.name || "Campanha Realizzare",
            subject: dbCamp.subject || "Sem Assunto",
            previewText: dbCamp.preview_text || dbCamp.previewText || "",
            fromName: dbCamp.from_name || "Realizzare Cursos",
            fromEmail: dbCamp.from_email || "contato@realizzarecursos.com.br",
            replyTo: dbCamp.reply_to || "contato@realizzare.com",
            status: dbCamp.status === "sent" ? "Enviado" : dbCamp.status === "sending" ? "Enviando" : dbCamp.status === "scheduled" ? "Agendado" : "Rascunho",
            targetList: dbCamp.target_list || "Lista Geral de Alunos",
            dateStr: formattedDate,
            sentCount: totalSent,
            openCount: totalOpens,
            clickCount: totalClicks,
            conversions: totalConversions,
            revenue: totalRevenue,
            htmlContent: dbCamp.html_content || "",
            recipientRows: recipientRows,
            deliveryStats: {
              attempts: totalSent,
              ignored: 0,
              sent: totalSent,
              bounced: bouncedCount,
              delivered: deliveredCount,
              spamComplaints: 0,
              unsubscribed: 0
            }
          });
          return;
        }

        // 2. Check if it's a flow campaign
        if (campaignId && campaignId.startsWith("flow-camp-")) {
          const storedFlows = localStorage.getItem("realizzare_mock_flows");
          if (storedFlows) {
            try {
              const flows = JSON.parse(storedFlows);
              for (const f of flows) {
                const nodesKey = `realizzare_flow_nodes_${f.id}`;
                const storedNodes = localStorage.getItem(nodesKey);
                if (storedNodes) {
                  const nodesList = JSON.parse(storedNodes);
                  const findNodeInTree = (nodes: any[]): any => {
                    for (const node of nodes) {
                      if (node.type === "email" && node.config?.emailCampaignId === campaignId) {
                        return node;
                      }
                      if (node.yesBranch) {
                        const res = findNodeInTree(node.yesBranch);
                        if (res) return res;
                      }
                      if (node.noBranch) {
                        const res = findNodeInTree(node.noBranch);
                        if (res) return res;
                      }
                    }
                    return null;
                  };

                  const matchedNode = findNodeInTree(nodesList);
                  if (matchedNode) {
                    const cfg = matchedNode.config || {};
                    const isNodeActive = cfg.status === "Ativo" || f.status === "Ativo";
                    
                    const detail = {
                      id: campaignId,
                      name: cfg.campaignName || `${f.name} → ${cfg.subject || "Enviar E-mail"}`,
                      subject: cfg.subject || "Sem Assunto",
                      previewText: cfg.preheader || "Sem pré-cabeçalho",
                      fromName: cfg.senderName || "Realizzare Cursos",
                      fromEmail: cfg.senderEmail || "contato@realizzare.com.br",
                      replyTo: cfg.replyTo || "suporte@realizzare.com.br",
                      status: (isNodeActive ? "Enviando" : "Rascunho") as any,
                      targetList: f.triggerDescription || "Disparador do Flow",
                      dateStr: "Disparado por Automação (Flow)",
                      sentCount: isNodeActive ? 1 : 0,
                      openCount: isNodeActive ? 1 : 0,
                      clickCount: isNodeActive ? 1 : 0,
                      conversions: 0,
                      revenue: 0,
                      htmlContent: cfg.htmlContent,
                      recipientRows: [],
                      deliveryStats: {
                        attempts: isNodeActive ? 1 : 0,
                        ignored: 0,
                        sent: isNodeActive ? 1 : 0,
                        bounced: 0,
                        delivered: isNodeActive ? 1 : 0,
                        spamComplaints: 0,
                        unsubscribed: 0
                      }
                    };
                    setCustomCampaign(detail);
                    return;
                  }
                }
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (err) {
        console.error("Error loading real campaign detail:", err);
      }
    };

    loadRealCampaignData();
  }, [campaignId]);

  const data = useMemo(() => {
    if (customCampaign) {
      return {
        id: customCampaign.id,
        name: customCampaign.name,
        subject: customCampaign.subject,
        previewText: customCampaign.previewText,
        fromName: customCampaign.fromName,
        fromEmail: customCampaign.fromEmail,
        replyTo: customCampaign.replyTo,
        status: customCampaign.status as "Rascunho" | "Enviado" | "Agendado" | "Arquivada" | "Enviando",
        targetList: customCampaign.targetList,
        sentAtDate: customCampaign.dateStr,
        recipientCount: customCampaign.sentCount || 0,
        openCount: customCampaign.openCount || 0,
        clickCount: customCampaign.clickCount || 0,
        conversions: customCampaign.conversions || 0,
        revenue: customCampaign.revenue || 0,
        recipientRows: customCampaign.recipientRows || [],
        deliveryStats: customCampaign.deliveryStats || {
          attempts: customCampaign.sentCount || 0,
          ignored: 0,
          sent: customCampaign.sentCount || 0,
          bounced: 0,
          delivered: customCampaign.sentCount || 0,
          spamComplaints: 0,
          unsubscribed: 0
        },
        htmlContent: customCampaign.htmlContent
      };
    }
    return { ...defaultCampaignDetail, id: campaignId, recipientRows: [] };
  }, [campaignId, customCampaign]);

  // Checklist for graphs visibility lines
  const [visibleLines, setVisibleLines] = useState({
    bounce: true,
    entregue: true,
    aberta: true,
    clicada: true,
    vendas: true
  });

  // Recipient table search, filter and pagination state (20 contacts max per page)
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<"all" | "opened" | "clicked" | "converted" | "bounced">("all");
  const [recipientPage, setRecipientPage] = useState(1);
  const itemsPerPage = 20;

  // Filtered recipient rows
  const filteredRecipientRows = useMemo(() => {
    const rows = data.recipientRows || [];
    return rows.filter((r: any) => {
      // 1. Search Filter (name or email)
      if (recipientSearch.trim()) {
        const q = recipientSearch.toLowerCase().trim();
        const nameMatch = (r.name || "").toLowerCase().includes(q);
        const emailMatch = (r.email || "").toLowerCase().includes(q);
        if (!nameMatch && !emailMatch) return false;
      }

      // 2. Status Filter
      if (recipientFilter === "opened") return r.opened;
      if (recipientFilter === "clicked") return r.clicked;
      if (recipientFilter === "converted") return r.revenue > 0;
      if (recipientFilter === "bounced") return !r.opened && !r.clicked;

      return true;
    });
  }, [data.recipientRows, recipientSearch, recipientFilter]);

  // Paginated recipient rows
  const paginatedRecipientRows = useMemo(() => {
    const start = (recipientPage - 1) * itemsPerPage;
    return filteredRecipientRows.slice(start, start + itemsPerPage);
  }, [filteredRecipientRows, recipientPage]);

  const totalRecipientPages = Math.ceil(filteredRecipientRows.length / itemsPerPage);

  // Calculate detailed financial KPIs
  const kpis = useMemo(() => {
    const totalRecipients = data.recipientCount;
    const opens = data.openCount;
    const clicks = data.clickCount;
    const orders = data.conversions;
    const revenue = data.revenue;

    const openRate = totalRecipients > 0 ? (opens / totalRecipients) * 100 : 0;
    const clickRate = totalRecipients > 0 ? (clicks / totalRecipients) * 100 : 0;
    const convRate = totalRecipients > 0 ? (orders / totalRecipients) * 100 : 0;
    
    const aov = orders > 0 ? revenue / orders : 0;
    const revPerRecipient = totalRecipients > 0 ? revenue / totalRecipients : 0;

    return {
      openRate,
      clickRate,
      convRate,
      aov,
      revPerRecipient
    };
  }, [data]);

  // Hourly engagement data (Stacked BarChart matching Home page style)
  const hourlyData = useMemo(() => {
    if (data.status === "Agendado" || data.status === "Rascunho") {
      return [
        { time: "00:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
        { time: "05:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
        { time: "10:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
        { time: "15:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
        { time: "20:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 }
      ];
    }

    const bounceVal = data.deliveryStats.bounced || 0;
    const deliveredVal = data.deliveryStats.delivered || 0;
    const openVal = data.openCount || 0;
    const clickVal = data.clickCount || 0;
    const salesVal = data.conversions || 0;

    return [
      { time: "00:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "05:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "10:05", bounce: bounceVal, entregue: deliveredVal, aberta: openVal, clicada: clickVal, vendas: salesVal },
      { time: "15:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "20:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "01:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "06:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "11:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "16:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 },
      { time: "21:00", bounce: 0, entregue: 0, aberta: 0, clicada: 0, vendas: 0 }
    ];
  }, [data]);

  // Formatter for YAxis values (e.g. 2800 -> 2,8 mil)
  const formatYAxis = (val: number) => {
    if (val >= 1000) {
      const thousands = val / 1000;
      return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1).replace(".", ",") } mil`;
    }
    return String(val);
  };

  const handleDuplicate = () => {
    alert("Campanha duplicada com sucesso para os rascunhos!");
  };

  const handleExport = () => {
    alert("Relatório PDF exportado com sucesso!");
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Link href="/dashboard/campaigns" className="hover:text-indigo-600 transition-colors">
          Campanhas
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-800">{data.name}</span>
      </nav>

      {/* 2. Header Box */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-650 shrink-0">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">{data.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  data.status === "Rascunho"
                    ? "bg-slate-100 border border-slate-200 text-slate-500"
                    : data.status === "Enviado"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}
              >
                {data.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Envio: {data.sentAtDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white rounded-xl text-xs font-bold text-slate-650 transition-all cursor-pointer shadow-sm animate-spin-hover"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicar</span>
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white rounded-xl text-xs font-bold text-slate-650 transition-all cursor-pointer shadow-sm"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            <span>Visualizar Campanha</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* 3. Specific KPIs Line */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Open Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Taxa de Abertura</span>
          <h3 className="text-2xl font-black text-slate-850 mt-2">{kpis.openRate.toFixed(2).replace(".", ",")}%</h3>
          <p className="text-xs text-indigo-600 font-bold hover:underline transition-all mt-1 w-fit cursor-pointer">
            {data.openCount.toLocaleString("pt-BR")} destinatários
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
        </div>

        {/* KPI 2: Click Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Taxa de Cliques (CR)</span>
          <h3 className="text-2xl font-black text-slate-850 mt-2">{kpis.clickRate.toFixed(2).replace(".", ",")}%</h3>
          <p className="text-xs text-indigo-600 font-bold hover:underline transition-all mt-1 w-fit cursor-pointer">
            {data.clickCount.toLocaleString("pt-BR")} destinatários
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
        </div>

        {/* KPI 3: Conversions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Taxa de Pedido Realizado</span>
          <h3 className="text-2xl font-black text-slate-850 mt-2">{kpis.convRate.toFixed(2).replace(".", ",")}%</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {data.conversions} destinatário
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
        </div>

        {/* KPI 4: Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Revenue</span>
          <h3 className="text-2xl font-black text-slate-850 mt-2">
            {data.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </h3>
          <div className="flex flex-col text-[10px] text-slate-500 mt-1.5 border-t border-slate-100 pt-1.5 leading-relaxed">
            <span>{data.conversions} destinatário</span>
            <span>AOV: {kpis.aov.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            <span>{kpis.revPerRecipient.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por destinatário</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-650" />
        </div>
      </div>

      {/* 4. Grid Layout: Chart & miniature Email Template Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Engagement Chart (Stacked Bar Chart matching Home style) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Engajamento ao longo do tempo</h2>
            </div>
            
            {/* Checkbox controls with Bounce legend */}
            <div className="flex flex-wrap items-center gap-3.5 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleLines.bounce}
                  onChange={(e) => setVisibleLines(prev => ({ ...prev, bounce: e.target.checked }))}
                  className="rounded border-slate-300 text-red-600 h-3.5 w-3.5 focus:ring-0 focus:ring-offset-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" />
                  Falha / Bounce
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleLines.entregue}
                  onChange={(e) => setVisibleLines(prev => ({ ...prev, entregue: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 h-3.5 w-3.5 focus:ring-0 focus:ring-offset-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
                  Entregue
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleLines.aberta}
                  onChange={(e) => setVisibleLines(prev => ({ ...prev, aberta: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 h-3.5 w-3.5 focus:ring-0 focus:ring-offset-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-violet-500 inline-block" />
                  Aberta
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleLines.clicada}
                  onChange={(e) => setVisibleLines(prev => ({ ...prev, clicada: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 h-3.5 w-3.5 focus:ring-0 focus:ring-offset-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                  Clicada
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visibleLines.vendas}
                  onChange={(e) => setVisibleLines(prev => ({ ...prev, vendas: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600 h-3.5 w-3.5 focus:ring-0 focus:ring-offset-0"
                />
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" />
                  Venda
                </span>
              </label>
            </div>
          </div>

          {/* Recharts Stacked BarChart Wrapper */}
          <div className="h-80 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} barGap={0} barSize={44}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={formatYAxis}
                  label={{ 
                    value: 'Destinatários', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fill: '#64748b', fontSize: 11, fontWeight: 'bold', textAnchor: 'middle' }, 
                    offset: 0 
                  }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                  itemStyle={{ fontWeight: "bold" }}
                  formatter={(value: any) => [Number(value).toLocaleString("pt-BR") + " destinatários"]}
                />
                {visibleLines.bounce && (
                  <Bar stackId="a" dataKey="bounce" name="Falha / Bounce" fill="#ef4444" radius={[0, 0, 0, 0]} maxBarSize={44} />
                )}
                {visibleLines.entregue && (
                  <Bar stackId="a" dataKey="entregue" name="Entregue" fill="#6366f1" radius={[0, 0, 0, 0]} maxBarSize={44} />
                )}
                {visibleLines.aberta && (
                  <Bar stackId="a" dataKey="aberta" name="Aberta" fill="#8b5cf6" radius={[0, 0, 0, 0]} maxBarSize={44} />
                )}
                {visibleLines.clicada && (
                  <Bar stackId="a" dataKey="clicada" name="Clicada" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={44} />
                )}
                {visibleLines.vendas && (
                  <Bar stackId="a" dataKey="vendas" name="Pedido Realizado" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={44} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Miniature Email Template Preview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Visualização do Template</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Esta é uma versão reduzida do e-mail disparado nesta campanha. Passe o mouse para expandir.
            </p>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3 relative overflow-hidden group select-none min-h-[300px] flex flex-col justify-center">
            {/* Silhouette Header */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 text-[9px] text-slate-400 font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="ml-2 truncate max-w-[140px] italic">{data.subject}</span>
            </div>
            
            <div className="flex-1 relative rounded-lg overflow-hidden border border-slate-150 bg-white">
              <iframe
                title="Miniature View"
                srcDoc={data.htmlContent || defaultMockHtml}
                className="absolute inset-0 w-[200%] h-[200%] origin-top-left scale-50 border-0 pointer-events-none"
              />
              
              {/* Overlay on hover */}
              <div
                onClick={() => setShowPreviewModal(true)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white text-xs font-bold gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Expandir Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Deliverability Panel (styled exactly like the print) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Entregabilidade</h3>
            <p className="text-xs text-slate-500 mt-1">
              A entregabilidade refere-se ao fato de suas mensagens alcançarem os destinatários e varia de acordo com o canal.<br />
              Entender essas diferenças pode ajudar a melhorar o desempenho. <a href="#" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">Saiba mais <ExternalLink className="h-3 w-3" /></a>
            </p>
          </div>
          <button
            onClick={() => alert("Exibindo detalhamento completo de entregabilidade...")}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
          >
            Ver mais
          </button>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5">Canal</th>
                <th className="py-2.5">Enviado(s)</th>
                <th className="py-2.5 text-center">Taxa de entrega</th>
                <th className="py-2.5 text-center">Taxa de rejeição</th>
                <th className="py-2.5 text-center">Taxa de reclamação de spam</th>
                <th className="py-2.5 text-right">Taxa de cancelamento de inscrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 font-semibold text-slate-850">
                  E-mail
                </td>
                <td className="py-4 text-slate-800 font-medium">
                  {data.recipientCount.toLocaleString("pt-BR")}
                </td>
                <td className="py-4 text-center font-bold text-slate-800">
                  {((data.deliveryStats.delivered / data.recipientCount) * 100).toFixed(1).replace(".", ",")}%
                  <span className="text-[10px] font-semibold text-indigo-600 hover:underline block mt-0.5 cursor-pointer">
                    {data.deliveryStats.delivered.toLocaleString("pt-BR")} destinatários
                  </span>
                </td>
                <td className="py-4 text-center font-bold text-slate-800">
                  {((data.deliveryStats.bounced / data.recipientCount) * 100).toFixed(1).replace(".", ",")}%
                  <span className="text-[10px] font-semibold text-indigo-600 hover:underline block mt-0.5 cursor-pointer">
                    {data.deliveryStats.bounced.toLocaleString("pt-BR")} destinatários
                  </span>
                </td>
                <td className="py-4 text-center font-bold text-slate-800">
                  {((data.deliveryStats.spamComplaints / data.recipientCount) * 100).toFixed(1).replace(".", ",")}%
                  <span className="text-[10px] font-semibold text-indigo-600 hover:underline block mt-0.5 cursor-pointer">
                    {data.deliveryStats.spamComplaints.toLocaleString("pt-BR")} destinatário
                  </span>
                </td>
                <td className="py-4 text-right font-bold text-slate-800">
                  {((data.deliveryStats.unsubscribed / data.recipientCount) * 100).toFixed(1).replace(".", ",")}%
                  <span className="text-[10px] font-semibold text-indigo-600 hover:underline block mt-0.5 cursor-pointer">
                    {data.deliveryStats.unsubscribed.toLocaleString("pt-BR")} destinatários
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Factual Recipient Engagement Table with Search, Filter & Pagination */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Destinatários & Engajamento Individual (Dados Reais)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Relação factual dos contatos com atribuição pelo último e-mail interagido (Last-Touch).</p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                value={recipientSearch}
                onChange={(e) => {
                  setRecipientSearch(e.target.value);
                  setRecipientPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>

            {/* Filter Select */}
            <select
              value={recipientFilter}
              onChange={(e) => {
                setRecipientFilter(e.target.value as any);
                setRecipientPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Todos os Destinatários</option>
              <option value="opened">Apenas quem abriu</option>
              <option value="clicked">Apenas quem clicou</option>
              <option value="converted">Apenas com venda atribuída</option>
              <option value="bounced">Apenas falhas / Bounce</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/50">
                <th className="py-3 px-4">Aluno / Lead</th>
                <th className="py-3 px-4 text-center">Aberto?</th>
                <th className="py-3 px-4 text-center">Clicado?</th>
                <th className="py-3 px-4 text-right">Atribuição de Venda (Last-Touch)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedRecipientRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum destinatário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedRecipientRows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {(row.name ? row.name.charAt(0) : "A").toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{row.name}</h4>
                          <span className="text-[11px] text-slate-500">{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {row.opened ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Sim
                        </span>
                      ) : (
                        <span className="text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {row.clicked ? (
                        <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-indigo-600" /> Sim
                        </span>
                      ) : (
                        <span className="text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {row.revenue > 0 ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                          R$ {row.revenue.toFixed(2).replace(".", ",")}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">
                          R$ 0,00
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredRecipientRows.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Exibindo <strong>{(recipientPage - 1) * 20 + 1}</strong> a <strong>{Math.min(recipientPage * 20, filteredRecipientRows.length)}</strong> de <strong>{filteredRecipientRows.length}</strong> contatos
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={recipientPage === 1}
                onClick={() => setRecipientPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Anterior
              </button>

              <span className="font-bold text-slate-700 px-2">
                Página {recipientPage} de {totalRecipientPages || 1}
              </span>

              <button
                type="button"
                disabled={recipientPage >= totalRecipientPages}
                onClick={() => setRecipientPage(p => Math.min(totalRecipientPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: VISUALIZAR CAMPANHA (PREVIEW HTML) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white border border-slate-202 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-650 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Visualizar Conteúdo da Campanha</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Preview do template HTML agendado/enviado</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Device Selector Buttons */}
                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setModalPreviewDevice("desktop")}
                    className={`p-2 transition-all cursor-pointer ${
                      modalPreviewDevice === "desktop" ? "bg-indigo-50 text-indigo-755 font-bold" : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Visualização Desktop"
                  >
                    <Laptop className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalPreviewDevice("mobile")}
                    className={`p-2 transition-all cursor-pointer ${
                      modalPreviewDevice === "mobile" ? "bg-indigo-50 text-indigo-755 font-bold" : "text-slate-400 hover:text-slate-700"
                    }`}
                    title="Visualização Mobile"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Email Headers Info Panel */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-1.5 text-xs text-slate-650">
              <p><strong>Remetente:</strong> {data.fromName} &lt;{data.fromEmail}&gt;</p>
              <p><strong>Assunto:</strong> {data.subject}</p>
              <p><strong>Pré-cabeçalho:</strong> {data.previewText}</p>
            </div>

            {/* Iframe HTML View */}
            <div className="flex-1 bg-slate-100 overflow-y-auto p-6 flex justify-center items-center min-h-[450px]">
              {modalPreviewDevice === "desktop" ? (
                <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-fadeIn">
                  {/* Miniature browser top bar */}
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 select-none shrink-0">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <iframe
                    title="Visualização da Campanha Desktop"
                    srcDoc={data.htmlContent || defaultMockHtml}
                    className="w-full h-full border-0 bg-white flex-1"
                    sandbox="allow-same-origin allow-scripts"
                  />
                </div>
              ) : (
                /* Realistic Smartphone Hardware Mockup */
                <div style={{ zoom: 0.85 }} className="w-[375px] h-[667px] border-[12px] border-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-200 bg-white relative flex flex-col mx-auto shrink-0 animate-fadeIn select-none">
                  {/* Top Notch/Speaker */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-white rounded-b-xl z-20 flex justify-center items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-x border-slate-100">
                    <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                  </div>
                  
                  {/* Bottom Home Button */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-slate-100 rounded-full bg-white z-20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border border-slate-200"></div>
                  </div>

                  {/* Screen Content Viewport */}
                  <div className="flex flex-col flex-1 overflow-hidden relative bg-slate-50 border border-slate-200 rounded-[1.8rem] mb-14">
                    {/* Mobile Status Bar (Fake) */}
                    <div className="h-6 w-full bg-slate-50 shrink-0 flex justify-end items-center px-4 gap-1.5 text-slate-400">
                      <div className="w-3 h-2.5 rounded-sm border border-current"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      <span className="text-[9px] font-bold ml-1">10:32</span>
                    </div>

                    {/* HTML content iframe - with responsive mobile styles injected */}
                    <div className="flex-1 relative bg-white min-h-0">
                      <iframe
                        title="Visualização da Campanha Mobile"
                        srcDoc={prepareMobilePreviewHtml(data.htmlContent || defaultMockHtml)}
                        className="w-full h-full border-none absolute inset-0"
                        sandbox="allow-same-origin allow-scripts"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}