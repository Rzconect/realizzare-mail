const fs = require('fs');
let content = fs.readFileSync('src/app/api/webhooks/pagarme/route.ts', 'utf-8');

const logCode = `
    // ALWAYS LOG RAW PAYLOAD FOR DEBUGGING
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");
      await supabase.from("inbound_webhook_events").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        event_type: body?.type || body?.event || "unknown_pagarme",
        payload: body,
        created_at: new Date().toISOString()
      });
    } catch(e) {}
`;

content = content.replace(
  'const eventType = body?.type || body?.event || "order.paid";',
  `${logCode}\n    const eventType = body?.type || body?.event || "order.paid";`
);

fs.writeFileSync('src/app/api/webhooks/pagarme/route.ts', content, 'utf-8');
console.log('Webhook patched for raw logging');
