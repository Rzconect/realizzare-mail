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

    // 1. Parse Payload
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      const text = await request.text().catch(() => "");
      if (text) {
        try { body = JSON.parse(text); } catch (err) {}
      }
    }

    const email = (body.email || body.student_email || "").toLowerCase().trim();
    const eventType = body.event || "user.action";
    const payload = body.payload || {};

    if (!email) {
      return NextResponse.json(
        { success: false, message: "E-mail do contato obrigatório para registrar evento." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 2. Ensure Contact exists or update
    const firstName = body.first_name || payload.first_name || email.split("@")[0];
    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    let contactId = contact?.id;

    if (!contact) {
      const { data: newC } = await supabase
        .from("contacts")
        .insert({
          org_id: DEFAULT_ORG_ID,
          email: email,
          first_name: firstName,
          last_name: "Realizzare",
          source: "Realizzare WordPress (Front-end DataLayer)",
          status: "active"
        })
        .select()
        .single();
      contactId = newC?.id;
    }

    // 3. Handle Course Progress Event
    if (eventType === "course.progress" && contactId) {
      const courseIdStr = String(payload.course_id || "default");
      const courseName = payload.course_name || "Curso Realizzare";
      const progressPercent = Number(payload.progress_percent || 0);

      // Ensure Course exists
      let courseDbId;
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("name", courseName)
        .maybeSingle();

      if (existingCourse) {
        courseDbId = existingCourse.id;
      } else {
        const { data: newCourse } = await supabase
          .from("courses")
          .insert({
            org_id: DEFAULT_ORG_ID,
            name: courseName,
            price: payload.is_paid_course ? 197.00 : 0,
            type: "online"
          })
          .select()
          .single();
        courseDbId = newCourse?.id;
      }

      // Upsert Enrollment Progress
      if (courseDbId) {
        const { data: existingEnrollment } = await supabase
          .from("enrollments")
          .select("id, progress")
          .eq("contact_id", contactId)
          .eq("course_id", courseDbId)
          .maybeSingle();

        if (existingEnrollment) {
          // Only update if new progress is higher
          if (progressPercent > (existingEnrollment.progress || 0)) {
            await supabase
              .from("enrollments")
              .update({
                progress: progressPercent,
                last_accessed_at: new Date().toISOString(),
                status: progressPercent >= 100 ? "completed" : "active"
              })
              .eq("id", existingEnrollment.id);
          }
        } else {
          await supabase
            .from("enrollments")
            .insert({
              org_id: DEFAULT_ORG_ID,
              contact_id: contactId,
              course_id: courseDbId,
              status: progressPercent >= 100 ? "completed" : "active",
              progress: progressPercent,
              enrolled_at: new Date().toISOString()
            });
        }

        // Log course event in course_events
        await supabase.from("course_events").insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contactId,
          course_id: courseDbId,
          event_type: "progress_updated",
          metadata: {
            course_name: courseName,
            progress_percent: progressPercent,
            completed_lessons: payload.completed_lessons || 1,
            total_lessons: payload.total_lessons || 1,
            milestone: payload.milestone || "Curso em Andamento",
            is_paid_course: payload.is_paid_course || false,
            source: "datalayer_client_event"
          }
        });
      }
    }

    // 4. Log Raw Webhook Event
    await supabase.from("inbound_webhook_events").insert({
      org_id: DEFAULT_ORG_ID,
      provider: "datalayer_js",
      event_type: eventType,
      payload: body,
      status: "processed"
    });

    return NextResponse.json(
      { success: true, message: `Evento '${eventType}' recebido e processado via DataLayer.` },
      { status: 200, headers: corsHeaders() }
    );

  } catch (error: any) {
    console.error("Erro no processamento do evento DataLayer:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao processar evento.", error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders()
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
