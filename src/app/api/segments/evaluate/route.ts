import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { groups } = await req.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch all supporting data upfront in parallel
    const [
      { data: allContacts, error: contactsErr },
      { data: enrollments, error: enrollmentsErr },
      { data: courseEvents, error: courseEventsErr },
      { data: purchasesTable, error: purchasesTableErr },
      { data: reportingPurchases, error: reportingPurchasesErr },
      { data: pagarmeEvents, error: pagarmeEventsErr },
      { data: emailOpens, error: emailOpensErr },
      { data: emailClicks, error: emailClicksErr },
      { data: emailSent, error: emailSentErr },
      { data: contactTags, error: contactTagsErr },
      { data: listSubs, error: listSubsErr }
    ] = await Promise.all([
      supabase.from('contacts').select('id, email, status, first_name, last_name, phone, city, state, created_at').limit(5000),
      supabase.from('enrollments').select('contact_id, status, progress, certificate_issued, created_at, courses(name)'),
      supabase.from('course_events').select('contact_id, course_id, event_type, metadata, created_at'),
      supabase.from('purchases').select('contact_id, status, amount, product_name, created_at'),
      supabase.from('reporting_events').select('contact_email, event_type, metadata, created_at').eq('event_type', 'purchase'),
      supabase.from('inbound_webhook_events').select('payload, event_type, created_at').in('event_type', ['order.paid', 'charge.paid', 'charge.pending', 'order.payment_failed', 'charge.payment_failed']),
      supabase.from('inbound_webhook_events').select('payload, created_at').in('event_type', ['email.open', 'email.opened']),
      supabase.from('inbound_webhook_events').select('payload, created_at').in('event_type', ['email.click', 'email.clicked']),
      supabase.from('inbound_webhook_events').select('payload, created_at').in('event_type', ['email.delivered']),
      supabase.from('contact_tags').select('contact_id, tag_id, tags(name)'),
      supabase.from('list_subscriptions').select('contact_id, list_id, status, lists(name)')
    ]);

    if (contactsErr) {
      console.error('Error fetching contacts in evaluate route:', contactsErr);
      return NextResponse.json({ error: contactsErr.message }, { status: 500 });
    }

    if (!groups || groups.length === 0) {
      return NextResponse.json({ count: allContacts?.length ?? 0, ids: allContacts?.map(c => c.id) ?? [] });
    }

    const evaluationContext = {
      enrollments: enrollments ?? [],
      courseEvents: courseEvents ?? [],
      purchasesTable: purchasesTable ?? [],
      reportingPurchases: reportingPurchases ?? [],
      pagarmeEvents: pagarmeEvents ?? [],
      emailSent: emailSent ?? [],
      emailOpens: emailOpens ?? [],
      emailClicks: emailClicks ?? [],
      contactTags: contactTags ?? [],
      listSubs: listSubs ?? [],
    };

    const qualifiedIds: string[] = [];
    
    for (const contact of (allContacts ?? [])) {
      let contactQualifies = true;
      
      for (const group of groups) {
        if (!group.rules || group.rules.length === 0) continue;
        
        const op = group.logicalOperator === 'or' ? 'some' : 'every';
        const groupPasses = group.rules[op]((rule: any) => evaluateRule(rule, contact, evaluationContext));
        
        if (!groupPasses) {
          contactQualifies = false;
          break;
        }
      }
      
      if (contactQualifies) qualifiedIds.push(contact.id);
    }
    
    return NextResponse.json({ count: qualifiedIds.length, ids: qualifiedIds });
  } catch (err: any) {
    console.error('Segment evaluate route exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

function evaluateRule(rule: any, contact: any, data: any): boolean {
  if (!rule || !rule.field) return true;
  
  // Normalize field names from frontend aliases
  const normalizedField = rule.field === 'courseStatus' ? 'course_status' : rule.field;
  const { operator, value } = rule;
  const field = normalizedField;

  // Try parsing value if it's JSON (used by engagement fields like email open/click)
  let parsedValue = value;
  try {
    if (typeof value === 'string' && value.trim().startsWith('{')) {
      parsedValue = JSON.parse(value);
    }
  } catch (e) {}

  const campaignId = parsedValue?.specificCampaign || rule.campaignId;
  const campaignScope = parsedValue?.campaignScope || 'Qualquer campanha';
  const timeframeMode = parsedValue?.timeframeMode || 'last_days';
  const daysCount = parseInt(parsedValue?.daysCount || '30', 10);
  
  const isWithinTimeframe = (dateStr?: string) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return true;
    if (timeframeMode === 'last_days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysCount);
      return date >= cutoff;
    }
    return true;
  };

  const compare = (a: any, b: any): boolean => {
    const valA = String(a ?? '').toLowerCase().trim();
    const valB = String(b ?? '').toLowerCase().trim();
    if (operator === 'eq' || operator === 'is' || operator === 'equal') return valA === valB;
    if (operator === 'neq' || operator === 'is_not') return valA !== valB;
    if (operator === 'contains' || operator === 'contain') return valA.includes(valB);
    if (operator === 'not_contains') return !valA.includes(valB);
    if (operator === 'gt') return Number(a) > Number(b);
    if (operator === 'lt') return Number(a) < Number(b);
    return valA === valB;
  };

  const cEmail = (contact.email || '').toLowerCase().trim();

  switch (field) {
    case 'status':
      return compare(contact.status, value);
    case 'email':
      return compare(contact.email, value);
    case 'first_name':
      return compare(contact.first_name, value);
    case 'last_name':
      return compare(contact.last_name, value);
    case 'name':
      return compare(`${contact.first_name || ''} ${contact.last_name || ''}`.trim(), value);
    case 'city':
      return compare(contact.city, value);
    case 'state':
      return compare(contact.state, value);
    case 'phone':
      return compare(contact.phone, value);
    
    case 'course': {
      // Look in BOTH enrollments and course_events
      const myEnrollments = data.enrollments.filter((e: any) => e.contact_id === contact.id);
      const myEvents = data.courseEvents.filter((e: any) => e.contact_id === contact.id);
      
      const allCourseNames = Array.from(new Set([
        ...myEnrollments.map((e: any) => (e.courses?.name || '').trim()),
        ...myEvents.map((e: any) => (e.metadata?.course_name || '').trim())
      ])).filter(Boolean);

      if (value === 'Nenhum' || value === 'sem_matricula') {
        return allCourseNames.length === 0;
      }

      if (allCourseNames.length === 0) return operator === 'neq';

      const searchTerms = String(value || '').split(',').map((v: string) => v.trim().toLowerCase()).filter(Boolean);
      if (searchTerms.length === 0) return true;

      const matches = allCourseNames.some((cName: string) => {
        const cnLower = cName.toLowerCase();
        return searchTerms.some((term: string) => {
          if (operator === 'contains' || operator === 'contain') {
            return cnLower.includes(term);
          }
          return cnLower === term || cnLower.includes(term);
        });
      });

      return operator === 'neq' ? !matches : matches;
    }
    
    case 'last_course': {
      // Find the single latest course enrollment or started event
      const myEnrollments = data.enrollments
        .filter((e: any) => e.contact_id === contact.id)
        .map((e: any) => ({ name: e.courses?.name || '', date: e.created_at || '' }));

      const myEvents = data.courseEvents
        .filter((e: any) => e.contact_id === contact.id && (e.event_type === 'started' || e.metadata?.course_name))
        .map((e: any) => ({ name: e.metadata?.course_name || '', date: e.created_at || '' }));

      const all = [...myEnrollments, ...myEvents]
        .filter(x => Boolean(x.name))
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

      if (all.length === 0) return false;
      const latestCourse = all[0].name.toLowerCase();
      const searchTerms = String(value || '').split(',').map((v: string) => v.trim().toLowerCase()).filter(Boolean);
      const matches = searchTerms.some((term: string) => latestCourse.includes(term));
      return operator === 'neq' ? !matches : matches;
    }
    
    case 'course_status': {
      const myEnrollments = data.enrollments.filter((e: any) => e.contact_id === contact.id);
      const myEvents = data.courseEvents.filter((e: any) => e.contact_id === contact.id);
      
      const targetVal = String(value || '').toLowerCase();
      
      const hasCompleted = myEnrollments.some((e: any) => e.status === 'completed' || e.progress >= 100 || e.certificate_issued) ||
                           myEvents.some((e: any) => e.event_type === 'test_approved' || e.event_type === 'certificate_issued' || (e.metadata?.progress_percent ?? 0) >= 100);

      const hasInProgress = myEnrollments.some((e: any) => (e.progress > 0 && e.progress < 100) || e.status === 'in_progress') ||
                            myEvents.some((e: any) => (e.metadata?.progress_percent ?? 0) > 0 && (e.metadata?.progress_percent ?? 0) < 100);

      const hasEnrolled = myEnrollments.length > 0 || myEvents.length > 0;

      if (targetVal === 'concluido' || targetVal === 'completed' || targetVal === 'finalizado' || targetVal === 'finished') {
        return hasCompleted;
      }
      if (targetVal === 'em_andamento' || targetVal === 'in_progress') {
        return hasInProgress && !hasCompleted;
      }
      if (targetVal === 'matriculado' || targetVal === 'enrolled') {
        return hasEnrolled;
      }
      if (targetVal === 'nao_iniciado' || targetVal === 'not_started' || targetVal === 'sem_matricula') {
        return !hasEnrolled;
      }
      return false;
    }
    
    case 'payment_order_status': {
      const myPurchases = data.purchasesTable.filter((p: any) => p.contact_id === contact.id);
      const myReporting = data.reportingPurchases.filter((r: any) => (r.contact_email || '').toLowerCase().trim() === cEmail);
      const myWebhooks = data.pagarmeEvents.filter((w: any) => (w.payload?.data?.customer?.email || '').toLowerCase().trim() === cEmail);

      const targetVal = String(value || 'paid').toLowerCase();

      if (targetVal === 'paid' || targetVal.includes('pago')) {
        const hasPaidTable = myPurchases.some((p: any) => ['paid', 'approved', 'pago'].includes((p.status || '').toLowerCase()));
        const hasPaidRep = myReporting.some((r: any) => {
          const ev = String(r.metadata?.event || '').toLowerCase();
          const st = String(r.metadata?.status || '').toLowerCase();
          return ev.includes('paid') || st.includes('paid');
        });
        const hasPaidWh = myWebhooks.some((w: any) => (w.event_type || '').includes('paid'));
        return hasPaidTable || hasPaidRep || hasPaidWh;
      }

      if (targetVal === 'created' || targetVal.includes('pendente')) {
        const hasPendingTable = myPurchases.some((p: any) => ['created', 'pending', 'pendente', 'waiting_payment'].includes((p.status || '').toLowerCase()));
        const hasPendingWh = myWebhooks.some((w: any) => (w.event_type || '').includes('pending'));
        return hasPendingTable || hasPendingWh;
      }

      if (targetVal === 'failed' || targetVal.includes('recusado') || targetVal.includes('erro')) {
        const hasFailedTable = myPurchases.some((p: any) => ['failed', 'refused', 'canceled'].includes((p.status || '').toLowerCase()));
        const hasFailedWh = myWebhooks.some((w: any) => (w.event_type || '').includes('failed'));
        return hasFailedTable || hasFailedWh;
      }

      // Default check: any purchase matching status
      return myPurchases.some((p: any) => compare(p.status, targetVal));
    }

    case 'payment_method': {
      const myReporting = data.reportingPurchases.filter((r: any) => (r.contact_email || '').toLowerCase().trim() === cEmail);
      const myWebhooks = data.pagarmeEvents.filter((w: any) => (w.payload?.data?.customer?.email || '').toLowerCase().trim() === cEmail);
      const targetVal = String(value || '').toLowerCase();
      
      const hasMethodRep = myReporting.some((r: any) => {
        const m = String(r.metadata?.payment_method || '').toLowerCase();
        return m.includes(targetVal);
      });
      const hasMethodWh = myWebhooks.some((w: any) => {
        const m = String(w.payload?.data?.payment_method || w.payload?.data?.charge?.payment_method || '').toLowerCase();
        return m.includes(targetVal);
      });
      return hasMethodRep || hasMethodWh;
    }
    
    case 'email_received': {
      const allDeliveries = [...data.emailSent, ...data.emailOpens, ...data.emailClicks];
      const receivedByMe = allDeliveries.filter((e: any) => {
        const evEmail = (e.payload?.email || '').toLowerCase().trim();
        const evContactId = e.payload?.contact_id;
        const matchesContact = evEmail === cEmail || (evContactId && evContactId === contact.id);
        const dateStr = e.created_at || e.payload?.timestamp;
        return matchesContact && isWithinTimeframe(dateStr);
      });

      if (campaignScope === 'Campanha específica' && campaignId) {
        return receivedByMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }
      return receivedByMe.length > 0;
    }
    
    case 'email_opened': {
      const opensForMe = data.emailOpens.filter((e: any) => {
        const evEmail = (e.payload?.email || '').toLowerCase().trim();
        const evContactId = e.payload?.contact_id;
        const matchesContact = evEmail === cEmail || (evContactId && evContactId === contact.id);
        const dateStr = e.created_at || e.payload?.timestamp;
        return matchesContact && isWithinTimeframe(dateStr);
      });

      if (campaignScope === 'Campanha específica' && campaignId) {
        return opensForMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }
      return opensForMe.length > 0;
    }
    
    case 'email_clicked': {
      const clicksForMe = data.emailClicks.filter((e: any) => {
        const evEmail = (e.payload?.email || '').toLowerCase().trim();
        const evContactId = e.payload?.contact_id;
        const matchesContact = evEmail === cEmail || (evContactId && evContactId === contact.id);
        const dateStr = e.created_at || e.payload?.timestamp;
        return matchesContact && isWithinTimeframe(dateStr);
      });

      if (campaignScope === 'Campanha específica' && campaignId) {
        return clicksForMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }
      return clicksForMe.length > 0;
    }
    
    case 'tag': {
      const myTags = data.contactTags.filter((t: any) => t.contact_id === contact.id);
      return myTags.some((t: any) => {
        const tagName = (t.tags as any)?.name || '';
        return compare(tagName, value);
      });
    }
    
    case 'active_in_list': {
      const myLists = data.listSubs.filter((s: any) => s.contact_id === contact.id && (s.status === 'active' || s.status === 'subscribed'));
      return myLists.some((s: any) => {
        const listName = (s.lists as any)?.name || '';
        return compare(listName, value);
      });
    }
    
    default:
      return compare(contact[field], value);
  }
}
