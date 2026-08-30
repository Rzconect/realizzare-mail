import React, { useState } from "react";
import { X, CreditCard, Activity, Webhook, UserCircle2 } from "lucide-react";

interface TriggerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

export default function TriggerConfigModal({ isOpen, onClose, onSave }: TriggerConfigModalProps) {
  const [customTriggerSource, setCustomTriggerSource] = useState("pagarme");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">?</div>
              Configura��o de Gatilho de Entrada
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Configure regras complexas ouvindo eventos externos ou dados do usu�rio.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-left bg-white">
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setCustomTriggerSource("pagarme")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "pagarme" ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <CreditCard className="h-5 w-5" />
              <span className="text-[10px] font-bold">Pagar.me</span>
            </button>
            <button onClick={() => setCustomTriggerSource("datalayer")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "datalayer" ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <Activity className="h-5 w-5" />
              <span className="text-[10px] font-bold">DataLayer</span>
            </button>
            <button onClick={() => setCustomTriggerSource("api")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "api" ? "border-rose-500 bg-rose-50/50 text-rose-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <Webhook className="h-5 w-5" />
              <span className="text-[10px] font-bold">API / Webhooks</span>
            </button>
            <button onClick={() => setCustomTriggerSource("user")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "user" ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <UserCircle2 className="h-5 w-5" />
              <span className="text-[10px] font-bold">Dados do Lead</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selecionar Evento</label>
              <select className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
                {customTriggerSource === "pagarme" && (
                  <>
                    <option>Transa��o Aprovada (order_paid)</option>
                    <option>Boleto Gerado (order_created)</option>
                    <option>Assinatura Cancelada (subscription_canceled)</option>
                    <option>Carrinho Abandonado (checkout_abandoned)</option>
                  </>
                )}
                {customTriggerSource === "datalayer" && (
                  <>
                    <option>Visualizou P�gina (page_view)</option>
                    <option>Adicionou ao Carrinho (add_to_cart)</option>
                    <option>Iniciou Checkout (begin_checkout)</option>
                    <option>Clicou em Elemento (click)</option>
                  </>
                )}
                {customTriggerSource === "api" && (
                  <>
                    <option>Evento Customizado POST</option>
                    <option>Integra��o Zapier / Make</option>
                  </>
                )}
                {customTriggerSource === "user" && (
                  <>
                    <option>Campo Personalizado Alterado</option>
                    <option>Tag Adicionada</option>
                    <option>Fez Anivers�rio</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Regra Adicional (Opcional)</label>
                <select className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none">
                  <option>Nenhuma regra extra</option>
                  <option>Valor maior que</option>
                  <option>Nome do Produto cont�m</option>
                  <option>Status igual a</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Condicional</label>
                <input type="text" placeholder="Ex: Curso de Marketing" className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ source: customTriggerSource });
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm"
          >
            Salvar Gatilho
          </button>
        </div>
      </div>
    </div>
  );
}