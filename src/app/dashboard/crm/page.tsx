"use client";

import { useState } from "react";
import DealModal from "@/components/crm/DealModal";
import { Plus } from "lucide-react";

type ColumnId = "novo" | "qualificando" | "proposta" | "negociacao" | "ganho";

interface Deal {
  id: string;
  title: string;
  value: number;
  clientInitials: string;
  clientName: string;
  clientColor: string;
  columnId: ColumnId;
}

const COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "novo", title: "Novo", color: "bg-slate-800" },
  { id: "qualificando", title: "Qualificando", color: "bg-blue-500" },
  { id: "proposta", title: "Proposta", color: "bg-orange-400" },
  { id: "negociacao", title: "Negociação", color: "bg-purple-500" },
  { id: "ganho", title: "Ganho", color: "bg-emerald-500" },
];

const INITIAL_DEALS: Deal[] = [
  {
    id: "d1",
    title: "Prova Concluída - Libras Básico",
    value: 0,
    clientInitials: "GC",
    clientName: "Gabriela Vitória Miranda da Cruz",
    clientColor: "bg-[#0f7650]",
    columnId: "novo",
  },
  {
    id: "d2",
    title: "Prova Concluída - NR5 - CIPA",
    value: 0,
    clientInitials: "NS",
    clientName: "Nilton Soares da Silva",
    clientColor: "bg-blue-600",
    columnId: "novo",
  },
  {
    id: "d3",
    title: "Prova Concluída - Departamento Pessoal",
    value: 0,
    clientInitials: "GC",
    clientName: "Gabriela Vitória Miranda da Cruz",
    clientColor: "bg-[#0f7650]",
    columnId: "novo",
  },
];

export default function CrmPage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<ColumnId | null>(null);
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Drag handlers for Cards
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    
    // Slight delay to allow the ghost image to render before making original invisible (optional)
    setTimeout(() => {
      const el = document.getElementById(`deal-${dealId}`);
      if (el) el.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(null);
    setDragOverColId(null);
    const el = document.getElementById(`deal-${dealId}`);
    if (el) el.style.opacity = "1";
  };

  // Drag handlers for Columns
  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault(); // Necessary to allow drop
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: ColumnId) => {
    // Only clear if we actually left the boundary
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    setDragOverColId(null);
    if (!draggedDealId) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === draggedDealId ? { ...d, columnId: colId } : d))
    );
  };

  const openDealModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">
      
      {/* CRM Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          CRM <span className="mx-2 text-slate-300">•</span> FUNIL DE VENDAS
        </div>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Negócios</h1>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Vendas</span>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="9" y1="9" y2="9"/></svg>
              Funis
            </button>
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Negócio
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex flex-col border border-slate-200 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Em aberto</span>
            <span className="text-base font-black text-slate-800">R$ 0</span>
          </div>
          <div className="flex flex-col border border-indigo-100 bg-indigo-50/30 rounded-xl px-4 py-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Previsão ponderada</span>
            <span className="text-base font-black text-indigo-500">R$ 0</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
        <div className="flex gap-4 h-full min-w-max items-start">
          
          {COLUMNS.map((col) => {
            const colDeals = deals.filter((d) => d.columnId === col.id);
            const totalValue = colDeals.reduce((sum, d) => sum + d.value, 0);
            
            const isDragOver = dragOverColId === col.id;

            return (
              <div 
                key={col.id} 
                className={`flex flex-col w-[280px] shrink-0 h-full max-h-full rounded-2xl transition-colors border-2 ${isDragOver ? "border-indigo-400 bg-indigo-50/50" : "border-transparent"}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className={`h-1 w-full rounded-t-full mb-2 ${col.color}`} />
                <div className="flex items-center justify-between px-2 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">{col.title}</h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {colDeals.length}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">R$ {totalValue}</span>
                </div>

                {/* Column Cards Area */}
                <div className="flex-1 overflow-y-auto px-1 space-y-3 pb-6 custom-scrollbar">
                  
                  {colDeals.map((deal) => (
                    <div
                      key={deal.id}
                      id={`deal-${deal.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={(e) => handleDragEnd(e, deal.id)}
                      onClick={() => openDealModal(deal)}
                      className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all active:cursor-grabbing group relative"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                          {deal.title}
                        </h4>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-base font-black text-slate-900">R$ {deal.value}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${deal.clientColor}`}>
                          {deal.clientInitials}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 truncate">
                          {deal.clientName}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Empty state or Add Button */}
                  {colDeals.length === 0 && (
                    <div className="text-center py-6 text-[11px] font-semibold text-slate-400">
                      Sem negócios aqui.
                    </div>
                  )}

                  <button className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-500 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                    Negócio
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      <DealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deal={selectedDeal}
        columns={COLUMNS}
      />
    </div>
  );
}
