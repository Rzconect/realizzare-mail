import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

export async function POST(req: Request) {
  try {
    const { groups } = await req.json();

    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (!dbUrl) {
      // If no raw DB URL, fallback to naive response for now.
      return NextResponse.json({ count: 0, ids: [] });
    }

    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    if (!groups || groups.length === 0) {
      const { rows } = await pool.query("SELECT id FROM contacts");
      return NextResponse.json({ count: rows.length, ids: rows.map(r => r.id) });
    }

    let query = `SELECT DISTINCT c.id FROM contacts c `;
    const joins = new Set<string>();
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const group of groups) {
      if (!group.rules || group.rules.length === 0) continue;

      const groupConditions: string[] = [];
      
      for (const rule of group.rules) {
        let sql = "";
        
        if (rule.field === "course") {
          joins.add(`LEFT JOIN course_events ce ON ce.contact_id = c.id`);
          if (rule.value === "Nenhum") {
            sql = `ce.id IS NULL`;
          } else {
            const courses = rule.value.split(",");
            sql = `ce.course_name = ANY($${paramIndex})`;
            values.push(courses);
            paramIndex++;
          }
        }
        else if (rule.field === "payment_order_status") {
          joins.add(`LEFT JOIN purchases p_stat ON p_stat.contact_id = c.id`);
          if (rule.value === "paid") {
            sql = `p_stat.status = 'paid' AND p_stat.status != 'pending'`;
          } else {
            sql = `p_stat.status = $${paramIndex}`;
            values.push(rule.value);
            paramIndex++;
          }
        }
        else if (rule.field === "email_received") {
          joins.add(`LEFT JOIN campaign_recipients cr_recv ON cr_recv.contact_id = c.id`);
          sql = `cr_recv.status = 'sent'`;
        }
        else if (rule.field === "email_opened") {
          joins.add(`LEFT JOIN reporting_events re_open ON re_open.contact_email = c.email`);
          sql = `re_open.event_type = 'open'`;
        }
        else if (rule.field === "email_clicked") {
          joins.add(`LEFT JOIN reporting_events re_click ON re_click.contact_email = c.email`);
          sql = `re_click.event_type = 'click'`;
        }
        else if (rule.field === "tag") {
          joins.add(`LEFT JOIN contact_tags ct ON ct.contact_id = c.id`);
          joins.add(`LEFT JOIN tags t ON t.id = ct.tag_id`);
          sql = `t.name = $${paramIndex}`;
          values.push(rule.value);
          paramIndex++;
        }
        else if (rule.field === "active_in_list") {
          joins.add(`LEFT JOIN list_subscribers ls ON ls.contact_id = c.id`);
          joins.add(`LEFT JOIN lists l ON l.id = ls.list_id`);
          sql = `l.name = $${paramIndex} AND ls.status = 'subscribed'`;
          values.push(rule.value);
          paramIndex++;
        }
        else if (rule.field === "status") {
          sql = `c.status = $${paramIndex}`;
          values.push(rule.value);
          paramIndex++;
        }
        else {
          const op = rule.operator === "eq" ? "=" : rule.operator === "neq" ? "!=" : "=";
          sql = `c.${rule.field} ${op} $${paramIndex}`;
          values.push(rule.value);
          paramIndex++;
        }

        if (sql) groupConditions.push("(" + sql + ")");
      }
      
      if (groupConditions.length > 0) {
        const op = group.logicalOperator === "or" ? " OR " : " AND ";
        conditions.push("(" + groupConditions.join(op) + ")");
      }
    }

    if (joins.size > 0) {
      query += Array.from(joins).join(" ") + " ";
    }

    if (conditions.length > 0) {
      query += "WHERE " + conditions.join(" AND ");
    }

    const { rows } = await pool.query(query, values);
    await pool.end();

    return NextResponse.json({ count: rows.length, ids: rows.map((r: any) => r.id) });
    
  } catch (error: any) {
    console.error("Evaluation error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
