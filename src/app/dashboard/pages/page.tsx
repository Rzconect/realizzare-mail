"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  ExternalLink,
  Copy,
  Plus,
  Search,
  Trash2,
  Edit3,
  ChevronDown,
  Code,
  Eye,
  RefreshCw,
  FileText,
  Check,
  X,
  Layers,
  Settings,
  ArrowRight,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Smartphone,
  Server,
  Share2,
  Filter,
  Users,
  List,
  Link2,
  Sparkles
} from "lucide-react";

interface PageItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  status: "published" | "draft";
  views: number;
  conversions: number;
  conversionRate: number;
  conversionGoal: "button_click" | "form_submission";
  htmlContent: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  isNative: boolean;
}

export default function PagesDashboard() {
  // Navigation Tabs (without standalone formulários tab)
  const [activeTab, setActiveTab] = useState<"paginas" | "dominios" | "rastreamento">("paginas");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // TAB 1: PÁGINAS STATE
  // ==========================================
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"alpha_asc" | "alpha_desc" | "recent" | "views">("alpha_asc");
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Connected Domains State
  const [domains, setDomains] = useState<any[]>([]);

  // Modals for Pages
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageBaseDomain, setNewPageBaseDomain] = useState("realizzareconect.com.br");
  const [newPageSubdomain, setNewPageSubdomain] = useState("lp");
  const [newPageCustomSubdomain, setNewPageCustomSubdomain] = useState("");
  const [newPageCustomBaseDomain, setNewPageCustomBaseDomain] = useState("");
  const [copiedDnsKey, setCopiedDnsKey] = useState<string | null>(null);

  const handleCopyDnsField = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDnsKey(key);
    showToast(`"${text}" copiado para a área de transferência!`);
    setTimeout(() => {
      setCopiedDnsKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const [editingDesignPage, setEditingDesignPage] = useState<PageItem | null>(null);
  const [designHtml, setDesignHtml] = useState("");
  const [designViewMode, setDesignViewMode] = useState<"split" | "code" | "preview">("split");
  const [designDevicePreview, setDesignDevicePreview] = useState<"desktop" | "mobile">("desktop");

  const [configModalPage, setConfigModalPage] = useState<PageItem | null>(null);
  const [renameModalPage, setRenameModalPage] = useState<PageItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [editUrlModalPage, setEditUrlModalPage] = useState<PageItem | null>(null);
  const [editUrlValue, setEditUrlValue] = useState("");
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<PageItem | null>(null);

  // Fetch Pages from API
  const fetchPages = async () => {
    setIsLoadingPages(true);
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      if (data.success && data.pages) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error("Erro ao carregar páginas:", err);
    } finally {
      setIsLoadingPages(false);
    }
  };

  // Fetch Domains from API / DB
  const fetchDomains = async () => {
    try {
      const res = await fetch("/api/pages/domains");
      const data = await res.json();
      const nativeDomain = {
        id: "dom-native-realizzareconect",
        domain: "realizzareconect.com.br",
        status: "connected",
        cnameHost: "@",
        cnameTarget: "cname.realizzareconect.com.br",
        lastCheck: "Nativo",
        isNative: true
      };

      if (data.success && Array.isArray(data.domains)) {
        const nonNative = data.domains.filter((d: any) => d.domain !== "realizzareconect.com.br");
        setDomains([nativeDomain, ...nonNative]);
      } else {
        setDomains([nativeDomain]);
      }
    } catch (err) {
      console.error("Erro ao carregar domínios:", err);
    }
  };

  useEffect(() => {
    fetchPages();
    fetchDomains();
    fetchLists();
  }, []);

  // Base domains available for landing pages
  const availableBaseDomains = useMemo(() => {
    const defaultBases = [
      "realizzareconect.com.br",
      "realizzarecursos.com.br",
      "realizzare.com.br"
    ];
    domains.forEach((d) => {
      const name = typeof d === "string" ? d : d?.domain;
      if (!name) return;
      const parts = name.split(".");
      const base = parts.length > 2 ? parts.slice(-3).join(".") : name;
      if (base && !defaultBases.includes(base)) {
        defaultBases.push(base);
      }
    });
    return defaultBases;
  }, [domains]);

  // Effective subdomain (prefix CNAME)
  const effectiveSubdomain = useMemo(() => {
    if (newPageSubdomain === "none") return "";
    if (newPageSubdomain === "custom") {
      return newPageCustomSubdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    }
    return newPageSubdomain;
  }, [newPageSubdomain, newPageCustomSubdomain]);

  // Effective base domain
  const effectiveBaseDomain = useMemo(() => {
    if (newPageBaseDomain === "custom") {
      return newPageCustomBaseDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    }
    return newPageBaseDomain;
  }, [newPageBaseDomain, newPageCustomBaseDomain]);

  // Full host domain for the landing page
  const fullDomain = useMemo(() => {
    if (!effectiveSubdomain) return effectiveBaseDomain;
    return `${effectiveSubdomain}.${effectiveBaseDomain}`;
  }, [effectiveSubdomain, effectiveBaseDomain]);

  // Computed slug for new page
  const computedSlug = useMemo(() => {
    return (newPageSlug.trim() || newPageName.trim())
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, [newPageSlug, newPageName]);

  // Check if slug is already in use by any page
  const isSlugTaken = useMemo(() => {
    if (!computedSlug) return false;
    return pages.some((p) => p.slug?.toLowerCase() === computedSlug.toLowerCase());
  }, [pages, computedSlug]);

  // Filtered & Sorted Pages
  const filteredPages = useMemo(() => {
    return pages
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "alpha_asc") return a.name.localeCompare(b.name);
        if (sortBy === "alpha_desc") return b.name.localeCompare(a.name);
        if (sortBy === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === "views") return b.views - a.views;
        return 0;
      });
  }, [pages, searchQuery, statusFilter, sortBy]);

  // Handle Save Page
  const savePageToAPI = async (pageToSave: PageItem) => {
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", page: pageToSave })
      });
      const data = await res.json();
      if (data.success) {
        setPages((prev) => prev.map((p) => (p.id === pageToSave.id ? data.page : p)));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Action Handlers
  const handleTogglePublish = async (page: PageItem) => {
    const updated: PageItem = {
      ...page,
      status: page.status === "published" ? "draft" : "published"
    };
    await savePageToAPI(updated);
    setOpenDropdownId(null);
    showToast(updated.status === "published" ? `Página "${page.name}" publicada!` : `Página "${page.name}" alterada para rascunho.`);
  };

  const handleCopyUrl = (page: PageItem) => {
    const fallbackUrl = page.isNative
      ? (page.slug === "descadastro" || page.slug === "unsubscribe" ? "https://realizzareconect.com.br/unsubscribe" : "https://realizzareconect.com.br/preferences")
      : `https://realizzareconect.com.br/${page.slug}`;
    const url = page.url || fallbackUrl;
    navigator.clipboard.writeText(url);
    setOpenDropdownId(null);
    showToast("URL copiada para a área de transferência!");
  };

  const handleDuplicate = async (page: PageItem) => {
    const newId = `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const duplicatedSlug = `${page.slug}-copia-${Math.floor(Math.random() * 1000)}`;
    const duplicated: PageItem = {
      ...page,
      id: newId,
      name: `${page.name} (Cópia)`,
      slug: duplicatedSlug,
      url: `https://realizzareconect.com.br/${duplicatedSlug}`,
      status: "draft",
      views: 0,
      conversions: 0,
      conversionRate: 0,
      isNative: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await savePageToAPI(duplicated);
    setPages((prev) => [duplicated, ...prev]);
    setOpenDropdownId(null);
    showToast(`Página duplicada como rascunho com sucesso!`);
  };

  const handleDelete = async () => {
    if (!deleteConfirmPage) return;
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", page: deleteConfirmPage })
      });
      setPages((prev) => prev.filter((p) => p.id !== deleteConfirmPage.id));
      showToast(`Página "${deleteConfirmPage.name}" excluída.`);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteConfirmPage(null);
      setOpenDropdownId(null);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || isSlugTaken || !computedSlug) {
      if (isSlugTaken) showToast("Erro: O slug informado já está em uso por outra página.");
      return;
    }

    const slug = computedSlug;
    const pageUrl = `https://${fullDomain}/${slug}`;

    const newPage: PageItem = {
      id: `page-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: newPageName.trim(),
      slug: slug,
      url: pageUrl,
      status: "draft",
      views: 0,
      conversions: 0,
      conversionRate: 0,
      conversionGoal: "button_click",
      metaDescription: `Landing page sobre ${newPageName.trim()}`,
      isNative: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      htmlContent: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newPageName.trim()} - Realizzare Cursos</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-slate-800 font-sans antialiased min-h-screen">
  <header class="border-b border-slate-100 py-4 px-6 max-w-6xl mx-auto flex items-center justify-between">
    <div class="font-extrabold text-indigo-600 text-xl tracking-tight">Realizzare Cursos</div>
    <a href="#inscricao" class="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
      Matricule-se Grátis
    </a>
  </header>
  
  <main class="max-w-4xl mx-auto px-6 py-16 text-center space-y-6">
    <span class="inline-block bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
      Novo Conteúdo
    </span>
    <h1 class="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
      ${newPageName.trim()}
    </h1>
    <p class="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
      Aprenda com aulas práticas e conquiste seu certificado válido em todo o Brasil. Inicie agora mesmo de forma 100% gratuita.
    </p>

    <div id="inscricao" class="pt-6 max-w-md mx-auto">
      <form class="space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-left">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Seu Nome Completo</label>
          <input type="text" placeholder="Nome do aluno" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-600" required>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Seu Melhor E-mail</label>
          <input type="email" placeholder="aluno@email.com" class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-600" required>
        </div>
        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all text-sm cta-button">
          Quero Começar Agora
        </button>
      </form>
    </div>
  </main>
</body>
</html>`
    };

    // Auto-register domain/subdomain in domains list if not already present
    if (fullDomain && !domains.some((d) => d.domain === fullDomain)) {
      const newDomainEntry = {
        id: `dom-${Date.now()}`,
        domain: fullDomain,
        baseDomain: effectiveBaseDomain,
        status: effectiveBaseDomain === "realizzareconect.com.br" ? "connected" : "pending",
        cnameHost: effectiveSubdomain || "@",
        cnameTarget: "cname.realizzareconect.com.br",
        lastCheck: "Recém adicionado"
      };
      setDomains((prev) => [newDomainEntry, ...prev]);
    }

    await savePageToAPI(newPage);
    setPages((prev) => [newPage, ...prev]);
    setShowCreatePageModal(false);
    setNewPageName("");
    setNewPageSlug("");
    setNewPageCustomSubdomain("");
    setNewPageCustomBaseDomain("");
    showToast(`Página "${newPage.name}" criada com sucesso!`);
  };

  const handleSaveDesign = async () => {
    if (!editingDesignPage) return;
    const updated: PageItem = {
      ...editingDesignPage,
      htmlContent: designHtml,
      updatedAt: new Date().toISOString()
    };
    await savePageToAPI(updated);
    setEditingDesignPage(null);
    showToast("Design e código HTML salvos com sucesso!");
  };

  // ==========================================
  // LIST INTEGRATION STATE (Modal Engrenagem no Editor HTML)
  // ==========================================
  interface PlatformList {
    id: string;
    name: string;
    description: string;
    subscriber_count: number;
    type?: string;
  }

  const [availableLists, setAvailableLists] = useState<PlatformList[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [showListIntegrationModal, setShowListIntegrationModal] = useState(false);
  const [formRedirectUrl, setFormRedirectUrl] = useState("https://realizzarecursos.com.br");
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [copiedListId, setCopiedListId] = useState<string | null>(null);

  // Fetch Lists from DB
  const fetchLists = async () => {
    setIsLoadingLists(true);
    try {
      const res = await fetch("/api/lists");
      const data = await res.json();
      if (data.success && Array.isArray(data.lists)) {
        setAvailableLists(data.lists);
        if (data.lists.length > 0) {
          setSelectedListId((prev) => {
            if (prev) return prev;
            const leads = data.lists.find((l: any) => l.name.toLowerCase() === "leads");
            return leads ? leads.id : data.lists[0].id;
          });
        }
      }
    } catch (err) {
      console.error("Erro ao carregar listas:", err);
    } finally {
      setIsLoadingLists(false);
    }
  };

  // Create New List on the Spot
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      showToast("Por favor, informe o nome da nova lista.");
      return;
    }
    setIsCreatingList(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName.trim(),
          description: newListDesc.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.list) {
        setAvailableLists((prev) => [...prev, data.list]);
        setSelectedListId(data.list.id);
        setShowCreateListModal(false);
        setNewListName("");
        setNewListDesc("");
        showToast(`Lista "${data.list.name}" criada com sucesso!`);
      } else {
        showToast(`Erro ao criar lista: ${data.error || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error("Erro ao criar lista:", err);
      showToast("Erro ao criar nova lista.");
    } finally {
      setIsCreatingList(false);
    }
  };

  // Form HTML Generator
  const getFormHtmlCode = () => {
    const list = availableLists.find((l) => l.id === selectedListId) || availableLists[0];
    const pageId = editingDesignPage?.id || "page-id";
    const slug = editingDesignPage?.slug || "landing-page";
    const listId = list?.id || selectedListId || "list-id";
    const listName = list?.name || "Leads";
    const redirect = formRedirectUrl.trim() || "https://realizzarecursos.com.br";

    return `<!-- ======================================================== -->
<!-- Formulário Realizzare Mail - Lista: ${listName} -->
<!-- ======================================================== -->
<form action="https://realizzareconect.com.br/api/forms/submit" method="POST" class="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 space-y-4 font-sans text-slate-800">
  <!-- Identificadores da página e lista no Realizzare Mail -->
  <input type="hidden" name="page_id" value="${pageId}" />
  <input type="hidden" name="slug" value="${slug}" />
  <input type="hidden" name="list_id" value="${listId}" />
  <input type="hidden" name="redirect_url" value="${redirect}" />

  <div class="text-center space-y-1 pb-1">
    <h3 class="text-lg font-black text-slate-900 tracking-tight">Garanta seu Acesso Gratuito</h3>
    <p class="text-xs text-slate-500 font-medium">Preencha seus dados para receber o conteúdo:</p>
  </div>

  <div>
    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome Completo</label>
    <input type="text" name="name" required placeholder="Digite seu nome completo" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all" />
  </div>

  <div>
    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
    <input type="email" name="email" required placeholder="seu@email.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all" />
  </div>

  <div>
    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp / Telefone</label>
    <input type="tel" name="phone" placeholder="(11) 99999-9999" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all" />
  </div>

  <button type="submit" class="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs uppercase tracking-wider cursor-pointer">
    Quero me Inscrever Agora
  </button>

  <p class="text-[10px] text-center text-slate-400">
    Seus dados estão protegidos. Respeitamos sua privacidade.
  </p>
</form>`;
  };

  // Helper to Insert Form snippet into the HTML editor
  const handleInsertFormIntoHtml = () => {
    const snippet = getFormHtmlCode();
    if (!snippet) return;

    if (designHtml.includes("</body>")) {
      setDesignHtml((prev) => prev.replace("</body>", `  ${snippet}\n</body>`));
    } else {
      setDesignHtml((prev) => `${prev}\n\n${snippet}`);
    }
    showToast("Formulário inserido no código HTML com sucesso!");
    setShowListIntegrationModal(false);
  };

  // ==========================================
  // DOMÍNIOS STATE & REAL DNS VERIFICATION
  // ==========================================
  const [domainSearchQuery, setDomainSearchQuery] = useState("");
  const [isTestingDomain, setIsTestingDomain] = useState<string | null>(null);

  // 3-Step Domain Modal
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [domainModalStep, setDomainModalStep] = useState<1 | 2 | 3>(1);
  const [domainCnameOption, setDomainCnameOption] = useState<"not_ready" | "ready">("ready");
  const [inputCustomDomain, setInputCustomDomain] = useState("");

  const handleOpenDomainModal = () => {
    setDomainModalStep(1);
    setDomainCnameOption("ready");
    setInputCustomDomain("");
    setShowDomainModal(true);
  };

  // Real DNS CNAME Testing
  const handleTestDomainConnection = async (domainId: string, domainName: string) => {
    setIsTestingDomain(domainId);
    try {
      const res = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainName })
      });
      const data = await res.json();
      if (data.verified) {
        setDomains((prev) =>
          prev.map((d) =>
            d.id === domainId ? { ...d, status: "connected", lastCheck: "Agora" } : d
          )
        );
        showToast(data.message || "Conexão validada com sucesso! O registro DNS CNAME está ativo.");
      } else {
        setDomains((prev) =>
          prev.map((d) =>
            d.id === domainId ? { ...d, status: "pending", lastCheck: "Agora" } : d
          )
        );
        showToast(data.message || "CNAME não validado no DNS público. Aguarde a propagação.");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao testar conexão DNS.");
    } finally {
      setIsTestingDomain(null);
    }
  };

  // Real Domain Creation (defaults to "pending")
  const handleSaveDomain = async () => {
    if (!inputCustomDomain.trim()) return;
    const cleanDomain = inputCustomDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const host = cleanDomain.split(".")[0] || "conteudo";

    try {
      const res = await fetch("/api/pages/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: cleanDomain,
          cnameHost: host,
          cnameTarget: "cname.realizzareconect.com.br"
        })
      });
      const data = await res.json();
      if (data.success && data.domain) {
        setDomains((prev) => [data.domain, ...prev.filter((d) => d.domain !== cleanDomain)]);
        setShowDomainModal(false);
        showToast(`Domínio "${cleanDomain}" adicionado com status Pendente.`);

        // Trigger real DNS check
        handleTestDomainConnection(data.domain.id, cleanDomain);
      } else {
        showToast(data.error || "Erro ao salvar domínio.");
      }
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar domínio.");
    }
  };

  // Delete Custom Domain
  const handleDeleteDomain = async (domainName: string) => {
    if (domainName === "realizzareconect.com.br") {
      showToast("O domínio nativo não pode ser removido.");
      return;
    }
    try {
      await fetch(`/api/pages/domains?domain=${encodeURIComponent(domainName)}`, { method: "DELETE" });
      setDomains((prev) => prev.filter((d) => d.domain !== domainName));
      showToast(`Domínio "${domainName}" removido.`);
    } catch (e) {
      console.error(e);
      showToast("Erro ao remover domínio.");
    }
  };

  // ==========================================
  // TAB 4: RASTREAMENTO STATE
  // ==========================================
  const [nativeTrackingEnabled, setNativeTrackingEnabled] = useState(true);
  const [conversionAttribution, setConversionAttribution] = useState<"button_click" | "form_submission">("button_click");
  const [authorizedDomains, setAuthorizedDomains] = useState([
    "realizzareconect.com.br",
    "realizzarecursos.com.br"
  ]);
  const [newAuthDomainInput, setNewAuthDomainInput] = useState("");

  const trackingScriptCode = `<!-- Código de Rastreamento Realizzare Mail -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'realizzare.start':
  new Date().getTime(),event:'realizzare.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
  j.src='https://realizzareconect.com.br/api/tracking/page.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
  })(window,document,'script','realizzareData','rz_track_live');
</script>
<!-- Fim do Código de Rastreamento Realizzare Mail -->`;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-800 animate-fadeIn min-h-[calc(100vh-80px)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Navigation Tabs */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              <Globe className="h-3.5 w-3.5 text-indigo-600" />
              <span>Gerenciamento</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Páginas</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Crie, gerencie e publique landing pages, blogs, páginas de opt-out e rastreamento de conversão.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "paginas" && (
              <button
                onClick={() => setShowCreatePageModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar uma nova página</span>
              </button>
            )}

            {activeTab === "dominios" && (
              <button
                onClick={handleOpenDomainModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar um domínio personalizado</span>
              </button>
            )}
          </div>
        </div>

        {/* Top 4 Tabs (Matching ActiveCampaign layout) */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("paginas")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "paginas"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Páginas</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {pages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("dominios")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dominios"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Domínios</span>
            {domains.length > 0 && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {domains.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("rastreamento")}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "rastreamento"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Rastreamento do site</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              nativeTrackingEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}>
              {nativeTrackingEnabled ? "Ativo" : "Pausado"}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PÁGINAS (Main Table View) */}
      {/* ======================================================== */}
      {activeTab === "paginas" && (
        <div className="space-y-4 pb-32">
          {/* Action and Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Páginas de busca"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Espécie:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="alpha_asc">Alfabética de A a Z</option>
                  <option value="alpha_desc">Alfabética de Z a A</option>
                  <option value="recent">Mais recentes</option>
                  <option value="views">Mais visualizadas</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Mostrando {filteredPages.length} de {pages.length} páginas
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-visible min-h-[380px]">
            {isLoadingPages ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Carregando páginas criadas...</p>
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Globe className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">Nenhuma página encontrada</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery ? "Nenhum resultado corresponde à sua pesquisa." : "Comece criando sua primeira landing page ou blog na plataforma."}
                </p>
                <button
                  onClick={() => setShowCreatePageModal(true)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Criar Página
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedPages(filteredPages.map((p) => p.id));
                          else setSelectedPages([]);
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Detalhes da página</th>
                    <th className="py-3 px-4 text-center">Total de visualizações</th>
                    <th className="py-3 px-4 text-center">Conversões</th>
                    <th className="py-3 px-4 text-center">Taxa de conversão</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPages.map((page) => {
                    const isSelected = selectedPages.includes(page.id);
                    const isDropdownOpen = openDropdownId === page.id;
                    const previewPath = page.slug === "preferences" || page.slug === "preferencias"
                      ? "/preferences"
                      : (page.slug === "unsubscribe" || page.slug === "descadastro" ? "/unsubscribe" : `/${page.slug}`);

                    return (
                      <tr key={page.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? "bg-blue-50/40" : ""} ${isDropdownOpen ? "relative z-40" : "relative z-0"}`}>
                        {/* Checkbox */}
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedPages([...selectedPages, page.id]);
                              else setSelectedPages(selectedPages.filter((id) => id !== page.id));
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Detalhes da página */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            {/* Miniature Thumbnail */}
                            <div className="h-12 w-16 bg-slate-100 border border-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-400 overflow-hidden relative group">
                              <Globe className="h-5 w-5 text-slate-400 group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-850 hover:text-blue-600 cursor-pointer text-sm"
                                  onClick={() => {
                                    setEditingDesignPage(page);
                                    setDesignHtml(page.htmlContent);
                                  }}
                                >
                                  {page.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5">
                                {/* Status badge */}
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${
                                    page.status === "published" ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-amber-400"
                                  }`} />
                                  <span className="text-[11px] font-medium text-slate-500 capitalize">
                                    {page.status === "published" ? "Publicado" : "Rascunho"}
                                  </span>
                                </div>

                                <span className="text-slate-300">•</span>

                                {/* URL link */}
                                <a
                                  href={previewPath}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-slate-400 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors font-mono"
                                >
                                  <span>
                                    {page.isNative
                                      ? (page.slug === "descadastro" || page.slug === "unsubscribe" ? "realizzareconect.com.br/unsubscribe" : "realizzareconect.com.br/preferences")
                                      : (page.url?.replace(/^https?:\/\//, "") || `realizzareconect.com.br/${page.slug}`)}
                                  </span>
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Métricas: Visualizações */}
                        <td className="py-4 px-4 text-center">
                          <div className="font-extrabold text-slate-800 text-sm">{page.views}</div>
                          <span className="text-[10px] text-slate-400 font-medium">Total de visualizações</span>
                        </td>

                        {/* Métricas: Conversões */}
                        <td className="py-4 px-4 text-center">
                          <div className="font-extrabold text-slate-800 text-sm">{page.conversions}</div>
                          <span className="text-[10px] text-slate-400 font-medium">Conversões</span>
                        </td>

                        {/* Métricas: Taxa de conversão */}
                        <td className="py-4 px-4 text-center">
                          <div className="font-extrabold text-slate-800 text-sm">{page.conversionRate}%</div>
                          <span className="text-[10px] text-slate-400 font-medium">Taxa de conversão</span>
                        </td>

                        {/* Ações (Split Button + Dropdown) */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-xs relative">
                            {/* Main action: Editar design */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDesignPage(page);
                                setDesignHtml(page.htmlContent);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-l-xl transition-colors cursor-pointer"
                            >
                              Editar design
                            </button>

                            {/* Dropdown toggle */}
                            <button
                              type="button"
                              onClick={() => setOpenDropdownId(isDropdownOpen ? null : page.id)}
                              className="px-2 py-1.5 border-l border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-r-xl transition-colors cursor-pointer"
                              title="Mais opções"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>

                            {/* Functional Menu Popover */}
                            {isDropdownOpen && (
                              <>
                                {/* Click-outside backdrop */}
                                <div
                                  className="fixed inset-0 z-40 cursor-default"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(null);
                                  }}
                                />

                                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-1.5 text-left animate-fadeIn">
                                  {/* 1. Ver configurações da página */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfigModalPage(page);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <Settings className="h-4 w-4 text-slate-400" />
                                    <span>Ver configurações da página</span>
                                  </button>

                                  {/* 2. Ver página online */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      window.open(previewPath, "_blank");
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4 text-slate-400" />
                                    <span>Ver página online</span>
                                  </button>

                                  {/* 3. Cancelar publicação / Publicar */}
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePublish(page)}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <RefreshCw className="h-4 w-4 text-slate-400" />
                                    <span>{page.status === "published" ? "Cancelar publicação" : "Publicar agora"}</span>
                                  </button>

                                  <div className="border-t border-slate-100 my-1" />

                                  {/* 4. Obter URL */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyUrl(page)}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <Copy className="h-4 w-4 text-slate-400" />
                                    <span>Obter URL</span>
                                  </button>

                                  {/* 5. Editar URL */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditUrlModalPage(page);
                                      setEditUrlValue(page.slug);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <Edit3 className="h-4 w-4 text-slate-400" />
                                    <span>Editar URL</span>
                                  </button>

                                  {/* 6. Duplicar */}
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicate(page)}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <Layers className="h-4 w-4 text-slate-400" />
                                    <span>Duplicar</span>
                                  </button>

                                  {/* 7. Renomear */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRenameModalPage(page);
                                      setRenameValue(page.name);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    <span>Renomear</span>
                                  </button>

                                  <div className="border-t border-slate-100 my-1" />

                                  {/* 8. Excluir */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteConfirmPage(page);
                                      setOpenDropdownId(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: DOMÍNIOS */}
      {/* ======================================================== */}
      {activeTab === "dominios" && (
        <div className="space-y-6">
          {domains.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-150 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                <Server className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-850">Nenhum domínio personalizado configurado</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Suas páginas utilizam por padrão o domínio oficial <strong className="text-slate-700 font-mono">realizzareconect.com.br</strong>. Para conectar um domínio ou subdomínio próprio (ex: <span className="font-mono">conteudos.seudominio.com.br</span>), clique no botão abaixo.
              </p>
              <button
                type="button"
                onClick={handleOpenDomainModal}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar um domínio personalizado</span>
              </button>
            </div>
          ) : (
            <>
              {/* Domains Header and Filter */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="relative flex-1 sm:max-w-xs w-full">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar domínios"
                    value={domainSearchQuery}
                    onChange={(e) => setDomainSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                  />
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {domains.length} domínio(s) configurado(s)
                </div>
              </div>

              {/* Domains Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Domínios personalizados</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Apontamento CNAME</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {domains
                      .filter((d) => d.domain.toLowerCase().includes(domainSearchQuery.toLowerCase()))
                      .map((dom) => (
                        <tr key={dom.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <Server className="h-4 w-4 text-slate-400" />
                              <span className="font-mono font-bold text-slate-800 text-xs">{dom.domain}</span>
                              {dom.domain === "realizzareconect.com.br" && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-1.5 py-0.5 rounded-md">
                                  Oficial
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {dom.status === "connected" ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                                <span className="text-xs font-bold text-emerald-700">Conectado</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-bold text-amber-700">Pendente</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-500 font-mono text-[11px]">
                            {dom.cnameHost || "lp"} → {dom.cnameTarget || "cname.realizzareconect.com.br"}
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                const text = `Tipo: CNAME | Nome: ${dom.cnameHost || "lp"} | Destino: ${dom.cnameTarget || "cname.realizzareconect.com.br"}`;
                                navigator.clipboard.writeText(text);
                                showToast(`Dados CNAME de "${dom.domain}" copiados!`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Copiar dados CNAME para a área de transferência"
                            >
                              <Copy className="h-3 w-3" />
                              <span>Copiar CNAME</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTestDomainConnection(dom.id, dom.domain)}
                              disabled={isTestingDomain === dom.id}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              {isTestingDomain === dom.id ? (
                                <span className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3 animate-spin" /> Testando...
                                </span>
                              ) : (
                                "Testar conexão"
                              )}
                            </button>
                            {dom.domain !== "realizzareconect.com.br" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDomain(dom.domain)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                                title="Remover domínio"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RASTREAMENTO DO SITE */}
      {/* ======================================================== */}
      {activeTab === "rastreamento" && (
        <div className="space-y-6">
          {/* Card 1: Rastreamento Nativo */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-850">
                    Rastreamento Nativo de Páginas Criadas na Plataforma
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    nativeTrackingEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                  }`}>
                    {nativeTrackingEnabled ? "LIGADO (Ativo)" : "DESLIGADO"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Quando ativo (padrão), o Realizzare Mail rastreia e alimenta automaticamente as métricas de total de visualizações, conversões e taxa de conversão em todas as páginas criadas internamente.
                </p>
              </div>

              {/* Native Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={nativeTrackingEnabled}
                onClick={() => {
                  const val = !nativeTrackingEnabled;
                  setNativeTrackingEnabled(val);
                  showToast(val ? "Rastreamento nativo ativado!" : "Rastreamento nativo pausado.");
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  nativeTrackingEnabled ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    nativeTrackingEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Conversion Rule Configuration */}
            <div className="border-t border-slate-150 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Critério Padrão de Atribuição de Conversão
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  conversionAttribution === "button_click" ? "border-blue-600 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"
                }`}>
                  <input
                    type="radio"
                    name="attribution"
                    checked={conversionAttribution === "button_click"}
                    onChange={() => setConversionAttribution("button_click")}
                    className="text-blue-600 accent-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Cliques em Botões de Ação (CTA)</span>
                    <span className="text-[10px] text-slate-400">Contabiliza cliques nos botões principais da página.</span>
                  </div>
                </label>

                <label className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  conversionAttribution === "form_submission" ? "border-blue-600 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"
                }`}>
                  <input
                    type="radio"
                    name="attribution"
                    checked={conversionAttribution === "form_submission"}
                    onChange={() => setConversionAttribution("form_submission")}
                    className="text-blue-600 accent-blue-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Envio de Formulários Preenchidos</span>
                    <span className="text-[10px] text-slate-400">Contabiliza quando o visitante submete um formulário.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Código de Rastreamento para Sites Externos */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-850">
                  Código de Rastreamento para Sites Externos (JavaScript Snippet)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copie e cole este código antes da tag de fechamento <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">&lt;/body&gt;</code> no rodapé de qualquer site externo (ex: WordPress, blog ou loja) para rastrear visitantes e conversões automaticamente.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingScriptCode);
                  showToast("Código de rastreamento copiado!");
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Script</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto relative">
              <pre className="text-slate-300 leading-relaxed">{trackingScriptCode}</pre>
            </div>
          </div>

          {/* Card 3: Domínios Autorizados para Rastreamento Externo */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-850">
              Domínios e URLs Autorizadas para Rastreamento Externo
            </h3>
            <p className="text-xs text-slate-500">
              Apenas acessos originados destes domínios serão computados no painel de relatórios.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {authorizedDomains.map((dom) => (
                <div key={dom} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>{dom}</span>
                  <button
                    type="button"
                    onClick={() => setAuthorizedDomains(authorizedDomains.filter((d) => d !== dom))}
                    className="hover:text-red-500 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 max-w-md pt-2">
              <input
                type="text"
                placeholder="exemplo.com.br"
                value={newAuthDomainInput}
                onChange={(e) => setNewAuthDomainInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAuthDomainInput.trim() && !authorizedDomains.includes(newAuthDomainInput.trim())) {
                    setAuthorizedDomains([...authorizedDomains, newAuthDomainInput.trim()]);
                    setNewAuthDomainInput("");
                    showToast("Domínio autorizado adicionado!");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CRIAR NOVA PÁGINA */}
      {/* ======================================================== */}
      {showCreatePageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-black text-slate-900">Adicionar uma nova página</h3>
              <button onClick={() => setShowCreatePageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nome da Página</label>
                <input
                  type="text"
                  placeholder="Ex: Curso Gratuito de Inteligência Artificial"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600 text-slate-800"
                  required
                />
              </div>

              {/* Seleção de Subdomínio (CNAME) e Domínio Base */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Subdomínio (Prefixo CNAME) */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Subdomínio (Prefixo CNAME)
                  </label>
                  <select
                    value={newPageSubdomain}
                    onChange={(e) => setNewPageSubdomain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600 text-slate-800"
                  >
                    <option value="lp">lp (Recomendado - Landing Pages)</option>
                    <option value="conteudos">conteudos (Materiais & E-books)</option>
                    <option value="cursos">cursos (Cursos & Matrículas)</option>
                    <option value="paginas">paginas (Páginas Institucionais)</option>
                    <option value="promo">promo (Ofertas & Campanhas)</option>
                    <option value="none">(Sem subdomínio - Raiz direto)</option>
                    <option value="custom">+ Criar outro subdomínio...</option>
                  </select>

                  {newPageSubdomain === "custom" && (
                    <input
                      type="text"
                      placeholder="Ex: evento, ia, blackfriday"
                      value={newPageCustomSubdomain}
                      onChange={(e) => setNewPageCustomSubdomain(e.target.value)}
                      className="mt-1.5 w-full bg-slate-50 border border-blue-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                      autoFocus
                    />
                  )}
                </div>

                {/* 2. Domínio Base */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Domínio Base
                  </label>
                  <select
                    value={newPageBaseDomain}
                    onChange={(e) => setNewPageBaseDomain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600 text-slate-800"
                  >
                    {availableBaseDomains.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom} {dom === "realizzareconect.com.br" ? "(Plataforma Oficial)" : "(Domínio Próprio)"}
                      </option>
                    ))}
                    <option value="custom">+ Adicionar outro domínio base...</option>
                  </select>

                  {newPageBaseDomain === "custom" && (
                    <input
                      type="text"
                      placeholder="Ex: seudominio.com.br"
                      value={newPageCustomBaseDomain}
                      onChange={(e) => setNewPageCustomBaseDomain(e.target.value)}
                      className="mt-1.5 w-full bg-slate-50 border border-blue-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-600"
                      autoFocus
                    />
                  )}
                </div>
              </div>

              {/* Box de Instruções DNS CNAME com Botões Copiar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    <Server className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Registro DNS CNAME para adicionar no seu provedor</span>
                  </div>
                  {effectiveBaseDomain === "realizzareconect.com.br" ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Domínio Oficial
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto shrink-0">
                      <AlertTriangle className="h-3 w-3" /> Requer CNAME no DNS
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Campo 1: Tipo */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">1. Tipo</span>
                      <span className="font-mono font-black text-slate-800 text-xs">CNAME</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyDnsField("type", "CNAME")}
                      className="mt-2.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start cursor-pointer"
                    >
                      {copiedDnsKey === "type" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDnsKey === "type" ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>

                  {/* Campo 2: Nome / Host */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">2. Nome / Host</span>
                      <span className="font-mono font-black text-blue-700 text-xs truncate block" title={effectiveSubdomain || "@"}>
                        {effectiveSubdomain || "@"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyDnsField("host", effectiveSubdomain || "@")}
                      className="mt-2.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start cursor-pointer"
                    >
                      {copiedDnsKey === "host" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDnsKey === "host" ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>

                  {/* Campo 3: Destino / Valor */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">3. Destino / Apontamento</span>
                      <span className="font-mono font-black text-slate-800 text-xs break-all block" title="cname.realizzareconect.com.br">
                        cname.realizzareconect.com.br
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyDnsField("target", "cname.realizzareconect.com.br")}
                      className="mt-2.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start cursor-pointer"
                    >
                      {copiedDnsKey === "target" ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedDnsKey === "target" ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-150">
                  {effectiveBaseDomain === "realizzareconect.com.br" ? (
                    <p className="text-emerald-700 font-medium">
                      💡 Domínio oficial da plataforma. Pronto para publicação imediata com certificado SSL automático.
                    </p>
                  ) : (
                    <p>
                      💡 Adicione o registro CNAME acima no gerenciador de DNS de <strong className="text-slate-800">{effectiveBaseDomain}</strong> (ex: Cloudflare, Registro.br). O Realizzare Mail responderá em <strong className="text-indigo-600 font-mono">{fullDomain}</strong> com SSL automático!
                    </p>
                  )}
                </div>
              </div>

              {/* Caminho da URL (depois da barra /) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 uppercase">
                    Caminho da URL (depois da &quot;/&quot;)
                  </label>
                  {computedSlug && (
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${isSlugTaken ? "text-rose-600" : "text-emerald-600"}`}>
                      {isSlugTaken ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" /> URL já em uso
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> URL disponível
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className={`flex items-center bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs transition-colors ${isSlugTaken ? "border-rose-400 bg-rose-50/30" : "border-slate-200"}`}>
                  <span className="text-slate-400 font-mono text-xs shrink-0 font-medium">{`https://${fullDomain}/`}</span>
                  <input
                    type="text"
                    placeholder="curso-ia-gratis"
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    className="flex-1 bg-transparent font-mono font-bold text-slate-800 focus:outline-none ml-1.5 min-w-0"
                  />
                </div>
                {isSlugTaken && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    Já existe uma página cadastrada com o slug &quot;{computedSlug}&quot;. Escolha outro caminho para evitar conflito.
                  </p>
                )}
                {computedSlug && !isSlugTaken && (
                  <p className="text-[11px] text-slate-400 font-mono mt-1.5 truncate">
                    Endereço final: <span className="text-indigo-600 font-bold">{`https://${fullDomain}/${computedSlug}`}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowCreatePageModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    !newPageName.trim() ||
                    isSlugTaken ||
                    !computedSlug ||
                    (newPageSubdomain === "custom" && !newPageCustomSubdomain.trim()) ||
                    (newPageBaseDomain === "custom" && !newPageCustomBaseDomain.trim())
                  }
                  className={`px-4 py-2 rounded-xl font-bold shadow-md transition-all ${
                    !newPageName.trim() ||
                    isSlugTaken ||
                    !computedSlug ||
                    (newPageSubdomain === "custom" && !newPageCustomSubdomain.trim()) ||
                    (newPageBaseDomain === "custom" && !newPageCustomBaseDomain.trim())
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Criar Página
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR DESIGN (HTML CODE & LIVE PREVIEW) */}
      {/* ======================================================== */}
      {editingDesignPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col p-3 md:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full h-full flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Editor Top Bar */}
            <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white">
                  <Code className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{editingDesignPage.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
                      /{editingDesignPage.slug}
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400">Editor de Código HTML & Design Responsivo</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switchers */}
                <div className="hidden sm:flex bg-slate-800 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setDesignViewMode("code")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      designViewMode === "code" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Apenas Código
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignViewMode("split")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      designViewMode === "split" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Lado a Lado
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignViewMode("preview")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      designViewMode === "preview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Apenas Prévia
                  </button>
                </div>

                {/* Device switch for preview */}
                <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setDesignDevicePreview("desktop")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      designDevicePreview === "desktop" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                    title="Desktop"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesignDevicePreview("mobile")}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      designDevicePreview === "mobile" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                    }`}
                    title="Mobile"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                {/* Gear button: Vincular Lista & Formulário */}
                <button
                  type="button"
                  onClick={() => {
                    fetchLists();
                    setShowListIntegrationModal(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Vincular Lista & Formulário"
                >
                  <Settings className="h-4 w-4 text-blue-400" />
                  <span className="hidden sm:inline">Vincular Lista / Formulário</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDesign}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Salvar Alterações
                </button>

                <button
                  type="button"
                  onClick={() => setEditingDesignPage(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Code Panel */}
              {(designViewMode === "code" || designViewMode === "split") && (
                <div className={`${designViewMode === "split" ? "w-1/2 border-r border-slate-200" : "w-full"} flex flex-col bg-slate-950`}>
                  <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>index.html (HTML5 / Tailwind CSS)</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(designHtml);
                        showToast("Código HTML copiado!");
                      }}
                      className="hover:text-white flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" /> Copiar Código
                    </button>
                  </div>
                  <textarea
                    value={designHtml}
                    onChange={(e) => setDesignHtml(e.target.value)}
                    className="flex-1 w-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Live Preview Panel */}
              {(designViewMode === "preview" || designViewMode === "split") && (
                <div className={`${designViewMode === "split" ? "w-1/2" : "w-full"} bg-slate-100 flex flex-col items-center justify-center p-4 overflow-auto`}>
                  <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 transition-all ${
                    designDevicePreview === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
                  }`}>
                    <iframe
                      srcDoc={designHtml}
                      title="Prévia ao Vivo"
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3-STEP MODAL: ADICIONAR DOMÍNIO PERSONALIZADO (Print Reference) */}
      {/* ======================================================== */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-black text-slate-900">Adicionar um domínio personalizado</h3>
              <button onClick={() => setShowDomainModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEP 1: Introdução */}
            {domainModalStep === 1 && (
              <div className="space-y-6 py-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cada landing page que você publica vive em um domínio. Se você não deseja usar o subdomínio que fornecemos, você pode conectar seu domínio personalizado às Páginas.
                </p>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setShowDomainModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomainModalStep(2)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Em que parte do processo você está? */}
            {domainModalStep === 2 && (
              <div className="space-y-4 py-1">
                <p className="text-xs font-semibold text-slate-700">
                  Em que parte do processo de criação de um domínio personalizado você está?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option 1: Não criei */}
                  <div
                    onClick={() => setDomainCnameOption("not_ready")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5 ${
                      domainCnameOption === "not_ready" ? "border-blue-600 bg-blue-50/20 shadow-xs" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      Não criei um registro CNAME em meu provedor de hospedagem ou aguardei 48 horas.
                    </span>
                  </div>

                  {/* Option 2: Criei */}
                  <div
                    onClick={() => setDomainCnameOption("ready")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5 ${
                      domainCnameOption === "ready" ? "border-blue-600 bg-blue-50/20 shadow-xs ring-2 ring-blue-600/10" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Server className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-snug">
                      Criei um registro CNAME em meu provedor de hospedagem que está ativo há pelo menos 48 horas.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setDomainModalStep(1)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Voltar
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDomainModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDomainModalStep(3)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Entrada do Domínio & Instruções CNAME */}
            {domainModalStep === 3 && (
              <div className="space-y-4 py-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ótimo! Insira o domínio abaixo que está registrado em seu provedor de hospedagem.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domínio personalizado</label>
                  <input
                    type="text"
                    placeholder="exemplo.dominio.com.br"
                    value={inputCustomDomain}
                    onChange={(e) => setInputCustomDomain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>

                {/* Yellow Warning Box (matching screenshot) */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold leading-relaxed">
                    Lembre-se de que os domínios não podem ser adicionados até que estejam ativos por pelo menos 48 horas.
                  </p>
                </div>

                {/* CNAME Technical Helper */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs font-mono">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Dados do Apontamento DNS</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo:</span>
                    <span className="font-bold text-slate-800">CNAME</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Host / Nome:</span>
                    <span className="font-bold text-slate-800">conteudos (ou subdomínio)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor / Destino:</span>
                    <span className="font-bold text-slate-800">cname.realizzareconect.com.br</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => setDomainModalStep(2)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    Voltar
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDomainModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDomain}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      Adicionar Domínio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VER CONFIGURAÇÕES DA PÁGINA */}
      {/* ======================================================== */}
      {configModalPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-base font-black text-slate-900">Configurações da Página</h3>
              <button onClick={() => setConfigModalPage(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Título da Página</label>
                <input
                  type="text"
                  value={configModalPage.name}
                  onChange={(e) => setConfigModalPage({ ...configModalPage, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Slug da URL</label>
                <input
                  type="text"
                  value={configModalPage.slug}
                  onChange={(e) => setConfigModalPage({ ...configModalPage, slug: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Meta Descrição (SEO)</label>
                <textarea
                  value={configModalPage.metaDescription || ""}
                  onChange={(e) => setConfigModalPage({ ...configModalPage, metaDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 h-20 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Meta de Conversão Primária</label>
                <select
                  value={configModalPage.conversionGoal}
                  onChange={(e: any) => setConfigModalPage({ ...configModalPage, conversionGoal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
                >
                  <option value="button_click">Clique em Botão de Ação (CTA)</option>
                  <option value="form_submission">Envio de Formulário de Cadastro</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setConfigModalPage(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await savePageToAPI(configModalPage);
                    setConfigModalPage(null);
                    showToast("Configurações atualizadas!");
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RENOMEAR PÁGINA */}
      {/* ======================================================== */}
      {renameModalPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">Renomear Página</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Novo Nome</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setRenameModalPage(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (renameValue.trim()) {
                    const updated = { ...renameModalPage, name: renameValue.trim() };
                    await savePageToAPI(updated);
                    setRenameModalPage(null);
                    showToast("Página renomeada com sucesso!");
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl font-bold shadow-md"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR URL */}
      {/* ======================================================== */}
      {editUrlModalPage && (() => {
        const cleanEditSlug = editUrlValue.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
        const isEditSlugTaken = pages.some((p) => p.id !== editUrlModalPage.id && p.slug?.toLowerCase() === cleanEditSlug);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Editar URL da Página</h3>
                {cleanEditSlug && (
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${isEditSlugTaken ? "text-rose-600" : "text-emerald-600"}`}>
                    {isEditSlugTaken ? (
                      <>
                        <AlertTriangle className="h-3 w-3" /> Já em uso
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Disponível
                      </>
                    )}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Novo Caminho (Slug)</label>
                <div className={`flex items-center bg-slate-50 border rounded-xl px-3 py-2 text-xs transition-colors ${isEditSlugTaken ? "border-rose-400 bg-rose-50/30" : "border-slate-200"}`}>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0">realizzareconect.com.br/</span>
                  <input
                    type="text"
                    value={editUrlValue}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    className="flex-1 bg-transparent font-mono font-bold text-slate-800 focus:outline-none ml-1 min-w-0"
                    autoFocus
                  />
                </div>
                {isEditSlugTaken && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    Este slug já está sendo utilizado por outra página.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setEditUrlModalPage(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!cleanEditSlug || isEditSlugTaken}
                  onClick={async () => {
                    if (cleanEditSlug && !isEditSlugTaken) {
                      const updated = {
                        ...editUrlModalPage,
                        slug: cleanEditSlug,
                        url: `https://realizzareconect.com.br/${cleanEditSlug}`
                      };
                      await savePageToAPI(updated);
                      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                      setEditUrlModalPage(null);
                      showToast("URL da página atualizada com sucesso!");
                    }
                  }}
                  className={`px-4 py-2 text-xs rounded-xl font-bold shadow-md transition-all ${
                    !cleanEditSlug || isEditSlugTaken
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Salvar URL
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {/* ======================================================== */}
      {deleteConfirmPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Excluir Página</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tem certeza de que deseja excluir <strong>{deleteConfirmPage.name}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setDeleteConfirmPage(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl font-bold shadow-md"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VINCULAR LISTA & FORMULÁRIO (ENGRENAGEM) */}
      {/* ======================================================== */}
      {showListIntegrationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-150 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Settings className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Vincular Lista & Formulário da Página</h3>
                </div>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  Selecione uma lista de contatos para onde os leads capturados neste formulário serão direcionados. Cada envio de formulário cadastrará o lead no CRM, inscreverá na lista selecionada e contabilizará como conversão real desta página.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowListIntegrationModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Section 1: Seleção de Listas & Criar Nova Lista */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span>Listas Disponíveis na Plataforma</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Escolha a lista vinculada ao formulário desta landing page:
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateListModal(!showCreateListModal)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showCreateListModal ? "Fechar Criação" : "+ Criar Nova Lista"}</span>
                </button>
              </div>

              {/* Inline Form to Create New List */}
              {showCreateListModal && (
                <form
                  onSubmit={handleCreateList}
                  className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      Criar Nova Lista no Realizzare Mail
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Salva imediatamente no banco de dados</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nome da Lista *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Leads Workshop de Edificações"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-600"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Descrição (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Contatos capturados na LP de Edificações"
                        value={newListDesc}
                        onChange={(e) => setNewListDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreateListModal(false)}
                      className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingList || !newListName.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCreatingList ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      <span>Salvar e Selecionar Lista</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Lists Grid */}
              {isLoadingLists ? (
                <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  Carregando listas...
                </div>
              ) : availableLists.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Nenhuma lista cadastrada ainda. Clique em "+ Criar Nova Lista" acima.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {availableLists.map((list) => {
                    const isSelected = selectedListId === list.id;
                    return (
                      <div
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/20 shadow-xs ring-2 ring-blue-600/10"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{list.name}</span>
                              {isSelected && (
                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md">
                                  Vinculada
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {list.description || "Lista de transmissão da plataforma."}
                            </p>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                            {list.subscriber_count || 0} contatos
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                          <span className="font-mono text-slate-400 truncate max-w-[170px]" title={list.id}>
                            ID: {list.id}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(list.id);
                              setCopiedListId(list.id);
                              showToast(`ID da lista "${list.name}" copiado!`);
                              setTimeout(() => setCopiedListId(null), 2000);
                            }}
                            className="px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 font-bold cursor-pointer"
                            title="Copiar ID da Lista"
                          >
                            {copiedListId === list.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span className="text-emerald-600">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copiar ID</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Gerador de Formulário HTML */}
            <div className="space-y-3 pt-2 border-t border-slate-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5 text-blue-600" />
                    <span>Código HTML do Formulário para Inserir na Página</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Código pré-configurado com os campos necessários e a rota de submissão oficial.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getFormHtmlCode());
                      showToast("Código HTML do formulário copiado!");
                    }}
                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Código</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertFormIntoHtml}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    title="Insere automaticamente no HTML do editor"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Inserir no HTML da Página</span>
                  </button>
                </div>
              </div>

              {/* Redirect URL input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                  URL de Redirecionamento após o cadastro (opcional)
                </label>
                <input
                  type="text"
                  value={formRedirectUrl}
                  onChange={(e) => setFormRedirectUrl(e.target.value)}
                  placeholder="https://realizzarecursos.com.br"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:border-indigo-600"
                />
                <p className="text-[10px] text-slate-400">
                  Para onde o visitante será direcionado após o preenchimento com sucesso.
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed selection:bg-indigo-600 selection:text-white border border-slate-800">
                  {getFormHtmlCode()}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end border-t border-slate-150">
              <button
                type="button"
                onClick={() => setShowListIntegrationModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
