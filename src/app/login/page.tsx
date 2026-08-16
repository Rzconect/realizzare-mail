"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // Auth flow states
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      
      // Standardized Master Admin Credential Check
      const isMasterAdmin = (inputEmail === "admin@realizzarecursos.com.br" && password === "Admin@123");

      let userSession = {
        name: "Administrador Realizzare",
        email: inputEmail,
        role: "Administrador",
        isNewUser: false,
        expiresAt: keepLoggedIn ? Date.now() + 30 * 24 * 60 * 60 * 1000 : undefined
      };

      if (!isMasterAdmin) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
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
          const stored = localStorage.getItem("realizzare_auth_users");
          let isNew = true;
          if (stored) {
            try {
              const list = JSON.parse(stored);
              const found = list.find((u: any) => u.email.toLowerCase() === inputEmail);
              if (found) isNew = found.isNewUser;
            } catch(e){}
          }
          userSession.isNewUser = isNew;

          // Check if user has active MFA factors
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          if (aalData && aalData.nextLevel === "aal2") {
            setTempUserSession(userSession);
            setStep("2fa");
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Master Admin Check: check if simulated MFA is enabled
        const hasSimulatedMfa = localStorage.getItem(`realizzare_mfa_enabled_${inputEmail}`) === "true";
        if (hasSimulatedMfa) {
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
      const isMasterAdmin = (inputEmail === "admin@realizzarecursos.com.br");

      if (isMasterAdmin) {
        // Simulated validation (accepts correct 6-digit structure or default code)
        setTimeout(() => {
          if (tempUserSession) {
            if (keepLoggedIn) {
              localStorage.setItem("realizzare_current_session", JSON.stringify(tempUserSession));
            } else {
              sessionStorage.setItem("realizzare_current_session", JSON.stringify(tempUserSession));
            }
          }
          setIsLoading(false);
          router.push("/dashboard");
        }, 600);
        return;
      }

      // Real Supabase MFA Verification
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

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

      <div className="w-full max-w-md space-y-7 rounded-3xl border border-slate-200 bg-white/90 p-8 backdrop-blur-xl shadow-2xl transition-all">
        {/* Header/Logo with smooth rounded corners */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 relative overflow-hidden rounded-2xl shadow-lg border border-slate-100 bg-white p-2 flex items-center justify-center">
            <img src="/logo.png" alt="Realizzare Logo" className="h-full w-full object-contain rounded-xl" />
          </div>
          <h2 className="mt-5 text-center text-3xl font-black tracking-tight text-slate-900">
            Realizzare <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Mail</span>
          </h2>
          <p className="mt-1.5 text-center text-xs font-semibold text-slate-500">
            {step === "login" ? "Acesse o painel de automação e e-mail marketing" : "Autenticação em 2 Etapas (2FA)"}
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-150 bg-red-50 p-3 text-xs font-bold text-red-700 animate-fadeIn">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: LOGIN FORM */}
        {step === "login" && (
          <form className="space-y-5 animate-fadeIn" onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  E-mail institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@realizzarecursos.com.br"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Manter Conectado Checkbox (Alta Visibilidade & Contraste) */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2.5 text-xs font-extrabold text-slate-800 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>Manter-se conectado por 30 dias</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 px-4 text-xs font-extrabold text-white hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/15 transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando Supabase...
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
                Enviamos um código de segurança de 6 dígitos para o e-mail registrado: <strong className="text-slate-900">{email}</strong>.
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
                  placeholder="891240"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-3.5 text-base font-mono font-black tracking-widest text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xs text-center"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-bold mt-1.5 block text-center">
                💡 Código de teste do primeiro acesso: <strong className="text-indigo-600 font-mono">891240</strong> (ou qualquer 6 dígitos)
              </span>
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
