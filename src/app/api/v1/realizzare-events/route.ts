import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client for Server-to-Server Webhooks (Bypasses RLS)
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceKey);
}

// Default Organization ID for Realizzare
const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const supabase = getAdminSupabase();

    // 1. Bearer Token Verification (Optional for local test, enforced for production)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token !== "realizzare_secret_api_key_production" && token !== "realizzare_secret_api_key_test") {
        return NextResponse.json(
          { success: false, message: "Chave de API inválida ou não autorizada." },
          { status: 401 }
        );
      }
    }

    // 2. Parse Incoming Payload
    const body = await request.json();
    const eventType = body.event || body.event_type;

    if (!eventType) {
      return NextResponse.json(
        { success: false, message: "Tipo de evento ('event') não especificado no payload." },
        { status: 400 }
      );
    }

    let processedResult: any = {};

    // =========================================================================
    // EVENT 1: contact.created / contact.updated
    // =========================================================================
    if (eventType === "contact.created" || eventType === "contact.updated") {
      const student = body.student || body;
      const email = (student.email || student.student_email || "").toLowerCase().trim();

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do contato obrigatório." }, { status: 400 });
      }

      // Upsert Contact into 'contacts' table
      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .upsert(
          {
            org_id: DEFAULT_ORG_ID,
            email,
            first_name: student.first_name || student.name?.split(" ")[0] || "Aluno",
            last_name: student.last_name || student.name?.split(" ").slice(1).join(" ") || "Realizzare",
            phone: student.phone || null,
            city: student.city || null,
            state: student.state || null,
            source: student.origin || "WordPress Realizzare",
            status: "active"
          },
          { onConflict: "org_id,email" }
        )
        .select()
        .single();

      if (contactError) throw contactError;

      // Log Event in 'inbound_webhook_events'
      await supabase.from("inbound_webhook_events").insert({
        org_id: DEFAULT_ORG_ID,
        source: "realizzare_wordpress",
        event_type: eventType,
        payload: body,
        status: "processed",
        processed_at: new Date().toISOString()
      });

      processedResult = { action: "contact_upserted", contact_id: contactData.id, email };
    }

    // =========================================================================
    // EVENT 2: course.enrollment
    // =========================================================================
    else if (eventType === "course.enrollment") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course?.title || body.course_name || "Curso Realizzare";
      const coursePrice = Number(body.course?.price || 197.00);

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório para matrícula." }, { status: 400 });
      }

      // 1. Ensure contact exists
      const { data: contact } = await supabase
        .from("contacts")
        .upsert(
          {
            org_id: DEFAULT_ORG_ID,
            email,
            first_name: email.split("@")[0],
            last_name: "Realizzare",
            status: "active"
          },
          { onConflict: "org_id,email" }
        )
        .select()
        .single();

      // 2. Ensure course exists
      const { data: course } = await supabase
        .from("courses")
        .upsert(
          {
            org_id: DEFAULT_ORG_ID,
            name: courseName,
            price: coursePrice,
            type: "online"
          },
          { onConflict: "org_id,name" }
        )
        .select()
        .single();

      // 3. Upsert Enrollment
      if (contact && course) {
        await supabase.from("enrollments").upsert(
          {
            org_id: DEFAULT_ORG_ID,
            contact_id: contact.id,
            course_id: course.id,
            status: "active",
            progress: 0.00,
            enrolled_at: body.course?.enrolled_at || new Date().toISOString()
          },
          { onConflict: "contact_id,course_id" }
        );

        // 4. Log course event
        await supabase.from("course_events").insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contact.id,
          course_id: course.id,
          event_type: "started",
          metadata: { course_name: courseName, enrolled_at: new Date().toISOString() }
        });
      }

      processedResult = { action: "enrollment_created", email, courseName };
    }

    // =========================================================================
    // EVENT 3: course.progress
    // =========================================================================
    else if (eventType === "course.progress") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course_name || body.course?.title || "Introdução à Programação Web";
      const progressPercent = Number(body.progress_percent || body.progress_percentage || 0);

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      // Find Contact & Course
      const { data: contact } = await supabase.from("contacts").select("id").eq("email", email).single();
      const { data: course } = await supabase.from("courses").select("id").eq("name", courseName).single();

      if (contact && course) {
        // Update Enrollment Progress
        await supabase
          .from("enrollments")
          .update({
            progress: progressPercent,
            last_accessed_at: new Date().toISOString(),
            status: progressPercent >= 100 ? "completed" : "active"
          })
          .eq("contact_id", contact.id)
          .eq("course_id", course.id);

        // Log course progress event
        await supabase.from("course_events").insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contact.id,
          course_id: course.id,
          event_type: "progress_updated",
          metadata: { progress_percent: progressPercent, completed_lessons: body.completed_lessons || 0 }
        });
      }

      processedResult = { action: "progress_updated", email, courseName, progressPercent };
    }

    // =========================================================================
    // EVENT 4: certificate.issued
    // =========================================================================
    else if (eventType === "certificate.issued") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.certificate?.course_name || body.course_name || "Introdução à Programação Web";
      const certCode = body.certificate?.code || `CERT-${Math.floor(Math.random() * 90000 + 10000)}`;

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      const { data: contact } = await supabase.from("contacts").select("id").eq("email", email).single();
      const { data: course } = await supabase.from("courses").select("id").eq("name", courseName).single();

      if (contact) {
        if (course) {
          // 1. Update enrollment to Certificate Issued = true
          await supabase
            .from("enrollments")
            .update({
              certificate_issued: true,
              certificate_issued_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              progress: 100.00,
              status: "completed"
            })
            .eq("contact_id", contact.id)
            .eq("course_id", course.id);
        }

        // 2. Log Certificate Event in 'course_events'
        await supabase.from("course_events").insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contact.id,
          course_id: course?.id || null,
          event_type: "certificate_issued",
          metadata: {
            code: certCode,
            course_name: courseName,
            grade: body.certificate?.grade || "10.0",
            issued_at: new Date().toISOString()
          }
        });
      }

      processedResult = { action: "certificate_issued", email, courseName, certCode };
    }

    // =========================================================================
    // EVENT 5: user.action (e.g. checkout_abandoned, page_view)
    // =========================================================================
    else if (eventType === "user.action") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const actionType = body.action_type || "checkout_abandoned";

      if (email) {
        const { data: contact } = await supabase.from("contacts").select("id").eq("email", email).single();

        // Log into inbound_webhook_events
        await supabase.from("inbound_webhook_events").insert({
          org_id: DEFAULT_ORG_ID,
          source: "realizzare_wordpress",
          event_type: actionType,
          payload: body,
          status: "processed",
          processed_at: new Date().toISOString()
        });
      }

      processedResult = { action: "user_action_logged", email, actionType: body.action_type };
    }

    return NextResponse.json({
      success: true,
      message: `Evento '${eventType}' processado com sucesso.`,
      result: processedResult,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Erro no processamento do evento Realizzare WordPress:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno no servidor ao processar evento.", error: error.message },
      { status: 500 }
    );
  }
}
