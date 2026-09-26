const fs = require('fs');
let c = fs.readFileSync('src/worker/engine.ts', 'utf8');

c = c.replace(
  `const { data: runs, error } = await supabase
      .from("flow_runs")
      .select("*, contacts(*)")
      .eq("status", "running")
      .lte("next_execution_at", new Date().toISOString());`,
  `const now = new Date().toISOString();
    const { data: runsToProcess } = await supabase.from("flow_runs").select("id").eq("status", "running").lte("next_execution_at", now);
    if (!runsToProcess || runsToProcess.length === 0) return;
    const ids = runsToProcess.map(r => r.id);
    const { data: runs, error } = await supabase.from("flow_runs").update({ status: "processing" }).in("id", ids).eq("status", "running").select("*, contacts(*)");`
);

c = c.replace(
  `current_node_id: nextNodeId,
             next_execution_at: futureTime,`,
  `status: "running",
             current_node_id: nextNodeId,
             next_execution_at: futureTime,`
);

fs.writeFileSync('src/worker/engine.ts', c);
console.log('Modified engine.ts for concurrency locks safely');
