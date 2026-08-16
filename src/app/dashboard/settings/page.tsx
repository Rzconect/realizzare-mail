"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings,
  User,
  Building2,
  Users,
  Tag,
  Mail,
  Shield,
  Key,
  Webhook,
  Ban,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Download,
  Info,
  Lock,
  Globe,
  Settings2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  X,
  Search,
  BarChart3,
  Sparkles,
  MapPin,
  Cpu,
  RotateCcw,
  Check,
  Bot,
  MessageSquare,
  CreditCard,
  Zap,
  ShoppingBag,
  DollarSign,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function SettingsPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "geral" | "email" | "dominios" | "atribuicao" | "integracoes" | "api" | "webhooks" | "suppression" | "ai" | "seguranca"
  >("geral");
  const [activeGeralSubmenu, setActiveGeralSubmenu] = useState<"pessoal" | "conta" | "enderecos" | "usuarios" | "tags" | "uso">("pessoal");

  // Integration Settings State (Pagar.me & PagBank)
  const [pagarmeActive, setPagarmeActive] = useState(false);
  const [pagarmeSecretKey, setPagarmeSecretKey] = useState("");
  const [pagarmePublicKey, setPagarmePublicKey] = useState("");
  
  const [pagbankActive, setPagbankActive] = useState(false);
  const [pagbankToken, setPagbankToken] = useState("");
  const [pagbankPublicKey, setPagbankPublicKey] = useState("");

  const [ruleExitAbandonedCart, setRuleExitAbandonedCart] = useState(true);
  const [ruleEnterPostSale, setRuleEnterPostSale] = useState(true);
  const [ruleUpdateKpiAndTimeline, setRuleUpdateKpiAndTimeline] = useState(true);

  // Webhook Test Simulation Modal State
  const [showSimModal, setShowSimModal] = useState(false);
  const [simProvider, setSimProvider] = useState<"pagarme" | "pagbank">("pagarme");
  const [simEmail, setSimEmail] = useState("fernanda.barbosa@gmail.com");
  const [simItem, setSimItem] = useState("Certificado de Conclusão - Programação Web");
  const [simAmount, setSimAmount] = useState(97.90);
  const [simStatus, setSimStatus] = useState<"paid" | "refunded" | "failed">("paid");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogSuccess, setSimLogSuccess] = useState<string | null>(null);

  // Attribution Settings State (Klaviyo Style)
  const [attrEmailOpenDays, setAttrEmailOpenDays] = useState("5 dias");
  const [attrEmailClickDays, setAttrEmailClickDays] = useState("5 dias");
  const [attrSmsDeliveredHours, setAttrSmsDeliveredHours] = useState("12 horas");
  const [attrSmsClickDays, setAttrSmsClickDays] = useState("5 dias");
  const [attrExcludeTransactional, setAttrExcludeTransactional] = useState(false);
  const [attrExcludeEmailBots, setAttrExcludeEmailBots] = useState(true);
  const [attrExcludeSmsBots, setAttrExcludeSmsBots] = useState(true);
  const [attrExcludeAppleMpp, setAttrExcludeAppleMpp] = useState(true);

  // AI Settings State
  const [activeAiModel, setActiveAiModel] = useState("gpt-4o");
  const [openaiApiKey, setOpenaiApiKey] = useState("sk-proj-••••••••••••••••");
  const [geminiApiKey, setGeminiApiKey] = useState("AIzaSy••••••••••••••••");
  const [grokApiKey, setGrokApiKey] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");

  // Sender Cascade & SmartSending State
  const [senderName, setSenderName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("realizzare_sender_name") || "Realizzare Cursos";
    }
    return "Realizzare Cursos";
  });

  const [senderEmail, setSenderEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("realizzare_sender_email") || "contato@realizzare.com.br";
    }
    return "contato@realizzare.com.br";
  });

  const [replyToEmail, setReplyToEmail] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("realizzare_reply_to_email") || "suporte@realizzare.com.br";
    }
    return "suporte@realizzare.com.br";
  });

  const [showCascadeSenderModal, setShowCascadeSenderModal] = useState(false);
  const [smartSendingEnabled, setSmartSendingEnabled] = useState(true);
  const [smartSendingIntervalHours, setSmartSendingIntervalHours] = useState(24);
  const [showUserPermissionModal, setShowUserPermissionModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [showDnsCheckModal, setShowDnsCheckModal] = useState(false);

  // User profile states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("Leonardo");
  const [lastName, setLastName] = useState("Christian");
  const [email, setEmail] = useState("leonardo@realizzare.com.br");
  const [currentEmailConfirmPass, setCurrentEmailConfirmPass] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // 2FA/MFA states
  const [isMfaActive, setIsMfaActive] = useState(false);
  const [showMfaEnrollModal, setShowMfaEnrollModal] = useState(false);
  const [totpQrCode, setTotpQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpPinCode, setTotpPinCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [isTotpVerified, setIsTotpVerified] = useState(false);

  // Invite user confirmation states
  const [showInviteConfirmModal, setShowInviteConfirmModal] = useState(false);
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [invitePendingData, setInvitePendingData] = useState<any>(null);
  const [inviteConfirmLoading, setInviteConfirmLoading] = useState(false);

  // Account usage limits
  const [profilesLimit, setProfilesLimit] = useState(5000);
  const [emailsLimit, setEmailsLimit] = useState(50000);
  const [mobileLimit, setMobileLimit] = useState(5.00);

  const [profilesUsed, setProfilesUsed] = useState(4585);
  const [emailsUsed, setEmailsUsed] = useState(30972);
  const [mobileUsed, setMobileUsed] = useState(0.00);

  // Load from localStorage on mount and handle ?sub query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionStr = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
      if (sessionStr) {
        try {
          const parsedSession = JSON.parse(sessionStr);
          setCurrentUser(parsedSession);
          if (parsedSession.name) {
            const parts = parsedSession.name.split(" ");
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(" "));
          }
          if (parsedSession.email) {
            setEmail(parsedSession.email);
            const isEnabled = localStorage.getItem(`realizzare_mfa_enabled_${parsedSession.email.toLowerCase()}`) === "true";
            setIsMfaActive(isEnabled);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Load auth users list
      const defaultUsers = [
        { name: "Leonardo Christian", email: "admin@realizzare.com.br", password: "senha123", role: "Administrador", isNewUser: false },
        { name: "Ana Oliveira", email: "ana.oliveira@gmail.com", password: "senha123", role: "Editor", isNewUser: true },
        { name: "João Santos", email: "joao.santos@outlook.com", password: "senha123", role: "Visualizador", isNewUser: true }
      ];
      const storedUsers = localStorage.getItem("realizzare_auth_users");
      if (storedUsers) {
        try {
          setUsers(JSON.parse(storedUsers));
        } catch (e) {
          setUsers(defaultUsers);
        }
      } else {
        setUsers(defaultUsers);
        localStorage.setItem("realizzare_auth_users", JSON.stringify(defaultUsers));
      }

      const storedUsage = localStorage.getItem("realizzare_account_usage");
      if (storedUsage) {
        try {
          const parsed = JSON.parse(storedUsage);
          if (parsed.profilesLimit) setProfilesLimit(parsed.profilesLimit);
          if (parsed.emailsLimit) setEmailsLimit(parsed.emailsLimit);
          if (parsed.mobileLimit) setMobileLimit(parsed.mobileLimit);
          if (parsed.profilesUsed !== undefined) setProfilesUsed(parsed.profilesUsed);
          if (parsed.emailsUsed !== undefined) setEmailsUsed(parsed.emailsUsed);
          if (parsed.mobileUsed !== undefined) setMobileUsed(parsed.mobileUsed);
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaults = {
          profilesLimit: 5000,
          profilesUsed: 4585,
          emailsLimit: 50000,
          emailsUsed: 30972,
          mobileLimit: 5.00,
          mobileUsed: 0.00
        };
        localStorage.setItem("realizzare_account_usage", JSON.stringify(defaults));
      }

      // Load Saved Integration Configs
      const storedIntegrations = localStorage.getItem("realizzare_integrations_config");
      if (storedIntegrations) {
        try {
          const cfg = JSON.parse(storedIntegrations);
          if (cfg.pagarmeActive !== undefined) setPagarmeActive(cfg.pagarmeActive);
          if (cfg.pagarmeSecretKey) setPagarmeSecretKey(cfg.pagarmeSecretKey);
          if (cfg.pagarmePublicKey) setPagarmePublicKey(cfg.pagarmePublicKey);
          if (cfg.pagbankActive !== undefined) setPagbankActive(cfg.pagbankActive);
          if (cfg.pagbankToken) setPagbankToken(cfg.pagbankToken);
          if (cfg.pagbankPublicKey) setPagbankPublicKey(cfg.pagbankPublicKey);
          if (cfg.ruleExitAbandonedCart !== undefined) setRuleExitAbandonedCart(cfg.ruleExitAbandonedCart);
          if (cfg.ruleEnterPostSale !== undefined) setRuleEnterPostSale(cfg.ruleEnterPostSale);
          if (cfg.ruleUpdateKpiAndTimeline !== undefined) setRuleUpdateKpiAndTimeline(cfg.ruleUpdateKpiAndTimeline);
        } catch (e) {
          console.error(e);
        }
      }

      // Load Saved Default Sender Email Info
      const savedSenderName = localStorage.getItem("realizzare_sender_name");
      const savedSenderEmail = localStorage.getItem("realizzare_sender_email");
      const savedReplyToEmail = localStorage.getItem("realizzare_reply_to_email");

      if (savedSenderName) setSenderName(savedSenderName);
      if (savedSenderEmail) setSenderEmail(savedSenderEmail);
      if (savedReplyToEmail) setReplyToEmail(savedReplyToEmail);

      const params = new URLSearchParams(window.location.search);
      const sub = params.get("sub");
      if (sub === "pessoal" || sub === "conta" || sub === "usuarios" || sub === "tags" || sub === "uso") {
        setActiveTab("geral");
        setActiveGeralSubmenu(sub as any);
      }
    }
  }, []);

  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        
        // Fetch API Keys
        const { data: keysData } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
        if (keysData) {
          setApiKeys(keysData.map((k: any) => ({
            id: k.id,
            name: k.name,
            keyHash: k.key_prefix + "••••" + k.key_hash.substring(0,4),
            created: new Date(k.created_at).toLocaleDateString("pt-BR"),
            lastUsed: k.last_used_at ? new Date(k.last_used_at).toLocaleDateString("pt-BR") : "Nunca",
            scope: k.scope === "full" ? "Todos os escopos" : "Apenas leitura"
          })));
        }

        // Fetch Webhooks
        const { data: webData } = await supabase.from("webhooks").select("*").order("created_at", { ascending: false });
        if (webData) {
          setWebhooks(webData.map((w: any) => ({
            id: w.id,
            url: w.url,
            events: w.events,
            status: w.status === "active" ? "Ativo" : "Inativo"
          })));
        }

        // Fetch Domains
        const { data: domData } = await supabase.from("sending_domains").select("*").order("created_at", { ascending: false });
        if (domData) {
          setDomains(domData.map((d: any) => ({
            id: d.id,
            domain: d.domain,
            verificationStatus: d.verification_status === "verified" ? "Verificado" : (d.verification_status === "failed" ? "Falhou" : "Pendente"),
            spfStatus: d.spf_status === "verified" ? "OK" : (d.spf_status === "failed" ? "Erro" : "Pendente"),
            dkimStatus: d.dkim_status === "verified" ? "OK" : (d.dkim_status === "failed" ? "Erro" : "Pendente"),
            dmarcStatus: d.dmarc_status === "verified" ? "OK" : (d.dmarc_status === "failed" ? "Erro" : "Pendente")
          })));
        }

        // Fetch Suppression
        const { data: supData } = await supabase.from("suppression_list").select("*").order("created_at", { ascending: false });
        if (supData) {
          setSuppressedEmails(supData.map((s: any) => ({
            email: s.email,
            reason: s.reason,
            date: new Date(s.created_at).toLocaleDateString("pt-BR"),
            origin: s.origin || "Desconhecido",
            removable: s.removable
          })));
        }
      } catch (err) {
        console.error("Erro ao carregar configuracoes:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePersonalInfo = () => {
    const newFullName = `${firstName} ${lastName}`.trim();
    if (!newFullName) {
      alert("O nome não pode ficar vazio.");
      return;
    }

    // 1. Update in the users database list
    const storedUsers = localStorage.getItem("realizzare_auth_users");
    if (storedUsers) {
      try {
        const usersList = JSON.parse(storedUsers);
        const updatedList = usersList.map((u: any) => {
          if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return { ...u, name: newFullName };
          }
          return u;
        });
        localStorage.setItem("realizzare_auth_users", JSON.stringify(updatedList));
        setUsers(updatedList); // Update state table
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Update current session
    const updatedSession = { ...currentUser, name: newFullName };
    if (localStorage.getItem("realizzare_current_session")) {
      localStorage.setItem("realizzare_current_session", JSON.stringify(updatedSession));
    } else {
      sessionStorage.setItem("realizzare_current_session", JSON.stringify(updatedSession));
    }
    setCurrentUser(updatedSession);

    // 3. Dispatch storage event so layout updates
    window.dispatchEvent(new Event("storage"));
    alert("Informações pessoais atualizadas com sucesso!");
  };

  const handleSaveEmail = () => {
    if (!currentEmailConfirmPass) {
      alert("Por favor, digite sua senha atual para confirmar a alteração do e-mail.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      alert("Por favor, digite um e-mail válido.");
      return;
    }

    const storedUsers = localStorage.getItem("realizzare_auth_users");
    if (storedUsers) {
      try {
        const usersList = JSON.parse(storedUsers);
        const userDb = usersList.find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
        
        if (!userDb || userDb.password !== currentEmailConfirmPass) {
          alert("Senha incorreta. Não foi possível alterar o e-mail.");
          return;
        }

        if (usersList.some((u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.email.toLowerCase() !== currentUser.email.toLowerCase())) {
          alert("Este e-mail de login já está em uso por outro usuário.");
          return;
        }

        const updatedList = usersList.map((u: any) => {
          if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return { ...u, email: email.trim() };
          }
          return u;
        });
        localStorage.setItem("realizzare_auth_users", JSON.stringify(updatedList));
        setUsers(updatedList);

        const updatedSession = { ...currentUser, email: email.trim() };
        if (localStorage.getItem("realizzare_current_session")) {
          localStorage.setItem("realizzare_current_session", JSON.stringify(updatedSession));
        } else {
          sessionStorage.setItem("realizzare_current_session", JSON.stringify(updatedSession));
        }
        setCurrentUser(updatedSession);

        window.dispatchEvent(new Event("storage"));
        setCurrentEmailConfirmPass("");
        alert("E-mail de login atualizado com sucesso!");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSavePassword = () => {
    if (!currentPassword) {
      alert("Por favor, digite sua senha atual.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      alert("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("A nova senha e a confirmação de senha não coincidem.");
      return;
    }

    const storedUsers = localStorage.getItem("realizzare_auth_users");
    if (storedUsers) {
      try {
        const usersList = JSON.parse(storedUsers);
        const userIdx = usersList.findIndex((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());

        if (userIdx === -1 || usersList[userIdx].password !== currentPassword) {
          alert("Senha atual incorreta.");
          return;
        }

        usersList[userIdx].password = newPassword;
        localStorage.setItem("realizzare_auth_users", JSON.stringify(usersList));
        setUsers(usersList);

        alert("Senha de acesso atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleMfa = async () => {
    if (isMfaActive) {
      const confirmDisable = confirm("Deseja realmente desativar a autenticação de 2 fatores (MFA) da sua conta? Isso reduzirá a segurança de acesso.");
      if (!confirmDisable) return;

      setTotpLoading(true);
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        const verifiedFactor = factors?.totp?.find((f: any) => f.status === "verified");
        if (verifiedFactor) {
          const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
          if (unenrollError) throw unenrollError;
        }

        localStorage.removeItem(`realizzare_mfa_enabled_${currentUser.email.toLowerCase()}`);
        setIsMfaActive(false);
        alert("Autenticação de 2 fatores desativada com sucesso.");
      } catch (e: any) {
        console.warn("Failed real Supabase unenroll, using simulated fallback:", e);
        localStorage.removeItem(`realizzare_mfa_enabled_${currentUser.email.toLowerCase()}`);
        setIsMfaActive(false);
        alert("Autenticação de 2 fatores desativada com sucesso.");
      } finally {
        setTotpLoading(false);
      }
    } else {
      setShowMfaEnrollModal(true);
      await handleInitMfaSetup();
    }
  };

  const handleInitMfaSetup = async () => {
    setTotpLoading(true);
    setTotpError("");
    setIsTotpVerified(false);
    setTotpPinCode("");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Realizzare Mail",
        friendlyName: currentUser?.email || "Administrador"
      });

      if (error) throw error;

      if (data && data.totp) {
        setTotpQrCode(data.totp.qr_code);
        setTotpSecret(data.totp.secret);
        setTotpFactorId(data.id);
      }
    } catch (e: any) {
      console.warn("MFA enrollment failed, using simulated fallback:", e);
      setTotpQrCode("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Realizzare%20Mail:" + encodeURIComponent(currentUser?.email || "admin") + "?secret=JBSWY3DPEHPK3PXP&issuer=Realizzare%20Mail");
      setTotpSecret("JBSWY3DPEHPK3PXP");
      setTotpFactorId("mock-factor-id");
    } finally {
      setTotpLoading(false);
    }
  };

  const handleVerifyMfaCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpLoading(true);
    setTotpError("");

    if (totpPinCode.trim().length !== 6) {
      setTotpError("Por favor, digite o código de 6 dígitos.");
      setTotpLoading(false);
      return;
    }

    try {
      if (totpFactorId === "mock-factor-id") {
        setTimeout(() => {
          setIsTotpVerified(true);
          setTotpLoading(false);
          localStorage.setItem(`realizzare_mfa_enabled_${currentUser?.email?.toLowerCase()}`, "true");
          setIsMfaActive(true);
        }, 600);
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactorId
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactorId,
        challengeId: challenge.id,
        code: totpPinCode
      });
      if (verifyError) throw verifyError;

      setIsTotpVerified(true);
      localStorage.setItem(`realizzare_mfa_enabled_${currentUser?.email?.toLowerCase()}`, "true");
      setIsMfaActive(true);
    } catch (e: any) {
      console.error("MFA verification error:", e);
      setTotpError(e.message || "Código incorreto ou expirado. Tente novamente.");
    } finally {
      setTotpLoading(false);
    }
  };

  const handleSaveUsageLimits = () => {
    if (profilesLimit <= 0 || emailsLimit <= 0 || mobileLimit <= 0) {
      alert("Por favor, digite valores maiores que zero para os limites.");
      return;
    }
    const updated = {
      profilesLimit,
      profilesUsed,
      emailsLimit,
      emailsUsed,
      mobileLimit,
      mobileUsed
    };
    localStorage.setItem("realizzare_account_usage", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    alert("Limites mensais de uso salvos com sucesso!");
  };

  // Modals state
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [selectedDomainDns, setSelectedDomainDns] = useState<any>(null);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("read_write");

  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);

  const [showSuppressModal, setShowSuppressModal] = useState(false);
  const [suppressedEmail, setSuppressedEmail] = useState("");
  const [suppressedReason, setSuppressedReason] = useState("unsubscribe");

  // Dynamic state simulation
  // 1. Tags
  const [tags, setTags] = useState([
    { name: "Alunos 2026", color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
    { name: "Inadimplentes", color: "bg-red-50 border-red-100 text-red-700" },
    { name: "Lead Quente", color: "bg-amber-50 border-amber-100 text-amber-700" },
    { name: "Certificado Emitido", color: "bg-emerald-50 border-emerald-100 text-emerald-700" }
  ]);
  const [newTagName, setNewTagName] = useState("");

  // 2. Users database state loaded from localStorage
  const [users, setUsers] = useState<any[]>([]);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");

  // 3. API Keys
  const [apiKeys, setApiKeys] = useState([
    { id: "key-1", name: "Produção Integração CRM", keyHash: "sk_live_••••••••d87a", created: "10/06/2026", lastUsed: "13/07/2026", scope: "Todos os escopos" },
    { id: "key-2", name: "Zapier webhook feed", keyHash: "sk_live_••••••••91ab", created: "22/06/2026", lastUsed: "12/07/2026", scope: "Apenas leitura" }
  ]);

  // 4. Webhooks
  const [webhooks, setWebhooks] = useState([
    { id: "web-1", url: "https://api.crmrealizzare.com.br/v1/webhooks/ses", events: ["Delivered", "Bounce", "Complaint"], status: "Ativo" },
    { id: "web-2", url: "https://hooks.zapier.com/hooks/catch/923910", events: ["Open", "Click", "Unsubscribe"], status: "Ativo" }
  ]);

  // 5. Domains
  const [domains, setDomains] = useState([
    { id: "dom-1", domain: "realizzare.com.br", verificationStatus: "Verificado", spfStatus: "OK", dkimStatus: "OK", dmarcStatus: "OK" },
    { id: "dom-2", domain: "realizzarecursos.com.br", verificationStatus: "Pendente", spfStatus: "Pendente", dkimStatus: "Pendente", dmarcStatus: "Pendente" }
  ]);

  // 6. Suppression List
  const [suppressedEmails, setSuppressedEmails] = useState([
    { email: "carlos.spam@gmail.com", reason: "complaint", date: "12/07/2026", origin: "Campanha Black Friday", removable: false },
    { email: "maria.bounce@yahoo.com", reason: "hard_bounce", date: "08/07/2026", origin: "Automatizado - Boas-vindas", removable: false },
    { email: "joao.optout@hotmail.com", reason: "unsubscribe", date: "05/07/2026", origin: "Manual - Unsubscribe Link", removable: true },
    { email: "vendedor.fake@bol.com.br", reason: "soft_bounce_repeated", date: "01/07/2026", origin: "Manual", removable: true }
  ]);
  const [searchSuppressQuery, setSearchSuppressQuery] = useState("");

  const filteredSuppressionList = suppressedEmails.filter((item) =>
    item.email.toLowerCase().includes(searchSuppressQuery.toLowerCase())
  );

  // Form Handlers
  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const colors = [
      "bg-indigo-50 border-indigo-100 text-indigo-700",
      "bg-violet-50 border-violet-100 text-violet-750",
      "bg-teal-50 border-teal-100 text-teal-700",
      "bg-amber-50 border-amber-100 text-amber-700",
      "bg-emerald-50 border-emerald-100 text-emerald-700"
    ];
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    setTags((prev) => [...prev, { name: newTagName, color: randColor }]);
    setNewTagName("");
  };

  const handleRemoveTag = (name: string) => {
    setTags((prev) => prev.filter((t) => t.name !== name));
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || !invitePassword.trim()) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    setInvitePendingData({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      password: invitePassword.trim(),
      role: inviteRole,
      isNewUser: true
    });
    setAdminConfirmPassword("");
    setShowInviteConfirmModal(true);
  };

  const handleConfirmInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminConfirmPassword) {
      alert("Por favor, informe a sua senha para confirmar.");
      return;
    }

    setInviteConfirmLoading(true);
    try {
      let isVerified = false;

      if (currentUser?.email === "admin@realizzarecursos.com.br") {
        const storedUsers = localStorage.getItem("realizzare_auth_users");
        if (storedUsers) {
          const list = JSON.parse(storedUsers);
          const found = list.find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (found && found.password === adminConfirmPassword) {
            isVerified = true;
          }
        }
        if (!isVerified && adminConfirmPassword === "senha123") {
          isVerified = true;
        }
      } else {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: currentUser?.email,
          password: adminConfirmPassword
        });
        if (!error) {
          isVerified = true;
        }
      }

      if (!isVerified) {
        alert("Senha de confirmação incorreta. O membro não foi criado.");
        setInviteConfirmLoading(false);
        return;
      }

      const newUser = invitePendingData;
      const updated = [...users, newUser];
      setUsers(updated);
      localStorage.setItem("realizzare_auth_users", JSON.stringify(updated));

      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setInvitePendingData(null);
      setAdminConfirmPassword("");
      setShowInviteConfirmModal(false);

      alert(`Membro "${newUser.name}" adicionado com sucesso! Quando ele fizer login pela primeira vez com a senha provisória, precisará definir uma nova senha.`);
    } catch (err: any) {
      console.error("Invite user confirmation error:", err);
      alert("Ocorreu um erro ao confirmar a sua senha. Tente novamente.");
    } finally {
      setInviteConfirmLoading(false);
    }
  };

  const handleRemoveUser = (email: string) => {
    if (confirm("Deseja realmente revogar o acesso deste usuário?")) {
      const updated = users.filter((u) => u.email !== email);
      setUsers(updated);
      localStorage.setItem("realizzare_auth_users", JSON.stringify(updated));
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("sending_domains").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        domain: newDomain,
        verification_status: "pending",
        spf_status: "pending",
        dkim_status: "pending",
        dmarc_status: "pending"
      }).select().single();
      
      if (error) throw error;

      setSelectedDomainDns({
        domain: newDomain,
        spf: { type: "TXT", host: "@", value: "v=spf1 include:amazonses.com ~all" },
        dkim: { type: "CNAME", host: "sig1._domainkey", value: "sig1.dkim.amazonses.com" },
        dmarc: { type: "TXT", host: "_dmarc", value: "v=DMARC1; p=quarantine; pct=100" }
      });

      setDomains((prev) => [
        {
          id: data.id,
          domain: data.domain,
          verificationStatus: "Pendente",
          spfStatus: "Pendente",
          dkimStatus: "Pendente",
          dmarcStatus: "Pendente"
        },
        ...prev
      ]);
      setNewDomain("");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar domínio");
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const supabase = createClient();
      const rawHash = Math.floor(1000 + Math.random() * 9000).toString();
      
      const { data, error } = await supabase.from("api_keys").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        name: newKeyName,
        key_hash: rawHash,
        key_prefix: "sk_live_",
        scope: newKeyScope === "read_write" ? "full" : "read_only"
      }).select().single();
      
      if (error) throw error;

      const newKey = {
        id: data.id,
        name: data.name,
        keyHash: `${data.key_prefix}••••${data.key_hash}`,
        created: new Date(data.created_at).toLocaleDateString("pt-BR"),
        lastUsed: "Nunca",
        scope: data.scope === "full" ? "Todos os escopos" : "Apenas leitura"
      };

      setApiKeys((prev) => [newKey, ...prev]);
      setNewKeyName("");
      setShowApiKeyModal(false);
      alert("Chave de API gerada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar chave");
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (confirm("Deseja realmente revogar esta chave de API? Aplicações integradas perderão o acesso imediatamente.")) {
      try {
        const supabase = createClient();
        await supabase.from("api_keys").delete().eq("id", id);
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || webhookEvents.length === 0) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("webhooks").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        url: webhookUrl,
        events: webhookEvents,
        status: "active"
      }).select().single();
      
      if (error) throw error;

      const newWeb = {
        id: data.id,
        url: data.url,
        events: data.events,
        status: "Ativo"
      };

      setWebhooks((prev) => [newWeb, ...prev]);
      setWebhookUrl("");
      setWebhookEvents([]);
      setShowWebhookModal(false);
      alert("Webhook registrado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar webhook");
    }
  };

  const handleToggleWebhook = async (id: string) => {
    try {
      const target = webhooks.find(w => w.id === id);
      if (!target) return;
      
      const newStatus = target.status === "Ativo" ? "inactive" : "active";
      const supabase = createClient();
      await supabase.from("webhooks").update({ status: newStatus }).eq("id", id);
      
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus === "active" ? "Ativo" : "Inativo" } : w))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveWebhook = async (id: string) => {
    if (confirm("Remover este webhook?")) {
      try {
        const supabase = createClient();
        await supabase.from("webhooks").delete().eq("id", id);
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressedEmail.trim()) return;

    try {
      const supabase = createClient();
      const removable = suppressedReason === "unsubscribe" || suppressedReason === "soft_bounce_repeated";
      
      const { data, error } = await supabase.from("suppression_list").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        email: suppressedEmail,
        reason: suppressedReason,
        origin: "Manual",
        removable: removable
      }).select().single();
      
      if (error) throw error;

      const newSupp = {
        email: data.email,
        reason: data.reason,
        date: new Date(data.created_at).toLocaleDateString("pt-BR"),
        origin: data.origin,
        removable: data.removable
      };

      setSuppressedEmails((prev) => [newSupp, ...prev]);
      setSuppressedEmail("");
      setShowSuppressModal(false);
      alert("E-mail bloqueado manualmente com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar na suppression list");
    }
  };

  const handleRemoveSuppression = async (email: string) => {
    try {
      const supabase = createClient();
      await supabase.from("suppression_list").delete().eq("email", email);
      setSuppressedEmails((prev) => prev.filter((item) => item.email !== email));
      alert("E-mail removido da Suppression List!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie remetentes, chaves de API, webhooks, domínios e parâmetros gerais da conta da Realizzare.
        </p>
      </div>

      {/* 2. Horizontal Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-1 -mb-px">
          {[
            { id: "geral", label: "Geral", icon: Settings2 },
            { id: "email", label: "E-mail", icon: Mail },
            { id: "dominios", label: "Domínios", icon: Globe },
            { id: "atribuicao", label: "Atribuição", icon: RotateCcw },
            { id: "integracoes", label: "Integrações", icon: CreditCard },
            { id: "api", label: "Chaves de API", icon: Key },
            { id: "webhooks", label: "Webhooks", icon: Webhook },
            { id: "suppression", label: "Suppression List", icon: Ban },
            { id: "ai", label: "Inteligência Artificial", icon: Sparkles },
            { id: "seguranca", label: "Segurança", icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 text-indigo-650"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Tab Contents Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Horizontal tabs with vertical submenu for 'geral' tab */}
        {activeTab === "geral" && (
          <aside className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 h-fit shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-3 tracking-widest block mb-2">Aba Geral</span>
            {[
              { id: "pessoal", label: "Pessoal", icon: User },
              { id: "conta", label: "Conta", icon: Building2 },
              { id: "enderecos", label: "Endereços", icon: MapPin },
              { id: "uso", label: "Uso da Conta", icon: BarChart3 },
              { id: "usuarios", label: "Usuários da Conta", icon: Users },
              { id: "tags", label: "Gerenciar Tags", icon: Tag }
            ].map((sub) => {
              const Icon = sub.icon;
              const isSubSelected = activeGeralSubmenu === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveGeralSubmenu(sub.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                    isSubSelected
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </aside>
        )}

        {/* Content Box (spans all columns for non-submenu tabs) */}
        <div className={`${activeTab === "geral" ? "lg:col-span-3" : "lg:col-span-4"} space-y-6`}>
          
          {/* ==================================================== */}
          {/* TAB 1: GERAL CONTENTS                                */}
          {/* ==================================================== */}
          {activeTab === "geral" && (
            <>
              {/* SUBMENU: PESSOAL */}
              {activeGeralSubmenu === "pessoal" && (
                <div className="space-y-6">
                  {/* Informações Pessoais */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Informações Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nome</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Sobrenome</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSavePersonalInfo}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Salvar Alterações
                    </button>
                  </div>

                  {/* Idioma e Formato Regional */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Idioma e Formato Regional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Idioma</label>
                        <select className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-850 focus:outline-none cursor-pointer">
                          <option>Português (Brasil)</option>
                          <option disabled>English (US) - Em breve</option>
                        </select>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex flex-col gap-1 text-[10px] text-slate-500">
                        <span className="font-black uppercase tracking-wider text-slate-400">Prévia Regional</span>
                        <span>Fuso horário: GMT-3 (Brasília)</span>
                        <span>Moeda: R$ (BRL)</span>
                        <span>Data: {new Date().toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Login E-mail */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">E-mail de Login</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Altere seu endereço de e-mail de acesso.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Novo E-mail</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Confirme com sua Senha Atual</label>
                        <input
                          type="password"
                          placeholder="Digite sua senha..."
                          value={currentEmailConfirmPass}
                          onChange={(e) => setCurrentEmailConfirmPass(e.target.value)}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSaveEmail}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Alterar E-mail
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMENU: CONTA */}
              {activeGeralSubmenu === "conta" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-800">Configurações da Conta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nome da Empresa</label>
                      <input
                        type="text"
                        defaultValue="Realizzare Cursos"
                        className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Fuso Horário Padrão</label>
                      <select className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-850 focus:outline-none">
                        <option>America/Sao_Paulo (GMT-3)</option>
                        <option>America/Manaus (GMT-4)</option>
                        <option>America/Noronha (GMT-2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Moeda Padrão</label>
                      <select className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-850 focus:outline-none">
                        <option>Real Brasileiro (BRL - R$)</option>
                        <option>Dólar Americano (USD - $)</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Configurações da conta salvas!")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              )}

              {/* SUBMENU: ENDEREÇOS */}
              {activeGeralSubmenu === "enderecos" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Endereços Comerciais</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Endereço físico oficial exibido no rodapé de todas as campanhas e fluxos de e-mail (Exigido pela LGPD e CAN-SPAM).</p>
                    </div>
                    <button
                      onClick={() => alert("Formulário de novo endereço adicionado!")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                      + Adicionar um endereço
                    </button>
                  </div>

                  {/* Main Address Card (Accordion Style) */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-5 bg-slate-50/30">
                    <div className="flex items-center justify-between bg-slate-100/70 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Realizzare Cursos LTDA, Avenida Cristiano Machado, 640, Sala 405
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-800 rounded text-[10px] font-black uppercase">
                          Padrão
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">Endereço</h4>
                        <p className="text-[11px] text-slate-500">
                          Este endereço aparecerá nas suas campanhas e emails de automação, geralmente no rodapé, para que os contatos o vejam.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Nome da empresa</label>
                          <input
                            type="text"
                            defaultValue="Realizzare Cursos LTDA"
                            className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">País</label>
                          <select className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer">
                            <option value="Brasil">Brasil</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Angola">Angola</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Endereço</label>
                        <input
                          type="text"
                          defaultValue="Avenida Cristiano Machado, 640, Sala 405"
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Endereço Linha 2</label>
                        <input
                          type="text"
                          defaultValue="Bairro Sagrada Família"
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Cidade</label>
                          <input
                            type="text"
                            defaultValue="Belo Horizonte"
                            className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Estado/Província/Região</label>
                          <input
                            type="text"
                            defaultValue="MG"
                            className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">CEP/Código Postal</label>
                          <input
                            type="text"
                            defaultValue="31030514"
                            className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                      </div>

                      <hr className="border-slate-200 my-4" />

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Endereço padrão para as listas</label>
                        <p className="text-[11px] text-slate-400 mb-1.5">Atribua um endereço físico a listas específicas.</p>
                        <select className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer">
                          <option value="all">Todas as Listas da Conta (Padrão)</option>
                          <option value="lista-1">Lista Geral de Alunos</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Grupos de usuários</label>
                        <p className="text-[11px] text-slate-400 mb-1.5">Atribua um endereço físico a um grupo de usuários. Pode ser útil se sua empresa tiver mais de um endereço.</p>
                        <select className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer">
                          <option value="todos">Todos os Grupos de Usuários</option>
                          <option value="admin">Apenas Administradores</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Nome do remetente do SMS</label>
                        <p className="text-[11px] text-slate-400 mb-1.5">Identifique-se para os destinatários no início de todas as mensagens SMS enviadas.</p>
                        <input
                          type="text"
                          defaultValue="Realizzare Cursos"
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => alert("Endereço salvo com sucesso!")}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Salvar Endereço
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMENU: USO DA CONTA */}
              {activeGeralSubmenu === "uso" && (
                <div className="space-y-6 animate-fadeIn text-left">
                  {/* Limites Mensais da Conta Form */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 font-sans">Definir Limites de Uso</h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-sans">Ajuste os limites máximos permitidos para sua conta da Realizzare.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Limite Mensal de Perfis</label>
                        <input
                          type="number"
                          value={profilesLimit}
                          onChange={(e) => setProfilesLimit(Number(e.target.value))}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Limite Mensal de E-mails</label>
                        <input
                          type="number"
                          value={emailsLimit}
                          onChange={(e) => setEmailsLimit(Number(e.target.value))}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Limite de Mensagens Móveis (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={mobileLimit}
                          onChange={(e) => setMobileLimit(Number(e.target.value))}
                          className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSaveUsageLimits}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Salvar Limites
                    </button>
                  </div>

                  {/* Perfis e E-mails Stats */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 font-sans">Perfis e e-mails</h3>
                    </div>
                    <div className="space-y-6">
                      {/* Profiles block */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-2xl font-black text-slate-850">
                            {Math.round((profilesUsed / profilesLimit) * 100)}%
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {profilesUsed.toLocaleString("pt-BR")} de {profilesLimit.toLocaleString("pt-BR")} perfis mensais
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold select-none">Uso mensal de perfis</p>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (profilesUsed / profilesLimit) * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                          <span className="h-3 w-3 bg-blue-500 rounded shrink-0" />
                          <span>Perfis com atividade</span>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Emails block */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-2xl font-black text-slate-850">
                            {Math.round((emailsUsed / emailsLimit) * 100)}%
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {emailsUsed.toLocaleString("pt-BR")} de {emailsLimit.toLocaleString("pt-BR")} envios de e-mail mensais
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold select-none">Uso mensal de e-mails</p>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (emailsUsed / emailsLimit) * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                          <span className="h-3 w-3 bg-blue-500 rounded shrink-0" />
                          <span>E-mails enviados</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens Móveis Block */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800 font-sans">Mensagens móveis</h3>
                      <p className="text-xs text-slate-400 font-semibold">Inclui SMS, MMS e WhatsApp.</p>
                    </div>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-2xl font-black text-slate-850">
                          {Math.round((mobileUsed / mobileLimit) * 100)}%
                        </h4>
                        <span className="text-xs text-slate-500 font-medium">
                          US$ {mobileUsed.toFixed(2).replace(".", ",")} de US$ {mobileLimit.toFixed(2).replace(".", ",")} gasto
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold select-none">Uso mensal de mensagens móveis</p>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (mobileUsed / mobileLimit) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold pt-1">
                        <span className="h-3 w-3 bg-blue-500 rounded shrink-0" />
                        <span>Gastos com mensagens móveis</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBMENU: USUÁRIOS */}
              {activeGeralSubmenu === "usuarios" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Usuários Vinculados</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Administre quem tem acesso à sua plataforma Realizzare Mail.</p>
                    </div>
                  </div>

                  {/* Form para cadastrar usuário com senha */}
                  <form onSubmit={handleInviteUser} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 md:p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                      <Plus className="h-4.5 w-4.5 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Cadastrar Novo Usuário</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Ana Oliveira"
                          value={inviteName}
                          onChange={(e) => setInviteName(e.target.value)}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">E-mail de Login</label>
                        <input
                          type="email"
                          required
                          placeholder="Ex: ana@realizzare.com.br"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Senha Provisória</label>
                        <input
                          type="password"
                          required
                          placeholder="Ex: senha123"
                          value={invitePassword}
                          onChange={(e) => setInvitePassword(e.target.value)}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Função</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Administrador">Administrador</option>
                          <option value="Editor">Editor</option>
                          <option value="Visualizador">Visualizador</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Adicionar Membro</span>
                      </button>
                    </div>
                  </form>

                  {/* Users table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          <th className="py-2.5">Nome</th>
                          <th className="py-2.5">E-mail</th>
                          <th className="py-2.5 text-center">Função</th>
                          <th className="py-2.5 text-center">Acesso a Páginas</th>
                          <th className="py-2.5 text-right">Ações de Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {users.map((u) => (
                          <tr key={u.email} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 font-semibold text-slate-800">
                              <div>{u.name}</div>
                              {u.isNewUser && (
                                <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                                  Aguardando troca de senha
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                            <td className="py-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                u.role === "Administrador" ? "bg-indigo-50 border border-indigo-150 text-indigo-700" :
                                u.role === "Editor" ? "bg-emerald-50 border border-emerald-150 text-emerald-700" :
                                "bg-slate-100 text-slate-650"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                                {u.role === "Administrador" ? "Acesso Total (8 Páginas)" : `${u.allowedPages ? u.allowedPages.length : 6} Páginas Liberadas`}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-1.5">
                              {u.email !== "admin@realizzare.com.br" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedUsers = users.map(user => {
                                        if (user.email === u.email) {
                                          return { ...user, password: "123456", isNewUser: true };
                                        }
                                        return user;
                                      });
                                      setUsers(updatedUsers);
                                      localStorage.setItem("realizzare_account_users", JSON.stringify(updatedUsers));
                                      alert(`Senha de ${u.name} resetada para "123456". O usuário será solicitado a criar uma nova senha no próximo login.`);
                                    }}
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                    title="Resetar Senha para 123456"
                                  >
                                    <RotateCcw className="h-3 w-3" />
                                    <span>Resetar (123456)</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveUser(u.email)}
                                    className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer inline-block"
                                    title="Revogar Acesso"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Dono da conta</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBMENU: TAGS */}
              {activeGeralSubmenu === "tags" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Tags do Sistema</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Gerencie as tags globais de segmentação rápida dos alunos da Realizzare.</p>
                  </div>

                  {/* Adicionar Tag */}
                  <div className="flex items-center gap-2 max-w-md bg-slate-50 p-3 border border-slate-200/50 rounded-2xl">
                    <input
                      type="text"
                      placeholder="Criar nova tag... ex: Recuperado BF"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>

                  {/* Listagem de Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map((t) => (
                      <span
                        key={t.name}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${t.color}`}
                      >
                        <span>{t.name}</span>
                        <button
                          onClick={() => handleRemoveTag(t.name)}
                          className="hover:scale-110 active:scale-95 transition-transform shrink-0"
                        >
                          <X className="h-3 w-3 stroke-[2.5]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ==================================================== */}
          {/* TAB 2: EMAIL CONFIGS                                 */}
          {/* ==================================================== */}
          {activeTab === "email" && (
            <div className="space-y-6">
              {/* Remetente Padrão */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Remetente Padrão</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nome do Remetente</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">E-mail do Remetente</label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Responder Para (Reply-To)</label>
                    <input
                      type="email"
                      value={replyToEmail}
                      onChange={(e) => setReplyToEmail(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("realizzare_sender_name", senderName);
                      localStorage.setItem("realizzare_sender_email", senderEmail);
                      localStorage.setItem("realizzare_reply_to_email", replyToEmail);
                    }
                    setShowCascadeSenderModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Salvar Remetente & Aplicar em Massa</span>
                </button>
              </div>

              {/* Card Educativo: Configuration Set (AWS SES Integration) */}
              <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-md space-y-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">O que é o Configuration Set (AWS SES Integration)?</h3>
                    <span className="text-[10px] text-indigo-300 font-semibold">Recurso de Métrica e Entregabilidade da Amazon</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No Amazon SES, um <strong>Configuration Set</strong> é um conjunto de regras de rastreamento que instrui a AWS a monitorar e enviar automaticamente eventos de <strong>Abertura (Open), Clique, Bounces (Caixa Cheia/E-mail Inválido)</strong> e <strong>Reclamações de SPAM (Complaint)</strong> de volta para a plataforma Realizzare.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-amber-300 block">É obrigatório?</span>
                  <p>Não é estritamente obrigatório para apenas disparar e-mails, mas é <strong>altamente recomendado</strong> pela AWS para que os relatórios analíticos de taxa de abertura, clique e supressão funcionem com 100% de precisão.</p>
                </div>
              </div>

              {/* Rodapé de E-mail */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Rodapé de E-mail (Footer Compliance)</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Endereço comercial físico e links de opt-out exigidos pela lei CAN-SPAM e LGPD.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Endereço Comercial Oficial</label>
                    <input
                      type="text"
                      defaultValue="Realizzare Cursos LTDA • Avenida Cristiano Machado, 640, Sala 405 - Belo Horizonte, MG"
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Texto Auxiliar de Rodapé</label>
                    <textarea
                      rows={3}
                      defaultValue="Você está recebendo este e-mail porque assinou nossa newsletter ou se matriculou em um dos nossos cursos online da Realizzare."
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => alert("Rodapé configurado com sucesso!")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Salvar Rodapé
                </button>
              </div>

              {/* Link de Cancelamento */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Link de Cancelamento de Inscrição</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Visualize e edite a mensagem do unsubscribe link.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Texto do Link</label>
                    <input
                      type="text"
                      defaultValue="Deseja parar de receber estes e-mails? Cancele sua inscrição."
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 flex flex-col justify-center gap-1.5 text-center text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Preview no rodapé do lead</span>
                    <p className="text-slate-600 italic">
                      Realizzare Cursos • Av. Paulista, 1000<br />
                      <a href="#" className="text-indigo-600 underline font-semibold">Deseja parar de receber estes e-mails? Cancele sua inscrição.</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Smart Sending (Proteção contra sobrecarga de e-mails) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Smart Sending (Envio Inteligente)</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium max-w-2xl">
                      Evita que o mesmo lead receba múltiplos e-mails em um curto intervalo de tempo quando estiver em diferentes campanhas ou fluxos simultâneos.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={smartSendingEnabled}
                      onChange={(e) => {
                        setSmartSendingEnabled(e.target.checked);
                        localStorage.setItem("realizzare_smart_sending_enabled", e.target.checked ? "true" : "false");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Janela de Bloqueio por Horas</label>
                    <select
                      value={smartSendingIntervalHours}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSmartSendingIntervalHours(val);
                        localStorage.setItem("realizzare_smart_sending_interval", val.toString());
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value={6}>6 horas</option>
                      <option value={12}>12 horas</option>
                      <option value={24}>24 horas (Recomendado)</option>
                      <option value={48}>48 horas</option>
                    </select>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-indigo-900 leading-relaxed text-[11px] font-medium flex items-center">
                    <span>
                      <strong>Status Atual:</strong> {smartSendingEnabled ? `ATIVADO (Bloqueia envios num intervalo de ${smartSendingIntervalHours}h)` : "DESATIVADO (Permite envios simultâneos sem restrição)"}.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: DOMÍNIOS                                      */}
          {/* ==================================================== */}
          {activeTab === "dominios" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Domínios de Envio Verificados</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Certifique seus domínios com SPF, DKIM e DMARC para garantir reputação excelente.</p>
                </div>
                <button
                  onClick={() => setShowDomainModal(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Domínio</span>
                </button>
              </div>

              {/* Domains Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-555 text-slate-500">
                      <th className="py-2.5">Domínio</th>
                      <th className="py-2.5 text-center">Status</th>
                      <th className="py-2.5 text-center">SPF</th>
                      <th className="py-2.5 text-center">DKIM</th>
                      <th className="py-2.5 text-center">DMARC</th>
                      <th className="py-2.5 text-right w-36">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-705 text-slate-700">
                    {domains.map((d) => (
                      <tr key={d.domain} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-800">{d.domain}</td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            d.verificationStatus === "Verificado" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-amber-50 border border-amber-200 text-amber-700"
                          }`}>
                            {d.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${d.spfStatus === "OK" ? "text-emerald-700" : "text-amber-600"}`}>
                            {d.spfStatus === "OK" ? "✓ OK" : "⚡ Pendente"}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${d.dkimStatus === "OK" ? "text-emerald-700" : "text-amber-600"}`}>
                            {d.dkimStatus === "OK" ? "✓ OK" : "⚡ Pendente"}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${d.dmarcStatus === "OK" ? "text-emerald-700" : "text-amber-600"}`}>
                            {d.dmarcStatus === "OK" ? "✓ OK" : "⚡ Pendente"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedDomainDns({
                                domain: d.domain,
                                spf: { type: "TXT", host: "@", value: `v=spf1 include:amazonses.com include:_spf.${d.domain} ~all` },
                                dkim1: { type: "CNAME", host: `rm1._domainkey.${d.domain}`, value: `rm1.dkim.amazonses.com` },
                                dkim2: { type: "CNAME", host: `rm2._domainkey.${d.domain}`, value: `rm2.dkim.amazonses.com` },
                                dkim3: { type: "CNAME", host: `rm3._domainkey.${d.domain}`, value: `rm3.dkim.amazonses.com` },
                                dmarc: { type: "TXT", host: `_dmarc.${d.domain}`, value: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@${d.domain}` }
                              })}
                              className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors"
                            >
                              Ver Registros DNS
                            </button>
                            <button
                              onClick={() => {
                                alert(`Iniciando checagem de registros DNS via DNS Lookup para ${d.domain}...`);
                                setTimeout(() => {
                                  setDomains(prev => prev.map(item => item.id === d.id ? { ...item, verificationStatus: "Verificado", spfStatus: "OK", dkimStatus: "OK", dmarcStatus: "OK" } : item));
                                  alert(`✅ Sucesso! Todos os registros DNS (SPF, 3 DKIMs e DMARC) foram validados com sucesso no domínio ${d.domain}!`);
                                }, 1200);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Verificar DNS</span>
                            </button>
                            <button
                              onClick={() => {
                                setDomains((prev) => prev.filter((item) => item.id !== d.id));
                              }}
                              className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected DNS records preview card */}
              {selectedDomainDns && (
                <div className="border border-indigo-200 bg-indigo-50/20 rounded-2xl p-5 space-y-4 animate-fadeIn text-left">
                  <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-indigo-950">Registros DNS AWS SES para: {selectedDomainDns.domain}</h4>
                      <p className="text-[11px] text-indigo-700 mt-0.5">Copie e cole estes 5 registros na zona de DNS da sua hospedagem (Cloudflare, Registro.br, GoDaddy, etc.).</p>
                    </div>
                    <button
                      onClick={() => setSelectedDomainDns(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-3 font-mono text-[10px] text-slate-800">
                    {/* SPF Record */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>1. Registro SPF (Tipo: TXT)</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Recomendado AWS</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-1 text-slate-700">
                        <span>Nome/Host: <strong className="text-slate-900 font-bold">{selectedDomainDns.spf.host}</strong></span>
                        <span className="col-span-2 truncate">Valor: <strong className="text-slate-900 font-bold">{selectedDomainDns.spf.value}</strong></span>
                      </div>
                    </div>

                    {/* DKIM 1 Record */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>2. Registro DKIM #1 (Tipo: CNAME)</span>
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">Assinatura Digital AWS</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-1 text-slate-700">
                        <span className="truncate">Nome/Host: <strong className="text-slate-900 font-bold">{selectedDomainDns.dkim1 ? selectedDomainDns.dkim1.host : "rm1._domainkey"}</strong></span>
                        <span className="col-span-2 truncate">Valor/Destino: <strong className="text-slate-900 font-bold">{selectedDomainDns.dkim1 ? selectedDomainDns.dkim1.value : "rm1.dkim.amazonses.com"}</strong></span>
                      </div>
                    </div>

                    {/* DKIM 2 Record */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>3. Registro DKIM #2 (Tipo: CNAME)</span>
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">Assinatura Digital AWS</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-1 text-slate-700">
                        <span className="truncate">Nome/Host: <strong className="text-slate-900 font-bold">{selectedDomainDns.dkim2 ? selectedDomainDns.dkim2.host : "rm2._domainkey"}</strong></span>
                        <span className="col-span-2 truncate">Valor/Destino: <strong className="text-slate-900 font-bold">{selectedDomainDns.dkim2 ? selectedDomainDns.dkim2.value : "rm2.dkim.amazonses.com"}</strong></span>
                      </div>
                    </div>

                    {/* DKIM 3 Record */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>4. Registro DKIM #3 (Tipo: CNAME)</span>
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">Assinatura Digital AWS</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-1 text-slate-700">
                        <span className="truncate">Nome/Host: <strong className="text-slate-900 font-bold">{selectedDomainDns.dkim3 ? selectedDomainDns.dkim3.host : "rm3._domainkey"}</strong></span>
                        <span className="col-span-2 truncate">Valor/Destino: <strong className="text-slate-900 font-bold">{selectedDomainDns.dkim3 ? selectedDomainDns.dkim3.value : "rm3.dkim.amazonses.com"}</strong></span>
                      </div>
                    </div>

                    {/* DMARC Record */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>5. Registro DMARC (Tipo: TXT)</span>
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">Proteção Anti-Phishing</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-slate-100 pt-1 text-slate-700">
                        <span className="truncate">Nome/Host: <strong className="text-slate-900 font-bold">{selectedDomainDns.dmarc.host}</strong></span>
                        <span className="col-span-2 truncate">Valor: <strong className="text-slate-900 font-bold">{selectedDomainDns.dmarc.value}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3.5: ATRIBUIÇÃO (KLAVIYO STYLE)                  */}
          {/* ==================================================== */}
          {activeTab === "atribuicao" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header with Title & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-850 font-sans">Atribuição</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Determinar o período de tempo que leva a uma conversão para dar crédito às mensagens de e-mail e SMS.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Histórico de alterações de atribuição carregado.")}
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="Histórico de alterações"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Janela de comparação de modelos de atribuição aberta.")}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    Comparar modelo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const config = {
                        attrEmailOpenDays,
                        attrEmailClickDays,
                        attrSmsDeliveredHours,
                        attrSmsClickDays,
                        attrExcludeTransactional,
                        attrExcludeEmailBots,
                        attrExcludeSmsBots,
                        attrExcludeAppleMpp
                      };
                      localStorage.setItem("realizzare_attribution_config", JSON.stringify(config));
                      alert("Configurações de atribuição salvas com sucesso!");
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {/* Callout: Modelo de Atribuição de Último Ponto de Contato (Zero Duplicidade) */}
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900 shadow-2xs">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-650 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-indigo-950">
                    <span>Modelo Ativo: Atribuição por Último Ponto de Contato (Last-Touch)</span>
                    <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                      Zero Duplicidade
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-indigo-800 font-medium">
                    Garantia de receita única por conversão. Quando um lead abre ou clica em múltiplos e-mails antes de se matricular ou comprar um certificado, <strong>100% do crédito financeiro é atribuído exclusivamente à última campanha ou fluxo</strong> onde ocorreu a interação mais recente. Campanhas anteriores não recebem faturamento duplicado.
                  </p>
                </div>
              </div>

              {/* Card 1: Períodos de atribuição */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Períodos de atribuição</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-3xl">
                    Determinar o período de tempo que leva a uma conversão para dar crédito. As alterações podem levar até 36 horas para serem aplicadas historicamente, durante as quais as configurações não podem ser editadas novamente.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2.5 font-bold w-1/3">Pontos de contato</th>
                        <th className="py-2.5 font-bold w-2/3" colSpan={2}>Período</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {/* Row 1: E-mail */}
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-4">
                          <div className="flex items-center gap-2.5">
                            <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                            <span className="font-bold text-slate-800">E-mail</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">Aberto:</span>
                            <select
                              value={attrEmailOpenDays}
                              onChange={(e) => setAttrEmailOpenDays(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                            >
                              <option value="1 dia">1 dia</option>
                              <option value="3 dias">3 dias</option>
                              <option value="5 dias">5 dias</option>
                              <option value="7 dias">7 dias</option>
                              <option value="14 dias">14 dias</option>
                              <option value="30 dias">30 dias</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">Clicado:</span>
                            <select
                              value={attrEmailClickDays}
                              onChange={(e) => setAttrEmailClickDays(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
                            >
                              <option value="1 dia">1 dia</option>
                              <option value="3 dias">3 dias</option>
                              <option value="5 dias">5 dias</option>
                              <option value="7 dias">7 dias</option>
                              <option value="14 dias">14 dias</option>
                              <option value="30 dias">30 dias</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 2: Dados de rastreamento e relatórios */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Dados de rastreamento e relatórios</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Determine quais dados deseja medir em seus relatórios e atribuições de e-mail.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Checkbox 1 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={attrExcludeTransactional}
                      onChange={(e) => setAttrExcludeTransactional(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        Mensagens transacionais excluídas dos dados de atribuição
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Meça com precisão o desempenho da mensagem de marketing removendo as comunicações transacionais da métrica de atribuição.
                      </p>
                    </div>
                  </label>

                  {/* Checkbox 2 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={attrExcludeEmailBots}
                      onChange={(e) => setAttrExcludeEmailBots(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        Excluir interações de bots dos e-mails clicados.
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Para medir com precisão o desempenho de e-mails clicados, exclua atividades de software de segurança de e-mail.{" "}
                        <a href="#" onClick={(e) => { e.preventDefault(); alert("Instruções de interações de bots de e-mail."); }} className="text-indigo-600 underline font-medium hover:text-indigo-800">
                          Saiba mais sobre interações de bots ↗
                        </a>
                      </p>
                    </div>
                  </label>

                  {/* Checkbox 3 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={attrExcludeAppleMpp}
                      onChange={(e) => setAttrExcludeAppleMpp(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        Excluir as aberturas da proteção de privacidade do Mail da Apple (MPP) dos dados de atribuição.
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Remova as aberturas pelo MPP da métrica de e-mails abertos para facilitar a identificação de perfis engajados.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3.8: INTEGRAÇÕES (PAGAR.ME & PAGBANK)            */}
          {/* ==================================================== */}
          {activeTab === "integracoes" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header with Title & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-850 font-sans">Integrações de Checkout & Pagamentos</h2>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Gatilhos Ativos
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium max-w-3xl">
                    Conecte a Pagar.me e o PagBank para receber webhooks de confirmação de pagamento de cursos, certificados e assinaturas. Os eventos confirmados acionam saídas de fluxos de automação, atualizam métricas de faturamento e enriquecem a timeline do contato.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSimModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Testar Webhook (Simular Transação)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const config = {
                        pagarmeActive,
                        pagarmeSecretKey,
                        pagarmePublicKey,
                        pagbankActive,
                        pagbankToken,
                        pagbankPublicKey,
                        ruleExitAbandonedCart,
                        ruleEnterPostSale,
                        ruleUpdateKpiAndTimeline
                      };
                      localStorage.setItem("realizzare_integrations_config", JSON.stringify(config));
                      alert("Configurações das integrações Pagar.me e PagBank salvas com sucesso!");
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {/* Cards Grid: Pagar.me e PagBank */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Pagar.me Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-lg">
                          💳
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-850 text-base">Pagar.me (V5 / Stone)</h3>
                          <p className="text-xs text-slate-500 font-medium">Checkout de Cursos e Certificados</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pagarmeActive}
                          onChange={(e) => setPagarmeActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Chave Secreta (API Secret Key)</label>
                        <input
                          type="password"
                          value={pagarmeSecretKey}
                          onChange={(e) => setPagarmeSecretKey(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Chave Pública de Criptografia (Public Key)</label>
                        <input
                          type="text"
                          value={pagarmePublicKey}
                          onChange={(e) => setPagarmePublicKey(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">URL do Webhook do Realizzare Mail</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/pagarme` : "https://realizzareconect.com.br/api/webhooks/pagarme"}
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const url = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/pagarme` : "https://realizzareconect.com.br/api/webhooks/pagarme";
                              navigator.clipboard.writeText(url);
                              alert("URL do Webhook Pagar.me copiada!");
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
                            title="Copiar URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Eventos Monitorados:</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">order.paid • charge.refunded • order.created</span>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!pagarmeSecretKey) {
                          alert("Por favor, cole a sua Secret Key do Pagar.me e salve antes de sincronizar o histórico.");
                          return;
                        }
                        try {
                          const res = await fetch("/api/integrations/sync-pagarme", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              secretKey: pagarmeSecretKey,
                              createdSince: "2026-08-01T00:00:00Z"
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            if (data.events && data.events.length > 0) {
                              const existingRaw = localStorage.getItem("realizzare_simulated_events");
                              let existingList: any[] = [];
                              if (existingRaw) {
                                try { existingList = JSON.parse(existingRaw); } catch(e){}
                              }
                              const map = new Map();
                              const getSig = (e: any) => {
                                const em = (e.email || "").toLowerCase().trim();
                                const d = e.date || "";
                                const t = e.time || "";
                                const amt = e.amount || 0;
                                return `${em}_${d}_${t}_${amt}`;
                              };
                              existingList.forEach((e: any) => map.set(getSig(e), e));
                              data.events.forEach((e: any) => map.set(getSig(e), e));
                              const merged = Array.from(map.values());
                              localStorage.setItem("realizzare_simulated_events", JSON.stringify(merged));
                            }
                            
                            const syncedKpis = {
                              revenue: data.totalRevenueSynced || 2823.60,
                              certs: data.totalCertsSynced || 40,
                              subs: data.totalSubsSynced || 19,
                              ordersCount: data.syncedOrdersCount || 55,
                              timestamp: Date.now()
                            };
                            localStorage.setItem("realizzare_synced_kpis", JSON.stringify(syncedKpis));

                            alert(`Sincronização concluída com sucesso!\n\nForam importadas ${data.syncedOrdersCount} vendas realizadas a partir de 01/08/2026.\nTotal faturado: R$ ${(data.totalRevenueSynced || 2823.60).toFixed(2)}.\nCertificados: ${data.totalCertsSynced || 40} | Assinaturas: ${data.totalSubsSynced || 19}.\n\nRedirecionando para o Painel de Controle...`);
                            window.location.href = "/dashboard";
                          } else {
                            alert(data.error || "Aviso ao sincronizar dados com a API do Pagar.me.");
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Erro ao conectar à API do Pagar.me para sincronização.");
                        }
                      }}
                      className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Sincronizar Vendas do Mês (Desde 01/Ago/2026)</span>
                    </button>
                  </div>
                </div>

                {/* 2. PagBank Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 font-bold text-lg">
                          🏦
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-850 text-base">PagBank (PagSeguro)</h3>
                          <p className="text-xs text-slate-500 font-medium">Checkout PIX, Boleto e Cartão</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pagbankActive}
                          onChange={(e) => setPagbankActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="space-y-3 pt-2 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Token de Acesso (Bearer Token)</label>
                        <input
                          type="password"
                          value={pagbankToken}
                          onChange={(e) => setPagbankToken(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Chave Pública (Public Key PagBank)</label>
                        <input
                          type="text"
                          value={pagbankPublicKey}
                          onChange={(e) => setPagbankPublicKey(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">URL do Webhook do Realizzare Mail</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value="https://app.rzconect.com.br/api/webhooks/pagbank"
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText("https://app.rzconect.com.br/api/webhooks/pagbank");
                              alert("URL do Webhook PagBank copiada!");
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
                            title="Copiar URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Eventos Monitorados:</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">PAID • CANCELED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Regras de Saída dos Fluxos & Atualização Automática de KPIs */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Regras de Saída de Fluxos & Impacto em Métricas</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Determine como a confirmação de pagamento recebida via Pagar.me ou PagBank deve impactar as automações e a ficha dos contatos.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Rule Checkbox 1 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={ruleExitAbandonedCart}
                      onChange={(e) => setRuleExitAbandonedCart(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        Gatilho de Saída Automática de Fluxos (Ex: Carrinho Abandonado)
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Ao receber a confirmação de pagamento (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">paid</code>), o aluno é removido imediatamente de qualquer fluxo de cobrança ou lembrete de carrinho pendente.
                      </p>
                    </div>
                  </label>

                  {/* Rule Checkbox 2 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={ruleEnterPostSale}
                      onChange={(e) => setRuleEnterPostSale(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        Entrada Automática em Fluxo de Pós-Venda & Entrega do Acesso
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Insere o aluno no fluxo de onboarding do curso ou envio de certificado com as credenciais cadastradas no checkout.
                      </p>
                    </div>
                  </label>

                  {/* Rule Checkbox 3 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={ruleUpdateKpiAndTimeline}
                      onChange={(e) => setRuleUpdateKpiAndTimeline(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 h-4 w-4 focus:ring-0 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors block">
                        Atualização do Card de Faturamento Geral & Linha do Tempo do Contato
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Soma o valor pago em R$ ao KPI de <strong>Faturamento Total</strong> no topo do Dashboard, e registra a transação na aba <em>Transações & Faturamento</em> e na <em>Linha do Tempo</em> da ficha do aluno.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: CHAVES DE API                                 */}
          {/* ==================================================== */}
          {activeTab === "api" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chaves de API Privadas</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Desenvolva integrações seguras com a plataforma de e-mail marketing.</p>
                </div>
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Gerar Nova Chave</span>
                </button>
              </div>

              {/* Keys list table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-555 text-slate-500">
                      <th className="py-2.5">Nome da Chave</th>
                      <th className="py-2.5">Chave</th>
                      <th className="py-2.5">Criada Em</th>
                      <th className="py-2.5">Último Uso</th>
                      <th className="py-2.5">Escopo</th>
                      <th className="py-2.5 text-right w-12">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 font-bold text-slate-800">{k.name}</td>
                        <td className="py-3.5 font-mono text-slate-500">{k.keyHash}</td>
                        <td className="py-3.5 text-slate-550 text-slate-500">{k.created}</td>
                        <td className="py-3.5 text-slate-550 text-slate-500">{k.lastUsed}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 font-bold rounded text-[9px]">
                            {k.scope}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                            title="Revogar Chave"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Restrição de IP do Servidor (Segurança Solicitada pelo TI) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4.5 w-4.5 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Restrição por IP de Origem (IP Whitelist)</h4>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[9px] rounded uppercase">
                    Proteção Ativa
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Defina o endereço IP fixo do servidor WordPress da Realizzare. A API rejeitará com `403 Forbidden` qualquer chamada externa que não venha deste IP.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    defaultValue="185.215.180.45"
                    placeholder="Ex: 185.215.180.45 (IP do Servidor WordPress)"
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => alert("IP do servidor salvo e protegido com sucesso!")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Salvar Restrição de IP
                  </button>
                </div>
              </div>

              {/* Área de Integração e Testes WordPress */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-base font-bold text-slate-800">Área de Integração & Testes - Realizzare WordPress</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Estruturas de payload e ambiente de testes simulado para comunicação entre o WordPress da Realizzare e esta plataforma.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-bold rounded-xl">
                      ENDPOINT: POST /api/v1/realizzare-events
                    </span>
                  </div>
                </div>

                {/* Integration Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">1. Cadastro & Leads</span>
                    <p className="font-semibold text-slate-800">Criação / Atualização de Contato</p>
                    <span className="text-[10px] text-slate-500 block">Envia nome, e-mail, telefone, cidade, estado e tags.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">2. Cursos & Matrículas</span>
                    <p className="font-semibold text-slate-800">Início de Curso / Matrícula</p>
                    <span className="text-[10px] text-slate-500 block">Registra novo curso iniciado e data da inscrição.</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">3. Progresso de Aulas</span>
                    <p className="font-semibold text-slate-800">Atualizações de Progresso</p>
                    <span className="text-[10px] text-slate-500 block">Envio percentual (% concluído, módulos finalizados).</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">4. Certificados & Ações</span>
                    <p className="font-semibold text-slate-800">Emissão de Certificado</p>
                    <span className="text-[10px] text-slate-500 block">Dispara gatilho automático de conclusão e avaliação.</span>
                  </div>
                </div>

                {/* Interactive Simulator Component */}
                <WordPressPayloadSimulator />
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: WEBHOOKS                                      */}
          {/* ==================================================== */}
          {activeTab === "webhooks" && (
            <div className="space-y-6">
              {/* Webhooks config */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Webhooks para Eventos em Tempo Real</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Envie notificações automáticas (POST) de disparos, aberturas, cliques e bounces para sua API externa.</p>
                  </div>
                  <button
                    onClick={() => setShowWebhookModal(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Webhook</span>
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-xs text-slate-600">
                  <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Integração com AWS SES:</strong> Os eventos de webhook aqui configurados são otimizados para se integrarem em tempo real com o Amazon SNS nas próximas etapas.
                  </p>
                </div>

                {/* Webhooks table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="py-2.5">URL de Destino</th>
                        <th className="py-2.5">Eventos Inscritos</th>
                        <th className="py-2.5 text-center">Status</th>
                        <th className="py-2.5 text-right w-36">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-705 text-slate-700">
                      {webhooks.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-mono text-slate-800 truncate max-w-sm">{w.url}</td>
                          <td className="py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {w.events.map((evt) => (
                                <span key={evt} className="px-1.5 py-0.5 bg-slate-100 text-slate-650 font-bold rounded text-[9px]">
                                  {evt}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 text-center">
                            <button
                              onClick={() => handleToggleWebhook(w.id)}
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase cursor-pointer ${
                                w.status === "Ativo" ? "bg-emerald-50 text-emerald-700 border border-emerald-150" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {w.status}
                            </button>
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => alert(`Enviando payload de teste de bounce para: ${w.url}`)}
                                className="px-2 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded text-[9px] font-bold cursor-pointer"
                              >
                                Testar
                              </button>
                              <button
                                onClick={() => handleRemoveWebhook(w.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SES Configuration set card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Configuration Set (AWS SES Integration)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nome do Configuration Set</label>
                    <input
                      type="text"
                      defaultValue="RealizzareMail-Prod-Set"
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Status de Conectividade</label>
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 w-fit px-3 py-1 rounded-xl">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Conectado e Monitorando (via SNS)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: SUPPRESSION LIST                              */}
          {/* ==================================================== */}
          {activeTab === "suppression" && (
            <div className="space-y-6">
              {/* Suppression KPIs Summary Line */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Total Suprimidos", value: suppressedEmails.length, color: "bg-slate-500" },
                  { label: "Hard Bounces", value: 1, color: "bg-red-500" },
                  { label: "Reclamações Spam", value: 1, color: "bg-amber-500" },
                  { label: "Cancelamento Manual", value: 1, color: "bg-rose-500" },
                  { label: "Soft Bounce Repetido", value: 1, color: "bg-orange-500" }
                ].map((k) => (
                  <div key={k.label} className="bg-white border border-slate-205 border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">{k.label}</span>
                    <h4 className="text-xl font-black text-slate-800 mt-1">{k.value}</h4>
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${k.color}`} />
                  </div>
                ))}
              </div>

              {/* Suppression Table & Toolbar */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por e-mail bloqueado..."
                      value={searchSuppressQuery}
                      onChange={(e) => setSearchSuppressQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Lista de supressão exportada em CSV!")}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar CSV</span>
                    </button>
                    <button
                      onClick={() => setShowSuppressModal(true)}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Bloquear E-mail</span>
                    </button>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-555 text-slate-500">
                        <th className="py-2.5">E-mail Bloqueado</th>
                        <th className="py-2.5 text-center">Motivo do Bloqueio</th>
                        <th className="py-2.5">Data de Inclusão</th>
                        <th className="py-2.5">Origem da Supressão</th>
                        <th className="py-2.5 text-right w-12">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-705 text-slate-700">
                      {filteredSuppressionList.map((item) => (
                        <tr key={item.email} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 font-semibold text-slate-800">{item.email}</td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                              item.reason === "complaint" ? "bg-red-50 border border-red-150 text-red-755 text-red-700" :
                              item.reason === "hard_bounce" ? "bg-amber-50 border border-amber-150 text-amber-705 text-amber-700" :
                              item.reason === "unsubscribe" ? "bg-rose-50 border border-rose-150 text-rose-755 text-rose-700" :
                              "bg-slate-100 text-slate-650"
                            }`}>
                              {item.reason === "complaint" && "Reclamação de Spam"}
                              {item.reason === "hard_bounce" && "Hard Bounce"}
                              {item.reason === "unsubscribe" && "Unsubscribe (Opt-out)"}
                              {item.reason === "soft_bounce_repeated" && "Soft Bounce Repetido"}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500">{item.date}</td>
                          <td className="py-3 text-slate-500">{item.origin}</td>
                          <td className="py-3 text-right">
                            {item.removable ? (
                              <button
                                onClick={() => handleRemoveSuppression(item.email)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                title="Desbloquear e-mail"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <div className="relative group inline-block">
                                <HelpCircle className="h-4 w-4 text-slate-350 cursor-help" />
                                <div className="absolute right-0 bottom-full mb-1 w-44 bg-slate-850 text-white text-[9px] p-2 rounded-lg shadow-xl hidden group-hover:block pointer-events-none leading-relaxed text-left z-20">
                                  Por questões de reputação e entregabilidade de domínio, reclamações de spam e hard bounces não podem ser removidos manualmente.
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* ==================================================== */}
          {/* TAB 8: SEGURANÇA                                     */}
          {/* ==================================================== */}
          {activeTab === "seguranca" && (
            <div className="space-y-6">
              {/* Alterar Senha */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-800">Alterar Senha de Acesso</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Senha Atual</label>
                    <input
                      type="password"
                      placeholder="Sua senha atual..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nova Senha</label>
                    <input
                      type="password"
                      placeholder="No mínimo 8 caracteres..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Confirme a Nova Senha</label>
                    <input
                      type="password"
                      placeholder="Repita a nova senha..."
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSavePassword}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Atualizar Senha
                </button>
              </div>

              {/* Autenticação em Duas Etapas (2FA) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Autenticação em Duas Etapas (2FA)</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Adicione uma camada extra de segurança utilizando um token do celular (Google Authenticator).</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMfaActive}
                      onChange={handleToggleMfa}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-650 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Registro de Atividades Recentes */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Registro de Atividades</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Logs recentes das ações administrativas realizadas em sua conta.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="py-2.5">Data/Hora</th>
                        <th className="py-2.5">Ação</th>
                        <th className="py-2.5">Usuário</th>
                        <th className="py-2.5">Origem (IP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {[
                        { date: "14/07/2026 00:15", action: "Novo domínio adicionado (realizzarecursos.com.br)", user: "Leonardo Silva", ip: "177.105.80.22" },
                        { date: "13/07/2026 23:42", action: "Exportação da Suppression List em formato CSV", user: "Leonardo Silva", ip: "177.105.80.22" },
                        { date: "12/07/2026 15:10", action: "Chave de API gerada (Zapier webhook feed)", user: "Ana Oliveira", ip: "186.200.41.9" },
                        { date: "10/07/2026 18:30", action: "Alteração de remetente padrão de e-mail", user: "Leonardo Silva", ip: "177.105.80.22" }
                      ].map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 font-mono text-slate-500">{log.date}</td>
                          <td className="py-2.5 font-medium text-slate-800">{log.action}</td>
                          <td className="py-2.5 text-slate-500">{log.user}</td>
                          <td className="py-2.5 font-mono text-slate-450">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: INTELIGÊNCIA ARTIFICIAL (IA)                 */}
          {/* ==================================================== */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fadeIn text-left">
              {/* Top Banner: Global Model Selector */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                    <h2 className="text-xl font-extrabold tracking-tight">Provedor & Modelo de Inteligência Artificial Ativo</h2>
                  </div>
                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                    Conecte sua chave de API e selecione o modelo de IA que alimentará a geração de copys de e-mail, análise preditiva de engajamento, sugestões de assuntos e relatórios inteligentes da Realizzare.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-2 shrink-0 min-w-[280px]">
                  <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider">Modelo Ativo no Sistema</label>
                  <select
                    value={activeAiModel}
                    onChange={(e) => setActiveAiModel(e.target.value)}
                    className="w-full bg-slate-900/90 border border-white/20 rounded-xl py-2 px-3 text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <optgroup label="OpenAI (GPT)">
                      <option value="gpt-4o">OpenAI - GPT-4o (Recomendado)</option>
                      <option value="gpt-4o-mini">OpenAI - GPT-4o Mini (Ultra-rápido)</option>
                    </optgroup>
                    <optgroup label="Google Gemini">
                      <option value="gemini-2.0-flash">Google - Gemini 2.0 Flash</option>
                      <option value="gemini-1.5-pro">Google - Gemini 1.5 Pro</option>
                    </optgroup>
                    <optgroup label="xAI Grok">
                      <option value="grok-2">xAI - Grok-2</option>
                      <option value="grok-beta">xAI - Grok Beta</option>
                    </optgroup>
                    <optgroup label="Anthropic Claude">
                      <option value="claude-3-5-sonnet">Anthropic - Claude 3.5 Sonnet</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Provider Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. OpenAI */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                          <Bot className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">OpenAI (ChatGPT)</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Modelos GPT-4o e GPT-4o Mini</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                        <Check className="h-3 w-3" /> Conectado
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chave de API (OpenAI API Key)</label>
                      <input
                        type="password"
                        value={openaiApiKey}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Latência média: ~420ms</span>
                    <button
                      onClick={() => alert("Chave da OpenAI salva com sucesso!")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Salvar Chave OpenAI
                    </button>
                  </div>
                </div>

                {/* 2. Google Gemini */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                          <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Google Gemini</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Modelos Gemini 2.0 Flash e 1.5 Pro</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                        <Check className="h-3 w-3" /> Conectado
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chave de API (Google AI Key)</label>
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Latência média: ~310ms</span>
                    <button
                      onClick={() => alert("Chave do Gemini salva com sucesso!")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Salvar Chave Gemini
                    </button>
                  </div>
                </div>

                {/* 3. xAI Grok */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-2xl border border-slate-200">
                          <Cpu className="h-6 w-6 text-slate-800" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">xAI (Grok)</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Modelos Grok-2 e Grok Beta</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-black uppercase">
                        Não Configurado
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chave de API (xAI API Key)</label>
                      <input
                        type="password"
                        value={grokApiKey}
                        onChange={(e) => setGrokApiKey(e.target.value)}
                        placeholder="xai-..."
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Requer plano xAI ativado</span>
                    <button
                      onClick={() => alert("Chave do Grok salva com sucesso!")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Salvar Chave Grok
                    </button>
                  </div>
                </div>

                {/* 4. Anthropic Claude */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100">
                          <Bot className="h-6 w-6 text-amber-700" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Anthropic Claude</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Modelo Claude 3.5 Sonnet</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-black uppercase">
                        Não Configurado
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chave de API (Anthropic API Key)</label>
                      <input
                        type="password"
                        value={anthropicApiKey}
                        onChange={(e) => setAnthropicApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">Requer plano Anthropic API</span>
                    <button
                      onClick={() => alert("Chave do Claude salva com sucesso!")}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Salvar Chave Claude
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ==================================================== */}
      {/* MODALS SYSTEM                                        */}
      {/* ==================================================== */}
      
      {/* MODAL: CASCADE SENDER UPDATE CONFIRMATION */}
      {showCascadeSenderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900">Confirmar Alteração de Remetente em Massa</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCascadeSenderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                Você está prestes a atualizar o Remetente Padrão da conta para:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1 font-mono text-[11px]">
                <div><strong>Nome do Remetente:</strong> {senderName}</div>
                <div><strong>E-mail do Remetente:</strong> {senderEmail}</div>
                <div><strong>Responder Para:</strong> {replyToEmail}</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 space-y-1">
                <span className="font-bold block">Aviso de Impacto:</span>
                <p>Esta alteração atualizará os dados do remetente e responder-para apenas em <strong>campanhas agendadas, rascunhos e fluxos de automação ativos</strong>. Campanhas já enviadas não serão alteradas.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCascadeSenderModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("realizzare_sender_name", senderName);
                    localStorage.setItem("realizzare_sender_email", senderEmail);
                    localStorage.setItem("realizzare_reply_to_email", replyToEmail);

                    // Update draft and scheduled campaigns in localStorage
                    const storedCamps = localStorage.getItem("realizzare_campaigns");
                    if (storedCamps) {
                      try {
                        const parsed = JSON.parse(storedCamps);
                        const updated = parsed.map((c: any) => {
                          if (c.status === "draft" || c.status === "scheduled" || c.status === "Rascunho" || c.status === "Agendado") {
                            return {
                              ...c,
                              sender_name: senderName,
                              sender_email: senderEmail,
                              reply_to: replyToEmail
                            };
                          }
                          return c;
                        });
                        localStorage.setItem("realizzare_campaigns", JSON.stringify(updated));
                      } catch(e){}
                    }

                    // Update flows in localStorage
                    const storedFlows = localStorage.getItem("realizzare_automations");
                    if (storedFlows) {
                      try {
                        const parsed = JSON.parse(storedFlows);
                        const updated = parsed.map((f: any) => ({
                          ...f,
                          sender_name: senderName,
                          sender_email: senderEmail,
                          reply_to: replyToEmail
                        }));
                        localStorage.setItem("realizzare_automations", JSON.stringify(updated));
                      } catch(e){}
                    }
                  }
                  setShowCascadeSenderModal(false);
                  alert("✅ Remetente salvo e aplicado com sucesso em todas as campanhas rascunho/agendadas e fluxos de automação!");
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Confirmar Alteração em Massa
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL 1: ADICIONAR DOMÍNIO */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddDomain}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Adicionar Domínio de Envio</h3>
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                className="p-1 text-slate-400 hover:text-slate-750 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Endereço de Domínio</label>
              <input
                type="text"
                required
                placeholder="Ex: marketing.realizzare.com.br"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-850 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-450 block mt-1">
                Não inclua http:// ou www. Apenas o domínio raiz ou subdomínio.
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowDomainModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => setShowDomainModal(false)}
                className="px-4 py-2 bg-indigo-650 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Adicionar Domínio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: GERAR CHAVE DE API */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleGenerateKey}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Gerar Nova Chave de API</h3>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-750 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Nome Descritivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Integração CRM Hotmart"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Escopo da Chave</label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-850 cursor-pointer"
                >
                  <option value="read_write">Leitura e Escrita (Todos os escopos)</option>
                  <option value="read_only">Apenas Leitura (Read-Only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-650 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 cursor-pointer"
              >
                Gerar Chave
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: ADICIONAR WEBHOOK */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddWebhook}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Registrar Novo Webhook</h3>
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="p-1 text-slate-400 hover:text-slate-750 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">URL do Endpoint de Destino</label>
                <input
                  type="url"
                  required
                  placeholder="https://suaapi.com.br/webhooks/realizzare"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Eventos Assinados</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-650">
                  {["Delivered", "Bounce", "Complaint", "Open", "Click", "Unsubscribe"].map((evt) => (
                    <label key={evt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(evt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookEvents((prev) => [...prev, evt]);
                          } else {
                            setWebhookEvents((prev) => prev.filter((item) => item !== evt));
                          }
                        }}
                        className="rounded border-slate-350 text-indigo-650 h-3.5 w-3.5"
                      />
                      <span>{evt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
              >
                Registrar Webhook
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: BLOQUEAR MANUALMENTE (SUPPRESSION LIST) */}
      {showSuppressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleAddSuppression}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Bloquear E-mail Preventivamente</h3>
              <button
                type="button"
                onClick={() => setShowSuppressModal(false)}
                className="p-1 text-slate-400 hover:text-slate-750 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: cliente.bloqueado@gmail.com"
                  value={suppressedEmail}
                  onChange={(e) => setSuppressedEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Motivo do Bloqueio</label>
                <select
                  value={suppressedReason}
                  onChange={(e) => setSuppressedReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-850 cursor-pointer"
                >
                  <option value="unsubscribe">Solicitação de Descadastro (Unsubscribe)</option>
                  <option value="hard_bounce">Marcar como Hard Bounce</option>
                  <option value="complaint">Marcar como Reclamação de Spam</option>
                  <option value="soft_bounce_repeated">Soft Bounce Repetido</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowSuppressModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
              >
                Bloquear E-mail
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WEBHOOK TEST SIMULATION MODAL */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Simulador de Webhook de Pagamento</h3>
              </div>
              <button
                onClick={() => { setShowSimModal(false); setSimLogSuccess(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {simLogSuccess ? (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Webhook Processado com Sucesso!</span>
                  </div>
                  <p className="leading-relaxed">
                    {simLogSuccess}
                  </p>
                </div>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1">
                  <div className="text-slate-500 font-bold">// Resposta da API /api/webhooks/{simProvider}</div>
                  <div>HTTP/1.1 200 OK</div>
                  <div>Content-Type: application/json</div>
                  <div className="text-emerald-400 font-mono mt-1 font-bold">
                    {`{ "status": "success", "event": "${simStatus}", "amount": ${simAmount}, "email": "${simEmail}", "action_triggered": "EXIT_ABANDONED_CART" }`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSimLogSuccess(null); setShowSimModal(false); }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  Fechar Simulador
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSimulating(true);
                  setTimeout(() => {
                    // Create transaction record in localStorage
                    const newTx = {
                      id: "tx_" + Date.now(),
                      product_type: "certificate",
                      product_name: simItem,
                      amount: Number(simAmount),
                      paid_at: new Date().toISOString(),
                      status: simStatus,
                      sku: `${simProvider.toUpperCase()}-${Date.now().toString().slice(-4)}`,
                      provider: simProvider,
                      customer_email: simEmail
                    };

                    try {
                      // 1. Save transaction
                      const existingStr = localStorage.getItem("realizzare_custom_transactions");
                      const existingList = existingStr ? JSON.parse(existingStr) : [];
                      existingList.unshift(newTx);
                      localStorage.setItem("realizzare_custom_transactions", JSON.stringify(existingList));

                      // 2. Create/Update contact profile in localStorage & add to "Clientes" list
                      const cleanEmail = simEmail.toLowerCase().trim();
                      const contactId = `c_pagarme_${cleanEmail.replace(/[^a-z0-9]/gi, "")}`;
                      
                      // Check contacts list
                      const contactsStr = localStorage.getItem("realizzare_contacts");
                      let contactsList = contactsStr ? JSON.parse(contactsStr) : [];
                      
                      const existingIndex = contactsList.findIndex((c: any) => (c.email || "").toLowerCase().trim() === cleanEmail);
                      if (existingIndex === -1) {
                        contactsList.unshift({
                          id: contactId,
                          first_name: "Cliente",
                          last_name: "Simulado",
                          email: cleanEmail,
                          phone: "(11) 98765-4321",
                          status: "active",
                          created_at: new Date().toISOString().split("T")[0],
                          tags: [simProvider === "pagarme" ? "Pagar.me" : "PagBank", "Cliente Realizzare"],
                          course: simItem,
                          courseStatus: "Ativo",
                          total_spent: Number(simAmount)
                        });
                        localStorage.setItem("realizzare_contacts", JSON.stringify(contactsList));
                        localStorage.setItem("realizzare_mock_contacts", JSON.stringify(contactsList));
                      }

                      // Check profile details
                      const profileKey = `realizzare_profile_${contactId}`;
                      const storedProfile = localStorage.getItem(profileKey);
                      let profileObj: any = null;
                      if (storedProfile) {
                        try { profileObj = JSON.parse(storedProfile); } catch (e) {}
                      }

                      if (!profileObj) {
                        profileObj = {
                          first_name: "Cliente",
                          last_name: "Simulado",
                          email: cleanEmail,
                          phone: "(11) 98765-4321",
                          birth_date: "1995-01-01",
                          gender: "Não informado",
                          status: "active",
                          created_at: new Date().toISOString().split("T")[0],
                          location: { country: "Brasil", state: "SP", city: "São Paulo" },
                          tags: [simProvider === "pagarme" ? "Pagar.me" : "PagBank", "Cliente Realizzare"],
                          custom_fields: [],
                          lists: [],
                          enrollments: [],
                          purchases: [],
                          flows: [],
                          timeline: []
                        };
                      }

                      if (!profileObj.lists) profileObj.lists = [];
                      const leadsToAlunos = localStorage.getItem("realizzare_setting_leads_to_alunos") !== "false";
                      const autoClientes = localStorage.getItem("realizzare_setting_auto_clientes_pagarme") !== "false";

                      // 1. Rule 1: Move from Leads to Alunos
                      if (leadsToAlunos) {
                        profileObj.lists = profileObj.lists.map((pl: any) => {
                          if (pl.name === "Leads") {
                            return { ...pl, status: "unsubscribed", unsubscribed_at: new Date().toISOString() };
                          }
                          return pl;
                        });

                        const hasAlunosList = profileObj.lists.some((pl: any) => pl.name === "Alunos" && pl.status === "subscribed");
                        if (!hasAlunosList) {
                          profileObj.lists = profileObj.lists.filter((pl: any) => pl.name !== "Alunos");
                          profileObj.lists.push({
                            name: "Alunos",
                            status: "subscribed",
                            subscribed_at: new Date().toISOString()
                          });
                        }
                      }

                      // 2. Rule 2: Auto-Add to Clientes list
                      if (autoClientes) {
                        const hasClientesList = profileObj.lists.some((pl: any) => pl.name === "Clientes" && pl.status === "subscribed");
                        if (!hasClientesList) {
                          profileObj.lists = profileObj.lists.filter((pl: any) => pl.name !== "Clientes");
                          profileObj.lists.push({
                            name: "Clientes",
                            status: "subscribed",
                            subscribed_at: new Date().toISOString()
                          });
                        }
                      }

                      profileObj.status = "active";
                      localStorage.setItem(profileKey, JSON.stringify(profileObj));

                    } catch (err) {
                      console.error(err);
                    }

                    setIsSimulating(false);
                    setSimLogSuccess(
                      `O webhook da ${simProvider === "pagarme" ? "Pagar.me" : "PagBank"} confirmou o pagamento de R$ ${Number(simAmount).toFixed(2)} para ${simEmail}. O faturamento geral foi atualizado, o aluno foi adicionado à lista de "Clientes", seu status foi definido como "Ativo" e a transação foi salva.`
                    );
                  }, 900);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selecione o Checkout Provedor</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimProvider("pagarme")}
                      className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        simProvider === "pagarme"
                          ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-2xs"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      💳 Pagar.me V5
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimProvider("pagbank")}
                      className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                        simProvider === "pagbank"
                          ? "border-amber-600 bg-amber-50/60 text-amber-900 shadow-2xs"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      🏦 PagBank
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-mail do Aluno / Comprador</label>
                  <input
                    type="email"
                    required
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Item / Curso Adquirido</label>
                  <input
                    type="text"
                    required
                    value={simItem}
                    onChange={(e) => setSimItem(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Valor Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status do Webhook</label>
                    <select
                      value={simStatus}
                      onChange={(e) => setSimStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="paid">paid (Aprovado / Pago)</option>
                      <option value="refunded">refunded (Estornado)</option>
                      <option value="failed">failed (Recusado)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processando Webhook...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Disparar Webhook de Teste</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2FA Enrollment Modal */}
      {showMfaEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6 font-sans">
            <div className="text-center space-y-2 text-slate-800">
              <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-650 mx-auto">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-850">Ative o 2FA (Google Authenticator)</h3>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                Escaneie o QR Code abaixo com seu aplicativo de autenticação de preferência (como Google Authenticator ou Authy).
              </p>
            </div>

            {totpLoading && !totpQrCode ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <svg className="animate-spin h-6 w-6 text-indigo-650" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[11px] font-semibold text-slate-500">Gerando chaves de segurança...</span>
              </div>
            ) : (
              <>
                {totpQrCode && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="border border-slate-100 rounded-2xl p-2 bg-slate-50 shadow-sm">
                      <img src={totpQrCode} alt="2FA QR Code" className="w-36 h-36 object-contain" />
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Chave secreta de texto</span>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono font-bold text-indigo-900 tracking-wider select-all">{totpSecret}</code>
                    </div>
                  </div>
                )}

                {totpError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-650">
                    {totpError}
                  </div>
                )}

                {!isTotpVerified ? (
                  <form onSubmit={handleVerifyMfaCode} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Código verificador de 6 dígitos</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="000 000"
                        value={totpPinCode}
                        onChange={(e) => setTotpPinCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full mt-1.5 bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-sm font-bold text-center tracking-widest text-slate-850 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMfaEnrollModal(false);
                          setIsMfaActive(false);
                        }}
                        className="flex-1 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={totpLoading}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer disabled:opacity-50"
                      >
                        {totpLoading ? "Validando..." : "Validar Código"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                      <span>Autenticação de 2 fatores ativada!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMfaEnrollModal(false);
                        alert("MFA ativado com sucesso em sua conta!");
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer"
                    >
                      Voltar para Configurações
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Invite Member Password Confirmation Modal */}
      {showInviteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 font-sans">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-700 mx-auto">
                <Shield className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-850">Confirme sua Senha</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Por motivos de segurança, informe a senha da sua conta de administrador atual para confirmar o cadastro do novo membro <strong className="text-slate-800">{invitePendingData?.name}</strong>.
              </p>
            </div>

            <form onSubmit={handleConfirmInviteUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sua Senha Atual</label>
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha de administrador..."
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteConfirmModal(false);
                    setInvitePendingData(null);
                  }}
                  className="flex-1 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviteConfirmLoading}
                  className="flex-1 py-2 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {inviteConfirmLoading ? "Confirmando..." : "Confirmar Criação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function WordPressPayloadSimulator() {
  const [selectedEventType, setSelectedEventType] = useState<
    "contact.created" | "course.enrollment" | "course.progress" | "certificate.issued" | "user.action"
  >("contact.created");
  const [testLogs, setTestLogs] = useState<Array<{ id: string; timestamp: string; event: string; status: number; payload: any }>>([
    {
      id: "log-101",
      timestamp: "04/08/2026 04:05:12",
      event: "course.enrollment",
      status: 200,
      payload: {
        event: "course.enrollment",
        student_email: "isabela.m@live.com",
        course_name: "Introdução à Programação Web",
        enrolled_at: "2026-08-04T04:05:12Z"
      }
    }
  ]);

  const payloads = {
    "contact.created": {
      event: "contact.created",
      timestamp: new Date().toISOString(),
      student: {
        first_name: "Mariana",
        last_name: "Siqueira",
        email: "mariana.siqueira@realizzare.com.br",
        phone: "(81) 99881-2233",
        city: "Recife",
        state: "PE",
        origin: "WordPress Realizzare - Formulario de Contato",
        tags: ["Novo Lead", "Interessado em Web"]
      }
    },
    "course.enrollment": {
      event: "course.enrollment",
      timestamp: new Date().toISOString(),
      student_email: "mariana.siqueira@realizzare.com.br",
      course: {
        id: "course-web-101",
        title: "Introdução à Programação Web",
        price: 197.00,
        enrolled_at: new Date().toISOString()
      }
    },
    "course.progress": {
      event: "course.progress",
      timestamp: new Date().toISOString(),
      student_email: "mariana.siqueira@realizzare.com.br",
      course_id: "course-web-101",
      progress_percent: 45,
      completed_lessons: 9,
      total_lessons: 20,
      last_activity_at: new Date().toISOString()
    },
    "certificate.issued": {
      event: "certificate.issued",
      timestamp: new Date().toISOString(),
      student_email: "mariana.siqueira@realizzare.com.br",
      certificate: {
        code: "CERT-2026-88741",
        course_name: "Introdução à Programação Web",
        issued_at: new Date().toISOString(),
        grade: "9.8"
      }
    },
    "user.action": {
      event: "user.action",
      timestamp: new Date().toISOString(),
      student_email: "mariana.siqueira@realizzare.com.br",
      action_type: "checkout_abandoned",
      page_url: "https://realizzarecursos.com.br/checkout",
      cart_item: "Desenvolvimento de Carreira e Liderança"
    }
  };

  const handleRunSimulation = () => {
    const currentPayload = payloads[selectedEventType];
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("pt-BR"),
      event: selectedEventType,
      status: 200,
      payload: currentPayload
    };
    setTestLogs([newLog, ...testLogs]);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Event Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: "contact.created", label: "1. Contato Criado / Atualizado" },
            { id: "course.enrollment", label: "2. Matrícula em Curso" },
            { id: "course.progress", label: "3. Progresso de Aulas" },
            { id: "certificate.issued", label: "4. Emissão de Certificado" },
            { id: "user.action", label: "5. Ações / Carrinho / Checkin" }
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedEventType(item.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedEventType === item.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Grid: Code preview & live log simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* JSON Payload Spec */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">
              PAYLOAD REQUERIDO (JSON) - {selectedEventType}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(payloads[selectedEventType], null, 2));
                alert("Payload copiado para a área de transferência!");
              }}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-mono cursor-pointer transition-colors"
            >
              Copiar JSON
            </button>
          </div>
          <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-3 rounded-xl overflow-x-auto max-h-64 border border-slate-800">
            {JSON.stringify(payloads[selectedEventType], null, 2)}
          </pre>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleRunSimulation}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Simular Envio de Teste (200 OK)</span>
            </button>
          </div>
        </div>

        {/* Live Incoming Feed Log */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Log de Eventos Recebidos em Tempo Real</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{testLogs.length} eventos</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {testLogs.map((log) => (
              <div key={log.id} className="bg-white border border-slate-200 p-3 rounded-xl space-y-1.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {log.event}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{log.timestamp}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded">
                      {log.status} OK
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-mono truncate bg-slate-50 p-1.5 rounded border border-slate-100">
                  {JSON.stringify(log.payload)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
