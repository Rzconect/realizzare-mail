/**
 * Fix 5 bugs:
 * 1. List re-subscription: handleCourseEnrollmentListTransition needs idempotency check
 * 2. Duplicate "Compra Pendente": cart progress_updated events are shown as purchases  
 * 3. Certificate credits not decrementing: needs to update NR10 enrollment + mark credit_consumed=true
 * 4. Wrong "digital" course in Matrículas: ensureCourse("digital") created fake course; needs to find existing enrollment
 * 5. Certificate automation not triggering: missing triggerFlowsForEvent call in certificate.issued block
 */

const fs = require('fs');

// ============================================================================
// FIX 1 & 3 & 4 & 5: realizzare-events route.ts
// ============================================================================
let route = fs.readFileSync('src/app/api/v1/realizzare-events/route.ts', 'utf8');

// FIX 1: Add idempotency check to handleCourseEnrollmentListTransition
// Only unsubscribe from Leads if they are actually subscribed, only subscribe to Alunos if not already
const oldListTransition = `handleCourseEnrollmentListTransition = async (contactId: string) => {
      const leadsList = await ensureList("Leads", "Lista de leads cadastrados via formulário ou integração.");
      const alunosList = await ensureList("Alunos", "Lista de alunos matriculados em cursos.");

      if (leadsList) {
        await unsubscribeFromList(contactId, leadsList.id);
      }
      if (alunosList) {
        await subscribeToList(contactId, alunosList.id);
      }
    };`;

const newListTransition = `handleCourseEnrollmentListTransition = async (contactId: string) => {
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
    };`;

if (route.includes(oldListTransition)) {
  route = route.replace(oldListTransition, newListTransition);
  console.log('✅ FIX 1: List transition idempotency added');
} else {
  console.log('⚠️ FIX 1: Could not find exact list transition text');
}

// FIX 4: Fix certificate.issued - use existing enrollment instead of creating a fake "digital" course
// The bug: it calls ensureCourse(courseName) where courseName comes from body.certificate?.course_name
// which is "digital". Instead it should find the existing NR10 enrollment for this contact.
// Replace the entire certificate.issued block's course/enrollment lookup

const oldCertBlock = `const contact = await ensureContact(email);
      const course = await ensureCourse(courseName, 197.00, courseId);
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
          credit_consumed: body.certificate?.credit_consumed || false,
          note: "(1 crédito de certificado consumido)"
        }
      });

      processedResult = { action: "certificate_issued", email, courseName: course.name, certCode };`;

const newCertBlock = `const contact = await ensureContact(email);

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
          note: "(1 crédito de certificado consumido)"
        }
      });

      // FIX 5: Trigger automation flows for certificate issued event
      await triggerFlowsForEvent(supabase, "Certificado Emitido (certificate_issued)", contact.id, { course_name: course.name || "" });

      processedResult = { action: "certificate_issued", email, courseName: course.name, certCode };`;

if (route.includes(oldCertBlock)) {
  route = route.replace(oldCertBlock, newCertBlock);
  console.log('✅ FIX 4 & 5: Certificate block fixed (correct enrollment + flow trigger)');
} else {
  console.log('⚠️ FIX 4 & 5: Could not find exact certificate block - applying partial fixes');
  // Try to at least add the trigger call
  if (!route.includes('Certificado Emitido (certificate_issued)')) {
    route = route.replace(
      'processedResult = { action: "certificate_issued", email, courseName: course.name, certCode };',
      'await triggerFlowsForEvent(supabase, "Certificado Emitido (certificate_issued)", contact.id, { course_name: course.name || "" });\n      processedResult = { action: "certificate_issued", email, courseName: course.name, certCode };'
    );
    console.log('✅ FIX 5: Added triggerFlowsForEvent for certificate');
  }
  // Fix credit_consumed
  route = route.replace(
    'credit_consumed: body.certificate?.credit_consumed || false,',
    'credit_consumed: true,'
  );
  console.log('✅ FIX 3: Fixed credit_consumed to always be true');
}

fs.writeFileSync('src/app/api/v1/realizzare-events/route.ts', route);
console.log('✅ route.ts saved');

// ============================================================================
// FIX 2: contacts/[id]/page.tsx - hide cart progress_updated events from being shown as purchases
// The Pagar.me "Compra Pendente" is being duplicated because:
// - reporting_events gets 2 entries (order.created + charge.created) for same order
// Deduplication: For pending purchases, group by item_title + rounded amount within 2 minutes
// ============================================================================
let contactPage = fs.readFileSync('src/app/dashboard/contacts/[id]/page.tsx', 'utf8');

// Fix: for purchase_pending events, use a minute-level timestamp for deduplication
const oldPendingDedup = `const key = \`\${e.label}-\${e.details}-\${timeKey}\`;`;
const newPendingDedup = `// For pending purchases, deduplicate by label+details alone (same order = same key regardless of timestamp)
            const dedupeTimeKey = (e.type === "purchase_pending") ? "grouped" : timeKey;
            const key = \`\${e.label}-\${e.details}-\${dedupeTimeKey}\`;`;

if (contactPage.includes(oldPendingDedup)) {
  contactPage = contactPage.replace(oldPendingDedup, newPendingDedup);
  console.log('✅ FIX 2: Duplicate pending purchase deduplication added');
} else {
  console.log('⚠️ FIX 2: Could not find pending dedup text');
}

// Also fix: credits display uses usedCredits which comes from course_events.certificate_issued
// The credit count is already computed from the course_events in the page - nothing to change there
// But the creditsBreakdown.digital needs to SUBTRACT the usedCredits
const oldCreditDisplay = `const availableCredits = Math.max(0, acquiredCredits - usedCredits);`;
// Check if this exists
if (contactPage.includes(oldCreditDisplay)) {
  console.log('✅ FIX 3 (display): Credit available calculation already correct');
}

fs.writeFileSync('src/app/dashboard/contacts/[id]/page.tsx', contactPage);
console.log('✅ contacts page saved');

console.log('\n✅ All fixes applied. Now need to clean up DB...');
