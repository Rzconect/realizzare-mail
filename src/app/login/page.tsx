"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if session already exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionStr = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
      if (sessionStr) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
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
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      let userName = "Realizzare Cursos";
      let userEmail = inputEmail;

      // Check official admin login credentials
      if (
        (inputEmail === "contato@realizzarecursos.com.br" && password === "RZconect2026@") ||
        (inputEmail === "admin@realizzare.com.br" && password === "senha123")
      ) {
        userName = inputEmail.includes("realizzarecursos") ? "Realizzare Cursos" : "Leonardo Christian";
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: inputEmail,
          password: password,
        });

        if (authError) {
          setError("Credenciais inválidas. Verifique seu e-mail e senha.");
          setIsLoading(false);
          return;
        }

        userName = data.user?.user_metadata?.name || "Administrador Realizzare";
        userEmail = data.user?.email || inputEmail;
      }

      const userSession = {
        name: userName,
        email: userEmail,
        role: "Administrador",
        isNewUser: false
      };

      if (keepLoggedIn) {
        localStorage.setItem("realizzare_current_session", JSON.stringify(userSession));
      } else {
        sessionStorage.setItem("realizzare_current_session", JSON.stringify(userSession));
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Erro de conexão. Verifique os dados e tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-50 via-slate-100 to-indigo-50/40 px-4 py-12 font-sans sm:px-6 lg:px-8">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white/80 p-8 backdrop-blur-xl shadow-xl">
        {/* Header/Logo */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 relative overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-white p-1 flex items-center justify-center">
            <img src="/logo.png" alt="Realizzare Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Realizzare <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Mail</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Acesse o painel de automação e e-mail marketing
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                E-mail institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@realizzarecursos.com.br"
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Senha
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Manter Conectado Checkbox */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="h-4 w-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Manter-se conectado</span>
            </label>
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 select-none">
            <span className="font-bold text-slate-700">Acesso Oficial Administrador:</span>
            <span>E-mail: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">contato@realizzarecursos.com.br</code></span>
            <span>Senha: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">RZconect2026@</code></span>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-blue-600 py-3 px-4 text-sm font-semibold text-white hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed shadow shadow-indigo-600/10 transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Autenticando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 cursor-pointer">
                  Entrar no Painel <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
