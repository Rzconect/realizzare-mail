"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Plus,
  Folder,
  FolderPlus,
  GitBranch,
  Edit3,
  BarChart2,
  Copy,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  ExternalLink,
  ChevronRight,
  FolderOpen,
  Filter,
  Check,
  Code,
  DollarSign,
  Mail,
  Users,
  MousePointerClick
} from "lucide-react";

export default function EmailsLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "active">("all");
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>("all");

  // Storage states
  const [folders, setFolders] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal: New Campaign / Template
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [customFolderName, setCustomFolderName] = useState("");

  // Modal: HTML Editor
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editPreviewText, setEditPreviewText] = useState("");
  const [editHtmlContent, setEditHtmlContent] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("preview");

  // Modal: Metrics Popover/Modal
  const [metricsTemplate, setMetricsTemplate] = useState<any | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Initial Data & Persistence
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFolders = localStorage.getItem("realizzare_email_folders");
      const storedTemplates = localStorage.getItem("realizzare_email_templates");
      const storedFlows = localStorage.getItem("realizzare_mock_flows");

      let loadedFolders = [
        { id: "folder-boas-vindas", name: "Boas-vindas", type: "flow" },
        { id: "folder-carrinho", name: "Recuperação de Carrinho", type: "flow" },
        { id: "folder-nutricao", name: "Nutrição de Leads", type: "flow" },
        { id: "folder-pontual", name: "Campanhas Pontuais / Rascunhos", type: "pontual" }
      ];

      if (storedFolders) {
        try {
          loadedFolders = JSON.parse(storedFolders);
        } catch (e) {
          console.error(e);
        }
      }

      let loadedFlows: any[] = [];
      if (storedFlows) {
        try {
          loadedFlows = JSON.parse(storedFlows);
        } catch (e) {
          console.error(e);
        }
      }
      setFlows(loadedFlows);

      let loadedTemplates = [
        {
          id: "tpl-1",
          name: "E-mail 01 - Boas-vindas ao Aluno",
          subject: "🎓 Seja bem-vindo à Realizzare Cursos!",
          previewText: "Confira como acessar suas primeiras aulas gratuitas...",
          htmlContent: `<div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
  <h2 style="color: #4f46e5;">Olá {{primeiro_nome}}, seja muito bem-vindo!</h2>
  <p>Estamos felizes em ter você conosco na Realizzare Cursos. Sua jornada de aprendizado começa agora!</p>
  <p><a href="https://www.realizzarecursos.com.br" style="background: #4f46e5; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Acessar Minha Conta</a></p>
</div>`,
          folderId: "folder-boas-vindas",
          folderName: "Boas-vindas",
          flowId: "flow-1",
          flowName: "Boas-vindas - Novo Aluno",
          status: "Ativo",
          updatedAt: "22/08/2026",
          metrics: {
            sentCount: 1420,
            openCount: 688,
            openRate: 48.5,
            clickCount: 258,
            clickRate: 18.2,
            conversionCount: 38,
            conversionRevenue: 2128.0
          }
        },
        {
          id: "tpl-2",
          name: "E-mail 02 - Recomendação de Cursos em Destaque",
          subject: "🔥 Veja os cursos mais acessados desta semana",
          previewText: "Separamos 3 qualificações perfeitas para seu perfil.",
          htmlContent: `<div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
  <h2>Olá {{primeiro_nome}}, que tal continuar aprendendo?</h2>
  <p>Confira nossa seleção semanal de cursos com certificado reconhecido.</p>
</div>`,
          folderId: "folder-boas-vindas",
          folderName: "Boas-vindas",
          flowId: "flow-1",
          flowName: "Boas-vindas - Novo Aluno",
          status: "Ativo",
          updatedAt: "20/08/2026",
          metrics: {
            sentCount: 1210,
            openCount: 440,
            openRate: 36.4,
            clickCount: 146,
            clickRate: 12.1,
            conversionCount: 19,
            conversionRevenue: 1064.0
          }
        },
        {
          id: "tpl-3",
          name: "Alerta de Carrinho Abandonado",
          subject: "⚠️ Você esqueceu seu certificado no carrinho!",
          previewText: "Conclua sua emissão com desconto especial hoje.",
          htmlContent: `<div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
  <h2>{{primeiro_nome}}, seu certificado está aguardando!</h2>
  <p>Não perca a oportunidade de emitir seu certificado com preço promocional.</p>
</div>`,
          folderId: "folder-carrinho",
          folderName: "Recuperação de Carrinho",
          flowId: "flow-2",
          flowName: "Recuperação de Checkout",
          status: "Ativo",
          updatedAt: "19/08/2026",
          metrics: {
            sentCount: 480,
            openCount: 250,
            openRate: 52.1,
            clickCount: 118,
            clickRate: 24.5,
            conversionCount: 42,
            conversionRevenue: 2352.0
          }
        },
        {
          id: "tpl-4",
          name: "Rascunho Oferta Especial Black Friday",
          subject: "🚀 Ofertas imperdíveis em todos os cursos!",
          previewText: "Descontos de até 50% na emissão do certificado IES/MEC.",
          htmlContent: `<div style="font-family: sans-serif; padding: 20px;"><h1>Oferta Especial Black Friday</h1></div>`,
          folderId: "folder-pontual",
          folderName: "Campanhas Pontuais / Rascunhos",
          status: "Rascunho",
          updatedAt: "15/08/2026",
          metrics: {
            sentCount: 0,
            openCount: 0,
            openRate: 0,
            clickCount: 0,
            clickRate: 0,
            conversionCount: 0,
            conversionRevenue: 0
          }
        }
      ];

      if (storedTemplates) {
        try {
          loadedTemplates = JSON.parse(storedTemplates);
        } catch (e) {
          console.error(e);
        }
      }

      setFolders(loadedFolders);
      setTemplates(loadedTemplates);
      if (!storedFolders) localStorage.setItem("realizzare_email_folders", JSON.stringify(loadedFolders));
      if (!storedTemplates) localStorage.setItem("realizzare_email_templates", JSON.stringify(loadedTemplates));
      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = (updatedFolders: any[], updatedTemplates: any[]) => {
    setFolders(updatedFolders);
    setTemplates(updatedTemplates);
    if (typeof window !== "undefined") {
      localStorage.setItem("realizzare_email_folders", JSON.stringify(updatedFolders));
      localStorage.setItem("realizzare_email_templates", JSON.stringify(updatedTemplates));
    }
  };

  // Handlers
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    let targetFolderId = selectedFolderId;
    let targetFolderName = "Campanhas Pontuais / Rascunhos";
    let updatedFolders = [...folders];

    if (isCreatingNewFolder && customFolderName.trim()) {
      const newF = {
        id: `folder-${Date.now()}`,
        name: customFolderName.trim(),
        type: "flow"
      };
      updatedFolders.push(newF);
      targetFolderId = newF.id;
      targetFolderName = newF.name;
    } else {
      const foundF = folders.find((f) => f.id === selectedFolderId);
      if (foundF) targetFolderName = foundF.name;
    }

    const newTpl = {
      id: `tpl-${Date.now()}`,
      name: newTemplateName.trim(),
      subject: newTemplateSubject.trim() || "Assunto do E-mail",
      previewText: "Texto de pré-visualização...",
      htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
  <h2 style="color: #4f46e5;">Olá {{primeiro_nome}}!</h2>
  <p>Escreva o conteúdo do seu novo e-mail aqui...</p>
</div>`,
      folderId: targetFolderId || "folder-pontual",
      folderName: targetFolderName,
      status: "Rascunho",
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      metrics: {
        sentCount: 0,
        openCount: 0,
        openRate: 0,
        clickCount: 0,
        clickRate: 0,
        conversionCount: 0,
        conversionRevenue: 0
      }
    };

    const updatedTemplates = [newTpl, ...templates];
    saveToStorage(updatedFolders, updatedTemplates);

    setShowNewModal(false);
    setNewTemplateName("");
    setNewTemplateSubject("");
    setCustomFolderName("");
    setIsCreatingNewFolder(false);
    showToast("Nova campanha criada com sucesso como Rascunho!");
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    if (!target) return;

    const cloned = {
      ...target,
      id: `tpl-${Date.now()}`,
      name: `${target.name} (Cópia)`,
      status: "Rascunho",
      flowId: undefined,
      flowName: undefined,
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      metrics: {
        sentCount: 0,
        openCount: 0,
        openRate: 0,
        clickCount: 0,
        clickRate: 0,
        conversionCount: 0,
        conversionRevenue: 0
      }
    };

    const updatedTemplates = [cloned, ...templates];
    saveToStorage(folders, updatedTemplates);
    showToast(`Campanha "${target.name}" duplicada como Rascunho!`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    if (!target) return;
    if (confirm(`Tem certeza que deseja excluir a campanha "${target.name}"?`)) {
      const updated = templates.filter((t) => t.id !== templateId);
      saveToStorage(folders, updated);
      showToast("Campanha excluída com sucesso.");
    }
  };

  const handleSaveHtmlContent = () => {
    if (!editingTemplate) return;
    const updatedTemplates = templates.map((t) => {
      if (t.id === editingTemplate.id) {
        return {
          ...t,
          subject: editSubject,
          previewText: editPreviewText,
          htmlContent: editHtmlContent,
          updatedAt: new Date().toLocaleDateString("pt-BR")
        };
      }
      return t;
    });
    saveToStorage(folders, updatedTemplates);
    setEditingTemplate(null);
    showToast("Conteúdo do e-mail salvo com sucesso!");
  };

  // Filtered Templates
  const filteredTemplates = templates.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.name.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      (t.flowName && t.flowName.toLowerCase().includes(query)) ||
      (t.folderName && t.folderName.toLowerCase().includes(query));

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "draft" && t.status === "Rascunho") ||
      (filterStatus === "active" && t.status === "Ativo");

    const matchesFolder =
      selectedFolderFilter === "all" || t.folderId === selectedFolderFilter;

    return matchesSearch && matchesStatus && matchesFolder;
  });

  // Calculate Metrics Header Totals
  const totalCount = templates.length;
  const draftCount = templates.filter((t) => t.status === "Rascunho").length;
  const activeCount = templates.filter((t) => t.status === "Ativo").length;
  const totalRevenue = templates.reduce((acc, t) => acc + (t.metrics?.conversionRevenue || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-850 tracking-tight">
              Gestão de E-mails & Templates
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Crie, organize por pastas de fluxo e reutilize seus e-mails em automações ou campanhas pontuais.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] text-sm"
        >
          <Plus className="h-5 w-5" />
          Nova Campanha / Template
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total de E-mails</span>
            <Mail className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Templates criados no sistema</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rascunhos</span>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black text-slate-700">{draftCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Disponíveis para edição</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ativos em Fluxos</span>
            <GitBranch className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Vinculados a automações</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Receita Atribuída</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}
          </p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Vendas via e-mails de fluxo</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome do e-mail, fluxo ou pasta..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "all" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "draft" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Rascunhos
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "active" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Ativos
            </button>
          </div>

          <select
            value={selectedFolderFilter}
            onChange={(e) => setSelectedFolderFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Todas as Pastas</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View: Grouped by Folder */}
      {folders.map((folder) => {
        const folderTemplates = filteredTemplates.filter((t) => t.folderId === folder.id);
        if (selectedFolderFilter !== "all" && selectedFolderFilter !== folder.id) return null;
        if (searchQuery && folderTemplates.length === 0) return null;

        return (
          <div key={folder.id} className="space-y-4">
            {/* Folder Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 pt-2">
              <div className="flex items-center gap-2.5">
                <FolderOpen className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">{folder.name}</h2>
                <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {folderTemplates.length} e-mail{folderTemplates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Folder Empty State */}
            {folderTemplates.length === 0 ? (
              <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <p className="text-xs text-slate-400 font-medium">Nenhum e-mail nesta pasta ainda.</p>
              </div>
            ) : (
              /* Templates Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {folderTemplates.map((template) => {
                  const isActive = template.status === "Ativo";
                  return (
                    <div
                      key={template.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div>
                        {/* Top Card Bar: Status Badge & Actions */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {template.status}
                          </span>

                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                            {/* Metrics Popover Trigger */}
                            <button
                              onClick={() => setMetricsTemplate(template)}
                              title="Visualizar Métricas"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                              <BarChart2 className="h-4 w-4" />
                            </button>

                            {/* Duplicate Template */}
                            <button
                              onClick={() => handleDuplicateTemplate(template.id)}
                              title="Duplicar E-mail"
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>

                            {/* Delete Template */}
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Excluir E-mail"
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Subject */}
                        <h3 className="font-extrabold text-slate-850 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                          Assunto: "{template.subject}"
                        </p>

                        {/* Flow Status Link Sub-text */}
                        {isActive && template.flowName && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                            <GitBranch className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span className="truncate">Ativo no flow:</span>
                            <Link
                              href={template.flowId ? `/flows/${template.flowId}` : "/dashboard/automations"}
                              className="text-indigo-600 hover:underline flex items-center gap-1 font-extrabold truncate"
                            >
                              {template.flowName}
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Metrics Summary & Edit Button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400 font-medium">
                          Atualizado: {template.updatedAt}
                        </div>

                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setEditSubject(template.subject || "");
                            setEditPreviewText(template.previewText || "");
                            setEditHtmlContent(template.htmlContent || "");
                            setEditorTab("preview");
                          }}
                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Editar HTML
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* MODAL: Criar Nova Campanha / Template */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black text-slate-850">Nova Campanha / Template</h2>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Campanha / Template *
                </label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Ex: E-mail 01 - Boas-vindas ao Aluno"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assunto Inicial
                </label>
                <input
                  type="text"
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  placeholder="Ex: 🎓 Seja bem-vindo à Realizzare Cursos!"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Atribuir ao Fluxo ou Pasta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Atribuir à Pasta / Fluxo
                </label>
                {!isCreatingNewFolder ? (
                  <div className="space-y-2">
                    <select
                      value={selectedFolderId}
                      onChange={(e) => {
                        if (e.target.value === "NEW_FOLDER") {
                          setIsCreatingNewFolder(true);
                        } else {
                          setSelectedFolderId(e.target.value);
                        }
                      }}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">Selecione uma pasta existente ou crie uma nova...</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                      <option value="NEW_FOLDER" className="font-bold text-indigo-600">
                        ➕ Criar Novo Fluxo / Pasta...
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customFolderName}
                        onChange={(e) => setCustomFolderName(e.target.value)}
                        placeholder="Digite o nome da nova pasta/fluxo..."
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewFolder(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline shrink-0 px-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Criar Rascunho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HTML Editor & Preview */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-850">{editingTemplate.name}</h2>
                <p className="text-xs text-slate-500">Edite o assunto e o template HTML do e-mail.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setEditorTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${editorTab === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1" />
                    Pré-visualização
                  </button>
                  <button
                    onClick={() => setEditorTab("edit")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${editorTab === "edit" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}
                  >
                    <Code className="h-3.5 w-3.5 inline mr-1" />
                    Código HTML
                  </button>
                </div>

                <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Assunto do E-mail</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Texto de Pré-visualização (Preheader)</label>
                <input
                  type="text"
                  value={editPreviewText}
                  onChange={(e) => setEditPreviewText(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-slate-200 rounded-2xl bg-slate-50 p-4">
              {editorTab === "edit" ? (
                <textarea
                  value={editHtmlContent}
                  onChange={(e) => setEditHtmlContent(e.target.value)}
                  placeholder="<div>Cole ou digite seu código HTML aqui...</div>"
                  className="w-full h-72 font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-800"
                />
              ) : (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 min-h-[280px]">
                  <div dangerouslySetInnerHTML={{ __html: editHtmlContent || "<p class='text-slate-400 text-xs italic'>Nenhum conteúdo HTML definido.</p>" }} />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHtmlContent}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
              >
                <Check className="h-4 w-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Visualizar Métricas da Campanha */}
      {metricsTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-850">Métricas de Desempenho</h2>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">{metricsTemplate.name}</p>
                </div>
              </div>
              <button onClick={() => setMetricsTemplate(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase">E-mails Entregues</span>
                <p className="text-lg font-black text-slate-800 mt-1">{metricsTemplate.metrics?.sentCount || 0}</p>
              </div>

              <div className="bg-cyan-50/60 border border-cyan-100 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold text-cyan-700 uppercase">Aberturas Únicas</span>
                <p className="text-lg font-black text-cyan-800 mt-1">
                  {metricsTemplate.metrics?.openCount || 0}{" "}
                  <span className="text-xs font-semibold text-cyan-600">({metricsTemplate.metrics?.openRate || 0}%)</span>
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Cliques Únicos</span>
                <p className="text-lg font-black text-emerald-800 mt-1">
                  {metricsTemplate.metrics?.clickCount || 0}{" "}
                  <span className="text-xs font-semibold text-emerald-600">({metricsTemplate.metrics?.clickRate || 0}%)</span>
                </p>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-2xl">
                <span className="text-[10px] font-bold text-indigo-700 uppercase">Conversões</span>
                <p className="text-lg font-black text-indigo-800 mt-1">
                  {metricsTemplate.metrics?.conversionCount || 0} compras
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 font-medium">Receita Atribuída ao E-mail (Last-Touch)</span>
              <p className="text-xl font-black text-emerald-400">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                  metricsTemplate.metrics?.conversionRevenue || 0
                )}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setMetricsTemplate(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
