const fs = require('fs');
let c = fs.readFileSync('src/app/api/v1/realizzare-events/route.ts', 'utf8');

const regex = /const subscribeToList = async \([\s\S]*?const handleCourseEnrollmentListTransition = async/m;

const match = c.match(regex);
if (match) {
    const block = `const subscribeToList = async (contactId: string, listId: string) => {
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

    const handleCourseEnrollmentListTransition = async`;
    
    c = c.replace(regex, block);
    fs.writeFileSync('src/app/api/v1/realizzare-events/route.ts', c);
    console.log('Fixed list subscription logic in realizare-events');
} else {
    console.log('Could not find list subscription logic in realizare-events');
}
