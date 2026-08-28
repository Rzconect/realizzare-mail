"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GitBranch,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  Mail,
  Archive,
  RefreshCw
} from "lucide-react";

interface Flow {
  id: string;
  name: string;
  triggerDescription: string;
  type: "Automação" | "Transacional" | "Sistema";
  status: "Ativo" | "Pausado" | "Rascunho";
  updatedAt: string;
  activeContacts: number;
  revenue: number;
  finishedContacts?: number;
  certificatesIssued?: number;
  triggerType?: string;
  nodes?: any[];
}

const defaultFlows: Flow[] = [
  {
    id: "flow-1",
    name: "Boas-vindas - Novo Aluno React",
    triggerDescription: "Iniciou curso: React Developer",
    type: "Automação",
    status: "Ativo",
    updatedAt: "18/07/2026 14:15",
    activeContacts: 24,
    revenue: 4590.00
  },
  {
    id: "flow-2",
    name: "Confirmação de Compra - Certificado",
    triggerDescription: "Comprou um Certificado",
    type: "Transacional",
    status: "Ativo",
    updatedAt: "17/07/2026 18:30",
    activeContacts: 8,
    revenue: 12800.00
  },
  {
    id: "flow-3",
    name: "Reengajamento - Leads Inativos",
    triggerDescription: "Adicionado a um Segmento: Inativos 30 dias",
    type: "Automação",
    status: "Pausado",
    updatedAt: "15/07/2026 10:00",
    activeContacts: 0,
    revenue: 850.00
  },
  {
    id: "flow-4",
    name: "Recuperação de Carrinho - Fullstack",
    triggerDescription: "Abandonou Carrinho no checkout",
    type: "Automação",
    status: "Rascunho",
    updatedAt: "18/07/2026 11:20",
    activeContacts: 0,
    revenue: 0.00
  }
];

const mockCoursesList = [
  "Todos os Cursos",
  "Introdução à Programação Web",
  "Gestão Financeira para Negócios",
  "Desenvolvimento de Carreira e Liderança",
  "Marketing Digital de Performance"
];

export default function AutomationsPage() {
  const router = useRouter();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [periodPreset, setPeriodPreset] = useState<"all" | "7" | "30" | "90" | "custom">("all");
  const [periodStartDate, setPeriodStartDate] = useState("2025-01-01");
  const [periodEndDate, setPeriodEndDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [flowToRename, setFlowToRename] = useState<Flow | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Create flow modal states
  const [showCreateFlowModal, setShowCreateFlowModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState("");
  const [newFlowTrigger, setNewFlowTrigger] = useState("Iniciou Curso");
  const [selectedCourse, setSelectedCourse] = useState("Todos os Cursos");
  const [newFlowDescription, setNewFlowDescription] = useState("");
  const [newFlowType, setNewFlowType] = useState<"Automação" | "Transacional" | "Sistema">("Automação");
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Clone flow modal states
  const [showCloneFlowModal, setShowCloneFlowModal] = useState(false);
  const [flowToClone, setFlowToClone] = useState<Flow | null>(null);
  const [cloneFlowName, setCloneFlowName] = useState("");
  const [cloneFlowTrigger, setCloneFlowTrigger] = useState("Iniciou Curso");
  const [cloneSelectedCourse, setCloneSelectedCourse] = useState("Todos os Cursos");
  const [cloneFlowDescription, setCloneFlowDescription] = useState("");
  const [cloneFlowType, setCloneFlowType] = useState<"Automação" | "Transacional" | "Sistema">("Automação");
  const [showCloneCourseDropdown, setShowCloneCourseDropdown] = useState(false);
  const [cloneSearchTerm, setCloneSearchTerm] = useState("");

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("flows")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data.map((f: any) => ({
            id: f.id,
            name: f.name,
            triggerDescription: f.description || f.trigger_type || "Gatilho Padrão",
            type: "Automação" as "Automação" | "Transacional" | "Sistema",
            status: (f.status === "active" ? "Ativo" : (f.status === "paused" ? "Pausado" : "Rascunho")) as "Ativo" | "Pausado" | "Rascunho",
            updatedAt: new Date(f.updated_at || f.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
            activeContacts: f.metrics_json?.active_contacts || 0,
            revenue: f.metrics_json?.revenue || 0.00
          }));
          setFlows(mapped);
        }
      } catch (err) {
        console.error("Erro ao buscar automacoes:", err);
      }
    };
    fetchFlows();
  }, []);

  const saveFlowsToStorage = (updatedList: Flow[]) => {
    setFlows(updatedList);
    localStorage.setItem("realizzare_mock_flows", JSON.stringify(updatedList));
  };

  // KPIs
  const kpis = useMemo(() => {
    // Flows Transacionais Ativos
    const activeTrans = flows.filter(f => f.status === "Ativo" && f.type === "Transacional");
    const transActiveCount = activeTrans.length;
    const transLeadsCount = activeTrans.reduce((sum, f) => sum + (f.activeContacts || 0), 0);

    // Flows de Automação Ativos
    const activeAuto = flows.filter(f => f.status === "Ativo" && f.type === "Automação");
    const autoActiveCount = activeAuto.length;
    const autoLeadsCount = activeAuto.reduce((sum, f) => sum + (f.activeContacts || 0), 0);
    
    return { 
      transActiveCount, 
      transLeadsCount, 
      autoActiveCount, 
      autoLeadsCount 
    };
  }, [flows]);

  // Filtering
  const filteredFlows = useMemo(() => {
    return flows.filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            flow.triggerDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || flow.status === statusFilter;
      const matchesType = typeFilter === "all" || flow.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [flows, searchQuery, statusFilter, typeFilter]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredFlows.map(f => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Actions
  const handleToggleStatus = async (id: string) => {
    try {
      const target = flows.find(f => f.id === id);
      if (!target || target.status === "Rascunho") return;
      
      const newStatus = target.status === "Ativo" ? "paused" : "active";
      
      const supabase = createClient();
      await supabase
        .from("flows")
        // @ts-ignore
        .update({ status: newStatus } as any)
        .eq("id", id);
      
      setFlows((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus === "active" ? "Ativo" : "Pausado" } : f))
      );

      // Sync linked email templates to Rascunho when flow is paused, or Ativo when flow is active
      if (typeof window !== "undefined") {
        const storedTemplates = localStorage.getItem("realizzare_email_templates");
        if (storedTemplates) {
          try {
            let templatesList = JSON.parse(storedTemplates);
            const folderId = `folder-${id}`;
            templatesList = templatesList.map((t: any) => {
              if (t.flowId === id || t.folderId === folderId) {
                return { ...t, status: newStatus === "active" ? "Ativo" : "Rascunho" };
              }
              return t;
            });
            localStorage.setItem("realizzare_email_templates", JSON.stringify(templatesList));
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
    setActiveMenuId(null);
  };

  const handleCloneFlow = (id: string) => {
    const source = flows.find(f => f.id === id);
    if (!source) return;

    setFlowToClone(source);
    setCloneFlowName(`${source.name} (Cópia)`);
    
    // Parse trigger description
    const triggerDesc = source.triggerDescription || "";
    let baseTrigger = "Iniciou Curso";
    let courseName = "Todos os Cursos";
    
    if (triggerDesc.startsWith("Iniciou curso:")) {
      baseTrigger = "Iniciou Curso";
      courseName = triggerDesc.replace("Iniciou curso:", "").trim();
    } else if (triggerDesc.startsWith("Comprou um Certificado")) {
      baseTrigger = "Comprou Certificado";
    } else if (triggerDesc.startsWith("Abandonou Carrinho")) {
      baseTrigger = "Abandonou Carrinho";
    } else if (triggerDesc.startsWith("Adicionado a uma Lista")) {
      baseTrigger = "Adicionado a uma Lista";
    } else if (triggerDesc.startsWith("Preencheu um Formulário") || triggerDesc.startsWith("Preencheu Formulário")) {
      baseTrigger = "Preencheu Formulário";
    }

    setCloneFlowTrigger(baseTrigger);
    setCloneSelectedCourse(courseName);
    setCloneFlowType(source.type || "Automação");
    setCloneFlowDescription(source.triggerType || "");
    
    setShowCloneFlowModal(true);
    setActiveMenuId(null);
  };

  const handleConfirmCloneFlow = async () => {
    if (!flowToClone || !cloneFlowName.trim()) return;

    const trimmedName = cloneFlowName.trim();
    const nameExists = flows.some((f) => f.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      alert(`⚠️ Já existe uma automação com o nome "${trimmedName}". Por favor, escolha um nome diferente para evitar conflitos de pasta.`);
      return;
    }

    try {
      const supabase = createClient();
      const triggerDesc = cloneFlowTrigger === "Iniciou Curso"
        ? `Iniciou curso: ${cloneSelectedCourse}`
        : cloneFlowTrigger;

      const { data, error } = await supabase
        .from("flows")
        // @ts-ignore
        .insert({
          org_id: "00000000-0000-0000-0000-000000000001",
          name: trimmedName,
          description: triggerDesc,
          status: "draft",
          trigger_type: "event",
          metrics_json: { active_contacts: 0, revenue: 0 }
        } as any)
        .select()
        .single();
      
      if (error) throw error;

      const newFlow: Flow = {
        id: (data as any).id,
        name: (data as any).name,
        triggerDescription: triggerDesc,
        type: cloneFlowType,
        status: "Rascunho",
        updatedAt: new Date((data as any).created_at).toLocaleDateString("pt-BR"),
        activeContacts: 0,
        revenue: 0.00
      };

      setFlows((prev) => [newFlow, ...prev]);

      // Sync folder and clone email templates into E-mails library
      if (typeof window !== "undefined") {
        const storedFolders = localStorage.getItem("realizzare_email_folders");
        let foldersList = storedFolders ? JSON.parse(storedFolders) : [];
        const newFolderId = `folder-${newFlow.id}`;
        foldersList.unshift({ id: newFolderId, name: trimmedName, type: "flow" });
        localStorage.setItem("realizzare_email_folders", JSON.stringify(foldersList));

        // Duplicate templates belonging to cloned flow as Drafts
        const storedTemplates = localStorage.getItem("realizzare_email_templates");
        if (storedTemplates) {
          try {
            const templatesList = JSON.parse(storedTemplates);
            const sourceTemplates = templatesList.filter((t: any) => t.flowId === flowToClone.id || t.folderName === flowToClone.name);
            const clonedTemplates = sourceTemplates.map((orig: any, idx: number) => ({
              ...orig,
              id: `tpl-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
              name: `Cópia - ${orig.name}`,
              folderId: newFolderId,
              folderName: trimmedName,
              flowId: newFlow.id,
              flowName: trimmedName,
              status: "Rascunho",
              updatedAt: new Date().toLocaleDateString("pt-BR"),
              metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0 }
            }));
            localStorage.setItem("realizzare_email_templates", JSON.stringify([...clonedTemplates, ...templatesList]));
          } catch (e) {
            console.error(e);
          }
        }
      }

      setShowCloneFlowModal(false);
      setFlowToClone(null);
      alert("Automação clonada como Rascunho e pasta criada na biblioteca de E-mails!");
    } catch (err) {
      console.error(err);
      alert("Erro ao clonar automação");
    }
  };

  const handleTriggerRename = (flow: Flow) => {
    setFlowToRename(flow);
    setRenameValue(flow.name);
    setShowRenameModal(true);
    setActiveMenuId(null);
  };

  const handleSaveRename = async () => {
    if (!flowToRename || !renameValue.trim()) return;

    const oldName = flowToRename.name;
    const newName = renameValue.trim();

    try {
      const supabase = createClient();
      await supabase
        .from("flows")
        // @ts-ignore
        .update({ name: newName } as any)
        .eq("id", flowToRename.id);

      setFlows((prev) =>
        prev.map((f) => (f.id === flowToRename.id ? { ...f, name: newName } : f))
      );

      // 2-Way Sync: Update matching folder name and templates in localStorage
      if (typeof window !== "undefined") {
        const storedFolders = localStorage.getItem("realizzare_email_folders");
        if (storedFolders) {
          try {
            let foldersList = JSON.parse(storedFolders);
            const targetFolderId = `folder-${flowToRename.id}`;
            foldersList = foldersList.map((f: any) => {
              if (f.id === targetFolderId || f.name?.trim().toLowerCase() === oldName.trim().toLowerCase()) {
                return { ...f, name: newName, type: "flow" };
              }
              return f;
            });
            localStorage.setItem("realizzare_email_folders", JSON.stringify(foldersList));
          } catch (e) {
            console.error(e);
          }
        }

        const storedTemplates = localStorage.getItem("realizzare_email_templates");
        if (storedTemplates) {
          try {
            let templatesList = JSON.parse(storedTemplates);
            templatesList = templatesList.map((t: any) => {
              if (t.flowId === flowToRename.id || t.folderName?.trim().toLowerCase() === oldName.trim().toLowerCase()) {
                return { ...t, folderName: newName, flowName: newName };
              }
              return t;
            });
            localStorage.setItem("realizzare_email_templates", JSON.stringify(templatesList));
          } catch (e) {
            console.error(e);
          }
        }
      }

      setShowRenameModal(false);
      setFlowToRename(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerDelete = (id: string) => {
    setFlowToDelete(id);
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!flowToDelete) return;

    try {
      const targetFlow = flows.find(f => f.id === flowToDelete);
      const supabase = createClient();
      await supabase.from("flows").delete().eq("id", flowToDelete);

      // Keep folder intact in E-mails library, but change all linked templates to Rascunho status
      if (typeof window !== "undefined") {
        const storedTemplates = localStorage.getItem("realizzare_email_templates");
        if (storedTemplates) {
          try {
            let templatesList = JSON.parse(storedTemplates);
            const folderId = `folder-${flowToDelete}`;
            const flowName = targetFlow?.name || "";
            templatesList = templatesList.map((t: any) => {
              if (t.flowId === flowToDelete || t.folderId === folderId || (flowName && t.folderName?.trim().toLowerCase() === flowName.trim().toLowerCase())) {
                return { ...t, status: "Rascunho" };
              }
              return t;
            });
            localStorage.setItem("realizzare_email_templates", JSON.stringify(templatesList));
          } catch (e) {
            console.error(e);
          }
        }
      }

      setFlows((prev) => prev.filter((f) => f.id !== flowToDelete));
      setShowDeleteModal(false);
      setFlowToDelete(null);
      alert("Automação excluída! A pasta permanece preservada na biblioteca de E-mails com os templates convertidos para Rascunho.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkArchive = () => {
    if (selectedIds.length === 0) return;
    alert(`Arquivando ${selectedIds.length} automações em massa...`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Tem certeza que deseja excluir ${selectedIds.length} automações selecionadas?`)) {
      const updated = flows.filter(f => !selectedIds.includes(f.id));
      saveFlowsToStorage(updated);
      setSelectedIds([]);
    }
  };

  const handleCreateFlow = async () => {
    const trimmedName = newFlowName.trim();
    if (!trimmedName) {
      alert("Por favor, insira o nome do flow!");
      return;
    }

    const nameExists = flows.some((f) => f.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
      alert(`⚠️ Já existe uma automação com o nome "${trimmedName}". Por favor, escolha um nome diferente para evitar conflitos nas pastas de e-mail.`);
      return;
    }

    try {
      const supabase = createClient();
      const payload: any = {
        org_id: "00000000-0000-0000-0000-000000000001",
        name: trimmedName,
        status: "draft",
        trigger_type: newFlowTrigger || "event"
      };

      const { data, error } = await supabase
        .from("flows")
        // @ts-ignore
        .insert(payload as any)
        .select()
        .single();
      
      if (error) throw error;

      // Sync folder to email library
      if (typeof window !== "undefined") {
        const storedFolders = localStorage.getItem("realizzare_email_folders");
        let foldersList = storedFolders ? JSON.parse(storedFolders) : [];
        const newFolderId = `folder-${(data as any).id}`;
        if (!foldersList.some((f: any) => f.id === newFolderId || f.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
          foldersList.unshift({ id: newFolderId, name: trimmedName, type: "flow" });
          localStorage.setItem("realizzare_email_folders", JSON.stringify(foldersList));
        }
      }

      setShowCreateFlowModal(false);
      router.push(`/flows/${(data as any).id}`);
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao criar automação: ${err?.message || "Tente novamente"}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-indigo-600" />
            Automações
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Crie fluxos de mensagens automáticas baseadas em ações e comportamentos dos seus alunos.
          </p>
        </div>

        <button
          onClick={() => {
            setNewFlowName("");
            setNewFlowTrigger("Iniciou Curso");
            setNewFlowDescription("");
            setShowCreateFlowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Flow</span>
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Flows Transacionais */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Flows Transacionais Ativos</span>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{kpis.transActiveCount}</span>
              <span className="text-xs font-semibold text-slate-400">fluxos ativos</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-baseline gap-1.5 flex-1 justify-end">
              <span className="text-xl font-bold text-slate-850">{kpis.transLeadsCount}</span>
              <span className="text-xs font-semibold text-slate-400">leads em progresso</span>
            </div>
            <div className="p-2.5 bg-blue-50/60 rounded-xl text-blue-600 ml-4 shrink-0">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>

        {/* Card 2: Flows de Automação */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Flows de Automação Ativos</span>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">{kpis.autoActiveCount}</span>
              <span className="text-xs font-semibold text-slate-400">fluxos ativos</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-baseline gap-1.5 flex-1 justify-end">
              <span className="text-xl font-bold text-slate-850">{kpis.autoLeadsCount}</span>
              <span className="text-xs font-semibold text-slate-400">leads em progresso</span>
            </div>
            <div className="p-2.5 bg-indigo-50/60 rounded-xl text-indigo-600 ml-4 shrink-0">
              <GitBranch className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pelo nome ou gatilho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold bg-slate-50/50 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="Ativo">Ativos</option>
                <option value="Pausado">Pausados</option>
                <option value="Rascunho">Rascunhos</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>

            {/* Period Filter */}
            <div className="relative flex items-center gap-1.5">
              <select
                value={periodPreset}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPeriodPreset(val);
                  const today = new Date();
                  const endStr = today.toISOString().split("T")[0];
                  setPeriodEndDate(endStr);
                  if (val === "7") {
                    const s = new Date();
                    s.setDate(today.getDate() - 7);
                    setPeriodStartDate(s.toISOString().split("T")[0]);
                  } else if (val === "30") {
                    const s = new Date();
                    s.setDate(today.getDate() - 30);
                    setPeriodStartDate(s.toISOString().split("T")[0]);
                  } else if (val === "90") {
                    const s = new Date();
                    s.setDate(today.getDate() - 90);
                    setPeriodStartDate(s.toISOString().split("T")[0]);
                  } else if (val === "all") {
                    setPeriodStartDate("2025-01-01");
                  }
                }}
                className="appearance-none pl-3.5 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">Todo o Período</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Período Personalizado</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />

              {periodPreset === "custom" && (
                <div className="flex items-center gap-1 animate-fadeIn">
                  <input
                    type="date"
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    className="p-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 font-bold uppercase">até</span>
                  <input
                    type="date"
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    className="p-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl animate-scaleIn">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">{selectedIds.length} selecionados</span>
              <button
                onClick={handleBulkArchive}
                className="p-1 text-slate-600 hover:text-indigo-650 hover:bg-white rounded transition-all cursor-pointer"
                title="Arquivar selecionados"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-1 text-slate-655 hover:text-red-600 hover:bg-white rounded transition-all cursor-pointer"
                title="Excluir selecionados"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Flows Table */}
      <div className="bg-white border border-slate-200 rounded-3xl lg:overflow-visible overflow-hidden shadow-sm">
        <div className="overflow-x-auto lg:overflow-x-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                <th className="py-4 px-4 w-12 text-center rounded-tl-3xl">
                  <input
                    type="checkbox"
                    checked={filteredFlows.length > 0 && selectedIds.length === filteredFlows.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                  />
                </th>
                <th className="py-4 px-4">Fluxo / Gatilho</th>
                <th className="py-4 px-4 w-28">Tipo</th>
                <th className="py-4 px-4 w-24">Status</th>
                <th className="py-4 px-4 w-36">Última Atualização</th>
                <th className="py-4 px-4 w-32 text-center">Contatos Atuais</th>
                <th className="py-4 px-4 w-28 text-center">Finalizaram</th>
                <th className="py-4 px-4 w-36 text-center">Certificados Emitidos</th>
                <th className="py-4 px-4 w-32 text-right">Receita Gerada</th>
                <th className="py-4 px-4 w-12 rounded-tr-3xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredFlows.length > 0 ? (
                filteredFlows.map((flow, index) => {
                  const isChecked = selectedIds.includes(flow.id);
                  const isMenuOpen = activeMenuId === flow.id;
                  const openUpward = index >= filteredFlows.length - 2;
                  
                  return (
                    <tr 
                      key={flow.id} 
                      className={`transition-colors ${
                        flow.status === "Ativo" 
                          ? "bg-emerald-50/65 hover:bg-emerald-50/85" 
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-4 px-4 text-center relative">
                        {flow.status === "Ativo" && (
                          <div className="absolute left-0 top-[1px] bottom-[1px] w-[3px] bg-emerald-500 rounded-r-md" />
                        )}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(flow.id, e.target.checked)}
                          className="rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/flows/${flow.id}`}
                            className="font-bold text-slate-850 hover:text-indigo-655 transition-colors"
                          >
                            {flow.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <span className="text-indigo-500">Gatilho:</span> {flow.triggerDescription}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            flow.type === "Transacional"
                              ? "bg-slate-100 border border-slate-200 text-slate-650"
                              : flow.type === "Sistema"
                              ? "bg-violet-50 border border-violet-200 text-violet-700"
                              : "bg-blue-50 border border-blue-200 text-blue-700"
                          }`}
                        >
                          {flow.type}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            flow.status === "Rascunho"
                              ? "bg-slate-100 border border-slate-200 text-slate-450"
                              : flow.status === "Ativo"
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-amber-50 border border-amber-200 text-amber-700"
                          }`}
                        >
                          {flow.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-medium">
                        {flow.updatedAt}
                      </td>

                      {/* Contatos Atuais */}
                      <td className="py-4 px-4 text-center font-bold text-slate-800">
                        {flow.activeContacts > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-655 text-[10px]">
                            {flow.activeContacts} alunos
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0</span>
                        )}
                      </td>

                      {/* Finalizaram */}
                      {(() => {
                        const finishedContacts = flow.finishedContacts !== undefined ? flow.finishedContacts : (
                          flow.status === "Ativo" ? Math.round(flow.activeContacts * 3.5 + 14) :
                          flow.status === "Pausado" ? Math.round(flow.activeContacts * 1.5 + 4) : 0
                        );
                        const certificatesIssued = flow.certificatesIssued !== undefined ? flow.certificatesIssued : (
                          flow.status === "Ativo" ? Math.round(finishedContacts * 0.8) :
                          flow.status === "Pausado" ? Math.round(finishedContacts * 0.7) : 0
                        );
                        
                        return (
                          <>
                            <td className="py-4 px-4 text-center font-bold text-slate-800">
                              {finishedContacts > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[10px]">
                                  {finishedContacts} alunos
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">0</span>
                              )}
                            </td>

                            <td className="py-4 px-4 text-center font-bold text-slate-850">
                              {certificatesIssued > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-[10px]">
                                  {certificatesIssued}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">0</span>
                              )}
                            </td>
                          </>
                        );
                      })()}

                      {/* Receita Gerada */}
                      <td className="py-4 px-4 text-right font-black text-slate-800">
                        {flow.revenue > 0 ? (
                          flow.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        ) : (
                          <span className="text-slate-400 font-medium">R$ 0,00</span>
                        )}
                      </td>

                      <td className="py-4 px-4 relative text-center">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : flow.id)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>

                        {isMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-4 top-full mt-1 w-44 bg-white border border-slate-202 rounded-xl shadow-xl p-1.5 z-20 text-left animate-fadeIn animate-scaleIn">
                              <Link
                                href={`/flows/${flow.id}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                <span>Editar Flow</span>
                              </Link>
                              
                              <button
                                onClick={() => handleToggleStatus(flow.id)}
                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold transition-colors text-left cursor-pointer ${
                                  flow.status === "Ativo"
                                    ? "text-amber-700 hover:bg-amber-50"
                                    : "text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                {flow.status === "Ativo" ? (
                                  <>
                                    <Pause className="h-3.5 w-3.5" />
                                    <span>Pausar Flow</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5" />
                                    <span>Ativar Flow</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleCloneFlow(flow.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                <span>Duplicar</span>
                              </button>
                              
                              <button
                                onClick={() => handleTriggerRename(flow)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                <span>Renomear</span>
                              </button>

                              <div className="h-[1px] bg-slate-100 my-1" />

                              <button
                                onClick={() => handleTriggerDelete(flow.id)}
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
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    Nenhuma automação encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs text-slate-500 font-semibold bg-slate-50/50">
          <span>Mostrando {filteredFlows.length} de {flows.length} automações</span>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 cursor-pointer transition-colors" disabled>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-755 font-bold">1</span>
            <button className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 cursor-pointer transition-colors" disabled>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: DELETE FLOW CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Excluir Automação?</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Tem certeza que deseja excluir esta automação? Todos os contatos em progresso nela serão removidos e essa ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-red-500/10"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RENAME FLOW */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-650">
                <Edit2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Renomear Automação</h3>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Novo nome do flow</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Insira o nome..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-600/10"
              >
                Salvar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE FLOW */}
      {showCreateFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-650">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Criar Nova Automação</h3>
                <p className="text-[11px] text-slate-500 font-medium">Configure as informações básicas da sua nova automação</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Nome do Fluxo</label>
                <input
                  type="text"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Ex: Boas-vindas - Novos Leads"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Gatilho de Entrada (Trigger)</label>
                <select
                  value={newFlowTrigger}
                  onChange={(e) => {
                    const trigger = e.target.value;
                    setNewFlowTrigger(trigger);
                    if (trigger === "Iniciou Curso") {
                      setNewFlowType("Automação");
                      setNewFlowName(selectedCourse);
                    } else {
                      setNewFlowType("Transacional");
                      setNewFlowName("");
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all cursor-pointer bg-white"
                >
                  <option value="Iniciou Curso">Iniciou um Curso</option>
                  <option value="Comprou Certificado">Comprou um Certificado</option>
                  <option value="Abandonou Carrinho">Abandonou Carrinho no checkout</option>
                  <option value="Adicionado a uma Lista">Adicionado a uma Lista</option>
                  <option value="Preencheu Formulário">Preencheu um Formulário</option>
                </select>
              </div>

              {newFlowTrigger === "Iniciou Curso" && (
                <div className="space-y-1.5 relative animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Selecione o Curso</label>
                  <button
                    type="button"
                    onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-left focus:border-indigo-500 outline-none transition-all cursor-pointer bg-white flex items-center justify-between shadow-2xs"
                  >
                    <span>{selectedCourse}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {showCourseDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCourseDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-scaleIn text-left">
                        <input
                          type="text"
                          placeholder="Buscar curso..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border-b border-slate-100 text-xs font-semibold focus:outline-none placeholder:text-slate-400 bg-slate-50/50"
                          autoFocus
                        />
                        <div className="max-h-48 overflow-y-auto py-1">
                          {mockCoursesList
                            .filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setSelectedCourse(c);
                                  setNewFlowName(c);
                                  setShowCourseDropdown(false);
                                  setSearchTerm("");
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-indigo-50/50 hover:text-indigo-700 block ${
                                  selectedCourse === c ? "text-indigo-600 bg-indigo-50/40 font-black" : "text-slate-650"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          {mockCoursesList.filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                              Nenhum curso encontrado
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Tipo de Envio</label>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setNewFlowType("Automação")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      newFlowType === "Automação" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    Automação
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFlowType("Transacional")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      newFlowType === "Transacional" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    Transacional
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFlowType("Sistema")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      newFlowType === "Sistema" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    Sistema
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Descrição / Objetivo</label>
                <textarea
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  placeholder="Descreva brevemente o objetivo deste fluxo..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateFlowModal(false)}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateFlow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-500/10"
              >
                Criar Flow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLONE/DUPLICATE FLOW */}
      {showCloneFlowModal && flowToClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-650">
                <Copy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Duplicar Automação</h3>
                <p className="text-[11px] text-slate-500 font-medium">As alterações marcadas abaixo serão aplicadas apenas ao novo flow duplicado.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Nome do Novo Fluxo</label>
                <input
                  type="text"
                  value={cloneFlowName}
                  onChange={(e) => setCloneFlowName(e.target.value)}
                  placeholder="Ex: Boas-vindas - Cópia"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Gatilho de Entrada (Trigger)</label>
                <select
                  value={cloneFlowTrigger}
                  onChange={(e) => {
                    const trigger = e.target.value;
                    setCloneFlowTrigger(trigger);
                    if (trigger === "Iniciou Curso") {
                      setCloneFlowType("Automação");
                      setCloneFlowName(cloneSelectedCourse);
                    } else {
                      setCloneFlowType("Transacional");
                      setCloneFlowName("");
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all cursor-pointer bg-white"
                >
                  <option value="Iniciou Curso">Iniciou um Curso</option>
                  <option value="Comprou Certificado">Comprou um Certificado</option>
                  <option value="Abandonou Carrinho">Abandonou Carrinho no checkout</option>
                  <option value="Adicionado a uma Lista">Adicionado a uma Lista</option>
                  <option value="Preencheu Formulário">Preencheu um Formulário</option>
                </select>
              </div>

              {cloneFlowTrigger === "Iniciou Curso" && (
                <div className="space-y-1.5 relative animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Selecione o Curso</label>
                  <button
                    type="button"
                    onClick={() => setShowCloneCourseDropdown(!showCloneCourseDropdown)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-left focus:border-indigo-500 outline-none transition-all cursor-pointer bg-white flex items-center justify-between shadow-2xs"
                  >
                    <span>{cloneSelectedCourse}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {showCloneCourseDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCloneCourseDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-scaleIn text-left">
                        <input
                          type="text"
                          placeholder="Buscar curso..."
                          value={cloneSearchTerm}
                          onChange={(e) => setCloneSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border-b border-slate-100 text-xs font-semibold focus:outline-none placeholder:text-slate-400 bg-slate-50/50"
                          autoFocus
                        />
                        <div className="max-h-48 overflow-y-auto py-1">
                          {mockCoursesList
                            .filter((c) => c.toLowerCase().includes(cloneSearchTerm.toLowerCase()))
                            .map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCloneSelectedCourse(c);
                                  setCloneFlowName(c);
                                  setShowCloneCourseDropdown(false);
                                  setCloneSearchTerm("");
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors hover:bg-indigo-50/50 hover:text-indigo-700 block ${
                                  cloneSelectedCourse === c ? "text-indigo-600 bg-indigo-50/40 font-black" : "text-slate-650"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          {mockCoursesList.filter((c) => c.toLowerCase().includes(cloneSearchTerm.toLowerCase())).length === 0 && (
                            <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                              Nenhum curso encontrado
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Tipo de Envio</label>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setCloneFlowType("Automação")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      cloneFlowType === "Automação" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    Automação
                  </button>
                  <button
                    type="button"
                    onClick={() => setCloneFlowType("Transacional")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      cloneFlowType === "Transacional" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    Transacional
                  </button>
                  <button
                    type="button"
                    onClick={() => setCloneFlowType("Sistema")}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      cloneFlowType === "Sistema" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    Sistema
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Descrição / Objetivo</label>
                <textarea
                  value={cloneFlowDescription}
                  onChange={(e) => setCloneFlowDescription(e.target.value)}
                  placeholder="Descreva brevemente o objetivo deste fluxo..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCloneFlowModal(false);
                  setFlowToClone(null);
                }}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCloneFlow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-500/10"
              >
                Duplicar Automação
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
