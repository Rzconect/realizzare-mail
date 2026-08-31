
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: eventsData, error } = await supabase
    .from("reporting_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Found ${eventsData.length} events!`);
    if (eventsData.length > 0) {
      console.log(eventsData[0]);
    }
  }
}

main();

