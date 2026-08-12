"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  GitBranch,
  Image,
  BarChart3,
  BookOpen,
  ChevronDown,
  Search,
  Calendar,
  Download,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Globe,
  Percent,
  DollarSign,
  Activity,
  FileText,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  LogOut,
  MessageSquare,
  ShieldCheck
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";
import { createClient } from "@/lib/supabase/client";

// ==========================================
// MOCK DATA ENGINE
// ==========================================

const MOCK_CAMPANHAS_LIST: Array<{
  id: string;
  name: string;
  sentDate: string;
  recipients: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubRate: number;
  spamRate: number;
  orders: number;
  revenue: number;
  status: string;
  origin?: string;
}> = [
  { id: "c-1", name: "Black Friday Antecipada 🚀", sentDate: "2026-07-20", recipients: 42500, deliveryRate: 99.4, openRate: 28.5, clickRate: 6.2, unsubRate: 0.15, spamRate: 0.04, orders: 1360, revenue: 12450.00, status: "Enviado", origin: "pontual" },
  { id: "c-2", name: "Lançamento do Novo Curso de React 💻", sentDate: "2026-07-15", recipients: 38000, deliveryRate: 99.1, openRate: 31.2, clickRate: 7.5, unsubRate: 0.22, spamRate: 0.06, orders: 1064, revenue: 9850.00, status: "Enviado", origin: "pontual" },
  { id: "c-3", name: "E-mail #1: Boas-vindas Onboarding 🎓", sentDate: "2026-07-12", recipients: 2450, deliveryRate: 99.8, openRate: 64.2, clickRate: 18.4, unsubRate: 0.05, spamRate: 0.01, orders: 320, revenue: 15450.00, status: "Enviado", origin: "automacao" },
  { id: "c-4", name: "Newsletter Semanal #42 - Novidades", sentDate: "2026-07-10", recipients: 15200, deliveryRate: 98.9, openRate: 22.4, clickRate: 3.1, unsubRate: 0.08, spamRate: 0.02, orders: 167, revenue: 1200.00, status: "Enviado", origin: "pontual" },
  { id: "c-5", name: "E-mail #1: Carrinho Abandonado (1h) 🛒", sentDate: "2026-07-08", recipients: 850, deliveryRate: 99.2, openRate: 52.8, clickRate: 22.1, unsubRate: 0.10, spamRate: 0.02, orders: 210, revenue: 11200.00, status: "Enviado", origin: "automacao" },
  { id: "c-6", name: "Desconto Especial: Programação Avançada", sentDate: "2026-07-05", recipients: 12000, deliveryRate: 99.5, openRate: 26.8, clickRate: 4.9, unsubRate: 0.18, spamRate: 0.03, orders: 240, revenue: 2900.00, status: "Enviado", origin: "pontual" },
  { id: "c-7", name: "Recuperação de Inativos - Realizzare Mail", sentDate: "2026-07-01", recipients: 8500, deliveryRate: 97.8, openRate: 18.2, clickRate: 2.5, unsubRate: 0.45, spamRate: 0.12, orders: 127, revenue: 1100.00, status: "Enviado", origin: "pontual" },
  { id: "c-8", name: "Campanha Institucional - Julho Verde", sentDate: "2026-07-28", recipients: 0, deliveryRate: 0, openRate: 0, clickRate: 0, unsubRate: 0, spamRate: 0, orders: 0, revenue: 0.00, status: "Agendado", origin: "pontual" },
  { id: "c-9", name: "Rascunho Campanha do Dia dos Pais", sentDate: "", recipients: 0, deliveryRate: 0, openRate: 0, clickRate: 0, unsubRate: 0, spamRate: 0, orders: 0, revenue: 0.00, status: "Rascunho", origin: "pontual" }
];

const MOCK_FLUXOS_LIST = [
  { id: "f-1", name: "Boas-vindas e Onboarding Geral 🎓", type: "Automação", trigger: "Novo Cadastro", entries: 2450, completionRate: 92.5, openRate: 64.2, clickRate: 18.4, revenue: 15450.00, status: "Ativo" },
  { id: "f-2", name: "Recuperação de Carrinho Abandonado 🛒", type: "Automação", trigger: "Checkout Abandonado", entries: 850, completionRate: 85.0, openRate: 52.8, clickRate: 22.1, revenue: 11200.00, status: "Ativo" },
  { id: "f-3", name: "Upsell de Certificado Programação", type: "Transacional", trigger: "Curso Concluído", entries: 620, completionRate: 98.2, openRate: 78.5, clickRate: 31.4, revenue: 6130.00, status: "Ativo" },
  { id: "f-4", name: "Reengajamento de Alunos Sumidos 💤", type: "Automação", trigger: "Inatividade > 30d", entries: 1200, completionRate: 45.2, openRate: 28.1, clickRate: 4.8, revenue: 3100.00, status: "Ativo" },
  { id: "f-5", name: "E-mail Transacional de Boas-vindas", type: "Transacional", trigger: "Matrícula Efetuada", entries: 3200, completionRate: 99.8, openRate: 88.2, clickRate: 5.6, revenue: 900.00, status: "Ativo" },
  { id: "f-6", name: "Rascunho Recomendações Semanais", type: "Automação", trigger: "Tag Adicionada", entries: 0, completionRate: 0, openRate: 0, clickRate: 0, revenue: 0.00, status: "Rascunho" }
];

const MOCK_BOTTLENECK_STEPS: Record<string, Array<{ name: string; count: number }>> = {
  "f-1": [
    { name: "Gatilho: Cadastro", count: 2450 },
    { name: "E-mail 01: Boas-vindas", count: 2450 },
    { name: "Aguardar 2 dias", count: 2280 },
    { name: "E-mail 02: Primeiros Passos", count: 2150 },
    { name: "Aguardar 3 dias", count: 1980 },
    { name: "E-mail 03: Oferta Especial", count: 1840 },
    { name: "Fluxo Concluído", count: 1720 }
  ],
  "f-2": [
    { name: "Gatilho: Carrinho", count: 850 },
    { name: "E-mail 01: Lembrativo (1h)", count: 850 },
    { name: "Aguardar 1 dia", count: 480 },
    { name: "E-mail 02: Desconto (24h)", count: 420 },
    { name: "Fluxo Concluído", count: 320 }
  ],
  "f-3": [
    { name: "Gatilho: Conclusão", count: 620 },
    { name: "E-mail 01: Parabéns!", count: 620 },
    { name: "E-mail 02: Oferta Certificado", count: 610 },
    { name: "Fluxo Concluído", count: 590 }
  ]
};

const MOCK_DOMINIOS = [
  { id: "d-1", domain: "realizzarecursos.com.br", spf: true, dkim: true, dmarc: true, status: "Saudável", health: "Excelente" },
  { id: "d-2", domain: "ead.realizzare.com.br", spf: true, dkim: true, dmarc: false, status: "Configuração Pendente", health: "Em Risco" },
  { id: "d-3", domain: "marketing.realizzare.com.br", spf: true, dkim: true, dmarc: true, status: "Saudável", health: "Excelente" }
];

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("visao-geral");
  const [period, setPeriod] = useState<string>("30");
  const [comparison, setComparison] = useState<string>("anterior");
  const [channel, setChannel] = useState<string>("all");

  // Custom period states
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [startDateInput, setStartDateInput] = useState("2026-07-01");
  const [endDateInput, setEndDateInput] = useState("2026-07-26");
  const [appliedStartDate, setAppliedStartDate] = useState("2026-07-01");
  const [appliedEndDate, setAppliedEndDate] = useState("2026-07-26");

  // Tab specific filters
  const [campanhaOrigem, setCampanhaOrigem] = useState<string>("all");
  const [campanhaStatus, setCampanhaStatus] = useState<string>("all");
  const [fluxoTipo, setFluxoTipo] = useState<string>("all");
  const [fluxoStatus, setFluxoStatus] = useState<string>("all");
  const [selectedFlowBottleneck, setSelectedFlowBottleneck] = useState<string>("f-1");

  // Dropdowns refs for outside clicks
  const dropdownRefPeriod = useRef<HTMLDivElement>(null);
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

  // Export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportSections, setExportSections] = useState({
    visaoGeral: true,
    campanhas: true,
    fluxos: true,
    entregabilidade: true,
    contatosCrescimento: true
  });
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv">("pdf");
  const [exportPeriodStart, setExportPeriodStart] = useState("2026-07-01");
  const [exportPeriodEnd, setExportPeriodEnd] = useState("2026-07-26");
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRefPeriod.current && !dropdownRefPeriod.current.contains(e.target as Node)) {
        setIsPeriodMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Sync date inputs if period changes
  useEffect(() => {
    if (period !== "custom") {
      const today = new Date();
      let start = new Date();
      if (period === "7") {
        start.setDate(today.getDate() - 7);
      } else if (period === "30") {
        start.setDate(today.getDate() - 30);
      } else if (period === "90") {
        start.setDate(today.getDate() - 90);
      } else if (period === "ytd") {
        start = new Date(today.getFullYear(), 0, 1);
      } else if (period === "last_year") {
        start = new Date(today.getFullYear() - 1, 0, 1);
        today.setFullYear(today.getFullYear() - 1, 11, 31);
      } else {
        start = new Date(2025, 0, 1); // all period
      }
      const startStr = start.toISOString().split("T")[0];
      const endStr = today.toISOString().split("T")[0];
      setAppliedStartDate(startStr);
      setAppliedEndDate(endStr);
      setStartDateInput(startStr);
      setEndDateInput(endStr);
      setExportPeriodStart(startStr);
      setExportPeriodEnd(endStr);
    }
  }, [period]);

  // Dynamic multipliers based on the selected period
  const scaleFactor = useMemo(() => {
    switch (period) {
      case "7": return 0.25;
      case "90": return 2.8;
      case "ytd": return 6.5;
      case "last_year": return 8.0;
      case "all": return 15.0;
      case "custom":
        const diffTime = Math.abs(new Date(appliedEndDate).getTime() - new Date(appliedStartDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        return (diffDays / 30);
      case "30":
      default: return 1.0;
    }
  }, [period, appliedStartDate, appliedEndDate]);

  // Channel multiplier
  const channelMultiplier = useMemo(() => {
    if (channel === "all") return 1.0;
    if (channel === "email") return 0.85; // 85% is email
    if (channel === "whatsapp") return 0.12; // 12% is whatsapp
    return 0.03; // SMS
  }, [channel]);

  // Total summary calculation
  const stats = useMemo(() => {
    const scale = scaleFactor * channelMultiplier;
    const isCompareActive = comparison !== "none";

    return {
      revenueTotal: 45280.00 * scale,
      revenueChange: isCompareActive ? "+18.4%" : null,
      revenueCampanhas: 12450.00 * scale,
      revenueFluxos: 32830.00 * scale,
      emailsSent: Math.round(124850 * scale),
      emailsSentChange: isCompareActive ? "+12.2%" : null,
      avgOpenRate: channel === "whatsapp" ? 88.5 : 24.5 + (channel === "sms" ? -10 : 0),
      avgOpenRateChange: isCompareActive ? "+2.1%" : null,
      avgClickRate: channel === "whatsapp" ? 22.4 : 4.8 + (channel === "sms" ? -3.5 : 0),
      avgClickRateChange: isCompareActive ? "+0.6%" : null,
      newContacts: Math.round(1280 * scaleFactor), // independent of channel
      newContactsChange: isCompareActive ? "+8.5%" : null,
      unsubscribed: Math.round(85 * scaleFactor),
      growthRate: "+14.8%"
    };
  }, [scaleFactor, channelMultiplier, comparison, channel]);

  // Generate chart data dynamically based on period
  const revenueChartData = useMemo(() => {
    const pointsCount = period === "7" ? 7 : period === "90" ? 12 : 10;
    const data = [];
    const baseRevenueCamp = stats.revenueCampanhas / pointsCount;
    const baseRevenueFluxos = stats.revenueFluxos / pointsCount;

    for (let i = 1; i <= pointsCount; i++) {
      let label = `Ponto ${i}`;
      if (period === "7") {
        const d = new Date(appliedStartDate);
        d.setDate(d.getDate() + i - 1);
        label = d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
      } else if (period === "30") {
        label = `Dia ${i * 3}`;
      } else if (period === "90") {
        label = `Semana ${i}`;
      } else {
        label = `Mês ${i}`;
      }

      // Add variation waves
      const waveCamp = baseRevenueCamp * (1 + Math.sin(i * 0.8) * 0.25);
      const waveFluxos = baseRevenueFluxos * (1 + Math.cos(i * 0.9) * 0.15);

      data.push({
        name: label,
        Campanhas: parseFloat(waveCamp.toFixed(2)),
        Fluxos: parseFloat(waveFluxos.toFixed(2)),
        Total: parseFloat((waveCamp + waveFluxos).toFixed(2))
      });
    }
    return data;
  }, [stats, period, appliedStartDate]);

  // Delivery trend chart data
  const deliverabilityTrendData = useMemo(() => {
    const points = 8;
    const data = [];
    for (let i = 1; i <= points; i++) {
      const delivery = 99.0 + Math.sin(i * 0.5) * 0.4;
      const bounce = 0.8 + Math.cos(i * 0.4) * 0.2;
      const spam = 0.04 + Math.sin(i * 1.2) * 0.02;
      data.push({
        name: `T${i}`,
        "Taxa de Entrega": parseFloat(delivery.toFixed(2)),
        "Taxa de Rejeição": parseFloat(bounce.toFixed(2)),
        "Taxa de Spam": parseFloat(spam.toFixed(2))
      });
    }
    return data;
  }, []);

  // Growth trend chart data
  const growthTrendData = useMemo(() => {
    const points = 8;
    const data = [];
    const baseNew = stats.newContacts / points;
    const baseUnsub = stats.unsubscribed / points;
    let accum = 22450 * (scaleFactor * 0.8 || 1); // starting scale

    for (let i = 1; i <= points; i++) {
      const added = Math.round(baseNew * (1 + Math.sin(i * 0.7) * 0.3));
      const removed = Math.round(baseUnsub * (1 + Math.cos(i * 0.8) * 0.2));
      accum += (added - removed);
      data.push({
        name: `P${i}`,
        Inscrições: added,
        Descadastros: removed,
        "Total Acumulado": Math.round(accum)
      });
    }
    return data;
  }, [stats, scaleFactor]);

  // Funnel chart data
  const funnelData = useMemo(() => {
    const sent = stats.emailsSent;
    const delivered = Math.round(sent * 0.992);
    const opened = Math.round(delivered * (stats.avgOpenRate / 100));
    const clicked = Math.round(opened * (stats.avgClickRate / (stats.avgOpenRate || 1)));
    const enrolled = Math.round(clicked * 0.18); // 18% matriculates
    const purchased = Math.round(enrolled * 0.35); // 35% purchases certificate

    return [
      { step: "Enviados", count: sent, pct: 100, pctPrev: 100 },
      { step: "Entregues", count: delivered, pct: Math.round((delivered / (sent || 1)) * 100), pctPrev: Math.round((delivered / (sent || 1)) * 100) },
      { step: "Abertos", count: opened, pct: Math.round((opened / (sent || 1)) * 100), pctPrev: Math.round((opened / (delivered || 1)) * 100) },
      { step: "Clicados", count: clicked, pct: Math.round((clicked / (sent || 1)) * 100), pctPrev: Math.round((clicked / (opened || 1)) * 100) },
      { step: "Matrículas", count: enrolled, pct: Math.round((enrolled / (sent || 1)) * 100), pctPrev: Math.round((enrolled / (clicked || 1)) * 100) },
      { step: "Compras", count: purchased, pct: Math.round((purchased / (sent || 1)) * 100), pctPrev: Math.round((purchased / (enrolled || 1)) * 100) }
    ];
  }, [stats]);

  // Engagement segments data
  const engagementData = [
    { name: "Altamente Engajados", value: 38, color: "#4f46e5" },
    { name: "Moderadamente Engajados", value: 42, color: "#6366f1" },
    { name: "Pouco Engajados", value: 15, color: "#a5b4fc" },
    { name: "Inativos", value: 5, color: "#cbd5e1" }
  ];

  // Contact source data
  const sourceData = [
    { name: "Matrícula em Curso", value: 55, color: "#4f46e5" },
    { name: "Formulário do Site", value: 20, color: "#10b981" },
    { name: "Importação Manual", value: 10, color: "#f59e0b" },
    { name: "Compra de Certificado", value: 12, color: "#8b5cf6" },
    { name: "Outros", value: 3, color: "#94a3b8" }
  ];

  // Visibility toggle for chart lines
  const [showCampanhasCurve, setShowCampanhasCurve] = useState(true);
  const [showFluxosCurve, setShowFluxosCurve] = useState(true);

  // Filtered Campanhas list
  const filteredCampanhas = useMemo(() => {
    return MOCK_CAMPANHAS_LIST.filter(c => {
      if (campanhaStatus !== "all" && c.status !== campanhaStatus) return false;
      if (campanhaOrigem !== "all") {
        const isFlow = c.origin === "automacao" || c.id.includes("flow") || c.name.toLowerCase().includes("boas-vindas") || c.name.toLowerCase().includes("carrinho") || c.name.toLowerCase().includes("engajamento");
        if (campanhaOrigem === "pontual" && isFlow) return false;
        if (campanhaOrigem === "automacao" && !isFlow) return false;
      }
      return true;
    }).map(c => ({
      ...c,
      recipients: Math.round(c.recipients * scaleFactor * channelMultiplier),
      orders: Math.round(c.orders * scaleFactor * channelMultiplier),
      revenue: c.revenue * scaleFactor * channelMultiplier,
      rpr: (c.revenue * scaleFactor * channelMultiplier) / (Math.max(1, c.recipients * scaleFactor * channelMultiplier))
    }));
  }, [campanhaStatus, campanhaOrigem, scaleFactor, channelMultiplier]);

  // Filtered Fluxos list
  const filteredFluxos = useMemo(() => {
    return MOCK_FLUXOS_LIST.filter(f => {
      if (fluxoTipo !== "all" && f.type !== fluxoTipo) return false;
      if (fluxoStatus !== "all" && f.status !== fluxoStatus) return false;
      return true;
    }).map(f => ({
      ...f,
      entries: Math.round(f.entries * scaleFactor * channelMultiplier),
      revenue: f.revenue * scaleFactor * channelMultiplier,
      rpr: (f.revenue * scaleFactor * channelMultiplier) / (Math.max(1, f.entries * scaleFactor * channelMultiplier))
    }));
  }, [fluxoTipo, fluxoStatus, scaleFactor, channelMultiplier]);

  // Flow Bottleneck Steps
  const [actualFlows, setActualFlows] = useState<any[]>([]);
  const [bottleneckSteps, setBottleneckSteps] = useState<any[]>([]);

  useEffect(() => {
    const fetchFlows = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('flows').select('id, name').eq('status', 'active');
      if (data && data.length > 0) {
        setActualFlows(data);
        if (!selectedFlowBottleneck || selectedFlowBottleneck.startsWith('f-')) {
          setSelectedFlowBottleneck(data[0].id);
        }
      }
    };
    fetchFlows();
  }, []);

  useEffect(() => {
    const fetchBottlenecks = async () => {
      const supabase = createClient();
      if (!selectedFlowBottleneck || selectedFlowBottleneck.startsWith('f-')) {
        // use mock if it's still a mock id
        const raw = MOCK_BOTTLENECK_STEPS[selectedFlowBottleneck] || MOCK_BOTTLENECK_STEPS["f-1"];
        setBottleneckSteps(raw.map((step: any) => ({ ...step, count: Math.round(step.count * scaleFactor) })));
        return;
      }
      
      const { data } = await supabase
        .from('flow_node_stats_view')
        .select('*')
        .eq('flow_id', selectedFlowBottleneck);
        
      if (data && data.length > 0) {
        setBottleneckSteps(data.map((d: any) => ({
          name: `Nó ${d.node_id}`,
          count: parseInt(d.entered_count) || 0
        })));
      } else {
        setBottleneckSteps([]);
      }
    };
    fetchBottlenecks();
  }, [selectedFlowBottleneck, scaleFactor]);

  // Apply custom dates handler
  const handleApplyCustomDates = () => {
    setAppliedStartDate(startDateInput);
    setAppliedEndDate(endDateInput);
    setPeriod("custom");
    setIsPeriodMenuOpen(false);
    setExportPeriodStart(startDateInput);
    setExportPeriodEnd(endDateInput);
  };

  // Mock Export Execution
  const handleStartExport = () => {
    setIsExporting(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsExporting(false);
      setIsExportModalOpen(false);

      // Save export details to local storage
      const newExport = {
        id: `exp-${Date.now()}`,
        period_start: exportPeriodStart,
        period_end: exportPeriodEnd,
        sections: Object.keys(exportSections).filter(k => exportSections[k as keyof typeof exportSections]),
        format: exportFormat,
        status: "ready",
        file_url: exportFormat === "pdf" ? "/mock_report_stakeholders_2026.pdf" : "/mock_report_data_2026.csv",
        created_at: new Date().toISOString()
      };

      const storedExports = localStorage.getItem("realizzare_report_exports");
      let list = [];
      if (storedExports) {
        try { list = JSON.parse(storedExports); } catch (e) {}
      }
      list.unshift(newExport);
      localStorage.setItem("realizzare_report_exports", JSON.stringify(list));

      // Trigger success toast
      setToastMessage(`Relatório gerado em ${exportFormat.toUpperCase()}!`);
      setTimeout(() => setToastMessage(null), 8000);
    }, 2000);
  };

  const getPeriodLabel = () => {
    if (period === "7") return "Últimos 7 dias";
    if (period === "30") return "Últimos 30 dias";
    if (period === "90") return "Últimos 90 dias";
    if (period === "ytd") return "Acumulado do ano";
    if (period === "last_year") return "Ano passado";
    if (period === "all") return "Todo o período";
    return `Personalizado (${new Date(appliedStartDate).toLocaleDateString("pt-BR")} - ${new Date(appliedEndDate).toLocaleDateString("pt-BR")})`;
  };

  return (
    <div className="flex flex-col space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slideUp border border-slate-800 max-w-sm">
          <div className="p-1 bg-emerald-500 rounded-full">
            <Check className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-bold block">{toastMessage}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">O arquivo está pronto para download.</span>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Iniciando download do arquivo mockado de relatórios!");
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow shadow-emerald-700/50 flex items-center gap-1 cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>Baixar</span>
          </a>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans tracking-tight">Relatórios Analíticos</h1>
          <p className="text-xs text-slate-500 mt-1">Acompanhe métricas executivas, taxas de conversão de campanhas, automações e crescimento.</p>
        </div>

        {/* Global Export CTA */}
        <button
          onClick={() => {
            setExportPeriodStart(appliedStartDate);
            setExportPeriodEnd(appliedEndDate);
            setIsExportModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Exportar Relatório</span>
        </button>
      </div>

      {/* FIXED FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider pr-1">
          <Filter className="h-4 w-4 text-slate-500" />
          <span>Filtros:</span>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative md:w-56" ref={dropdownRefPeriod}>
          <button
            type="button"
            onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs flex justify-between items-center cursor-pointer shadow-sm hover:border-slate-300 font-medium text-left min-h-[38px]"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>{getPeriodLabel()}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {isPeriodMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-[60] p-3 space-y-3 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2">Períodos Predefinidos</span>
                <div className="grid grid-cols-1 gap-0.5">
                  <button
                    onClick={() => { setPeriod("7"); setIsPeriodMenuOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${period === "7" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    Últimos 7 dias
                  </button>
                  <button
                    onClick={() => { setPeriod("30"); setIsPeriodMenuOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${period === "30" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    Últimos 30 dias
                  </button>
                  <button
                    onClick={() => { setPeriod("90"); setIsPeriodMenuOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${period === "90" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    Últimos 90 dias
                  </button>
                  <button
                    onClick={() => { setPeriod("ytd"); setIsPeriodMenuOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${period === "ytd" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    Acumulado do ano
                  </button>
                  <button
                    onClick={() => { setPeriod("last_year"); setIsPeriodMenuOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${period === "last_year" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    Ano passado
                  </button>
                  <button
                    onClick={() => { setPeriod("all"); setIsPeriodMenuOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${period === "all" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    Todo o período
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 block">Período Personalizado</span>
                <div className="space-y-1.5 px-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Início</label>
                    <input
                      type="date"
                      value={startDateInput}
                      onChange={(e) => setStartDateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Fim</label>
                    <input
                      type="date"
                      value={endDateInput}
                      onChange={(e) => setEndDateInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPeriodMenuOpen(false)}
                      className="px-2 py-1 border border-slate-200 hover:bg-slate-50 text-[10px] rounded-lg font-bold text-slate-500 flex-1 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCustomDates}
                      className="px-2 py-1 bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] rounded-lg font-bold flex-1 cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparar com Selector */}
        <div className="flex-1 md:max-w-[200px]">
          <select
            value={comparison}
            onChange={(e) => setComparison(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-medium min-h-[38px] cursor-pointer shadow-sm hover:border-slate-300"
          >
            <option value="anterior">vs. Período Anterior</option>
            <option value="last_year">vs. Mesmo período (ano passado)</option>
            <option value="none">Sem Comparação</option>
          </select>
        </div>

        {/* Canal Selector */}
        <div className="flex-1 md:max-w-[200px]">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 font-medium min-h-[38px] cursor-pointer shadow-sm hover:border-slate-300"
          >
            <option value="all">Todos os Canais</option>
            <option value="email">E-mail</option>
            <option value="sms">Mensagem de Texto (SMS)</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto scrollbar-none">
          {[
            { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
            { id: "campanhas", label: "Campanhas", icon: Mail },
            { id: "fluxos", label: "Fluxos", icon: GitBranch },
            { id: "entregabilidade", label: "Entregabilidade", icon: Globe },
            { id: "contatos", label: "Contatos e Crescimento", icon: Users },
            { id: "descadastros", label: "Pesquisa de Descadastro", icon: LogOut }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 pb-3 px-1 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? "border-indigo-650 text-indigo-650"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ==========================================
          TAB CONTENT 1: VISÃO GERAL
          ========================================== */}
      {activeTab === "visao-geral" && (
        <div className="space-y-6">
          {/* Executive KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Receita Atribuída</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl md:text-2xl font-black text-slate-850">
                  {stats.revenueTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              {stats.revenueChange && (
                <span className="text-[10px] text-emerald-650 font-bold bg-emerald-50/50 px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="h-3 w-3" />
                  {stats.revenueChange} vs anterior
                </span>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Total de Envios</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl md:text-2xl font-black text-slate-850">
                  {stats.emailsSent.toLocaleString("pt-BR")}
                </span>
              </div>
              {stats.emailsSentChange && (
                <span className="text-[10px] text-emerald-650 font-bold bg-emerald-50/50 px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="h-3 w-3" />
                  {stats.emailsSentChange} vs anterior
                </span>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Taxa de Abertura</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl md:text-2xl font-black text-slate-850">
                  {stats.avgOpenRate.toFixed(1)}%
                </span>
              </div>
              {stats.avgOpenRateChange && (
                <span className="text-[10px] text-emerald-650 font-bold bg-emerald-50/50 px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="h-3 w-3" />
                  {stats.avgOpenRateChange} vs anterior
                </span>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Taxa de Clique</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl md:text-2xl font-black text-slate-850">
                  {stats.avgClickRate.toFixed(1)}%
                </span>
              </div>
              {stats.avgClickRateChange && (
                <span className="text-[10px] text-emerald-650 font-bold bg-emerald-50/50 px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="h-3 w-3" />
                  {stats.avgClickRateChange} vs anterior
                </span>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm col-span-2 md:col-span-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Novos Contatos</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-xl md:text-2xl font-black text-slate-850">
                  +{stats.newContacts.toLocaleString("pt-BR")}
                </span>
              </div>
              {stats.newContactsChange && (
                <span className="text-[10px] text-emerald-650 font-bold bg-emerald-50/50 px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-0.5 mt-1.5">
                  <TrendingUp className="h-3 w-3" />
                  {stats.newContactsChange} vs anterior
                </span>
              )}
            </div>
          </div>

          {/* MAIN CHART - REVENUE OVER TIME */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-sans">Faturamento ao Longo do Tempo</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Visão diária da receita atribuída a campanhas pontuais e fluxos automáticos.</p>
              </div>

              {/* Legends with checkboxes to hide curves */}
              <div className="flex items-center gap-4 text-[11px] font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-650">
                  <input
                    type="checkbox"
                    checked={showCampanhasCurve}
                    onChange={() => setShowCampanhasCurve(!showCampanhasCurve)}
                    className="rounded border-slate-355 text-indigo-600 h-3.5 w-3.5 focus:ring-0 cursor-pointer"
                  />
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                  <span>Campanhas</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-650">
                  <input
                    type="checkbox"
                    checked={showFluxosCurve}
                    onChange={() => setShowFluxosCurve(!showFluxosCurve)}
                    className="rounded border-slate-355 text-emerald-500 h-3.5 w-3.5 focus:ring-0 cursor-pointer"
                  />
                  <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span>Fluxos</span>
                </label>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorCampanhas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFluxos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                    itemStyle={{ fontSize: "11px" }}
                    labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}
                    formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`]}
                  />
                  {showCampanhasCurve && (
                    <Area type="monotone" dataKey="Campanhas" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCampanhas)" />
                  )}
                  {showFluxosCurve && (
                    <Area type="monotone" dataKey="Fluxos" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFluxos)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHANNEL PERFORMANCE CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">Desempenho por Canal de Origem</h2>
            <p className="text-[11px] text-slate-400 mb-4 font-medium">Comparação executiva e eficiência real entre campanhas pontuais e fluxos automáticos.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 font-bold uppercase text-[10px]">
                    <th className="py-2.5 font-bold">Canal</th>
                    <th className="py-2.5 font-bold text-right">Faturamento</th>
                    <th className="py-2.5 font-bold text-right">Destinatários</th>
                    <th className="py-2.5 font-bold text-right">Receita por Lead (RPR)</th>
                    <th className="py-2.5 font-bold text-right">Taxa de Clique</th>
                    <th className="py-2.5 font-bold text-right">Conversão em Pedidos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">Campanhas Pontuais</td>
                    <td className="py-3 text-right">{stats.revenueCampanhas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="py-3 text-right">{Math.round(stats.emailsSent * 0.7).toLocaleString("pt-BR")}</td>
                    <td className="py-3 text-right">{(stats.revenueCampanhas / Math.max(1, stats.emailsSent * 0.7)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="py-3 text-right">3.8%</td>
                    <td className="py-3 text-right">1.2%</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 font-semibold text-slate-800">Fluxos de Automação</td>
                    <td className="py-3 text-right">{stats.revenueFluxos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="py-3 text-right">{Math.round(stats.emailsSent * 0.3).toLocaleString("pt-BR")}</td>
                    <td className="py-3 text-right">{(stats.revenueFluxos / Math.max(1, stats.emailsSent * 0.3)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="py-3 text-right">7.2%</td>
                    <td className="py-3 text-right">4.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Smart Insight Banner */}
            <div className="mt-5 p-3.5 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center gap-3 text-left">
              <div className="p-1.5 bg-indigo-650 text-white rounded-xl shadow-sm shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <p className="text-xs text-indigo-850 leading-relaxed font-semibold">
                Seus fluxos geram <span className="font-extrabold text-indigo-650">{((stats.revenueFluxos / (stats.emailsSent * 0.3 || 1)) / ((stats.revenueCampanhas / (stats.emailsSent * 0.7 || 1)) || 1)).toFixed(1)} vezes</span> mais receita por destinatário que campanhas pontuais neste período.
              </p>
            </div>
          </div>

          {/* TOP 5 CAMPAIGNS & TOP 5 FLOWS SIDE BY SIDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Campaigns */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">Top 5 Campanhas</h2>
                  <button onClick={() => setActiveTab("campanhas")} className="text-[11px] text-indigo-655 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer">
                    <span>Ver todas</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 font-medium">
                  {MOCK_CAMPANHAS_LIST.slice(0, 5).map((c, idx) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg px-1.5 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 w-4">#{idx + 1}</span>
                        <span className="text-slate-700 font-bold max-w-[180px] md:max-w-xs truncate text-left">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-800">{(c.revenue * scaleFactor * channelMultiplier).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{(c.openRate).toFixed(1)}% abertura</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 5 Flows */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">Top 5 Fluxos</h2>
                  <button onClick={() => setActiveTab("fluxos")} className="text-[11px] text-indigo-655 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer">
                    <span>Ver todos</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 font-medium">
                  {MOCK_FLUXOS_LIST.slice(0, 5).map((f, idx) => (
                    <div key={f.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 rounded-lg px-1.5 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 w-4">#{idx + 1}</span>
                        <span className="text-slate-700 font-bold max-w-[180px] md:max-w-xs truncate text-left">{f.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-800">{(f.revenue * scaleFactor * channelMultiplier).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{(f.openRate).toFixed(1)}% abertura</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ENGAGEMENT FUNNEL */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5 font-sans">Funil de Engajamento</h2>
            <p className="text-[11px] text-slate-400 mb-6">Acompanhe a conversão e perda de volume entre as etapas de envios até a compra final.</p>

            <div className="space-y-4 max-w-2xl mx-auto py-2">
              {funnelData.map((item, idx) => {
                const colors = ["bg-indigo-600", "bg-indigo-500", "bg-indigo-400", "bg-indigo-300", "bg-indigo-250", "bg-indigo-200"];
                const col = colors[idx];
                return (
                  <div key={item.step} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 w-24 text-left truncate">{item.step}</span>
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl h-9 relative overflow-hidden flex items-center px-4">
                      <div className={`absolute top-0 bottom-0 left-0 ${col} opacity-15`} style={{ width: `${item.pct}%` }} />
                      <div className="flex justify-between w-full z-10 text-xs">
                        <span className="font-bold text-slate-700">{item.count.toLocaleString("pt-BR")}</span>
                        <div className="space-x-1.5">
                          <span className="text-[10px] text-slate-400">Total: {item.pct}%</span>
                          {idx > 0 && (
                            <span className="text-[10px] font-black text-indigo-750">Queda: -{(100 - item.pctPrev)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT 2: CAMPANHAS
          ========================================== */}
      {activeTab === "campanhas" && (
        <div className="space-y-6">
          {/* Specific Filters Row */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <span className="text-[11px] font-black uppercase text-slate-450 tracking-wider">Filtro de Campanhas</span>
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={campanhaOrigem}
                onChange={(e) => setCampanhaOrigem(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-750 rounded-lg p-2 text-xs focus:outline-none min-w-[180px] cursor-pointer font-medium"
              >
                <option value="all">Todas as Origens</option>
                <option value="pontual">Campanhas Pontuais</option>
                <option value="automacao">Campanhas Automatizadas (Flows)</option>
              </select>

              <select
                value={campanhaStatus}
                onChange={(e) => setCampanhaStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-750 rounded-lg p-2 text-xs focus:outline-none min-w-[150px] cursor-pointer font-medium"
              >
                <option value="all">Todos os Status</option>
                <option value="Enviado">Enviado</option>
                <option value="Agendado">Agendado</option>
                <option value="Rascunho">Rascunho</option>
              </select>
            </div>
          </div>

          {/* Campanhas KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Campanhas Enviadas</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {filteredCampanhas.filter(c => c.status === "Enviado").length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Abertura Média</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">25.5%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Clique Médio</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">4.9%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Receita Total</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {stats.revenueCampanhas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm col-span-2 md:col-span-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Receita p/ Campanha</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {(stats.revenueCampanhas / Math.max(1, filteredCampanhas.filter(c => c.status === "Enviado").length)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          </div>

          {/* Campanhas Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">Tabela Detalhada de Campanhas</h2>
            <p className="text-[11px] text-slate-400 mb-4">Lista consolidada de envios em massa com taxas e faturamento associado.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 font-bold uppercase text-[10px]">
                    <th className="py-2.5 font-bold">Nome da Campanha</th>
                    <th className="py-2.5 font-bold text-center">Tipo / Origem</th>
                    <th className="py-2.5 font-bold">Envio</th>
                    <th className="py-2.5 font-bold text-right">Destinatários</th>
                    <th className="py-2.5 font-bold text-right">Entrega</th>
                    <th className="py-2.5 font-bold text-right">Abertura</th>
                    <th className="py-2.5 font-bold text-right">Clique</th>
                    <th className="py-2.5 font-bold text-right">Faturamento</th>
                    <th className="py-2.5 font-bold text-right">RPR</th>
                    <th className="py-2.5 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                  {filteredCampanhas.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 max-w-[200px] truncate text-left">
                        <span className="font-bold text-slate-800 block">{c.name}</span>
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                          c.status === "Enviado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          c.status === "Agendado" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                          "bg-slate-105 text-slate-550 border border-slate-200"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.origin === "automacao" || c.id.includes("flow") || c.name.toLowerCase().includes("boas-vindas") || c.name.toLowerCase().includes("carrinho") || c.name.toLowerCase().includes("engajamento")
                            ? "bg-indigo-50 border border-indigo-150 text-indigo-700"
                            : "bg-purple-50 border border-purple-150 text-purple-700"
                        }`}>
                          {c.origin === "automacao" || c.id.includes("flow") || c.name.toLowerCase().includes("boas-vindas") || c.name.toLowerCase().includes("carrinho") || c.name.toLowerCase().includes("engajamento")
                            ? "Campanha Automatizada (Flow)"
                            : "Campanha Pontual"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-left">{c.sentDate ? new Date(c.sentDate).toLocaleDateString("pt-BR") : "-"}</td>
                      <td className="py-3 text-right">{c.recipients.toLocaleString("pt-BR")}</td>
                      <td className="py-3 text-right">{c.deliveryRate ? `${c.deliveryRate}%` : "-"}</td>
                      <td className="py-3 text-right">{c.openRate ? `${c.openRate}%` : "-"}</td>
                      <td className="py-3 text-right">{c.clickRate ? `${c.clickRate}%` : "-"}</td>
                      <td className="py-3 text-right font-semibold text-slate-850">{c.revenue ? c.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}</td>
                      <td className="py-3 text-right">{c.rpr ? c.rpr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/campaigns`)}
                          title="Ver detalhes da campanha"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico Comparativo Abertura e Clique */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5 font-sans">Comparativo de Taxa de Abertura e Clique</h2>
            <p className="text-[11px] text-slate-400 mb-6">Mapeamento visual do engajamento em porcentagem de cada campanha enviada.</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCampanhas.filter(c => c.status === "Enviado")} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="openRate" name="Taxa de Abertura" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="clickRate" name="Taxa de Clique" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT 3: FLUXOS (FLOWS)
          ========================================== */}
      {activeTab === "fluxos" && (
        <div className="space-y-6">
          {/* Specific Filters Row */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <span className="text-[11px] font-black uppercase text-slate-455 tracking-wider">Filtro de Automações</span>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={fluxoTipo}
                onChange={(e) => setFluxoTipo(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-750 rounded-lg p-2 text-xs focus:outline-none min-w-[130px] cursor-pointer"
              >
                <option value="all">Todos os Tipos</option>
                <option value="Automação">Automação</option>
                <option value="Transacional">Transacional</option>
              </select>
              <select
                value={fluxoStatus}
                onChange={(e) => setFluxoStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-750 rounded-lg p-2 text-xs focus:outline-none min-w-[130px] cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Rascunho">Rascunho</option>
              </select>
            </div>
          </div>

          {/* Fluxos KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Fluxos Ativos</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {MOCK_FLUXOS_LIST.filter(f => f.status === "Ativo").length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Leads em Andamento</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {Math.round(8200 * scaleFactor).toLocaleString("pt-BR")}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Faturamento Atribuído</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {stats.revenueFluxos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">RPR Médio de Fluxos</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">
                {(stats.revenueFluxos / Math.max(1, stats.emailsSent * 0.3)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          </div>

          {/* Tabela de Fluxos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">Tabela Detalhada de Fluxos</h2>
            <p className="text-[11px] text-slate-400 mb-4">Acompanhe a entrada de contatos nas etapas e a receita agregada das automações.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 font-bold uppercase text-[10px]">
                    <th className="py-2.5 font-bold">Nome do Fluxo</th>
                    <th className="py-2.5 font-bold">Tipo</th>
                    <th className="py-2.5 font-bold">Gatilho</th>
                    <th className="py-2.5 font-bold text-right">Ingressaram</th>
                    <th className="py-2.5 font-bold text-right">Conclusão</th>
                    <th className="py-2.5 font-bold text-right">Abertura</th>
                    <th className="py-2.5 font-bold text-right">Clique</th>
                    <th className="py-2.5 font-bold text-right">Faturamento</th>
                    <th className="py-2.5 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                  {filteredFluxos.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/50">
                      <td className="py-3 text-left">
                        <span className="font-bold text-slate-800 block">{f.name}</span>
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                          f.status === "Ativo" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-slate-105 text-slate-550 border border-slate-200"
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 text-left">{f.type}</td>
                      <td className="py-3 text-slate-500 text-left">{f.trigger}</td>
                      <td className="py-3 text-right">{f.entries.toLocaleString("pt-BR")}</td>
                      <td className="py-3 text-right">{f.completionRate ? `${f.completionRate}%` : "-"}</td>
                      <td className="py-3 text-right">{f.openRate ? `${f.openRate}%` : "-"}</td>
                      <td className="py-3 text-right">{f.clickRate ? `${f.clickRate}%` : "-"}</td>
                      <td className="py-3 text-right font-semibold text-slate-850">{f.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => router.push(`/dashboard/automations`)}
                          title="Ver fluxo de automação"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center"
                        >
                          <GitBranch className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico Gargalo de Contatos por Etapa */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-800 font-sans">Contatos por Etapa do Fluxo (Funil de Gargalo)</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Analise em tempo real quantos contatos passaram por cada nó ou etapa do fluxo selecionado.</p>
              </div>

              <select
                value={selectedFlowBottleneck}
                onChange={(e) => setSelectedFlowBottleneck(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-750 rounded-lg p-2 text-xs focus:outline-none min-w-[200px] font-medium cursor-pointer"
              >
                {actualFlows.length > 0 ? (
                  actualFlows.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))
                ) : (
                  MOCK_FLUXOS_LIST.filter(f => f.status === "Ativo" && MOCK_BOTTLENECK_STEPS[f.id]).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottleneckSteps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Bar dataKey="count" name="Contatos" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT 4: ENTREGABILIDADE
          ========================================== */}
      {activeTab === "entregabilidade" && (
        <div className="space-y-6">
          {/* Conditional Spam Alert Banner */}
          {stats.avgOpenRate < 30 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3.5 text-left animate-fadeIn">
              <div className="p-2 bg-red-600 text-white rounded-xl shadow-sm shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-red-800 block">Sua taxa de reclamação de spam ou bounces está próxima do limite aceitável!</span>
                <span className="text-[11px] text-red-700 block mt-0.5">
                  Isso pode afetar a entregabilidade dos próximos envios. Recomendamos limpar contatos inativos e revisar os domínios configurados.
                </span>
              </div>
              <button
                onClick={() => router.push(`/dashboard/settings`)}
                className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow cursor-pointer shrink-0"
              >
                Ver recomendações
              </button>
            </div>
          )}

          {/* Entregabilidade KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Taxa de Entrega</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5">99.2%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Bounce Rate (Rejeição)</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5 font-sans">0.78%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Reclamação de Spam</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5 font-sans">0.03%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Taxa de Descadastro</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5 font-sans">0.14%</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm col-span-2 md:col-span-1">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Reputação do Domínio</span>
              <div className="mt-2.5">
                <span className="bg-emerald-50 border border-emerald-250 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">
                  Excelente
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bounce breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider border-b border-slate-100 pb-3 mb-4">Tipos de Rejeição (Bounce)</h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center text-xs">
                    <div className="text-left">
                      <span className="font-bold text-slate-800 block">Rejeição Suave (Soft Bounce)</span>
                      <span className="text-[10px] text-slate-455 block mt-0.5">Erros temporários como caixa cheia ou servidor ocupado.</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-800 block">{Math.round(840 * scaleFactor)}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">85% dos bounces</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center text-xs">
                    <div className="text-left">
                      <span className="font-bold text-slate-800 block">Rejeição Definitiva (Hard Bounce)</span>
                      <span className="text-[10px] text-slate-455 block mt-0.5">E-mails inválidos ou inexistentes.</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-800 block">{Math.round(148 * scaleFactor)}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">15% dos bounces</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deliverability Trend Line Chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-7">
              <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider border-b border-slate-100 pb-3 mb-4">Tendência de Entregabilidade ao Longo do Tempo</h2>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deliverabilityTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line type="monotone" dataKey="Taxa de Entrega" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Taxa de Rejeição" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Taxa de Spam" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Domínios Verificados Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider">Configuração de Domínios de Envio</h2>
              <button
                onClick={() => router.push(`/dashboard/settings?sub=dominios`)}
                className="text-[11px] text-indigo-650 hover:text-indigo-850 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Gerenciar domínios</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_DOMINIOS.map(d => (
                <div key={d.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div className="text-left">
                    <span className="font-bold text-slate-800 text-xs block">{d.domain}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Status: {d.status}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${d.spf ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-750 border border-red-100"}`}>SPF</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${d.dkim ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-755 border border-red-100"}`}>DKIM</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${d.dmarc ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-755 border border-red-100"}`}>DMARC</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                    <span className="text-slate-450">Saúde global:</span>
                    <span className={`font-black ${d.health === "Excelente" ? "text-emerald-650" : "text-amber-500"}`}>{d.health}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT 5: CONTATOS E CRESCIMENTO
          ========================================== */}
      {activeTab === "contatos" && (
        <div className="space-y-6">
          {/* Contatos KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Total na Base</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5 font-sans">
                {Math.round(22450 * (scaleFactor * 0.1 + 0.9)).toLocaleString("pt-BR")}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Inscrições no Período</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5 font-sans">+{stats.newContacts.toLocaleString("pt-BR")}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Descadastros no Período</span>
              <div className="text-xl md:text-2xl font-black text-slate-850 mt-1.5 font-sans">-{stats.unsubscribed.toLocaleString("pt-BR")}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Crescimento Líquido</span>
              <div className="text-xl md:text-2xl font-black text-emerald-650 mt-1.5 font-sans">{stats.growthRate}</div>
            </div>
          </div>

          {/* Growth Trend Area Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5 font-sans">Crescimento da Lista ao Longo do Tempo</h2>
            <p className="text-[11px] text-slate-400 mb-6">Acompanhe o balanço diário de inscrições ativas e descadastros (opt-out).</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthTrendData}>
                  <defs>
                    <linearGradient id="colorInscricoes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDescadastros" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff" }}
                    itemStyle={{ fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="Inscrições" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInscricoes)" />
                  <Area type="monotone" dataKey="Descadastros" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDescadastros)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contacts Source breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider border-b border-slate-100 pb-3 mb-4">Origem dos Novos Contatos</h2>
                <div className="flex flex-col md:flex-row items-center gap-6 py-2">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-2">
                    {sourceData.map(entry => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-slate-650 font-bold text-left">{entry.name}</span>
                        </div>
                        <span className="font-black text-slate-800">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Base engagement segments */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-black uppercase text-slate-450 tracking-wider border-b border-slate-100 pb-3 mb-4">Segmentação da Base por Engajamento</h2>
                <div className="flex flex-col md:flex-row items-center gap-6 py-2">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-2">
                    {engagementData.map(entry => (
                      <div key={entry.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-slate-650 font-bold text-left">{entry.name}</span>
                        </div>
                        <span className="font-black text-slate-800">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB CONTENT 6: PESQUISA DE DESCADASTRO
          ========================================== */}
      {activeTab === "descadastros" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total de Descadastros</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-850">28</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Taxa: 0.18%</span>
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Abaixo do limite de risco da AWS (0.5%)</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Taxa de Retenção da Base</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">99.82%</span>
                <span className="text-xs font-bold text-emerald-700">Excelente</span>
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Leads mantidos ativos em transmissão</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Motivo Mais Frequente</span>
              <span className="text-sm font-black text-slate-800 block truncate">Frequência Alta de E-mails</span>
              <span className="text-[10px] text-slate-500 block">42% das respostas da pesquisa</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Reativações Instantâneas</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600">4</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Desfazer 1-Click</span>
              </div>
              <span className="text-[10px] text-slate-400 block pt-1">Alunos que reativaram a inscrição</span>
            </div>
          </div>

          {/* Educational Info Card: How Preference Rules Protect Retention */}
          <div className="bg-indigo-900 border border-indigo-800 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-extrabold tracking-tight">Como o Gerenciamento de Preferências Protege a Base</h3>
              </div>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Quando um aluno acessa a página de preferências (`/preferences`) e desmarca um assunto específico (ex: <em>Ofertas & Promoções</em>), a plataforma marca essa opção no perfil do contato. Durante os disparos de campanhas e automações, o sistema filtra e <strong>ignora envios promocionais para esse aluno sem descadastrá-lo da base inteira</strong>.
              </p>
            </div>
            <Link
              href="/dashboard/contacts"
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer shadow-sm"
            >
              Configurar Páginas de Consentimento
            </Link>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reasons Pie Breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800">Distribuição dos Motivos de Descadastro</span>
                <span className="text-[10px] text-slate-400 font-medium">Últimos 30 dias</span>
              </div>

              <div className="space-y-3">
                {[
                  { reason: "Recebo e-mails com muita frequência", percent: 42, color: "#6366f1" },
                  { reason: "Conteúdo não relevante no momento", percent: 28, color: "#3b82f6" },
                  { reason: "Prefiro acompanhar pelo site / redes sociais", percent: 18, color: "#10b981" },
                  { reason: "Nunca me cadastrei nesta lista", percent: 8, color: "#f59e0b" },
                  { reason: "Outro motivo", percent: 4, color: "#94a3b8" }
                ].map((item) => (
                  <div key={item.reason} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.reason}</span>
                      <span className="text-slate-900 font-bold">{item.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Actions Recommendation */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3">
                  Recomendações Automáticas de Retenção
                </h3>
                <div className="space-y-3 pt-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-slate-800 block">1. Reduzir Frequência para Leads Engajados Médios</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Como 42% citaram frequência alta, ative um limite de frequência (Frequency Capping) de no máximo 2 envios semanais por contato.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-slate-800 block">2. Inserir Botão de Preferências em Destaque</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Incentivar o aluno a ajustar quais temas de cursos prefere em vez de descadastrar-se totalmente no rodapé.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">Saúde de Entregabilidade AWS: 100% Protegida</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          {/* Table: Individual Feedback Logs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Log de Respostas da Pesquisa de Descadastro</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Respostas individuais enviadas pelos alunos ao realizarem descadastro no `/unsubscribe`.</p>
              </div>
            </div>

            {/* Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5 px-3">E-mail do Aluno</th>
                    <th className="py-2.5 px-3">Data / Hora</th>
                    <th className="py-2.5 px-3">Motivo Selecionado</th>
                    <th className="py-2.5 px-3">Campanha de Origem</th>
                    <th className="py-2.5 px-3 text-right">Status do Contato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(() => {
                    let localFeedbacks: any[] = [];
                    if (typeof window !== "undefined") {
                      try {
                        const stored = localStorage.getItem("realizzare_unsubscribe_feedbacks");
                        if (stored) localFeedbacks = JSON.parse(stored);
                      } catch (e) {}
                    }

                    const defaultFeedbacks = [
                      { id: "fb-1", email: "carla.lima@outlook.com", created_at: "04/08/2026 03:12", reason: "Recebo e-mails com muita frequência", campaign: "Black Friday Antecipada 🚀", status: "Desinscrito" },
                      { id: "fb-2", email: "joao.silva@gmail.com", created_at: "03/08/2026 18:45", reason: "Conteúdo não relevante no momento", campaign: "Lançamento Curso React 💻", status: "Desinscrito" },
                      { id: "fb-3", email: "marcos.v@hotmail.com", created_at: "02/08/2026 11:20", reason: "Prefiro acompanhar pelo site / redes sociais", campaign: "Newsletter Semanal #42", status: "Desinscrito" },
                      { id: "fb-4", email: "luciana.m@live.com", created_at: "01/08/2026 09:05", reason: "Recebo e-mails com muita frequência", campaign: "Desconto Especial Programação", status: "Reativado (1-Click)" }
                    ];

                    const combined = [...localFeedbacks, ...defaultFeedbacks];

                    return combined.map((fb) => (
                      <tr key={fb.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">{fb.email}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{fb.created_at || fb.timestamp || "Agora"}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold text-[11px]">
                            {fb.reason}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{fb.campaign || "Geral"}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            fb.status === "Reativado (1-Click)"
                              ? "bg-indigo-50 border border-indigo-150 text-indigo-700"
                              : "bg-rose-50 border border-rose-150 text-rose-700"
                          }`}>
                            {fb.status || "Desinscrito"}
                          </span>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          EXPORT DIALOG MODAL
          ========================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Exportar Relatório Analítico</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {isExporting ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 border-4 border-indigo-600/35 border-t-indigo-600 rounded-full animate-spin" />
                <div className="text-center">
                  <span className="text-xs font-extrabold text-slate-700 block">Gerando relatório...</span>
                  <span className="text-[10px] text-slate-450 block mt-1">Isso levará apenas alguns segundos.</span>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4 text-left">
                {/* Export Period */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Período Selecionado</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-455" />
                    <span>
                      {new Date(exportPeriodStart).toLocaleDateString("pt-BR")} a {new Date(exportPeriodEnd).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>

                {/* Sections checkboxes */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Seções Incluídas</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportSections.visaoGeral}
                        onChange={(e) => setExportSections({ ...exportSections, visaoGeral: e.target.checked })}
                        className="rounded border-slate-350 text-indigo-650 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                      />
                      <span>Visão Geral Executiva</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportSections.campanhas}
                        onChange={(e) => setExportSections({ ...exportSections, campanhas: e.target.checked })}
                        className="rounded border-slate-350 text-indigo-650 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                      />
                      <span>Desempenho de Campanhas</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportSections.fluxos}
                        onChange={(e) => setExportSections({ ...exportSections, fluxos: e.target.checked })}
                        className="rounded border-slate-350 text-indigo-650 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                      />
                      <span>Fluxos de Automação</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportSections.entregabilidade}
                        onChange={(e) => setExportSections({ ...exportSections, entregabilidade: e.target.checked })}
                        className="rounded border-slate-350 text-indigo-650 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                      />
                      <span>Saúde de Entregabilidade</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportSections.contatosCrescimento}
                        onChange={(e) => setExportSections({ ...exportSections, contatosCrescimento: e.target.checked })}
                        className="rounded border-slate-350 text-indigo-650 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                      />
                      <span>Contatos e Crescimento da Base</span>
                    </label>
                  </div>
                </div>

                {/* Export format radios */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1.5">Formato de Exportação</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-755 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="exportFormat"
                        value="pdf"
                        checked={exportFormat === "pdf"}
                        onChange={() => setExportFormat("pdf")}
                        className="text-indigo-650 focus:ring-0 h-4 w-4 cursor-pointer"
                      />
                      <span>PDF (Relatório Visual Formatado)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-755 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="exportFormat"
                        value="csv"
                        checked={exportFormat === "csv"}
                        onChange={() => setExportFormat("csv")}
                        className="text-indigo-650 focus:ring-0 h-4 w-4 cursor-pointer"
                      />
                      <span>CSV (Dados Brutos em Tabela)</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleStartExport}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm shadow-indigo-650/10"
                  >
                    Gerar Relatório
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
