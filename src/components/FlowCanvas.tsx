"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import TriggerConfigModal from "@/components/TriggerConfigModal";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  Users, UserPlus,
  Database,
  ExternalLink,
  BookOpen,
  DollarSign,
  MoreHorizontal,
  FileText, Folder,
  Check
} from "lucide-react";

interface FlowNode {
  id: string;
  type: 'trigger' | 'email' | 'sms' | 'whatsapp' | 'delay' | 'split' | 'goto' | 'update_contact' | 'update_list' | 'internal_alert' | 'webhook' | 'end';
  name?: string;
  config?: any;
  yesBranch?: FlowNode[];
  noBranch?: FlowNode[];
}

interface FlowConfig {
  id: string;
  name: string;
  status: "Ativo" | "Pausado" | "Rascunho";
  type: "Automação" | "Transacional";
  updatedAt?: string;
  triggerType?: string;
  triggerMetric?: string;
  triggerReentryMode?: "no_reentry" | "allow_reentry" | "reentry_after_period";
  reentryPeriodValue?: number;
  reentryPeriodUnit?: "minutes" | "hours" | "days" | "weeks";
  triggerFilters?: any[];
  profileFilters?: any[];
  exitConditions?: any[];
}

const getPeriodDates = (preset: string, customStart?: string, customEnd?: string) => {
  const anchor = new Date("2026-07-19");
  let start = new Date(anchor);
  let end = new Date(anchor);

  switch (preset) {
    case "today":
      break;
    case "yesterday":
      start.setDate(anchor.getDate() - 1);
      end.setDate(anchor.getDate() - 1);
      break;
    case "week": {
      const day = anchor.getDay();
      const diff = anchor.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      break;
    }
    case "7days":
      start.setDate(anchor.getDate() - 7);
      break;
    case "last_week":
      start.setDate(anchor.getDate() - 13);
      end.setDate(anchor.getDate() - 7);
      break;
    case "month":
      start.setDate(1);
      break;
    case "30days":
      start.setDate(anchor.getDate() - 30);
      break;
    case "last_month":
      start.setMonth(anchor.getMonth() - 1, 1);
      const lastDayOfPrevMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 0);
      end = lastDayOfPrevMonth;
      break;
    case "90days":
      start.setDate(anchor.getDate() - 90);
      break;
    case "365days":
      start.setDate(anchor.getDate() - 365);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
    case "last_year":
      start.setFullYear(anchor.getFullYear() - 1, 0, 1);
      end.setFullYear(anchor.getFullYear() - 1, 11, 31);
      break;
    case "custom":
      if (customStart) start = new Date(customStart);
      if (customEnd) end = new Date(customEnd);
      break;
  }
  return { start, end };
};

const getDaysBetween = (start: Date, end: Date) => {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getMetricsForNode = (nodeId: string, nodeMetricsData: Record<string, any>, preset: string, customStart?: string, customEnd?: string) => {
    const defaultMetrics = {
      sent: 0, opened: 0, clicked: 0, conversions: 0,
      openRate: 0, clickRate: 0, conversionRate: 0, revenue: 0,
      espera: 0, revisao: 0, entregue: 0, ignorado: 0
    };
    return nodeMetricsData[nodeId] || defaultMetrics;
  };

  

export default function FlowCanvas({ editId }: { editId: string | null }) {
  const router = useRouter();

  // 1. Flow Configuration State
  const [flow, setFlow] = useState<FlowConfig>({
    id: editId || `flow-${Date.now()}`,
    name: editId ? "Carregando..." : `Fluxo - ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`,
    status: "Rascunho",
    type: "Automação",
    triggerReentryMode: "no_reentry",
    reentryPeriodValue: 7,
    reentryPeriodUnit: "days",
    triggerFilters: [],
    profileFilters: [],
    exitConditions: []
  });

  // 2. Nodes list state (recursive layout tree representation)
  // Initiated with the default single disparador setup
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: "trigger",
      type: "trigger",
      name: "Disparador",
      config: null
    }
  ]);

  // Canvas Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // UI Panels states
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [pendingSplitInsert, setPendingSplitInsert] = useState<{ parentId: string, branch?: "yes" | "no" | "yes_start" | "no_start", type?: "split" } | null>(null);
  const [selectingGotoTarget, setSelectingGotoTarget] = useState<{ parentId: string, branch?: "yes" | "no" | "yes_start" | "no_start" } | null>(null);
  const [showExitRuleModal, setShowExitRuleModal] = useState(false);
  const [showSplitRuleModal, setShowSplitRuleModal] = useState(false);
  const [activePanel, setActivePanel] = useState<"menu" | "trigger_select" | "trigger_config" | "node_config" | "exit_rules" | null>("menu");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<FlowNode | null>(null);
  const [activeNodeOptionsDropdownId, setActiveNodeOptionsDropdownId] = useState<string | null>(null);
  const [activeNodeStatusDropdownId, setActiveNodeStatusDropdownId] = useState<string | null>(null);

  // States for dragging and moving nodes
  const [showMoveLeadsModal, setShowMoveLeadsModal] = useState(false);
  const [moveLeadsNode, setMoveLeadsNode] = useState<FlowNode | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ sourceId: string; targetParentId: string; targetBranch: 'yes' | 'no' | 'yes_start' | 'no_start' | undefined } | null>(null);
  const [moveLeadsAction, setMoveLeadsAction] = useState<"move" | "exit" | "advance">("move");

  // State for split rules builder
  const [editSplitRules, setEditSplitRules] = useState<Array<{ field: string; operator: string; value: any; timeWindow?: number | null; timeUnit?: string; summary?: string }>>([]);

  // Temp state for editing Node configs
  const [editNodeName, setEditNodeName] = useState("");
  const [editNodeCampaignName, setEditNodeCampaignName] = useState("");
  const [editNodeSubject, setEditNodeSubject] = useState("");
  const [editNodePreheader, setEditNodePreheader] = useState("");
  const [editNodeSenderName, setEditNodeSenderName] = useState("Realizzare Cursos");
  const [editNodeSenderEmail, setEditNodeSenderEmail] = useState("contato@realizzare.com.br");
  const [editNodeReplyToEmail, setEditNodeReplyToEmail] = useState("suporte@realizzare.com.br");
  const [editNodeReplyToIsCustom, setEditNodeReplyToIsCustom] = useState(false);
  const [editNodeCustomReplyTo, setEditNodeCustomReplyTo] = useState("");
  const [editNodeHtmlContent, setEditNodeHtmlContent] = useState("");
  const [editNodeDelayValue, setEditNodeDelayValue] = useState(2);
  const [editNodeDelayUnit, setEditNodeDelayUnit] = useState<"minutes" | "hours" | "days" | "weeks">("days");
  const [editNodeDelayWeekday, setEditNodeDelayWeekday] = useState("");
  const [editNodeDelayTime, setEditNodeDelayTime] = useState("");
  const [editNodePreviewDevice, setEditNodePreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isEditingSubjectSender, setIsEditingSubjectSender] = useState(false);

  // Condition builder temp states
  const [triggerTab, setTriggerTab] = useState<"recommendations" | "metrics" | "all">("recommendations");
  const [showExitRulesModal, setShowExitRulesModal] = useState(false);

  // New features states
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [showExpandedPreviewModal, setShowExpandedPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [editNodeEmailStatus, setEditNodeEmailStatus] = useState<'Ativo' | 'Pausado' | 'Rascunho'>('Ativo');
  const [showMetadataMenu, setShowMetadataMenu] = useState(false);
  const [showActivationConfirmModal, setShowActivationConfirmModal] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [nodeMetricsData, setNodeMetricsData] = useState<Record<string, any>>({});
  const [manualContacts, setManualContacts] = useState<any[]>([]);
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [isAddingLead, setIsAddingLead] = useState(false);
  
  const handleLoadContacts = async (query = "") => {
      const supabase = createClient();
      let req = supabase.from("contacts").select("id, email, first_name").order("created_at", { ascending: false }).limit(50);
      if (query) {
        req = req.or("email.ilike.%" + query + "%,first_name.ilike.%" + query + "%");
      }
      const { data } = await req;
      if (data) setManualContacts(data);
    };
    
    useEffect(() => {
      if (showManualAddModal) {
        const timeoutId = setTimeout(() => {
          handleLoadContacts(manualSearchQuery);
        }, 400);
        return () => clearTimeout(timeoutId);
      }
    }, [manualSearchQuery, showManualAddModal]);
  
  useEffect(() => {
    if (editId) {
      fetch("/api/flows/metrics?flowId=" + editId)
        .then(res => res.json())
        .then(data => {
          if (data.metrics) setNodeMetricsData(data.metrics);
        })
        .catch(console.error);
    }
  }, [editId]);

  useEffect(() => {
    // replaced
  }, [showManualAddModal]);
  
  const handleAddLeadToFlow = async (contactId: string) => {
    setIsAddingLead(true);
    try {
      const res = await fetch("/api/flows/add-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowId: editId, contactId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Lead adicionado ao fluxo com sucesso!");
      setShowManualAddModal(false);
    } catch (e: any) {
      alert("Erro ao adicionar lead: " + e.message);
    } finally {
      setIsAddingLead(false);
    }
  };
  
  // HTML editing state
  const [isEditingHtml, setIsEditingHtml] = useState(false);

  // Flow Date Picker states (defaults to Últimos 7 dias)
  const [flowPeriod, setFlowPeriod] = useState<string>("7days");
  const [flowCustomStart, setFlowCustomStart] = useState<string>("2026-07-12");
  const [flowCustomEnd, setFlowCustomEnd] = useState<string>("2026-07-19");
  const [showFlowDatePicker, setShowFlowDatePicker] = useState<boolean>(false);
  const [tempFlowPeriod, setTempFlowPeriod] = useState<string>("7days");
  const [tempFlowCustomStart, setTempFlowCustomStart] = useState<string>("2026-07-12");
  const [tempFlowCustomEnd, setTempFlowCustomEnd] = useState<string>("2026-07-19");

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

  // Split conditions state
  const [editSplitType, setEditSplitType] = useState<"condition" | "random">("condition");
  const [editSplitRandomRatio, setEditSplitRandomRatio] = useState<number>(50);

  // Node insertion popup state
  const [insertionTarget, setInsertionTarget] = useState<{ parentId: string; branch?: 'yes' | 'no' | 'yes_start' | 'no_start' } | null>(null);

  // Leads Queue Modal state
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueModalNode, setQueueModalNode] = useState<FlowNode | null>(null);
  const [queueModalStatusName, setQueueModalStatusName] = useState<string>("");
  const [queueModalCount, setQueueModalCount] = useState<number>(0);
  const [queueSearchQuery, setQueueSearchQuery] = useState<string>("");
  const [queueLeads, setQueueLeads] = useState<any[]>([]);

  // Email Gallery Modal state
  const [showEmailGalleryModal, setShowEmailGalleryModal] = useState(false);
  const [gallerySearchQuery, setGallerySearchQuery] = useState("");
  const [galleryTemplates, setGalleryTemplates] = useState<any[]>([]);
    const [galleryExpandedFolders, setGalleryExpandedFolders] = useState<Record<string, boolean>>({});

  const openEmailGallery = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("realizzare_email_templates");
      if (stored) {
        try {
          setGalleryTemplates(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
    setShowEmailGalleryModal(true);
  };

  const handleSelectTemplateFromGallery = (tpl: any) => {
    setEditNodeCampaignName(tpl.name || "");
    setEditNodeSubject(tpl.subject || "");
    setEditNodePreheader(tpl.previewText || "");
    setEditNodeHtmlContent(tpl.htmlContent || "");
    setEditNodeEmailStatus("Ativo");

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("realizzare_email_templates");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updated = list.map((item: any) => {
            if (item.id === tpl.id) {
              return {
                ...item,
                status: "Ativo",
                flowId: flow.id,
                flowName: flow.name || "Automação"
              };
            }
            return item;
          });
          localStorage.setItem("realizzare_email_templates", JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    }

    setShowEmailGalleryModal(false);
  };

  const handleOpenQueueModal = (node: FlowNode, statusName: string, count: number) => {
    setQueueModalNode(node);
    setQueueModalStatusName(statusName);
    setQueueModalCount(count);
    setQueueSearchQuery("");
    setShowQueueModal(true);
  };
  const [showInsertionPopover, setShowInsertionPopover] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState({ x: 0, y: 0 });

  // Inline rename header trigger
  const [isRenamingHeader, setIsRenamingHeader] = useState(false);
  const [headerRenameValue, setHeaderRenameValue] = useState("");

  // Load from Storage if editing
  useEffect(() => {
    if (typeof window !== "undefined" && editId) {
      const loadData = async () => {
        try {
          const supabase = createClient();
          const { data: found, error } = await supabase.from("flows").select("*").eq("id", editId).single();
          if (found && !error) {
            setFlow({
              id: found.id,
              name: found.name,
              status: found.status === "active" ? "Ativo" : (found.status === "paused" ? "Pausado" : "Rascunho"),
              type: found.flow_type === "automation" ? "Automação" : "Transacional",
              updatedAt: new Date(found.updated_at).toLocaleString(),
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
            const { data: nodesData, error: nodesError } = await supabase.from("flow_nodes")
                .select("*")
                .eq("flow_id", editId)
                .eq("is_deleted", false);
                
            if (nodesData && !nodesError && nodesData.length > 0) {
               const resolveSequence = (parentId: string | null, branchLabel: string | null): FlowNode[] => {
                  const sequence: FlowNode[] = [];
                  let current = nodesData.find((n: any) => n.parent_node_id === parentId && n.branch_label === branchLabel);
                  
                  while(current) {
                    const node: FlowNode = {
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
                    current = nodesData.find((n: any) => n.parent_node_id === current.id && !n.branch_label);
                  }
                  
                  return sequence;
               };
               
               const tree = resolveSequence(null, null);
               setNodes(tree);
            } else {
               if (found.trigger_type && found.trigger_type !== "Disparador não configurado") {
                 setNodes([
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
        } catch (e) {
          console.error(e);
        }
      };
      loadData();
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
      ? Math.min(zoom + zoomFactor, 2.5)
      : Math.max(zoom - zoomFactor, 0.4);

    setPan(prevPan => {
      const ratio = nextZoom / zoom;
      return {
        x: centerX - (centerX - prevPan.x) * ratio,
        y: centerY - (centerY - prevPan.y) * ratio
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
        const nextZoom = Math.min(Math.max(prev + direction * zoomFactor, 0.4), 2.5);
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        setPan(prevPan => {
          const ratio = nextZoom / prev;
          return {
            x: mouseX - (mouseX - prevPan.x) * ratio,
            y: mouseY - (mouseY - prevPan.y) * ratio
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
  const insertNodeDirectly = (parentId: string, branch: "yes" | "no" | "yes_start" | "no_start" | undefined, type: FlowNode["type"]) => {
    // If inserting a goto, we don't insert immediately, we enter selection mode
    if (type === "goto") {
      setSelectingGotoTarget({ parentId, branch });
      setShowInsertionPopover(false);
      setInsertionTarget(null);
      return;
    }

    const checkHasDownstream = (tree: FlowNode[], targetId: string): boolean => {
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

    const countEmailNodes = (tree: FlowNode[]): number => {
      let count = 0;
      for (const node of tree) {
        if (node.type === "email") count++;
        if (node.yesBranch) count += countEmailNodes(node.yesBranch);
        if (node.noBranch) count += countEmailNodes(node.noBranch);
      }
      return count;
    };
    
    const emailIndex = countEmailNodes(nodes) + 1;
    const emailName = `E-mail ${String(emailIndex).padStart(2, "0")}`;

    const newNode: FlowNode = {
      id: crypto.randomUUID(),
      type,
      name: type === "email" ? emailName :
            type === "delay" ? "Aguardar Atraso" :
            type === "split" ? "Divisão Condicional" :
            
            type === "sms" ? "Enviar SMS" :
            type === "whatsapp" ? "Mensagem WhatsApp" :
            type === "update_contact" ? "Atualizar Campo de Contato" :
            type === "update_list" ? "Inscrever/Remover de Lista" :
            type === "internal_alert" ? "Alerta Interno por E-mail" :
            type === "webhook" ? "Disparar Webhook" : "Ação",
      config: type === "email" ? {
        campaignName: emailName,
        subject: "Oláá, %FIRSTNAME%!",
        preheader: "Temos novidades interessantes para vocêê.",
        senderName: "Realizzare Cursos",
        senderEmail: "contato@realizzare.com.br",
        replyTo: "suporte@realizzare.com.br",
        status: "Rascunho",
        htmlContent: "<div><p>Oláá, %FIRSTNAME%!</p></div>"
      } : type === "delay" ? {
        value: 1,
        unit: "hours"
      } : type === "split" ? {
        splitRules: []
      } : {}
    };

    if (type === "split") {
      newNode.yesBranch = [];
      newNode.noBranch = [];
    }

    const insertIntoTree = (tree: FlowNode[]): FlowNode[] => {
      return tree.map(node => {
        if (node.id === parentId) {
          if (branch === "yes") {
            return { ...node, yesBranch: [...(node.yesBranch || []), newNode] };
          } else if (branch === "yes_start") {
            return { ...node, yesBranch: [newNode, ...(node.yesBranch || [])] };
          } else if (branch === "no") {
            return { ...node, noBranch: [...(node.noBranch || []), newNode] };
          } else if (branch === "no_start") {
            return { ...node, noBranch: [newNode, ...(node.noBranch || [])] };
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

    const insertInFlatChain = (chain: FlowNode[]): FlowNode[] => {
      const idx = chain.findIndex(n => n.id === parentId);
      if (idx !== -1 && !branch) {
        const copy = [...chain];
        copy.splice(idx + 1, 0, newNode);
        return copy;
      }
      return chain.map(node => {
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? insertInFlatChain(node.yesBranch) : [],
            noBranch: node.noBranch ? insertInFlatChain(node.noBranch) : []
          };
        }
        return node;
      });
    };

    if (branch) {
      setNodes(insertIntoTree(nodes));
    } else {
      setNodes(insertInFlatChain(nodes));
    }
    setShowInsertionPopover(false);
      setInsertionTarget(null);
  };

  const executeGotoInsertion = (targetId: string) => {
    if (!selectingGotoTarget) return;
    const { parentId, branch } = selectingGotoTarget;

    const newNode: FlowNode = {
      id: crypto.randomUUID(),
      type: "goto",
      name: "Mover para",
      config: { targetId }
    };

    const insertIntoTree = (tree: FlowNode[]): FlowNode[] => {
      return tree.map(node => {
        if (node.id === parentId) {
          if (branch === "yes") {
            return { ...node, yesBranch: [...(node.yesBranch || []), newNode] };
          } else if (branch === "yes_start") {
            return { ...node, yesBranch: [newNode, ...(node.yesBranch || [])] };
          } else if (branch === "no") {
            return { ...node, noBranch: [...(node.noBranch || []), newNode] };
          } else if (branch === "no_start") {
            return { ...node, noBranch: [newNode, ...(node.noBranch || [])] };
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

    const insertInFlatChain = (chain: FlowNode[]): FlowNode[] => {
      const idx = chain.findIndex(n => n.id === parentId);
      if (idx !== -1 && !branch) {
        const copy = [...chain];
        copy.splice(idx + 1, 0, newNode);
        return copy;
      }
      return chain.map(node => {
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? insertInFlatChain(node.yesBranch) : [],
            noBranch: node.noBranch ? insertInFlatChain(node.noBranch) : []
          };
        }
        return node;
      });
    };

    if (branch) {
      setNodes(insertIntoTree(nodes));
    } else {
      setNodes(insertInFlatChain(nodes));
    }
    setSelectingGotoTarget(null);
  };

  const executeSplitInsertion = (choice: "yes" | "no") => {
    if (!pendingSplitInsert) return;
    const { parentId, branch } = pendingSplitInsert;

    const newNode: FlowNode = {
      id: crypto.randomUUID(),
      type: "split",
      name: "Divisão Condicional",
      config: { splitRules: [] },
      yesBranch: [],
      noBranch: []
    };

    let extracted = [];
    const extractAndInsert = (tree: FlowNode[]): FlowNode[] => {
      const idx = tree.findIndex(n => n.id === parentId);
      if (idx !== -1 && !branch) {
        extracted = tree.slice(idx + 1);
        if (choice === "yes") {
           newNode.yesBranch = extracted;
        } else {
           newNode.noBranch = extracted;
        }
        const copy = tree.slice(0, idx + 1);
        copy.push(newNode);
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

    setNodes(extractAndInsert(nodes));
    setPendingSplitInsert(null);
  };

  const handleAddNodeDirectly = (type: FlowNode["type"]) => {
    const lastNode = nodes[nodes.length - 1];
    if (lastNode) {
      insertNodeDirectly(lastNode.id, undefined, type);
    }
  };

  // Node insertion helper
  const openInsertionMenu = (parentId: string, branch?: 'yes' | 'no' | 'yes_start' | 'no_start', e?: React.MouseEvent) => {
    setInsertionTarget({ parentId, branch });
    if (e) {
      setPopoverCoords({ x: e.clientX, y: e.clientY });
    }
    setShowInsertionPopover(true);
  };

  const handleInsertNode = (type: FlowNode['type']) => {
    if (!insertionTarget) return;
    insertNodeDirectly(insertionTarget.parentId, insertionTarget.branch, type);
    setShowInsertionPopover(false);
    setInsertionTarget(null);
  };

  // Node editing handlers
  const handleOpenNodeConfig = (node: FlowNode) => {
    setSelectedNodeForConfig(node);
    setEditNodeName(node.name || "");
    setIsEditingSubjectSender(false);
    
    if (node.type === "email") {
      const cfg = node.config || {};
      setEditNodeCampaignName(cfg.campaignName || "");
      setEditNodeSubject(cfg.subject || "");
      setEditNodePreheader(cfg.preheader || "");
      setEditNodeSenderName(cfg.senderName || "Realizzare Cursos");
      setEditNodeSenderEmail(cfg.senderEmail || "contato@realizzare.com.br");
      setEditNodeReplyToEmail(cfg.replyTo || "suporte@realizzare.com.br");
      setEditNodeReplyToIsCustom(cfg.replyToIsCustom || false);
      setEditNodeCustomReplyTo(cfg.customReplyTo || "");
      setEditNodeHtmlContent(cfg.htmlContent || "");
      setEditNodeEmailStatus(cfg.status || "Ativo");
      setIsEditingHtml(false);
    } else if (node.type === "delay") {
      const cfg = node.config || {};
      setEditNodeDelayValue(cfg.value || 2);
      setEditNodeDelayUnit(cfg.unit || "days");
      setEditNodeDelayWeekday(cfg.weekday || "");
      setEditNodeDelayTime(cfg.time || "");
    } else if (node.type === "split") {
      const cfg = node.config || {};
      setEditSplitType(cfg.splitType || "condition");
      setEditSplitRandomRatio(cfg.randomRatio || 50);
      setEditSplitRules(cfg.rules || [{ field: "status", operator: "eq", value: "active" }]);
    }
    
    setActivePanel("node_config");
  };

  const handleSaveNodeConfig = () => {
    if (!selectedNodeForConfig) return;

    let updatedConfig: any = {};
    let lockedName = editNodeName;

    if (selectedNodeForConfig.type === "email") {
      if (!editNodeCampaignName.trim()) {
        alert("O Nome da Campanha é obrigatório para poder salvar!");
        return;
      }
      lockedName = "Enviar E-mail";
      updatedConfig = {
        emailCampaignId: selectedNodeForConfig.config?.emailCampaignId || `flow-camp-${Math.random().toString(36).substr(2, 9)}`,
        campaignName: editNodeCampaignName,
        subject: editNodeSubject,
        preheader: editNodePreheader,
        senderName: editNodeSenderName,
        senderEmail: editNodeSenderEmail,
        replyTo: editNodeReplyToIsCustom ? editNodeCustomReplyTo : editNodeReplyToEmail,
        replyToIsCustom: editNodeReplyToIsCustom,
        customReplyTo: editNodeCustomReplyTo,
        htmlContent: editNodeHtmlContent,
        status: editNodeEmailStatus
      };

      // 2-Way Sync node email template into E-mails library
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

          const storedTemplates = localStorage.getItem("realizzare_email_templates");
          let templatesList = storedTemplates ? JSON.parse(storedTemplates) : [];
          const tplId = `node-tpl-${selectedNodeForConfig.id}`;
          const tplName = editNodeCampaignName.trim();
          const existingIdx = templatesList.findIndex(
            (t: any) => t.id === tplId || (t.flowId === flow.id && t.name.trim().toLowerCase() === tplName.toLowerCase())
          );

          const tplData = {
            id: tplId,
            nodeId: selectedNodeForConfig.id,
            name: tplName,
            subject: editNodeSubject || tplName,
            previewText: editNodePreheader || "",
            htmlContent: editNodeHtmlContent || "<div></div>",
            folderId: folderId,
            folderName: currentFlowName,
            flowId: flow.id,
            flowName: currentFlowName,
            status: editNodeEmailStatus || "Ativo",
            updatedAt: new Date().toLocaleDateString("pt-BR"),
            metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0.0 }
          };

          if (existingIdx >= 0) {
            templatesList[existingIdx] = { ...templatesList[existingIdx], ...tplData };
          } else {
            templatesList.unshift(tplData);
          }
          localStorage.setItem("realizzare_email_templates", JSON.stringify(templatesList));
        } catch (e) {
          console.error("Erro ao sincronizar nó com e-mails library:", e);
        }
      }
    } else if (selectedNodeForConfig.type === "delay") {
      lockedName = "Aguardar Atraso";
      updatedConfig = {
        value: editNodeDelayValue,
        unit: editNodeDelayUnit,
        weekday: editNodeDelayWeekday,
        time: editNodeDelayTime
      };
    } else if (selectedNodeForConfig.type === "split") {
      lockedName = "Divisão Condicional";
      updatedConfig = {
        splitType: editSplitType,
        randomRatio: editSplitRandomRatio,
        rules: editSplitRules
      };
    } else {
      updatedConfig = selectedNodeForConfig.config || {};
    }

    const updateInTree = (tree: FlowNode[]): FlowNode[] => {
      return tree.map(node => {
        if (node.id === selectedNodeForConfig.id) {
          return {
            ...node,
            name: lockedName,
            config: updatedConfig
          };
        }
        if (node.yesBranch || node.noBranch) {
          return {
            ...node,
            yesBranch: node.yesBranch ? updateInTree(node.yesBranch) : [],
            noBranch: node.noBranch ? updateInTree(node.noBranch) : []
          };
        }
        return node;
      });
    };

    setNodes(updateInTree(nodes));
    setActivePanel("menu");
    setSelectedNodeForConfig(null);
  };

  const handleDeleteNode = (id: string) => {
    if (id === "trigger") return;
    
    const deleteFromTree = (tree: FlowNode[]): FlowNode[] => {
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

    setNodes(deleteFromTree(nodes));
  };

  const handleDuplicateNode = (node: FlowNode) => {
    if (node.id === "trigger") return;
    const copy: FlowNode = {
      ...node,
      id: crypto.randomUUID(),
      name: `${node.name} (Cópia)`
    };

    // Append copy directly below target parent (or next in flat chain)
    const duplicateInTree = (chain: FlowNode[]): FlowNode[] => {
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
            yesBranch: n.yesBranch ? duplicateInTree(n.yesBranch) : [],
            noBranch: n.noBranch ? duplicateInTree(n.noBranch) : []
          };
        }
        return n;
      });
    };

    setNodes(duplicateInTree(nodes));
  };

  // Triggers selection logic
  const handleSelectTrigger = (metric: string, description: string) => {
    setFlow(prev => ({
      ...prev,
      triggerMetric: metric,
      triggerType: description
    }));

    // Update nodes[0] to reflect selection
    const updated = [...nodes];
    updated[0] = {
      ...updated[0],
      name: metric,
      config: { triggerDescription: description }
    };
    setNodes(updated);
    
    setActivePanel("trigger_config");
  };

  // Save full Flow constructor data
  const handleSaveFlow = async () => {
    const triggerNode = nodes.find(n => n.type === "trigger" || n.id === "trigger");
    const currentTriggerDesc = flow.triggerType || triggerNode?.config?.triggerDescription || (triggerNode?.name !== "Disparador" ? triggerNode?.name : undefined) || "Disparador não configurado";
    const currentTriggerMetric = flow.triggerMetric || (triggerNode?.name !== "Disparador" ? triggerNode?.name : undefined) || "Iniciou Curso";

    const supabase = createClient();
    try {
      // 1. Update metadata
      await supabase.from("flows").update({
        name: flow.name,
        trigger_type: currentTriggerDesc,
        trigger_metric: currentTriggerMetric,
        re_entry_mode: flow.triggerReentryMode,
        re_entry_period_value: flow.reentryPeriodValue,
        re_entry_period_unit: flow.reentryPeriodUnit,
        trigger_filters: [], // Clear out since we use flow_nodes
        profile_filters: flow.profileFilters,
        exit_conditions: flow.exitConditions,
        updated_at: new Date().toISOString()
      }).eq("id", flow.id);
      
      // 2. Flatten nodes
      const flattenNodes = (tree: FlowNode[], flowId: string, parentId: string | null = null, branchLabel: string | null = null): any[] => {
        let flat: any[] = [];
        let prevId = parentId;
        
        for (let i = 0; i < tree.length; i++) {
          const node = tree[i];
          const currentParentId = i === 0 ? prevId : tree[i-1].id;
          const currentBranchLabel = i === 0 ? branchLabel : null;
          
          const flatNode = {
             id: node.id,
             flow_id: flowId,
             node_type: node.type,
             parent_node_id: currentParentId,
             branch_label: currentBranchLabel,
             config: { ...node.config, name: node.name },
             is_deleted: false
          };
          
          flat.push(flatNode);
          
          if (node.type === 'split') {
             if (node.yesBranch && node.yesBranch.length > 0) {
               flat = flat.concat(flattenNodes(node.yesBranch, flowId, node.id, 'yes'));
             }
             if (node.noBranch && node.noBranch.length > 0) {
               flat = flat.concat(flattenNodes(node.noBranch, flowId, node.id, 'no'));
             }
          }
        }
        
        return flat;
      };

      const flatNodes = flattenNodes(nodes, flow.id);

      // 3. Upsert flat nodes
      if (flatNodes.length > 0) {
         const { error: upsertError } = await supabase.from("flow_nodes").upsert(flatNodes);
         if (upsertError) throw upsertError;
      }

      // 4. Soft delete missing nodes
      const { data: existingNodes } = await supabase.from("flow_nodes")
          .select("id")
          .eq("flow_id", flow.id)
          .eq("is_deleted", false);
          
      if (existingNodes) {
         const flatIds = flatNodes.map((n: any) => n.id);
         const missingIds = existingNodes.map((n: any) => n.id).filter((id: any) => !flatIds.includes(id));
         
         if (missingIds.length > 0) {
            await supabase.from("flow_nodes")
                .update({ is_deleted: true, deleted_at: new Date().toISOString() })
                .in("id", missingIds);
         }
      }
      
      alert("Fluxo salvo com sucesso no Supabase!");
      
    } catch(e) {
      console.error(e);
      alert("Erro ao salvar fluxo");
    }
  };

  const handleToggleFlowStatus = () => {
    const nextStatus = flow.status === "Ativo" ? "Pausado" : "Ativo";
    if (nextStatus === "Ativo") {
      setShowActivationConfirmModal(true);
      return;
    }
    executeToggleFlowStatus("Pausado");
  };

  const executeToggleFlowStatus = (nextStatus: "Ativo" | "Pausado") => {
    const supabase = createClient();
    supabase.from("flows").update({
        status: nextStatus === "Ativo" ? "active" : "paused"
    }).eq("id", flow.id).then(() => {
        setFlow(prev => ({ ...prev, status: nextStatus }));
        alert(`Status alterado para: ${nextStatus === "Ativo" ? "Ativo (Iniciando contatos)" : "Pausado (Envios bloqueados)"}`);
        router.push("/dashboard/automations");
    });
  };

  const handleSetNodeStatus = (nodeId: string, nextStatus: "Ativo" | "Rascunho") => {
    setNodes(prevNodes => {
      const updateStatusInTree = (tree: FlowNode[]): FlowNode[] => {
        return tree.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              config: {
                ...(node.config || {}),
                status: nextStatus
              }
            };
          }
          if (node.yesBranch || node.noBranch) {
            return {
              ...node,
              yesBranch: node.yesBranch ? updateStatusInTree(node.yesBranch) : [],
              noBranch: node.noBranch ? updateStatusInTree(node.noBranch) : []
            };
          }
          return node;
        });
      };
      return updateStatusInTree(prevNodes);
    });
  };

  const findNodeById = (tree: FlowNode[], id: string): FlowNode | null => {
    for (const n of tree) {
      if (n.id === id) return n;
      if (n.yesBranch || n.noBranch) {
        const found = findNodeById(n.yesBranch || [], id) || findNodeById(n.noBranch || [], id);
        if (found) return found;
      }
    }
    return null;
  };

  const moveNodeInTree = (
    sourceId: string, 
    targetParentId: string, 
    targetBranch: 'yes' | 'no' | 'yes_start' | 'no_start' | undefined
  ) => {
    setNodes(prevNodes => {
      let extracted: FlowNode | null = null;

      // Helper 1: Extract the node from tree (move it alone by resetting its children)
      const extract = (tree: FlowNode[]): FlowNode[] => {
        const nextTree: FlowNode[] = [];
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

      const treeWithoutSource = extract(prevNodes);

      if (!extracted) {
        console.error("Source node not found");
        return prevNodes;
      }

      // Helper 2: Insert into new position
      const insertInto = (tree: FlowNode[]): FlowNode[] => {
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

      const insertInFlatChain = (chain: FlowNode[]): FlowNode[] => {
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
              yesBranch: node.yesBranch ? insertInFlatChain(node.yesBranch) : [],
              noBranch: node.noBranch ? insertInFlatChain(node.noBranch) : []
            };
          }
          return node;
        });
      };

      if (targetBranch) {
        return insertInto(treeWithoutSource);
      } else {
        return insertInFlatChain(treeWithoutSource);
      }
    });
  };

  const handleMoveNodeRequest = (sourceId: string, targetParentId: string, targetBranch: 'yes' | 'no' | 'yes_start' | 'no_start' | undefined) => {
    // Cannot move to itself
    if (sourceId === targetParentId) return;

    const node = findNodeById(nodes, sourceId);
    if (!node) return;

    // Check if node is a delay step (Aguardar)
    if (node.type === "delay") {
      // Simulate that there are waiting leads (e.g. 12 leads)
      setMoveLeadsNode(node);
      setMoveTarget({ sourceId, targetParentId, targetBranch });
      setMoveLeadsAction("move");
      setShowMoveLeadsModal(true);
    } else {
      // Não leads or not a delay node: move immediately
      moveNodeInTree(sourceId, targetParentId, targetBranch);
    }
  };

  const handleConfirmMoveLeads = () => {
    if (!moveTarget) return;
    
    // Move the node
    moveNodeInTree(moveTarget.sourceId, moveTarget.targetParentId, moveTarget.targetBranch);

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
    setMoveLeadsNode(null);
    setMoveTarget(null);
  };

  // Node renderer: Recursive tree generator
  const renderNodeChain = (
    chain: FlowNode[],
    branchInfo?: { parentId: string; branchType: 'yes' | 'no' }
  ) => {
    return (
      <div className="flex flex-col items-center">
        {/* Leading branch connection button (+) above the first node of a conditional direction */}
        {branchInfo && chain.length > 0 && (
          <div className="w-[2px] h-12 bg-slate-300 shrink-0 relative flex items-center justify-center">
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
                const type = e.dataTransfer.getData("text/plain") as string;
                if (type) {
                  if (type.startsWith("move:")) {
                    const sourceId = type.split(":")[1];
                    handleMoveNodeRequest(sourceId, branchInfo.parentId, branchInfo.branchType === 'yes' ? 'yes_start' : 'no_start');
                  } else {
                    insertNodeDirectly(branchInfo.parentId, branchInfo.branchType === 'yes' ? 'yes_start' : 'no_start', type as any);
                  }
                }
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0 animate-fadeIn"
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
                <div className="w-[2px] h-16 bg-slate-300 shrink-0 relative flex items-center justify-center">
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
                      const type = e.dataTransfer.getData("text/plain") as string;
                      if (type) {
                        if (type.startsWith("move:")) {
                          const sourceId = type.split(":")[1];
                          handleMoveNodeRequest(sourceId, chain[index - 1].id, undefined);
                        } else {
                          insertNodeDirectly(chain[index - 1].id, undefined, type as any);
                        }
                      }
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
                    title="Adicionar etapa aqui"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Node Card */}
              <div 
                className="relative group/node select-none animate-fadeIn"
                draggable={!isTrigger}
                onDragStart={(e) => {
                  if (isTrigger) return;
                  e.dataTransfer.setData("text/plain", `move:${node.id}`);
                  e.dataTransfer.effectAllowed = "move";
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
                      isTrigger ? setShowTriggerModal(true) : handleOpenNodeConfig(node);
                    }
                  }}
                  className={`bg-white border hover:border-indigo-500 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md relative ${
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
                        <h4 className="text-xs font-black text-slate-800 truncate">
                          {isTrigger ? (
                            node.name !== "Disparador" ? node.name : (flow.triggerMetric || "Disparador")
                          ) : (
                            node.type === "email" ? (node.config?.campaignName || "Enviar E-mail") : node.name
                          )}
                        </h4>
                        <p className={`text-[9px] text-slate-450 mt-0.5 ${
                          node.type === "email" || isTrigger ? "break-words whitespace-normal leading-relaxed text-slate-500 font-medium line-clamp-2" : "truncate"
                        }`}>
                          {isTrigger ? (
                            (node.config?.triggerDescription && node.config?.triggerDescription !== "Disparador não configurado"
                              ? node.config.triggerDescription
                              : (flow.triggerType && flow.triggerType !== "Disparador não configurado"
                                ? flow.triggerType
                                : "Selecionar Gatilho"))
                          ) :
                           node.type === "email" ? (node.config?.subject || "E-mail sem assunto") :
                           node.type === "delay" ? `Aguardar ${node.config?.value} ${node.config?.unit === 'days' ? 'dias' : node.config?.unit === 'hours' ? 'horas' : 'minutos'}` :
                           node.type === "goto" ? (() => {
                               const target = findNodeById(nodes, node.config?.targetId);
                               return target ? `Pula para: ${target.name || "Etapa"}` : "Destino pendente";
                             })() :
                           isSplit ? (
                              node.config?.splitType === "random"
                                ? `Randomizar: ${node.config.randomRatio || 50}% / ${100 - (node.config.randomRatio || 50)}%`
                                : "Verificar condições..."
                            ) : "Clique para configurar"}
                        </p>
                      </div>
                    </div>

                    {/* Botão de Adicionar Contato Manualmente */}
                    {isTrigger && (
                      <div className="relative shrink-0 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowManualAddModal(true);
                          }}
                          className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="Adicionar leads manualmente a este fluxo"
                        >
                          <UserPlus className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    )}
                    
                    {/* 3-Dots Options Dropdown Button for non-triggers */}
                    {!isTrigger && (
                      <div className="relative shrink-0 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveNodeOptionsDropdownId(activeNodeOptionsDropdownId === node.id ? null : node.id);
                            setActiveNodeStatusDropdownId(null);
                          }}
                          className="p-1 hover:bg-slate-100 hover:text-slate-700 text-slate-400 rounded-lg cursor-pointer transition-colors"
                          title="Opções da etapa"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Options Dropdown Menu */}
                        {activeNodeOptionsDropdownId === node.id && (
                          <>
                            {/* Simple invisible overlay to close clicking outside */}
                            <div 
                              className="fixed inset-0 z-40 cursor-default" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveNodeOptionsDropdownId(null);
                              }}
                            />
                            
                            <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 w-32 z-50 text-left animate-scaleIn select-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNodeOptionsDropdownId(null);
                                  handleOpenNodeConfig(node);
                                }}
                                className="w-full px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-450" />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNodeOptionsDropdownId(null);
                                  handleDuplicateNode(node);
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
                                  e.stopPropagation();
                                  setActiveNodeOptionsDropdownId(null);
                                  handleDeleteNode(node.id);
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
                    const delayMetrics = getMetricsForNode(node.id, typeof nodeMetricsData !== "undefined" ? nodeMetricsData : {}, flowPeriod, flowCustomStart, flowCustomEnd);
                    const waitingCount = delayMetrics.espera || 0;
                    return (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2.5">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
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
                    const nodeMetrics = getMetricsForNode(node.id, typeof nodeMetricsData !== "undefined" ? nodeMetricsData : {}, flowPeriod, flowCustomStart, flowCustomEnd);
                    return (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3.5">
                        {/* Metric Rates (List Layout matching the reference image) */}
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
                              {nodeMetrics.openRate.toFixed(1)}% <span className="text-slate-400 font-medium text-[9px]">({nodeMetrics.opened})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100/50 font-medium">
                            <span className="text-slate-500 font-semibold">Taxa de cliques (CR)</span>
                            <span className="font-bold text-slate-800">
                              {nodeMetrics.clickRate.toFixed(1)}% <span className="text-slate-400 font-medium text-[9px]">({nodeMetrics.clicked})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] py-1 font-medium">
                            <span className="text-slate-500 font-semibold">Pedido realizado</span>
                            <span className="font-black text-emerald-600">
                              {nodeMetrics.conversionRate.toFixed(1)}% <span className="text-emerald-500/80 font-bold text-[9px]">(R$ {Math.round(nodeMetrics.revenue).toLocaleString("pt-BR")})</span>
                            </span>
                          </div>
                        </div>

                        {/* Delivery counts (Restored Vertical 3-Column Layout, Espera removed) */}
                        <div className="grid grid-cols-3 gap-1 text-[8px] text-slate-550 border-t border-slate-100 pt-3 text-center">
                          <div 
                            onClick={(e) => { e.stopPropagation(); handleOpenQueueModal(node, "Revisão", nodeMetrics.revisao); }}
                            className="hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-150 flex flex-col items-center"
                            title="Ver leads em Revisão"
                          >
                            <span className="text-[7.5px] text-slate-400 block font-bold uppercase tracking-wider">Revisão</span>
                            <span className="text-slate-800 font-black text-xs mt-0.5">{nodeMetrics.revisao}</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); handleOpenQueueModal(node, "Entregue", nodeMetrics.entregue); }}
                            className="hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-150 flex flex-col items-center"
                            title="Ver leads Entregues"
                          >
                            <span className="text-[7.5px] text-slate-400 block font-bold uppercase tracking-wider">Entregue</span>
                            <span className="text-slate-800 font-black text-xs mt-0.5">{nodeMetrics.entregue}</span>
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); handleOpenQueueModal(node, "Ignorado", nodeMetrics.ignorado); }}
                            className="hover:bg-slate-50 p-1.5 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-150 flex flex-col items-center"
                            title="Ver leads Ignorados"
                          >
                            <span className="text-[7.5px] text-slate-400 block font-bold uppercase tracking-wider">Ignorado</span>
                            <span className="text-slate-800 font-black text-xs mt-0.5">{nodeMetrics.ignorado}</span>
                          </div>
                        </div>

                        {/* Status Badge bottom right with Dropdown */}
                        <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-650 pt-1 relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNodeStatusDropdownId(activeNodeStatusDropdownId === node.id ? null : node.id);
                              setActiveNodeOptionsDropdownId(null);
                            }}
                            className="hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer transition-all bg-slate-50 border border-slate-205 px-2 py-0.5 rounded-lg hover:border-slate-350 select-none"
                            title="Clique para alterar o status do e-mail"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                              (node.config?.status || "Ativo") === "Ativo" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`} />
                            <span className={
                              (node.config?.status || "Ativo") === "Ativo" ? "text-emerald-600 font-black" : "text-slate-555 font-black"
                            }>{node.config?.status || "Ativo"}</span>
                          </button>

                          {activeNodeStatusDropdownId === node.id && (
                            <>
                              <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveNodeStatusDropdownId(null); }} />
                              <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-28 z-50 text-left animate-scaleIn select-none">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNodeStatusDropdownId(null);
                                    handleSetNodeStatus(node.id, "Ativo");
                                  }}
                                  className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${(node.config?.status || "Ativo") === "Ativo" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  <span>Ativo</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNodeStatusDropdownId(null);
                                    handleSetNodeStatus(node.id, "Rascunho");
                                  }}
                                  className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${(node.config?.status || "Ativo") === "Rascunho" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
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

                  {/* Status Badge when detailed metrics is inactive (Email nodes only) with Dropdown */}
                  {node.type === "email" && !showDetailedMetrics && (() => {
                    const status = node.config?.status || "Ativo";
                    return (
                      <div className="flex items-center justify-end gap-1 text-[8.5px] font-black uppercase tracking-wider pt-2 border-t border-slate-100/50 mt-2.5 relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveNodeStatusDropdownId(activeNodeStatusDropdownId === node.id ? null : node.id);
                            setActiveNodeOptionsDropdownId(null);
                          }}
                          className="hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer transition-all bg-slate-50 border border-slate-250 px-2 py-0.5 rounded-lg hover:border-slate-350 select-none"
                          title="Clique para alterar o status do e-mail"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                            status === "Ativo" ? "bg-emerald-500 animate-pulse" :
                            status === "Pausado" ? "bg-amber-500" : "bg-slate-400"
                          }`} />
                          <span className={
                            status === "Ativo" ? "text-emerald-600 font-black" :
                            status === "Pausado" ? "text-amber-600 font-black" : "text-slate-500 font-black"
                          }>{status}</span>
                        </button>

                        {activeNodeStatusDropdownId === node.id && (
                          <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveNodeStatusDropdownId(null); }} />
                            <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-28 z-50 text-left animate-scaleIn select-none">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNodeStatusDropdownId(null);
                                  handleSetNodeStatus(node.id, "Ativo");
                                }}
                                className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${status === "Ativo" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Ativo</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNodeStatusDropdownId(null);
                                  handleSetNodeStatus(node.id, "Rascunho");
                                }}
                                className={`w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${status === "Rascunho" ? "text-indigo-600 bg-indigo-50/10 font-bold" : "text-slate-600"}`}
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
                  <div className="w-[300px] h-6 relative flex justify-between border-t-2 border-slate-300">
                    <span className="absolute left-[30px] -top-2.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-bold uppercase rounded border border-emerald-200">Sim</span>
                    <span className="absolute right-[30px] -top-2.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-bold uppercase rounded border border-slate-200">Não</span>
                  </div>

                  <div className="flex gap-12">
                    {/* Yes Branch */}
                    <div className="flex flex-col items-center border-r-2 border-dashed border-slate-200/50 pr-6">
                      {renderNodeChain(node.yesBranch || [], { parentId: node.id, branchType: 'yes' })}
                      
                      {!(node.yesBranch && node.yesBranch.length > 0 && ["split", "goto"].includes(node.yesBranch[node.yesBranch.length - 1].type)) && (
                          <>
                            {/* Branch bottom Add node */}
                      <div className="w-[2px] h-16 bg-slate-300 shrink-0 relative flex items-center justify-center">
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
                            const type = e.dataTransfer.getData("text/plain") as string;
                            if (type) {
                              if (type.startsWith("move:")) {
                                const sourceId = type.split(":")[1];
                                handleMoveNodeRequest(sourceId, node.id, 'yes');
                              } else {
                                insertNodeDirectly(node.id, 'yes', type as any);
                              }
                            }
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
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
                      {renderNodeChain(node.noBranch || [], { parentId: node.id, branchType: 'no' })}
                      
                      {!(node.noBranch && node.noBranch.length > 0 && ["split", "goto"].includes(node.noBranch[node.noBranch.length - 1].type)) && (
                          <>
                            {/* Branch bottom Add node */}
                      <div className="w-[2px] h-16 bg-slate-300 shrink-0 relative flex items-center justify-center">
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
                            const type = e.dataTransfer.getData("text/plain") as string;
                            if (type) {
                              if (type.startsWith("move:")) {
                                const sourceId = type.split(":")[1];
                                handleMoveNodeRequest(sourceId, node.id, 'no');
                              } else {
                                insertNodeDirectly(node.id, 'no', type as any);
                              }
                            }
                          }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
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
            href="/dashboard/automations"
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
              flow.status === "Rascunho" ? "bg-slate-100 border border-slate-200 text-slate-450" :
              flow.status === "Ativo" ? "bg-emerald-50 border border-emerald-250 text-emerald-700" :
              "bg-amber-50 border border-amber-250 text-amber-700"
            }`}>
              {flow.status}
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

          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setTempFlowPeriod(flowPeriod);
                setTempFlowCustomStart(flowCustomStart);
                setTempFlowCustomEnd(flowCustomEnd);
                setShowFlowDatePicker(!showFlowDatePicker);
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

            {showFlowDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFlowDatePicker(false)} />
                <div className="absolute right-0 mt-2 z-50 w-[580px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-0 flex animate-fadeIn text-slate-800">
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
                            const dates = getPeriodDates(preset.id);
                            setTempFlowCustomStart(dates.start.toISOString().split("T")[0]);
                            setTempFlowCustomEnd(dates.end.toISOString().split("T")[0]);
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
                        const dateStr = `2026-07-${day < 10 ? "0" + day : day}`;
                        const isSelectedStart = tempFlowCustomStart === dateStr;
                        const isSelectedEnd = tempFlowCustomEnd === dateStr;
                        const isWithinRange =
                          tempFlowCustomStart &&
                          tempFlowCustomEnd &&
                          dateStr > tempFlowCustomStart &&
                          dateStr < tempFlowCustomEnd;
                        
                        return (
                          <button
                            key={`day-${day}`}
                            type="button"
                            onClick={() => {
                              setTempFlowPeriod("custom");
                              if (!tempFlowCustomStart || (tempFlowCustomStart && tempFlowCustomEnd)) {
                                setTempFlowCustomStart(dateStr);
                                setTempFlowCustomEnd("");
                              } else {
                                if (dateStr < tempFlowCustomStart) {
                                  setTempFlowCustomStart(dateStr);
                                  setTempFlowCustomEnd("");
                                } else {
                                  setTempFlowCustomEnd(dateStr);
                                }
                              }
                            }}
                            className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer relative ${
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
                        onClick={() => setShowFlowDatePicker(false)}
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
                          setShowFlowDatePicker(false);
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
            onClick={handleToggleFlowStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              flow.status === "Ativo" ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {flow.status === "Ativo" ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
            <span>{flow.status === "Ativo" ? "Pausar Flow" : "Ativar Flow"}</span>
          </button>

          <button
            onClick={handleSaveFlow}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            Salvar Fluxo
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMetadataMenu(!showMetadataMenu)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-550 rounded-xl transition-colors cursor-pointer flex items-center justify-center h-8 w-8"
              title="Mais detalhes sobre o fluxo"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showMetadataMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMetadataMenu(false)} />
                <div className="absolute right-0 mt-2 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-left space-y-4 animate-fadeIn select-none">
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
                      <p className="text-[10px] text-slate-400 font-semibold">Em: {flow.updatedAt || new Date().toLocaleString("pt-BR")}</p>
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
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pulse border-4 border-indigo-200 cursor-default">
           <GitCommit className="h-5 w-5" />
           <span className="font-bold">Selecione a etapa destino no canvas</span>
           <button onClick={() => setSelectingGotoTarget(null)} className="ml-2 hover:bg-indigo-700 p-1 rounded-full bg-indigo-800 transition-colors cursor-pointer"><X className="h-4 w-4"/></button>
        </div>
      )}


      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 2. MENU LATERAL ESQUERDO RETRÁTIL ("Ações") */}
        <aside
          className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-xs relative shrink-0 ${
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
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "email")}
                  onClick={() => handleAddNodeDirectly("email")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-blue-500" /> E-mail</span>
                  <Plus className="h-3.5 w-3.5 text-slate-450 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "whatsapp")}
                  onClick={() => handleAddNodeDirectly("whatsapp")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><MessageSquare className="h-4 w-4 text-emerald-500" /> WhatsApp</span>
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
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "delay")}
                  onClick={() => handleAddNodeDirectly("delay")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Clock className="h-4 w-4 text-amber-500" /> Atraso (Delay)</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "split")}
                  onClick={() => handleAddNodeDirectly("split")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Split className="h-4 w-4 text-purple-500" /> Divisão Condicional</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                  <div
                    onClick={() => handleAddNodeDirectly("goto")}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", "goto");
                      e.dataTransfer.effectAllowed = "copy";
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
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                Ações de Dados
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "update_contact")}
                  onClick={() => handleAddNodeDirectly("update_contact")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Users className="h-4 w-4 text-indigo-500" /> Atualizar Contato</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "update_list")}
                  onClick={() => handleAddNodeDirectly("update_list")}
                  className="flex items-center justify-between px-3 py-2.5 border border-slate-200 hover:border-indigo-400 rounded-xl bg-slate-50/50 hover:bg-indigo-50/10 cursor-grab active:cursor-grabbing transition-all text-xs font-bold"
                  title="Clique para adicionar ao final ou arraste para o canvas"
                >
                  <span className="flex items-center gap-2 text-slate-700"><Database className="h-4 w-4 text-pink-500" /> Atualizar Lista</span>
                  <Plus className="h-3.5 w-3.5 text-slate-455 hover:text-indigo-650" />
                </div>
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", "webhook")}
                  onClick={() => handleAddNodeDirectly("webhook")}
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
          className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing canvas-bg select-none"
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
              
              {/* Nodes layout recursive chain render */}
              {renderNodeChain(nodes)}

              {/* Connection to final End node */}
                {(() => {
                  const terminalIdx = nodes.findIndex(n => n.type === "split" || n.type === "goto");
                  const effectiveNodes = terminalIdx !== -1 ? nodes.slice(0, terminalIdx + 1) : nodes;
                  const lastNode = effectiveNodes[effectiveNodes.length - 1];
                  return effectiveNodes.length > 0 && !["split", "goto"].includes(lastNode.type);
                })() && (
                  <>

                  <div className="w-[2px] h-16 bg-slate-300 shrink-0 relative flex items-center justify-center">
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
                        const type = e.dataTransfer.getData("text/plain") as string;
                        if (type) {
                          if (type.startsWith("move:")) {
                            const sourceId = type.split(":")[1];
                            handleMoveNodeRequest(sourceId, nodes[nodes.length - 1].id, undefined);
                          } else {
                            insertNodeDirectly(nodes[nodes.length - 1].id, undefined, type as any);
                          }
                        }
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all duration-200 cursor-pointer shadow-md hover:scale-110 z-10 flex items-center justify-center w-6.5 h-6.5 shrink-0"
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
              Zoom: {Math.round(zoom * 100)}%
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

        {/* 6. SIDEBAR DRAWER (Right panels configuration context) */}
        {activePanel && activePanel !== "menu" && (
          <aside className="w-96 h-[calc(100vh-4rem)] bg-white border-l border-slate-200 z-30 shadow-lg flex flex-col animate-slideLeft shrink-0">
            
            {/* Header of settings panel */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  {activePanel === "trigger_select" ? "Selecionar Disparador" :
                   activePanel === "trigger_config" ? "Configurar o Disparador" :
                   activePanel === "node_config" ? (selectedNodeForConfig?.type === "email" ? "Detalhes do e-mail" : `Configurações: ${selectedNodeForConfig?.name}`) :
                   activePanel === "exit_rules" ? "Regras de Saída" : "Configurar Etapa"}
                </h3>
              </div>
              <button
                onClick={() => { setActivePanel("menu"); setSelectedNodeForConfig(null); }}
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
                      onClick={() => setTriggerTab("recommendations")}
                      className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        triggerTab === "recommendations" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
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

                  {/* Recommendations & Trigger Selection Options */}
                  <div className="space-y-4">
                    {/* Grupo Ações & Listas */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Listas & Tags</span>
                      <div
                        onClick={() => handleSelectTrigger("Inscrever-se em uma lista", "Acionado quando o contato entra em uma lista específica")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-indigo-600" />
                          Inscrever-se em uma lista
                        </span>
                        <p className="text-[10px] text-slate-500">Inicia a automação sempre que um contato é inscrito em uma lista escolhida.</p>
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
                        onClick={() => handleSelectTrigger("Alteração nos campos de contato", "Acionado quando um campo do perfil sofre alteração")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Database className="h-4 w-4 text-blue-600" />
                          Alteração nos campos de contato
                        </span>
                        <p className="text-[10px] text-slate-500">Inicia a automação se algum campo do perfil do usuário for modificado.</p>
                      </div>
                    </div>

                    {/* Grupo E-Commerce & Checkout (Pagar.me / PagBank / Realizzare) */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Vendas, Créditos & Plataforma</span>
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
                        onClick={() => handleSelectTrigger("Certificado Emitido", "Emissão de certificado na plataforma Realizzare")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                          Certificado Emitido
                        </span>
                        <p className="text-[10px] text-slate-500">Disparado automaticamente quando o usuário conclui e emite um certificado Realizzare.</p>
                      </div>

                      <div
                        onClick={() => handleSelectTrigger("Assinatura Realizada", "Assinatura contratada no checkout (Pagar.me/PagBank)")}
                        className="p-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 rounded-xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Zap className="h-4 w-4 text-indigo-600" />
                          Assinatura Realizada
                        </span>
                        <p className="text-[10px] text-slate-500">Inicia o fluxo de boas-vindas assim que a assinatura de plano é aprovada.</p>
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
                      <strong>Captura pós-ativação:</strong> Este fluxo apenas inserirá leads que dispararem o gatilho <strong>após</strong> a ativação oficial do fluxo. Leads retroativos serão desconsiderados.
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
                          <span className="text-[10px] text-slate-450">O aluno reentra no fluxo sempre que o evento gatilho for disparado.</span>
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

                  {/* Filtros de Entrada do Gatilho */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Filtros do Disparador</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Restringe o evento gatilho a critérios específicos do fluxo.</p>
                    </div>
                    <button
                      onClick={() => alert("Abrindo construtor de regras para filtrar o evento de entrada...")}
                      className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-650 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Filtros de Gatilho</span>
                    </button>
                  </div>

                  {/* Filtros de Perfil */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Filtros de Perfil</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Restringe o disparo com base em atributos do aluno (Tags, Faturamento).</p>
                    </div>
                    <button
                      onClick={() => alert("Abrindo construtor de regras para filtrar propriedades de contatos...")}
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
              {activePanel === "node_config" && selectedNodeForConfig && (
                <div className="space-y-5">
                  
                  {/* Email Node parameters */}
                  {selectedNodeForConfig.type === "email" && (
                    <div className="space-y-5">
                      
                      {/* Status Dropdown */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Status da Etapa</label>
                        <div className="relative w-32">
                          <span className={`absolute left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${
                            editNodeEmailStatus === 'Ativo' ? 'bg-emerald-500' :
                            editNodeEmailStatus === 'Pausado' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          <select
                            value={editNodeEmailStatus}
                            onChange={(e) => setEditNodeEmailStatus(e.target.value as any)}
                            className="w-full pl-6 pr-8 py-1.5 border border-slate-200 rounded-xl text-[11px] font-bold bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer appearance-none animate-none"
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
                        const sidebarMetrics = getMetricsForNode(selectedNodeForConfig.id, typeof nodeMetricsData !== "undefined" ? nodeMetricsData : {}, flowPeriod, flowCustomStart, flowCustomEnd);
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
                                  const campId = selectedNodeForConfig.config?.emailCampaignId;
                                  if (campId) {
                                    router.push(`/dashboard/campaigns/${campId}`);
                                  } else {
                                    alert("Salve as configurações desta etapa primeiro para criar um ID de campanha e habilitar os relatórios detalhados!");
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
                                  {sidebarMetrics.openRate.toFixed(1)}% <span className="text-slate-450 font-bold text-[9px]">({sidebarMetrics.opened})</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-1 border-b border-slate-100/50 font-medium">
                                <span className="text-slate-555">Taxa de cliques (CR)</span>
                                <span className="font-bold text-slate-800">
                                  {sidebarMetrics.clickRate.toFixed(1)}% <span className="text-slate-450 font-bold text-[9px]">({sidebarMetrics.clicked})</span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-1 font-medium">
                                <span className="text-slate-555">Pedido realizado</span>
                                <span className="font-black text-emerald-600">
                                  {sidebarMetrics.conversionRate.toFixed(1)}% <span className="text-slate-450 font-bold text-[9px]">(R$ {Math.round(sidebarMetrics.revenue).toLocaleString("pt-BR")})</span>
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
                          <div className="space-y-3.5 text-xs pt-1.5 animate-fadeIn">
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Nãome</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNodeCampaignName || <span className="text-slate-300 italic">Sem nome</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Assunto</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNodeSubject || <span className="text-slate-300 italic">Sem assunto</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Prévia do texto</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNodePreheader || <span className="text-slate-300 italic">Sem prévia</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">Nãome do remetente</span>
                              <span className="col-span-2 text-slate-800 font-semibold">{editNodeSenderName || <span className="text-slate-300 italic">Sem nome</span>}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-slate-400 font-medium">E-mail do remetente</span>
                              <span className="col-span-2 text-slate-800 font-semibold truncate" title={editNodeSenderEmail}>{editNodeSenderEmail || <span className="text-slate-300 italic">Sem e-mail</span>}</span>
                            </div>
                            {editNodeReplyToIsCustom && (
                              <div className="grid grid-cols-3 gap-2">
                                <span className="text-slate-400 font-medium">E-mail de resposta</span>
                                <span className="col-span-2 text-slate-800 font-semibold truncate" title={editNodeCustomReplyTo}>{editNodeCustomReplyTo || <span className="text-slate-300 italic">Sem e-mail de resposta</span>}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <span>Nome da Campanha</span>
                                <span className="text-red-500 font-bold">*</span>
                              </label>
                              <input
                                type="text"
                                value={editNodeCampaignName}
                                onChange={(e) => setEditNodeCampaignName(e.target.value)}
                                placeholder="Ex: Curso Iniciado React 01"
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Assunto do E-mail</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={editNodeSubject}
                                  onChange={(e) => setEditNodeSubject(e.target.value)}
                                  placeholder="Insira o assunto..."
                                  className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                />
                                                             <div className="absolute right-0 top-0 bottom-0 flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                                    className="h-full px-3 text-slate-400 hover:text-indigo-600 bg-slate-50 border-l border-slate-200 rounded-r-xl transition-colors font-bold text-xs cursor-pointer"
                                  >
                                    {}
                                  </button>
                                  {showTagsDropdown && (
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => { setEditNodeSubject(prev => prev + " {{primeiro_nome}}"); setShowTagsDropdown(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                                      >{`{{primeiro_nome}}`}</button>
                                      <button
                                        type="button"
                                        onClick={() => { setEditNodeSubject(prev => prev + " {{email}}"); setShowTagsDropdown(false); }}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                      >{`{{email}}`}</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pré-cabeçalho (Texto de Apoio)</label>
                              <input
                                type="text"
                                value={editNodePreheader}
                                onChange={(e) => setEditNodePreheader(e.target.value)}
                                placeholder="Texto de apoio que aparece ao lado do assunto..."
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nome Remetente</label>
                                <input
                                  type="text"
                                  value={editNodeSenderName}
                                  onChange={(e) => setEditNodeSenderName(e.target.value)}
                                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">E-mail Remetente</label>
                                <input
                                  type="email"
                                  value={editNodeSenderEmail}
                                  onChange={(e) => setEditNodeSenderEmail(e.target.value)}
                                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={editNodeReplyToIsCustom}
                                  onChange={(e) => setEditNodeReplyToIsCustom(e.target.checked)}
                                  className="rounded border-slate-350 text-indigo-650 h-4 w-4 focus:ring-0"
                                />
                                <span className="text-[10px] font-black text-slate-550 uppercase tracking-wider">Usar e-mail de resposta diferente</span>
                              </label>

                              {editNodeReplyToIsCustom && (
                                <input
                                  type="email"
                                  value={editNodeCustomReplyTo}
                                  onChange={(e) => setEditNodeCustomReplyTo(e.target.value)}
                                  placeholder="resposta@realizzare.com.br"
                                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none transition-all animate-scaleIn"
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
                            {editNodeHtmlContent ? (
                              <div className="space-y-2">
                                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-1 text-[10px] font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setEditNodePreviewDevice("desktop")}
                                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                                      editNodePreviewDevice === "desktop" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                                    }`}
                                  >
                                    <Laptop className="h-3.5 w-3.5" /> Desktop
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditNodePreviewDevice("mobile")}
                                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                                      editNodePreviewDevice === "mobile" ? "bg-white text-indigo-700 shadow-xs font-black" : "text-slate-500"
                                    }`}
                                  >
                                    <Smartphone className="h-3.5 w-3.5" /> Mobile
                                  </button>
                                </div>

                                {editNodePreviewDevice === "mobile" ? (
                                  <div className="h-[320px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 relative flex justify-center items-start select-none animate-fadeIn">
                                    <div 
                                      className="relative shrink-0 overflow-hidden shadow-sm rounded-xl border border-slate-200/50 mt-2"
                                      style={{
                                        width: "360px",
                                        height: "350px",
                                        transform: "scale(0.82)",
                                        transformOrigin: "top center"
                                      }}
                                    >
                                      <iframe
                                        title="Editor Iframe Preview"
                                        srcDoc={editNodeHtmlContent}
                                        className="w-full h-full border-0 bg-white"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-[320px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 relative flex justify-center items-start select-none animate-fadeIn">
                                    <div 
                                      className="relative shrink-0 overflow-hidden shadow-sm rounded-xl border border-slate-200/50 mt-2"
                                      style={{
                                        width: "600px",
                                        height: "530px",
                                        transform: "scale(0.54)",
                                        transformOrigin: "top center"
                                      }}
                                    >
                                      <iframe
                                        title="Editor Iframe Preview"
                                        srcDoc={editNodeHtmlContent}
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
                                <Plus className="h-5 w-5 text-indigo-600 animate-pulse" />
                                <span>Adicionar HTML da Campanha</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2 animate-scaleIn">
                            <textarea
                              value={editNodeHtmlContent}
                              onChange={(e) => setEditNodeHtmlContent(e.target.value)}
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

                      {/* Leads por Status / Filas de Espera */}
                      {(() => {
                        const sidebarMetrics = getMetricsForNode(selectedNodeForConfig.id, typeof nodeMetricsData !== "undefined" ? nodeMetricsData : {}, flowPeriod, flowCustomStart, flowCustomEnd);
                        return (
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-2xs mt-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Leads nesta Etapa</h4>
                            <div className="flex flex-col gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => handleOpenQueueModal(selectedNodeForConfig, "Revisão", sidebarMetrics.revisao)}
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                              >
                                <span className="text-[9px] font-bold text-slate-450 uppercase">Em Revisão</span>
                                <span className="text-xs font-black text-slate-800">{sidebarMetrics.revisao} leads</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenQueueModal(selectedNodeForConfig, "Entregue", sidebarMetrics.entregue)}
                                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                              >
                                <span className="text-[9px] font-bold text-slate-450 uppercase">Entregue (Concluído)</span>
                                <span className="text-xs font-black text-slate-800">{sidebarMetrics.entregue} leads</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenQueueModal(selectedNodeForConfig, "Ignorado", sidebarMetrics.ignorado)}
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

                  {/* Delay Node parameters */}
                  {selectedNodeForConfig.type === "delay" && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Quantidade para Aguardar</label>
                        <input
                          type="number"
                          value={editNodeDelayValue}
                          onChange={(e) => setEditNodeDelayValue(Number(e.target.value))}
                          placeholder="Digite a quantidade..."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Unidade de Tempo</label>
                        <select
                          value={editNodeDelayUnit}
                          onChange={(e) => setEditNodeDelayUnit(e.target.value as any)}
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
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mt-1">Aguardar até um dia específico da semana</span>
                          <select
                            value={editNodeDelayWeekday}
                            onChange={(e) => setEditNodeDelayWeekday(e.target.value)}
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
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Aguardar até um horário específico</span>
                          <input
                            type="time"
                            value={editNodeDelayTime}
                            onChange={(e) => setEditNodeDelayTime(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-indigo-500 outline-none bg-white cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Leads por Etapa / Fila de Atraso */}
                      {(() => {
                        const delayMetrics = getMetricsForNode(selectedNodeForConfig.id, typeof nodeMetricsData !== "undefined" ? nodeMetricsData : {}, flowPeriod, flowCustomStart, flowCustomEnd);
                        const waitingCount = delayMetrics.espera || 0;
                        return (
                          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-2xs mt-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Leads nesta Etapa</h4>
                            <button
                              type="button"
                              onClick={() => handleOpenQueueModal(selectedNodeForConfig, "Aguardando", waitingCount)}
                              className="w-full flex flex-col items-start p-3 bg-white border border-slate-200 hover:border-indigo-350 hover:bg-indigo-50/5 rounded-xl transition-all text-left cursor-pointer shadow-3xs"
                            >
                              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Aguardando (Fila de Espera)
                              </span>
                              <span className="text-xs font-black text-slate-850 mt-1.5">{waitingCount} leads</span>
                            </button>
                          </div>
                        );
                      })()}

                    </div>
                  )}

                  {/* Split Node parameters */}
                  {selectedNodeForConfig.type === "split" && (
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
                            <p className="text-[10px] text-slate-450 mt-0.5 text-left">Leads que atenderem às regras irão para o ramo **Sim** (verde). Os demais irão para o ramo **Não** (vermelho).</p>
                          </div>

                          
{/* Rule builder items */}
<div className="space-y-3">
  {editSplitRules.map((rule, idx) => (
    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 relative">
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
        {rule.summary || `${rule.field} ${rule.operator} ${rule.value}`}
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
                        <div className="space-y-4 border-t border-slate-100 pt-4 animate-scaleIn">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Distribuição Aleatória</h4>
                            <p className="text-[10px] text-slate-450 mt-0.5">Defina a proporção de leads direcionados para cada caminho de forma randômica.</p>
                          </div>
                          
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-emerald-700">Ramo SIM (Caminho A): {editSplitRandomRatio}%</span>
                              <span className="text-slate-500">Ramo NÃO (Caminho B): {100 - editSplitRandomRatio}%</span>
                            </div>
                            
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editSplitRandomRatio}
                              onChange={(e) => setEditSplitRandomRatio(Number(e.target.value))}
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

                  {selectedNodeForConfig.type !== "email" && selectedNodeForConfig.type !== "delay" && selectedNodeForConfig.type !== "split" && (
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-500 text-center leading-relaxed">
                      Esta etapa ({selectedNodeForConfig.name}) está ativada no mockup e configurada por padrão.
                    </div>
                  )}

                  {/* Visualizar campanha button */}
                  {selectedNodeForConfig.type === "email" && (
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
                      Defina regras que removem automaticamente um aluno do fluxo de automação, independentemente da etapa em que ele se encontre no momento.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[10px] text-amber-800 leading-relaxed">
                    <strong>Importante:</strong> As regras de saída são avaliadas continuamente para cada contato. Se o aluno cancelar a inscrição na lista ou se o critério for atendido, a remoção ocorre na mesma hora.
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

            {/* Fixed footer for node configuration */}
            {activePanel === "node_config" && selectedNodeForConfig && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActivePanel("menu");
                    setSelectedNodeForConfig(null);
                  }}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNodeConfig}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/10 transition-colors cursor-pointer text-center"
                >
                  Salvar
                </button>
              </div>
            )}

          </aside>
        )}

      </div>

      {/* 7. INSERTION POPOVER (Floating menu upon clicking circular '+') */}
      {showInsertionPopover && insertionTarget && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowInsertionPopover(false); setInsertionTarget(null); }} />
          <div
            className="fixed bg-white border border-slate-202 rounded-2xl shadow-xl p-2.5 z-50 text-left min-w-[200px] animate-scaleIn animate-fadeIn"
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
                onClick={() => handleInsertNode('email')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span>Enviar E-mail</span>
              </button>
              
              <button
                onClick={() => handleInsertNode('delay')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Atraso (Delay)</span>
              </button>

              <button
                onClick={() => handleInsertNode('split')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
              >
                <Split className="h-3.5 w-3.5 text-purple-500" />
                <span>Divisão Condicional</span>
              </button>
                <button
                  onClick={() => handleInsertNode("goto")}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer"
                >
                  <GitCommit className="h-3.5 w-3.5 text-fuchsia-500" />
                  <span>Mover para</span>
                </button>

              <button
                onClick={() => handleInsertNode('update_contact')}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-655 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                <span>Atualizar Contato</span>
              </button>

              <button
                onClick={() => handleInsertNode('webhook')}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
            
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

            {/* Modal Body (Iframe with simulated envelope headers or mobile mockup device frame) */}
            <div className="flex-1 bg-slate-100 p-6 flex justify-center items-center overflow-auto">
              {previewDevice === "mobile" ? (
                /* Mobile Mockup Device Frame */
                <div className="w-[360px] h-[610px] border-[16px] border-slate-200 rounded-[44px] bg-slate-200 flex flex-col relative overflow-hidden shadow-2xl shrink-0 select-none animate-fadeIn">
                  {/* Speaker notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-slate-350 rounded-full z-20" />
                  {/* Dual camera lens/sensors */}
                  <div className="absolute top-2 right-12 flex gap-1 z-20">
                    <div className="w-1.5 h-1.5 bg-slate-350 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-350 rounded-full" />
                  </div>

                  {/* Status Bar simulation */}
                  <div className="h-6 bg-slate-200/50 flex items-center justify-between px-6 text-[8px] text-slate-500 font-bold shrink-0 pt-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-3.5 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center"><div className="w-full h-full bg-slate-500 rounded-2xs" /></div>
                    </div>
                  </div>

                  {/* Screen Content Wrapper */}
                  <div className="flex-1 rounded-[26px] overflow-hidden bg-white border border-slate-250 relative w-full h-full flex flex-col">
                    {/* Email Client Simulated Envelope Headers inside phone screen */}
                    <div className="bg-slate-50 border-b border-slate-150 p-4 space-y-1.5 text-[10px] select-text text-left shrink-0">
                      <div className="flex items-center gap-1 text-slate-700">
                        <span className="font-bold text-slate-400 w-12 shrink-0">De:</span>
                        <span className="font-semibold text-slate-800 truncate">{editNodeSenderName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700">
                        <span className="font-bold text-slate-400 w-12 shrink-0">Para:</span>
                        <span className="font-semibold text-indigo-650">aluno@exemplo.com.br</span>
                      </div>
                      <div className="flex items-start gap-1 text-slate-700 border-t border-slate-200/40 pt-1.5 mt-1">
                        <span className="font-bold text-slate-400 w-12 shrink-0 mt-0.5">Assunto:</span>
                        <span className="font-black text-slate-800 text-[11px] leading-tight flex-1 truncate">{editNodeSubject || "(Sem assunto)"}</span>
                      </div>
                    </div>

                    {/* Iframe content container */}
                    <div className="flex-1 bg-white relative">
                      <iframe
                        title="Expanded Iframe Preview"
                        srcDoc={editNodeHtmlContent}
                        className="w-full h-full border-0 bg-white"
                      />
                    </div>
                  </div>

                  {/* Bezel footer navigation pill bar with 4 indicators */}
                  <div className="h-10 flex items-center justify-around px-8 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                    <div className="w-5 h-5 rounded-full bg-slate-300/60" />
                  </div>
                </div>
              ) : (
                /* Desktop layout */
                <div className="bg-white shadow-xl transition-all duration-300 w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-200">
                  {/* Email Client Simulated Envelope Headers */}
                  <div className="bg-slate-50 border-b border-slate-150 p-4 space-y-2 text-xs select-text text-left shrink-0">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-bold text-slate-400 w-14 shrink-0">De:</span>
                      <span className="font-semibold text-slate-800">{editNodeSenderName}</span>
                      <span className="text-slate-400">&lt;{editNodeSenderEmail}&gt;</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="font-bold text-slate-400 w-14 shrink-0">Para:</span>
                      <span className="font-semibold text-indigo-650">aluno@exemplo.com.br</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-700 border-t border-slate-200/45 pt-2 mt-1">
                      <span className="font-bold text-slate-400 w-14 shrink-0 mt-0.5">Assunto:</span>
                      <span className="font-black text-slate-800 text-sm leading-tight flex-1">{editNodeSubject || "(Sem assunto)"}</span>
                    </div>
                    {editNodePreheader && (
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <span className="font-bold text-slate-400 w-14 shrink-0">Apoio:</span>
                        <span className="text-slate-500 italic flex-1">{editNodePreheader}</span>
                      </div>
                    )}
                  </div>

                  {/* Iframe content container */}
                  <div className="flex-1 bg-white relative">
                    <iframe
                      title="Expanded Iframe Preview"
                      srcDoc={editNodeHtmlContent}
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
      {showQueueModal && queueModalNode && (() => {
        const allLeads = queueLeads;
        const filteredLeads = allLeads.filter(lead => 
          lead.name.toLowerCase().includes(queueSearchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(queueSearchQuery.toLowerCase())
        );

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 select-none animate-fadeIn text-slate-800">
            <div className="bg-white rounded-3xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
              
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-indigo-500" />
                    <span>Leads na Fila: {queueModalStatusName}</span>
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">
                    Etapa: <strong className="text-slate-700">{queueModalNode.type === "email" ? (queueModalNode.config?.campaignName || "Enviar E-mail") : queueModalNode.name}</strong> • Total no período: {queueModalCount} leads
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
                          <th className="px-4 py-3">Lead / Contato</th>
                          <th className="px-4 py-3">Data de Entrada</th>
                          <th className="px-4 py-3">Tempo na Etapa</th>
                          <th className="px-4 py-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-105 text-xs">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 uppercase">
                                {lead.initials || lead.name.substring(0, 2).toUpperCase()}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 select-none animate-fadeIn text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Galeria de E-mails & Templates</span>
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
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
              {(() => {
                const filtered = galleryTemplates.filter((t: any) => {
                  const q = gallerySearchQuery.toLowerCase();
                  return (
                    !q ||
                    t.name?.toLowerCase().includes(q) ||
                    t.subject?.toLowerCase().includes(q) ||
                    t.folderName?.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return <div className="text-center text-sm text-slate-500 py-10">Nenhum template encontrado.</div>;
                }

                // Group by folderName
                const grouped = filtered.reduce((acc: any, tpl: any) => {
                  const fName = tpl.folderName || "Galeria Geral";
                  if (!acc[fName]) acc[fName] = [];
                  acc[fName].push(tpl);
                  return acc;
                }, {});

                // Sort keys so currentFlowName is always first!
                const keys = Object.keys(grouped).sort((a, b) => {
                  if (a === flow.name) return -1;
                  if (b === flow.name) return 1;
                  return a.localeCompare(b);
                });

                return keys.map((folderName: string) => {
                  const templates = grouped[folderName];
                  return (
                    <details key={folderName} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs" open={folderName === flow.name || gallerySearchQuery.length > 0}>
                      <summary className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 cursor-pointer select-none transition-colors">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-bold text-slate-800">{folderName}</span>
                          <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 rounded-full">{templates.length}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 bg-slate-50/20">
                        {templates.map((tpl: any) => (
                          <div
                            key={tpl.id}
                            className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 shadow-3xs hover:shadow-md transition-all flex flex-col justify-between group/card"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1.5">
                                <span className="uppercase text-slate-400">{tpl.status}</span>
                              </div>
                              <h4 className="font-extrabold text-slate-850 text-sm group-hover/card:text-indigo-600 transition-colors truncate">
                                {tpl.name}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                                Assunto: "{tpl.subject}"
                              </p>
                            </div>
                            
                            <div className="mt-3 mb-1 h-32 w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative group-hover/card:border-indigo-200 transition-colors">
                              {tpl.htmlContent ? (
                                <div className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none p-4 bg-white">
                                  <iframe
                                    srcDoc={tpl.htmlContent}
                                    title={tpl.name}
                                    className="w-full h-full border-none"
                                    sandbox="allow-same-origin"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                  <FileText className="h-6 w-6 mb-1 opacity-50" />
                                  <span className="text-[10px] font-medium">Sem prévia visual</span>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectTemplateFromGallery(tpl)}
                              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Usar este Template</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM MOVE LEADS */}
      {showMoveLeadsModal && moveLeadsNode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
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
              Existe(m) lead(s) aguardando na etapa <strong>{moveLeadsNode.name || "Aguardar Atraso"}</strong>. 
              Como vocêê deseja tratar estes leads ao movimentar esta etapa?
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
                  <span className="text-[10px] text-slate-400 mt-0.5">Os leads ignoram o tempo restante e avançam para a etapa sucessora atual.</span>
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
                  <span className="text-[10px] text-slate-400 mt-0.5">Os leads saem da automação imediatamente e não continuam no fluxo.</span>
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
                  setMoveLeadsNode(null);
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
      
        {/* MODAL: MANUAL ADD LEAD */}
        {showManualAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-scaleIn flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Gerenciar Leads no Fluxo</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Adicione ou remova contatos manualmente</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManualAddModal(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1 flex flex-col">
                <input 
                  type="text" 
                  placeholder="Pesquisar por email ou nome..."
                  value={manualSearchQuery}
                  onChange={(e) => setManualSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:border-indigo-500 outline-none mb-3"
                />
                <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
                  {manualContacts.filter(c => c.email.toLowerCase().includes(manualSearchQuery.toLowerCase()) || (c.first_name || "").toLowerCase().includes(manualSearchQuery.toLowerCase())).map(contact => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{contact.first_name || "Sem nome"}</p>
                        <p className="text-xs text-slate-500">{contact.email}</p>
                      </div>
                      <button 
                        onClick={() => handleAddLeadToFlow(contact.id)}
                        disabled={isAddingLead}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        Inserir no Fluxo
                      </button>
                    </div>
                  ))}
                  {manualContacts.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">Nenhum contato encontrado.</div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}


        {showActivationConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-202 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Play className="h-5 w-5 fill-emerald-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ativar Automação?</h3>
                <p className="text-[11px] text-slate-500 font-medium">Por favor, confirme se revisou todos os passos</p>
              </div>
            </div>
            
            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs leading-relaxed text-slate-655 select-none text-left">
              <p className="font-bold text-slate-700">Antes de prosseguir, certifique-se de que:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-medium text-slate-600">
                <li>Todos os templates de e-mail foram revisados e testados.</li>
                <li>Os tempos de espera (atrasos) entre as etapas estão corretos.</li>
                <li>As regras de segmentação e divisões condicionais estão configuradas.</li>
                <li>As configurações de reentrada e regras de saída foram definidas.</li>
              </ul>
              <p className="text-[10px] text-indigo-650 font-bold mt-2 pt-2 border-t border-slate-150">
                💡 Apenas novos leads que dispararem o gatilho pós-ativação serão capturados.
              </p>
            </div>

            <p className="text-xs text-slate-500 font-semibold text-left">
              Você analisou corretamente todo o fluxo e deseja realmente ativar o flow como está?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowActivationConfirmModal(false)}
                className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowActivationConfirmModal(false);
                  executeToggleFlowStatus("Ativo");
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
          const nodeName = config.event || "Gatilho Personalizado";
          
          let ruleText = "";
          if (config.rule === "Nome do Curso específico") {
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
          
          setNodes(prev => {
            const updated = [...prev];
            const triggerNodeIndex = updated.findIndex(n => n.type === "trigger" || n.id === "trigger");
            if (triggerNodeIndex !== -1) {
              updated[triggerNodeIndex] = {
                ...updated[triggerNodeIndex],
                name: nodeName,
                config: { triggerDescription: description }
              };
            }
            return updated;
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
             operator: config.rule,
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
             operator: config.rule,
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
