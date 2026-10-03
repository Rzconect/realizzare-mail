const fs = require('fs');
let f = fs.readFileSync('src/app/api/segments/evaluate/route.ts', 'utf8');

// Add emailSent fetch
f = f.replace(
  `  const { data: emailOpens } = await supabase
    .from('inbound_webhook_events')
    .select('payload')
    .in('event_type', ['email.open', 'email.opened']);`,
  `  const { data: emailSent } = await supabase
    .from('inbound_webhook_events')
    .select('payload')
    .in('event_type', ['email.delivered']);

  const { data: emailOpens } = await supabase
    .from('inbound_webhook_events')
    .select('payload')
    .in('event_type', ['email.open', 'email.opened']);`
);

// Pass emailSent to evaluateRule
f = f.replace(
  `        pagarmeEvents: pagarmeEvents ?? [],
        emailOpens: emailOpens ?? [],`,
  `        pagarmeEvents: pagarmeEvents ?? [],
        emailSent: emailSent ?? [],
        emailOpens: emailOpens ?? [],`
);

// Update email_received to check emailSent too
f = f.replace(
  `    case 'email_received': {
      // Anyone who opened is a superset of "received"
      // Also check direct opens
      const receivedByMe = [...data.emailOpens, ...data.emailClicks].filter((e: any) =>`,
  `    case 'email_received': {
      // Anyone who opened is a superset of "received"
      // Also check direct opens
      const receivedByMe = [...data.emailSent, ...data.emailOpens, ...data.emailClicks].filter((e: any) =>`
);

fs.writeFileSync('src/app/api/segments/evaluate/route.ts', f);
console.log('Updated evaluate route to check email.delivered');
