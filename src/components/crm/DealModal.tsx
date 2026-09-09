"use client";

import { X, SlidersHorizontal, ExternalLink, MessageCircle, Edit3, Save } from "lucide-react";
import { useState } from "react";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: any;
}

export default function DealModal({ isOpen, onClose, deal }: DealModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-slate-100 shadow-2xl z-50 flex flex-col animate-slideInRight border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">Prova Concluída - Libras Básico</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200 uppercase tracking-wider">Aberto</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 py-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor</span>
              <p className="text-lg font-bold text-slate-900">R$ 0</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Etapa</span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span className="text-sm font-semibold text-slate-700">Novo</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsável</span>
              <p className="text-sm font-semibold text-slate-700">Sem responsável</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Previsão de fecho</span>
              <p className="text-sm font-semibold text-slate-700">—</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Criado em</span>
              <p className="text-sm font-semibold text-slate-700">18 de ago.</p>
            </div>
          </div>

          <div className="border-b border-slate-200/80 my-2"></div>

          {/* Custom Fields Section */}
          <div className="py-4">
            <div className="flex items-center gap-2 text-slate-500 mb-5">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Campos Personalizados</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Cidade</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">E-mail</label>
                <input type="email" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Objetivo</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Data de matrícula</label>
                <div className="relative">
                  <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Data de finalização do teste</label>
                <div className="relative">
                  <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nível de escolaridade</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Cursos de interesse</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
          
          <div className="border-b border-slate-200/80 my-2"></div>

          {/* Client Footer */}
          <div className="py-4">
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <UserIcon className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cliente</span>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 bg-[#0f7650] text-white rounded-full flex items-center justify-center font-bold text-sm">
                GC
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">Gabriela Vitória Miranda da Cruz</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-wide">Novo</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1.5">
                  <PhoneIcon className="h-3 w-3" />
                  <span>5531999285395</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mb-2">
                  <span className="relative flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                    há 3 meses
                  </span>
                  <span>1 conversa</span>
                  <span className="flex items-center gap-1 before:content-['·'] before:mr-1">1 msg</span>
                </div>
                <a href="#" className="flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">
                  Ver ficha completa
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-200/50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all">
            Fechar
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all">
            <MessageCircle className="h-4 w-4" />
            Abrir conversa
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm">
            <Edit3 className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </>
  );
}

function UserIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
