"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Mail,
  Search,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Archive,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Edit2,
  FolderArchive,
  AlertTriangle,
  X,
  TrendingUp,
  Percent,
  DollarSign,
  ShoppingCart
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  status: "Rascunho" | "Enviado" | "Agendado" | "Arquivada" | "Enviando";
  targetList: string;
  dateStr: string;
  sentAtDate: string; // ISO date string for sorting/filtering
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversions: number;
  revenue: number;
}

export default function CampaignsPage() {
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30"); // 7, 30, 90, ano, acumulado, todo, custom
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Custom range picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("2026-06-14");
  const [customEndDate, setCustomEndDate] = useState("2026-07-14");

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignsToDelete, setCampaignsToDelete] = useState<string[]>([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [campaignToRename, setCampaignToRename] = useState<Campaign | null>(null);
  const [renamedName, setRenamedName] = useState("");

  // Reschedule state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleCampaignId, setRescheduleCampaignId] = useState<string | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState("2026-07-20");
  const [newRescheduleTime, setNewRescheduleTime] = useState("09:00");

  // Action Menu dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const supabase = createClient();
        const { data: dbCampaigns, error } = await supabase
          .from("campaigns")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        const mapped: Campaign[] = (dbCampaigns || []).map((c: any) => {
          const statusMap: Record<string, any> = {
            draft: "Rascunho",
            sent: "Enviado",
            scheduled: "Agendado",
            archived: "Arquivada",
            sending: "Enviando"
          };
          
          let dateStr = "";
          let sentAtDate = "";
          
          if (c.status === "draft") {
            const d = new Date(c.created_at);
            dateStr = `Rascunho (Salvo em ${d.toLocaleDateString("pt-BR")})`;
            sentAtDate = c.created_at;
          } else if (c.status === "scheduled") {
            const d = new Date(c.scheduled_at || c.created_at);
            dateStr = `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}`;
            sentAtDate = c.scheduled_at || c.created_at;
          } else if (c.status === "sending") {
            dateStr = "Enviando para a base...";
            sentAtDate = new Date().toISOString();
          } else {
            const d = new Date(c.sent_at || c.created_at);
            dateStr = `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}`;
            sentAtDate = c.sent_at || c.created_at;
          }

          return {
            id: c.id,
            name: c.name,
            subject: c.subject || "",
            previewText: c.preview_text || "",
            fromName: c.from_name || "",
            fromEmail: c.from_email || "",
            replyTo: c.reply_to || "",
            status: statusMap[c.status] || "Rascunho",
            targetList: c.target_list || "Todos os Contatos",
            dateStr,
            sentAtDate,
            sentCount: c.sent_count || 0,
            openCount: c.open_count || 0,
            clickCount: c.click_count || 0,
            conversions: c.conversions || 0,
            revenue: parseFloat(c.revenue || 0)
          };
        });
        
        setCampaigns(mapped);
      } catch (err) {
        console.error("Erro ao carregar campanhas:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchCampaigns();
  }, []);

  // Date utilities
  const isInPeriod = (dateStr: string, period: string) => {
    if (period === "todo") return true;
    const sentDate = new Date(dateStr);
    if (isNaN(sentDate.getTime())) return true;

    const now = new Date();
    const diffTime = now.getTime() - sentDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (period === "7") return diffDays <= 7;
    if (period === "30") return diffDays <= 30;
    if (period === "90") return diffDays <= 90;
    
    if (period === "ano") {
      return sentDate.getFullYear() === now.getFullYear();
    }
    if (period === "passado") {
      return sentDate.getFullYear() === now.getFullYear() - 1;
    }
    if (period === "custom") {
      const start = new Date(customStartDate + "T00:00:00");
      const end = new Date(customEndDate + "T23:59:59");
      return sentDate >= start && sentDate <= end;
    }
    return true;
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesSearch =
        camp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesArchive = showArchived
        ? camp.status === "Arquivada"
        : camp.status !== "Arquivada";

      const matchesStatus =
        selectedStatus === "todos" || camp.status === selectedStatus;

      const matchesPeriod = camp.status === "Rascunho" || isInPeriod(camp.sentAtDate, selectedPeriod);

      return matchesSearch && matchesArchive && matchesStatus && matchesPeriod;
    });
  }, [campaigns, searchQuery, selectedStatus, selectedPeriod, showArchived, customStartDate, customEndDate]);

  // Paginated campaigns
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCampaigns, currentPage]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  // Recalculated KPIs
  const kpis = useMemo(() => {
    let sent = 0;
    let opened = 0;
    let clicked = 0;
    let orders = 0;
    let revenue = 0;

    filteredCampaigns.forEach((camp) => {
      if (camp.status === "Enviado") {
        sent += camp.sentCount;
        opened += camp.openCount;
        clicked += camp.clickCount;
        orders += camp.conversions;
        revenue += camp.revenue;
      }
    });

    const openRate = sent > 0 ? (opened / sent) * 100 : 0;
    const clickRate = sent > 0 ? (clicked / sent) * 100 : 0;

    return {
      sent,
      opened,
      openRate,
      clicked,
      clickRate,
      orders,
      revenue
    };
  }, [filteredCampaigns]);

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedCampaigns.map((c) => c.id);
      setSelectedCampaignIds(allIds);
    } else {
      setSelectedCampaignIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCampaignIds((prev) => [...prev, id]);
    } else {
      setSelectedCampaignIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkArchive = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from("campaigns")
        // @ts-ignore
        .update({ status: 'archived' } as any)
        .in('id', selectedCampaignIds);
        
      setCampaigns((prev) =>
        prev.map((c) =>
          selectedCampaignIds.includes(c.id) ? { ...c, status: "Arquivada" } : c
        )
      );
      setSelectedCampaignIds([]);
      alert("Campanhas selecionadas arquivadas com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao arquivar campanhas.");
    }
  };

  const handleTriggerBulkDelete = () => {
    setCampaignsToDelete(selectedCampaignIds);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const supabase = createClient();
      await supabase
        .from("campaigns")
        .delete()
        .in('id', campaignsToDelete);

      setCampaigns((prev) => prev.filter((c) => !campaignsToDelete.includes(c.id)));
      setSelectedCampaignIds((prev) => prev.filter((id) => !campaignsToDelete.includes(id)));
      setShowDeleteModal(false);
      setCampaignsToDelete([]);
      alert("Campanha(s) removida(s) permanentemente!");
    } catch (err) {
      console.error(err);
      alert("Erro ao remover campanhas.");
    }
  };

  // Single Actions
  const handleCloneCampaign = async (id: string) => {
    const target = campaigns.find((c) => c.id === id);
    if (!target) return;

    try {
      const supabase = createClient();
      // @ts-ignore
      const { data, error } = await supabase
        .from("campaigns")
        // @ts-ignore
        .insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          name: `${target.name} (Cópia)`,
          subject: target.subject,
          preview_text: target.previewText,
          from_name: target.fromName,
          from_email: target.fromEmail,
          reply_to: target.replyTo,
          status: 'draft',
          target_list: target.targetList
        } as any)
        .select()
        .single();
        
      if (error) throw error;

      const clone: Campaign = {
        ...target,
        id: (data as any).id,
        name: (data as any).name,
        status: "Rascunho",
        dateStr: `Rascunho (Salvo em ${new Date((data as any).created_at).toLocaleDateString()})`,
        sentAtDate: (data as any).created_at,
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        conversions: 0,
        revenue: 0.00
      };

      setCampaigns((prev) => [clone, ...prev]);
      setActiveMenuId(null);
      alert("Campanha clonada como Rascunho!");
    } catch (err) {
      console.error(err);
      alert("Erro ao clonar campanha.");
    }
  };

  const handleTriggerRename = (camp: Campaign) => {
    setCampaignToRename(camp);
    setRenamedName(camp.name);
    setShowRenameModal(true);
    setActiveMenuId(null);
  };

  const handleSaveRename = async () => {
    if (!campaignToRename || !renamedName.trim()) return;
    try {
      const supabase = createClient();
      await supabase
        .from("campaigns")
        // @ts-ignore
        .update({ name: renamedName } as any)
        .eq('id', campaignToRename.id);

      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignToRename.id ? { ...c, name: renamedName } : c))
      );
      setShowRenameModal(false);
      setCampaignToRename(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao renomear campanha.");
    }
  };

  const handleSingleArchive = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("campaigns")
        // @ts-ignore
        .update({ status: 'archived' } as any)
        .eq('id', id);

      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Arquivada" } : c))
      );
      setActiveMenuId(null);
      alert("Campanha arquivada!");
    } catch (err) {
      console.error(err);
      alert("Erro ao arquivar campanha.");
    }
  };

  const handleSingleDelete = (id: string) => {
    setCampaignsToDelete([id]);
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const handleRevertToDraft = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from("campaigns")
        // @ts-ignore
        .update({ status: 'draft', scheduled_at: null } as any)
        .eq('id', id);

      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "Rascunho",
                dateStr: `Rascunho (Salvo em ${new Date().toLocaleDateString("pt-BR")})`
              }
            : c
        )
      );
      setActiveMenuId(null);
      alert("Agendamento cancelado! Campanha revertida para Rascunho.");
    } catch (err) {
      console.error(err);
      alert("Erro ao reverter para rascunho.");
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleCampaignId || !newRescheduleDate || !newRescheduleTime) return;
    
    try {
      const formattedDate = new Date(newRescheduleDate + "T" + newRescheduleTime).toLocaleDateString("pt-BR");
      const isoDate = new Date(newRescheduleDate + "T" + newRescheduleTime).toISOString();

      const supabase = createClient();
      await supabase
        .from("campaigns")
        // @ts-ignore
        .update({ status: 'scheduled', scheduled_at: isoDate } as any)
        .eq('id', rescheduleCampaignId);

      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === rescheduleCampaignId) {
            return {
              ...c,
              status: "Agendado",
              dateStr: `${formattedDate} ${newRescheduleTime}`,
              sentAtDate: isoDate
            };
          }
          return c;
        })
      );
      
      setShowRescheduleModal(false);
      setRescheduleCampaignId(null);
      setActiveMenuId(null);
      alert("Campanha reagendada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao reagendar campanha.");
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Campanhas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie, envie e acompanhe o desempenho dos seus disparos de e-mail marketing.
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/create"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
        >
          <Plus className="h-5 w-5" />
          <span>Criar Campanha</span>
        </Link>
      </div>

      {/* KPI Line Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">E-mails Enviados</span>
            <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Mail className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800">{kpis.sent.toLocaleString("pt-BR")}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">Volume total no período selecionado</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">E-mails Abertos</span>
            <span className="p-1.5 bg-violet-50 rounded-lg text-violet-600 font-bold">
              <Eye className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800">{kpis.opened.toLocaleString("pt-BR")}</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1.5 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {kpis.openRate.toFixed(1)}% <span className="text-slate-500 text-[10px] font-normal">taxa de abertura</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">E-mails Clicados</span>
            <span className="p-1.5 bg-teal-50 rounded-lg text-teal-650">
              <Percent className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800">{kpis.clicked.toLocaleString("pt-BR")}</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1.5 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {kpis.clickRate.toFixed(1)}% <span className="text-slate-500 text-[10px] font-normal">taxa de clique</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-550 to-teal-600" />
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pedidos Realizados</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-705">
              <ShoppingCart className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-800">
              {kpis.orders} <span className="text-xs font-normal text-slate-500">vendas</span>
            </h3>
            <span className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1.5 w-fit">
              <DollarSign className="h-3.5 w-3.5" />
              {kpis.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} <span className="text-slate-500 text-[10px] font-normal">receita gerada</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 lg:overflow-visible overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar campanhas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-405 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-655 transition-colors cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-slate-450" />
                <span>
                  {selectedPeriod === "7" && "Últimos 7 dias"}
                  {selectedPeriod === "30" && "Últimos 30 dias"}
                  {selectedPeriod === "90" && "Últimos 90 dias"}
                  {selectedPeriod === "ano" && "Acumulado do ano"}
                  {selectedPeriod === "passado" && "Ano passado"}
                  {selectedPeriod === "todo" && "Todo o período"}
                  {selectedPeriod === "custom" && "Período personalizado"}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 z-30 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-4 animate-fadeIn">
                  <div className="space-y-3">
                    <span className="text-xs font-black uppercase text-slate-400">Escolha o Período</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: "7", label: "Últimos 7 dias" },
                        { id: "30", label: "Últimos 30 dias" },
                        { id: "90", label: "Últimos 90 dias" },
                        { id: "ano", label: "Acumulado do ano" },
                        { id: "passado", label: "Ano passado" },
                        { id: "todo", label: "Todo o período" },
                        { id: "custom", label: "Período personalizado" }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPeriod(p.id);
                            if (p.id !== "custom") {
                              setShowDatePicker(false);
                              setCurrentPage(1);
                            }
                          }}
                          className={`text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                            selectedPeriod === p.id
                              ? "bg-indigo-50 text-indigo-705 font-bold"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedPeriod === "custom" && (
                    <div className="border-t border-slate-100 pt-3 space-y-3">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Calendário Duplo</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Início</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Fim</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="px-3 py-1.5 border border-slate-250 rounded-lg text-[10px] font-bold text-slate-550 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            setShowDatePicker(false);
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-202 text-slate-655 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="todos">Status: Todos</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviado">Enviado</option>
              <option value="Agendado">Agendado</option>
            </select>

            <button
              onClick={() => {
                setShowArchived(!showArchived);
                setCurrentPage(1);
                setSelectedCampaignIds([]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showArchived
                  ? "bg-amber-50 border-amber-250 text-amber-705 shadow-sm"
                  : "bg-slate-50 border-slate-202 text-slate-655 hover:border-slate-300"
              }`}
            >
              <FolderArchive className="h-4 w-4 shrink-0" />
              <span>{showArchived ? "Ver Ativas" : "Ver Arquivadas"}</span>
            </button>
          </div>
        </div>

        {/* Bulk Action Contextual Bar */}
        {selectedCampaignIds.length > 0 && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200/50 rounded-xl px-4 py-3 animate-fadeIn">
            <span className="text-xs font-semibold text-indigo-800">
              {selectedCampaignIds.length} {selectedCampaignIds.length === 1 ? "campanha selecionada" : "campanhas selecionadas"}
            </span>
            <div className="flex items-center gap-2">
              {!showArchived && (
                <button
                  onClick={handleBulkArchive}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-707 text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Archive className="h-3.5 w-3.5 text-slate-500" />
                  <span>Arquivar</span>
                </button>
              )}
              <button
                onClick={handleTriggerBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir Permanentemente</span>
              </button>
            </div>
          </div>
        )}

        {/* Campaigns Table */}
        <div className="overflow-x-auto lg:overflow-x-visible">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-bold tracking-wider text-slate-500 bg-slate-50/50 select-none">
                <th className="py-3 px-4 w-8 rounded-tl-3xl">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCampaigns.length > 0 &&
                      paginatedCampaigns.every((c) => selectedCampaignIds.includes(c.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                  />
                </th>
                <th className="py-3 px-4">Campanha</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Data de Envio / Agendamento</th>
                <th className="py-3 px-4 text-center">Enviados</th>
                <th className="py-3 px-4 text-center">Aberturas</th>
                <th className="py-3 px-4 text-center">Cliques</th>
                <th className="py-3 px-4 text-right">Pedidos / Receita</th>
                <th className="py-3 px-4 text-right w-12 rounded-tr-3xl">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-707">
              {paginatedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    Nenhuma campanha encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedCampaigns.map((camp) => {
                  const isChecked = selectedCampaignIds.includes(camp.id);
                  const isMenuOpen = activeMenuId === camp.id;
                  
                  const openRate = camp.sentCount > 0 ? (camp.openCount / camp.sentCount) * 100 : 0;
                  const clickRate = camp.sentCount > 0 ? (camp.clickCount / camp.sentCount) * 100 : 0;

                  return (
                    <tr 
                      key={camp.id} 
                      className={`transition-colors ${
                        camp.status === "Enviado" 
                          ? "bg-emerald-50/65 hover:bg-emerald-50/85" 
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-4 px-4 relative">
                        {camp.status === "Enviado" && (
                          <div className="absolute left-0 top-[1px] bottom-[1px] w-[3px] bg-emerald-500 rounded-r-md" />
                        )}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(camp.id, e.target.checked)}
                          className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <Link
                            href={camp.status === "Rascunho" ? `/dashboard/campaigns/create?edit=${camp.id}` : `/dashboard/campaigns/${camp.id}`}
                            className="font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                          >
                            {camp.name}
                          </Link>
                          <span className="text-[11px] text-slate-500 mt-0.5 italic">
                            Enviar para: {camp.targetList}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            camp.status === "Rascunho"
                              ? "bg-slate-100 border border-slate-205 text-slate-500"
                              : camp.status === "Enviado"
                              ? "bg-emerald-50 border border-emerald-255 text-emerald-700"
                              : camp.status === "Agendado"
                              ? "bg-blue-50 border border-blue-205 text-blue-700"
                              : camp.status === "Enviando"
                              ? "bg-amber-50 border border-amber-250 text-amber-700 animate-pulse font-extrabold"
                              : "bg-amber-50 border border-amber-205 text-amber-705"
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-605 text-slate-600">
                        {camp.dateStr}
                      </td>

                      {/* Enviados */}
                      <td className="py-4 px-4 text-center">
                        {camp.status === "Enviado" || camp.status === "Enviando" ? (
                          <div className="flex flex-col items-center">
                            <span className="font-extrabold text-slate-800">
                              {camp.sentCount.toLocaleString("pt-BR")}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              e-mails
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {camp.status === "Enviado" ? (
                          <div className="flex flex-col items-center">
                            <span className="font-extrabold text-slate-800">{openRate.toFixed(1)}%</span>
                            <span className="text-[10px] text-slate-550 mt-0.5">
                              {camp.openCount.toLocaleString("pt-BR")} aberturas
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {camp.status === "Enviado" ? (
                          <div className="flex flex-col items-center">
                            <span className="font-extrabold text-slate-800">{clickRate.toFixed(1)}%</span>
                            <span className="text-[10px] text-slate-550 mt-0.5">
                              {camp.clickCount.toLocaleString("pt-BR")} cliques
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {camp.status === "Enviado" ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-800">{camp.conversions} vendas</span>
                            <span className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                              {camp.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : camp.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>

                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-4 mt-1 w-44 bg-white border border-slate-202 rounded-xl shadow-xl p-1.5 z-20 text-left animate-fadeIn animate-scaleIn">
                              {camp.status === "Rascunho" ? (
                                <Link
                                  href={`/dashboard/campaigns/create?edit=${camp.id}`}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-indigo-650 hover:bg-indigo-50 transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                  <span>Editar Rascunho</span>
                                </Link>
                              ) : (
                                <Link
                                  href={`/dashboard/campaigns/${camp.id}`}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-405 text-slate-400" />
                                  <span>Visualizar</span>
                                </Link>
                              )}
                              <button
                                onClick={() => handleCloneCampaign(camp.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-405 text-slate-400" />
                                <span>Clonar</span>
                              </button>
                              <button
                                onClick={() => handleTriggerRename(camp)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-405 text-slate-400" />
                                <span>Renomear</span>
                              </button>
                              {camp.status !== "Arquivada" && (
                                <button
                                  onClick={() => handleSingleArchive(camp.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                                >
                                  <Archive className="h-3.5 w-3.5 text-slate-450 text-slate-400" />
                                  <span>Arquivar</span>
                                </button>
                              )}
                              {(camp.status === "Agendado" || camp.status === "Enviando") && (
                                <>
                                  <button
                                    onClick={() => handleRevertToDraft(camp.id)}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors text-left cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5 text-amber-550 shrink-0" />
                                    <span>Cancelar Agendamento</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRescheduleCampaignId(camp.id);
                                      setNewRescheduleDate("2026-07-20");
                                      setNewRescheduleTime("09:00");
                                      setShowRescheduleModal(true);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors text-left cursor-pointer"
                                  >
                                    <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                    <span>Reagendar Envio</span>
                                  </button>
                                  <div className="h-[1px] bg-slate-100 my-1" />
                                </>
                              )}
                              <div className="h-[1px] bg-slate-100 my-1" />
                              <button
                                onClick={() => handleSingleDelete(camp.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-405" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-col sm:flex-row gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando página <strong className="text-slate-700">{currentPage}</strong> de <strong className="text-slate-700">{totalPages}</strong> ({filteredCampaigns.length} campanhas no total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-202 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === p
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-202 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-202 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: EXCLUSÃO DE CAMPANHA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-202 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4">
            <div className="flex items-center gap-3 text-red-655">
              <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-909">Excluir campanha(s)?</h3>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Esta ação é permanente. Todos os dados de métricas desta campanha serão removidos definitivamente e não poderão ser recuperados.
            </p>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCampaignsToDelete([]);
                }}
                className="px-4 py-2 border border-slate-202 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RENOMEAR CAMPANHA */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-202 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Renomear Campanha</h3>
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Novo Nome</label>
              <input
                type="text"
                required
                value={renamedName}
                onChange={(e) => setRenamedName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-202 rounded-xl py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 border border-slate-202 text-slate-650 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Salvar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REAGENDAMENTO DE CAMPANHA */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-202 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Calendar className="h-6 w-6 animate-bounce-slow" />
              </div>
              <h3 className="text-lg font-bold text-slate-909">Reagendar Envio</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nova Data de Envio</label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-202 rounded-xl py-2.5 px-3.5 text-xs text-slate-805 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Novo Horário de Envio</label>
                <input
                  type="time"
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-202 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleCampaignId(null);
                }}
                className="px-4 py-2 border border-slate-202 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
