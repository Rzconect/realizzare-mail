const fs = require('fs');
let content = fs.readFileSync('src/app/api/campaigns/send/route.ts', 'utf-8');

const targetLogicOld = `      // 1. Check for ||IDS|| payload in target_list
      if (targetListStr.includes("||IDS||")) {
        const idsPart = targetListStr.split("||IDS||")[1];
        const rawIds = idsPart ? idsPart.split(",").filter(Boolean) : [];

        const contactIds = rawIds
          .filter((id: string) => id.startsWith("contact-"))
          .map((id: string) => id.replace("contact-", ""));

        const listIds = rawIds.filter((id: string) => !id.startsWith("contact-") && !id.startsWith("seg-"));

        // Fetch emails from specific contact IDs
        if (contactIds.length > 0) {
          const { data: directContacts } = await supabase
            .from("contacts")
            .select("email, status")
            .in("id", contactIds);

          (directContacts || []).forEach((c: any) => {
            if (c.email && c.status !== "unsubscribed") {
              recipients.push(c.email.trim().toLowerCase());
            }
          });
        }

        // Fetch emails from lists
        if (listIds.length > 0) {
          const { data: listSubs } = await supabase
            .from("list_subscriptions")
            .select("contacts(email, status)")
            .in("list_id", listIds)
            .eq("status", "subscribed");

          (listSubs || []).forEach((s: any) => {
            if (s.contacts?.status === "active" && s.contacts?.email) {
              recipients.push(s.contacts.email.trim().toLowerCase());
            }
          });
        }
      }`;

const targetLogicNew = `      // 1. Check for ||IDS|| payload in target_list
      let excludeEmails: string[] = [];
      if (targetListStr.includes("||IDS||")) {
        const [mainPart, excludePart] = targetListStr.split("||EXCLUDE_IDS||");
        const idsPart = mainPart.split("||IDS||")[1];
        
        const processIds = async (idsString: string, outputArray: string[]) => {
            const rawIds = idsString ? idsString.split(",").filter(Boolean) : [];
            const contactIds = rawIds.filter((id: string) => id.startsWith("contact-")).map((id: string) => id.replace("contact-", ""));
            const listIds = rawIds.filter((id: string) => !id.startsWith("contact-") && !id.startsWith("seg-"));

            if (contactIds.length > 0) {
              const { data: directContacts } = await supabase.from("contacts").select("email, status").in("id", contactIds);
              (directContacts || []).forEach((c: any) => {
                if (c.email && c.status !== "unsubscribed") outputArray.push(c.email.trim().toLowerCase());
              });
            }
            if (listIds.length > 0) {
              const { data: listSubs } = await supabase.from("list_subscriptions").select("contacts(email, status)").in("list_id", listIds).eq("status", "subscribed");
              (listSubs || []).forEach((s: any) => {
                if (s.contacts?.status === "active" && s.contacts?.email) outputArray.push(s.contacts.email.trim().toLowerCase());
              });
            }
        };

        if (idsPart) await processIds(idsPart, recipients);
        if (excludePart) await processIds(excludePart, excludeEmails);
      }`;

content = content.replace(targetLogicOld, targetLogicNew);

const deduplicateOld = `    // Deduplicate recipients
    recipients = Array.from(new Set(recipients.map((e: string) => e.trim().toLowerCase())));`;

const deduplicateNew = `    // Deduplicate recipients and apply exclude filter
    const excludeSet = new Set(typeof excludeEmails !== "undefined" ? excludeEmails : []);
    recipients = Array.from(new Set(recipients.map((e: string) => e.trim().toLowerCase()))).filter(e => !excludeSet.has(e));`;

content = content.replace(deduplicateOld, deduplicateNew);

fs.writeFileSync('src/app/api/campaigns/send/route.ts', content, 'utf-8');
console.log('Done patch 7.');
