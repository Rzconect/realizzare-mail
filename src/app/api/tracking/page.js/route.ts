import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("id") || "rz_default";

  const script = `
(function() {
  var siteId = "${siteId}";
  var endpoint = window.location.origin + "/api/tracking/page";

  function sendEvent(type, meta) {
    try {
      var payload = {
        pageId: siteId,
        slug: window.location.pathname.replace(/^\\//, '') || 'home',
        type: type,
        metadata: Object.assign({
          url: window.location.href,
          referrer: document.referrer,
          title: document.title,
          screen: window.innerWidth + "x" + window.innerHeight
        }, meta || {})
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(payload));
      } else {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        });
      }
    } catch(e) {}
  }

  // Auto record page view
  sendEvent("view");

  // Global helper
  window.realizzare = function(action, eventType, meta) {
    if (action === "track" && eventType === "conversion") {
      sendEvent("conversion", meta);
    }
  };

  // Auto listen for conversions on forms and CTA buttons
  document.addEventListener("DOMContentLoaded", function() {
    var forms = document.querySelectorAll("form");
    forms.forEach(function(f) {
      f.addEventListener("submit", function() {
        sendEvent("conversion", { trigger: "form_submit", formId: f.id || f.name });
      });
    });

    var ctas = document.querySelectorAll("[data-realizzare-cta], .btn-convert, .cta-button");
    ctas.forEach(function(b) {
      b.addEventListener("click", function() {
        sendEvent("conversion", { trigger: "button_click", buttonText: b.innerText });
      });
    });
  });
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
