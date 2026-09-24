import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // 1. Fetch Teste Aprovado events
    // We used progress_updated with original_event = test_approved in metadata
    const { data: testEvents, error: err1 } = await supabase
      .from("course_events")
      .select("id, created_at, metadata, contacts(first_name, last_name, email, phone)")
      .eq("event_type", "progress_updated")
      .order("created_at", { ascending: false })
      .limit(50);

    // Also fetch legacy test_approved if any exist
    const { data: testEventsLegacy } = await supabase
      .from("course_events")
      .select("id, created_at, metadata, contacts(first_name, last_name, email, phone)")
      .eq("event_type", "test_approved" as any)
      .order("created_at", { ascending: false })
      .limit(50);

    const allTestEvents = [...(testEvents || []), ...(testEventsLegacy || [])].filter(
      (e) => e.metadata?.original_event === "test_approved" || e.metadata?.score !== undefined
    );

    // 2. Fetch Pedidos Pendentes
    // We fetch from reporting_events because purchases table enum only supports paid/refunded/failed
    const { data: pendingEvents } = await supabase
      .from("reporting_events")
      .select("id, created_at, metadata, contact_email")
      .eq("event_type", "purchase")
      .order("created_at", { ascending: false })
      .limit(300);

    // Group by pagarme_id to find orders that are ONLY pending (no 'paid' event)
        const orderMap = new Map();
    [...(pendingEvents || [])].forEach(evt => {
       const amt = evt.metadata?.amount || "0";
       const timeStr = new Date(evt.created_at).toISOString().slice(0, 16); // up to minute
       const key = `${amt}-${timeStr}`;
       
       const isPaidEvent = evt.metadata?.event?.includes("paid") || evt.metadata?.status === "paid";
       const isArchived = evt.metadata?.crm_archived === true;
       
       if (!orderMap.has(key)) {
         orderMap.set(key, { ...evt, isPaid: isPaidEvent, _isArchived: isArchived });
       } else {
         const existing = orderMap.get(key);
         if (isPaidEvent) existing.isPaid = true;
         if (isArchived) existing._isArchived = true;
         
         // Keep the best metadata (e.g. non-fallback title)
         const title = evt.metadata?.item_title || evt.metadata?.course_name || "";
         const existingTitle = existing.metadata?.item_title || existing.metadata?.course_name || "";
         if (title && !title.includes("Certificado / Curso") && existingTitle.includes("Certificado / Curso")) {
           existing.metadata = { ...existing.metadata, item_title: title };
         }
         
         // Merge CRM states
         if (evt.metadata?.crm_column) existing.metadata.crm_column = evt.metadata.crm_column;
         if (evt.metadata?.crm_assigned) existing.metadata.crm_assigned = evt.metadata.crm_assigned;
       }
    });

    const activePending = Array.from(orderMap.values()).filter(o => !o.isPaid && !o._isArchived).slice(0, 50);

    // Fetch contact details for these emails
    const emails = [...new Set(activePending.map(o => o.contact_email).filter(Boolean))];
    const { data: contactsData } = await supabase
      .from("contacts")
      .select("first_name, last_name, email, phone")
      .in("email", emails);
      
    const contactMap = new Map((contactsData || []).map((c: any) => [c.email, c]));

    const items: any[] = [];

    const formatName = (str: string) => {
      if (!str) return "";
      return str.split(" ").map(w => {
        if (w.length < 3 && w.toLowerCase() !== "da" && w.toLowerCase() !== "de" && w.toLowerCase() !== "do") return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }).join(" ");
    };

    // Process Teste Aprovado
    for (const evt of allTestEvents) {
      const contactData: any = evt.contacts;
      const contact = (Array.isArray(contactData) ? contactData[0] : contactData) || {};
      const rawName = contact.first_name ? `${contact.first_name} ${contact.last_name || ""}`.trim() : "Aluno Realizzare";
      const cName = formatName(rawName);
      items.push({
        id: `test-${evt.id}`,
        title: `Teste Aprovado: ${evt.metadata?.course_name || "Curso"}`,
        value: 0,
        clientInitials: cName.substring(0, 2).toUpperCase(),
        clientName: cName,
        clientColor: "bg-[#0f7650]",
        columnId: evt.metadata?.crm_column || "novo",
        phone: contact.phone || "",
        email: contact.email || "",
        assignedTo: evt.metadata?.crm_assigned || "Sem responsável",
        boardId: "teste_aprovado",
        archived: evt.metadata?.crm_archived || false,
        createdAt: evt.created_at,
        description: `Nota do teste: ${evt.metadata?.score || 100}`
      });
    }

    // Process Pedidos Pendentes
    for (const p of activePending) {
      const contact = contactMap.get(p.contact_email) || { email: p.contact_email };
      const customerName = p.metadata?.customer_name || "Aluno Realizzare";
      const rawName = contact.first_name ? `${contact.first_name} ${contact.last_name || ""}`.trim() : customerName;
      const cName = formatName(rawName);
      
      const amt = Number(p.metadata?.amount || 0);
      
      items.push({
        id: `pend-${p.id}`,
        title: `Aguardando Pagamento: ${p.metadata?.item_title || "Produto"}`,
        value: amt,
        clientInitials: cName.substring(0, 2).toUpperCase(),
        clientName: cName,
        clientColor: "bg-orange-500",
        columnId: p.metadata?.crm_column || "novo",
        phone: contact.phone || p.metadata?.phone || "",
        email: contact.email || p.contact_email || "",
        assignedTo: p.metadata?.crm_assigned || "Sem responsável",
        boardId: "pedidos_pendentes",
        archived: p.metadata?.crm_archived || false,
        createdAt: p.created_at,
        description: `Boleto ou PIX no valor de R$ ${amt.toFixed(2).replace('.', ',')}`,
        statusBadge: {
           label: "Pendente",
           colorClass: "bg-orange-100 text-orange-700"
        }
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
