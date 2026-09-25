"use client";

import { useState, useEffect, useRef } from "react";
import DealModal from "@/components/crm/DealModal";
import AddDealModal from "@/components/crm/AddDealModal";
import ItemTitleWithCoupon from "@/components/ui/ItemTitleWithCoupon";
import { Plus, Archive, Settings, Eye, EyeOff, ChevronUp, ChevronDown, Clock, AlertCircle, Trash2 } from "lucide-react";

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
  notes?: any[];
  boardId?: string;
  archived?: boolean;
  archivedAt?: string;
  createdAt?: string;
  dueDate?: string;
  description?: string;
  priority?: "Alta" | "Média" | "Baixa";
  todos?: { id: string; text: string; done: boolean }[];
  statusBadge?: { label: string; colorClass: string };
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
    title: "Prova Concluída",
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

type CardField = "title" | "clientName" | "value" | "assignedTo" | "status";
type AtividadeCardField = "title" | "dates" | "description" | "todos" | "assignedTo" | "status";

const initialCardConfig: { id: CardField, label: string, visible: boolean }[] = [
  { id: "title", label: "Título do card", visible: true },
  { id: "clientName", label: "Nome do usuário", visible: true },
  { id: "value", label: "Valor", visible: false },
  { id: "assignedTo", label: "Responsável", visible: true },
  { id: "status", label: "Status (Legenda)", visible: true }
];

const initialAtividadeCardConfig: { id: AtividadeCardField, label: string, visible: boolean }[] = [
  { id: "title", label: "Título da tarefa", visible: true },
  { id: "dates", label: "Datas (Início/Término)", visible: true },
  { id: "description", label: "Observações", visible: true },
  { id: "todos", label: "Checklist (To-Do)", visible: true },
  { id: "assignedTo", label: "Responsável", visible: true },
  { id: "status", label: "Status (Legenda)", visible: true }
];

export default function CrmPage() {
  const [activeBoard, setActiveBoard] = useState<"teste_aprovado" | "pedidos_pendentes" | "atividades">("teste_aprovado");
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load deals from localStorage on mount and sync with DB
  useEffect(() => {
    let localDeals: Deal[] = INITIAL_DEALS;
    const saved = localStorage.getItem('realizzare_mock_crm_deals');
    if (saved) {
      try {
        localDeals = JSON.parse(saved);
        setDeals(localDeals);
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoaded(true);

    // Sync from database
    fetch(`/api/crm/sync?t=\${Date.now()}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.success && data.items) {
          setDeals(prevDeals => {
            // Keep only manually created deals (which don't start with test- or pend-)
            // or deals from other boards not synced by this API
            const newDeals = prevDeals.filter(d => !d.id.startsWith("test-") && !d.id.startsWith("pend-"));
            
            // Add all fresh active deals from the API
            for (const item of data.items) {
              newDeals.push(item);
            }
            
            localStorage.setItem('realizzare_mock_crm_deals', JSON.stringify(newDeals));
            return newDeals;
          });
        }
      })
      .catch(console.error);
  }, []);

  // Save deals to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('realizzare_mock_crm_deals', JSON.stringify(deals));
    }
  }, [deals, isLoaded]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  
  const [cardConfig, setCardConfig] = useState(initialCardConfig);
  const [atividadeCardConfig, setAtividadeCardConfig] = useState(initialAtividadeCardConfig);

  useEffect(() => {
    try {
      const savedCardConfig = localStorage.getItem("crm_card_config");
      if (savedCardConfig) setCardConfig(JSON.parse(savedCardConfig));
      const savedAtividadeConfig = localStorage.getItem("crm_atividade_card_config");
      if (savedAtividadeConfig) setAtividadeCardConfig(JSON.parse(savedAtividadeConfig));
    } catch(e){}
  }, []);

  useEffect(() => {
    localStorage.setItem("crm_card_config", JSON.stringify(cardConfig));
  }, [cardConfig]);

  useEffect(() => {
    localStorage.setItem("crm_atividade_card_config", JSON.stringify(atividadeCardConfig));
  }, [atividadeCardConfig]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const configRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setIsConfigOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    // Fetch users for filter
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.users)) {
           setUsers(data.users);
        }
      })
      .catch(e => console.error(e));
  }, []);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<ColumnId | null>(null);
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  
  const [activeUsersInPage, setActiveUsersInPage] = useState<any[]>([]);

  // Setup Supabase Presence and Realtime sync
  useEffect(() => {
    let channel: any = null;
    let isMounted = true;
    
    const setupPresence = async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const myClientId = Math.random().toString(36).substring(2, 15);
        let me: any = null;
        
        // Try getting user from layout session first
        const sessionStr = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
        if (sessionStr) {
          try {
             const parsed = JSON.parse(sessionStr);
             me = { id: parsed.id || Math.random().toString(), name: parsed.name || "Vendedor", email: parsed.email };
          } catch(e) {}
        }
        
        if (!me) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            if (profile) me = profile;
          }
        }
        if (me) {
           let n = me.name || me.full_name || me.first_name || "";
           let i = "UX";
           if (n) {
             const pts = n.trim().split(" ");
             if(pts.length > 1) i = (pts[0].charAt(0) + pts[pts.length-1].charAt(0)).toUpperCase();
             else i = pts[0].substring(0, 2).toUpperCase();
           } else if (me.email) {
             i = me.email.substring(0, 2).toUpperCase();
           }
           setCurrentUser({ name: n, initials: i });
        }
        
        if (!me) me = { id: Math.random().toString(), name: "Colaborador", email: "guest@example.com" };
        
        channel = supabase.channel('crm_presence', {
          config: { presence: { key: myClientId } },
        });

        if (!isMounted) {
          try { channel.unsubscribe(); } catch(e) {}
          return;
        }
        
        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const usersInPageMap: Record<string, any> = {};
          
          for (const userId in state) {
            const presences = state[userId];
            if (presences && presences.length > 0) {
              for (const presence of presences) {
                usersInPageMap[presence.user_id] = presence;
              }
            }
          }
          setActiveUsersInPage(Object.values(usersInPageMap));
        });

        // Listen for real-time moves and deletes
        channel.on('broadcast', { event: 'card_moved' }, (payload: any) => {
          if (!isMounted) return;
          setDeals(prev => prev.map(d => d.id === payload.payload.dealId ? { ...d, columnId: payload.payload.colId } : d));
        });

        channel.on('broadcast', { event: 'card_deleted' }, (payload: any) => {
          if (!isMounted) return;
          setDeals(prev => prev.filter(d => d.id !== payload.payload.dealId));
        });

        channel.on('broadcast', { event: 'card_updated' }, (payload: any) => {
          if (!isMounted) return;
          setDeals(prev => prev.map(d => d.id === payload.payload.deal.id ? { ...d, ...payload.payload.deal } : d));
        });
        
        channel.subscribe(async (status: string) => {
          if (!isMounted) {
             try { channel.unsubscribe(); } catch(e) {}
             return;
          }
          if (status === 'SUBSCRIBED') {
            try {
              await channel.track({ client_id: myClientId, user_id: me.id, name: me.name });
            } catch(e) { console.warn("Initial presence track failed", e); }
            
            const w = window as any;
            if (w.__crm_channel && w.__crm_channel !== channel) {
               try { w.__crm_channel.unsubscribe(); } catch(e) {}
            }
            w.__crm_me = me;
            w.__crm_client_id = myClientId;
            w.__crm_channel = channel;
          }
        });
    };
    
    setupPresence();
    
    return () => {
      isMounted = false;
      if (channel) {
        try { channel.unsubscribe(); } catch(e) {}
      }
    };
  }, []);
  
  // Track modal and drag



  const dispatchNotification = (deal: Deal) => {
    if (deal.boardId === 'atividades' && deal.assignedTo && deal.assignedTo !== "Sem responsável") {
      try {
        const stored = localStorage.getItem("realizzare_mock_notifications");
        const list = stored ? JSON.parse(stored) : [];
        const existing = list.findIndex((n: any) => n.id === deal.id);
        if (existing !== -1) {
          list[existing] = deal;
        } else {
          list.unshift(deal);
        }
        localStorage.setItem("realizzare_mock_notifications", JSON.stringify(list));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddDeal = (newDeal: Deal) => {
    const finalDeal = {
      ...newDeal,
      boardId: activeBoard,
      columnId: activeBoard === 'atividades' ? 'rascunho' : 'novo'
    } as Deal;
    setDeals((prev) => [finalDeal, ...prev]);
    dispatchNotification(finalDeal);
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    const w = window as any;
    if (w.__crm_channel) {
      w.__crm_channel.send({ type: 'broadcast', event: 'card_updated', payload: { deal: updatedDeal } });
    }
    
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d));
    if (selectedDeal && selectedDeal.id === updatedDeal.id) setSelectedDeal({ ...selectedDeal, ...updatedDeal });
    dispatchNotification(updatedDeal);
    
    // Save state
    fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: updatedDeal.id, action: "update", payload: { columnId: updatedDeal.columnId, assignedTo: updatedDeal.assignedTo, notes: updatedDeal.notes } })
    });
  };

  const handleDeleteDeal = (dealId: string) => {
    if (confirm('Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.')) {
      const w = window as any;
      if (w.__crm_channel) {
        w.__crm_channel.send({ type: 'broadcast', event: 'card_deleted', payload: { dealId } });
      }
      
      setDeals(prev => prev.filter(d => d.id !== dealId));
      
      // Save state
      fetch("/api/crm/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, action: "archive" })
      });
    }
  };

  // Drag handlers for Cards
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    
    setTimeout(() => {
      const el = document.getElementById(`deal-${dealId}`);
      if (el) el.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(null);
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

    const w = window as any;
    if (w.__crm_channel) {
      w.__crm_channel.send({ type: 'broadcast', event: 'card_moved', payload: { dealId: draggedDealId, colId } });
    }

    setDeals((prev) =>
      prev.map((d) => (d.id === draggedDealId ? { ...d, columnId: colId } : d))
    );
    
    // Save state
    fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedDealId, action: "update", payload: { columnId: colId } })
    });
  };

  const openDealModal = (deal: Deal | null = null) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">
      
      {/* CRM Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase w-full">
          <div>CRM <span className="mx-2 text-slate-300">•</span> FUNIL DE VENDAS</div>
          
          <div className="flex items-center">
             <span className="mr-3 normal-case text-xs text-slate-400 font-medium flex items-center gap-1.5">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               {activeUsersInPage.length} online
             </span>
             <div className="flex -space-x-2">
                {activeUsersInPage.map((u, i) => (
                   <div key={u.client_id} className="h-8 w-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-transparent hover:ring-indigo-300 transition-all cursor-default" title={u.name} style={{ zIndex: 10 - i }}>
                     {u.name ? (u.name.split(" ").length > 1 ? u.name.split(" ")[0][0] + u.name.split(" ")[u.name.split(" ").length - 1][0] : u.name.substring(0, 2)).toUpperCase() : "CO"}
                   </div>
                ))}
             </div>
          </div>
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

            {/* Gear Icon Config */}
            <div className="relative" ref={configRef}>
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className={`p-2 rounded-lg border transition-colors ${isConfigOpen ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                title="Configurar visualização dos cards"
              >
                <Settings className="h-4 w-4" />
              </button>
              
              {isConfigOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <h4 className="text-xs font-bold text-slate-800">Campos do Card</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mostre, oculte ou reordene.</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {(activeBoard === 'atividades' ? atividadeCardConfig : cardConfig).map((field, index) => {
                      const arr = activeBoard === 'atividades' ? atividadeCardConfig : cardConfig;
                      const setArr = activeBoard === 'atividades' ? setAtividadeCardConfig : setCardConfig;
                      
                      return (
                        <div key={field.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setArr((prev: any[]) => prev.map((f: any) => f.id === field.id ? { ...f, visible: !f.visible } : f) as any)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 opacity-50" />}
                            </button>
                            <span className={`text-xs font-semibold ${field.visible ? 'text-slate-700' : 'text-slate-400'}`}>{field.label}</span>
                          </div>
                          <div className="flex items-center flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              disabled={index === 0}
                              onClick={() => {
                                setArr((prev: any[]) => {
                                  const newArr = [...prev];
                                  [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
                                  return newArr as any;
                                });
                              }}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button 
                              disabled={index === arr.length - 1}
                              onClick={() => {
                                setArr((prev: any[]) => {
                                  const newArr = [...prev];
                                  [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
                                  return newArr as any;
                                });
                              }}
                              className="text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
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
                    <span className="text-xs font-bold text-slate-400">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* Column Cards Area */}
                <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 pb-6 custom-scrollbar">
                  
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
                      className="p-4 rounded-2xl shadow-sm cursor-pointer transition-all active:cursor-grabbing group relative border bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                    >
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeal(deal.id);
                        }}
                        className="archive-btn absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Excluir card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {activeBoard === 'atividades' ? (
                        // Atividades Card Layout
                        <div className="space-y-2">
                          {atividadeCardConfig.filter(f => f.visible).map(field => {
                            switch(field.id) {
                              case 'title':
                                return (
                                  <div key={field.id} className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                      <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0`} />
                                      <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {deal.title}
                                      </h4>
                                    </div>
                                    {deal.priority && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                                        deal.priority === 'Alta' ? 'bg-red-100 text-red-600' : 
                                        deal.priority === 'Média' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                      }`}>
                                        {deal.priority}
                                      </span>
                                    )}
                                  </div>
                                );
                              case 'dates':
                                if (!deal.createdAt && !deal.dueDate) return null;
                                return (
                                  <div key={field.id} className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                                    {deal.createdAt && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(deal.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                    {deal.dueDate && (
                                      <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                                        Até {new Date(deal.dueDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                );
                              case 'description':
                                if (!deal.description) return null;
                                return (
                                  <p key={field.id} className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    {deal.description}
                                  </p>
                                );
                              case 'todos':
                                if (!deal.todos || deal.todos.length === 0) return null;
                                const completed = deal.todos.filter(t => t.done).length;
                                return (
                                  <div key={field.id} className="flex items-center gap-1.5 pt-1">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(completed / deal.todos.length) * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">{completed}/{deal.todos.length}</span>
                                  </div>
                                );
                              case 'assignedTo':
                                const assigneeName = deal.assignedTo || 'Sem responsável';
                                const assigneeInitials = assigneeName === 'Sem responsável' 
                                  ? 'SR' 
                                  : assigneeName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                  <div key={field.id} className="flex items-center gap-1.5 pt-0.5 mt-1">
                                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-500 bg-slate-100 shrink-0 border border-slate-200">
                                      {assigneeInitials}
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 truncate">
                                      {assigneeName}
                                    </span>
                                  </div>
                                );
                              case 'status':
                                return null;
                              default: return null;
                            }
                          })}

                          {col.id === 'finalizada' && (
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
                      ) : (
                        // Teste Aprovado / Pedidos Pendentes Card Layout (Dynamic config)
                        <div className="space-y-2">
                          {cardConfig.filter(f => f.visible).map(field => {
                            switch(field.id) {
                              case 'title':
                                const parts = deal.title.split(': ');
                                const mainTitle = parts[0];
                                const subTitle = parts.slice(1).join(': ');
                                return (
                                  <div key={field.id} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 mb-1.5 ml-3.5">
                                      {deal.statusBadge && (
                                        <div className={`text-[10px] px-2 py-0.5 rounded font-medium w-max ${deal.statusBadge.colorClass}`}>
                                          {deal.statusBadge.label}
                                        </div>
                                      )}
                                      {deal.createdAt && (
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {new Date(deal.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                      <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {mainTitle}
                                      </h4>
                                    </div>
                                    {subTitle && (
                                      <ItemTitleWithCoupon 
                                        rawTitle={subTitle}
                                        titleClassName="text-xs font-semibold text-slate-500 ml-3.5 leading-snug block"
                                        containerClassName="flex flex-col gap-1 items-start"
                                      />
                                    )}
                                  </div>
                                );
                              case 'clientName':
                                return (
                                  <div key={field.id} className="flex items-center gap-2">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${deal.clientColor}`}>
                                      {deal.clientInitials}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 truncate">
                                      {deal.clientName}
                                    </span>
                                  </div>
                                );
                              case 'value':
                                return (
                                  <div key={field.id}>
                                    <span className="text-base font-black text-slate-900">
                                      R$ {Number(deal.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                );
                              case 'assignedTo':
                                const assigneeName = deal.assignedTo || 'Sem responsável';
                                const assigneeInitials = assigneeName === 'Sem responsável' 
                                  ? 'SR' 
                                  : assigneeName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                                return (
                                  <div key={field.id} className="flex items-center gap-1.5 pt-0.5 mt-1">
                                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-500 bg-slate-100 shrink-0 border border-slate-200">
                                      {assigneeInitials}
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 truncate">
                                      {assigneeName}
                                    </span>
                                  </div>
                                );
                              case 'status':
                                return null;
                              default: return null;
                            }
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty state or Add Button */}
                  {colDeals.length === 0 && (
                    <div className="text-center py-6 text-[11px] font-semibold text-slate-400">
                      Sem negócios aqui.
                    </div>
                  )}

                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-500 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {activeBoard === 'atividades' ? 'Nova Atividade' : 'Negócio'}
                  </button>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      <DealModal 
        currentUser={currentUser}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deal={selectedDeal}
        columns={activeBoard === 'atividades' ? ATIVIDADES_COLUMNS : CRM_COLUMNS}
        onEdit={() => {
          setDealToEdit(selectedDeal);
          setIsModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onUpdate={(updatedDeal) => {
          setSelectedDeal(updatedDeal);
          handleUpdateDeal(updatedDeal);
        }}
      />
      
      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTimeout(() => setDealToEdit(null), 300);
        }}
        onAdd={dealToEdit ? handleUpdateDeal : handleAddDeal}
        activeBoard={activeBoard}
        dealToEdit={dealToEdit}
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
