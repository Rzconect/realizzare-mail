import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Missing ID", { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let htmlContent = "<h1>E-mail não encontrado</h1><p>O conteúdo deste e-mail não foi encontrado no sistema.</p>";

    if (id.startsWith("flow-camp-")) {
      // Find the flow node that contains this emailCampaignId in its config
      const { data, error } = await supabase
        .from("flow_nodes")
        .select("config");

      if (data) {
        const node = data.find(n => n.config && n.config.emailCampaignId === id);
        if (node && node.config.htmlContent) {
          htmlContent = node.config.htmlContent;
        }
      }
    } else {
      // Standard campaign
      const { data, error } = await supabase
        .from("campaigns")
        .select("html_content")
        .eq("id", id)
        .single();
      
      if (data && data.html_content) {
        htmlContent = data.html_content;
      }
    }

    // Add a wrapper to ensure it renders correctly in full browser view
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Preview do E-mail</title>
        <style>
          body { margin: 0; padding: 20px; font-family: sans-serif; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;

    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: any) {
    return new NextResponse(`Erro: ${error.message}`, { status: 500 });
  }
}
