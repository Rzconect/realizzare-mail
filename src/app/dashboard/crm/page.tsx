"use client";

import { useState, useEffect } from "react";
import DealModal from "@/components/crm/DealModal";
import AddDealModal from "@/components/crm/AddDealModal";
import { Plus, Archive } from "lucide-react";

type ColumnId = "novo" | "qualificando" | "proposta" | "negociacao" | "ganho" | "rascunho" | "em_andamento" | "finalizada";

interface Deal {
  id: string;
  title: string;
  value: number;
  clientInitials: string;
  clientName: string;
  clientColor: string;
  columnId: ColumnId;
  phone?: string;
  email?: string;
  assignedTo?: string;
  boardId?: string;
  archived?: boolean;
  archivedAt?: string;
}

const CRM_COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "novo", title: "Novo", color: "bg-slate-800" },
  { id: "qualificando", title: "Qualificando", color: "bg-blue-500" },
  { id: "proposta", title: "Proposta", color: "bg-orange-400" },
  { id: "negociacao", title: "Negociação", color: "bg-purple-500" },
  { id: "ganho", title: "Ganho", color: "bg-emerald-500" },
];

const ATIVIDADES_COLUMNS: { id: ColumnId; title: string; color: string }[] = [
  { id: "rascunho", title: "Rascunho", color: "bg-slate-400" },
  { id: "em_andamento", title: "Em andamento", color: "bg-blue-500" },
  { id: "finalizada", title: "Finalizada", color: "bg-emerald-500" },
];

const INITIAL_DEALS: Deal[] = [
  {
    id: "d1",
    title: "Prova Concluída - Usuário Teste",
    value: 0,
    clientInitials: "UT",
    clientName: "Usuário Teste",
    clientColor: "bg-[#0f7650]",
    columnId: "novo",
    phone: "5531999825395",
    email: "gabrielateste10@gmail.com",
    assignedTo: "Sem responsável",
    boardId: "teste_aprovado",
    archived: false
  }
];

export default function CrmPage() {
  const [activeBoard, setActiveBoard] = useState<"teste_aprovado" | "pedidos_pendentes" | "atividades">("teste_aprovado");
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  
  useEffect(() => {
    // Fetch users for filter
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
           setUsers(data);
        }
      })
      .catch(e => console.error(e));
  }, []);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<ColumnId | null>(null);
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddDeal = (newDeal: Deal) => {
    const finalDeal = {
      ...newDeal,
      boardId: activeBoard,
      columnId: activeBoard === 'atividades' ? 'rascunho' : 'novo'
    } as Deal;
    setDeals((prev) => [finalDeal, ...prev]);
  };

  // Drag handlers for Cards
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    
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
    e.preventDefault(); 
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: ColumnId) => {
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

  const openDealModal = (deal: Deal | null = null) => {
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveBoard("teste_aprovado")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeBoard === "teste_aprovado"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Teste Aprovado
            </button>
            <button
              onClick={() => setActiveBoard("pedidos_pendentes")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeBoard === "pedidos_pendentes"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pedidos Pendentes
            </button>
            <button
              onClick={() => setActiveBoard("atividades")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeBoard === "atividades"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Atividades
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <option value="all">Todos os responsáveis</option>
              {users.map(u => (
                <option key={u.email} value={u.name || u.email}>{u.name || u.email}</option>
              ))}
            </select>
            
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Ver cards arquivados"
            >
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Arquivados</span>
            </button>
            
            {activeBoard === 'atividades' ? (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-sm font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Nova Atividade
              </button>
            ) : (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Negócio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6 bg-slate-50/50">
        <div className="flex gap-4 h-full min-w-max items-start">
          
          {(activeBoard === 'atividades' ? ATIVIDADES_COLUMNS : CRM_COLUMNS).map((col) => {
            const colDeals = deals.filter((d) => {
              const bId = d.boardId || 'teste_aprovado';
              if (bId !== activeBoard) return false;
              if (d.columnId !== col.id) return false;
              if (d.archived) return false;
              if (selectedUserFilter !== 'all' && d.assignedTo !== selectedUserFilter) return false;
              return true;
            });
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
                  {activeBoard !== 'atividades' && (
                    <span className="text-xs font-bold text-slate-400">R$ {totalValue}</span>
                  )}
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
                      onClick={(e) => {
                        // Prevent opening modal if clicking archive button
                        if ((e.target as HTMLElement).closest('.archive-btn')) return;
                        openDealModal(deal);
                      }}
                      className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm cursor-pointer hover:border-slate-300 hover:shadow-md transition-all active:cursor-grabbing group relative"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${activeBoard === 'atividades' ? 'bg-emerald-400' : 'bg-slate-400'} mt-1.5 shrink-0`} />
                        <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                          {deal.title}
                        </h4>
                      </div>
                      
                      {activeBoard !== 'atividades' && (
                        <div className="mb-3">
                          <span className="text-base font-black text-slate-900">R$ {deal.value}</span>
                        </div>
                      )}
                      
                      {activeBoard === 'atividades' && (
                        <div className="mb-3 text-xs text-slate-500 font-medium">
                          Responsável: <span className="font-bold text-slate-700">{deal.assignedTo || 'Sem responsável'}</span>
                        </div>
                      )}

                      {activeBoard === 'atividades' && col.id === 'finalizada' && (
                        <button 
                          className="archive-btn mt-2 w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, archived: true, archivedAt: new Date().toISOString() } : d));
                          }}
                        >
                          <Archive className="h-3.5 w-3.5" />
                          Arquivar Agora
                        </button>
                      )}
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
        columns={activeBoard === 'atividades' ? ATIVIDADES_COLUMNS : CRM_COLUMNS}
      />
      
      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDeal}
      />

      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsArchiveModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800">
                <Archive className="h-5 w-5 text-slate-500" />
                <h2 className="text-base font-bold">Cards Arquivados</h2>
              </div>
              <button onClick={() => setIsArchiveModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50 space-y-3">
              {deals.filter(d => d.archived).length === 0 ? (
                <div className="text-center py-10 text-sm font-semibold text-slate-400">
                  Nenhum card arquivado no momento.
                </div>
              ) : (
                deals.filter(d => d.archived).sort((a, b) => (new Date(b.archivedAt || 0).getTime() - new Date(a.archivedAt || 0).getTime())).map(deal => (
                  <div key={deal.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{deal.boardId === 'atividades' ? 'Atividade' : 'Negócio'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {new Date(deal.archivedAt || '').toLocaleDateString('pt-BR')} às {new Date(deal.archivedAt || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{deal.title}</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1">{deal.clientName} • {deal.assignedTo}</p>
                    </div>
                    <button 
                      onClick={() => setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, archived: false } : d))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                    >
                      Desarquivar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
