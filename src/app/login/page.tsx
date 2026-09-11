"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, KeyRound, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Auth flow states
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempUserSession, setTempUserSession] = useState<any>(null);

  // Check if session already exists and hasn't expired
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionStr = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          // 30 days validation check
          if (!parsed.expiresAt || parsed.expiresAt > Date.now()) {
            router.push("/dashboard");
          } else {
            localStorage.removeItem("realizzare_current_session");
            sessionStorage.removeItem("realizzare_current_session");
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router]);

  // Step 1: Handle Email + Password Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      setIsLoading(false);
      return;
    }

    try {
      const inputEmail = email.trim().toLowerCase();
      
      // Developer / Integrator bypass account for Nilton
      const isNiltonAccount =
        inputEmail === "nilton@realizzare.com.br" ||
        inputEmail === "nilton@realizzarecursos.com.br" ||
        inputEmail === "nilton" ||
        inputEmail === "dev@realizzare.com.br" ||
        inputEmail === "dev@realizzarecursos.com.br";

      if (isNiltonAccount) {
        const validPasswords = ["RealizzareNilton2026!", "Nilton2026!", "RealizzareDev2026!", "senha123", "realizzare123"];
        if (!validPasswords.includes(password)) {
          setError("Senha incorreta para a conta de Nilton. Tente 'RealizzareNilton2026!'.");
          setIsLoading(false);
          return;
        }
        const devSession = {
          name: "Nilton (Desenvolvedor Realizzare)",
          email: inputEmail.includes("@") ? inputEmail : "nilton@realizzare.com.br",
          role: "Desenvolvedor WordPress",
          isNewUser: false,
          expiresAt: keepLoggedIn ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined
        };
        if (keepLoggedIn) {
          localStorage.setItem("realizzare_current_session", JSON.stringify(devSession));
        } else {
          sessionStorage.setItem("realizzare_current_session", JSON.stringify(devSession));
        }
        setIsLoading(false);
        router.push("/dashboard/settings?sub=integration");
        return;
      }

      let userSession = {
        name: "Administrador Realizzare",
        email: inputEmail,
        role: "Administrador",
        isNewUser: false,
        expiresAt: keepLoggedIn ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined
      };

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: inputEmail,
        password: password,
      });

      if (authError) {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        userSession.name = data.user.user_metadata?.name || "Administrador Realizzare";
        userSession.email = data.user.email || inputEmail;

        // Check if they are new (to enforce first password & 2FA setup)
        userSession.isNewUser = data.user.user_metadata?.is_new_user !== false;

        // Check if user has active MFA factors
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData && aalData.nextLevel === "aal2") {
          setTempUserSession(userSession);
          setStep("2fa");
          setIsLoading(false);
          return;
        }
      }

      // No MFA needed, complete login directly
      if (keepLoggedIn) {
        localStorage.setItem("realizzare_current_session", JSON.stringify(userSession));
      } else {
        sessionStorage.setItem("realizzare_current_session", JSON.stringify(userSession));
      }
      setIsLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Erro de conexão. Verifique os dados e tente novamente.");
      setIsLoading(false);
    }
  };

  // Step 2: Handle 2FA PIN Code Submission
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!pinCode || pinCode.trim().length !== 6) {
      setError("Por favor, informe o código de verificação de 6 dígitos.");
      setIsLoading(false);
      return;
    }

    try {
      const inputEmail = email.trim().toLowerCase();

      // Real Supabase MFA Verification
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedFactor = factors?.totp?.find((f: any) => f.status === "verified");
      if (!verifiedFactor) {
        throw new Error("Nenhum autenticador 2FA ativo encontrado. Faça login e ative-o nas configurações.");
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challenge.id,
        code: pinCode
      });
      if (verifyError) throw verifyError;

      // Successful 2FA login
      if (tempUserSession) {
        if (keepLoggedIn) {
          localStorage.setItem("realizzare_current_session", JSON.stringify(tempUserSession));
        } else {
          sessionStorage.setItem("realizzare_current_session", JSON.stringify(tempUserSession));
        }
      }
      setIsLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("2FA validation failed:", err);
      setError(err.message || "Código 2FA incorreto ou expirado. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-50 via-slate-100 to-indigo-50/40 px-4 py-12 font-sans sm:px-6 lg:px-8">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="w-full max-w-md space-y-7 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl transition-all">
        {/* Header/Logo */}
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 relative overflow-hidden rounded-xl shadow-sm mb-4">
            <img src="/logo.png" alt="Realizzare Logo" className="h-full w-full object-cover rounded-xl" />
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
            Realizzare <span className="text-indigo-600">Mail</span>
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-slate-500">
            {step === "login" ? "Acesse o painel de automação e e-mail marketing" : "Autenticação em 2 Etapas (2FA)"}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: LOGIN FORM */}
        {step === "login" && (
          <form className="space-y-5 animate-fadeIn" onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  E-mail institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Manter Conectado Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>Manter-se conectado por 30 dias</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Acessar Painel <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: 2FA PIN VERIFICATION */}
        {step === "2fa" && (
          <form className="space-y-5 animate-fadeIn" onSubmit={handle2FASubmit}>
            <div className="bg-indigo-50/60 border border-indigo-150 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-black text-indigo-950">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span>Verificação de Segurança em 2 Etapas</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Abra o aplicativo de autenticação (como <strong className="text-slate-900">Google Authenticator</strong>) no seu celular e digite o código temporário de 6 dígitos gerado para a sua conta.
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Código de 6 dígitos (2FA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <KeyRound className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-3.5 text-base font-mono font-black tracking-widest text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs text-center"
                />
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-xs font-extrabold text-white hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/15 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validando 2FA...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Validar Código e Acessar <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep("login"); setPinCode(""); setError(""); }}
                className="w-full py-2 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
              >
                ← Voltar para o e-mail e senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
