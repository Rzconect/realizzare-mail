import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      body = {};
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

    // Handle AWS SNS SubscriptionConfirmation
    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      console.log("Auto-confirming AWS SNS Subscription:", body.SubscribeURL);
      await fetch(body.SubscribeURL);
      return NextResponse.json({ status: "confirmed" });
    }

    // Handle Notification
    if (body.Type === "Notification") {
      let message: any = {};
      try {
        message = typeof body.Message === "string" ? JSON.parse(body.Message) : body.Message;
      } catch (e) {
        message = body;
      }

      const eventType = message.notificationType || message.eventType || "unknown";
      const mail = message.mail || {};
      const headers = mail.headers || [];

      // Extract tags (AWS SES converts X-SES-MESSAGE-TAGS into mail.tags)
      const tags = mail.tags || {};
      let campaignId = tags.campaign_id ? tags.campaign_id[0] : "";
      let contactId = tags.contact_id ? tags.contact_id[0] : "";

      // Fallback to headers if present (for Bounces/Deliveries)
      if (!campaignId || !contactId) {
        headers.forEach((h: any) => {
          if (h.name?.toLowerCase() === "x-campaign-id" && !campaignId) campaignId = h.value;
          if (h.name?.toLowerCase() === "x-contact-id" && !contactId) contactId = h.value;
        });
      }

      if (supabase) {
        if (eventType === "Open") {
          const emailAddress = mail.destination ? mail.destination[0] : "";
          if (campaignId && emailAddress) {
            const { data: existing } = await supabase.from("inbound_webhook_events")
              .select("id")
              .eq("event_type", "email.opened")
              .eq("payload->>campaign_id", campaignId)
              .eq("payload->>email", emailAddress)
              .limit(1);

            if (!existing || existing.length === 0) {
              const { data: camp } = await supabase.from("campaigns").select("open_count").eq("id", campaignId).maybeSingle();
              if (camp) {
                await supabase.from("campaigns").update({ open_count: (camp.open_count || 0) + 1 }).eq("id", campaignId);
              }
            }
          }
          await supabase.from("inbound_webhook_events").insert({
            org_id: "00000000-0000-0000-0000-000000000001",
            source: "aws_ses",
            event_type: "email.opened",
            payload: {
              event: "email.opened",
              email: mail.destination ? mail.destination[0] : "",
              campaign_id: campaignId,
              contact_id: contactId,
              timestamp: new Date().toISOString()
            },
            status: "processed"
          });
        } else if (eventType === "Click") {
          const emailAddress = mail.destination ? mail.destination[0] : "";
          if (campaignId && emailAddress) {
            const { data: existing } = await supabase.from("inbound_webhook_events")
              .select("id")
              .eq("event_type", "email.clicked")
              .eq("payload->>campaign_id", campaignId)
              .eq("payload->>email", emailAddress)
              .limit(1);

            if (!existing || existing.length === 0) {
              const { data: camp } = await supabase.from("campaigns").select("click_count").eq("id", campaignId).maybeSingle();
              if (camp) {
                await supabase.from("campaigns").update({ click_count: (camp.click_count || 0) + 1 }).eq("id", campaignId);
              }
            }
          }
          await supabase.from("inbound_webhook_events").insert({
            org_id: "00000000-0000-0000-0000-000000000001",
            source: "aws_ses",
            event_type: "email.clicked",
            payload: {
              event: "email.clicked",
              email: mail.destination ? mail.destination[0] : "",
              campaign_id: campaignId,
              contact_id: contactId,
              link: message.click ? message.click.link : "",
              timestamp: new Date().toISOString()
            },
            status: "processed"
          });
        } else if (eventType === "Bounce") {
          const bounce = message.bounce || {};
          const bouncedRecipients = bounce.bouncedRecipients || [];

          if (campaignId) {
            const { data: camp } = await supabase.from("campaigns").select("bounce_count").eq("id", campaignId).maybeSingle();
            if (camp) {
              await supabase.from("campaigns").update({ bounce_count: (camp.bounce_count || 0) + bouncedRecipients.length }).eq("id", campaignId);
            }
          }

          for (const recipient of bouncedRecipients) {
            const email = recipient.emailAddress;
            await supabase.from("inbound_webhook_events").insert({
              org_id: "00000000-0000-0000-0000-000000000001",
              source: "aws_ses",
              event_type: "email.bounce",
              payload: {
                event: "email.bounce",
                email,
                campaign_id: campaignId,
                contact_id: contactId,
                bounce_type: bounce.bounceType,
                sub_type: bounce.bounceSubType,
                timestamp: new Date().toISOString()
              },
              status: "processed"
            });
          }
        } else if (eventType === "Complaint") {
          const complaint = message.complaint || {};
          const complainedRecipients = complaint.complainedRecipients || [];

          if (campaignId) {
            const { data: camp } = await supabase.from("campaigns").select("spam_count").eq("id", campaignId).maybeSingle();
            if (camp) {
              await supabase.from("campaigns").update({ spam_count: (camp.spam_count || 0) + complainedRecipients.length }).eq("id", campaignId);
            }
          }

          for (const recipient of complainedRecipients) {
            const email = recipient.emailAddress;
            await supabase.from("inbound_webhook_events").insert({
              org_id: "00000000-0000-0000-0000-000000000001",
              source: "aws_ses",
              event_type: "email.spam_complaint",
              payload: {
                event: "email.spam_complaint",
                email,
                campaign_id: campaignId,
                contact_id: contactId,
                feedback_type: complaint.complaintFeedbackType,
                timestamp: new Date().toISOString()
              },
              status: "processed"
            });
          }
        } else if (eventType === "Delivery") {
          await supabase.from("inbound_webhook_events").insert({
            org_id: "00000000-0000-0000-0000-000000000001",
            source: "aws_ses",
            event_type: "email.delivered",
            payload: {
              event: "email.delivered",
              campaign_id: campaignId,
              contact_id: contactId,
              recipients: mail.destination,
              timestamp: new Date().toISOString()
            },
            status: "processed"
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("AWS SES Webhook error:", err);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
