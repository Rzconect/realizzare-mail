"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Settings2, CheckCircle2, Mail, Bell, Sparkles, BookOpen, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function PreferencesContent() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email") || "aluno@realizzarecursos.com.br";

  const [email, setEmail] = useState(rawEmail);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preference Categories States
  const [prefCursos, setPrefCursos] = useState(true);
  const [prefPromos, setPrefPromos] = useState(true);
  const [prefDicas, setPrefDicas] = useState(true);
  const [prefAvisos, setPrefAvisos] = useState(true);

  // Load custom branding from localStorage
  const [config, setConfig] = useState<any>({
    title: "Preferências de Comunicação",
    text: "Gerencie sua inscrição e escolha quais categorias de conteúdo deseja continuar recebendo.",
    btnText: "Salvar Preferências",
    color: "#4f46e5"
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("realizzare_consent_pages_config");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.preferencias) {
            setConfig({
              title: parsed.preferencias.title || "Preferências de Comunicação",
              text: parsed.preferencias.text || "Gerencie sua inscrição e escolha quais categorias de conteúdo deseja continuar recebendo.",
              btnText: parsed.preferencias.btnText || "Salvar Preferências",
              color: parsed.color || "#4f46e5"
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const supabase = createClient();
      // If user turned all OFF, set status to unsubscribed, else active
      const allOff = !prefCursos && !prefPromos && !prefDicas && !prefAvisos;
      await supabase
        .from("contacts")
        .update({ status: allOff ? "unsubscribed" : "active" })
        .eq("email", email);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error("Erro ao salvar preferencias:", err);
    } finally {
      setIsLoading(false);
    }
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
            <Settings2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-xs text-white/80 max-w-sm mx-auto font-medium leading-relaxed">
            {config.text}
          </p>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSavePreferences} className="p-6 space-y-6">
          {/* Target Email Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Configurando preferências para:</span>
            <span className="text-xs font-bold text-slate-800 font-mono">{email}</span>
          </div>

          {isSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Suas preferências foram salvas com sucesso!</span>
            </div>
          )}

          {/* Preferences Checklist */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Categorias de Conteúdo</h2>

            {/* Category 1 */}
            <label className="flex items-start gap-3 p-3.5 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all bg-white hover:bg-slate-50/50">
              <input
                type="checkbox"
                checked={prefCursos}
                onChange={(e) => setPrefCursos(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Novos Cursos & Lançamentos</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Avisos sobre novos treinamentos, matrículas abertas e novos módulos na plataforma.
                </p>
              </div>
            </label>

            {/* Category 2 */}
            <label className="flex items-start gap-3 p-3.5 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all bg-white hover:bg-slate-50/50">
              <input
                type="checkbox"
                checked={prefPromos}
                onChange={(e) => setPrefPromos(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Ofertas & Promoções Exclusivas</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cupons de desconto, campanhas especiais de Black Friday e bolsas de estudo.
                </p>
              </div>
            </label>

            {/* Category 3 */}
            <label className="flex items-start gap-3 p-3.5 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all bg-white hover:bg-slate-50/50">
              <input
                type="checkbox"
                checked={prefDicas}
                onChange={(e) => setPrefDicas(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Conteúdos & Dicas Acadêmicas</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Artigos, orientações de estudos e materiais gratuitos para alavancar sua carreira.
                </p>
              </div>
            </label>

            {/* Category 4 */}
            <label className="flex items-start gap-3 p-3.5 border border-slate-200 hover:border-slate-300 rounded-2xl cursor-pointer transition-all bg-white hover:bg-slate-50/50">
              <input
                type="checkbox"
                checked={prefAvisos}
                onChange={(e) => setPrefAvisos(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Bell className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Avisos Transacionais & Certificados</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Confirmação de matrícula, notas, liberação e emissão de certificados digitais.
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: config.color || "#4f46e5" }}
            >
              {isLoading ? "Salvando..." : config.btnText || "Salvar Preferências"}
            </button>

            <div className="text-center pt-2">
              <Link
                href={`/unsubscribe?email=${encodeURIComponent(email)}`}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
              >
                Deseja cancelar todas as inscrições? Clique para descadastrar-se de tudo
              </Link>
            </div>
          </div>
        </form>

        {/* Footer Branding */}
        <div className="bg-slate-100/70 border-t border-slate-200 p-4 text-center text-[11px] text-slate-400 font-medium">
          Realizzare Cursos • Plataforma de Ensino a Distância
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-xs text-slate-500 font-bold animate-pulse">Carregando preferências...</div>
      </div>
    }>
      <PreferencesContent />
    </Suspense>
  );
}
