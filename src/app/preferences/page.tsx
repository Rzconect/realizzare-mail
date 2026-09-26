"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sliders, CheckCircle2, XCircle, Mail, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function PreferencesContent() {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get("email") || "";

  const [email] = useState(rawEmail);
  const [lists, setLists] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({});
  const [contactId, setContactId] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<string>("active");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!rawEmail) {
        setIsLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        
        // Find contact
        const { data: contact } = await supabase
          .from("contacts")
          .select("id, status")
          .eq("email", rawEmail)
          .maybeSingle();

        if (contact) {
          setContactId(contact.id);
          setContactStatus(contact.status);

          // Get all lists
          const { data: allLists } = await supabase.from("lists").select("id, name");
          setLists(allLists || []);

          // Get contact subscriptions
          const { data: subs } = await supabase
            .from("list_subscriptions")
            .select("list_id, status")
            .eq("contact_id", contact.id);

          const subsMap: Record<string, boolean> = {};
          (subs || []).forEach((s: any) => {
            subsMap[s.list_id] = s.status === 'subscribed';
          });
          setSubscriptions(subsMap);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [rawEmail]);

  const toggleList = (listId: string) => {
    setSubscriptions(prev => ({ ...prev, [listId]: !prev[listId] }));
  };

  const handleSave = async () => {
    if (!contactId) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      
      const isCompletelyUnsubscribed = Object.values(subscriptions).every(v => !v);

      if (isCompletelyUnsubscribed) {
        // If they disabled all lists, mark contact as unsubscribed
        await supabase.from("contacts").update({ status: "unsubscribed" }).eq("id", contactId);
        await supabase.from("list_subscriptions").update({ status: "unsubscribed" }).eq("contact_id", contactId);
        setContactStatus("unsubscribed");
      } else {
        // Re-activate contact if they were unsubscribed
        if (contactStatus === "unsubscribed") {
           await supabase.from("contacts").update({ status: "active" }).eq("id", contactId);
           setContactStatus("active");
        }
        
        // Update each list subscription
        for (const list of lists) {
          const isSubscribed = subscriptions[list.id];
          
          // Check if exists
          const { data: existing } = await supabase
            .from("list_subscriptions")
            .select("id")
            .eq("contact_id", contactId)
            .eq("list_id", list.id)
            .maybeSingle();

          if (existing) {
             await supabase
               .from("list_subscriptions")
               .update({ status: isSubscribed ? "subscribed" : "unsubscribed" })
               .eq("id", existing.id);
          } else if (isSubscribed) {
             await supabase
               .from("list_subscriptions")
               .insert({ contact_id: contactId, list_id: list.id, status: "subscribed" });
          }
        }
      }

      setMessage({ type: 'success', text: 'Preferências salvas com sucesso!' });
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao salvar preferências.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!email || !contactId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-200">
          <XCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Contato não encontrado</h2>
          <p className="text-sm text-slate-500 mt-2">O e-mail informado não foi localizado na base.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-indigo-600 text-white text-center space-y-2">
          <div className="inline-flex p-3 bg-white/10 rounded-full mb-1">
            <Sliders className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Gerenciar Preferências</h1>
          <p className="text-xs text-indigo-100 max-w-sm mx-auto font-medium">
            Selecione o tipo de conteúdo que deseja receber.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              {email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">E-mail atual</p>
              <p className="text-sm font-bold text-slate-800 truncate">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Suas Inscrições</h3>
            
            {lists.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma lista disponível no momento.</p>
            ) : (
              <div className="space-y-3">
                {lists.map(list => (
                  <label key={list.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        checked={!!subscriptions[list.id]}
                        onChange={() => toggleList(list.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{list.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {message.text}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold rounded-xl transition-all"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Preferências
            </button>
          </div>
          
          <div className="text-center pt-2">
            <button 
              onClick={() => {
                const unsubAll: Record<string, boolean> = {};
                lists.forEach(l => unsubAll[l.id] = false);
                setSubscriptions(unsubAll);
              }}
              className="text-xs text-slate-500 hover:text-red-500 underline transition-colors"
            >
              Cancelar inscrição de todos os e-mails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div>}>
      <PreferencesContent />
    </Suspense>
  );
}
