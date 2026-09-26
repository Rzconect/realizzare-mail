import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { triggerFlowsForEvent } from "@/lib/flows/trigger";

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceKey);
}

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  try {
    const supabase = getAdminSupabase();

    // 1. Bearer / Token Verification
    const authHeader = request.headers.get("authorization") || request.headers.get("x-api-key") || "";
    if (authHeader) {
      const cleanToken = authHeader.replace(/^Bearer\s+/i, "").trim();
      const validTokens = [
        "realizzare_secret_api_key_production",
        "realizarre_secret_api_key_production",
        "realizare_secret_api_key_production",
        "realizzare_secret_api_key_test",
        "realizarre_secret_api_key_test",
        "realizare_secret_api_key_test"
      ];
      
      const isValidDefaultToken = validTokens.includes(cleanToken);
      let isValidCustomKey = false;

      if (!isValidDefaultToken && cleanToken.startsWith("sk_")) {
        const { data: matchedKey } = await supabase
          .from("api_keys")
          .select("id")
          .ilike("key_prefix", `${cleanToken.substring(0, 10)}%`)
          .maybeSingle();
        if (matchedKey) isValidCustomKey = true;
      }

      if (!isValidDefaultToken && !isValidCustomKey && cleanToken.length > 0) {
        return NextResponse.json(
          { success: false, message: "Chave de API inválida ou não autorizada.", received_token: cleanToken ? cleanToken.substring(0, 15) + "..." : "vazio" },
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

    // Load Product Mapping to resolve course names by ID
    let productMapping: Record<string, string> = {};
    try {
      const { data: settingsData } = await supabase
        .from("account_settings")
        .select("settings")
        .eq("org_id", DEFAULT_ORG_ID)
        .maybeSingle();
      if (settingsData && settingsData.settings && (settingsData.settings as any).pagarme_product_mapping) {
        productMapping = (settingsData.settings as any).pagarme_product_mapping;
      }
    } catch(e) {}

    // Helper: Find or Create Contact
    const ensureContact = async (emailStr: string, extraData: any = {}) => {
      const cleanEmail = emailStr.toLowerCase().trim();
      const { data: existing } = await supabase
        .from("contacts")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      let contactRecord = existing;

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
      } else {
        const firstName = extraData.first_name || cleanEmail.split("@")[0];
        const lastName = extraData.last_name || "";
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
        contactRecord = inserted;
      }

      // Handle tags synchronization
      const incomingTags = Array.isArray(extraData.tags) ? extraData.tags : (extraData.tag ? [extraData.tag] : []);
      if (incomingTags.length > 0 && contactRecord) {
        try {
          const { data: globalTags } = await supabase.from("tags").select("id, name");
          const tagIds: string[] = [];
          for (const tName of incomingTags) {
            const cleanTName = String(tName).trim();
            if (!cleanTName) continue;
            
            const found = (globalTags as any[])?.find(gt => gt.name.toLowerCase() === cleanTName.toLowerCase());
            if (found) {
              tagIds.push(found.id);
            } else {
              const { data: newTag } = await supabase
                .from("tags")
                .insert({ name: cleanTName, org_id: DEFAULT_ORG_ID })
                .select("id")
                .maybeSingle();
              if (newTag) tagIds.push(newTag.id);
            }
          }
          
          if (tagIds.length > 0) {
            const { data: currentContactTags } = await supabase.from("contact_tags").select("tag_id").eq("contact_id", contactRecord.id);
            const existingTagIds = new Set((currentContactTags || []).map((ct: any) => ct.tag_id));
            
            const relationsToInsert = tagIds.filter(tId => !existingTagIds.has(tId)).map((tId: any) => ({ contact_id: contactRecord.id, tag_id: tId }));
            if (relationsToInsert.length > 0) {
              await supabase.from("contact_tags").insert(relationsToInsert);
            }
          }
        } catch (tagErr) {
          console.error("Error syncing tags for contact:", tagErr);
        }
      }

      return contactRecord;
    };

    // Helper: Find or Create Course
    const ensureCourse = async (courseNameStr: string, priceNum = 197.00, skuStr?: string) => {
      let resolvedName = courseNameStr;
      if (skuStr && productMapping[skuStr]) {
        resolvedName = productMapping[skuStr];
      }

      let existing = null;
      if (skuStr) {
        const { data } = await supabase.from("courses").select("*").eq("sku", skuStr).maybeSingle();
        if (data) existing = data;
      }
      if (!existing && resolvedName) {
        const nameClean = resolvedName.trim();
        const { data } = await supabase.from("courses").select("*").eq("name", nameClean).maybeSingle();
        if (data) existing = data;
      }

      if (existing) {
        if (skuStr && !existing.sku) {
          await supabase.from("courses").update({ sku: skuStr }).eq("id", existing.id);
        }
        // Se a gente achou um mapeamento de nome melhor agora, atualiza o nome
        if (resolvedName && (existing.name.includes("Curso (ID:") || existing.name.includes("Curso Desconhecido")) && resolvedName !== existing.name) {
          await supabase.from("courses").update({ name: resolvedName }).eq("id", existing.id);
          existing.name = resolvedName;
        }
        return existing;
      }

      const { data: inserted, error } = await supabase
        .from("courses")
        .insert({
          org_id: DEFAULT_ORG_ID,
          name: resolvedName ? resolvedName.trim() : "Curso sem nome",
          price: priceNum,
          sku: skuStr || null
        })
        .select()
        .single();

      if (error || !inserted) throw error || new Error("Failed to create course");
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
      const { data: existing } = await supabase
        .from("list_subscriptions")
        .select("status")
        .eq("contact_id", contactId)
        .eq("list_id", listId)
        .maybeSingle();

      if (existing && existing.status === "subscribed") {
        return; // Already in list, do not update timestamp
      }

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
      const { data: existing } = await supabase
        .from("list_subscriptions")
        .select("status")
        .eq("contact_id", contactId)
        .eq("list_id", listId)
        .maybeSingle();

      if (!existing || existing.status === "unsubscribed") {
        return; // If not in list, or already unsubscribed, do nothing
      }

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
      const alunosList = await ensureList("Alunos", "Lista de alunos matriculados em cursos.");

      // Check current subscription state to avoid redundant list change events
      const { data: currentSubs } = await supabase
        .from("list_subscriptions")
        .select("list_id, status")
        .eq("contact_id", contactId);

      const currentSubMap = new Map((currentSubs || []).map((s: any) => [s.list_id, s.status]));

      // Only unsubscribe from Leads if currently subscribed
      if (leadsList && currentSubMap.get(leadsList.id) === "subscribed") {
        await unsubscribeFromList(contactId, leadsList.id);
      }
      // Only subscribe to Alunos if not already subscribed
      if (alunosList && currentSubMap.get(alunosList.id) !== "subscribed") {
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
        const alunosList = await ensureList("Alunos", "Lista de alunos matriculados em cursos.");
        if (alunosList) await subscribeToList(contact.id, alunosList.id);
      } else {
        const leadsList = await ensureList("Leads", "Lista de leads cadastrados via formulário ou integração.");
        if (leadsList) await subscribeToList(contact.id, leadsList.id);
      }

      // Log raw payload
      await supabase.from("inbound_webhook_events").insert({
        org_id: DEFAULT_ORG_ID,
        source: "realizzare_wordpress",
        event_type: eventType,
        payload: body,
        status: "processed",
        processed_at: new Date().toISOString()
      });

      await triggerFlowsForEvent(supabase, "Contato Criado / Atualizado", contact.id, {});
      // Also fire "Novo Lead Cadastrado" when the contact has no enrollments (is a pure lead)
      if (!count || count === 0) {
        await triggerFlowsForEvent(supabase, "Novo Lead Cadastrado", contact.id, {});
      }
      processedResult = { action: "contact_upserted", contact_id: contact.id, email, list: count && count > 0 ? "Alunos" : "Leads" };
    }

    // =========================================================================
    // EVENT 2: course.enrollment
    // =========================================================================
    else if (eventType === "course.enrollment") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course?.title || body.course_name || (body.course_id || body.course?.id ? `Curso (ID: ${body.course_id || body.course?.id})` : "Curso Desconhecido");
      const coursePrice = Number(body.course?.price || body.price || 197.00);
      const courseId = body.course_id || body.course?.id?.toString() || null;

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      const contact = await ensureContact(email);
      const course = await ensureCourse(courseName, coursePrice, courseId);
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

      await triggerFlowsForEvent(supabase, "Matrícula Realizada", contact.id, { course_name: courseName || "" });
      processedResult = { action: "enrollment_created", email, courseName, enrollment_id: enrollment.id, listTransition: "Leads -> Alunos" };
    }

    // =========================================================================
    // EVENT 3: course.progress
    // =========================================================================
    else if (eventType === "course.progress") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course_name || body.course?.title || (body.course_id ? `Curso (ID: ${body.course_id})` : "Curso Desconhecido");
      const courseId = body.course_id || body.course?.id?.toString() || null;
      const progressPercent = Number(body.progress_percent || body.progress_percentage || 0);

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      const contact = await ensureContact(email);
      const course = await ensureCourse(courseName, 197.00, courseId);
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
          course_name: course.name
        }
      });

      processedResult = { action: "progress_updated", email, courseName: course.name, progressPercent };
    }

    // =========================================================================
    // EVENT 4: certificate.issued
    // =========================================================================
    else if (eventType === "certificate.issued") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.certificate?.course_name || body.course_name || (body.certificate?.course_id || body.course_id || body.course?.id ? `Curso (ID: ${body.certificate?.course_id || body.course_id || body.course?.id})` : "Curso Desconhecido");
      const courseId = body.certificate?.course_id || body.course_id || body.course?.id?.toString() || null;
      const certCode = body.certificate?.code || `CERT-${Math.floor(Math.random() * 90000 + 10000)}`;
      // The Realizzare platform may send a certificate view/download URL
      const certUrl = body.certificate?.url || body.certificate?.pdf_url || body.certificate?.view_url || body.cert_url || body.certificate_url || null;

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      const contact = await ensureContact(email);

      // FIX: Find the MOST RECENT existing enrollment for this contact (prefer completed/active ones)
      // Do NOT call ensureCourse with a possibly wrong name like "digital" from the certificate payload
      let course: any = null;
      let enrollment: any = null;

      // First try to find by courseId if provided
      if (courseId) {
        const { data: courseById } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
        if (courseById) course = courseById;
      }

      // If no course found by ID, try by name (only if it's a meaningful name, not "digital" placeholder)
      if (!course && courseName && courseName !== "digital" && !courseName.includes("Curso (ID:")) {
        const { data: courseByName } = await supabase.from("courses").select("*").ilike("name", courseName.trim()).maybeSingle();
        if (courseByName) course = courseByName;
      }

      // Last resort: find the most recent enrollment for this contact
      if (!course) {
        const { data: latestEnrollment } = await supabase
          .from("enrollments")
          .select("*, courses(*)")
          .eq("contact_id", contact.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestEnrollment) {
          course = latestEnrollment.courses;
          enrollment = latestEnrollment;
        }
      }

      // If still no course, fallback to creating one with the name
      if (!course) {
        course = await ensureCourse(courseName, 197.00, courseId);
      }

      // If no enrollment found yet, find or create one for this course
      if (!enrollment) {
        const { data: existingEnrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("contact_id", contact.id)
          .eq("course_id", course.id)
          .maybeSingle();
        enrollment = existingEnrollment || await ensureEnrollment(contact.id, course.id);
      }

      // Ensure in Alunos list (idempotent - won't create duplicate events)
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

      // 2. Log Certificate Issued in Course Events
      await supabase.from("course_events").insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: contact.id,
        course_id: course.id,
        enrollment_id: enrollment.id,
        event_type: "certificate_issued",
        metadata: {
          course_name: course.name,
          code: certCode,
          issued_at: body.timestamp || new Date().toISOString(),
          credit_consumed: true,
          note: "(1 crédito de certificado consumido)",
          ...(certUrl ? { cert_url: certUrl } : {})
        }
      });

      // FIX 5: Trigger automation flows for certificate issued event
      await triggerFlowsForEvent(supabase, "Certificado Emitido (certificate_issued)", contact.id, {
        course_name: course.name || "",
        cert_url: certUrl || "",
        cert_code: certCode
      });

      processedResult = { action: "certificate_issued", email, courseName: course.name, certCode };
    }

    // =========================================================================
    // EVENT 5: test.approved / teste_aprovado
    // =========================================================================
    else if (eventType === "test.approved" || eventType === "teste_aprovado") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course_name || body.course?.title || (body.course_id ? `Curso (ID: ${body.course_id})` : "Curso Desconhecido");
      const courseId = body.course_id || body.course?.id?.toString() || null;
      const testScore = Number(body.test_score || body.score || 100);

      if (!email) {
        return NextResponse.json({ success: false, message: "E-mail do aluno obrigatório." }, { status: 400 });
      }

      const contact = await ensureContact(email);
      const course = await ensureCourse(courseName, 197.00, courseId);
      const enrollment = await ensureEnrollment(contact.id, course.id);

      // Log Test Approved in Course Events (Using progress_updated to bypass ENUM strictness, adding flag in metadata)
      await supabase.from("course_events").insert({
        org_id: DEFAULT_ORG_ID,
        contact_id: contact.id,
        course_id: course.id,
        enrollment_id: enrollment.id,
        event_type: "progress_updated",
        metadata: {
          original_event: "test_approved",
          course_name: course.name,
          score: testScore,
          approved_at: body.timestamp || new Date().toISOString()
        }
      });

      await triggerFlowsForEvent(supabase, "Teste Aprovado", contact.id, { course_name: course.name || "", score: testScore });

      processedResult = { action: "test_approved", email, courseName: course.name, testScore };
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

        if (actionType === "checkout_abandoned") {
          await triggerFlowsForEvent(supabase, "Carrinho Abandonado (checkout_abandoned)", contact.id, { course_name: body.cart_item || "" });
        } else if (actionType === "checkout_click") {
          await triggerFlowsForEvent(supabase, "Clique em Emissão/Checkout (checkout_click)", contact.id, { course_name: body.cart_item || "" });
        } else if (actionType === "page_view") {
          await triggerFlowsForEvent(supabase, "Visualizou Página (page_view)", contact.id, { page_url: body.page_url || "" });
        }
      }

      processedResult = { action: "user_action_logged", email, actionType };
    }

    // =========================================================================
    // EVENT 6: course.exam_failed / test.failed
    // =========================================================================
    else if (eventType === "course.exam_failed" || eventType === "test.failed") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();
      const courseName = body.course_name || body.course?.title || "Curso Desconhecido";
      const courseId = body.course_id || body.course?.id?.toString() || null;
      const testScore = Number(body.test_score || body.score || 0);

      if (email) {
        const contact = await ensureContact(email);
        const course = await ensureCourse(courseName, 197.00, courseId);
        const enrollment = await ensureEnrollment(contact.id, course.id);

        await supabase.from("course_events").insert({
          org_id: DEFAULT_ORG_ID,
          contact_id: contact.id,
          course_id: course.id,
          enrollment_id: enrollment.id,
          event_type: "progress_updated",
          metadata: {
            original_event: "exam_failed",
            course_name: course.name,
            score: testScore,
            failed_at: body.timestamp || new Date().toISOString()
          }
        });

        await triggerFlowsForEvent(supabase, "Reprovação na Prova (course.exam_failed)", contact.id, { course_name: course.name || "", score: testScore });
        processedResult = { action: "exam_failed_logged", email, courseName: course.name, testScore };
      }
    }

    // =========================================================================
    // EVENT 7: contact.unsubscribed
    // =========================================================================
    else if (eventType === "contact.unsubscribed") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();

      if (email) {
        const contact = await ensureContact(email);

        // Mark contact as unsubscribed in contacts table
        await supabase.from("contacts").update({ status: "unsubscribed" }).eq("id", contact.id);

        await triggerFlowsForEvent(supabase, "Descadastro de Email (contact.unsubscribed)", contact.id, {});
        processedResult = { action: "contact_unsubscribed", email };
      }
    }

    // =========================================================================
    // EVENT 8: contact.reactivated
    // =========================================================================
    else if (eventType === "contact.reactivated") {
      const email = (body.student_email || body.email || "").toLowerCase().trim();

      if (email) {
        const contact = await ensureContact(email);

        // Re-activate contact
        await supabase.from("contacts").update({ status: "active" }).eq("id", contact.id);

        await triggerFlowsForEvent(supabase, "Reativação de Contato (contact.reactivated)", contact.id, {});
        processedResult = { action: "contact_reactivated", email };
      }
    }

    // Log request to inbound_webhook_events table for live feed monitoring
    try {
      await supabase.from("inbound_webhook_events").insert({
        org_id: DEFAULT_ORG_ID,
        source: "realizzare_wordpress",
        event_type: eventType,
        payload: body,
        status: "processed",
        processed_at: new Date().toISOString()
      });
    } catch (logErr) {
      console.warn("Could not record inbound_webhook_events log:", logErr);
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
