import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let pageId = "";
    let slug = "";
    let listId = "";
    let name = "";
    let firstName = "";
    let lastName = "";
    let email = "";
    let phone = "";
    let redirectUrl = "";

    // Parse form data based on content type
    if (contentType.includes("application/json")) {
      const body = await req.json();
      pageId = body.page_id || body.pageId || "";
      slug = body.slug || "";
      listId = body.list_id || body.listId || "";
      name = body.name || "";
      firstName = body.first_name || body.firstName || "";
      lastName = body.last_name || body.lastName || "";
      email = body.email || "";
      phone = body.phone || "";
      redirectUrl = body.redirect_url || body.redirectUrl || "";
    } else {
      // urlencoded or multipart/form-data
      const formData = await req.formData();
      pageId = (formData.get("page_id") as string) || (formData.get("pageId") as string) || "";
      slug = (formData.get("slug") as string) || "";
      listId = (formData.get("list_id") as string) || (formData.get("listId") as string) || "";
      name = (formData.get("name") as string) || "";
      firstName = (formData.get("first_name") as string) || "";
      lastName = (formData.get("last_name") as string) || "";
      email = (formData.get("email") as string) || "";
      phone = (formData.get("phone") as string) || "";
      redirectUrl = (formData.get("redirect_url") as string) || (formData.get("redirectUrl") as string) || "";
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      if (contentType.includes("application/json")) {
        return NextResponse.json({ success: false, error: "E-mail inválido ou não informado." }, { status: 400 });
      }
      return new NextResponse(
        `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>Erro no cadastro</h2><p>Por favor, informe um endereço de e-mail válido.</p><a href="javascript:history.back()">Voltar</a></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Split name if first_name not separately provided
    if (!firstName && name) {
      const parts = name.trim().split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    const supabase = getSupabase();

    // 1. Find or create Contact
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, phone, status")
      .eq("email", cleanEmail)
      .maybeSingle();

    let contactId = existingContact?.id;

    if (existingContact) {
      // Update contact info if provided
      const updates: any = { updated_at: new Date().toISOString() };
      if (firstName && (!existingContact.first_name || existingContact.first_name.trim() === "")) {
        updates.first_name = firstName;
      }
      if (lastName && (!existingContact.last_name || existingContact.last_name.trim() === "")) {
        updates.last_name = lastName;
      }
      if (phone && (!existingContact.phone || existingContact.phone.trim() === "")) {
        updates.phone = phone.trim();
      }
      if (existingContact.status === "unsubscribed") {
        updates.status = "active";
      }

      await supabase.from("contacts").update(updates).eq("id", contactId);
    } else {
      // Insert new contact
      const { data: newContact, error: insertErr } = await supabase
        .from("contacts")
        .insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          email: cleanEmail,
          first_name: firstName || "Lead",
          last_name: lastName || "",
          phone: phone ? phone.trim() : null,
          status: "active",
          source: "landing_page",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (!insertErr && newContact) {
        contactId = newContact.id;
      }
    }

    // 2. Subscribe to List if list_id provided
    if (listId && contactId) {
      const { data: existingSub } = await supabase
        .from("list_subscriptions")
        .select("id, status")
        .eq("contact_id", contactId)
        .eq("list_id", listId)
        .maybeSingle();

      if (existingSub) {
        if (existingSub.status !== "subscribed") {
          await supabase
            .from("list_subscriptions")
            .update({ status: "subscribed", updated_at: new Date().toISOString() })
            .eq("id", existingSub.id);
        }
      } else {
        await supabase.from("list_subscriptions").insert({
          contact_id: contactId,
          list_id: listId,
          status: "subscribed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Update subscriber_count on the list
      const { count: subCount } = await supabase
        .from("list_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("list_id", listId)
        .eq("status", "subscribed");

      if (typeof subCount === "number") {
        await supabase
          .from("lists")
          .update({ subscriber_count: subCount, updated_at: new Date().toISOString() })
          .eq("id", listId);
      }
    }

    // 3. Register Page Conversion Event in reporting_events
    const eventKey = pageId || slug || "unknown";
    await supabase.from("reporting_events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      contact_email: cleanEmail,
      event_type: "page_conversion",
      metadata: {
        page_id: eventKey,
        slug: slug || pageId,
        list_id: listId || null,
        contact_id: contactId || null,
        email: cleanEmail,
        form_submission: true,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    });

    // 4. Handle Redirection / Response
    if (redirectUrl && redirectUrl.trim()) {
      let target = redirectUrl.trim();
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = `https://${target}`;
      }
      return NextResponse.redirect(target, 303);
    }

    if (contentType.includes("application/json")) {
      return NextResponse.json({
        success: true,
        message: "Cadastro realizado com sucesso!",
        contactId,
        listId
      });
    }

    // Return a clean branded confirmation page for HTML form submits
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro Confirmado - Realizzare Cursos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans text-slate-800">
  <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-5">
    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    
    <div class="space-y-2">
      <h1 class="text-2xl font-black text-slate-900 tracking-tight">Inscrição Confirmada!</h1>
      <p class="text-sm text-slate-600 leading-relaxed">
        Obrigado por se cadastrar. Seus dados foram recebidos com sucesso e você já está registrado em nossa lista de novidades.
      </p>
    </div>

    <div class="pt-2">
      <a href="https://realizzarecursos.com.br" class="inline-flex items-center justify-center w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
        Acessar a Realizzare Cursos
      </a>
    </div>

    <p class="text-[11px] text-slate-400">
      Realizzare Cursos • Plataforma Oficial de Cursos Online
    </p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      }
    );
  } catch (err: any) {
    console.error("Error in /api/forms/submit:", err);
    return NextResponse.json({ success: false, error: err.message || "Erro interno" }, { status: 500 });
  }
}
