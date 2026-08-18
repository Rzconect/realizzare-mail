import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceKey);
}

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const supabase = getAdminSupabase();

    // 1. Bearer Token Verification
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

    // Helper: Find or Create Contact
    const ensureContact = async (emailStr: string, extraData: any = {}) => {
      const cleanEmail = emailStr.toLowerCase().trim();
      const { data: existing } = await supabase
        .from("contacts")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        if (extraData.first_name || extraData.phone || extraData.city) {
          await supabase
            .from("contacts")
            .update({
              first_name: extraData.first_name || existing.first_name,
              last_name: extraData.last_name || existing.last_name,
              phone: extraData.phone || existing.phone,
              city: extraData.city || existing.city,
              state: extraData.state || existing.state,
              source: extraData.origin || existing.source
            })
            .eq("id", existing.id);
        }
        return existing;
      }

      const firstName = extraData.first_name || cleanEmail.split("@")[0];
      const lastName = extraData.last_name || "Realizzare";
      const { data: inserted, error } = await supabase
        .from("contacts")
        .insert({
          org_id: DEFAULT_ORG_ID,
          email: cleanEmail,
          first_name: firstName,
          last_name: lastName,
          phone: extraData.phone || null,
          city: extraData.city || null,
          state: extraData.state || null,
          source: extraData.origin || "WordPress Realizzare",
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;
      return inserted;
    };

    // Helper: Find or Create Course
    const ensureCourse = async (courseNameStr: string, priceNum = 197.00) => {
      const nameClean = courseNameStr.trim();
      const { data: existing } = await supabase
        .from("courses")
        .select("*")
        .eq("name", nameClean)
        .maybeSingle();

      if (existing) return existing;

      const { data: inserted, error } = await supabase
        .from("courses")
        .insert({
          org_id: DEFAULT_ORG_ID,
          name: nameClean,
          price: priceNum,
          type: "online"
        })
        .select()
        .single();

      if (error) throw error;
      return inserted;
    };

    // Helper: Find or Create Enrollment
    const ensureEnrollment = async (contactId: string, courseId: string) => {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("*")
        .eq("contact_id", contactId)
        .eq("course_id", courseId)
        .maybeSingle();

      if (existing) return existing;

      const { data: inserted, error } = await supabase
        .from("enrollments")
        .insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contactId,
          course_id: courseId,
          status: "active",
          progress: 0.00,
          enrolled_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return inserted;
    };

    // Helper: Manage Lists (Leads vs Alunos transition)
    const ensureList = async (listNameStr: string, descriptionStr: string) => {
      const nameClean = listNameStr.trim();
      const { data: existing } = await supabase
        .from("lists")
        .select("*")
        .ilike("name", `%${nameClean}%`)
        .maybeSingle();

      if (existing) return existing;

      const { data: inserted, error } = await supabase
        .from("lists")
        .insert({
          org_id: DEFAULT_ORG_ID,
          name: nameClean,
          description: descriptionStr,
          url: "https://realizzarecursos.com.br"
        })
        .select()
        .single();

      if (error) throw error;
      return inserted;
    };

    const subscribeToList = async (contactId: string, listId: string) => {
      await supabase
        .from("list_subscriptions")
        .upsert(
          {
            contact_id: contactId,
            list_id: listId,
            status: "subscribed",
            updated_at: new Date().toISOString()
          },
          { onConflict: "contact_id,list_id" }
        );
    };

    const unsubscribeFromList = async (contactId: string, listId: string) => {
      await supabase
        .from("list_subscriptions")
        .update({
          status: "unsubscribed",
          updated_at: new Date().toISOString()
        })
        .eq("contact_id", contactId)
        .eq("list_id", listId);
    };

    const handleCourseEnrollmentListTransition = async (contactId: string) => {
      const leadsList = await ensureList("Leads", "Lista de leads cadastrados via formulário ou integração.");
      const alunosList = await ensureList("Lista Geral de Alunos", "Lista de alunos matriculados em cursos.");

      if (leadsList) {
        await unsubscribeFromList(contactId, leadsList.id);
      }
      if (alunosList) {
        await subscribeToList(contactId, alunosList.id);
      }
    };

    // =========================================================================
    // EVENT 1: contact.created / contact.updated
    // =========================================================================
    if (eventType === "contact.created" || eventType === "contact.updated") {
      const student = body.student || body;
      const email = (student.email || student.student_email || "").toLowerCase().trim();

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do contato obrigatório." }, { status: 400 });
      }

      const contact = await ensureContact(email, student);

      // List management for new leads: Check if enrolled or brand new
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("contact_id", contact.id);

      if (count && count > 0) {
        const alunosList = await ensureList("Lista Geral de Alunos", "Lista de alunos matriculados em cursos.");
        if (alunosList) await subscribeToList(contact.id, alunosList.id);
      } else {
        const leadsList = await ensureList("Leads", "Lista de leads cadastrados via formulário ou integração.");
        if (leadsList) await subscribeToList(contact.id, leadsList.id);
      }

      // Log event in course_events
      await supabase.from("course_events").insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: contact.id,
        event_type: "started",
        metadata: {
          event: "contact_created",
          origin: student.origin || "WordPress Realizzare",
          tags: student.tags || []
        }
      });

      // Log raw payload
      await supabase.from("inbound_webhook_events").insert({
        org_id: DEFAULT_ORG_ID,
        source: "realizzare_wordpress",
        event_type: eventType,
        payload: body,
        status: "processed",
        processed_at: new Date().toISOString()
      });

      processedResult = { action: "contact_upserted", contact_id: contact.id, email, list: count && count > 0 ? "Alunos" : "Leads" };
    }

    // =========================================================================
    // EVENT 2: course.enrollment
    // =========================================================================
    else if (eventType === "course.enrollment") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course?.title || body.course_name || "Introdução à Programação Web";
      const coursePrice = Number(body.course?.price || 197.00);

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      const contact = await ensureContact(email);
      const course = await ensureCourse(courseName, coursePrice);
      const enrollment = await ensureEnrollment(contact.id, course.id);

      // Automatic List Transition: Move from 'Leads' to 'Lista Geral de Alunos'
      await handleCourseEnrollmentListTransition(contact.id);

      // Log course event
      await supabase.from("course_events").insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: contact.id,
        course_id: course.id,
        enrollment_id: enrollment.id,
        event_type: "started",
        metadata: { course_name: courseName, enrolled_at: new Date().toISOString() }
      });

      processedResult = { action: "enrollment_created", email, courseName, enrollment_id: enrollment.id, listTransition: "Leads -> Alunos" };
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

      const contact = await ensureContact(email);
      const course = await ensureCourse(courseName);
      const enrollment = await ensureEnrollment(contact.id, course.id);

      // Automatic List Transition: Ensure lead is in Alunos list
      await handleCourseEnrollmentListTransition(contact.id);

      // Update Enrollment Progress
      await supabase
        .from("enrollments")
        .update({
          progress: progressPercent,
          last_accessed_at: new Date().toISOString(),
          status: progressPercent >= 100 ? "completed" : "active"
        })
        .eq("id", enrollment.id);

      // Log course progress event
      await supabase.from("course_events").insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: contact.id,
        course_id: course.id,
        enrollment_id: enrollment.id,
        event_type: "progress_updated",
        metadata: {
          progress_percent: progressPercent,
          completed_lessons: body.completed_lessons || 0,
          total_lessons: body.total_lessons || 20,
          course_name: courseName
        }
      });

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

      const contact = await ensureContact(email);
      const course = await ensureCourse(courseName);
      const enrollment = await ensureEnrollment(contact.id, course.id);

      // Ensure in Alunos list
      await handleCourseEnrollmentListTransition(contact.id);

      // 1. Mark enrollment as Certificate Issued = true & completed
      await supabase
        .from("enrollments")
        .update({
          certificate_issued: true,
          certificate_issued_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          progress: 100.00,
          status: "completed"
        })
        .eq("id", enrollment.id);

      // 2. Log Certificate Event in 'course_events' with credit consumption note (No grade)
      await supabase.from("course_events").insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: contact.id,
        course_id: course.id,
        enrollment_id: enrollment.id,
        event_type: "certificate_issued",
        metadata: {
          code: certCode,
          course_name: courseName,
          issued_at: new Date().toISOString(),
          credit_consumed: true,
          note: "(1 crédito de certificado consumido)"
        }
      });

      processedResult = { action: "certificate_issued", email, courseName, certCode };
    }

    // =========================================================================
    // EVENT 5: user.action (e.g. checkout_abandoned)
    // =========================================================================
    else if (eventType === "user.action") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const actionType = body.action_type || "checkout_abandoned";

      if (email) {
        const contact = await ensureContact(email);

        await supabase.from("course_events").insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contact.id,
          event_type: "progress_updated",
          metadata: {
            action_type: actionType,
            page_url: body.page_url || "https://realizzarecursos.com.br/checkout",
            cart_item: body.cart_item || "Curso Realizzare"
          }
        });
      }

      processedResult = { action: "user_action_logged", email, actionType };
    }

    return NextResponse.json({
      success: true,
      message: `Evento '${eventType}' processado com sucesso no Supabase.`,
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
