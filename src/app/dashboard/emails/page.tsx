"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  ChevronDown,
  FolderOpen,
  Filter,
  Check,
  Code,
  DollarSign,
  Mail,
  Users,
  Laptop,
  Smartphone,
  RotateCcw,
  Layers,
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

  // Accordion Drawer State: map of folder IDs that are open
  const [openFolderIds, setOpenFolderIds] = useState<Record<string, boolean>>({});

  // Card 3D Flip State: record of template IDs currently flipped to metrics side
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

  // Pagination limit per folder for large volume performance (e.g. 6 items initially)
  const [folderDisplayLimits, setFolderDisplayLimits] = useState<Record<string, number>>({});

  // Modal: New Campaign / Template
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTemplatePreheader, setNewTemplatePreheader] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [customFolderName, setCustomFolderName] = useState("");

  // Modal: Standalone New Folder
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [standaloneFolderName, setStandaloneFolderName] = useState("");
  const [standaloneFolderType, setStandaloneFolderType] = useState<"flow" | "pontual">("flow");

  // Modal: Duplicate Whole Folder
  const [duplicatingFolder, setDuplicatingFolder] = useState<any | null>(null);
  const [duplicateFolderName, setDuplicateFolderName] = useState("");

  // Modal: HTML Editor
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editPreviewText, setEditPreviewText] = useState("");
  const [editHtmlContent, setEditHtmlContent] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("preview");
  const [editorPreviewDevice, setEditorPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Modal: Full Web & Mobile Preview
  const [fullPreviewTemplate, setFullPreviewTemplate] = useState<any | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Initial Data & 2-Way Sync with Supabase (Flows, Flow Nodes, Campaigns)
  useEffect(() => {
    const initializeLibrary = async () => {
      if (typeof window === "undefined") return;

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
          loadedFlows.forEach((flow: any) => {
            const exists = loadedFolders.some(
              (f) => f.name.trim().toLowerCase() === flow.name.trim().toLowerCase() || f.id === `folder-${flow.id}`
            );
            if (!exists) {
              loadedFolders.push({
                id: `folder-${flow.id}`,
                name: flow.name.trim(),
                type: "flow"
              });
            }
          });
        } catch (e) {
          console.error(e);
        }
      }

      let loadedTemplates: any[] = [
        {
          id: "tpl-1",
          name: "E-mail 01 - Boas-vindas ao Aluno",
          subject: "🎓 Seja bem-vindo à Realizzare Cursos!",
          previewText: "Confira como acessar suas primeiras aulas gratuitas...",
          htmlContent: `<div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
  <h2 style="color: #4f46e5; margin-top: 0;">Olá {{primeiro_nome}}, seja muito bem-vindo!</h2>
  <p>Estamos felizes em ter você conosco na Realizzare Cursos. Sua jornada de aprendizado profissional começa agora!</p>
  <p style="margin: 24px 0;"><a href="https://www.realizzarecursos.com.br" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Acessar Minha Conta</a></p>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size: 12px; color: #888;">Realizzare Cursos • Plataforma EAD</p>
</div>`,
          folderId: "folder-boas-vindas",
          folderName: "Boas-vindas",
          flowId: "flow-1",
          flowName: "Boas-vindas - Novo Aluno",
          status: "Ativo",
          updatedAt: "22/08/2026",
          metrics: { sentCount: 1420, openCount: 688, openRate: 48.5, clickCount: 258, clickRate: 18.2, conversionCount: 0, conversionRevenue: 0.0 }
        },
        {
          id: "tpl-2",
          name: "E-mail 02 - Recomendação de Cursos em Destaque",
          subject: "🔥 Veja os cursos mais acessados desta semana",
          previewText: "Separamos 3 qualificações perfeitas para seu perfil profissional.",
          htmlContent: `<div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
  <h2 style="color: #0284c7; margin-top: 0;">Olá {{primeiro_nome}}, continue se qualificando!</h2>
  <p>Confira nossa seleção especial de cursos em alta neste mês:</p>
  <ul>
    <li>Curso de Excel Avançado</li>
    <li>Curso de Comunicação e Oratória</li>
    <li>Curso de Gestão de Projetos</li>
  </ul>
</div>`,
          folderId: "folder-boas-vindas",
          folderName: "Boas-vindas",
          flowId: "flow-1",
          flowName: "Boas-vindas - Novo Aluno",
          status: "Ativo",
          updatedAt: "20/08/2026",
          metrics: { sentCount: 1210, openCount: 440, openRate: 36.4, clickCount: 146, clickRate: 12.1, conversionCount: 0, conversionRevenue: 0.0 }
        },
        {
          id: "tpl-3",
          name: "Alerta de Carrinho Abandonado",
          subject: "⚠️ Você esqueceu seu certificado no carrinho!",
          previewText: "Conclua sua emissão com desconto especial antes de expirar.",
          htmlContent: `<div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
  <h2 style="color: #dc2626; margin-top: 0;">{{primeiro_nome}}, seu certificado está aguardando!</h2>
  <p>Não perca a oportunidade de emitir seu certificado com validade IES/MEC por um valor promocional.</p>
  <p style="margin-top: 20px;"><a href="https://www.realizzarecursos.com.br/checkout" style="background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Finalizar Emissão</a></p>
</div>`,
          folderId: "folder-carrinho",
          folderName: "Recuperação de Carrinho",
          flowId: "flow-2",
          flowName: "Recuperação de Checkout",
          status: "Ativo",
          updatedAt: "19/08/2026",
          metrics: { sentCount: 480, openCount: 250, openRate: 52.1, clickCount: 118, clickRate: 24.5, conversionCount: 0, conversionRevenue: 0.0 }
        },
        {
          id: "tpl-4",
          name: "Rascunho Oferta Especial Black Friday",
          subject: "🚀 Ofertas imperdíveis em todos os certificados!",
          previewText: "Descontos exclusivos de até 50% por tempo limitado.",
          htmlContent: `<div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background: #0f172a; color: #fff; border-radius: 8px;">
  <h1 style="color: #f59e0b;">BLACK FRIDAY REALIZZARE</h1>
  <p>Aproveite os descontos especiais em todos os certificados!</p>
</div>`,
          folderId: "folder-pontual",
          folderName: "Campanhas Pontuais / Rascunhos",
          status: "Rascunho",
          updatedAt: "15/08/2026",
          metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0.0 }
        }
      ];

      if (storedTemplates) {
        try {
          loadedTemplates = JSON.parse(storedTemplates);
        } catch (e) {
          console.error(e);
        }
      }

      // Clear any legacy mock revenue values from stored templates
      loadedTemplates = loadedTemplates.map((t: any) => ({
        ...t,
        metrics: {
          ...t.metrics,
          conversionRevenue: 0.0
        }
      }));

      // Fetch all real past campaigns & flows from Supabase database
      try {
        const supabase = createClient();

        // 1. Fetch Flows from Supabase and build folders
        const { data: dbFlows } = await supabase.from("flows").select("*").order("created_at", { ascending: false });

        if (dbFlows && dbFlows.length > 0) {
          dbFlows.forEach((flow: any) => {
            const exists = loadedFolders.some(
              (f) => f.name.trim().toLowerCase() === flow.name.trim().toLowerCase() || f.id === `folder-${flow.id}`
            );
            if (!exists) {
              loadedFolders.push({
                id: `folder-${flow.id}`,
                name: flow.name.trim(),
                type: "flow"
              });
            }
          });

          // Fetch email nodes inside flows
          const { data: dbEmailNodes } = await supabase
            .from("flow_nodes")
            .select("*, flows(name, status)")
            .eq("node_type", "email")
            .eq("is_deleted", false);

          if (dbEmailNodes && dbEmailNodes.length > 0) {
            dbEmailNodes.forEach((node: any) => {
              const flowName = node.flows?.name || "Automação";
              const isFlowActive = node.flows?.status === "active";
              const cfg = node.config || {};
              const nodeStatus = cfg.status || (isFlowActive ? "Ativo" : "Rascunho");
              const folderId = `folder-${node.flow_id}`;

              // Ensure folder exists
              if (!loadedFolders.some((f) => f.id === folderId || f.name.trim().toLowerCase() === flowName.trim().toLowerCase())) {
                loadedFolders.push({ id: folderId, name: flowName, type: "flow" });
              }

              const tplId = `node-tpl-${node.id}`;
              const tplName = cfg.campaignName || cfg.campaign_name || node.name || `E-mail do Fluxo ${flowName}`;

              const existingIdx = loadedTemplates.findIndex(
                (t: any) => t.id === tplId || (t.flowId === node.flow_id && t.name.trim().toLowerCase() === tplName.trim().toLowerCase())
              );

              if (existingIdx < 0) {
                loadedTemplates.unshift({
                  id: tplId,
                  nodeId: node.id,
                  name: tplName,
                  subject: cfg.subject || cfg.subject_line || tplName,
                  previewText: cfg.preheader || cfg.preview_text || "",
                  htmlContent: cfg.htmlContent || cfg.html_content || cfg.html || `<div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
  <h2 style="color: #4f46e5; margin-top: 0;">${tplName}</h2>
  <p>${cfg.subject || ""}</p>
</div>`,
                  folderId: folderId,
                  folderName: flowName,
                  flowId: node.flow_id,
                  flowName: flowName,
                  status: nodeStatus,
                  updatedAt: new Date(node.created_at || Date.now()).toLocaleDateString("pt-BR"),
                  metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0.0 }
                });
              } else {
                // Keep node status synced with flow/node setting
                loadedTemplates[existingIdx].status = nodeStatus;
              }
            });
          }
        }

        // 2. Fetch past campaigns from Supabase
        const { data: dbCampaigns } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });

        if (dbCampaigns && dbCampaigns.length > 0) {
          dbCampaigns.forEach((camp: any) => {
            const exists = loadedTemplates.some(
              (t: any) =>
                t.id === `c-tpl-${camp.id}` ||
                (t.name.trim().toLowerCase() === camp.name.trim().toLowerCase() && t.folderId === "folder-pontual")
            );

            if (!exists) {
              loadedTemplates.unshift({
                id: `c-tpl-${camp.id}`,
                name: camp.name,
                subject: camp.subject || camp.name,
                previewText: camp.preview_text || "",
                htmlContent: camp.html_content || `<div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
  <h2 style="color: #4f46e5; margin-top: 0;">${camp.name}</h2>
  <p>${camp.subject || ""}</p>
</div>`,
                folderId: "folder-pontual",
                folderName: "Campanhas Pontuais / Rascunhos",
                status: camp.status === "sent" || camp.status === "Enviado" || camp.status === "Enviando" || camp.status === "scheduled" ? "Ativo" : "Rascunho",
                updatedAt: new Date(camp.created_at || Date.now()).toLocaleDateString("pt-BR"),
                metrics: {
                  sentCount: camp.sent_count || 0,
                  openCount: camp.open_count || 0,
                  openRate: camp.open_rate || 0,
                  clickCount: camp.click_count || 0,
                  clickRate: camp.click_rate || 0,
                  conversionCount: 0,
                  conversionRevenue: 0.0
                }
              });
            }
          });
        }
      } catch (err) {
        console.error("Erro ao sincronizar com Supabase:", err);
      }

      setFolders(loadedFolders);
      setTemplates(loadedTemplates);

      if (loadedFolders.length > 0) {
        const initialOpenMap: Record<string, boolean> = {};
        initialOpenMap[loadedFolders[0].id] = true;
        setOpenFolderIds(initialOpenMap);
      }

      localStorage.setItem("realizzare_email_folders", JSON.stringify(loadedFolders));
      localStorage.setItem("realizzare_email_templates", JSON.stringify(loadedTemplates));
      setIsLoaded(true);
    };

    initializeLibrary();
  }, []);

  // Auto-expand drawers when searching or selecting folder filter
  useEffect(() => {
    if (searchQuery.trim() || selectedFolderFilter !== "all") {
      const allOpenMap: Record<string, boolean> = {};
      folders.forEach((f) => (allOpenMap[f.id] = true));
      setOpenFolderIds(allOpenMap);
    }
  }, [searchQuery, selectedFolderFilter, folders]);

  const toggleFolderDrawer = (folderId: string) => {
    setOpenFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const toggleCardFlip = (templateId: string) => {
    setFlippedCardIds((prev) => ({
      ...prev,
      [templateId]: !prev[templateId]
    }));
  };

  const saveToStorage = (updatedFolders: any[], updatedTemplates: any[]) => {
    setFolders(updatedFolders);
    setTemplates(updatedTemplates);
    if (typeof window !== "undefined") {
      localStorage.setItem("realizzare_email_folders", JSON.stringify(updatedFolders));
      localStorage.setItem("realizzare_email_templates", JSON.stringify(updatedTemplates));
    }
  };

  // Create Standalone Folder
  const handleCreateStandaloneFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const folderNameTrimmed = standaloneFolderName.trim();
    if (!folderNameTrimmed) return;

    const exists = folders.some((f) => f.name.trim().toLowerCase() === folderNameTrimmed.toLowerCase());
    if (exists) {
      alert(`⚠️ Já existe uma pasta com o nome "${folderNameTrimmed}". Escolha um nome exclusivo.`);
      return;
    }

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: folderNameTrimmed,
      type: standaloneFolderType
    };

    const updatedFolders = [...folders, newFolder];
    saveToStorage(updatedFolders, templates);

    setOpenFolderIds((prev) => ({ ...prev, [newFolder.id]: true }));

    setShowNewFolderModal(false);
    setStandaloneFolderName("");
    showToast(`Pasta "${newFolder.name}" criada com sucesso!`);
  };

  // Duplicate Whole Folder and all templates inside it
  const handleConfirmDuplicateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicatingFolder || !duplicateFolderName.trim()) return;

    const newFolderName = duplicateFolderName.trim();
    const exists = folders.some((f) => f.name.trim().toLowerCase() === newFolderName.toLowerCase());
    if (exists) {
      alert(`⚠️ Já existe uma pasta ou fluxo com o nome "${newFolderName}". Escolha um nome exclusivo.`);
      return;
    }

    const newFolderId = `folder-${Date.now()}`;

    const newFolderObj = {
      id: newFolderId,
      name: newFolderName,
      type: duplicatingFolder.type || "flow"
    };

    const updatedFolders = [...folders, newFolderObj];

    const originalTemplates = templates.filter((t) => t.folderId === duplicatingFolder.id);
    const clonedTemplates = originalTemplates.map((orig, index) => ({
      ...orig,
      id: `tpl-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      name: `Cópia - ${orig.name}`,
      folderId: newFolderId,
      folderName: newFolderName,
      status: "Rascunho",
      flowId: undefined,
      flowName: undefined,
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0 }
    }));

    const updatedTemplates = [...clonedTemplates, ...templates];
    saveToStorage(updatedFolders, updatedTemplates);

    setOpenFolderIds((prev) => ({ ...prev, [newFolderId]: true }));

    setDuplicatingFolder(null);
    setDuplicateFolderName("");
    showToast(`Pasta "${newFolderName}" duplicada com ${clonedTemplates.length} e-mails (como Rascunhos)!`);
  };

  // Create Template
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    let targetFolderId = selectedFolderId;
    let targetFolderName = "Campanhas Pontuais / Rascunhos";
    let updatedFolders = [...folders];

    if (isCreatingNewFolder && customFolderName.trim()) {
      const customTrimmed = customFolderName.trim();
      const exists = folders.some((f) => f.name.trim().toLowerCase() === customTrimmed.toLowerCase());
      if (exists) {
        alert(`⚠️ Já existe uma pasta ou fluxo com o nome "${customTrimmed}". Escolha um nome diferente.`);
        return;
      }

      const newF = {
        id: `folder-${Date.now()}`,
        name: customTrimmed,
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
      id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newTemplateName.trim(),
      subject: newTemplateSubject.trim() || "Assunto do E-mail",
      previewText: newTemplatePreheader.trim() || "Texto de pré-visualização...",
      htmlContent: `<div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px;">
  <h2 style="color: #4f46e5; margin-top: 0;">Olá {{primeiro_nome}}!</h2>
  <p>Escreva o conteúdo do seu novo e-mail aqui...</p>
</div>`,
      folderId: targetFolderId || "folder-pontual",
      folderName: targetFolderName,
      status: "Rascunho",
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0 }
    };

    const updatedTemplates = [newTpl, ...templates];
    saveToStorage(updatedFolders, updatedTemplates);

    if (targetFolderId) {
      setOpenFolderIds((prev) => ({ ...prev, [targetFolderId]: true }));
    }

    setShowNewModal(false);
    setNewTemplateName("");
    setNewTemplateSubject("");
    setNewTemplatePreheader("");
    setCustomFolderName("");
    setIsCreatingNewFolder(false);
    showToast("Nova campanha criada com sucesso como Rascunho!");
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    if (!target) return;

    const cloned = {
      ...target,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `Cópia - ${target.name}`,
      status: "Rascunho",
      flowId: undefined,
      flowName: undefined,
      updatedAt: new Date().toLocaleDateString("pt-BR"),
      metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0 }
    };

    const updatedTemplates = [cloned, ...templates];
    saveToStorage(folders, updatedTemplates);
    showToast(`Campanha "Cópia - ${target.name}" duplicada como Rascunho!`);
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

  // Save HTML Content with Confirmation and 2-Way Sync to Flow Nodes
  const handleSaveHtmlContent = async () => {
    if (!editingTemplate) return;

    const isModified = editHtmlContent !== editingTemplate.htmlContent;
    if (isModified && editingTemplate.htmlContent) {
      const confirmed = confirm(
        "Tem certeza que deseja salvar as alterações nesta campanha?\n\nQualquer conteúdo anterior será sobreposto e as alterações serão salvas."
      );
      if (!confirmed) return;
    }

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

    // 2-Way Live Sync back to Supabase flow_nodes if this template belongs to a flow node
    if (editingTemplate.nodeId) {
      try {
        const supabase = createClient();
        const { data: nodeData } = await supabase.from("flow_nodes").select("config").eq("id", editingTemplate.nodeId).single();
        const newConfig = {
          ...(nodeData?.config || {}),
          subject: editSubject,
          preheader: editPreviewText,
          htmlContent: editHtmlContent,
          campaignName: editingTemplate.name
        };
        await supabase.from("flow_nodes").update({ config: newConfig }).eq("id", editingTemplate.nodeId);
      } catch (e) {
        console.error("Erro ao sincronizar alteração com o nó do fluxo:", e);
      }
    }

    saveToStorage(folders, updatedTemplates);
    setEditingTemplate(null);
    showToast("Conteúdo do e-mail salvo com sucesso!");
  };

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
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
  }, [templates, searchQuery, filterStatus, selectedFolderFilter]);

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* CSS 3D Card Flip & Scrollbar Styles */}
      <style jsx global>{`
        .card-perspective {
          perspective: 1000px;
        }
        .card-inner {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .card-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        .mini-preview-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .mini-preview-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .mini-preview-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestão de E-mails & Templates
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organize seus e-mails por pastas de fluxo, pré-visualize o HTML ao vivo e acompanhe estatísticas.
          </p>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 transition-all text-xs cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-slate-600" />
            + Nova Pasta
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all hover:scale-[1.01] text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            + Nova Campanha / Template
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por e-mail, assunto, pasta ou fluxo..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "draft" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Rascunhos
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterStatus === "active" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Ativos
            </button>
          </div>

          <select
            value={selectedFolderFilter}
            onChange={(e) => setSelectedFolderFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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

      {/* Folders in Collapsible Drawers */}
      <div className="space-y-4">
        {folders.map((folder) => {
          const folderTemplates = filteredTemplates.filter((t) => t.folderId === folder.id);
          if (selectedFolderFilter !== "all" && selectedFolderFilter !== folder.id) return null;
          if (searchQuery && folderTemplates.length === 0) return null;

          const isOpen = !!openFolderIds[folder.id];
          const displayLimit = folderDisplayLimits[folder.id] || 6;
          const visibleTemplates = folderTemplates.slice(0, displayLimit);
          const hasMore = folderTemplates.length > displayLimit;

          // Folder Subtotals Calculation (Zero Mock Revenue Badges)
          const activeInFolder = folderTemplates.filter((t) => t.status === "Ativo").length;
          const draftInFolder = folderTemplates.filter((t) => t.status === "Rascunho").length;

          return (
            <div
              key={folder.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              {/* Folder Drawer Header Bar with Subtotals (Clean Ativos & Rascunhos ONLY) */}
              <div className="w-full px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border-b border-slate-100 select-none">
                <button
                  onClick={() => toggleFolderDrawer(folder.id)}
                  className="flex items-center gap-2.5 hover:bg-slate-50 p-1 rounded-xl transition-colors text-left flex-1 cursor-pointer"
                >
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FolderOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{folder.name}</h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {folderTemplates.length} e-mail{folderTemplates.length !== 1 ? "s" : ""} na pasta
                    </p>
                  </div>
                </button>

                {/* Subtotals & Actions Row inside Folder Header */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Ativos: {activeInFolder}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Rascunhos: {draftInFolder}
                  </span>

                  <button
                    onClick={() => {
                      setDuplicatingFolder(folder);
                      setDuplicateFolderName(`Cópia de ${folder.name}`);
                    }}
                    title="Duplicar esta pasta com todos os e-mails"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    <Layers className="h-3 w-3" />
                    <span>Duplicar Pasta</span>
                  </button>

                  <button
                    onClick={() => toggleFolderDrawer(folder.id)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Lazy Loaded Drawer Content */}
              {isOpen && (
                <div className="p-5 bg-slate-50/50 space-y-4">
                  {folderTemplates.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center">
                      <p className="text-xs text-slate-400 font-medium">Nenhum e-mail nesta pasta ainda.</p>
                    </div>
                  ) : (
                    /* REDEFINED 3:4 CARDS GRID WITH FULL NAME & LIVE SCROLLABLE PREVIEW */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                      {visibleTemplates.map((template) => {
                        const isActive = template.status === "Ativo";
                        const isFlipped = !!flippedCardIds[template.id];

                        return (
                          <div
                            key={template.id}
                            className="card-perspective h-[440px] w-full max-w-[250px] mx-auto"
                          >
                            <div className={`card-inner relative w-full h-full ${isFlipped ? "is-flipped" : ""}`}>
                              
                              {/* FRONT FACE OF CARD (FULL UNTRUNCATED NAME + LIVE SCROLLABLE MINIATURE PREVIEW) */}
                              <div className="card-front absolute inset-0 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
                                <div className="flex-1 flex flex-col justify-between space-y-2">
                                  {/* 1. CAMPAIGN NAME AT VERY TOP (FULL WRAP - NOT TRUNCATED) */}
                                  <div className="flex items-start justify-between gap-1.5 pb-1.5 border-b border-slate-100">
                                    <h3
                                      className="font-extrabold text-slate-900 text-[11px] leading-snug break-words flex-1"
                                      title={template.name}
                                    >
                                      {template.name}
                                    </h3>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                        isActive ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-650 border border-slate-200"
                                      }`}
                                    >
                                      {template.status}
                                    </span>
                                  </div>

                                  {/* 2. SUBJECT LINE & PREHEADER BOX */}
                                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5 space-y-0.5 shrink-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-bold uppercase text-indigo-600 tracking-wider">Assunto:</span>
                                      <span className="font-bold text-slate-800 text-[10px] truncate">
                                        {template.subject || "(Sem assunto)"}
                                      </span>
                                    </div>
                                    {template.previewText && (
                                      <p className="text-[9.5px] text-slate-500 italic line-clamp-1 border-t border-slate-100 pt-0.5">
                                        "{template.previewText}"
                                      </p>
                                    )}
                                  </div>

                                  {/* 3. HTML PREVIEW CONTAINER (LIVE SCROLLABLE WITH MOUSE WHEEL ON HOVER) */}
                                  <div
                                    className="flex-1 min-h-[160px] max-h-[190px] w-full bg-white border border-slate-200 rounded-lg overflow-y-auto mini-preview-scroll relative shadow-inner select-text"
                                    onWheel={(e) => e.stopPropagation()}
                                    title="Role o mouse nesta área para navegar pelo e-mail"
                                  >
                                    <div className="w-full min-h-full">
                                      <iframe
                                        title={`Mini preview - ${template.name}`}
                                        srcDoc={template.htmlContent || "<div></div>"}
                                        className="w-full min-h-[420px] border-0 pointer-events-auto"
                                        style={{ transform: "scale(0.86)", transformOrigin: "top left", width: "116%", height: "116%" }}
                                      />
                                    </div>
                                  </div>

                                  {/* 4. FLOW LINK (SITS NEATLY AT THE BOTTOM ABOVE ACTIONS) */}
                                  {isActive && template.flowName && (
                                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50/70 p-1.5 rounded-md border border-emerald-200 shrink-0">
                                      <GitBranch className="h-3 w-3 shrink-0 text-emerald-600" />
                                      <span className="truncate">Flow:</span>
                                      <Link
                                        href={template.flowId ? `/flows/${template.flowId}` : "/dashboard/automations"}
                                        className="text-indigo-600 hover:underline flex items-center gap-0.5 font-extrabold truncate"
                                      >
                                        {template.flowName}
                                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                      </Link>
                                    </div>
                                  )}
                                </div>

                                {/* 5. TIGHT ACTION TOOLBAR AT THE BOTTOM */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 mt-1.5 shrink-0">
                                  {/* Grouped Ver & Editar */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setFullPreviewTemplate(template);
                                        setPreviewDevice("desktop");
                                      }}
                                      title="Pré-visualização Completa Web/Mobile"
                                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer"
                                    >
                                      <Eye className="h-3 w-3 text-indigo-600" />
                                      <span>Ver</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingTemplate(template);
                                        setEditSubject(template.subject || "");
                                        setEditPreviewText(template.previewText || "");
                                        setEditHtmlContent(template.htmlContent || "");
                                        setEditorTab("preview");
                                        setEditorPreviewDevice("desktop");
                                      }}
                                      title="Editar Código HTML"
                                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-all shadow-2xs cursor-pointer"
                                    >
                                      <Edit3 className="h-3 w-3" />
                                      <span>Editar</span>
                                    </button>
                                  </div>

                                  {/* Icon Toolbar */}
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={() => toggleCardFlip(template.id)}
                                      title="Virar Card (Métricas 3D)"
                                      className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      <BarChart2 className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleDuplicateTemplate(template.id)}
                                      title="Duplicar Template"
                                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>

                                    <button
                                      onClick={() => handleDeleteTemplate(template.id)}
                                      title="Excluir Template"
                                      className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* BACK FACE OF CARD (3D METRICS FLIP) */}
                              <div className="card-back absolute inset-0 bg-slate-900 text-white border border-slate-800 rounded-xl p-3.5 shadow-xl flex flex-col justify-between overflow-hidden">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <div className="flex items-center gap-1.5">
                                      <BarChart2 className="h-3.5 w-3.5 text-indigo-400" />
                                      <h4 className="text-[11px] font-black text-white truncate max-w-[130px]">
                                        Métricas do E-mail
                                      </h4>
                                    </div>
                                    <button
                                      onClick={() => toggleCardFlip(template.id)}
                                      className="text-[10px] font-bold text-indigo-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <RotateCcw className="h-3 w-3" /> Voltar
                                    </button>
                                  </div>

                                  <div className="space-y-2 text-[10px]">
                                    <div className="bg-slate-800/80 p-2 rounded-md flex items-center justify-between">
                                      <span className="text-slate-400">Entregues:</span>
                                      <span className="font-black text-white">{template.metrics?.sentCount || 0}</span>
                                    </div>

                                    <div className="bg-slate-800/80 p-2 rounded-md flex items-center justify-between">
                                      <span className="text-cyan-400 font-bold">Aberturas:</span>
                                      <span className="font-black text-cyan-300">
                                        {template.metrics?.openCount || 0} ({template.metrics?.openRate || 0}%)
                                      </span>
                                    </div>

                                    <div className="bg-slate-800/80 p-2 rounded-md flex items-center justify-between">
                                      <span className="text-emerald-400 font-bold">Cliques:</span>
                                      <span className="font-black text-emerald-300">
                                        {template.metrics?.clickCount || 0} ({template.metrics?.clickRate || 0}%)
                                      </span>
                                    </div>

                                    <div className="bg-slate-800/80 p-2 rounded-md flex items-center justify-between">
                                      <span className="text-indigo-400 font-bold">Conversões:</span>
                                      <span className="font-black text-indigo-300">
                                        {template.metrics?.conversionCount || 0} compras
                                      </span>
                                    </div>

                                    <div className="bg-slate-800/80 p-2 rounded-md flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">Receita:</span>
                                      <span className="font-black text-emerald-400">R$ 0,00</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                  <button
                                    onClick={() => toggleCardFlip(template.id)}
                                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Voltar para o Card</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() =>
                          setFolderDisplayLimits((prev) => ({
                            ...prev,
                            [folder.id]: displayLimit + 12
                          }))
                        }
                        className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Carregar mais e-mails (+{folderTemplates.length - displayLimit})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Nova Pasta Standalone */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Nova Pasta</h2>
              </div>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStandaloneFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Pasta *
                </label>
                <input
                  type="text"
                  required
                  value={standaloneFolderName}
                  onChange={(e) => setStandaloneFolderName(e.target.value)}
                  placeholder="Ex: Nutrição de Leads 2026"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo de Pasta
                </label>
                <select
                  value={standaloneFolderType}
                  onChange={(e) => setStandaloneFolderType(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="flow">Pasta para Fluxos de Automação</option>
                  <option value="pontual">Pasta para Campanhas Pontuais / Rascunhos</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Criar Pasta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Duplicar Pasta Inteira */}
      {duplicatingFolder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Layers className="h-5 w-5" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Duplicar Pasta Inteira</h2>
              </div>
              <button onClick={() => setDuplicatingFolder(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDuplicateFolder} className="space-y-4">
              <p className="text-xs text-slate-500">
                Todos os e-mails contidos nesta pasta serão duplicados com a indicação "Cópia", convertidos para <strong>Rascunho</strong> e desvinculados de qualquer fluxo.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nome da Nova Pasta *
                </label>
                <input
                  type="text"
                  required
                  value={duplicateFolderName}
                  onChange={(e) => setDuplicateFolderName(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDuplicatingFolder(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  Duplicar Pasta e E-mails
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Criar Nova Campanha / Template */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Plus className="h-5 w-5" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Nova Campanha / Template</h2>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
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
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Linha de Assunto
                </label>
                <input
                  type="text"
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  placeholder="Ex: 🎓 Seja bem-vindo à Realizzare Cursos!"
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pré-cabeçalho (Texto de Apoio)
                </label>
                <input
                  type="text"
                  value={newTemplatePreheader}
                  onChange={(e) => setNewTemplatePreheader(e.target.value)}
                  placeholder="Ex: Confira como acessar suas aulas gratuitas..."
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

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
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewFolder(false)}
                        className="text-xs text-slate-500 hover:text-slate-800 underline shrink-0 px-2 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Criar Rascunho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Full Web & Mobile Standalone Preview Modal */}
      {fullPreviewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-4xl w-full h-[85vh] shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{fullPreviewTemplate.name}</h2>
                <p className="text-xs text-slate-500">Assunto: "{fullPreviewTemplate.subject}"</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex border border-slate-200 rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      previewDevice === "desktop" ? "bg-white text-indigo-600 shadow-xs font-extrabold" : "text-slate-500"
                    }`}
                  >
                    <Laptop className="h-3.5 w-3.5" /> Desktop / Web
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      previewDevice === "mobile" ? "bg-white text-indigo-600 shadow-xs font-extrabold" : "text-slate-500"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </button>
                </div>

                <button onClick={() => setFullPreviewTemplate(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 rounded-xl p-4 overflow-y-auto flex justify-center items-center">
              {previewDevice === "desktop" ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-md w-full max-w-2xl h-full overflow-hidden flex flex-col">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                    <span>De: contato@realizzarecursos.com.br</span>
                    <span>Para: aluno@exemplo.com.br</span>
                  </div>
                  <iframe
                    title="Full Desktop Preview"
                    srcDoc={fullPreviewTemplate.htmlContent || "<div></div>"}
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              ) : (
                <div className="w-[340px] h-[540px] bg-slate-900 rounded-[32px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative">
                  <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2 shrink-0" />
                  <div className="bg-white rounded-[20px] flex-1 overflow-hidden flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-200 p-2.5 text-[9px] text-slate-600 font-bold border-b border-slate-100">
                      Assunto: {fullPreviewTemplate.subject}
                    </div>
                    <iframe
                      title="Full Mobile Preview"
                      srcDoc={fullPreviewTemplate.htmlContent || "<div></div>"}
                      className="w-full flex-1 border-0 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setFullPreviewTemplate(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HTML Editor with Web & Mobile Preview Tab Option */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-4xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{editingTemplate.name}</h2>
                <p className="text-xs text-slate-500">Edite o assunto, pré-header e o código HTML da campanha.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setEditorTab("preview")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${editorTab === "preview" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"}`}
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1" />
                    Pré-visualização
                  </button>
                  <button
                    onClick={() => setEditorTab("edit")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${editorTab === "edit" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"}`}
                  >
                    <Code className="h-3.5 w-3.5 inline mr-1" />
                    Código HTML
                  </button>
                </div>

                <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Linha de Assunto</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pré-cabeçalho (Preheader)</label>
                <input
                  type="text"
                  value={editPreviewText}
                  onChange={(e) => setEditPreviewText(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Editor Body with Desktop / Mobile Device Selector inside Preview Tab */}
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-slate-200 rounded-xl bg-slate-50 p-4">
              {editorTab === "edit" ? (
                <textarea
                  value={editHtmlContent}
                  onChange={(e) => setEditHtmlContent(e.target.value)}
                  placeholder="<div>Cole ou digite seu código HTML aqui...</div>"
                  className="w-full h-72 font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-800"
                />
              ) : (
                <div className="space-y-3 h-full flex flex-col">
                  {/* Inline Preview Device Toggle inside Editor */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-500">Visualização de Renderização:</span>
                    <div className="flex border border-slate-200 rounded-lg bg-slate-200/60 p-0.5 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setEditorPreviewDevice("desktop")}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                          editorPreviewDevice === "desktop" ? "bg-white text-indigo-600 shadow-xs font-extrabold" : "text-slate-600"
                        }`}
                      >
                        <Laptop className="h-3 w-3" /> Web / Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorPreviewDevice("mobile")}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                          editorPreviewDevice === "mobile" ? "bg-white text-indigo-600 shadow-xs font-extrabold" : "text-slate-600"
                        }`}
                      >
                        <Smartphone className="h-3 w-3" /> Mobile
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex justify-center items-center bg-slate-100 p-3 rounded-xl">
                    {editorPreviewDevice === "desktop" ? (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 w-full h-full overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: editHtmlContent || "<p class='text-slate-400 text-xs italic'>Nenhum conteúdo HTML definido.</p>" }} />
                      </div>
                    ) : (
                      <div className="w-[320px] h-[340px] bg-slate-900 rounded-[28px] p-2.5 shadow-xl border-4 border-slate-800 flex flex-col">
                        <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-1.5 shrink-0" />
                        <div className="bg-white rounded-[18px] flex-1 overflow-y-auto p-3 text-xs">
                          <div dangerouslySetInnerHTML={{ __html: editHtmlContent || "<p class='text-slate-400 text-xs italic'>Nenhum conteúdo HTML definido.</p>" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons with Save Confirmation */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveHtmlContent}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
