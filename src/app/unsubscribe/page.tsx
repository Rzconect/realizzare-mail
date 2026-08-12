"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Mail, RefreshCw, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email") || "aluno@realizzarecursos.com.br";
  const campaignId = searchParams.get("campaign") || searchParams.get("id");

  const [email, setEmail] = useState(rawEmail);
  const [isUnsubscribed, setIsUnsubscribed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Load custom branding from localStorage
  const [config, setConfig] = useState<any>({
    title: "Inscrição Cancelada com Sucesso",
    text: "Lamentamos ver você partir. Seu e-mail foi removido de nossas listas de transmissão.",
    btnText: "Cancelar Inscrição",
    color: "#4f46e5"
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("realizzare_consent_pages_config");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.cancelamento) {
            setConfig({
              title: parsed.cancelamento.title || "Inscrição Cancelada com Sucesso",
              text: parsed.cancelamento.text || "Lamentamos ver você partir. Seu e-mail foi removido de nossas listas de transmissão.",
              btnText: parsed.cancelamento.btnText || "Cancelar Inscrição",
              color: parsed.color || "#4f46e5"
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Auto unsubscribe contact in Supabase if real contact
    const executeUnsubscribe = async () => {
      if (!rawEmail) return;
      setIsLoading(true);
      try {
        const supabase = createClient();
        await supabase
          .from("contacts")
          .update({ status: "unsubscribed" })
          .eq("email", rawEmail);
      } catch (err) {
        console.error("Erro ao cancelar inscricao:", err);
      } finally {
        setIsLoading(false);
      }
    };

    executeUnsubscribe();
  }, [rawEmail]);

  const handleResubscribe = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from("contacts")
        .update({ status: "active" })
        .eq("email", email);
      setIsUnsubscribed(false);
    } catch (err) {
      console.error("Erro ao reativar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackReason) return;

    const newFeedback = {
      id: `fb-${Date.now()}`,
      email: email,
      reason: feedbackReason,
      campaign: campaignId ? `Campanha #${campaignId}` : "Newsletter Geral",
      created_at: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("realizzare_unsubscribe_feedbacks");
        let list = [];
        if (stored) {
          try { list = JSON.parse(stored); } catch (e) {}
        }
        list.unshift(newFeedback);
        localStorage.setItem("realizzare_unsubscribe_feedbacks", JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }

    setFeedbackSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div
          className="p-6 text-white text-center space-y-2 transition-colors"
          style={{ backgroundColor: config.color || "#4f46e5" }}
        >
          <div className="inline-flex p-3 bg-white/10 rounded-full backdrop-blur-md mb-1">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-xs text-white/80 max-w-sm mx-auto font-medium leading-relaxed">
            {config.text}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Status Alert Box */}
          {isUnsubscribed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-emerald-900">
                  O endereço <span className="underline font-mono">{email}</span> foi descadastrado.
                </p>
                <p className="text-emerald-700">
                  Você não receberá mais boletins informativos ou e-mails de marketing da Realizzare Cursos.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-indigo-900">
                  Inscrição Reativada com Sucesso!
                </p>
                <p className="text-indigo-700">
                  O e-mail <span className="font-mono">{email}</span> voltou a estar ativo em nossa base.
                </p>
              </div>
            </div>
          )}

          {/* Undo / Re-subscribe Option */}
          {isUnsubscribed && (
            <div className="text-center pt-2 pb-2 border-b border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Foi um engano ou clicou sem querer?</p>
              <button
                onClick={handleResubscribe}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Reativar minha inscrição</span>
              </button>
            </div>
          )}

          {/* Feedback Form */}
          {isUnsubscribed && !feedbackSent && (
            <form onSubmit={handleSendFeedback} className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <span>Por que você decidiu se descadastrar? (Opcional)</span>
              </div>

              <div className="space-y-2 text-xs text-slate-650">
                {[
                  "Recebo e-mails com muita frequência",
                  "O conteúdo não é relevante para meu momento",
                  "Nunca me cadastrei nesta lista",
                  "Prefiro acompanhar apenas pelo site / redes sociais",
                  "Outro motivo"
                ].map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="unsubscribe_reason"
                      value={reason}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>

              {feedbackReason && (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Enviar Feedback
                </button>
              )}
            </form>
          )}

          {feedbackSent && (
            <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-600 font-medium animate-fadeIn">
              Obrigado pelo seu feedback! Ele nos ajuda a melhorar nossos conteúdos.
            </div>
          )}

          {/* Manage Preferences Link */}
          <div className="pt-2 text-center text-xs">
            <Link
              href={`/preferences?email=${encodeURIComponent(email)}`}
              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
            >
              Prefere ajustar quais e-mails recebe? Clique aqui para gerenciar preferências
            </Link>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="bg-slate-100/70 border-t border-slate-200 p-4 text-center text-[11px] text-slate-400 font-medium">
          Realizzare Cursos • Plataforma de Ensino a Distância
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-xs text-slate-500 font-bold animate-pulse">Carregando página de descadastro...</div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
