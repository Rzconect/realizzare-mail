"use client";

import { MessageCircle } from "lucide-react";

export default function ConversationsPage() {
  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center">
        <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-indigo-500 shadow-inner">
          <MessageCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Conversas</h2>
        <p className="text-slate-500 max-w-md text-sm leading-relaxed">
          O módulo de conversas e atendimento está em construção e será disponibilizado em breve.
        </p>
      </div>
    </div>
  );
}
