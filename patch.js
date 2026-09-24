const fs = require('fs');
let code = fs.readFileSync('src/app/api/webhooks/aws-ses/route.ts', 'utf8');

const bounceLogic = `const email = recipient.emailAddress;
            if (typeof bounce !== "undefined" && bounce.bounceType === "Permanent") {
              const { data: contact } = await supabase.from("contacts").update({ status: "unsubscribed" }).ilike("email", email).select("id").maybeSingle();
              if (contact?.id) await supabase.from("list_subscriptions").update({ status: "unsubscribed" }).eq("contact_id", contact.id);
            }
            if (typeof complaint !== "undefined") {
              const { data: contact } = await supabase.from("contacts").update({ status: "unsubscribed" }).ilike("email", email).select("id").maybeSingle();
              if (contact?.id) await supabase.from("list_subscriptions").update({ status: "unsubscribed" }).eq("contact_id", contact.id);
            }`;

code = code.replace(/const email = recipient\.emailAddress;/g, bounceLogic);
fs.writeFileSync('src/app/api/webhooks/aws-ses/route.ts', code);
