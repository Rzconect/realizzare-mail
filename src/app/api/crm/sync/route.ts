import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

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
    const { data: pendingPurchases, error: err2 } = await supabase
      .from("purchases")
      .select("id, created_at, product_name, amount, contacts(first_name, last_name, email, phone)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);

    const items = [];

    // Process Teste Aprovado
    for (const evt of allTestEvents) {
      const contactData: any = evt.contacts;
      const contact = (Array.isArray(contactData) ? contactData[0] : contactData) || {};
      const cName = contact.first_name ? `${contact.first_name} ${contact.last_name || ""}`.trim() : "Aluno Realizzare";
      items.push({
        id: `test-${evt.id}`,
        title: `Teste Aprovado: ${evt.metadata?.course_name || "Curso"}`,
        value: 0,
        clientInitials: cName.substring(0, 2).toUpperCase(),
        clientName: cName,
        clientColor: "bg-[#0f7650]",
        columnId: "novo",
        phone: contact.phone || "",
        email: contact.email || "",
        assignedTo: "Sem responsável",
        boardId: "teste_aprovado",
        archived: false,
        createdAt: evt.created_at,
        description: `Nota do teste: ${evt.metadata?.score || 100}`
      });
    }

    // Process Pedidos Pendentes
    for (const p of (pendingPurchases || [])) {
      const contactData: any = p.contacts;
      const contact = (Array.isArray(contactData) ? contactData[0] : contactData) || {};
      const cName = contact.first_name ? `${contact.first_name} ${contact.last_name || ""}`.trim() : "Aluno Realizzare";
      items.push({
        id: `pend-${p.id}`,
        title: `Pagamento Pendente: ${p.product_name || "Produto"}`,
        value: p.amount || 0,
        clientInitials: cName.substring(0, 2).toUpperCase(),
        clientName: cName,
        clientColor: "bg-orange-500",
        columnId: "novo",
        phone: contact.phone || "",
        email: contact.email || "",
        assignedTo: "Sem responsável",
        boardId: "pedidos_pendentes",
        archived: false,
        createdAt: p.created_at,
        description: `Aguardando pagamento de R$ ${p.amount?.toFixed(2).replace('.', ',')}`
      });
    }

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
