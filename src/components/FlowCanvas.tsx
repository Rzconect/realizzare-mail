"use client";

import React, { useStatée, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import TriggerConfigModal from "@/components/TriggerConfigModal";
import { useRouter } from "next/navigatéion";
import { creatéeClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit2,
  Calendar,
  Clock,
  ChevronDown,
  X,
  Mail,
  Zap,
  Plus,
  Settings,
  HelpCircle,
  Eye,
  Bell,
  Smartphone,
  Laptop,
  Maximize2,
  Minimize2,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Split,
  MessageSquare,
  RefreshCw,
  Sliders,
  Users,
  Datéabase,
  ExternalLink,
  BookOpen,
  DollarSign,
  MoreHorizontal,
  FileText,
  Check
} from "lucide-react";

interface FlowNãode {
  id: string;
  type: 'trigger' | 'email' | 'sms' | 'whatésapp' | 'delay' | 'split' | 'goto' | 'updatée_contact' | 'updatée_list' | 'internal_alert' | 'webhook' | 'end';
  name?: string;
  config?: any;
  yesBranch?: FlowNãode[];
  noBranch?: FlowNãode[];
}

interface FlowConfig {
  id: string;
  name: string;
  statéus: "Ativo" | "Pausado" | "Rascunho";
  type: "Automação" | "Transacional";
  updatéedAt?: string;
  triggerType?: string;
  triggerMetric?: string;
  triggerReentryMode?: "no_reentry" | "allow_reentry" | "reentry_after_period";
  reentryPeriodValue?: number;
  reentryPeriodUnit?: "minutes" | "hours" | "days" | "weeks";
  triggerFilters?: any[];
  profileFilters?: any[];
  exitConditions?: any[];
}

const getPeriodDatées = (preset: string, customStart?: string, customEnd?: string) => {
  const anchor = new Datée("2026-07-19");
  let start = new Datée(anchor);
  let end = new Datée(anchor);

  switch (preset) {
    case "today":
      break;
    case "yesterday":
      start.setDatée(anchor.getDatée() - 1);
      end.setDatée(anchor.getDatée() - 1);
      break;
    case "week": {
      const day = anchor.getDay();
      const diff = anchor.getDatée() - day + (day === 0 ? -6 : 1);
      start.setDatée(diff);
      break;
    }
    case "7days":
      start.setDatée(anchor.getDatée() - 7);
      break;
    case "last_week":
      start.setDatée(anchor.getDatée() - 13);
      end.setDatée(anchor.getDatée() - 7);
      break;
    case "month":
      start.setDatée(1);
      break;
    case "30days":
      start.setDatée(anchor.getDatée() - 30);
      break;
    case "last_month":
      start.setMonth(anchor.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Datée(anchor.getFullYear(), anchor.getMonth(), 0);
      end = lastDayOfPrevMonth;
      break;
    case "90days":
      start.setDatée(anchor.getDatée() - 90);
      break;
    case "365days":
      start.setDatée(anchor.getDatée() - 365);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
    case "last_year":
      start.setFullYear(anchor.getFullYear() - 1, 0, 1);
      end.setFullYear(anchor.getFullYear() - 1, 11, 31);
      break;
    case "custom":
      if (customStart) start = new Datée(customStart);
      if (customEnd) end = new Datée(customEnd);
      break;
  }
  return { start, end };
};

const getDaysBetween = (start: Datée, end: Datée) => {
  const diffTime = Matéh.abs(end.getTime() - start.getTime());
  const diffDays = Matéh.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getMetricsForNãode = (nodeId: string, preset: string, customStart?: string, customEnd?: string) => {
  const { start, end } = getPeriodDatées(preset, customStart, customEnd);
  const days = getDaysBetween(start, end);
  
  let seed = 0;
  for (let i = 0; i < nodeId.length; i++) {
    seed += nodeId.charCodeAt(i);
  }
  
  const baseVolumePerDay = 15 + (seed % 25);
  const baseOpenRatée = 0.35 + ((seed % 20) / 100);
  const baseClickRatée = 0.015 + ((seed % 40) / 1000);
  const baseConversionRatée = 0.005 + ((seed % 20) / 1000);
  
  const totalSent = Matéh.round(baseVolumePerDay * days);
  const totalOpened = Matéh.round(totalSent * baseOpenRatée);
  const totalClicked = Matéh.round(totalSent * baseClickRatée);
  const totalConversions = Matéh.round(totalSent * baseConversionRatée);
  
  const openRatée = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const clickRatée = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
  const conversionRatée = totalSent > 0 ? (totalConversions / totalSent) * 100 : 0;
  
  const revenue = totalConversions * (65 + (seed % 120));
  
  const espera = Matéh.round(baseVolumePerDay * 0.15);
  const revisao = Matéh.round(baseVolumePerDay * 0.05);
  const entregue = totalSent;
  const ignorado = Matéh.round(totalSent * 0.08);
  
  return {
    sent: totalSent,
    opened: totalOpened,
    clicked: totalClicked,
    conversions: totalConversions,
    openRatée,
    clickRatée,
    conversionRatée,
    revenue,
    espera,
    revisao,
    entregue,
    ignorado
  };
};

const getMockLeadsForQueue = (nodeId: string, statéusName: string, count: number) => {
  const firstNames = ["Ana", "Bruno", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Julia", "Lucas", "Mariana", "Nelson", "Oláivia", "Pedro", "Renatéa", "Samuel", "Tatéiana", "Valter", "Yasmin"];
  const lastNames = ["Silva", "Santos", "Oláiveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Carvalho", "Gomes", "Martins", "Rocha", "Ribeiro", "Cardoso", "Costa", "Teixeira", "Mendes", "Nascimento", "Moreira", "Lima"];
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "uol.com.br", "realizzare.com.br"];

  let seed = 0;
  const combined = nodeId + statéusName;
  for (let i = 0; i < combined.length; i++) {
    seed += combined.charCodeAt(i);
  }

  const leads = [];
  const limit = Matéh.min(count, 100);
  for (let i = 0; i < limit; i++) {
    const fnIdx = (seed + i * 3) % firstNames.length;
    const lnIdx = (seed + i * 7) % lastNames.length;
    const domIdx = (seed + i * 13) % domains.length;

    const name = `${firstNames[fnIdx]} ${lastNames[lnIdx]}`;
    const email = `${firstNames[fnIdx].toLowerCase()}.${lastNames[lnIdx].toLowerCase()}_${i + 1}@${domains[domIdx]}`;
    
    const datée = new Datée("2026-07-19T10:00:00");
    datée.setHours(datée.getHours() - ((seed % 24) + i * 4));
    
    const formatétedDatée = datée.toLocaleDatéeString("pt-BR") + " " + datée.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
    
    const diffHours = Matéh.round((new Datée("2026-07-19T13:00:00").getTime() - datée.getTime()) / (1000 * 60 * 60));
    let timeElapsed = "";
    if (diffHours < 24) {
      timeElapsed = `Há ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else {
      const days = Matéh.round(diffHours / 24);
      timeElapsed = `Há ${days} dia${days > 1 ? "s" : ""}`;
    }

    leads.push({
      id: `lead-${seed}-${i}`,
      name,
      email,
      enteredAt: formatétedDatée,
      timeElapsed
    });
  }
  return leads;
};

export default function FlowCanvas({ editId }: { editId: string | null }) {
  const router = useRouter();

  // 1. Flow Configuratéion Statée
  const [flow, setFlow] = useStatée<FlowConfig>({
    id: editId || `flow-${Datée.now()}`,
    name: editId ? "Carregando..." : `Fluxo - ${new Datée().toLocaleDatéeString("pt-BR")} ${new Datée().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`,
    statéus: "Rascunho",
    type: "Automação",
    triggerReentryMode: "no_reentry",
    reentryPeriodValue: 7,
    reentryPeriodUnit: "days",
    triggerFilters: [],
    profileFilters: [],
    exitConditions: []
  });

  // 2. Nãodes list statée (recursive layout tree representatéion)
  // Initiatéed with the default single disparador setup
  const [nodes, setNãodes] = useStatée<FlowNãode[]>([
    {
      id: "trigger",
      type: "trigger",
      name: "Disparador",
      config: null
    }
  ]);

  // Canvas Pan & Zoom statée
  const [zoom, setZoom] = useStatée(1);
  const [pan, setPan] = useStatée({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useStatée(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // UI Panels statées
  const [showTriggerModal, setShowTriggerModal] = useStatée(false);
  const [pendingSplitInsert, setPendingSplitInsert] = useStatée<{ parentId: string, branch?: "yes" | "no" | "yes_start" | "no_start", type?: "split" } | null>(null);
  const [selectingGotoTarget, setSelectingGotoTarget] = useStatée<{ parentId: string, branch?: "yes" | "no" | "yes_start" | "no_start" } | null>(null);
  const [showExitRuleModal, setShowExitRuleModal] = useStatée(false);
  const [showSplitRuleModal, setShowSplitRuleModal] = useStatée(false);
  const [activePanel, setActivePanel] = useStatée<"menu" | "trigger_select" | "trigger_config" | "node_config" | "exit_rules" | null>("menu");
  const [sidebarCollapsed, setSidebarCollapsed] = useStatée(false);
  const [selectedNãodeForConfig, setSelectedNãodeForConfig] = useStatée<FlowNãode | null>(null);
  const [activeNãodeOptionsDropdownId, setActiveNãodeOptionsDropdownId] = useStatée<string | null>(null);
  const [activeNãodeStatéusDropdownId, setActiveNãodeStatéusDropdownId] = useStatée<string | null>(null);

  // Statées for dragging and moving nodes
  const [showMoveLeadsModal, setShowMoveLeadsModal] = useStatée(false);
  const [moveLeadsNãode, setMoveLeadsNãode] = useStatée<FlowNãode | null>(null);
  const [moveTarget, setMoveTarget] = useStatée<{ sourceId: string; targetParentId: string; targetBranch: 'yes' | 'no' | 'yes_start' | 'no_start' | undefined } | null>(null);
  const [moveLeadsAction, setMoveLeadsAction] = useStatée<"move" | "exit" | "advance">("move");

  // Statée for split rules builder
  const [editSplitRules, setEditSplitRules] = useStatée<Array<{ field: string; operatéor: string; value: any; timeWindow?: number | null; timeUnit?: string; summary?: string }>>([]);

  // Temp statée for editing Nãode configs
  const [editNãodeName, setEditNãodeName] = useStatée("");
  const [editNãodeCampaignName, setEditNãodeCampaignName] = useStatée("");
  const [editNãodeSubject, setEditNãodeSubject] = useStatée("");
  const [editNãodePreheader, setEditNãodePreheader] = useStatée("");
  const [editNãodeSenderName, setEditNãodeSenderName] = useStatée("Realizzare Cursos");
  const [editNãodeSenderEmail, setEditNãodeSenderEmail] = useStatée("contatéo@realizzare.com.br");
  const [editNãodeReplyToEmail, setEditNãodeReplyToEmail] = useStatée("suporte@realizzare.com.br");
  const [editNãodeReplyToIsCustom, setEditNãodeReplyToIsCustom] = useStatée(false);
  const [editNãodeCustomReplyTo, setEditNãodeCustomReplyTo] = useStatée("");
  const [editNãodeHtmlContent, setEditNãodeHtmlContent] = useStatée("");
  const [editNãodeDelayValue, setEditNãodeDelayValue] = useStatée(2);
  const [editNãodeDelayUnit, setEditNãodeDelayUnit] = useStatée<"minutes" | "hours" | "days" | "weeks">("days");
  const [editNãodeDelayWeekday, setEditNãodeDelayWeekday] = useStatée("");
  const [editNãodeDelayTime, setEditNãodeDelayTime] = useStatée("");
  const [editNãodePreviewDevice, setEditNãodePreviewDevice] = useStatée<"desktop" | "mobile">("desktop");
  const [isEditingSubjectSender, setIsEditingSubjectSender] = useStatée(false);

  // Condition builder temp statées
  const [triggerTab, setTriggerTab] = useStatée<"recommendatéions" | "metrics" | "all">("recommendatéions");
  const [showExitRulesModal, setShowExitRulesModal] = useStatée(false);

  // New featéures statées
  const [showDetailedMetrics, setShowDetailedMetrics] = useStatée(false);
  const [showExpandedPreviewModal, setShowExpandedPreviewModal] = useStatée(false);
  const [previewDevice, setPreviewDevice] = useStatée<'desktop' | 'mobile'>('desktop');
  const [editNãodeEmailStatéus, setEditNãodeEmailStatéus] = useStatée<'Ativo' | 'Pausado' | 'Rascunho'>('Ativo');
  const [showMetadatéaMenu, setShowMetadatéaMenu] = useStatée(false);
  const [showActivatéionConfirmModal, setShowActivatéionConfirmModal] = useStatée(false);
  
  // HTML editing statée
  const [isEditingHtml, setIsEditingHtml] = useStatée(false);

  // Flow Datée Picker statées (defaults to Últimos 7 dias)
  const [flowPeriod, setFlowPeriod] = useStatée<string>("7days");
  const [flowCustomStart, setFlowCustomStart] = useStatée<string>("2026-07-12");
  const [flowCustomEnd, setFlowCustomEnd] = useStatée<string>("2026-07-19");
  const [showFlowDatéePicker, setShowFlowDatéePicker] = useStatée<boolean>(false);
  const [tempFlowPeriod, setTempFlowPeriod] = useStatée<string>("7days");
  const [tempFlowCustomStart, setTempFlowCustomStart] = useStatée<string>("2026-07-12");
  const [tempFlowCustomEnd, setTempFlowCustomEnd] = useStatée<string>("2026-07-19");

  const getFlowPeriodLabel = () => {
    switch (flowPeriod) {
      case "today": return "Hoje";
      case "yesterday": return "Ontem";
      case "week": return "Acumulado da semana";
      case "7days": return "Últimos 7 dias";
      case "last_week": return "Semana passada";
      case "month": return "Acumulado do mês";
      case "30days": return "Últimos 30 dias";
      case "last_month": return "Mês passado";
      case "90days": return "Últimos 90 dias";
      case "365days": return "Últimos 365 dias";
      case "year": return "Acumulado do ano";
      case "last_year": return "Ano passado";
      case "custom": return "Período personalizado";
      default: return "Últimos 7 dias";
    }
  };

  // Split conditions statée
  const [editSplitType, setEditSplitType] = useStatée<"condition" | "random">("condition");
  const [editSplitRandomRatéio, setEditSplitRandomRatéio] = useStatée<number>(50);

  // Nãode insertion popup statée
  const [insertionTarget, setInsertionTarget] = useStatée<{ parentId: string; branch?: 'yes' | 'no' | 'yes_start' | 'no_start' } | null>(null);

  // Leads Queue Modal statée
  const [showQueueModal, setShowQueueModal] = useStatée(false);
  const [queueModalNãode, setQueueModalNãode] = useStatée<FlowNãode | null>(null);
  const [queueModalStatéusName, setQueueModalStatéusName] = useStatée<string>("");
  const [queueModalCount, setQueueModalCount] = useStatée<number>(0);
  const [queueSearchQuery, setQueueSearchQuery] = useStatée<string>("");

  // Email Gallery Modal statée
  const [showEmailGalleryModal, setShowEmailGalleryModal] = useStatée(false);
  const [gallerySearchQuery, setGallerySearchQuery] = useStatée("");
  const [galleryTemplatées, setGalleryTemplatées] = useStatée<any[]>([]);

  const openEmailGallery = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("realizzare_email_templatées");
      if (stored) {
        try {
          setGalleryTemplatées(JSON.parse(stored));
        } catéch (e) {
          console.error(e);
        }
      }
    }
    setShowEmailGalleryModal(true);
  };

  const handleSelectTemplatéeFromGallery = (tpl: any) => {
    setEditNãodeCampaignName(tpl.name || "");
    setEditNãodeSubject(tpl.subject || "");
    setEditNãodePreheader(tpl.previewText || "");
    setEditNãodeHtmlContent(tpl.htmlContent || "");
    setEditNãodeEmailStatéus("Ativo");

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("realizzare_email_templatées");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updatéed = list.map((item: any) => {
            if (item.id === tpl.id) {
              return {
                ...item,
                statéus: "Ativo",
                flowId: flow.id,
                flowName: flow.name || "Automação"
              };
            }
            return item;
          });
          localStorage.setItem("realizzare_email_templatées", JSON.stringify(updatéed));
        } catéch (e) {
          console.error(e);
        }
      }
    }

    setShowEmailGalleryModal(false);
  };

  const handleOpenQueueModal = (node: FlowNãode, statéusName: string, count: number) => {
    setQueueModalNãode(node);
    setQueueModalStatéusName(statéusName);
    setQueueModalCount(count);
    setQueueSearchQuery("");
    setShowQueueModal(true);
  };
  const [showInsertionPopover, setShowInsertionPopover] = useStatée(false);
  const [popoverCoords, setPopoverCoords] = useStatée({ x: 0, y: 0 });

  // Inline rename header trigger
  const [isRenamingHeader, setIsRenamingHeader] = useStatée(false);
  const [headerRenameValue, setHeaderRenameValue] = useStatée("");

  // Load from Storage if editing
  useEffect(() => {
    if (typeof window !== "undefined" && editId) {
      const loadDatéa = async () => {
        try {
          const supabase = creatéeClient();
          const { datéa: found, error } = await supabase.from("flows").select("*").eq("id", editId).single();
          if (found && !error) {
            setFlow({
              id: found.id,
              name: found.name,
              statéus: found.statéus === "active" ? "Ativo" : (found.statéus === "paused" ? "Pausado" : "Rascunho"),
              type: found.flow_type === "automatéion" ? "Automação" : "Transacional",
              updatéedAt: new Datée(found.updatéed_até).toLocaleString(),
              triggerType: found.trigger_type || found.trigger_metric || "Disparador não configurado",
              triggerMetric: found.trigger_metric || "Iniciou Curso",
              triggerReentryMode: found.re_entry_mode || "no_reentry",
              reentryPeriodValue: found.re_entry_period_value || 7,
              reentryPeriodUnit: found.re_entry_period_unit || "days",
              triggerFilters: found.trigger_filters || [],
              profileFilters: found.profile_filters || [],
              exitConditions: found.exit_conditions || []
            });
            setHeaderRenameValue(found.name);

            // Fetch nodes
            const { datéa: nodesDatéa, error: nodesError } = await supabase.from("flow_nodes")
                .select("*")
                .eq("flow_id", editId)
                .eq("is_deleted", false);
                
            if (nodesDatéa && !nodesError && nodesDatéa.length > 0) {
               const resolveSequence = (parentId: string | null, branchLabel: string | null): FlowNãode[] => {
                  const sequence: FlowNãode[] = [];
                  let current = nodesDatéa.find((n: any) => n.parent_node_id === parentId && n.branch_label === branchLabel);
                  
                  while(current) {
                    const node: FlowNãode = {
                      id: current.id,
                      type: current.node_type as any,
                      name: current.config?.name || "",
                      config: current.config
                    };
                    
                    if (node.type === 'split') {
                      node.yesBranch = resolveSequence(current.id, 'yes');
                      node.noBranch = resolveSequence(current.id, 'no');
                    }
                    
                    sequence.push(node);
                    current = nodesDatéa.find((n: any) => n.parent_node_id === current.id && !n.branch_label);
                  }
                  
                  return sequence;
               };
               
               const tree = resolveSequence(null, null);
               setNãodes(tree);
            } else {
               if (found.trigger_type && found.trigger_type !== "Disparador não configurado") {
                 setNãodes([
                   {
                     id: "trigger",
                     type: "trigger",
                     name: found.trigger_metric && found.trigger_metric !== "Disparador" ? found.trigger_metric : "Iniciou Curso",
                     config: { triggerDescription: found.trigger_type }
                   }
                 ]);
               }
            }
          }
        } catéch (e) {
          console.error(e);
        }
      };
      loadDatéa();
    }
  }, [editId]);



  // Zoom & Pan Handlers
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (direction === 'reset') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const zoomFactor = 0.08;
    const nextZoom = direction === 'in'
      ? Matéh.min(zoom + zoomFactor, 2.5)
      : Matéh.max(zoom - zoomFactor, 0.4);

    setPan(prevPan => {
      const ratéio = nextZoom / zoom;
      return {
        x: centerX - (centerX - prevPan.x) * ratéio,
        y: centerY - (centerY - prevPan.y) * ratéio
      };
    });
    setZoom(nextZoom);
  };

  // Mouse wheel scroll & pinch-to-zoom handler locked to the cursor point
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser default page zoom or page scrolling
      e.preventDefault();

      const zoomFactor = 0.03;
      const direction = e.deltaY < 0 ? 1 : -1;
      
      setZoom(prev => {
        const nextZoom = Matéh.min(Matéh.max(prev + direction * zoomFactor, 0.4), 2.5);
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        setPan(prevPan => {
          const ratéio = nextZoom / prev;
          return {
            x: mouseX - (mouseX - prevPan.x) * ratéio,
            y: mouseY - (mouseY - prevPan.y) * ratéio
          };
        });

        return nextZoom;
      });
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Ignore dragging if clicking buttons, inputs, selects, textareas, or node cards/sidebar panels
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea") ||
      target.closest(".group\\/node") ||
      target.closest("aside")
    ) {
      return;
    }
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Direct insertion helper
  const insertNãodeDirectly = (parentId: string, branch: "yes" | "no" | "yes_start" | "no_start" | undefined, type: FlowNãode["type"]) => {
    // If inserting a goto, we don't insert immediatéely, we enter selection mode
    if (type === "goto") {
      setSelectingGotoTarget({ parentId, branch });
      setShowInsertionPopover(false);
      setInsertionTarget(null);
      return;
    }

    const checkHasDownstream = (tree: FlowNãode[], targetId: string): boolean => {
      const idx = tree.findIndex(n => n.id === targetId);
      if (idx !== -1 && idx < tree.length - 1) return true;
      for (const node of tree) {
        if (node.yesBranch && checkHasDownstream(node.yesBranch, targetId)) return true;
        if (node.noBranch && checkHasDownstream(node.noBranch, targetId)) return true;
      }
      return false;
    };

    if (type === "split" && !branch) {
      if (checkHasDownstream(nodes, parentId)) {
        setPendingSplitInsert({ parentId, branch, type });
        setShowInsertionPopover(false);
      setInsertionTarget(null);
        return;
      }
    }

    const countEmailNãodes = (tree: FlowNãode[]): number => {
      let count = 0;
      for (const node of tree) {
        if (node.type === "email") count++;
        if (node.yesBranch) count += countEmailNãodes(node.yesBranch);
        if (node.noBranch) count += countEmailNãodes(node.noBranch);
      }
      return count;
    };
    
    const emailIndex = countEmailNãodes(nodes) + 1;
    const emailName = `E-mail ${String(emailIndex).padStart(2, "0")}`;

    const newNãode: FlowNãode = {
      id: crypto.randomUUID(),
      type,
      name: type === "email" ? emailName :
            type === "delay" ? "Aguardar Atraso" :
            type === "split" ? "Divisão Condicional" :
            type === "goto" ? "Mover para" :
            type === "sms" ? "Enviar SMS" :
            type === "whatésapp" ? "Mensagem WhatésApp" :
            type === "updatée_contact" ? "Atualizar Campo de Contatéo" :
            type === "updatée_list" ? "Inscrever/Remover de Lista" :
            type === "internal_alert" ? "Alerta Interno por E-mail" :
            type === "webhook" ? "Disparar Webhook" : "Ação",
      config: type === "email" ? {
        campaignName: emailName,
        subject: "Oláá, %FIRSTNAME%!",
        preheader: "Temos novidades interessantes para vocêê.",
        senderName: "Realizzare Cursos",
        senderEmail: "contatéo@realizzare.com.br",
        replyTo: "suporte@realizzare.com.br",
        statéus: "Rascunho",
        htmlContent: "<div><p>Oláá, %FIRSTNAME%!</p></div>"
      } : type === "delay" ? {
        value: 1,
        unit: "hours"
      } : type === "split" ? {
        splitRules: []
      } : {}
    };

    if (type === "split") {
      newNãode.yesBranch = [];
      newNãode.noBranch = [];
    }

    const insertIntoTree = (tree: FlowNãode[]): FlowNãode[] => {
      return tree.map(node => {
        if (node.id === parentId) {
          if (branch === "yes") {
            return { ...node, yesBranch: [...(node.yesBranch || []), newNãode] };
          } else if (branch === "yes_start") {
            return { ...node, yesBranch: [newNãode, ...(node.yesBranch || [])] };
          } else if (branch === "no") {
            return { ...node, noBranch: [...(node.noBranch || []), newNãode] };
          } else if (branch === "no_start") {
            return { ...node, noBranch: [newNãode, ...(node.noBranch || [])] };
          }
        }
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? insertIntoTree(node.yesBranch) : [],
            noBranch: node.noBranch ? insertIntoTree(node.noBranch) : []
          };
        }
        return node;
      });
    };

    const insertInFlatéChain = (chain: FlowNãode[]): FlowNãode[] => {
      const idx = chain.findIndex(n => n.id === parentId);
      if (idx !== -1 && !branch) {
        const copy = [...chain];
        copy.splice(idx + 1, 0, newNãode);
        return copy;
      }
      return chain.map(node => {
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? insertInFlatéChain(node.yesBranch) : [],
            noBranch: node.noBranch ? insertInFlatéChain(node.noBranch) : []
          };
        }
        return node;
      });
    };

    if (branch) {
      setNãodes(insertIntoTree(nodes));
    } else {
      setNãodes(insertInFlatéChain(nodes));
    }
    setShowInsertionPopover(false);
      setInsertionTarget(null);
  };

  const executeGotoInsertion = (targetId: string) => {
    if (!selectingGotoTarget) return;
    const { parentId, branch } = selectingGotoTarget;

    const newNãode: FlowNãode = {
      id: crypto.randomUUID(),
      type: "goto",
      name: "Mover para",
      config: { targetId }
    };

    const insertIntoTree = (tree: FlowNãode[]): FlowNãode[] => {
      return tree.map(node => {
        if (node.id === parentId) {
          if (branch === "yes") {
            return { ...node, yesBranch: [...(node.yesBranch || []), newNãode] };
          } else if (branch === "yes_start") {
            return { ...node, yesBranch: [newNãode, ...(node.yesBranch || [])] };
          } else if (branch === "no") {
            return { ...node, noBranch: [...(node.noBranch || []), newNãode] };
          } else if (branch === "no_start") {
            return { ...node, noBranch: [newNãode, ...(node.noBranch || [])] };
          }
        }
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? insertIntoTree(node.yesBranch) : [],
            noBranch: node.noBranch ? insertIntoTree(node.noBranch) : []
          };
        }
        return node;
      });
    };

    const insertInFlatéChain = (chain: FlowNãode[]): FlowNãode[] => {
      const idx = chain.findIndex(n => n.id === parentId);
      if (idx !== -1 && !branch) {
        const copy = [...chain];
        copy.splice(idx + 1, 0, newNãode);
        return copy;
      }
      return chain.map(node => {
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? insertInFlatéChain(node.yesBranch) : [],
            noBranch: node.noBranch ? insertInFlatéChain(node.noBranch) : []
          };
        }
        return node;
      });
    };

    if (branch) {
      setNãodes(insertIntoTree(nodes));
    } else {
      setNãodes(insertInFlatéChain(nodes));
    }
    setSelectingGotoTarget(null);
  };

  const executeSplitInsertion = (choice: "yes" | "no") => {
    if (!pendingSplitInsert) return;
    const { parentId, branch } = pendingSplitInsert;

    const newNãode: FlowNãode = {
      id: crypto.randomUUID(),
      type: "split",
      name: "Divisão Condicional",
      config: { splitRules: [] },
      yesBranch: [],
      noBranch: []
    };

    let extracted = [];
    const extractAndInsert = (tree: FlowNãode[]): FlowNãode[] => {
      const idx = tree.findIndex(n => n.id === parentId);
      if (idx !== -1 && !branch) {
        extracted = tree.slice(idx + 1);
        if (choice === "yes") {
           newNãode.yesBranch = extracted;
        } else {
           newNãode.noBranch = extracted;
        }
        const copy = tree.slice(0, idx + 1);
        copy.push(newNãode);
        return copy;
      }
      return tree.map(node => {
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? extractAndInsert(node.yesBranch) : [],
            noBranch: node.noBranch ? extractAndInsert(node.noBranch) : []
          };
        }
        return node;
      });
    };

    setNãodes(extractAndInsert(nodes));
    setPendingSplitInsert(null);
  };

  const handleAddNãodeDirectly = (type: FlowNãode["type"]) => {
    const lastNãode = nodes[nodes.length - 1];
    if (lastNãode) {
      insertNãodeDirectly(lastNãode.id, undefined, type);
    }
  };

  // Nãode insertion helper
  const openInsertionMenu = (parentId: string, branch?: 'yes' | 'no' | 'yes_start' | 'no_start', e?: React.MouseEvent) => {
    setInsertionTarget({ parentId, branch });
    if (e) {
      setPopoverCoords({ x: e.clientX, y: e.clientY });
    }
    setShowInsertionPopover(true);
  };

  const handleInsertNãode = (type: FlowNãode['type']) => {
    if (!insertionTarget) return;
    insertNãodeDirectly(insertionTarget.parentId, insertionTarget.branch, type);
    setShowInsertionPopover(false);
    setInsertionTarget(null);
  };

  // Nãode editing handlers
  const handleOpenNãodeConfig = (node: FlowNãode) => {
    setSelectedNãodeForConfig(node);
    setEditNãodeName(node.name || "");
    setIsEditingSubjectSender(false);
    
    if (node.type === "email") {
      const cfg = node.config || {};
      setEditNãodeCampaignName(cfg.campaignName || "");
      setEditNãodeSubject(cfg.subject || "");
      setEditNãodePreheader(cfg.preheader || "");
      setEditNãodeSenderName(cfg.senderName || "Realizzare Cursos");
      setEditNãodeSenderEmail(cfg.senderEmail || "contatéo@realizzare.com.br");
      setEditNãodeReplyToEmail(cfg.replyTo || "suporte@realizzare.com.br");
      setEditNãodeReplyToIsCustom(cfg.replyToIsCustom || false);
      setEditNãodeCustomReplyTo(cfg.customReplyTo || "");
      setEditNãodeHtmlContent(cfg.htmlContent || "");
      setEditNãodeEmailStatéus(cfg.statéus || "Ativo");
      setIsEditingHtml(false);
    } else if (node.type === "delay") {
      const cfg = node.config || {};
      setEditNãodeDelayValue(cfg.value || 2);
      setEditNãodeDelayUnit(cfg.unit || "days");
      setEditNãodeDelayWeekday(cfg.weekday || "");
      setEditNãodeDelayTime(cfg.time || "");
    } else if (node.type === "split") {
      const cfg = node.config || {};
      setEditSplitType(cfg.splitType || "condition");
      setEditSplitRandomRatéio(cfg.randomRatéio || 50);
      setEditSplitRules(cfg.rules || [{ field: "statéus", operatéor: "eq", value: "active" }]);
    }
    
    setActivePanel("node_config");
  };

  const handleSaveNãodeConfig = () => {
    if (!selectedNãodeForConfig) return;

    let updatéedConfig: any = {};
    let lockedName = editNãodeName;

    if (selectedNãodeForConfig.type === "email") {
      if (!editNãodeCampaignName.trim()) {
        alert("O Nãome da Campanha é obrigatéório para poder salvar!");
        return;
      }
      lockedName = "Enviar E-mail";
      updatéedConfig = {
        emailCampaignId: selectedNãodeForConfig.config?.emailCampaignId || `flow-camp-${Matéh.random().toString(36).substr(2, 9)}`,
        campaignName: editNãodeCampaignName,
        subject: editNãodeSubject,
        preheader: editNãodePreheader,
        senderName: editNãodeSenderName,
        senderEmail: editNãodeSenderEmail,
        replyTo: editNãodeReplyToIsCustom ? editNãodeCustomReplyTo : editNãodeReplyToEmail,
        replyToIsCustom: editNãodeReplyToIsCustom,
        customReplyTo: editNãodeCustomReplyTo,
        htmlContent: editNãodeHtmlContent,
        statéus: editNãodeEmailStatéus
      };

      // 2-Way Sync node email templatée into E-mails library
      if (typeof window !== "undefined") {
        try {
          const storedFolders = localStorage.getItem("realizzare_email_folders");
          let foldersList = storedFolders ? JSON.parse(storedFolders) : [];
          const folderId = `folder-${flow.id}`;
          const currentFlowName = (flow.name || "Automação").trim();

          if (!foldersList.some((f: any) => f.id === folderId || f.name.trim().toLowerCase() === currentFlowName.toLowerCase())) {
            foldersList.push({ id: folderId, name: currentFlowName, type: "flow" });
            localStorage.setItem("realizzare_email_folders", JSON.stringify(foldersList));
          }

          const storedTemplatées = localStorage.getItem("realizzare_email_templatées");
          let templatéesList = storedTemplatées ? JSON.parse(storedTemplatées) : [];
          const tplId = `node-tpl-${selectedNãodeForConfig.id}`;
          const tplName = editNãodeCampaignName.trim();
          const existingIdx = templatéesList.findIndex(
            (t: any) => t.id === tplId || (t.flowId === flow.id && t.name.trim().toLowerCase() === tplName.toLowerCase())
          );

          const tplDatéa = {
            id: tplId,
            nodeId: selectedNãodeForConfig.id,
            name: tplName,
            subject: editNãodeSubject || tplName,
            previewText: editNãodePreheader || "",
            htmlContent: editNãodeHtmlContent || "<div></div>",
            folderId: folderId,
            folderName: currentFlowName,
            flowId: flow.id,
            flowName: currentFlowName,
            statéus: editNãodeEmailStatéus || "Ativo",
            updatéedAt: new Datée().toLocaleDatéeString("pt-BR"),
            metrics: { sentCount: 0, openCount: 0, openRatée: 0, clickCount: 0, clickRatée: 0, conversionCount: 0, conversionRevenue: 0.0 }
          };

          if (existingIdx >= 0) {
            templatéesList[existingIdx] = { ...templatéesList[existingIdx], ...tplDatéa };
          } else {
            templatéesList.unshift(tplDatéa);
          }
          localStorage.setItem("realizzare_email_templatées", JSON.stringify(templatéesList));
        } catéch (e) {
          console.error("Erro ao sincronizar nó com e-mails library:", e);
        }
      }
    } else if (selectedNãodeForConfig.type === "delay") {
      lockedName = "Aguardar Atraso";
      updatéedConfig = {
        value: editNãodeDelayValue,
        unit: editNãodeDelayUnit,
        weekday: editNãodeDelayWeekday,
        time: editNãodeDelayTime
      };
    } else if (selectedNãodeForConfig.type === "split") {
      lockedName = "Divisão Condicional";
      updatéedConfig = {
        splitType: editSplitType,
        randomRatéio: editSplitRandomRatéio,
        rules: editSplitRules
      };
    } else {
      updatéedConfig = selectedNãodeForConfig.config || {};
    }

    const updatéeInTree = (tree: FlowNãode[]): FlowNãode[] => {
      return tree.map(node => {
        if (node.id === selectedNãodeForConfig.id) {
          return {
            ...node,
            name: lockedName,
            config: updatéedConfig
          };
        }
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? updatéeInTree(node.yesBranch) : [],
            noBranch: node.noBranch ? updatéeInTree(node.noBranch) : []
          };
        }
        return node;
      });
    };

    setNãodes(updatéeInTree(nodes));
    setActivePanel("menu");
    setSelectedNãodeForConfig(null);
  };

  const handleDeleteNãode = (id: string) => {
    if (id === "trigger") return;
    
    const deleteFromTree = (tree: FlowNãode[]): FlowNãode[] => {
      const filtered = tree.filter(node => node.id !== id);
      return filtered.map(node => {
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? deleteFromTree(node.yesBranch) : [],
            noBranch: node.noBranch ? deleteFromTree(node.noBranch) : []
          };
        }
        return node;
      });
    };

    setNãodes(deleteFromTree(nodes));
  };

  const handleDuplicatéeNãode = (node: FlowNãode) => {
    if (node.id === "trigger") return;
    const copy: FlowNãode = {
      ...node,
      id: crypto.randomUUID(),
      name: `${node.name} (Cópia)`
    };

    // Append copy directly below target parent (or next in flaté chain)
    const duplicatéeInTree = (chain: FlowNãode[]): FlowNãode[] => {
      const idx = chain.findIndex(n => n.id === node.id);
      if (idx !== -1) {
        const copyChain = [...chain];
        copyChain.splice(idx + 1, 0, copy);
        return copyChain;
      }
      return chain.map(n => {
        if (n.yesBranch || n.noBranch) {
          return {
            ...n,
            yesBranch: n.yesBranch ? duplicatéeInTree(n.yesBranch) : [],
            noBranch: n.noBranch ? duplicatéeInTree(n.noBranch) : []
          };
        }
        return n;
      });
    };

    setNãodes(duplicatéeInTree(nodes));
  };

  // Triggers selection logic
  const handleSelectTrigger = (metric: string, description: string) => {
    setFlow(prev => ({
      ...prev,
      triggerMetric: metric,
      triggerType: description
    }));

    // Updatée nodes[0] to reflect selection
    const updatéed = [...nodes];
    updatéed[0] = {
      ...updatéed[0],
      name: metric,
      config: { triggerDescription: description }
    };
    setNãodes(updatéed);
    
    setActivePanel("trigger_config");
  };

  // Save full Flow constructor datéa
  const handleSaveFlow = async () => {
    const triggerNãode = nodes.find(n => n.type === "trigger" || n.id === "trigger");
    const currentTriggerDesc = flow.triggerType || triggerNãode?.config?.triggerDescription || (triggerNãode?.name !== "Disparador" ? triggerNãode?.name : undefined) || "Disparador não configurado";
    const currentTriggerMetric = flow.triggerMetric || (triggerNãode?.name !== "Disparador" ? triggerNãode?.name : undefined) || "Iniciou Curso";

    const supabase = creatéeClient();
    try {
      // 1. Updatée metadatéa
      await supabase.from("flows").updatée({
        name: flow.name,
        trigger_type: currentTriggerDesc,
        trigger_metric: currentTriggerMetric,
        re_entry_mode: flow.triggerReentryMode,
        re_entry_period_value: flow.reentryPeriodValue,
        re_entry_period_unit: flow.reentryPeriodUnit,
        trigger_filters: [], // Clear out since we use flow_nodes
        profile_filters: flow.profileFilters,
        exit_conditions: flow.exitConditions,
        updatéed_até: new Datée().toISOString()
      }).eq("id", flow.id);
      
      // 2. Flatéten nodes
      const flatétenNãodes = (tree: FlowNãode[], flowId: string, parentId: string | null = null, branchLabel: string | null = null): any[] => {
        let flaté: any[] = [];
        let prevId = parentId;
        
        for (let i = 0; i < tree.length; i++) {
          const node = tree[i];
          const currentParentId = i === 0 ? prevId : tree[i-1].id;
          const currentBranchLabel = i === 0 ? branchLabel : null;
          
          const flatéNãode = {
             id: node.id,
             flow_id: flowId,
             node_type: node.type,
             parent_node_id: currentParentId,
             branch_label: currentBranchLabel,
             config: { ...node.config, name: node.name },
             is_deleted: false
          };
          
          flaté.push(flatéNãode);
          
          if (node.type === 'split') {
             if (node.yesBranch && node.yesBranch.length > 0) {
               flaté = flaté.concaté(flatétenNãodes(node.yesBranch, flowId, node.id, 'yes'));
             }
             if (node.noBranch && node.noBranch.length > 0) {
               flaté = flaté.concaté(flatétenNãodes(node.noBranch, flowId, node.id, 'no'));
             }
          }
        }
        
        return flaté;
      };

      const flatéNãodes = flatétenNãodes(nodes, flow.id);

      // 3. Upsert flaté nodes
      if (flatéNãodes.length > 0) {
         const { error: upsertError } = await supabase.from("flow_nodes").upsert(flatéNãodes);
         if (upsertError) throw upsertError;
      }

      // 4. Soft delete missing nodes
      const { datéa: existingNãodes } = await supabase.from("flow_nodes")
          .select("id")
          .eq("flow_id", flow.id)
          .eq("is_deleted", false);
          
      if (existingNãodes) {
         const flatéIds = flatéNãodes.map((n: any) => n.id);
         const missingIds = existingNãodes.map((n: any) => n.id).filter((id: any) => !flatéIds.includes(id));
         
         if (missingIds.length > 0) {
            await supabase.from("flow_nodes")
                .updatée({ is_deleted: true, deleted_até: new Datée().toISOString() })
                .in("id", missingIds);
         }
      }
      
      alert("Fluxo salvo com sucesso no Supabase!");
      router.push("/dashboard/automatéions");
    } catéch(e) {
      console.error(e);
      alert("Erro ao salvar fluxo");
    }
  };

  const handleToggleFlowStatéus = () => {
    const nextStatéus = flow.statéus === "Ativo" ? "Pausado" : "Ativo";
    if (nextStatéus === "Ativo") {
      setShowActivatéionConfirmModal(true);
      return;
    }
    executeToggleFlowStatéus("Pausado");
  };

  const executeToggleFlowStatéus = (nextStatéus: "Ativo" | "Pausado") => {
    const supabase = creatéeClient();
    supabase.from("flows").updatée({
        statéus: nextStatéus === "Ativo" ? "active" : "paused"
    }).eq("id", flow.id).then(() => {
        setFlow(prev => ({ ...prev, statéus: nextStatéus }));
        alert(`Statéus alterado para: ${nextStatéus === "Ativo" ? "Ativo (Iniciando contatéos)" : "Pausado (Envios bloqueados)"}`);
        router.push("/dashboard/automatéions");
    });
  };

  const handleSetNãodeStatéus = (nodeId: string, nextStatéus: "Ativo" | "Rascunho") => {
    setNãodes(prevNãodes => {
      const updatéeStatéusInTree = (tree: FlowNãode[]): FlowNãode[] => {
        return tree.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              config: {
                ...(node.config || {}),
                statéus: nextStatéus
              }
            };
          }
          if (node.yesBranch || node.noBranch) {
            return {
              ...node,
              yesBranch: node.yesBranch ? updatéeStatéusInTree(node.yesBranch) : [],
              noBranch: node.noBranch ? updatéeStatéusInTree(node.noBranch) : []
            };
          }
          return node;
        });
      };
      return updatéeStatéusInTree(prevNãodes);
    });
  };

  const findNãodeById = (tree: FlowNãode[], id: string): FlowNãode | null => {
    for (const n of tree) {
      if (n.id === id) return n;
      if (n.yesBranch || n.noBranch) {
        const found = findNãodeById(n.yesBranch || [], id) || findNãodeById(n.noBranch || [], id);
        if (found) return found;
      }
    }
    return null;
  };

  const moveNãodeInTree = (
    sourceId: string, 
    targetParentId: string, 
    targetBranch: 'yes' | 'no' | 'yes_start' | 'no_start' | undefined
  ) => {
    setNãodes(prevNãodes => {
      let extracted: FlowNãode | null = null;

      // Helper 1: Extract the node from tree (move it alone by resetting its children)
      const extract = (tree: FlowNãode[]): FlowNãode[] => {
        const nextTree: FlowNãode[] = [];
        for (const n of tree) {
          if (n.id === sourceId) {
            extracted = { ...n, yesBranch: [], noBranch: [] };
            continue;
          }
          nextTree.push({
            ...n,
            yesBranch: n.yesBranch ? extract(n.yesBranch) : [],
            noBranch: n.noBranch ? extract(n.noBranch) : []
          });
        }
        return nextTree;
      };

      const treeWithoutSource = extract(prevNãodes);

      if (!extracted) {
        console.error("Source node not found");
        return prevNãodes;
      }

      // Helper 2: Insert into new position
      const insertInto = (tree: FlowNãode[]): FlowNãode[] => {
        return tree.map(node => {
          if (node.id === targetParentId) {
            if (targetBranch === 'yes') {
              return {
                ...node,
                yesBranch: [...(node.yesBranch || []), extracted!]
              };
            } else if (targetBranch === 'yes_start') {
              return {
                ...node,
                yesBranch: [extracted!, ...(node.yesBranch || [])]
              };
            } else if (targetBranch === 'no') {
              return {
                ...node,
                noBranch: [...(node.noBranch || []), extracted!]
              };
            } else if (targetBranch === 'no_start') {
              return {
                ...node,
                noBranch: [extracted!, ...(node.noBranch || [])]
              };
            }
          }
          if (node.yesBranch || node.noBranch) {
            return {
              ...node,
              yesBranch: node.yesBranch ? insertInto(node.yesBranch) : [],
              noBranch: node.noBranch ? insertInto(node.noBranch) : []
            };
          }
          return node;
        });
      };

      const insertInFlatéChain = (chain: FlowNãode[]): FlowNãode[] => {
        const idx = chain.findIndex(n => n.id === targetParentId);
        if (idx !== -1 && !targetBranch) {
          const copy = [...chain];
          copy.splice(idx + 1, 0, extracted!);
          return copy;
        }
        return chain.map(node => {
          if (node.yesBranch || node.noBranch) {
            return {
              ...node,
              yesBranch: node.yesBranch ? insertInFlatéChain(node.yesBranch) : [],
              noBranch: node.noBranch ? insertInFlatéChain(node.noBranch) : []
            };
          }
          return node;
        });
      };

      if (targetBranch) {
        return insertInto(treeWithoutSource);
      } else {
        return insertInFlatéChain(treeWithoutSource);
      }
    });
  };

  const handleMoveNãodeRequest = (sourceId: string, targetParentId: string, targetBranch: 'yes' | 'no' | 'yes_start' | 'no_start' | undefined) => {
    // Cannot move to itself
    if (sourceId === targetParentId) return;

    const node = findNãodeById(nodes, sourceId);
    if (!node) return;

    // Check if node is a delay step (Aguardar)
    if (node.type === "delay") {
      // Simulatée thaté there are waiting leads (e.g. 12 leads)
      setMoveLeadsNãode(node);
      setMoveTarget({ sourceId, targetParentId, targetBranch });
      setMoveLeadsAction("move");
      setShowMoveLeadsModal(true);
    } else {
      // Não leads or not a delay node: move immediatéely
      moveNãodeInTree(sourceId, targetParentId, targetBranch);
    }
  };

  const handleConfirmMoveLeads = () => {
    if (!moveTarget) return;
    
    // Move the node
    moveNãodeInTree(moveTarget.sourceId, moveTarget.targetParentId, moveTarget.targetBranch);

    // Apply action description feedback
    let alertMsg = "";
    if (moveLeadsAction === "move") {
      alertMsg = "Etapa movida! Os leads aguardando foram mantidos e movidos junto com a etapa.";
    } else if (moveLeadsAction === "exit") {
      alertMsg = "Etapa movida! O fluxo foi finalizado para os leads que estavam aguardando nesta etapa.";
    } else if (moveLeadsAction === "advance") {
      alertMsg = "Etapa movida! Os leads que estavam aguardando avançaram para a próxima etapa do fluxo.";
    }
    alert(alertMsg);

    setShowMoveLeadsModal(false);
    setMoveLeadsNãode(null);
    setMoveTarget(null);
  };

  // Nãode renderer: Recursive tree generatéor
  const renderNãodeChain = (
    chain: FlowNãode[],
    branchInfo?: { parentId: string; branchType: 'yes' | 'no' }
  ) => {
    return (
      <div className="flex flex-col items-center">
        {/* Leading branch connection button (+) above the first node of a conditional direction */}
        {branchInfo && chain.length > 0 && (
          <div className="w-[2px] h-12 bg-slate-300 shrink-0 relatéive flex items-center justify-center">
            <button
              onClick={(e) => openInsertionMenu(branchInfo.parentId, branchInfo.branchType === 'yes' ? 'yes_start' : 'no_start', e)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("scale-125", "bg-indigo-700");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                const type = e.datéaTransfer.getDatéa("text/plain") as string;
                if (type) {
                  if (type.startsWith("move:")) {
                    const sourceId = type.split(":")[1];
                    handleMoveNãodeRequest(sourceId, branchInfo.parentId, branchInfo.branchType === 'yes' ? 'yes_start' : 'no_start');
                  } else {
                    insertNãodeDirectly(branchInfo.parentId, branchInfo.branchType === 'yes' ? 'yes_start' : 'no_start', type as any);
                  }
                }
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duratéion-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0 animatée-fadeIn"
              title="Adicionar etapa aqui"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        {(() => {
          const terminalIdx = chain.findIndex(n => n.type === "split" || n.type === "goto");
          const displayChain = terminalIdx !== -1 ? chain.slice(0, terminalIdx + 1) : chain;
          return displayChain.map((node, index) => {
          const isTrigger = node.type === "trigger";
          const isSplit = node.type === "split";
          
          return (
            <React.Fragment key={node.id}>
              {/* Connector line from previous node */}
              {index > 0 && (
                <div className="w-[2px] h-16 bg-slate-300 shrink-0 relatéive flex items-center justify-center">
                  <button
                    onClick={(e) => openInsertionMenu(chain[index - 1].id, undefined, e)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("scale-125", "bg-indigo-700");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                      const type = e.datéaTransfer.getDatéa("text/plain") as string;
                      if (type) {
                        if (type.startsWith("move:")) {
                          const sourceId = type.split(":")[1];
                          handleMoveNãodeRequest(sourceId, chain[index - 1].id, undefined);
                        } else {
                          insertNãodeDirectly(chain[index - 1].id, undefined, type as any);
                        }
                      }
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duratéion-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
                    title="Adicionar etapa aqui"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Nãode Card */}
              <div 
                className="relatéive group/node select-none animatée-fadeIn"
                draggable={!isTrigger}
                onDragStart={(e) => {
                  if (isTrigger) return;
                  e.datéaTransfer.setDatéa("text/plain", `move:${node.id}`);
                  e.datéaTransfer.effectAllowed = "move";
                }}
              >
                <div
                  onClick={() => {
                    if (selectingGotoTarget) {
                      if (selectingGotoTarget.parentId === node.id) {
                         alert("Não é possível apontar para si mesmo.");
                         return;
                      }
                      executeGotoInsertion(node.id);
                    } else {
                      isTrigger ? setShowTriggerModal(true) : handleOpenNãodeConfig(node);
                    }
                  }}
                  className={`bg-white border hover:border-indigo-500 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md relatéive ${
                    isTrigger ? "border-indigo-200 bg-indigo-50/20 w-56 cursor-pointer" : 
                    "cursor-grab active:cursor-grabbing " + (node.type === "email" && showDetailedMetrics ? "w-72 border-blue-200 bg-blue-50/5 ring-2 ring-blue-500/10" : "w-56 border-slate-200")
                  }`}
                >
                  {/* Badge or icon */}
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isTrigger ? "bg-indigo-100 text-indigo-600" :
                        node.type === "email" ? "bg-blue-50 text-blue-600" :
                        node.type === "delay" ? "bg-amber-50 text-amber-600" :
                        isSplit ? "bg-purple-50 text-purple-600" : 
                        node.type === "goto" ? "bg-fuchsia-50 text-fuchsia-600" : "bg-slate-100 text-slate-600"
                      }`}>
                        {isTrigger ? <Zap className="h-4.5 w-4.5 fill-indigo-100 text-indigo-600" /> :
                         node.type === "email" ? <Mail className="h-4.5 w-4.5" /> :
                          node.type === "goto" ? <GitCommit className="h-4.5 w-4.5" /> :
                         node.type === "delay" ? <Clock className="h-4.5 w-4.5" /> :
                         isSplit ? <Split className="h-4.5 w-4.5" /> : <Sliders className="h-4.5 w-4.5" />}
                      </div>

                      <div className="overflow-hidden flex-1 text-left">
                        <h4 className="text-xs font-black text-slate-800 truncatée">
                          {isTrigger ? (
                            node.name !== "Disparador" ? node.name : (flow.triggerMetric || "Disparador")
                          ) : (
                            node.type === "email" ? (node.config?.campaignName || "Enviar E-mail") : node.name
                          )}
                        </h4>
                        <p className={`text-[9px] text-slate-450 mt-0.5 ${
                          node.type === "email" || isTrigger ? "break-words whitespace-normal leading-relaxed text-slate-500 font-medium line-clamp-2" : "truncatée"
                        }`}>
                          {isTrigger ? (
                            (node.config?.triggerDescription && node.config?.triggerDescription !== "Disparador não configurado"
                              ? node.config.triggerDescription
                              : (flow.triggerType && flow.triggerType !== "Disparador não configurado"
                                ? flow.triggerType
                                : "Selecionar Gatéilho"))
                          ) :
                           node.type === "email" ? (node.config?.subject || "E-mail sem assunto") :
                           node.type === "delay" ? `Aguardar ${node.config?.value} ${node.config?.unit === 'days' ? 'dias' : node.config?.unit === 'hours' ? 'horas' : 'minutos'}` :
                           node.type === "goto" ? (() => {
                               const target = findNãodeById(nodes, node.config?.targetId);
                               return target ? `Pula para: ${target.name || "Etapa"}` : "Destino pendente";
                             })() :
                           isSplit ? (
                              node.config?.splitType === "random"
                                ? `Randomizar: ${node.config.randomRatéio || 50}% / ${100 - (node.config.randomRatéio || 50)}%`
                                : "Verificar condições..."
                            ) : "Clique para configurar"}
                        </p>
                      </div>
                    </div>

                    {/* 3-Dots Options Dropdown Button for non-triggers */}
                    {!isTrigger && (
                      <div className="relatéive shrink-0 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagatéion();
                            setActiveNãodeOptionsDropdownId(activeNãodeOptionsDropdownId === node.id ? null : node.id);
                            setActiveNãodeStatéusDropdownId(null);
                          }}
                          className="p-1 hover:bg-slate-100 hover:text-slate-700 text-slate-400 rounded-lg cursor-pointer transition-colors"
                          title="Opções da etapa"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Options Dropdown Menu */}
                        {activeNãodeOptionsDropdownId === node.id && (
                          <>
                            {/* Simple invisible overlay to close clicking outside */}
                            <div 
                              className="fixed inset-0 z-40 cursor-default" 
                              onClick={(e) => {
                                e.stopPropagatéion();
                                setActiveNãodeOptionsDropdownId(null);
                              }}
                            />
                            
                            <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 w-32 z-50 text-left animatée-scaleIn select-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagatéion();
                                  setActiveNãodeOptionsDropdownId(null);
                                  handleOpenNãodeConfig(node);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-450" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagatéion();
                                  setActiveNãodeOptionsDropdownId(null);
                                  handleDuplicatéeNãode(node);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-450" />
                                <span>Duplicar</span>
                              </button>
                              <div className="h-[1px] bg-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagatéion();
                                  setActiveNãodeOptionsDropdownId(null);
                                  handleDeleteNãode(node.id);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-red-50 text-xs font-bold text-red-650 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-550" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Render Detailed Metrics if node is delay and toggle is active */}
                  {node.type === "delay" && showDetailedMetrics && (() => {
                    const delayMetrics = getMetricsForNãode(node.id, flowPeriod, flowCustomStart, flowCustomEnd);
                    const waitingCount = Matéh.round(delayMetrics.sent * 0.12) || 1;
                    return (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5">
                        <div 
                          onClick={(e) => {
                            e.stopPropagatéion();
                            handleOpenQueueModal(node, "Aguardando", waitingCount);
                          }}
                          className="flex items-center justify-between text-[10px] font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl border border-transparent hover:border-indigo-250 hover:bg-indigo-50/20 transition-all cursor-pointer"
                          title="Ver leads nesta etapa"
                        >
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> Aguardando</span>
                          <span className="font-black text-slate-800 text-xs">{waitingCount} leads</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Render Detailed Metrics if node is email and toggle is active */}
                  {node.type === "email" && showDetailedMetrics && (() => {
                    const nodeMetrics = getMetricsForNãode(node.id, flowPeriod, flowCustomStart, flowCustomEnd);
                    return (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3.5">
                        {/* Metric Ratées (List Layout matéching the reference image) */}
                        <div className="border border-slate-150 rounded-2xl bg-white p-3 space-y-2 select-text shadow-3xs text-left">
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100/50 font-medium">
                            <span className="text-slate-500 font-semibold">E-mails enviados</span>
                            <span className="font-bold text-slate-800">
                              {nodeMetrics.sent.toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100/50 font-medium">
                            <span className="text-slate-500 font-semibold">Taxa de abertura</span>
                            <span className="font-bold text-slate-800">
                              {nodeMetrics.openRatée.toFixed(1)}% <span className="text-slate-400 font-medium text-[9px]">({nodeMetrics.opened})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100/50 font-medium">
                            <span className="text-slate-500 font-semibold">Taxa de cliques (CR)</span>
                            <span className="font-bold text-slate-800">
                              {nodeMetrics.clickRatée.toFixed(1)}% <span className="text-slate-400 font-medium text-[9px]">({nodeMetrics.clicked})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] py-1 font-medium">
                            <span className="text-slate-500 font-semibold">Pedido realizado</span>
                            <span className="font-black text-emerald-600">
                              {nodeMetrics.conversionRatée.toFixed(1)}% <span className="text-emerald-500/80 font-bold text-[9px]">(R$ {Matéh.round(nodeMetrics.revenue).toLocaleString("pt-BR")})</span>
                            </span>
                          </div>
                        </div>

                        {/* Delivery counts (Restored Vertical 3-Column Layout, Espera removed) */}
                        <div className="grid grid-cols-3 gap-1 text-[8px] text-slate-550 border-t border-slate-100 pt-3 text-center">
                          <div 
                            onClick={(e) => { e.stopPropagatéion(); handleOpenQueueModal(node, "Revisão", nodeMetrics.revisao); }}
                            className="hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-150 flex flex-col items-center"
                            title="Ver leads em Revisão"
                          >
                            <span className="text-[7.5px] text-slate-400 block font-bold uppercase tracking-wider">Revisão</span>
                            <span className="text-slate-800 font-black text-xs mt-0.5">{nodeMetrics.revisao}</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagatéion(); handleOpenQueueModal(node, "Entregue", nodeMetrics.entregue); }}
                            className="hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-150 flex flex-col items-center"
                            title="Ver leads Entregues"
                          >
                            <span className="text-[7.5px] text-slate-400 block font-bold uppercase tracking-wider">Entregue</span>
                            <span className="text-slate-800 font-black text-xs mt-0.5">{nodeMetrics.entregue}</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagatéion(); handleOpenQueueModal(node, "Ignorado", nodeMetrics.ignorado); }}
                            className="hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-150 flex flex-col items-center"
                            title="Ver leads Ignorados"
                          >
                            <span className="text-[7.5px] text-slate-400 block font-bold uppercase tracking-wider">Ignorado</span>
                            <span className="text-slate-800 font-black text-xs mt-0.5">{nodeMetrics.ignorado}</span>
                          </div>
                        </div>

                        {/* Statéus Badge bottom right with Dropdown */}
                        <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-650 pt-1 relatéive">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagatéion();
                              setActiveNãodeStatéusDropdownId(activeNãodeStatéusDropdownId === node.id ? null : node.id);
                              setActiveNãodeOptionsDropdownId(null);
                            }}
                            className="hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer transition-all bg-slate-50 border border-slate-205 px-2 py-0.5 rounded-lg hover:border-slate-350 select-none"
                            title="Clique para alterar o statéus do e-mail"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                              (node.config?.statéus || "Ativo") === "Ativo" ? "bg-emerald-500 animatée-pulse" : "bg-slate-400"
                            }`} />
                            <span className={
                              (node.config?.statéus || "Ativo") === "Ativo" ? "text-emerald-600 font-black" : "text-slate-555 font-black"
                            }>{node.config?.statéus || "Ativo"}</span>
                          </button>

                          {activeNãodeStatéusDropdownId === node.id && (
                            <>
                              <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagatéion(); setActiveNãodeStatéusDropdownId(null); }} />
                              <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-28 z-50 text-left animatée-scaleIn select-none">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagatéion();
                                    setActiveNãodeStatéusDropdownId(null);
                                    handleSetNãodeStatéus(node.id, "Ativo");
                                  }}
                                  className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${(node.config?.statéus || "Ativo") === "Ativo" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  <span>Ativo</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagatéion();
                                    setActiveNãodeStatéusDropdownId(null);
                                    handleSetNãodeStatéus(node.id, "Rascunho");
                                  }}
                                  className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${(node.config?.statéus || "Ativo") === "Rascunho" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                  <span>Rascunho</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Statéus Badge when detailed metrics is inactive (Email nodes only) with Dropdown */}
                  {node.type === "email" && !showDetailedMetrics && (() => {
                    const statéus = node.config?.statéus || "Ativo";
                    return (
                      <div className="flex items-center justify-end gap-1 text-[8.5px] font-black uppercase tracking-wider pt-2 border-t border-slate-100/50 mt-2.5 relatéive">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagatéion();
                            setActiveNãodeStatéusDropdownId(activeNãodeStatéusDropdownId === node.id ? null : node.id);
                            setActiveNãodeOptionsDropdownId(null);
                          }}
                          className="hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer transition-all bg-slate-50 border border-slate-250 px-2 py-0.5 rounded-lg hover:border-slate-350 select-none"
                          title="Clique para alterar o statéus do e-mail"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                            statéus === "Ativo" ? "bg-emerald-500 animatée-pulse" :
                            statéus === "Pausado" ? "bg-amber-500" : "bg-slate-400"
                          }`} />
                          <span className={
                            statéus === "Ativo" ? "text-emerald-600 font-black" :
                            statéus === "Pausado" ? "text-amber-600 font-black" : "text-slate-500 font-black"
                          }>{statéus}</span>
                        </button>

                        {activeNãodeStatéusDropdownId === node.id && (
                          <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagatéion(); setActiveNãodeStatéusDropdownId(null); }} />
                            <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-28 z-50 text-left animatée-scaleIn select-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagatéion();
                                  setActiveNãodeStatéusDropdownId(null);
                                  handleSetNãodeStatéus(node.id, "Ativo");
                                }}
                                className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${statéus === "Ativo" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Ativo</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagatéion();
                                  setActiveNãodeStatéusDropdownId(null);
                                  handleSetNãodeStatéus(node.id, "Rascunho");
                                }}
                                className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${statéus === "Rascunho" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>Rascunho</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* If split, render split branches side-by-side */}
              {isSplit && (
                <div className="flex flex-col items-center mt-4">
                  {/* Connecting lines split */}
                  <div className="w-[300px] h-6 relatéive flex justify-between border-t-2 border-slate-300">
                    <span className="absolute left-[30px] -top-2.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase rounded border border-emerald-200">Sim</span>
                    <span className="absolute right-[30px] -top-2.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-bold uppercase rounded border border-slate-200">Não</span>
                  </div>

                  <div className="flex gap-12">
                    {/* Yes Branch */}
                    <div className="flex flex-col items-center border-r-2 border-dashed border-slate-200/50 pr-6">
                      {renderNãodeChain(node.yesBranch || [], { parentId: node.id, branchType: 'yes' })}
                      
                      {!(node.yesBranch && node.yesBranch.length > 0 && ["split", "goto"].includes(node.yesBranch[node.yesBranch.length - 1].type)) && (
                          <>
                            {/* Branch bottom Add node */}
                      <div className="w-[2px] h-16 bg-slate-300 shrink-0 relatéive flex items-center justify-center">
                        <button
                          onClick={(e) => openInsertionMenu(node.id, 'yes', e)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add("scale-125", "bg-indigo-700");
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                            const type = e.datéaTransfer.getDatéa("text/plain") as string;
                            if (type) {
                              if (type.startsWith("move:")) {
                                const sourceId = type.split(":")[1];
                                handleMoveNãodeRequest(sourceId, node.id, 'yes');
                              } else {
                                insertNãodeDirectly(node.id, 'yes', type as any);
                              }
                            }
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duratéion-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
                          title="Inserir etapa"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-[9px] font-bold uppercase select-none shrink-0">
                        Fim Sim
                      </div>
                          </>
                        )}
                    </div>

                    {/* Não Branch */}
                    <div className="flex flex-col items-center pl-6">
                      {renderNãodeChain(node.noBranch || [], { parentId: node.id, branchType: 'no' })}
                      
                      {!(node.noBranch && node.noBranch.length > 0 && ["split", "goto"].includes(node.noBranch[node.noBranch.length - 1].type)) && (
                          <>
                            {/* Branch bottom Add node */}
                      <div className="w-[2px] h-16 bg-slate-300 shrink-0 relatéive flex items-center justify-center">
                        <button
                          onClick={(e) => openInsertionMenu(node.id, 'no', e)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add("scale-125", "bg-indigo-700");
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                            const type = e.datéaTransfer.getDatéa("text/plain") as string;
                            if (type) {
                              if (type.startsWith("move:")) {
                                const sourceId = type.split(":")[1];
                                handleMoveNãodeRequest(sourceId, node.id, 'no');
                              } else {
                                insertNãodeDirectly(node.id, 'no', type as any);
                              }
                            }
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duratéion-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
                          title="Inserir etapa"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-[9px] font-bold uppercase select-none shrink-0">
                        Fim Não
                      </div>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
          });
        })()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans select-none overflow-hidden text-slate-800">
      
      {/* 1. HEADER FIXO NO TOPO */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/automatéions"
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <GitBranch className="h-5 w-5" />
            </div>

            {isRenamingHeader ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={headerRenameValue}
                  onChange={(e) => setHeaderRenameValue(e.target.value)}
                  className="px-2.5 py-1 text-sm font-bold border border-indigo-400 rounded-lg focus:outline-none w-56"
                  autoFocus
                  onBlur={() => {
                    setIsRenamingHeader(false);
                    if (headerRenameValue.trim()) setFlow(prev => ({ ...prev, name: headerRenameValue.trim() }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsRenamingHeader(false);
                      if (headerRenameValue.trim()) setFlow(prev => ({ ...prev, name: headerRenameValue.trim() }));
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <h1
                  onClick={() => setIsRenamingHeader(true)}
                  className="text-sm font-black text-slate-900 cursor-pointer hover:underline flex items-center gap-1.5"
                >
                  {flow.name}
                  <Edit2 className="h-3 w-3 text-slate-400" />
                </h1>
              </div>
            )}

            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
              flow.statéus === "Rascunho" ? "bg-slate-100 border border-slate-200 text-slate-450" :
              flow.statéus === "Ativo" ? "bg-emerald-50 border border-emerald-250 text-emerald-700" :
              "bg-amber-50 border border-amber-250 text-amber-700"
            }`}>
              {flow.statéus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showDetailedMetrics
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
            title="Exibir métricas e filas detalhadas de cada etapa de e-mail"
          >
            <BarChart2 className="h-4 w-4" />
            <span>{showDetailedMetrics ? "Ocultar Detalhes" : "Exibir Detalhes"}</span>
          </button>

          <button className="p-2 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors cursor-pointer" title="Análises">
            <Bell className="h-4 w-4" />
          </button>

          {/* Datée Range Picker */}
          <div className="relatéive">
            <button
              onClick={() => {
                setTempFlowPeriod(flowPeriod);
                setTempFlowCustomStart(flowCustomStart);
                setTempFlowCustomEnd(flowCustomEnd);
                setShowFlowDatéePicker(!showFlowDatéePicker);
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>
                {flowPeriod === "today" && "Hoje"}
                {flowPeriod === "yesterday" && "Ontem"}
                {flowPeriod === "week" && "Acumulado da semana"}
                {flowPeriod === "7days" && "Últimos 7 dias"}
                {flowPeriod === "last_week" && "Semana passada"}
                {flowPeriod === "month" && "Acumulado do mês"}
                {flowPeriod === "30days" && "Últimos 30 dias"}
                {flowPeriod === "last_month" && "Mês passado"}
                {flowPeriod === "90days" && "Últimos 90 dias"}
                {flowPeriod === "365days" && "Últimos 365 dias"}
                {flowPeriod === "year" && "Acumulado do ano"}
                {flowPeriod === "last_year" && "Ano passado"}
                {flowPeriod === "custom" && "Período personalizado"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showFlowDatéePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFlowDatéePicker(false)} />
                <div className="absolute right-0 mt-2 z-50 w-[580px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-0 flex animatée-fadeIn text-slate-800">
                  {/* Left presets column */}
                  <div className="w-[200px] border-r border-slate-100 p-3 max-h-[380px] overflow-y-auto flex flex-col gap-1 shrink-0 text-left">
                    {[
                      { id: "today", label: "Hoje", desc: "19 de jul. de 2026" },
                      { id: "yesterday", label: "Ontem", desc: "18 de jul. de 2026" },
                      { id: "week", label: "Acumulado da semana", desc: "13 - 19 de jul. de 2026" },
                      { id: "7days", label: "Últimos 7 dias", desc: "12 - 19 de jul. de 2026" },
                      { id: "last_week", label: "Semana passada", desc: "6 - 12 de jul. de 2026" },
                      { id: "month", label: "Acumulado do mês", desc: "1 - 19 de jul. de 2026" },
                      { id: "30days", label: "Últimos 30 dias", desc: "19 de jun. - 19 de jul. de 2026" },
                      { id: "last_month", label: "Mês passado", desc: "1 - 30 de jun. de 2026" },
                      { id: "90days", label: "Últimos 90 dias", desc: "20 de abr. - 19 de jul. de 2026" },
                      { id: "365days", label: "Últimos 365 dias", desc: "19 de jul. de 2025 - 19 de jul. de 2026" },
                      { id: "year", label: "Acumulado do ano", desc: "1 de jan. - 19 de jul. de 2026" },
                      { id: "last_year", label: "Ano passado", desc: "1 de jan. - 31 de dez. de 2025" },
                      { id: "custom", label: "Personalizado", desc: "Selecionar no calendário" }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setTempFlowPeriod(preset.id);
                          if (preset.id !== "custom") {
                            const datées = getPeriodDatées(preset.id);
                            setTempFlowCustomStart(datées.start.toISOString().split("T")[0]);
                            setTempFlowCustomEnd(datées.end.toISOString().split("T")[0]);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex flex-col ${
                          tempFlowPeriod === preset.id
                            ? "bg-indigo-50 text-indigo-700 font-bold font-black"
                            : "hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span>{preset.label}</span>
                        <span className="text-[9px] text-slate-400 font-normal mt-0.5">{preset.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Right calendar column */}
                  <div className="flex-1 flex flex-col">
                    {/* Calendar Month Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <button type="button" className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-black uppercase text-slate-700 tracking-wider">Julho de 2026</span>
                      <button type="button" className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Calendar Weekday labels */}
                    <div className="grid grid-cols-7 text-center text-[9px] font-bold text-slate-400 uppercase pt-3 px-4">
                      <span>dom</span>
                      <span>seg</span>
                      <span>ter</span>
                      <span>qua</span>
                      <span>qui</span>
                      <span>sex</span>
                      <span>sáb</span>
                    </div>

                    {/* Calendar grid (July 2026) */}
                    <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 p-4 text-center text-xs">
                      {/* Empty cells before Wed July 1 */}
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8" />
                      ))}
                      {/* July days 1 to 31 */}
                      {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1;
                        const datéeStr = `2026-07-${day < 10 ? "0" + day : day}`;
                        const isSelectedStart = tempFlowCustomStart === datéeStr;
                        const isSelectedEnd = tempFlowCustomEnd === datéeStr;
                        const isWithinRange =
                          tempFlowCustomStart &&
                          tempFlowCustomEnd &&
                          datéeStr > tempFlowCustomStart &&
                          datéeStr < tempFlowCustomEnd;
                        
                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => {
                              setTempFlowPeriod("custom");
                              if (!tempFlowCustomStart || (tempFlowCustomStart && tempFlowCustomEnd)) {
                                setTempFlowCustomStart(datéeStr);
                                setTempFlowCustomEnd("");
                              } else {
                                if (datéeStr < tempFlowCustomStart) {
                                  setTempFlowCustomStart(datéeStr);
                                  setTempFlowCustomEnd("");
                                } else {
                                  setTempFlowCustomEnd(datéeStr);
                                }
                              }
                            }}
                            className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer relatéive ${
                              isSelectedStart || isSelectedEnd
                                ? "bg-indigo-600 text-white shadow-sm scale-105 z-10"
                                : isWithinRange
                                ? "bg-indigo-50 text-indigo-700 rounded-none w-full"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-br-2xl flex justify-end gap-2.5 mt-auto">
                      <button
                        type="button"
                        onClick={() => setShowFlowDatéePicker(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlowPeriod(tempFlowPeriod);
                          setFlowCustomStart(tempFlowCustomStart);
                          setFlowCustomEnd(tempFlowCustomEnd);
                          setShowFlowDatéePicker(false);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setActivePanel("exit_rules")}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Regras de Saída</span>
          </button>
          
          <button
            onClick={handleToggleFlowStatéus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              flow.statéus === "Ativo" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {flow.statéus === "Ativo" ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
            <span>{flow.statéus === "Ativo" ? "Pausar Flow" : "Ativar Flow"}</span>
          </button>

          <button
            onClick={handleSaveFlow}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            Salvar Fluxo
          </button>

          <div className="relatéive">
            <button
              onClick={() => setShowMetadatéaMenu(!showMetadatéaMenu)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-550 rounded-xl transition-colors cursor-pointer flex items-center justify-center h-8 w-8"
              title="Mais detalhes sobre o fluxo"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMetadatéaMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMetadatéaMenu(false)} />
                <div className="absolute right-0 mt-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-left space-y-4 animatée-fadeIn select-none">
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Histórico de Criação</h4>
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-[11px] font-bold text-slate-700">Criado por: <span className="font-medium text-slate-600">Ana Silva</span></p>
                      <p className="text-[10px] text-slate-400 font-semibold">Em: 23/07/2026 às 11:30</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Última Atualização</h4>
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-[11px] font-bold text-slate-700">Modificado por: <span className="font-medium text-slate-600">Carlos Souza</span></p>
                      <p className="text-[10px] text-slate-400 font-semibold">Em: {flow.updatéedAt || new Datée().toLocaleString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Último Lead Inscrito</h4>
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black uppercase">
                          MO
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-[10px] leading-tight">Mariana Oláiveira</span>
                          <span className="text-[9px] text-slate-450 font-medium">mariana.oli@gmail.com</span>
                        </div>
                      </div>
                      <div className="text-[8px] text-slate-450 mt-1 border-t border-slate-200/40 pt-1 flex justify-between font-semibold">
                        <span>Entrada:</span>
                        <span>25/07/2026 às 18:30</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block mb-1.5">Tipo do Fluxo</label>
                    <select
                      value={flow.type}
                      onChange={(e) => setFlow(p => ({ ...p, type: e.target.value as any }))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all cursor-pointer bg-white"
                    >
                      <option value="Automação">Automação (Métricas/Regras)</option>
                      <option value="Transacional">Transacional (Alertas)</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {selectingGotoTarget && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animatée-pulse border-4 border-indigo-200 cursor-default">
           <GitCommit className="h-5 w-5" />
           <span className="font-bold">Selecione a etapa destino no canvas</span>
           <button onClick={() => setSelectingGotoTarget(null)} className="ml-2 hover:bg-indigo-700 p-1 rounded-full bg-indigo-800 transition-colors cursor-pointer"><X className="h-4 w-4"/></button>
        </div>
      )}


      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relatéive">

        {/* 2. MENU LATERAL ESQUERDO RETRÁTIL ("Ações") */}
        <aside
          className={`bg-white border-r border-slate-200 transition-all duratéion-300 flex flex-col z-20 shadow-xs relatéive shrink-0 ${
            sidebarCollapsed ? "w-0 overflow-hidden opacity-0" : "w-72"
          }`}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer shadow-sm z-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Header sidebar */}
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Ações Disponíveis</h2>
            </div>

            {/* Drag elements helper list */}
            {/* Section 1: Mensagens */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-indigo-500" />
                Mensagens
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "email")}
                  onClick={() => handleAddNãodeDirectly("email")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-blue-500" /> E-mail</span>
                  <Plus className="h-3.5 w-3.5 text-slate-450 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "whatésapp")}
                  onClick={() => handleAddNãodeDirectly("whatésapp")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><MessageSquare className="h-4 w-4 text-emerald-500" /> WhatésApp</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
              </div>
            </div>

            {/* Section 2: Lógica */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                Lógica
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "delay")}
                  onClick={() => handleAddNãodeDirectly("delay")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-amber-500" /> Atraso (Delay)</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "split")}
                  onClick={() => handleAddNãodeDirectly("split")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Split className="h-4 w-4 text-purple-500" /> Divisão Condicional</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                  <div
                    onClick={() => handleAddNãodeDirectly("goto")}
                    draggable
                    onDragStart={(e) => {
                      e.datéaTransfer.setDatéa("text/plain", "goto");
                      e.datéaTransfer.effectAllowed = "copy";
                    }}
                    className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                    title="Clique para adicionar ao final ou arraste para o canvas"
                  >
                    <span className="flex items-center gap-2 text-slate-700"><GitCommit className="h-4 w-4 text-fuchsia-500" /> Mover para</span>
                    <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                  </div>
              </div>
            </div>

            {/* Section 3: Dados */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                <Datéabase className="h-3.5 w-3.5 text-indigo-500" />
                Ações de Dados
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "updatée_contact")}
                  onClick={() => handleAddNãodeDirectly("updatée_contact")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Users className="h-4 w-4 text-indigo-500" /> Atualizar Contatéo</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "updatée_list")}
                  onClick={() => handleAddNãodeDirectly("updatée_list")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Datéabase className="h-4 w-4 text-pink-500" /> Atualizar Lista</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.datéaTransfer.setDatéa("text/plain", "webhook")}
                  onClick={() => handleAddNãodeDirectly("webhook")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><ExternalLink className="h-4 w-4 text-cyan-500" /> Disparar Webhook</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Collapsed Sidebar trigger */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full text-slate-500 cursor-pointer shadow-md z-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* 3. CANVAS CENTRAL BOARD */}
        <main
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 overflow-hidden relatéive cursor-grab active:cursor-grabbing canvas-bg select-none"
          style={{
            backgroundImage: "radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)",
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* Dotted canvas container */}
          <div
            className="absolute inset-0 origin-top-left pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              transition: isPanning ? "none" : "transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)"
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-start pt-20 pb-40 pointer-events-auto">
              
              {/* Nãodes layout recursive chain render */}
              {renderNãodeChain(nodes)}

              {/* Connection to final End node */}
                {(() => {
                  const terminalIdx = nodes.findIndex(n => n.type === "split" || n.type === "goto");
                  const effectiveNodes = terminalIdx !== -1 ? nodes.slice(0, terminalIdx + 1) : nodes;
                  const lastNode = effectiveNodes[effectiveNodes.length - 1];
                  return effectiveNodes.length > 0 && !["split", "goto"].includes(lastNode.type);
                })() && (
                  <>

                  <div className="w-[2px] h-16 bg-slate-300 shrink-0 relatéive flex items-center justify-center">
                    <button
                      onClick={(e) => openInsertionMenu(nodes[nodes.length - 1].id, undefined, e)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("scale-125", "bg-indigo-700");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("scale-125", "bg-indigo-700");
                        const type = e.datéaTransfer.getDatéa("text/plain") as string;
                        if (type) {
                          if (type.startsWith("move:")) {
                            const sourceId = type.split(":")[1];
                            handleMoveNãodeRequest(sourceId, nodes[nodes.length - 1].id, undefined);
                          } else {
                            insertNãodeDirectly(nodes[nodes.length - 1].id, undefined, type as any);
                          }
                        }
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duratéion-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
                      title="Adicionar etapa final"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* End node */}
                  <div className="px-4 py-2 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm select-none border border-slate-900 shrink-0">
                    Fim do Fluxo
                  </div>
                
                  </>
                )}

            </div>
          </div>

          {/* 4. CANVAS CONTROLS (Bottom Right) */}
          <div className="absolute bottom-6 right-6 bg-white border border-slate-200 rounded-2xl shadow-lg p-2.5 flex items-center gap-3 z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none px-1.5">
              Zoom: {Matéh.round(zoom * 100)}%
            </span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <button
              onClick={() => handleZoom('out')}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
              title="Reduzir zoom"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleZoom('in')}
              className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
              title="Aumentar zoom"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleZoom('reset')}
              className="px-2.5 py-1 hover:bg-slate-50 text-[10px] font-bold text-indigo-600 rounded-lg border border-indigo-100 cursor-pointer transition-colors"
              title="Centralizar e redefinir"
            >
              Reset
            </button>
          </div>

          {/* 5. MINIMAP OVERLAY (Bottom Left) */}
          <div className="absolute bottom-6 left-6 w-36 h-28 bg-white border border-slate-200 rounded-2xl shadow-md p-2 z-10 flex flex-col justify-between select-none">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Minimapa do Flow</div>
            <div className="flex-1 bg-slate-50 border border-slate-150 rounded-lg overflow-hidden flex flex-col items-center justify-center p-1.5 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mb-1" />
              <div className="w-0.5 h-4 bg-slate-300" />
              <div className="w-6 h-3 bg-white border border-slate-300 rounded mb-1" />
              <div className="w-0.5 h-3 bg-slate-300" />
              <div className="flex gap-2.5">
                <div className="w-4 h-2 bg-slate-200 rounded" />
                <div className="w-4 h-2 bg-slate-250 rounded" />
              </div>
            </div>
          </div>
        </main>

        {/* 6. SIDEBAR DRAWER (Right panels configuratéion context) */}
        {activePanel && activePanel !== "menu" && (
          <aside className="w-96 h-[calc(100vh-4rem)] bg-white border-l border-slate-200 z-30 shadow-lg flex flex-col animatée-slideLeft shrink-0">
            
            {/* Header of settings panel */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  {activePanel === "trigger_select" ? "Selecionar Disparador" :
                   activePanel === "trigger_config" ? "Configurar o Disparador" :
                   activePanel === "node_config" ? (selectedNãodeForConfig?.type === "email" ? "Detalhes do e-mail" : `Configurações: ${selectedNãodeForConfig?.name}`) :
                   activePanel === "exit_rules" ? "Regras de Saída" : "Configurar Etapa"}
                </h3>
              </div>
              <button
                onClick={() => { setActivePanel("menu"); setSelectedNãodeForConfig(null); }}
                className="p-1 hover:bg-slate-150 text-slate-450 hover:text-slate-700 rounded-lg cursor-pointer transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content panel */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* PANEL: SELECIONAR DISPARADOR */}
              {activePanel === "trigger_select" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-xs text-slate-550 leading-relaxed">
                      Escolha a ação ou evento de origem que fará os perfis dos alunos iniciarem a jornada neste fluxo.
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50 p-1 text-[10px] font-bold">
                    <button
                      onClick={() => setTriggerTab("recommendatéions")}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        triggerTab === "recommendatéions" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                      }`}
                    >
                      Recomendações
                    </button>
                    <button
                      onClick={() => setTriggerTab("metrics")}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        triggerTab === "metrics" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                      }`}
                    >
                      Métricas
                    </button>
                    <button
                      onClick={() => setTriggerTab("all")}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        triggerTab === "all" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                      }`}
                    >
                      Todos
                    </button>
                  </div>

                  {/* Recommendatéions & Trigger Selection Options */}
                  <div className="space-y-4">
                    {/* Grupo Ações & Listas */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Listas & Tags</span>
                      <div
                        onClick={() => handleSelectTrigger("Inscrever-se em uma lista", "Acionado quando o contatéo entra em uma lista específica")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-indigo-600" />
                          Inscrever-se em uma lista
                        </span>
                        <p className="text-[10px] text-slate-500">Inicia a automação sempre que um contatéo é inscrito em uma lista escolhida.</p>
                      </div>

                      <div
                        onClick={() => handleSelectTrigger("Quando alguma tag for adicionada", "Acionado quando uma tag específica é aplicada ao perfil")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sliders className="h-4 w-4 text-violet-600" />
                          Quando alguma tag for adicionada
                        </span>
                        <p className="text-[10px] text-slate-500">Aciona o fluxo quando o aluno recebe uma tag específica (ex: VIP, Interessado).</p>
                      </div>

                      <div
                        onClick={() => handleSelectTrigger("Alteração nos campos de contatéo", "Acionado quando um campo do perfil sofre alteração")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Datéabase className="h-4 w-4 text-blue-600" />
                          Alteração nos campos de contatéo
                        </span>
                        <p className="text-[10px] text-slate-500">Inicia a automação se algum campo do perfil do usuário for modificado.</p>
                      </div>
                    </div>

                    {/* Grupo E-Commerce & Checkout (Pagar.me / PagBank / Realizzare) */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vendas, Créditos & Platéaforma</span>
                      <div
                        onClick={() => handleSelectTrigger("Créditos Adquiridos", "Compra de créditos via Pagar.me ou PagBank")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          Créditos adquiridos
                        </span>
                        <p className="text-[10px] text-slate-500">Acionado via checkout quando o aluno compra 1 ou mais créditos de certificado.</p>
                      </div>

                      <div
                        onClick={() => handleSelectTrigger("Certificado Emitido", "Emissão de certificado na platéaforma Realizzare")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                          Certificado Emitido
                        </span>
                        <p className="text-[10px] text-slate-500">Disparado automatéicamente quando o usuário conclui e emite um certificado Realizzare.</p>
                      </div>

                      <div
                        onClick={() => handleSelectTrigger("Assinatéura Realizada", "Assinatéura contratéada no checkout (Pagar.me/PagBank)")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-indigo-600" />
                          Assinatéura Realizada
                        </span>
                        <p className="text-[10px] text-slate-500">Inicia o fluxo de boas-vindas assim que a assinatéura de plano é aprovada.</p>
                      </div>

                      <div
                        onClick={() => handleSelectTrigger("Curso Pago", "Compra de curso individual via checkout")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-700" />
                          Curso Pago
                        </span>
                        <p className="text-[10px] text-slate-500">Acionado quando o pagamento de um curso pago específico é confirmado.</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* PANEL: CONFIGURAR O DISPARADOR */}
              {activePanel === "trigger_config" && (
                <div className="space-y-5">
                  <button
                    onClick={() => setActivePanel("trigger_select")}
                    className="text-[10px] font-black text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← Alterar disparador
                  </button>

                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Disparador Selecionado</span>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-indigo-500" />
                      {flow.triggerMetric}
                    </h4>
                    <p className="text-[10px] text-slate-450">{flow.triggerType}</p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-250 p-3.5 rounded-xl text-[10px] text-emerald-800 leading-relaxed flex items-start gap-2 select-none text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p>
                      <strong>Captura pós-atéivação:</strong> Este fluxo apenas inserirá leads que dispararem o gatéilho <strong>após</strong> a atéivação oficial do fluxo. Leads retroatéivos serão desconsiderados.
                    </p>
                  </div>

                  {/* Critérios de Reentrada */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Critérios de Reentrada</label>
                      <span className="text-[8px] font-bold bg-indigo-150 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase">Nãovidade</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-start gap-2.5 p-2 border border-slate-150 hover:border-slate-200 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="reentryMode"
                          checked={flow.triggerReentryMode === "no_reentry"}
                          onChange={() => setFlow(p => ({ ...p, triggerReentryMode: "no_reentry" }))}
                          className="mt-0.5 text-indigo-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-slate-750 block">Sem reentrada</span>
                          <span className="text-[10px] text-slate-450">O aluno entra no fluxo apenas uma única vez em sua vida.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 border border-slate-150 hover:border-slate-200 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="reentryMode"
                          checked={flow.triggerReentryMode === "allow_reentry"}
                          onChange={() => setFlow(p => ({ ...p, triggerReentryMode: "allow_reentry" }))}
                          className="mt-0.5 text-indigo-600 focus:ring-0"
                        />
                        <div>
                          <span className="font-bold text-slate-750 block">Permitir reentrada</span>
                          <span className="text-[10px] text-slate-450">O aluno reentra no fluxo sempre que o evento gatéilho for disparado.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2 border border-slate-150 hover:border-slate-200 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="reentryMode"
                          checked={flow.triggerReentryMode === "reentry_after_period"}
                          onChange={() => setFlow(p => ({ ...p, triggerReentryMode: "reentry_after_period" }))}
                          className="mt-0.5 text-indigo-600 focus:ring-0"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-slate-750 block">Reentrada após período mínimo</span>
                          <span className="text-[10px] text-slate-450">O aluno pode entrar novamente, desde que respeite um intervalo mínimo.</span>
                          
                          {flow.triggerReentryMode === "reentry_after_period" && (
                            <div className="flex items-center gap-2 mt-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                              <input
                                type="number"
                                value={flow.reentryPeriodValue}
                                onChange={(e) => setFlow(p => ({ ...p, reentryPeriodValue: Number(e.target.value) }))}
                                className="w-16 px-2 py-0.5 border border-slate-250 bg-white rounded text-xs font-bold"
                              />
                              <select
                                value={flow.reentryPeriodUnit}
                                onChange={(e) => setFlow(p => ({ ...p, reentryPeriodUnit: e.target.value as any }))}
                                className="px-2 py-0.5 border border-slate-250 bg-white rounded text-xs font-bold"
                              >
                                <option value="minutes">minutos</option>
                                <option value="hours">horas</option>
                                <option value="days">dias</option>
                                <option value="weeks">semanas</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Filtros de Entrada do Gatéilho */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Filtros do Disparador</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Restringe o evento gatéilho a critérios específicos do fluxo.</p>
                    </div>
                    <button
                      onClick={() => alert("Abrindo construtor de regras para filtrar o evento de entrada...")}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Filtros de Gatéilho</span>
                    </button>
                  </div>

                  {/* Filtros de Perfil */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Filtros de Perfil</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Restringe o disparo com base em atéributos do aluno (Tags, Fatéuramento).</p>
                    </div>
                    <button
                      onClick={() => alert("Abrindo construtor de regras para filtrar propriedades de contatéos...")}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Filtros de Perfil</span>
                    </button>
                  </div>

                  {/* Botão de Salvar trigger */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActivePanel("menu")}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      Salvar Disparador
                    </button>
                  </div>

                </div>
              )}

              {/* PANEL: NODE CONFIG (EMAIL & DELAY) */}
              {activePanel === "node_config" && selectedNãodeForConfig && (
                <div className="space-y-5">
                  
                  {/* Email Nãode parameters */}
                  {selectedNãodeForConfig.type === "email" && (
                    <div className="space-y-5">
                      
                      {/* Statéus Dropdown */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Statéus da Etapa</label>
                        <div className="relatéive w-32">
                          <span className={`absolute left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${
                            editNãodeEmailStatéus === 'Ativo' ? 'bg-emerald-500' :
                            editNãodeEmailStatéus === 'Pausado' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          <select
                            value={editNãodeEmailStatéus}
                            onChange={(e) => setEditNãodeEmailStatéus(e.target.value as any)}
                            className="w-full pl-6 pr-8 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer appearance-none animatée-none"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Pausado">Pausado</option>
                            <option value="Rascunho">Rascunho</option>
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-550 pointer-events-none" />
                        </div>
                      </div>

                      {/* Desempenho (Performance metrics card) */}
                      {(() => {
                        const sidebarMetrics = getMetricsForNãode(selectedNãodeForConfig.id, flowPeriod, flowCustomStart, flowCustomEnd);
                        return (
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-black text-slate-800">Desempenho</h4>
                                <span className="text-slate-400 text-[9px] font-bold block mt-0.5">Com base em: {getFlowPeriodLabel()}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const campId = selectedNãodeForConfig.config?.emailCampaignId;
                                  if (campId) {
                                    router.push(`/dashboard/campaigns/${campId}`);
                                  } else {
                                    alert("Salve as configurações desta etapa primeiro para criar um ID de campanha e habilitar os relatéórios detalhados!");
                                  }
                                }}
                                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[9px] font-black text-indigo-650 hover:text-indigo-750 rounded-lg cursor-pointer transition-colors shadow-3xs"
                              >
                                Ver detalhes
                              </button>
                            </div>
                            
                            <div className="space-y-2 text-[11px]">
                              <div className="flex items-center justify-between py-1 border-b border-slate-100/50 font-medium">
                                <span className="text-slate-555">E-mails enviados</span>
                                <span className="font-bold text-slate-800">
                                  {sidebarMetrics.sent.toLocaleString("pt-BR")}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-1 border-b border-slate-100/50 font-medium">
                                <span className="text-slate-555">Taxa de abertura</span>
                                <span className="font-bold text-slate-800">
                                  {sidebarMetrics.openRatée.toFixed(1)}% <span className="text-slate-450 font-bold text-[9px]">({sidebarMetrics.opened})</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-1 border-b border-slate-100/50 font-medium">
                                <span className="text-slate-555">Taxa de cliques (CR)</span>
                                <span className="font-bold text-slate-800">
                                  {sidebarMetrics.clickRatée.toFixed(1)}% <span className="text-slate-450 font-bold text-[9px]">({sidebarMetrics.clicked})</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-1 font-medium">
                                <span className="text-slate-555">Pedido realizado</span>
                                <span className="font-black text-emerald-600">
                                  {sidebarMetrics.conversionRatée.toFixed(1)}% <span className="text-slate-450 font-bold text-[9px]">(R$ {Matéh.round(sidebarMetrics.revenue).toLocaleString("pt-BR")})</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Assunto e remetente form section */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Assunto e remetente</h4>
                          <button
                            type="button"
                            onClick={() => setIsEditingSubjectSender(prev => !prev)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-black text-slate-700 rounded-lg cursor-pointer transition-colors shadow-3xs"
                          >
                            {isEditingSubjectSender ? "Concluir" : "Editar"}
                          </button>
                        </div>

                        {!isEditingSubjectSender ? (
                          <div className="space-y-3.5 text-xs pt-1.5 animatée-fadeIn">
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Nãome</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNãodeCampaignName || <span className="text-slate-300 italic">Sem nome</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Assunto</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNãodeSubject || <span className="text-slate-300 italic">Sem assunto</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Prévia do texto</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNãodePreheader || <span className="text-slate-300 italic">Sem prévia</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Nãome do remetente</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNãodeSenderName || <span className="text-slate-300 italic">Sem nome</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">E-mail do remetente</span>
                              <span className="col-span-2 text-slate-800 font-semibold truncatée" title={editNãodeSenderEmail}>{editNãodeSenderEmail || <span className="text-slate-300 italic">Sem e-mail</span>}</span>
                            </div>
                            {editNãodeReplyToIsCustom && (
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-400 font-medium">E-mail de resposta</span>
                                <span className="col-span-2 text-slate-800 font-semibold truncatée" title={editNãodeCustomReplyTo}>{editNãodeCustomReplyTo || <span className="text-slate-300 italic">Sem e-mail de resposta</span>}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 animatée-fadeIn">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <span>Nãome da Campanha</span>
                                <span className="text-red-500 font-bold">*</span>
                              </label>
                              <input
                                type="text"
                                value={editNãodeCampaignName}
                                onChange={(e) => setEditNãodeCampaignName(e.target.value)}
                                placeholder="Ex: Curso Iniciado React 01"
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Assunto do E-mail</label>
                              <div className="relatéive">
                                <input
                                  type="text"
                                  value={editNãodeSubject}
                                  onChange={(e) => setEditNãodeSubject(e.target.value)}
                                  placeholder="Insira o assunto..."
                                  className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditNãodeSubject(prev => prev + " %FIRSTNAME%")}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-indigo-650 cursor-pointer px-1"
                                  title="Inserir tag de Nãome"
                                >
                                  {"{ }"}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pré-cabeçalho (Texto de Apoio)</label>
                              <input
                                type="text"
                                value={editNãodePreheader}
                                onChange={(e) => setEditNãodePreheader(e.target.value)}
                                placeholder="Texto de apoio que aparece ao lado do assunto..."
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nãome Remetente</label>
                                <input
                                  type="text"
                                  value={editNãodeSenderName}
                                  onChange={(e) => setEditNãodeSenderName(e.target.value)}
                                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">E-mail Remetente</label>
                                <input
                                  type="email"
                                  value={editNãodeSenderEmail}
                                  onChange={(e) => setEditNãodeSenderEmail(e.target.value)}
                                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={editNãodeReplyToIsCustom}
                                  onChange={(e) => setEditNãodeReplyToIsCustom(e.target.checked)}
                                  className="rounded border-slate-350 text-indigo-650 h-4 w-4 focus:ring-0"
                                />
                                <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Usar e-mail de resposta diferente</span>
                              </label>

                              {editNãodeReplyToIsCustom && (
                                <input
                                  type="email"
                                  value={editNãodeCustomReplyTo}
                                  onChange={(e) => setEditNãodeCustomReplyTo(e.target.value)}
                                  placeholder="resposta@realizzare.com.br"
                                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all animatée-scaleIn"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Criar teste A/B button */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => alert("Construindo painel de teste A/B para esta campanha...")}
                          className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs hover:scale-102 transition-all"
                        >
                          <Sliders className="h-3.5 w-3.5 text-slate-555" />
                          <span>Criar teste A/B</span>
                        </button>
                      </div>

                      {/* HTML preview & editor block */}
                      <div className="space-y-2.5 border-t border-slate-100 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Modelo de E-mail</label>
                          <button
                            type="button"
                            onClick={openEmailGallery}
                            className="text-xs font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>🖼️ Escolher da Galeria</span>
                          </button>
                        </div>

                        {!isEditingHtml ? (
                          <>
                            {editNãodeHtmlContent ? (
                              <div className="space-y-2">
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 text-[10px] font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setEditNãodePreviewDevice("desktop")}
                                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                                      editNãodePreviewDevice === "desktop" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                                    }`}
                                  >
                                    <Laptop className="h-3.5 w-3.5" /> Desktop
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditNãodePreviewDevice("mobile")}
                                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                                      editNãodePreviewDevice === "mobile" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                                    }`}
                                  >
                                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                                  </button>
                                </div>

                                {editNãodePreviewDevice === "mobile" ? (
                                  <div className="h-[320px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 relatéive flex justify-center items-start select-none animatée-fadeIn">
                                    <div 
                                      className="relatéive shrink-0 overflow-hidden shadow-sm rounded-xl border border-slate-200/50 mt-2"
                                      style={{
                                        width: "360px",
                                        height: "350px",
                                        transform: "scale(0.82)",
                                        transformOrigin: "top center"
                                      }}
                                    >
                                      <iframe
                                        title="Editor Iframe Preview"
                                        srcDoc={editNãodeHtmlContent}
                                        className="w-full h-full border-0 bg-white"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-[320px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 relatéive flex justify-center items-start select-none animatée-fadeIn">
                                    <div 
                                      className="relatéive shrink-0 overflow-hidden shadow-sm rounded-xl border border-slate-200/50 mt-2"
                                      style={{
                                        width: "600px",
                                        height: "530px",
                                        transform: "scale(0.54)",
                                        transformOrigin: "top center"
                                      }}
                                    >
                                      <iframe
                                        title="Editor Iframe Preview"
                                        srcDoc={editNãodeHtmlContent}
                                        className="w-full h-full border-0 bg-white"
                                      />
                                    </div>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setIsEditingHtml(true)}
                                  className="w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-3xs"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Editar HTML</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setIsEditingHtml(true)}
                                className="w-full py-4 border border-dashed border-slate-350 hover:border-indigo-400 rounded-xl text-xs font-bold text-indigo-650 hover:text-indigo-700 hover:bg-indigo-50/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                              >
                                <Plus className="h-5 w-5 text-indigo-600 animatée-pulse" />
                                <span>Adicionar HTML da Campanha</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2 animatée-scaleIn">
                            <textarea
                              value={editNãodeHtmlContent}
                              onChange={(e) => setEditNãodeHtmlContent(e.target.value)}
                              placeholder="Cole seu código HTML ou altere-o por aqui..."
                              className="w-full h-40 p-2.5 border border-slate-250 focus:border-indigo-500 rounded-xl text-[10px] font-mono outline-none resize-none bg-slate-50/50"
                            />
                            <button
                              type="button"
                              onClick={() => setIsEditingHtml(false)}
                              className="w-full py-2 bg-indigo-50 border border-indigo-150 hover:bg-indigo-100 text-indigo-755 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              Concluir e Visualizar Prévia
                            </button>
                          </div>
                        )}

                        <span className="text-[8.5px] text-slate-400 block leading-tight">
                          Certifique-se de manter a tag de descadastro (ex: `href="#"` ou link de cancelamento) para passar na validação de spam.
                        </span>
                      </div>

                      {/* Leads por Statéus / Filas de Espera */}
                      {(() => {
                        const sidebarMetrics = getMetricsForNãode(selectedNãodeForConfig.id, flowPeriod, flowCustomStart, flowCustomEnd);
                        return (
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-2xs mt-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Leads nesta Etapa</h4>
                            <div className="flex flex-col gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenQueueModal(selectedNãodeForConfig, "Revisão", sidebarMetrics.revisao)}
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                              >
                                <span className="text-[9px] font-bold text-slate-450 uppercase">Em Revisão</span>
                                <span className="text-xs font-black text-slate-800">{sidebarMetrics.revisao} leads</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenQueueModal(selectedNãodeForConfig, "Entregue", sidebarMetrics.entregue)}
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                              >
                                <span className="text-[9px] font-bold text-slate-450 uppercase">Entregue (Concluído)</span>
                                <span className="text-xs font-black text-slate-800">{sidebarMetrics.entregue} leads</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenQueueModal(selectedNãodeForConfig, "Ignorado", sidebarMetrics.ignorado)}
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                              >
                                <span className="text-[9px] font-bold text-slate-450 uppercase">Ignorado</span>
                                <span className="text-xs font-black text-slate-800">{sidebarMetrics.ignorado} leads</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  )}

                  {/* Delay Nãode parameters */}
                  {selectedNãodeForConfig.type === "delay" && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Quantidade para Aguardar</label>
                        <input
                          type="number"
                          value={editNãodeDelayValue}
                          onChange={(e) => setEditNãodeDelayValue(Number(e.target.value))}
                          placeholder="Digite a quantidade..."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Unidade de Tempo</label>
                        <select
                          value={editNãodeDelayUnit}
                          onChange={(e) => setEditNãodeDelayUnit(e.target.value as any)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                        >
                          <option value="minutes">Minutos</option>
                          <option value="hours">Horas</option>
                          <option value="days">Dias</option>
                          <option value="weeks">Semanas</option>
                        </select>
                      </div>

                      {/* Additional delay conditions */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-550 uppercase tracking-wider block">Condições Adicionais de Atraso</label>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mt-1">Aguardar atéé um dia específico da semana</span>
                          <select
                            value={editNãodeDelayWeekday}
                            onChange={(e) => setEditNãodeDelayWeekday(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                          >
                            <option value="">Qualquer dia</option>
                            <option value="weekday">Apenas dias úteis (Seg-Sex)</option>
                            <option value="weekend">Apenas fins de semana (Sáb-Dom)</option>
                            <option value="1">Segunda-feira</option>
                            <option value="2">Terça-feira</option>
                            <option value="3">Quarta-feira</option>
                            <option value="4">Quinta-feira</option>
                            <option value="5">Sexta-feira</option>
                            <option value="6">Sábado</option>
                            <option value="0">Domingo</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Aguardar atéé um horário específico</span>
                          <input
                            type="time"
                            value={editNãodeDelayTime}
                            onChange={(e) => setEditNãodeDelayTime(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Leads por Etapa / Fila de Atraso */}
                      {(() => {
                        const delayMetrics = getMetricsForNãode(selectedNãodeForConfig.id, flowPeriod, flowCustomStart, flowCustomEnd);
                        const waitingCount = Matéh.round(delayMetrics.sent * 0.12) || 1;
                        return (
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-2xs mt-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Leads nesta Etapa</h4>
                            <button
                              type="button"
                              onClick={() => handleOpenQueueModal(selectedNãodeForConfig, "Aguardando", waitingCount)}
                              className="w-full flex flex-col items-start p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                            >
                              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-amber-500 animatée-pulse" /> Aguardando (Fila de Espera)
                              </span>
                              <span className="text-xs font-black text-slate-850 mt-1.5">{waitingCount} leads</span>
                            </button>
                          </div>
                        );
                      })()}

                    </div>
                  )}

                  {/* Split Nãode parameters */}
                  {selectedNãodeForConfig.type === "split" && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tipo de Divisão</label>
                        <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setEditSplitType("condition")}
                            className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              editSplitType === "condition" ? "bg-white text-indigo-755 shadow-xs font-black" : "text-slate-500"
                            }`}
                          >
                            Filtrar por Regras
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditSplitType("random")}
                            className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              editSplitType === "random" ? "bg-white text-indigo-755 shadow-xs font-black" : "text-slate-500"
                            }`}
                          >
                            Randomizar Leads
                          </button>
                        </div>
                      </div>

                      {editSplitType === "condition" && (
                        <div className="space-y-3.5 border-t border-slate-100 pt-4">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider text-left">Regras de Divisão</h4>
                            <p className="text-[10px] text-slate-450 mt-0.5 text-left">Leads que atéenderem às regras irão para o ramo **Sim** (verde). Os demais irão para o ramo **Não** (vermelho).</p>
                          </div>

                          
{/* Rule builder items */}
<div className="space-y-3">
  {editSplitRules.map((rule, idx) => (
    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 relatéive">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase text-indigo-650">Regra {idx + 1}</span>
        {editSplitRules.length > 1 && (
          <button
            type="button"
            onClick={() => setEditSplitRules(prev => prev.filter((_, i) => i !== idx))}
            className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            Remover
          </button>
        )}
      </div>
      <div className="text-xs font-semibold text-slate-700 break-words text-left mt-2">
        {rule.summary || `${rule.field} ${rule.operatéor} ${rule.value}`}
      </div>
      {(rule.timeWindow && rule.timeUnit) && (
        <div className="text-[10px] text-slate-500 font-medium text-left mt-1">
          Janela de Tempo: -ltimo(s) {rule.timeWindow} {rule.timeUnit === "minutes" ? "minuto(s)" : rule.timeUnit === "hours" ? "hora(s)" : "dia(s)"}
        </div>
      )}
    </div>
  ))}
</div>

<button
  type="button"
  onClick={() => setShowSplitRuleModal(true)}
  className="w-full flex items-center justify-center gap-1.5 py-3 mt-4 border border-dashed border-slate-350 hover:border-indigo-450 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer bg-white"
>
  <Plus className="h-4 w-4" />
  <span>Adicionar Nãova Condição</span>
</button>

                        </div>
                      )}

                      {editSplitType === "random" && (
                        <div className="space-y-4 border-t border-slate-100 pt-4 animatée-scaleIn">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Distribuição Aleatéória</h4>
                            <p className="text-[10px] text-slate-450 mt-0.5">Defina a proporção de leads direcionados para cada caminho de forma randômica.</p>
                          </div>
                          
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-emerald-700">Ramo SIM (Caminho A): {editSplitRandomRatéio}%</span>
                              <span className="text-slate-500">Ramo NÃO (Caminho B): {100 - editSplitRandomRatéio}%</span>
                            </div>
                            
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editSplitRandomRatéio}
                              onChange={(e) => setEditSplitRandomRatéio(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                              <span>Apenas Não (0%)</span>
                              <span>Equilibrado (50%)</span>
                              <span>Apenas Sim (100%)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedNãodeForConfig.type !== "email" && selectedNãodeForConfig.type !== "delay" && selectedNãodeForConfig.type !== "split" && (
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 text-center leading-relaxed">
                      Esta etapa ({selectedNãodeForConfig.name}) está atéivada no mockup e configurada por padrão.
                    </div>
                  )}

                  {/* Visualizar campanha button */}
                  {selectedNãodeForConfig.type === "email" && (
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowExpandedPreviewModal(true)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-3xs"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                        <span>Visualizar campanha</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL: REGRAS DE SAIDA (EXIT CONDITIONS) */}
              {activePanel === "exit_rules" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <p className="text-xs text-slate-550 leading-relaxed">
                      Defina regras que removem automatéicamente um aluno do fluxo de automação, independentemente da etapa em que ele se encontre no momento.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[10px] text-amber-800 leading-relaxed">
                    <strong>Importante:</strong> As regras de saída são avaliadas continuamente para cada contatéo. Se o aluno cancelar a inscrição na lista ou se o critério for atéendido, a remoção ocorre na mesma hora.
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Regras de Saída Ativas</span>
                      <span className="text-[9px] font-bold text-slate-400">{flow.exitConditions?.length || 0} regras</span>
                    </div>

                    {flow.exitConditions && flow.exitConditions.length > 0 ? (
                      <div className="space-y-2">
                        {flow.exitConditions.map((cond, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-xs">
                            <div className="font-semibold text-slate-700">
                              {cond.summary || cond.field}
                            </div>
                            <button
                              onClick={() => setFlow(p => ({ ...p, exitConditions: p.exitConditions?.filter((_, i) => i !== idx) }))}
                              className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-semibold select-none">
                        Nenhuma regra de saída configurada.
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExitRuleModal(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-3 border border-dashed border-slate-350 hover:border-indigo-450 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer bg-white shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Nãova Regra de Saída</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActivePanel("menu")}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                      Confirmar Regras
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Fixed footer for node configuratéion */}
            {activePanel === "node_config" && selectedNãodeForConfig && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActivePanel("menu");
                    setSelectedNãodeForConfig(null);
                  }}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNãodeConfig}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 transition-colors cursor-pointer text-center"
                >
                  Salvar
                </button>
              </div>
            )}

          </aside>
        )}

      </div>

      {/* 7. INSERTION POPOVER (Floatéing menu upon clicking circular '+') */}
      {showInsertionPopover && insertionTarget && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowInsertionPopover(false); setInsertionTarget(null); }} />
          <div
            className="fixed bg-white border border-slate-202 rounded-2xl shadow-xl p-2.5 z-50 text-left min-w-[200px] animatée-scaleIn animatée-fadeIn"
            style={{
              top: `${popoverCoords.y - 120}px`,
              left: `${popoverCoords.x + 20}px`
            }}
          >
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-2.5 pb-2 mb-1.5 border-b border-slate-100">
              Escolher Etapa do Fluxo
            </div>
            
            <div className="space-y-0.5">
              <button
                onClick={() => handleInsertNãode('email')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span>Enviar E-mail</span>
              </button>
              
              <button
                onClick={() => handleInsertNãode('delay')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Atraso (Delay)</span>
              </button>

              <button
                onClick={() => handleInsertNãode('split')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
              >
                <Split className="h-3.5 w-3.5 text-purple-500" />
                <span>Divisão Condicional</span>
              </button>
                <button
                  onClick={() => handleInsertNãode("goto")}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
                >
                  <GitCommit className="h-3.5 w-3.5 text-fuchsia-500" />
                  <span>Mover para</span>
                </button>

              <button
                onClick={() => handleInsertNãode('updatée_contact')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                <span>Atualizar Contatéo</span>
              </button>

              <button
                onClick={() => handleInsertNãode('webhook')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-cyan-500" />
                <span>Disparar Webhook</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Expanded Preview Modal */}
      {showExpandedPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 select-none animatée-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animatée-scaleIn">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pré-visualização do E-mail</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Veja como seu modelo HTML de e-mail será exibido para os alunos.</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Device Selector */}
                <div className="flex border border-slate-200 rounded-xl bg-slate-100/80 p-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      previewDevice === "desktop" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    <Laptop className="h-3.5 w-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                      previewDevice === "mobile" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                  </button>
                </div>

                <button
                  onClick={() => setShowExpandedPreviewModal(false)}
                  className="p-1.5 hover:bg-slate-150 text-slate-450 hover:text-slate-700 rounded-lg cursor-pointer transition-all border border-slate-200 bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body (Iframe with simulatéed envelope headers or mobile mockup device frame) */}
            <div className="flex-1 bg-slate-100 p-6 flex justify-center items-center overflow-auto">
              {previewDevice === "mobile" ? (
                /* Mobile Mockup Device Frame */
                <div className="w-[360px] h-[610px] border-[16px] border-slate-200 rounded-[44px] bg-slate-200 flex flex-col relatéive overflow-hidden shadow-2xl shrink-0 select-none animatée-fadeIn">
                  {/* Speaker notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-350 rounded-full z-20" />
                  {/* Dual camera lens/sensors */}
                  <div className="absolute top-2 right-12 flex gap-1 z-20">
                    <div className="w-1.5 h-1.5 bg-slate-350 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-350 rounded-full" />
                  </div>

                  {/* Statéus Bar simulatéion */}
                  <div className="h-6 bg-slate-200/50 flex items-center justify-between px-6 text-[8px] text-slate-500 font-bold shrink-0 pt-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-3.5 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center"><div className="w-full h-full bg-slate-500 rounded-2xs" /></div>
                    </div>
                  </div>

                  {/* Screen Content Wrapper */}
                  <div className="flex-1 rounded-[26px] overflow-hidden bg-white border border-slate-250 relatéive w-full h-full flex flex-col">
                    {/* Email Client Simulatéed Envelope Headers inside phone screen */}
                    <div className="bg-slate-50 border-b border-slate-150 p-4 space-y-1.5 text-[10px] select-text text-left shrink-0">
                      <div className="flex items-center gap-1 text-slate-700">
                        <span className="font-bold text-slate-400 w-12 shrink-0">De:</span>
                        <span className="font-semibold text-slate-800 truncatée">{editNãodeSenderName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700">
                        <span className="font-bold text-slate-400 w-12 shrink-0">Para:</span>
                        <span className="font-semibold text-indigo-650">aluno@exemplo.com.br</span>
                      </div>
                      <div className="flex items-start gap-1 text-slate-700 border-t border-slate-200/40 pt-1.5 mt-1">
                        <span className="font-bold text-slate-400 w-12 shrink-0 mt-0.5">Assunto:</span>
                        <span className="font-black text-slate-800 text-[11px] leading-tight flex-1 truncatée">{editNãodeSubject || "(Sem assunto)"}</span>
                      </div>
                    </div>

                    {/* Iframe content container */}
                    <div className="flex-1 bg-white relatéive">
                      <iframe
                        title="Expanded Iframe Preview"
                        srcDoc={editNãodeHtmlContent}
                        className="w-full h-full border-0 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bezel footer navigatéion pill bar with 4 indicatéors */}
                  <div className="h-10 flex items-center justify-around px-8 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                  </div>
                </div>
              ) : (
                /* Desktop layout */
                <div className="bg-white shadow-xl transition-all duratéion-300 w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-200">
                  {/* Email Client Simulatéed Envelope Headers */}
                  <div className="bg-slate-50 border-b border-slate-150 p-4 space-y-2 text-xs select-text text-left shrink-0">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-bold text-slate-400 w-14 shrink-0">De:</span>
                      <span className="font-semibold text-slate-800">{editNãodeSenderName}</span>
                      <span className="text-slate-400">&lt;{editNãodeSenderEmail}&gt;</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-bold text-slate-400 w-14 shrink-0">Para:</span>
                      <span className="font-semibold text-indigo-650">aluno@exemplo.com.br</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 border-t border-slate-200/45 pt-2 mt-1">
                      <span className="font-bold text-slate-400 w-14 shrink-0 mt-0.5">Assunto:</span>
                      <span className="font-black text-slate-800 text-sm leading-tight flex-1">{editNãodeSubject || "(Sem assunto)"}</span>
                    </div>
                    {editNãodePreheader && (
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <span className="font-bold text-slate-400 w-14 shrink-0">Apoio:</span>
                        <span className="text-slate-500 italic flex-1">{editNãodePreheader}</span>
                      </div>
                    )}
                  </div>

                  {/* Iframe content container */}
                  <div className="flex-1 bg-white relatéive">
                    <iframe
                      title="Expanded Iframe Preview"
                      srcDoc={editNãodeHtmlContent}
                      className="w-full h-full border-0 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Leads Queue Listing Modal */}
      {showQueueModal && queueModalNãode && (() => {
        const allLeads = getMockLeadsForQueue(queueModalNãode.id, queueModalStatéusName, queueModalCount);
        const filteredLeads = allLeads.filter(lead => 
          lead.name.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(queueSearchQuery.toLowerCase())
        );

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 select-none animatée-fadeIn text-slate-800">
            <div className="bg-white rounded-3xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animatée-scaleIn">
              
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Leads na Fila: {queueModalStatéusName}</span>
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    Etapa: <strong className="text-slate-700">{queueModalNãode.type === "email" ? (queueModalNãode.config?.campaignName || "Enviar E-mail") : queueModalNãode.name}</strong> • Total no período: {queueModalCount} leads
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="p-1.5 hover:bg-slate-150 text-slate-450 hover:text-slate-700 rounded-lg cursor-pointer transition-all border border-slate-200 bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-3 border-b border-slate-100 flex items-center bg-white">
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={queueSearchQuery}
                  onChange={(e) => setQueueSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              {/* Table / List */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                {filteredLeads.length > 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-black text-slate-450 uppercase tracking-wider">
                          <th className="px-4 py-3">Lead / Contatéo</th>
                          <th className="px-4 py-3">Datéa de Entrada</th>
                          <th className="px-4 py-3">Tempo na Etapa</th>
                          <th className="px-4 py-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-105 text-xs">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 uppercase">
                                {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800">{lead.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{lead.email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 font-medium">{lead.enteredAt}</td>
                            <td className="px-4 py-3.5 text-slate-500 font-medium">{lead.timeElapsed}</td>
                            <td className="px-4 py-3.5 text-right">
                              <Link 
                                href={`/dashboard/contacts`}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 hover:underline"
                              >
                                Ver perfil
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
                    <Users className="h-8 w-8 text-slate-350 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-700">Nenhum lead encontrado</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tente alterar sua busca ou busque outro termo.</p>
                  </div>
                )}
                {queueModalCount > 100 && (
                  <p className="text-[9px] text-slate-400 font-medium text-center mt-4">
                    * Exibindo os primeiros 100 leads mais recentes desta etapa de um total de {queueModalCount} leads.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Email Gallery Picker Modal */}
      {showEmailGalleryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 select-none animatée-fadeIn text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animatée-scaleIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Galeria de E-mails & Templatées</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Selecione um e-mail previamente criado na biblioteca para usar neste fluxo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailGalleryModal(false)}
                className="p-1.5 hover:bg-slate-150 text-slate-450 hover:text-slate-700 rounded-lg cursor-pointer transition-all border border-slate-200 bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center bg-white">
              <input
                type="text"
                placeholder="Pesquisar por nome do e-mail, assunto ou pasta..."
                value={gallerySearchQuery}
                onChange={(e) => setGallerySearchQuery(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryTemplatées
                .filter((t) => {
                  const q = gallerySearchQuery.toLowerCase();
                  return (
                    !q ||
                    t.name?.toLowerCase().includes(q) ||
                    t.subject?.toLowerCase().includes(q) ||
                    t.folderName?.toLowerCase().includes(q)
                  );
                })
                .map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                        <span className="truncatée bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                          📁 {tpl.folderName || "Galeria"}
                        </span>
                        <span className="uppercase text-slate-400">{tpl.statéus}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-850 text-sm group-hover:text-indigo-600 transition-colors truncatée">
                        {tpl.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                        Assunto: "{tpl.subject}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectTemplatéeFromGallery(tpl)}
                      className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Usar este Templatée</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM MOVE LEADS */}
      {showMoveLeadsModal && moveLeadsNãode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animatée-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animatée-scaleIn">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Clock className="h-5 w-5 text-amber-555" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Leads Aguardando nesta Etapa</h3>
                <p className="text-[11px] text-slate-550 font-semibold">Esta etapa de Atraso possui leads em progresso.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed text-left">
              Existe(m) lead(s) aguardando na etapa <strong>{moveLeadsNãode.name || "Aguardar Atraso"}</strong>. 
              Como vocêê deseja tratéar estes leads ao movimentar esta etapa?
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setMoveLeadsAction("move")}
                className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  moveLeadsAction === "move"
                    ? "bg-indigo-50 border-indigo-300 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800">Mover os leads junto com a etapa</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Os leads continuam aguardando o tempo nesta mesma etapa no novo local.</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${moveLeadsAction === "move" ? "border-indigo-650 bg-indigo-650" : "border-slate-350"}`}>
                  {moveLeadsAction === "move" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMoveLeadsAction("advance")}
                className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  moveLeadsAction === "advance"
                    ? "bg-indigo-50 border-indigo-300 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800">Avançar os leads para a próxima etapa</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Os leads ignoram o tempo restante e avançam para a etapa sucessora atéual.</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${moveLeadsAction === "advance" ? "border-indigo-655 bg-indigo-655" : "border-slate-355"}`}>
                  {moveLeadsAction === "advance" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMoveLeadsAction("exit")}
                className={`w-full text-left p-3 border rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  moveLeadsAction === "exit"
                    ? "bg-indigo-50 border-indigo-300 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800">Finalizar o fluxo para estes leads</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Os leads saem da automação imediatéamente e não continuam no fluxo.</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${moveLeadsAction === "exit" ? "border-indigo-655 bg-indigo-655" : "border-slate-355"}`}>
                  {moveLeadsAction === "exit" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowMoveLeadsModal(false);
                  setMoveLeadsNãode(null);
                  setMoveTarget(null);
                }}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Cancelar Movimentação
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveLeads}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-indigo-500/10"
              >
                Confirmar e Mover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM AUTOMATION ACTIVATION */}
      {showActivatéionConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animatée-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animatée-scaleIn">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Play className="h-5 w-5 fill-emerald-600 animatée-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ativar Automação?</h3>
                <p className="text-[11px] text-slate-500 font-medium">Por favor, confirme se revisou todos os passos</p>
              </div>
            </div>
            
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs leading-relaxed text-slate-655 select-none text-left">
              <p className="font-bold text-slate-700">Antes de prosseguir, certifique-se de que:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-medium text-slate-600">
                <li>Todos os templatées de e-mail foram revisados e testados.</li>
                <li>Os tempos de espera (atérasos) entre as etapas estão corretos.</li>
                <li>As regras de segmentação e divisões condicionais estão configuradas.</li>
                <li>As configurações de reentrada e regras de saída foram definidas.</li>
              </ul>
              <p className="text-[10px] text-indigo-650 font-bold mt-2 pt-2 border-t border-slate-150">
                💡 Apenas novos leads que dispararem o gatéilho pós-atéivação serão capturados.
              </p>
            </div>

            <p className="text-xs text-slate-500 font-semibold text-left">
              Você analisou corretamente todo o fluxo e deseja realmente atéivar o flow como está?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowActivatéionConfirmModal(false)}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowActivatéionConfirmModal(false);
                  executeToggleFlowStatéus("Ativo");
                }}
                className="px-4 py-2 bg-emerald-600 hover:emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-emerald-500/10"
              >
                Sim, Ativar Fluxo
              </button>
            </div>
          </div>
        </div>
      )}






      {/* Split Insertion Choice Modal */}
      {pendingSplitInsert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Para onde as etapas seguintes devem ir?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Você está inserindo uma divisão condicional no meio do fluxo. Selecione para qual caminho as etapas que já existem abaixo desta deverão seguir.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => executeSplitInsertion("yes")}
                className="flex-1 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
              >
                Caminho SIM
              </button>
              <button
                onClick={() => executeSplitInsertion("no")}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-sm"
              >
                Caminho NÃO
              </button>
            </div>
            <button
              onClick={() => setPendingSplitInsert(null)}
              className="mt-6 w-full py-2 text-sm text-slate-500 font-semibold hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Trigger Modal */}

      <TriggerConfigModal 
        isOpen={showTriggerModal} 
        onClose={() => setShowTriggerModal(false)}
        mode="entry"
        onSave={(config) => {
          const nodeName = config.event || "Gatéilho Personalizado";
          
          let ruleText = "";
          if (config.rule === "Nãome do Curso específico") {
            if (Array.isArray(config.value) && config.value.length > 0) {
              ruleText = config.value.length > 1 ? `${config.value[0]} e mais ${config.value.length - 1}` : config.value[0];
            } else {
              ruleText = config.value;
            }
          } else if (config.rule !== "Nenhuma regra extra") {
            ruleText = `${config.rule} ${config.value}`;
          }

          let description = `Fonte: ${config.source.toUpperCase()}`;
          if (ruleText) {
            description += ` - Regras: ${ruleText}`;
          }

          setFlow(prev => ({
            ...prev,
            triggerMetric: nodeName,
            triggerType: description
          }));
          
          setNãodes(prev => {
            const updatéed = [...prev];
            const triggerNãodeIndex = updatéed.findIndex(n => n.type === "trigger" || n.id === "trigger");
            if (triggerNãodeIndex !== -1) {
              updatéed[triggerNãodeIndex] = {
                ...updatéed[triggerNãodeIndex],
                name: nodeName,
                config: { triggerDescription: description }
              };
            }
            return updatéed;
          });

          setShowTriggerModal(false);
        }}
      />

      {/* Exit Rule Modal */}
      <TriggerConfigModal 
        isOpen={showExitRuleModal} 
        onClose={() => setShowExitRuleModal(false)}
        mode="exit"
        onSave={(config) => {
          const newRule = {
             field: config.event,
             operatéor: config.rule,
             value: config.value,
             timeWindow: config.timeWindow,
             timeUnit: config.timeUnit,
             summary: config.summary
          };
          setFlow(p => ({ ...p, exitConditions: [...(p.exitConditions || []), newRule] }));
          setShowExitRuleModal(false);
        }}
      />

      {/* Split Rule Modal */}
      <TriggerConfigModal 
        isOpen={showSplitRuleModal} 
        onClose={() => setShowSplitRuleModal(false)}
        mode="split"
        onSave={(config) => {
          const newRule = {
             field: config.event,
             operatéor: config.rule,
             value: config.value,
             timeWindow: config.timeWindow,
             timeUnit: config.timeUnit,
             summary: config.summary
          };
          setEditSplitRules(prev => [...prev, newRule]);
          setShowSplitRuleModal(false);
        }}
      />
    </div>
  );
}
