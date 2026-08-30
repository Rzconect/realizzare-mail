
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const flowId = searchParams.get("flowId");

    if (!flowId) {
      return NextResponse.json({ error: "Missing flowId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: events, error } = await supabase
      .from("inbound_webhook_events")
      .select("event_type, payload")
      .eq("payload->>flow_id", flowId)
      .eq("status", "processed");

    if (error) throw error;

    const { data: logs, error: logsError } = await supabase
      .from("flow_run_logs")
      .select("node_id, action_taken")
      .like("action_taken", "E-mail enviado%");
      
    if (logsError) throw logsError;

    const nodeMetrics: Record<string, any> = {};

    logs?.forEach(log => {
      const nid = log.node_id;
      if (!nodeMetrics[nid]) nodeMetrics[nid] = { sent: 0, opened: new Set(), clicked: new Set() };
      nodeMetrics[nid].sent += 1;
    });

    events?.forEach(ev => {
      const payload: any = ev.payload;
      const nid = payload.node_id;
      const email = payload.email;
      if (nid && email) {
        if (!nodeMetrics[nid]) nodeMetrics[nid] = { sent: 0, opened: new Set(), clicked: new Set() };
        if (ev.event_type === "email.opened") nodeMetrics[nid].opened.add(email);
        else if (ev.event_type === "email.clicked") nodeMetrics[nid].clicked.add(email);
      }
    });

    // Fetch active flow runs to count leads waiting at each node
    const { data: runs, error: runsError } = await supabase
      .from("flow_runs")
      .select("current_node_id")
      .eq("flow_id", flowId)
      .eq("status", "running");
      
    const waitingCounts: Record<string, number> = {};
    if (!runsError && runs) {
      runs.forEach(run => {
        const nid = run.current_node_id;
        if (nid) {
          waitingCounts[nid] = (waitingCounts[nid] || 0) + 1;
        }
      });
    }

    const result: Record<string, any> = {};
    // Ensure nodes with waiting leads but no sent emails are included
    for (const nid of Object.keys(waitingCounts)) {
      if (!nodeMetrics[nid]) {
        nodeMetrics[nid] = { sent: 0, opened: new Set(), clicked: new Set() };
      }
    }

    for (const [nid, m] of Object.entries(nodeMetrics)) {
      const opened = m.opened.size;
      const clicked = m.clicked.size;
      const sent = m.sent;
      result[nid] = {
        sent,
        opened,
        clicked,
        conversions: 0,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
        conversionRate: 0,
        revenue: 0,
        espera: waitingCounts[nid] || 0,
        revisao: 0,
        entregue: sent,
        ignorado: 0
      };
    }

    return NextResponse.json({ metrics: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

