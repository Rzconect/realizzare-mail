import { NextResponse } from "next/server";

export async function GET() {
  const jsContent = `
/**
 * Realizzare Mail - Client-Side DataLayer Tracker SDK
 * Version: 1.0.0
 */
(function() {
  if (window.rzMailLoaded) return;
  window.rzMailLoaded = true;

  const ENDPOINT = "https://www.realizzareconect.com.br/api/v1/client-events";

  function getStudentEmail() {
    if (window.rzUser && window.rzUser.email) return window.rzUser.email.trim().toLowerCase();
    try {
      const stored = localStorage.getItem("rz_student_email");
      if (stored) return stored.trim().toLowerCase();
    } catch(e) {}
    return null;
  }

  function getStudentFirstName() {
    return window.rzUser && window.rzUser.first_name ? window.rzUser.first_name : null;
  }

  function sendEvent(eventType, payload) {
    const email = getStudentEmail();
    if (!email) {
      console.warn("[RealizzareMail Tracker] Evento ignorado: E-mail do aluno não identificado em window.rzUser.");
      return;
    }

    const body = {
      event: eventType,
      email: email,
      first_name: getStudentFirstName(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      payload: payload || {}
    };

    const jsonStr = JSON.stringify(body);

    fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: jsonStr,
      keepalive: true
    })
    .then(function(response) {
      if (response.ok) {
        console.log("[RealizzareMail Tracker] Evento '" + eventType + "' enviado com sucesso!");
      } else {
        console.error("[RealizzareMail Tracker] Erro HTTP " + response.status + " ao enviar evento.");
      }
    })
    .catch(function(err) {
      console.error("[RealizzareMail Tracker] Erro na requisição do evento:", err);
    });
  }

  window.rzMail = {
    track: function(eventType, data) {
      sendEvent(eventType, data);
    },

    // Smart milestone progress tracker (prevents request flooding)
    trackProgress: function(options) {
      var courseId = options.course_id || options.courseId;
      var courseName = options.course_name || options.courseName || "Curso Realizzare";
      var completedLessons = parseInt(options.completed_lessons || options.completedLessons || 1, 10);
      var totalLessons = parseInt(options.total_lessons || options.totalLessons || 1, 10);
      var isPaidCourse = !!options.is_paid;

      var percent = Math.min(100, Math.max(0, Math.round((completedLessons / totalLessons) * 100)));
      if (isNaN(percent)) percent = 100;

      var email = getStudentEmail();
      var keyPrefix = "rz_prog_" + (email || "anon") + "_" + courseId;

      var hasStarted = sessionStorage.getItem(keyPrefix + "_started");
      var hasHalf = sessionStorage.getItem(keyPrefix + "_50");
      var hasCompleted = sessionStorage.getItem(keyPrefix + "_100");

      var shouldSend = false;
      var milestoneName = "Curso em Andamento";

      if (!hasStarted) {
        shouldSend = true;
        milestoneName = "Curso Iniciado";
        sessionStorage.setItem(keyPrefix + "_started", "true");
      } else if (percent >= 50 && percent < 100 && !hasHalf) {
        shouldSend = true;
        milestoneName = "Em Andamento (50%)";
        sessionStorage.setItem(keyPrefix + "_50", "true");
      } else if (percent >= 100 && !hasCompleted) {
        shouldSend = true;
        milestoneName = "Curso Concluído";
        sessionStorage.setItem(keyPrefix + "_100", "true");
      }

      if (shouldSend) {
        sendEvent("course.progress", {
          course_id: String(courseId),
          course_name: courseName,
          progress_percent: percent,
          completed_lessons: completedLessons,
          total_lessons: totalLessons,
          milestone: milestoneName,
          is_paid_course: isPaidCourse
        });
      }
    }
  };

  // Auto-listen for HTML click attributes [data-rz-event]
  document.addEventListener("click", function(e) {
    var target = e.target.closest("[data-rz-event]");
    if (target) {
      var eventType = target.getAttribute("data-rz-event");
      var sku = target.getAttribute("data-rz-sku");
      var itemTitle = target.getAttribute("data-rz-item");
      var courseId = target.getAttribute("data-rz-course-id");
      var pageUrl = target.getAttribute("data-rz-url") || window.location.href;

      window.rzMail.track("user.action", {
        action_type: eventType,
        sku: sku,
        item_title: itemTitle,
        course_id: courseId,
        page_url: pageUrl
      });
    }
  }, true);

  console.log("[RealizzareMail Tracker] SDK iniciado com sucesso.");
})();
`;

  return new NextResponse(jsContent, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
