"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sliders, CheckCircle2, XCircle, Mail, Loader2, Save, Edit2, Check, ArrowRight } from "lucide-react";

function PreferencesContent() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(rawEmail || "contato@realizzarecursos.com.br");
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(rawEmail || "contato@realizzarecursos.com.br");

  const [lists, setLists] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({});
  const [isContactRegistered, setIsContactRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Record real page visit
  useEffect(() => {
    fetch("/api/tracking/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId: "page-preferences-01",
        slug: "preferences",
        type: "view",
        email: email || ""
      })
    }).catch(() => {});
  }, []);

  // 2. Load preferences data from API
  const loadPreferences = async (targetEmail: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/preferences?email=${encodeURIComponent(targetEmail || "")}`);
      const data = await res.json();

      if (data.success) {
        setLists(data.lists || []);
        setSubscriptions(data.subscriptions || {});
        setIsContactRegistered(!!data.contact);
      }
    } catch (e) {
      console.error("Erro ao carregar preferências:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences(email);
  }, []);

  const handleApplyEmailChange = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tempEmail.trim() || !tempEmail.includes("@")) {
      setMessage({ type: "error", text: "Por favor, digite um e-mail válido." });
      return;
    }
    const clean = tempEmail.trim().toLowerCase();
    setEmail(clean);
    setEditingEmail(false);
    loadPreferences(clean);
  };

  const toggleList = (listId: string) => {
    setSubscriptions((prev) => ({ ...prev, [listId]: !prev[listId] }));
  };

  const handleSave = async () => {
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Por favor, informe um endereço de e-mail válido." });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          subscriptions
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsContactRegistered(true);
        setMessage({ type: "success", text: "Suas preferências foram salvas com sucesso!" });
      } else {
        setMessage({ type: "error", text: data.error || "Ocorreu um erro ao salvar suas preferências." });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Falha de conexão ao salvar preferências." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = () => {
    const unsubAll: Record<string, boolean> = {};
    lists.forEach((l) => (unsubAll[l.id] = false));
    setSubscriptions(unsubAll);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Carregando suas preferências...</p>
      </div>
    );
  }

  const initialLetter = email ? email[0].toUpperCase() : "R";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-6 bg-indigo-600 text-white text-center space-y-2">
          <div className="inline-flex p-3 bg-white/10 rounded-full mb-1 backdrop-blur-xs">
            <Sliders className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Gerenciar Preferências</h1>
          <p className="text-xs text-indigo-100 max-w-sm mx-auto font-medium">
            Selecione o tipo de conteúdo e comunicados que deseja receber da Realizzare.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* E-mail Box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Endereço de E-mail
              </span>
              {isContactRegistered ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" /> Cadastrado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  Configuração
                </span>
              )}
            </div>

            {editingEmail ? (
              <form onSubmit={handleApplyEmailChange} className="flex items-center gap-2 pt-1">
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 bg-white border border-indigo-400 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempEmail(email);
                    setEditingEmail(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1.5"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {initialLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate font-mono">{email}</p>
                    <p className="text-[10px] text-slate-400">Suas inscrições ativas</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTempEmail(email);
                    setEditingEmail(true);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 shrink-0"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Alterar</span>
                </button>
              </div>
            )}
          </div>

          {/* Subscriptions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Suas Inscrições
              </h3>
              <button
                type="button"
                onClick={handleUnsubscribeAll}
                className="text-[11px] text-slate-400 hover:text-red-500 transition-colors"
              >
                Desmarcar todas
              </button>
            </div>

            {lists.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma categoria configurada.</p>
            ) : (
              <div className="space-y-2.5">
                {lists.map((list) => {
                  const isChecked = !!subscriptions[list.id];
                  return (
                    <label
                      key={list.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-indigo-50/20 border-indigo-200/80 shadow-2xs"
                          : "bg-white border-slate-200/70 hover:bg-slate-50/60 opacity-80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleList(list.id)}
                        className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${isChecked ? "text-slate-900" : "text-slate-600"}`}>
                          {list.name}
                        </p>
                        {list.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {list.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold rounded-2xl shadow-md transition-all text-xs cursor-pointer active:scale-[0.99]"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Salvar Preferências</span>
            </button>
          </div>

          {/* Unsubscribe link */}
          <div className="text-center pt-1 border-t border-slate-100">
            <Link
              href={`/unsubscribe?email=${encodeURIComponent(email)}`}
              className="text-[11px] text-slate-400 hover:text-red-500 underline transition-colors inline-flex items-center gap-1"
            >
              <span>Cancelar inscrição de todos os e-mails (Opt-out)</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="bg-slate-100/70 border-t border-slate-200 p-3.5 text-center text-[11px] text-slate-400 font-medium">
          Realizzare Cursos • Plataforma de Ensino a Distância
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <PreferencesContent />
    </Suspense>
  );
}
