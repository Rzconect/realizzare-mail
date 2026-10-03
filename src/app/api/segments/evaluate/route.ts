import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { groups } = await req.json();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Fetch all contacts first
  const { data: allContacts } = await supabase.from('contacts').select('id, email, status, first_name, last_name, phone, city, state, created_at').limit(5000);
  
  if (!groups || groups.length === 0) {
    return NextResponse.json({ count: allContacts?.length ?? 0, ids: allContacts?.map(c => c.id) ?? [] });
  }
  
  // For each contact, evaluate all group conditions
  // Fetch supporting data upfront for efficiency:
  const { data: courseEvents } = await supabase.from('course_events').select('contact_id, course_id, event_type, progress_percent, metadata, created_at');
  const { data: purchases } = await supabase.from('reporting_events').select('contact_email, event_type, metadata, created_at').eq('event_type', 'purchase');
  
  const { data: pagarmeEvents } = await supabase
    .from('inbound_webhook_events')
    .select('payload, event_type, created_at')
    .in('event_type', ['order.paid', 'charge.paid', 'charge.pending', 'order.payment_failed', 'charge.payment_failed']);

  const { data: emailSent } = await supabase
    .from('inbound_webhook_events')
    .select('payload')
    .in('event_type', ['email.delivered']);

  const { data: emailOpens } = await supabase
    .from('inbound_webhook_events')
    .select('payload')
    .in('event_type', ['email.open', 'email.opened']);

  const { data: emailClicks } = await supabase
    .from('inbound_webhook_events')
    .select('payload')
    .in('event_type', ['email.click', 'email.clicked']);
    
  const { data: contactTags } = await supabase.from('contact_tags').select('contact_id, tag_id, tags(name)');
  const { data: listSubs } = await supabase.from('list_subscriptions').select('contact_id, list_id, status, lists(name)');
  
  const qualifiedIds: string[] = [];
  
  for (const contact of (allContacts ?? [])) {
    // A contact qualifies if ALL groups pass (groups are AND-ed)
    // Within a group, rules use the group's logicalOperator (AND/OR)
    let contactQualifies = true;
    
    for (const group of groups) {
      if (!group.rules || group.rules.length === 0) continue;
      
      const op = group.logicalOperator === 'or' ? 'some' : 'every';
      const groupPasses = group.rules[op]((rule: any) => evaluateRule(rule, contact, {
        courseEvents: courseEvents ?? [],
        purchases: purchases ?? [],
        pagarmeEvents: pagarmeEvents ?? [],
        emailSent: emailSent ?? [],
        emailOpens: emailOpens ?? [],
        emailClicks: emailClicks ?? [],
        contactTags: contactTags ?? [],
        listSubs: listSubs ?? [],
      }));
      
      if (!groupPasses) {
        contactQualifies = false;
        break;
      }
    }
    
    if (contactQualifies) qualifiedIds.push(contact.id);
  }
  
  return NextResponse.json({ count: qualifiedIds.length, ids: qualifiedIds });
}

function evaluateRule(rule: any, contact: any, data: any): boolean {
  // Normalize field names from frontend aliases
  const normalizedField = rule.field === 'courseStatus' ? 'course_status' : rule.field;
  const { operator, value } = rule;
  const field = normalizedField;

  // Try parsing value if it's JSON (used by engagement fields)
  let parsedValue = value;
  try {
    if (typeof value === 'string' && value.startsWith('{')) {
      parsedValue = JSON.parse(value);
    }
  } catch (e) {}


  const campaignId = parsedValue?.specificCampaign || rule.campaignId;
  const campaignScope = parsedValue?.campaignScope || 'Qualquer campanha';
  const timeframeMode = parsedValue?.timeframeMode || 'last_days';
  const daysCount = parseInt(parsedValue?.daysCount || '30', 10);
  
  const isWithinTimeframe = (dateStr: string) => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    if (timeframeMode === 'last_days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysCount);
      return date >= cutoff;
    }
    // Could add custom date range here later
    return true;
  };


  
  const compare = (a: any, b: any): boolean => {
    if (operator === 'eq' || operator === 'is' || operator === 'equal') return String(a).toLowerCase() === String(b).toLowerCase();
    if (operator === 'neq' || operator === 'is_not') return String(a).toLowerCase() !== String(b).toLowerCase();
    if (operator === 'contains' || operator === 'contain') return String(a).toLowerCase().includes(String(b).toLowerCase());
    if (operator === 'not_contains') return !String(a).toLowerCase().includes(String(b).toLowerCase());
    if (operator === 'gt') return Number(a) > Number(b);
    if (operator === 'lt') return Number(a) < Number(b);
    return String(a) === String(b);
  };
  
  switch (field) {
    case 'status':
      return compare(contact.status, value);
    case 'email':
      return compare(contact.email, value);
    case 'first_name':
      return compare(contact.first_name, value);
    case 'last_name':
      return compare(contact.last_name, value);
    case 'city':
      return compare(contact.city, value);
    case 'state':
      return compare(contact.state, value);
    case 'phone':
      return compare(contact.phone, value);
    
    case 'course': {
      const myEvents = data.courseEvents.filter((e: any) => e.contact_id === contact.id);
      if (value === 'Nenhum' || value === 'sem_matricula') return myEvents.length === 0;
      const courseNames = value.split(',').map((v: string) => v.trim().toLowerCase());
      return myEvents.some((e: any) => courseNames.includes((e.metadata?.course_name || '').toLowerCase()));
    }
    
    case 'last_course': {
      const myEvents = data.courseEvents
        .filter((e: any) => e.contact_id === contact.id)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (myEvents.length === 0) return false;
      const lastCourseName = (myEvents[0].metadata?.course_name || '').toLowerCase();
      const courseNames = value.split(',').map((v: string) => v.trim().toLowerCase());
      return courseNames.includes(lastCourseName);
    }
    
    case 'course_status': {
      const myEvents = data.courseEvents.filter((e: any) => e.contact_id === contact.id);
      if (value === 'matriculado' || value === 'enrolled') return myEvents.length > 0;
      if (value === 'concluido' || value === 'completed' || value === 'finalizado' || value === 'finished') {
        return myEvents.some((e: any) => e.event_type === 'test_approved' || (e.progress_percent ?? 0) >= 100);
      }
      if (value === 'em_andamento' || value === 'in_progress') {
        return myEvents.some((e: any) => (e.progress_percent ?? 0) > 0 && (e.progress_percent ?? 0) < 100 && e.event_type !== 'test_approved');
      }
      if (value === 'nao_iniciado' || value === 'not_started') {
        return myEvents.some((e: any) => (e.progress_percent ?? 0) === 0);
      }
      return false;
    }
    
    case 'payment_order_status': {
      const myPurchases = data.purchases.filter((p: any) => p.contact_email === contact.email);
      
      // Also check inbound_webhook_events (raw pagar.me webhooks)
      const myWebhookEvents = data.pagarmeEvents.filter((e: any) => {
        const email = e.payload?.data?.customer?.email || '';
        return email.toLowerCase() === (contact.email || '').toLowerCase();
      });

      const allPaymentEvents = [...myPurchases, ...myWebhookEvents.map((e: any) => ({
        contact_email: contact.email,
        metadata: { event: e.event_type }
      }))];

      if (allPaymentEvents.length === 0) return false;
      
      const targetVal = (value || '').toLowerCase();
      
      return allPaymentEvents.some((p: any) => {
        const eventName = (p.metadata?.event || '').toLowerCase();
        
        if (targetVal === 'paid') {
          // Match any paid event variants
          return eventName.includes('paid') || eventName.includes('order.paid') || eventName.includes('charge.paid');
        }
        if (targetVal === 'pending') {
          return eventName.includes('pending') || eventName.includes('charge.pending');
        }
        if (targetVal === 'failed') {
          return eventName.includes('failed');
        }
        // Generic match
        return eventName.includes(targetVal);
      });
    }
    
    case 'email_received': {
      // Anyone who opened is a superset of "received"
      // Also check direct opens
      const receivedByMe = [...data.emailSent, ...data.emailOpens, ...data.emailClicks].filter((e: any) =>
        (e.payload?.email === contact.email || e.payload?.contact_id === contact.id) && isWithinTimeframe(e.created_at)
      );
      if (campaignScope === 'Campanha específica' && campaignId) {
        return receivedByMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }
      return receivedByMe.length > 0;
    }
    
    case 'email_opened': {
      const opensForMe = data.emailOpens.filter((e: any) =>
        (e.payload?.email === contact.email || e.payload?.contact_id === contact.id) && isWithinTimeframe(e.created_at)
      );
      if (campaignScope === 'Campanha específica' && campaignId) {
        return opensForMe.some((e: any) => e.payload?.campaign_id === campaignId);
      }
      return opensForMe.length > 0;
    }
    
    case 'email_clicked': {
      const clicksForMe = data.emailClicks.filter((e: any) =>
        (e.payload?.email === contact.email || e.payload?.contact_id === contact.id) && isWithinTimeframe(e.created_at)
      );
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
      // Generic contact field
      return compare(contact[field], value);
  }
}
