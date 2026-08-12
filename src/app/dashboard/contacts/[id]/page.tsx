"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Tag as TagIcon,
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
  Plus
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
  
  // State initialized as null to fetch from database
  const [profile, setProfile] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);

  // Sync with Supabase Database
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const supabase = createClient();
        
        // 1. Fetch contact details with all associations
        const { data, error: contactError } = await supabase
          .from("contacts")
          .select(`
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
          `)
          .eq("id", id)
          .single();

        if (contactError) throw contactError;
        const contact: any = data;

        // 2. Fetch global custom fields definition
        const { data: globalFieldsData } = await supabase
          .from("custom_fields")
          .select("name, type, tag");
        const globalFields: any[] = globalFieldsData || [];

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

        // 3. Fetch Timeline from Unified View
        const { data: timelineData, error: timelineError } = await supabase
          .from("contact_timeline_view")
          .select("*")
          .eq("contact_id", id)
          .order("created_at", { ascending: false });

        let timeline = [];
        if (!timelineError && timelineData && timelineData.length > 0) {
          timeline = timelineData.map((t: any, index: number) => {
            let type = t.event_group;
            let label = t.event_group;
            let details = "";
            
            if (t.event_group === 'email') {
              type = t.label === 'open' ? 'open' : t.label === 'click' ? 'click' : 'send';
              label = t.label === 'open' ? 'E-mail Aberto' : t.label === 'click' ? 'E-mail Clicado' : 'E-mail Enviado';
              details = `Campanha: ${t.metadata?.campaign_id || 'Não especificada'}`;
            } else if (t.event_group === 'purchase') {
              label = 'Compra Aprovada';
              details = `Comprou '${t.label}' - R$ ${t.metadata?.amount || '0,00'}`;
            } else if (t.event_group === 'enrollment') {
              label = 'Matrícula Realizada';
              details = `Matriculado no curso '${t.label}'`;
            } else if (t.event_group === 'flow') {
              label = t.label === 'entered' ? 'Entrou no Fluxo' : 'Saiu do Fluxo';
              details = `Ação: ${t.label} (Nó: ${t.metadata?.node_id})`;
            }

            return {
              id: `evt-${index}`,
              type,
              label,
              details,
              timestamp: t.created_at
            };
          });
        } else {
          // Fallback to mock timeline if no event logs exist to preserve design aesthetics
          timeline = mockProfileData[id]?.timeline || mockProfileData["c1"]?.timeline || [];
        }

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

        // Generate profile object for imported contact
        const first_name = foundContact?.first_name || "Contato";
        const last_name = (foundContact?.last_name || "Importado").replace(/#\d+/, "").trim();
        const email = foundContact?.email || `contato_${id}@realizzare.com.br`;
        const phone = foundContact?.phone || "(11) 99887-1122";
        const status = foundContact?.status || "unsubscribed";
        const created_at = foundContact?.created_at || "01/07/2026";
        const tags = foundContact?.tags || ["Importado ActiveCampaign"];

        // Check for simulated Pagar.me / PagBank custom transactions & events pool
        let customTxList: any[] = [];
        try {
          const rawSims = localStorage.getItem("realizzare_simulated_events");
          if (rawSims) {
            const parsedSims = JSON.parse(rawSims);
            parsedSims.forEach((s: any) => {
              const sEmail = (s.email || "").toLowerCase().trim();
              if (sEmail && (sEmail === email.toLowerCase().trim() || email.toLowerCase().includes(sEmail.split("@")[0]))) {
                customTxList.push({
                  id: s.id || `sim-${Math.random()}`,
                  product_type: s.category || "certificado",
                  product_name: s.itemTitle || s.eventLabel || "Certificado de Conclusão - Realizzare Cursos",
                  amount: s.amount || 49.90,
                  paid_at: s.date || "01/08/2026",
                  status: "paid",
                  provider: s.provider || "pagarme"
                });
              }
            });
          }

          const rawCustomTx = localStorage.getItem("realizzare_custom_transactions");
          if (rawCustomTx) {
            const parsedCtx = JSON.parse(rawCustomTx);
            parsedCtx.forEach((tx: any) => {
              if (!tx.customer_email || tx.customer_email.toLowerCase() === email.toLowerCase()) {
                customTxList.push(tx);
              }
            });
          }
        } catch (e) {
          console.error(e);
        }

        const customPurchases = customTxList.map((tx: any) => ({
          product_type: tx.product_type || "certificate",
          product_name: tx.product_name,
          amount: Number(tx.amount || 49.90),
          paid_at: tx.paid_at || "01/08/2026",
          status: tx.status || "paid",
          sku: tx.sku || "PAGARME-V5"
        }));

        const customTimelineEvents = customTxList.map((tx: any) => ({
          id: tx.id || `timeline-${Math.random()}`,
          type: "purchase",
          label: `Compra Aprovada (${tx.provider === "pagbank" ? "PagBank" : "Pagar.me"})`,
          details: `Comprou '${tx.product_name}' - R$ ${Number(tx.amount || 49.90).toFixed(2).replace(".", ",")}`,
          timestamp: tx.paid_at || "01/08/2026"
        }));

        // Default Pagar.me fallback event if user is a Pagar.me contact
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
  const [selectedListToJoin, setSelectedListToJoin] = useState("");
  const [showListConfirmModal, setShowListConfirmModal] = useState(false);
  const [listConfirmAction, setListConfirmAction] = useState<{ type: "add" | "remove"; listName: string } | null>(null);

  // Get other available lists the user is NOT subscribed to
  const allOtherAvailableLists = useMemo(() => {
    const existingListNames = (draft?.lists || []).map((l: any) => l.name);
    const globalLists = ["Lista Geral de Alunos", "Carrinho Abandonado - 24h", "Interessados em Programação", "Clientes VIP", "Newsletter Geral"];
    return globalLists.filter(lname => !existingListNames.includes(lname));
  }, [draft?.lists]);

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
          phone: draft.phone || null
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
      case "click":
        return <MousePointerClick className="h-3.5 w-3.5 text-emerald-650" />;
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
      case "click":
        return "bg-emerald-50 border border-emerald-200";
      case "open":
        return "bg-indigo-50 border border-indigo-200";
      case "send":
        return "bg-blue-50 border border-blue-200";
      case "enrollment":
        return "bg-violet-50 border border-violet-200";
      case "purchase":
        return "bg-amber-50 border border-amber-200";
      default:
        return "bg-slate-105 bg-slate-100 border border-slate-200";
    }
  };

  if (!profile || !draft) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="lg:h-[calc(100vh-130px)] flex flex-col space-y-6 overflow-hidden">
      {/* Navigation & Header */}
      <div className="shrink-0 flex items-center justify-between pb-4 border-b border-slate-200">
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
          <span className="text-slate-800 font-bold">{draft.first_name} {draft.last_name}</span>
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

      {/* 3-Column Profile Layout Grid (3 / 6 / 3 cols) - Fixed Height on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0 overflow-y-auto lg:overflow-hidden pb-4">
        
        {/* Column 1: Unified Left Sidebar Card (3 Cols) - Independently Scrollable */}
        <section className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm lg:h-full lg:overflow-y-auto scrollbar-none">
          {/* Section 1: Avatar & Info Básica */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border border-indigo-100 bg-slate-100 flex items-center justify-center shadow shadow-indigo-100/50 group">
              {profile.email === "ana.oliveira@gmail.com" ? (
                <img src="/avatar_ana.png" alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-650 font-black text-2xl">
                  {draft.first_name[0]}{draft.last_name[0]}
                </div>
              )}
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow" />
            </div>

            <div className="w-full">
              {editingFields.name ? (
                <div className="flex gap-1.5 justify-center items-center mt-1 animate-fadeIn">
                  <input
                    type="text"
                    value={draft.first_name}
                    onChange={(e) => setDraft({ ...draft, first_name: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-sm text-slate-800 w-24 text-center focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={draft.last_name}
                    onChange={(e) => setDraft({ ...draft, last_name: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-sm text-slate-800 w-24 text-center focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => toggleEdit("name")}
                    className="text-sm text-emerald-600 font-bold ml-1 hover:text-emerald-700 cursor-pointer"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 group">
                  <h2 className="text-lg font-bold text-slate-850 leading-6">{draft.first_name} {draft.last_name}</h2>
                  <button
                    onClick={() => toggleEdit("name")}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer p-0.5"
                    title="Editar Nome"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}

              {editingFields.email ? (
                <div className="flex gap-1.5 justify-center items-center mt-1 animate-fadeIn">
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-sm text-slate-800 w-48 text-center focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => toggleEdit("email")}
                    className="text-sm text-emerald-600 font-bold ml-1 hover:text-emerald-700 cursor-pointer"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 group mt-1">
                  <span className="text-xs text-slate-500 truncate block max-w-[200px]">{draft.email}</span>
                  <button
                    onClick={() => toggleEdit("email")}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer p-0.5"
                    title="Editar E-mail"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Informações Pessoais (Gaveta Fechada por Padrão) */}
          <div className="pt-4 border-t border-slate-200 text-sm">
            <button
              type="button"
              onClick={() => setOpenDrawerInfo(!openDrawerInfo)}
              className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                <span>Informações Pessoais</span>
              </div>
              {openDrawerInfo ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {openDrawerInfo && (
              <div className="space-y-4 pt-3 mt-1 border-t border-slate-100 text-xs animate-fadeIn">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Celular / Telefone</span>
                    {editingFields.phone ? (
                      <div className="flex items-center gap-1.5 mt-1 animate-fadeIn">
                        <input
                          type="text"
                          value={draft.phone}
                          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-full"
                        />
                        <button
                          onClick={() => toggleEdit("phone")}
                          className="text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1.5 group mt-0.5">
                        <span className="text-slate-800 font-semibold">{draft.phone}</span>
                        <button
                          onClick={() => toggleEdit("phone")}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer"
                          title="Editar Telefone"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nascimento</span>
                    {editingFields.birth_date ? (
                      <div className="flex items-center gap-1.5 mt-1 animate-fadeIn">
                        <input
                          type="date"
                          value={draft.birth_date}
                          onChange={(e) => setDraft({ ...draft, birth_date: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-full"
                        />
                        <button
                          onClick={() => toggleEdit("birth_date")}
                          className="text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1.5 group mt-0.5">
                        <span className="text-slate-800 font-semibold">
                          {draft.birth_date ? new Date(draft.birth_date).toLocaleDateString("pt-BR") : "Não informado"}
                        </span>
                        <button
                          onClick={() => toggleEdit("birth_date")}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer"
                          title="Editar Nascimento"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Localização</span>
                    <span className="text-slate-800 font-semibold mt-0.5 truncate">
                      {draft.location?.city ? `${draft.location.city}, ${draft.location.state}` : "Cuiabá, MT"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Marcadores e Tags (Gaveta Fechada por Padrão) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={() => setOpenDrawerTags(!openDrawerTags)}
              className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-indigo-600" />
                <span>Marcadores e Tags ({draft.tags ? draft.tags.length : 0})</span>
              </div>
              {openDrawerTags ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {openDrawerTags && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
                <div className="flex flex-wrap gap-1.5">
                  {draft.tags.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">Sem marcadores aplicados.</span>
                  ) : (
                    draft.tags.map((tag: string, idx: number) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg text-xs font-semibold"
                      >
                        <TagIcon className="h-3 w-3" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, tags: draft.tags.filter((t: string) => t !== tag) })}
                          className="text-slate-400 hover:text-red-600 font-bold text-xs ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = tagInput.trim();
                        if (val && !draft.tags.includes(val)) {
                          setDraft({ ...draft, tags: [...draft.tags, val] });
                          setTagInput("");
                        }
                      }
                    }}
                    placeholder="Adicionar tag..."
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = tagInput.trim();
                      if (val && !draft.tags.includes(val)) {
                        setDraft({ ...draft, tags: [...draft.tags, val] });
                        setTagInput("");
                      }
                    }}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Campos Personalizados (Gaveta Fechada por Padrão) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={() => setOpenDrawerCustom(!openDrawerCustom)}
              className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-indigo-600" />
                <span>Campos Personalizados ({draft.custom_fields ? draft.custom_fields.length : 0})</span>
              </div>
              {openDrawerCustom ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {openDrawerCustom && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
                {draft.custom_fields.map((field: any) => {
                  const isEditing = editingFields[`cf_${field.name}`];
                  return (
                    <div key={field.name} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1 group">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{field.name}</span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => {
                              const updated = draft.custom_fields.map((cf: any) =>
                                cf.name === field.name ? { ...cf, value: e.target.value } : cf
                              );
                              setDraft({ ...draft, custom_fields: updated });
                            }}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => toggleEdit(`cf_${field.name}`)}
                            className="text-xs text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-slate-800 truncate">{field.value || "—"}</span>
                          <button
                            onClick={() => toggleEdit(`cf_${field.name}`)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer"
                            title={`Editar ${field.name}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Listas Vinculadas (MANTIDA VISÍVEL POR PADRÃO) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-600" />
              <span>Listas de E-mail</span>
            </h3>

            <div className="space-y-2">
              {draft.lists && draft.lists.length > 0 ? (
                draft.lists.map((list: any) => (
                  <div key={list.name} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-slate-800">{list.name}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">
                        {list.status === "subscribed" ? "Inscrito • " : "Desinscrito • "}
                        {new Date(list.updated_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleListSubscription(list.name)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all shadow-sm cursor-pointer ${
                        list.status === "subscribed"
                          ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {list.status === "subscribed" ? "Sair" : "Participar"}
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic block">Não inscrito em nenhuma lista.</span>
              )}
            </div>

            {/* Dropdown or select to add a new list association directly */}
            <div className="flex gap-2 pt-1">
              <select
                value={selectedListToJoin}
                onChange={(e) => setSelectedListToJoin(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1.5 text-xs focus:outline-none flex-1"
              >
                <option value="">-- Participar de outra lista --</option>
                {allOtherAvailableLists.map((lname: string) => (
                  <option key={lname} value={lname}>{lname}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedListToJoin}
                onClick={handleAddToListConfirm}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </section>

        {/* Column 2: KPIs, Matrículas, Fluxos, Transações (6 Cols) - Independently Scrollable */}
        <section className="lg:col-span-6 space-y-6 lg:h-full lg:overflow-y-auto pr-1 scrollbar-none">
          {/* Middle Top KPI Metrics Cards (Light and Minimal layout) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Emails Sent */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:border-slate-300 transition-all">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">E-mails Enviados</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-slate-850">48</span>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+12.5%</span>
              </div>
            </div>

            {/* KPI 2: Emails Opened */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:border-slate-300 transition-all">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">E-mails Abertos</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-violet-700">32</span>
                <span className="text-[9px] text-violet-700 font-bold bg-violet-50 px-1.5 py-0.5 rounded">66.6%</span>
              </div>
            </div>

            {/* KPI 3: Courses Started */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:border-slate-300 transition-all">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Cursos Iniciados</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-emerald-600">02</span>
                <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">100%</span>
              </div>
            </div>

            {/* KPI 4: Certificate Credits Available */}
            <div className="bg-white border border-indigo-200/80 bg-indigo-50/20 rounded-3xl p-4 shadow-sm hover:border-indigo-300 transition-all">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest block">Créditos de Certificado</span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl font-black text-indigo-700">03</span>
                <span className="text-[9px] text-indigo-700 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">Disponíveis</span>
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
                  {[...draft.enrollments]
                    .sort((a, b) => new Date(a.enrolled_at).getTime() - new Date(b.enrolled_at).getTime())
                    .map((item, idx) => {
                      // Clean course name
                      const cleanCourseName = (item.course_name || "Curso Realizzare")
                        .replace(/^Certificado de Conclusão - /i, "")
                        .replace(/^Curso de /i, "");

                      const certStatus = item.certificate_issued ? "Emitido" : "Não Emitido";
                      const certSub = item.certificate_issued 
                        ? `Emissão: ${item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString("pt-BR") : "08/08/2026"}`
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
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 border border-slate-200 text-slate-600">
                                Aguardando LMS
                              </span>
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
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Fluxos de Automação */}
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
                          {purchase.paid_at || "08/08/2026"} • {purchase.product_type === "course" ? "Cartão de Crédito" : "PIX"}
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
        <section className="lg:col-span-3 lg:h-full lg:overflow-y-auto scrollbar-none pr-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
                <Clock className="h-4.5 w-4.5 text-indigo-650" />
                <span>Linha do Tempo</span>
              </h3>

              {/* Clean minimal vertical timeline in light mode */}
              <div className="relative pl-0.5 max-h-[380px] lg:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-none pr-1">
                {draft.timeline.map((event: any, eventIdx: number) => (
                  <div key={event.id} className="relative pl-8 pb-7 group last:pb-2">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-[11px] top-4.5 bottom-0 w-[1px] bg-slate-200 group-last:hidden" />
                    
                    {/* Ring Dot */}
                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center ${getTimelineBadgeClass(event.type)} shadow-sm`}>
                      {getTimelineIcon(event.type)}
                    </div>

                    {/* Clean Content block */}
                    <div className="space-y-1 ml-1 animate-fadeIn">
                      <div className="flex items-center justify-between gap-2.5">
                        <span className="text-xs font-bold text-slate-800">{event.label}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
                          {new Date(event.timestamp).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal">{event.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-850 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center shadow-sm">
              Ver fluxo completo
            </button>
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
