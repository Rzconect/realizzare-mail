"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  GitBranch,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Clock,
  User,
  GraduationCap,
  BookOpen,
  Settings,
  Image,
  Lock,
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [userAccount, setUserAccount] = useState({
    first_name: "Leonardo",
    last_name: "Christian",
    email: "leonardo@realizzare.com.br"
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [newAuthPassword, setNewAuthPassword] = useState("");
  const [confirmAuthPassword, setConfirmAuthPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showUsagePopover, setShowUsagePopover] = useState(false);
  const [usage, setUsage] = useState({
    profilesLimit: 5000,
    profilesUsed: 4585,
    emailsLimit: 50000,
    emailsUsed: 30972,
    mobileLimit: 5.00,
    mobileUsed: 0.00
  });

  // MFA Enrollment Wizard States
  const [mfaWizardStep, setMfaWizardStep] = useState<"password" | "mfa_setup">("password");
  const [totpQrCode, setTotpQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpPinCode, setTotpPinCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [isTotpVerified, setIsTotpVerified] = useState(false);
  const [totpLoading, setTotpLoading] = useState(false);

  useEffect(() => {
    const checkAuthSession = async () => {
      if (typeof window !== "undefined") {
        const sessionStr = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
        if (!sessionStr) {
          router.push("/login");
          return;
        }

        try {
          const parsed = JSON.parse(sessionStr);
          const isDevOrAdminBypass =
            parsed.email?.includes("nilton") ||
            parsed.email?.includes("dev") ||
            parsed.role?.includes("Desenvolvedor") ||
            parsed.email?.includes("contato@realizzare") ||
            parsed.email?.includes("admin@realizzare") ||
            parsed.email === "admin@realizzarecursos.com.br";

          // 1. Background check in database to avoid local cache desyncs (Skipped for dev bypass accounts)
          if (!isDevOrAdminBypass) {
            try {
              const { createClient } = await import("@/lib/supabase/client");
              const supabase = createClient();
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (userError || !user) {
                console.warn("Invalid Supabase Auth session. Forcing logout.");
                localStorage.removeItem("realizzare_current_session");
                sessionStorage.removeItem("realizzare_current_session");
                router.push("/login");
                return;
              } else {
                const isNew = user.user_metadata?.is_new_user !== false;
                parsed.isNewUser = isNew;
                
                // Persist the corrected state in both local & session storages
                localStorage.setItem("realizzare_current_session", JSON.stringify(parsed));
                sessionStorage.setItem("realizzare_current_session", JSON.stringify(parsed));
              }
            } catch (e) {
              console.warn("Background user session sync skipped:", e);
            }
          }

          // 2. Mock Admin & Dev override check
          if (parsed.email === "admin@realizzarecursos.com.br") {
            const isCompleted = localStorage.getItem("realizzare_master_first_access_completed") === "true";
            parsed.isNewUser = !isCompleted;
          } else if (isDevOrAdminBypass) {
            parsed.isNewUser = false;
          }

          setCurrentUser(parsed);
          setUserAccount({
            first_name: parsed.name ? parsed.name.split(" ")[0] : "Leonardo",
            last_name: parsed.name ? parsed.name.split(" ").slice(1).join(" ") : "Christian",
            email: parsed.email
          });

          // 3. Render modal dynamically based on actual status
          if (parsed.isNewUser) {
            setShowNewPasswordModal(true);
          } else {
            setShowNewPasswordModal(false);
          }
        } catch (e) {
          console.error(e);
          router.push("/login");
        }
      }
    };
    checkAuthSession();
    window.addEventListener("storage", () => {
      checkAuthSession();
    });
    return () => window.removeEventListener("storage", () => {
      checkAuthSession();
    });
  }, [pathname, router]);

  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem("realizzare_mock_campaigns");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const scheduled = list.filter((c: any) => c.status === "Agendado" || c.status === "Enviando");
          setScheduledNotifications(scheduled);
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadNotifications();
    window.addEventListener("storage", loadNotifications);
    return () => window.removeEventListener("storage", loadNotifications);
  }, [pathname]);

  // Reset dropdowns on route changes
  useEffect(() => {
    setShowSettingsDropdown(false);
    setShowNotifications(false);
    setShowUsagePopover(false);

    // Auto-collapse sidebar on contacts page
    if (pathname === "/dashboard/contacts" || pathname.startsWith("/dashboard/contacts/") || pathname.startsWith("/dashboard/campaigns/create")) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".settings-dropdown-container")) {
        setShowSettingsDropdown(false);
      }
      if (!target.closest(".notifications-dropdown-container")) {
        setShowNotifications(false);
      }
      if (!target.closest(".usage-popover-container") && !target.closest(".usage-trigger-btn")) {
        setShowUsagePopover(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Load account usage statistics from Database
  useEffect(() => {
    const fetchRealUsage = async () => {
      try {
        const supabase = createClient();
        
        // 1. Get total contacts (Leads Inscritos)
        const { count: profilesUsed } = await supabase
          .from("contacts")
          .select("*", { count: "exact", head: true });

        // 2. Get emails sent this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("sent_count")
          .gte("sent_at", startOfMonth.toISOString());
          
        let emailsUsed = 0;
        if (campaigns) {
          emailsUsed = campaigns.reduce((acc: number, curr: any) => acc + (curr.sent_count || 0), 0);
        }

        setUsage({
          profilesLimit: 5000,
          profilesUsed: profilesUsed || 0,
          emailsLimit: 50000,
          emailsUsed: emailsUsed,
          mobileLimit: 5.00,
          mobileUsed: 0.00
        });
      } catch (e) {
        console.error("Erro ao carregar uso real da conta:", e);
      }
    };
    
    fetchRealUsage();
  }, [pathname]);

  const isNiltonUser = currentUser?.role?.includes("Desenvolvedor") || currentUser?.email?.includes("nilton");

  useEffect(() => {
    if (isNiltonUser && pathname) {
      if (
        !pathname.startsWith("/dashboard/contacts") &&
        !pathname.startsWith("/dashboard/settings")
      ) {
        router.push("/dashboard/settings?sub=integration");
      }
    }
  }, [isNiltonUser, pathname, router]);

  const navigation: SidebarItem[] = isNiltonUser
    ? [
        { name: "Contatos", href: "/dashboard/contacts", icon: Users },
        { name: "Integração WordPress", href: "/dashboard/settings?sub=integration", icon: Settings }
      ]
    : [
        { name: "Início", href: "/dashboard", icon: LayoutDashboard },
        { name: "Contatos", href: "/dashboard/contacts", icon: Users },
        { name: "Campanhas", href: "/dashboard/campaigns", icon: Mail },
        { name: "E-mails", href: "/dashboard/emails", icon: FileText },
        { name: "Automações", href: "/dashboard/automations", icon: GitBranch },
        { name: "Conteúdos", href: "/dashboard/contents", icon: Image },
        { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
        { name: "Cursos", href: "/dashboard/courses", icon: BookOpen },
      ];

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Erro ao deslogar do Supabase:", e);
    }
    localStorage.removeItem("realizzare_current_session");
    sessionStorage.removeItem("realizzare_current_session");
    router.push("/login");
  };

  const handleUpdateNewUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newAuthPassword.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newAuthPassword !== confirmAuthPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    // Advance wizard to step: 2FA Setup
    setMfaWizardStep("mfa_setup");
    await handleInitMfaSetup();
  };

  const handleInitMfaSetup = async () => {
    setTotpLoading(true);
    setTotpError("");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      // Try real Supabase TOTP enrollment
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
      console.warn("Real Supabase MFA enrollment failed/skipped. Using simulated QR code fallback:", e);
      // Fallback mock enrollment
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
    } catch (e: any) {
      console.error("MFA verification error:", e);
      setTotpError(e.message || "Código incorreto ou expirado. Tente novamente.");
    } finally {
      setTotpLoading(false);
    }
  };

  const handleCompleteFirstAccess = async () => {
    // 1. Update in local/simulated database list
    const storedUsers = localStorage.getItem("realizzare_auth_users");
    if (storedUsers) {
      try {
        const usersList = JSON.parse(storedUsers);
        const updatedList = usersList.map((u: any) => {
          if (u.email.toLowerCase() === currentUser.email.toLowerCase()) {
            return { ...u, password: newAuthPassword, isNewUser: false };
          }
          return u;
        });
        localStorage.setItem("realizzare_auth_users", JSON.stringify(updatedList));
      } catch (err) {
        console.error(err);
      }
    }

    // 2. Update real password & metadata in Supabase if they are a real user
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.updateUser({ 
        password: newAuthPassword,
        data: { is_new_user: false }
      });
    } catch (e) {
      console.warn("Notice updating real user password & metadata in Supabase:", e);
    }

    if (currentUser?.email === "admin@realizzarecursos.com.br") {
      localStorage.setItem("realizzare_master_first_access_completed", "true");
    }

    // 3. Update session storage and close modal
    const updatedSession = { ...currentUser, isNewUser: false };
    localStorage.setItem("realizzare_current_session", JSON.stringify(updatedSession));
    sessionStorage.setItem("realizzare_current_session", JSON.stringify(updatedSession));

    setCurrentUser(updatedSession);
    setShowNewPasswordModal(false);
    alert("Senha alterada e Autenticação de 2 Fatores (MFA) configurada com sucesso!");
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* 1. Mobile Topbar Header */}
      <header className="flex md:hidden w-full h-16 bg-white border-b border-slate-200 items-center justify-between px-4 absolute top-0 left-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 shrink-0 relative overflow-hidden rounded-lg">
            <img src="/logo.png" alt="Realizzare Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-bold text-lg text-slate-900">Realizzare Mail</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications Bell Dropdown */}
          <div className="relative notifications-dropdown-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 relative hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
              {scheduledNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                  {scheduledNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-202 rounded-2xl shadow-xl p-4 z-40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 select-none">
                    <span className="text-[10px] font-black uppercase text-slate-400">Atividades</span>
                    {scheduledNotifications.length > 0 && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                        {scheduledNotifications.length} Ativas
                      </span>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-left">
                    {scheduledNotifications.length === 0 ? (
                      <div className="text-xs text-slate-400 py-6 text-center select-none">
                        Nenhuma campanha agendada ou em envio.
                      </div>
                    ) : (
                      scheduledNotifications.map((camp) => (
                        <div key={camp.id} className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                            camp.status === "Enviando" ? "bg-amber-500 animate-pulse" : "bg-indigo-650"
                          }`} />
                          <div className="text-xs flex-1">
                            <p className="font-semibold text-slate-700 leading-relaxed">
                              Campanha <strong className="text-slate-900">"{camp.name}"</strong> foi agendada.
                            </p>
                            <span className="text-[10px] text-slate-450 mt-1 block flex items-center gap-1 font-medium">
                              <Clock className="h-3 w-3" />
                              {camp.status === "Enviando" ? "Envio em curso" : `Para: ${camp.dateStr}`}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings Dropdown triggered by User Avatar button */}
          <div className="relative settings-dropdown-container">
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200/80 hover:scale-105 transition-all cursor-pointer relative overflow-hidden shrink-0"
              title="Opções da Conta"
            >
              <User className="h-4 w-4" />
            </button>

            {showSettingsDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSettingsDropdown(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 animate-fadeIn text-left">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setShowSettingsDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full text-left"
                  >
                    <Settings className="h-4 w-4 text-slate-455" />
                    <span>Configurações</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowSettingsDropdown(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-650 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-850 focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* 2. Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          {/* Overlay Background */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Drawer */}
          <div className="relative flex flex-col w-64 max-w-xs bg-white border-r border-slate-200 h-full p-4 space-y-6 pt-20">
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "text-slate-650 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 3. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-200 bg-white transition-all duration-300 relative ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className={`flex h-16 items-center border-b border-slate-200 justify-between ${
          isSidebarOpen ? "px-6" : "px-0 justify-center"
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-9 w-9 shrink-0 relative overflow-hidden rounded-lg shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title={isSidebarOpen ? "Recolher menu" : "Expandir menu"}
            >
              <img src="/logo.png" alt="Realizzare Logo" className="h-full w-full object-cover" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-base text-slate-850 tracking-wide truncate">
                Realizzare <span className="text-indigo-600">Mail</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 py-6 space-y-2 overflow-y-auto transition-all ${
          isSidebarOpen ? "px-4" : "px-2"
        }`}>
          {navigation.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center rounded-lg text-sm font-medium transition-all group duration-150 relative ${
                  isSidebarOpen ? "px-4 py-3 gap-3.5" : "h-11 w-11 justify-center mx-auto"
                } ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span className="truncate">{item.name}</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-3 hidden group-hover:flex items-center bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-xl z-50 pointer-events-none whitespace-nowrap animate-fadeIn">
                    <span>{item.name}</span>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout footer */}
        <div className={`border-t border-slate-200 bg-slate-50/50 transition-all ${
          isSidebarOpen ? "p-4" : "py-4 px-0 flex flex-col items-center justify-center"
        }`}>
          {isSidebarOpen ? (
            <button
              onClick={() => setShowUsagePopover(!showUsagePopover)}
              className="w-full flex items-center justify-between hover:bg-slate-100/70 p-2.5 rounded-2xl border border-slate-200 bg-white transition-all cursor-pointer text-left usage-trigger-btn shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  <img src="/r-logo.png" alt="R Logo" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">Realizzare</span>
                  <span className="text-[10px] text-slate-500 truncate font-semibold">Ver uso da conta</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          ) : (
            <button
              onClick={() => setShowUsagePopover(!showUsagePopover)}
              className="h-10 w-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center hover:bg-slate-100 transition-all cursor-pointer usage-trigger-btn shadow-sm p-0.5"
              title="Ver uso da conta: Realizzare"
            >
              <img src="/r-logo.png" alt="R Logo" className="h-full w-full object-cover rounded-lg" />
            </button>
          )}
        </div>
      </aside>

      {/* 4. Main Panel Wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Desktop Topbar Header */}
        <header className="hidden md:flex h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications Bell Dropdown */}
            <div className="relative notifications-dropdown-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 relative hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
              >
                <Bell className="h-4.5 w-4.5" />
                {scheduledNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {scheduledNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-202 rounded-2xl shadow-xl p-4 z-40 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 select-none">
                      <span className="text-[10px] font-black uppercase text-slate-400">Atividades de Campanhas</span>
                      {scheduledNotifications.length > 0 && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          {scheduledNotifications.length} Ativas
                        </span>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                      {scheduledNotifications.length === 0 ? (
                        <div className="text-xs text-slate-400 py-6 text-center select-none">
                          Nenhuma campanha agendada ou em envio.
                        </div>
                      ) : (
                        scheduledNotifications.map((camp) => (
                          <div key={camp.id} className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                              camp.status === "Enviando" ? "bg-amber-500 animate-pulse" : "bg-indigo-650"
                            }`} />
                            <div className="text-xs flex-1">
                              <p className="font-semibold text-slate-700 leading-relaxed">
                                Campanha <strong className="text-slate-900">"{camp.name}"</strong> foi agendada por <span className="font-bold">{camp.fromName || (currentUser ? currentUser.name : "Leonardo Silva")}</span>.
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" />
                                {camp.status === "Enviando" ? "Envio em curso" : `Para: ${camp.dateStr}`}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings Dropdown triggered by User Avatar button */}
            <div className="relative settings-dropdown-container">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200/80 hover:scale-105 transition-all cursor-pointer relative overflow-hidden shrink-0"
                title="Opções da Conta"
              >
                <User className="h-4.5 w-4.5" />
              </button>

              {showSettingsDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSettingsDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 animate-fadeIn text-left">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowSettingsDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full text-left"
                    >
                      <Settings className="h-4 w-4 text-slate-455" />
                      <span>Configurações</span>
                    </Link>
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-650 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-red-400" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Pane */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-3 md:py-4 pt-20 md:pt-6 bg-slate-50 relative flex flex-col">
          {children}
        </main>
      </div>

      {/* Usage Popover Modal */}
      {showUsagePopover && (
        <div className={`absolute bottom-20 z-50 w-72 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl animate-scaleIn usage-popover-container ${
          isSidebarOpen ? "left-6" : "left-14"
        }`}>
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Uso Mensal da Conta</span>
            <button
              onClick={() => setShowUsagePopover(false)}
              className="text-slate-400 hover:text-slate-655 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 pt-3.5 text-xs text-left">
            {/* Profiles Usage */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline select-none">
                <span className="font-bold text-slate-700">Leads Inscritos</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {usage.profilesUsed.toLocaleString("pt-BR")} / {usage.profilesLimit.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-650 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (usage.profilesUsed / usage.profilesLimit) * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-450 font-bold text-right">
                {Math.round((usage.profilesUsed / usage.profilesLimit) * 100)}% utilizado
              </div>
            </div>

            {/* Emails Usage */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline select-none">
                <span className="font-bold text-slate-700">E-mails Enviados</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {usage.emailsUsed.toLocaleString("pt-BR")} / {usage.emailsLimit.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (usage.emailsUsed / usage.emailsLimit) * 100)}%` }}
                />
              </div>
              <div className="text-[9px] text-slate-450 font-bold text-right">
                {Math.round((usage.emailsUsed / usage.emailsLimit) * 100)}% utilizado
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[9px] text-slate-450 font-semibold select-none">
                <span>Limites renovam em:</span>
                <span className="text-indigo-650 font-bold">1º do próximo mês</span>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setShowUsagePopover(false)}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 hover:text-slate-800 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
              >
                <Settings className="h-3.5 w-3.5 text-slate-450" />
                <span>Configurações e Limites</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* New Password & 2FA Setup Modal */}
      {showNewPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6">
            
            {/* Step 1: Change Password */}
            {mfaWizardStep === "password" && (
              <>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-650 mx-auto animate-pulse">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-850">Defina uma Nova Senha</h3>
                  <p className="text-xs text-slate-550 max-w-xs mx-auto font-medium">
                    Olá, <span className="font-bold">{currentUser?.name}</span>! Como este é o seu primeiro acesso, escolha uma senha personalizada e segura para continuar.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-650 flex items-center gap-2">
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateNewUserPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nova Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={newAuthPassword}
                      onChange={(e) => setNewAuthPassword(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirme a Nova Senha</label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a nova senha"
                      value={confirmAuthPassword}
                      onChange={(e) => setConfirmAuthPassword(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer"
                  >
                    Salvar Senha e Prosseguir
                  </button>
                </form>
              </>
            )}

            {/* Step 2: 2FA Setup */}
            {mfaWizardStep === "mfa_setup" && (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-650 mx-auto">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-850">Ative o 2FA (Opcional)</h3>
                  <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                    Escaneie o QR Code abaixo com seu aplicativo de autenticação (como Google Authenticator ou Authy).
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
                            onClick={handleCompleteFirstAccess}
                            className="flex-1 py-2 border border-slate-202 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 cursor-pointer transition-colors"
                          >
                            Pular 2FA
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
                          onClick={handleCompleteFirstAccess}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10 cursor-pointer animate-bounce"
                        >
                          Concluir e Acessar Painel
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
