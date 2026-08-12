"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  GraduationCap,
  TrendingUp,
  FileBadge2,
  DollarSign,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  Code,
  Languages,
  Brush,
  Database,
  Target,
  Table2,
  Layers,
  Edit3,
  Cpu,
  ArrowRight,
  BookOpen,
  UserPlus,
  Clock,
  CreditCard,
  ShoppingBag,
  Eye,
  GitBranch,
  Play,
  RotateCcw
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

import { createClient } from "@/lib/supabase/client";

// ==========================================
// MOCK DATA (to be replaced gradually)
// ==========================================

// (Static dailyStats array replaced by dynamic generator inside component)

const topCoursesFlows = [
  { id: 1, name: "Fullstack JavaScript Pro", iconName: "code", enrolledPeriod: 450, flowStatus: "active", currentContacts: 2100 },
  { id: 2, name: "Inglês para Negócios", iconName: "languages", enrolledPeriod: 320, flowStatus: "inactive", currentContacts: 1850 },
  { id: 3, name: "UI/UX Design Masterclass", iconName: "brush", enrolledPeriod: 280, flowStatus: "active", currentContacts: 1200 },
  { id: 4, name: "Python para Data Science", iconName: "database", enrolledPeriod: 510, flowStatus: "active", currentContacts: 3400 },
  { id: 5, name: "Gestão de Tráfego Pago", iconName: "target", enrolledPeriod: 190, flowStatus: "inactive", currentContacts: 950 },
  { id: 6, name: "Excel Avançado para Finanças", iconName: "table", enrolledPeriod: 210, flowStatus: "active", currentContacts: 1400 },
  { id: 7, name: "Formação Product Manager", iconName: "layers", enrolledPeriod: 180, flowStatus: "active", currentContacts: 890 },
  { id: 8, name: "Copywriting de Conversão", iconName: "edit", enrolledPeriod: 150, flowStatus: "inactive", currentContacts: 720 },
  { id: 9, name: "IA Generativa para Negócios", iconName: "cpu", enrolledPeriod: 420, flowStatus: "active", currentContacts: 2800 },
  { id: 10, name: "Liderança e Gestão de Equipes", iconName: "book", enrolledPeriod: 130, flowStatus: "inactive", currentContacts: 610 },
];

const recentEvents = [
  { id: 1, name: "Maria Oliveira", email: "maria.o@gmail.com", date: "Hoje", time: "12:15", eventLabel: "Se cadastrou no site", type: "signup" },
  { id: 2, name: "João Santos", email: "joao.santos@outlook.com", date: "Hoje", time: "11:42", eventLabel: "Comprou um certificado", type: "purchase" },
  { id: 3, name: "Ana Costa", email: "ana.costa@hotmail.com", date: "Hoje", time: "10:05", eventLabel: "Abriu e-mail de Boas-vindas", type: "open" },
  { id: 4, name: "Pedro Souza", email: "pedro.souza@gmail.com", date: "Ontem", time: "17:30", eventLabel: "Se matriculou em novo curso", type: "enrollment" },
  { id: 5, name: "Juliana Lima", email: "ju.lima@yahoo.com.br", date: "Ontem", time: "14:15", eventLabel: "Comprou um certificado", type: "purchase" },
];

const getCourseIconInfo = (iconName: string) => {
  switch (iconName) {
    case "code":
      return { icon: Code, bg: "bg-sky-50 text-sky-600 border border-sky-100" };
    case "languages":
      return { icon: Languages, bg: "bg-purple-50 text-purple-600 border border-purple-100" };
    case "brush":
      return { icon: Brush, bg: "bg-teal-50 text-teal-600 border border-teal-100" };
    case "database":
      return { icon: Database, bg: "bg-amber-50 text-amber-600 border border-amber-100" };
    case "target":
      return { icon: Target, bg: "bg-rose-50 text-rose-600 border border-rose-100" };
    case "table":
      return { icon: Table2, bg: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
    case "layers":
      return { icon: Layers, bg: "bg-indigo-50 text-indigo-600 border border-indigo-100" };
    case "edit":
      return { icon: Edit3, bg: "bg-yellow-50 text-yellow-600 border border-yellow-100" };
    case "cpu":
      return { icon: Cpu, bg: "bg-violet-50 text-violet-600 border border-violet-100" };
    default:
      return { icon: BookOpen, bg: "bg-slate-50 text-slate-600 border border-slate-100" };
  }
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<"today" | "7" | "30" | "90" | "current_month" | "custom">("current_month");
  const [customStartDate, setCustomStartDate] = useState("2026-08-01");
  const [customEndDate, setCustomEndDate] = useState("2026-08-12");

  const [activeFlows, setActiveFlows] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  
  // Dashboard Metrics & Live Events State
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [recentEventsList, setRecentEventsList] = useState<any[]>([]);
  const [selectedEventModal, setSelectedEventModal] = useState<any>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Agora (12/08 às 19:40)");
  const [isSyncing, setIsSyncing] = useState(false);

  // Load KPI Metrics & Live Webhook Events with Strict Date Range Filtering
  const loadMetrics = async () => {
    setIsLoadingMetrics(true);
    const supabase = createClient();
    
    try {
      let start = new Date();
      let end = new Date();
      
      if (period === "today") {
        start.setHours(0, 0, 0, 0);
      } else if (period === "7") {
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
      } else if (period === "30") {
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
      } else if (period === "90") {
        start.setDate(start.getDate() - 90);
        start.setHours(0, 0, 0, 0);
      } else if (period === "current_month") {
        start = new Date("2026-08-01T00:00:00Z");
        end = new Date("2026-08-12T23:59:59Z");
      } else if (period === "custom") {
        start = new Date(customStartDate);
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      }

      const startMs = start.getTime();
      const endMs = end.getTime();

      // Fetch live transaction events from reporting_events
      const { data: eventsData } = await supabase
        .from("reporting_events")
        .select("*")
        .order("created_at", { ascending: false });

      let allEventsPool: any[] = [];

      if (eventsData && eventsData.length > 0) {
        eventsData.forEach((e: any) => {
          const meta = e.metadata || {};
          const amt = meta.amount || 0;
          const dateObj = new Date(e.created_at || Date.now());

          allEventsPool.push({
            id: e.id || Math.random().toString(),
            name: meta.customer_name || "Aluno Realizzare",
            email: e.contact_email || "aluno@realizzare.com.br",
            phone: meta.phone || "(11) 98765-4321",
            date: dateObj.toLocaleDateString("pt-BR"),
            time: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            eventLabel: meta.item_title || "Compra de Certificado",
            itemTitle: meta.item_title || "Certificado de Conclusão - Realizzare Cursos",
            amount: amt,
            category: meta.category || "certificado",
            paymentMethod: "Cartão / PIX",
            timestampMs: dateObj.getTime(),
            type: "purchase",
            provider: meta.provider || "pagarme"
          });
        });
      }

      // Also check localStorage simulated events
      const storedSims = localStorage.getItem("realizzare_simulated_events");
      if (storedSims) {
        try {
          const simList = JSON.parse(storedSims);
          simList.forEach((s: any) => {
            let tMs = Date.now();
            if (s.date) {
              const parts = s.date.split("/");
              if (parts.length === 3) {
                tMs = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
              }
            }
            allEventsPool.unshift({
              ...s,
              timestampMs: s.timestampMs || tMs
            });
          });
        } catch (e) {
          console.error(e);
        }
      }

      // Deduplicate events by id
      const uniqueEventsMap = new Map();
      allEventsPool.forEach(evt => uniqueEventsMap.set(evt.id, evt));
      const deduplicatedPool = Array.from(uniqueEventsMap.values());

      // Filter events by period date bounds
      const filteredPeriodEvents = deduplicatedPool.filter(evt => {
        return evt.timestampMs >= startMs && evt.timestampMs <= endMs;
      });

      let calculatedRevenue = 0;
      let calculatedCerts = 0;
      let calculatedSubs = 0;

      filteredPeriodEvents.forEach(evt => {
        calculatedRevenue += evt.amount || 0;
        if (evt.category === "certificado") calculatedCerts += 1;
        if (evt.category === "assinatura") calculatedSubs += 1;
      });

      setRecentEventsList(filteredPeriodEvents.slice(0, 25));

      // LEADS ATIVOS and ALUNOS ATIVOS set strictly to 0 as requested by user until platform launch!
      setMetrics({
        active_leads: 0,
        students_count: 0,
        enrolled_period: 0,
        certificates_issued: calculatedCerts,
        total_paid: calculatedRevenue,
        active_subscriptions: calculatedSubs,
        changes: { leads: "0%", students: "0%", enrolled: "0%", certs: "+0%", revenue: "+0%", subs: "+0%" }
      });

      const nowStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      setLastSyncTime(`Hoje às ${nowStr}`);

    } catch (err) {
      console.error(err);
      setMetrics({
        active_leads: 0,
        students_count: 0,
        enrolled_period: 0,
        certificates_issued: 0,
        total_paid: 0,
        active_subscriptions: 0,
        changes: { leads: "0%", students: "0%", enrolled: "0%", certs: "0%", revenue: "0%", subs: "0%" }
      });
    } finally {
      setIsLoadingMetrics(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("realizzare_mock_flows");
      const defaultFlows = [
        {
          id: "flow-1",
          name: "Boas-vindas - Novo Aluno React",
          triggerDescription: "Iniciou curso: React Developer",
          type: "Automação",
          status: "Ativo",
          updatedAt: "18/07/2026 14:15",
          activeContacts: 24,
          finishedContacts: 145,
          certificatesIssued: 92,
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
          finishedContacts: 312,
          certificatesIssued: 312,
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
          finishedContacts: 54,
          certificatesIssued: 0,
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
          finishedContacts: 12,
          certificatesIssued: 0,
          revenue: 0.00
        }
      ];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const migrated = parsed.map((f: any) => {
            const status = f.status ? f.status : (f.active ? "Ativo" : "Pausado");
            const activeContacts = typeof f.activeContacts === "number" ? f.activeContacts : (f.currentContacts || 0);
            return {
              ...f,
              status,
              activeContacts,
              finishedContacts: f.finishedContacts ?? Math.floor(Math.random() * 200 + 50),
              certificatesIssued: f.certificatesIssued ?? Math.floor(Math.random() * 100),
              revenue: f.revenue ?? (f.currentContacts ? f.currentContacts * 97 : 0)
            };
          });

          setFlows(migrated);
          const filtered = migrated
            .filter((f: any) => f.status === "Ativo" || f.status === "Rascunho")
            .sort((a: any, b: any) => (b.activeContacts || 0) - (a.activeContacts || 0));
          setActiveFlows(filtered);
        } catch (e) {
          console.error(e);
          setFlows(defaultFlows);
          const filtered = defaultFlows
            .filter((f: any) => f.status === "Ativo" || f.status === "Rascunho")
            .sort((a: any, b: any) => (b.activeContacts || 0) - (a.activeContacts || 0));
          setActiveFlows(filtered);
          localStorage.setItem("realizzare_mock_flows", JSON.stringify(defaultFlows));
        }
      } else {
        setFlows(defaultFlows);
        const filtered = defaultFlows
          .filter((f: any) => f.status === "Ativo" || f.status === "Rascunho")
          .sort((a: any, b: any) => (b.activeContacts || 0) - (a.activeContacts || 0));
        setActiveFlows(filtered);
        localStorage.setItem("realizzare_mock_flows", JSON.stringify(defaultFlows));
      }
    }
  }, []);

  const getMockDailyStats = () => {
    let stats: { name: string; envios: number; abertos: number; clicados: number }[] = [];
    
    const generatePoint = (name: string, seedIndex: number, scale: number) => {
      const sinValue = Math.sin((seedIndex * 45 * Math.PI) / 180);
      const factor = 1 + sinValue * 0.35; // organic wave variation
      const envios = Math.round(18000 * factor * scale);
      const abertos = Math.round(envios * (0.42 + Math.cos(seedIndex) * 0.05));
      const clicados = Math.round(envios * (0.17 + Math.sin(seedIndex) * 0.03));
      return { name, envios, abertos, clicados };
    };

    if (period === "today") {
      // Hourly points: 24 points (00:00 to 23:00)
      const currentHour = new Date().getHours();
      for (let h = 0; h < 24; h++) {
        const name = `${String(h).padStart(2, "0")}:00`;
        if (h > currentHour) {
          stats.push({ name, envios: 0, abertos: 0, clicados: 0 });
        } else {
          stats.push(generatePoint(name, h, 0.04));
        }
      }
    } else if (period === "7") {
      // 7 points: last 7 days
      const start = new Date();
      start.setDate(start.getDate() - 6);
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const name = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        stats.push(generatePoint(name, i, 0.6));
      }
    } else if (period === "30") {
      // 30 points: day-by-day for last 30 days
      const start = new Date();
      start.setDate(start.getDate() - 29);
      for (let i = 0; i < 30; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const name = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        stats.push(generatePoint(name, i, 1.0));
      }
    } else if (period === "90") {
      // Weekly intervals for 90 days (13 weeks)
      const start = new Date();
      start.setDate(start.getDate() - 90);
      for (let i = 0; i < 13; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i * 7);
        const name = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        stats.push(generatePoint(name, i, 5.0));
      }
    } else {
      // Custom range: dynamic sizing
      const start = new Date(customStartDate + "T00:00:00");
      const end = new Date(customEndDate + "T00:00:00");
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

      if (diffDays === 1) {
        // Single day: exactly 1 point
        const d = new Date(start);
        const name = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        stats.push(generatePoint(name, 0, 1.0));
      } else if (diffDays <= 30) {
        // Day-by-day (e.g. up to 30 days)
        for (let i = 0; i < diffDays; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          const name = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          stats.push(generatePoint(name, i, 1.0));
        }
      } else {
        // Weekly intervals for ranges > 30 days
        const weeksCount = Math.min(20, Math.ceil(diffDays / 7));
        const stepDays = diffDays / weeksCount;
        for (let i = 0; i < weeksCount; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + Math.round(i * stepDays));
          const name = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          stats.push(generatePoint(name, i, 5.0));
        }
        // Force include last date if missing
        const lastDate = new Date(end);
        const lastDateName = `${String(lastDate.getDate()).padStart(2, "0")}/${String(lastDate.getMonth() + 1).padStart(2, "0")}`;
        if (stats[stats.length - 1]?.name !== lastDateName) {
          stats.push(generatePoint(lastDateName, weeksCount, 5.0));
        }
      }
    }

    return stats;
  };

  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [isLoadingDailyStats, setIsLoadingDailyStats] = useState(true);

  useEffect(() => {
    const loadDailyStats = async () => {
      setIsLoadingDailyStats(true);
      const supabase = createClient();
      try {
        let start = new Date();
        let end = new Date();
        
        if (period === "today") {
          start.setHours(0, 0, 0, 0);
        } else if (period === "7") {
          start.setDate(start.getDate() - 7);
        } else if (period === "30") {
          start.setDate(start.getDate() - 30);
        } else if (period === "90") {
          start.setDate(start.getDate() - 90);
        } else if (period === "custom") {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
        }

        const { data, error } = await supabase
          .from('daily_email_stats_view')
          .select('*')
          .gte('date', start.toISOString().split('T')[0])
          .lte('date', end.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error || !data || data.length === 0) {
          setDailyStats(getMockDailyStats());
        } else {
          const formatted = data.map((d: any) => {
            const dateStr = d.date + "T12:00:00Z";
            return {
              name: new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              envios: parseInt(d.envios) || 0,
              abertos: parseInt(d.abertos) || 0,
              clicados: parseInt(d.clicados) || 0
            };
          });
          setDailyStats(formatted);
        }
      } catch (e) {
        setDailyStats(getMockDailyStats());
      } finally {
        setIsLoadingDailyStats(false);
      }
    };
    loadDailyStats();
  }, [period, customStartDate, customEndDate]);

  const formatCurrency = (val: number) => {
    const intVal = Math.round(val);
    const digitCount = String(intVal).length;
    if (digitCount > 6) {
      if (intVal >= 1000000) {
        const millions = val / 1000000;
        const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace(".", ",");
        return `R$ ${formatted}M`;
      } else if (intVal >= 1000) {
        const thousands = val / 1000;
        const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1).replace(".", ",");
        return `R$ ${formatted}k`;
      }
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(intVal);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("pt-BR").format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => {
        const order: Record<string, number> = { envios: 1, abertos: 2, clicados: 3 };
        const keyA = a.dataKey || "";
        const keyB = b.dataKey || "";
        return (order[keyA] || 99) - (order[keyB] || 99);
      });

      const enviosItem = payload.find((x: any) => x.dataKey === "envios");
      const abertosItem = payload.find((x: any) => x.dataKey === "abertos");
      const clicadosItem = payload.find((x: any) => x.dataKey === "clicados");

      const enviosVal = enviosItem?.value || 0;
      const abertosVal = abertosItem?.value || 0;
      const clicadosVal = clicadosItem?.value || 0;

      const taxaAbertura = enviosVal > 0 ? Math.round((abertosVal / enviosVal) * 100) : 0;
      const taxaClique = enviosVal > 0 ? Math.round((clicadosVal / enviosVal) * 100) : 0;

      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-lg space-y-2 min-w-[220px]">
          <p className="text-xs font-black text-slate-500 border-b border-slate-100 pb-1">{label}</p>
          <div className="space-y-1.5">
            {sortedPayload.map((item: any) => {
              let percentageStr = "";
              if (item.dataKey === "abertos") {
                percentageStr = ` ("${taxaAbertura}%")`;
              } else if (item.dataKey === "clicados") {
                percentageStr = ` ("${taxaClique}%")`;
              }

              return (
                <div key={item.dataKey} className="flex items-center justify-between gap-4 text-xs animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.stroke }} />
                    <span className="text-slate-500 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-800 font-bold">
                    {formatNumber(item.value)}
                    {percentageStr && <span className="text-indigo-600 font-bold ml-1">{percentageStr}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const data = metrics || {
    active_leads: 0,
    students_count: 0,
    enrolled_period: 0,
    certificates_issued: 0,
    total_paid: 0,
    active_subscriptions: 0,
    changes: { leads: "0%", students: "0%", enrolled: "0%", certs: "0%", revenue: "0%", subs: "0%" }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-650 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              Painel de Controle
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Visão Geral
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Métricas de engajamento, vendas e comportamento dos leads da Realizzare.
          </p>
        </div>

        {/* Period Selector Dropdown Wrapper */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[10px] text-slate-400 font-medium">
            Última sincronização: <span className="font-bold text-slate-600">{lastSyncTime}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {period === "custom" && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 animate-fadeIn shadow-sm">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-bold uppercase select-none">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-1 flex items-center gap-1.5 shadow-sm">
              <button
                onClick={() => setPeriod("today")}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  period === "today"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setPeriod("7")}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  period === "7"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setPeriod("current_month")}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  period === "current_month"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Mês Atual
              </button>
              <button
                onClick={() => setPeriod("30")}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  period === "30"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setPeriod("90")}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  period === "90"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                90 Dias
              </button>
              <button
                onClick={() => setPeriod("custom")}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  period === "custom"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Personalizado
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSyncing(true);
                  loadMetrics();
                }}
                disabled={isSyncing}
                className="h-7 w-7 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 shrink-0 ml-0.5"
                title="Sincronizar e atualizar dados"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Enrolled in Period */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Inscritos no Período</span>
            <span className="p-1.5 bg-violet-50 rounded-lg text-violet-600">
              <UserPlus className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850">{formatNumber(data.enrolled_period)}</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.changes.enrolled} <span className="text-slate-500 text-[10px] font-normal">vs. anterior</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
        </div>

        {/* Active Leads */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Leads Ativos</span>
            <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850">
              {isLoadingMetrics ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : formatNumber(data.active_leads)}
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.changes.leads} <span className="text-slate-500 text-[10px] font-normal">vs. anterior</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        </div>

        {/* Total Students / Active Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Alunos Ativos</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <GraduationCap className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850">
              {isLoadingMetrics ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : formatNumber(data.students_count)}
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.changes.students} <span className="text-slate-500 text-[10px] font-normal">vs. anterior</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        </div>

        {/* Certificates Issued */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Certificados</span>
            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <FileBadge2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850">
              {isLoadingMetrics ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : formatNumber(data.certificates_issued)}
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.changes.certs} <span className="text-slate-500 text-[10px] font-normal">vs. anterior</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
        </div>

        {/* Active Subscriptions (Assinaturas ao lado de Certificados) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Assinaturas</span>
            <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850">
              {isLoadingMetrics ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : formatNumber(data.active_subscriptions)}
            </h3>
            <span className="text-xs text-emerald-755 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.changes.subs} <span className="text-slate-500 text-[10px] font-normal">vs. anterior</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
        </div>

        {/* Revenue / Receita Atribuída (Último card) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Faturamento</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-850">
              {isLoadingMetrics ? <div className="h-8 w-32 bg-slate-100 animate-pulse rounded" /> : formatCurrency(data.total_paid)}
            </h3>
            <span className="text-xs text-emerald-755 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 mt-1 w-fit">
              <TrendingUp className="h-3.5 w-3.5" />
              {data.changes.revenue} <span className="text-slate-500 text-[10px] font-normal">vs. anterior</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
        </div>
      </div>

      {/* Main Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:-mt-2">
        {/* Engagement Graph (Area) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Envios de E-mails & Engajamento Diário</h2>
                <p className="text-xs text-slate-500">Relação entre e-mails enviados, abertos e cliques gerados no período.</p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyStats}>
                  <defs>
                    <linearGradient id="colorEnvios" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAbertos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} minTickGap={25} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="envios"
                    name="E-mails Enviados"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorEnvios)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="abertos"
                    name="E-mails Abertos"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorAbertos)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicados"
                    name="E-mails Clicados"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorClicados)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Events Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-sans">Últimos Eventos</h2>
                <p className="text-xs text-slate-500 mt-0.5">Atividades recentes dos contatos na plataforma.</p>
              </div>
              <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-650">
                <Clock className="h-4.5 w-4.5" />
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin max-h-[300px]">
              {recentEventsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Nenhum evento registrado ainda</span>
                    <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 font-medium">
                      As vendas de cursos e certificados via Pagar.me aparecerão aqui em tempo real.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm"
                  >
                    <span>Configurar Integração Pagar.me</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                recentEventsList.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventModal(evt)}
                    className="flex flex-col space-y-1.5 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/20 transition-all cursor-pointer group w-full overflow-hidden shadow-2xs"
                  >
                    {/* Top Row: Avatar + Name + Pagar.me Badge */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 overflow-hidden min-w-0">
                        <div className="h-7 w-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">
                          {evt.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                        </div>
                        <span className="text-xs font-extrabold text-slate-850 truncate group-hover:text-indigo-600 transition-colors">
                          {evt.name}
                        </span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                        Pagar.me
                      </span>
                    </div>

                    {/* Email line */}
                    <span className="text-[10px] text-slate-500 font-medium truncate block w-full pl-9">
                      {evt.email}
                    </span>

                    {/* Item Description line */}
                    <span className="text-[11px] font-bold text-emerald-700 block w-full pl-9 leading-snug line-clamp-2">
                      {evt.itemTitle || evt.eventLabel}
                    </span>

                    {/* Bottom row: Timestamp */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100/80 w-full">
                      <span className="font-bold text-slate-700">R$ {evt.amount ? evt.amount.toFixed(2) : "49.90"}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{evt.date} às {evt.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Automation Flows List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-sans">Fluxos de Automação Ativos & Rascunhos</h2>
            <p className="text-xs text-slate-500">Métricas de andamento, conversão e receita de fluxos ativos e em rascunho.</p>
          </div>
          <Link
            href="/dashboard/automations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Ver todas as automações</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-bold tracking-wider text-slate-500 select-none">
                <th className="py-3 px-4">Nome do Fluxo</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Contatos Atuais</th>
                <th className="py-3 px-4 text-center">Finalizaram</th>
                <th className="py-3 px-4 text-center">Certificados Emitidos</th>
                <th className="py-3 px-4 text-right">Receita Gerada</th>
                <th className="py-3 px-4 text-right w-12">Visualizar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {activeFlows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium italic">
                    Nenhum fluxo de automação ativo ou rascunho no momento.
                  </td>
                </tr>
              ) : (
                activeFlows.map((flow) => (
                  <tr key={flow.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {flow.name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        flow.type === "Automação" 
                          ? "bg-indigo-50 border border-indigo-100 text-indigo-700"
                          : "bg-amber-50 border border-amber-100 text-amber-700"
                      }`}>
                        {flow.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                        flow.status === "Ativo"
                          ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                          : flow.status === "Rascunho"
                          ? "bg-slate-100 border border-slate-200 text-slate-600"
                          : "bg-amber-50 border border-amber-100 text-amber-700"
                      }`}>
                        {flow.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {formatNumber(flow.activeContacts || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                      {formatNumber(flow.finishedContacts || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                      {formatNumber(flow.certificatesIssued || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      {formatCurrency(flow.revenue || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/automations?highlight=${flow.id}`}
                        className="inline-flex p-1.5 rounded-lg border border-slate-200 bg-white text-slate-550 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
                        title="Visualizar fluxo"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Event Details Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-base">
                  💳
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Detalhes da Transação Pagar.me</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">Integrado via Webhook Pagar.me V5</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Dados do Aluno / Comprador</span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-sm">{selectedEventModal.name}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                    Compra Aprovada
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>E-mail:</span>
                  <strong className="text-slate-800 font-mono">{selectedEventModal.email}</strong>
                </div>
                {selectedEventModal.phone && (
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Telefone / WhatsApp:</span>
                    <strong className="text-slate-800 font-mono">{selectedEventModal.phone}</strong>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Resumo do Item Adquirido</span>
                <div className="text-slate-900 font-bold text-xs leading-relaxed">
                  {selectedEventModal.itemTitle || selectedEventModal.eventLabel}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-slate-700 font-medium">
                  <span>Valor Total Transacionado:</span>
                  <strong className="text-emerald-700 font-black text-base">R$ {selectedEventModal.amount ? selectedEventModal.amount.toFixed(2) : "49.90"}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span>Método de Pagamento:</span>
                  <span className="bg-slate-100 text-slate-800 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase">
                    {selectedEventModal.paymentMethod || "Cartão / PIX"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Data e Hora do Evento:</span>
                  <span>{selectedEventModal.date} às {selectedEventModal.time}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Link
                href="/dashboard/contacts"
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all text-center shadow-sm"
              >
                Ver Ficha do Contato
              </Link>
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
