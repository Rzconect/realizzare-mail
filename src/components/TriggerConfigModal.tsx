import React, { useState, useEffect } from "react";
import { X, CreditCard, Activity, Webhook, UserCircle2, Check, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TriggerConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  mode?: "entry" | "exit" | "split";
}

export default function TriggerConfigModal({ isOpen, onClose, onSave, mode = "entry" }: TriggerConfigModalProps) {
  const [customTriggerSource, setCustomTriggerSource] = useState("pagarme");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedRule, setSelectedRule] = useState("Nenhuma regra extra");
  const [condValue, setCondValue] = useState("");
  
  const [timeWindow, setTimeWindow] = useState("");
  const [timeUnit, setTimeUnit] = useState("minutes");
  
  const [courses, setCourses] = useState<{id: string, name: string}[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchCourses = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("courses").select("id, name").order("name");
        if (data) setCourses(data);
      };
      fetchCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedEvent("");
    setSelectedRule("Nenhuma regra extra");
    setCondValue("");
    setSelectedCourses([]);
    setTimeWindow("");
  }, [customTriggerSource]);

  const isCourseEvent = selectedEvent.includes("course") || selectedEvent.includes("Matrícula") || selectedEvent.includes("Certificado") || selectedEvent.includes("Reprovação") || selectedEvent.includes("Teste");
  const isPagarmeEvent = customTriggerSource === "pagarme";

  if (!isOpen) return null;

  const toggleCourse = (courseName: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseName) ? prev.filter(c => c !== courseName) : [...prev, courseName]
    );
  };
  
  const title = mode === "entry" ? "Configuração de Gatilho de Entrada" : 
                mode === "exit" ? "Nova Regra de Saída" : "Condição de Divisão";
  const desc = mode === "entry" ? "Configure regras complexas ouvindo eventos externos ou dados do usuário." :
               mode === "exit" ? "Se o contato atender a esta regra, ele será removido do fluxo imediatamente." :
               "Contatos que atenderem a esta regra irão para o caminho 'Sim'.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-slate-50/50 rounded-t-3xl">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">✨ </div>
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{desc}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-left bg-white">
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setCustomTriggerSource("pagarme")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "pagarme" ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <CreditCard className="h-5 w-5" />
              <span className="text-[10px] font-bold">Pagar.me</span>
            </button>
            <button onClick={() => setCustomTriggerSource("datalayer")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "datalayer" ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <Activity className="h-5 w-5" />
              <span className="text-[10px] font-bold">DataLayer</span>
            </button>
            <button onClick={() => setCustomTriggerSource("api")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "api" ? "border-rose-500 bg-rose-50/50 text-rose-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <Webhook className="h-5 w-5" />
              <span className="text-[10px] font-bold">API / Webhooks</span>
            </button>
            <button onClick={() => setCustomTriggerSource("user")} className={`p-3 flex flex-col items-center justify-center gap-2 border rounded-xl transition-all ${customTriggerSource === "user" ? "border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              <UserCircle2 className="h-5 w-5" />
              <span className="text-[10px] font-bold">Dados do Lead</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selecionar Evento</label>
              <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none">
                <option value="">Selecione o evento...</option>
                {customTriggerSource === "pagarme" && (
                  <>
                    <option>Transação Aprovada (order_paid)</option>
                    <option>Boleto Gerado (order_created)</option>
                    <option>Assinatura Cancelada (subscription_canceled)</option>
                    <option>Carrinho Abandonado (checkout_abandoned)</option>
                  </>
                )}
                {customTriggerSource === "datalayer" && (
                  <>
                    <option>Curso Iniciado (course.progress - Inicio)</option>
                    <option>Curso em Andamento 50% (course.progress - Meio)</option>
                    <option>Curso Concluído 100% (course.progress - Fim)</option>
                    <option>Clique em Emissão/Checkout (checkout_click)</option>
                    <option>Visualizou Página (page_view)</option>
                    <option>Adicionou ao Carrinho (add_to_cart)</option>
                  </>
                )}
                {customTriggerSource === "api" && (
                  <>
                    <option>Matrícula Realizada</option>
                    <option>Teste Aprovado</option>
                    <option>Reprovação na Prova (course.exam_failed)</option>
                    <option>Certificado Emitido (certificate_issued)</option>
                    <option>Contato Criado / Atualizado</option>
                    <option>Descadastro de Email (contact.unsubscribed)</option>
                    <option>Reativação de Contato (contact.reactivated)</option>
                    <option>Evento Customizado POST genérico</option>
                  </>
                )}
                {customTriggerSource === "user" && (
                  <>
                    <option>Novo Lead Cadastrado</option>
                    <option>Campo: Nome / Sobrenome Alterado</option>
                    <option>Campo: Email Alterado</option>
                    <option>Campo: Telefone / WhatsApp</option>
                    <option>Campo: Gênero</option>
                    <option>Campo: Data de Nascimento</option>
                    <option>Campo: CPF</option>
                    <option>Campo: CEP / Endereço Completo</option>
                    <option>Tag Adicionada ou Removida</option>
                    <option>Campo Personalizado Alterado</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Regra Adicional (Opcional)</label>
                <select value={selectedRule} onChange={(e) => setSelectedRule(e.target.value)} className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none">
                  <option>Nenhuma regra extra</option>
                  <option>Nome do Curso específico</option>
                  {isPagarmeEvent && <option>SKU do Produto específico</option>}
                  <option>Igual a</option>
                  <option>Não é igual a</option>
                  <option>Contém</option>
                  <option>Não contém</option>
                  <option>Maior que (Valor/Data)</option>
                  <option>Menor que (Valor/Data)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Condicional</label>
                
                {selectedRule === "Nome do Curso específico" ? (
                  <div className="relative mt-1.5">
                    <button 
                      type="button"
                      onClick={() => setIsCoursesDropdownOpen(!isCoursesDropdownOpen)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium text-left focus:border-indigo-500 outline-none flex justify-between items-center"
                    >
                      <span className="truncate">{selectedCourses.length > 0 ? `${selectedCourses.length} curso(s) selecionado(s)` : "Selecione os cursos..."}</span>
                    </button>
                    {isCoursesDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <input 
                            type="text" 
                            placeholder="Buscar curso..." 
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs outline-none"
                          />
                        </div>
                        <div className="overflow-y-auto p-1">
                          {courses.filter(c => c.name.toLowerCase().includes(courseSearch.toLowerCase())).map(course => (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => toggleCourse(course.name)}
                              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span className="truncate pr-2">{course.name}</span>
                              {selectedCourses.includes(course.name) && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    value={condValue}
                    onChange={(e) => setCondValue(e.target.value)}
                    placeholder={selectedRule === "SKU do Produto específico" ? "Ex: SKU-123, SKU-456" : "Ex: Valor esperado"} 
                    className="w-full mt-1.5 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none" 
                  />
                )}
              </div>
            </div>
            
            {(mode === "exit" || mode === "split") && (
              <div className="border-t border-slate-200 pt-4 mt-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Janela de Tempo (Opcional)
                </label>
                <div className="flex gap-2 mt-1.5">
                  <input 
                    type="number" 
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    placeholder="Ex: 60" 
                    className="w-1/2 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none" 
                  />
                  <select 
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-1/2 bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-medium focus:border-indigo-500 outline-none"
                  >
                    <option value="minutes">Minutos atrás</option>
                    <option value="hours">Horas atrás</option>
                    <option value="days">Dias atrás</option>
                  </select>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Deixe em branco para considerar qualquer data.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50 rounded-b-3xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              const ruleText = selectedRule === "Nome do Curso específico" 
                ? `[Cursos: ${selectedCourses.join(", ")}]` 
                : (selectedRule !== "Nenhuma regra extra" ? `[${selectedRule} ${condValue}]` : "");
                
              onSave({ 
                source: customTriggerSource,
                event: selectedEvent,
                rule: selectedRule,
                value: selectedRule === "Nome do Curso específico" ? selectedCourses : condValue,
                timeWindow: timeWindow ? parseInt(timeWindow) : null,
                timeUnit,
                summary: `${selectedEvent} ${ruleText}`
              });
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm"
          >
            {mode === "entry" ? "Salvar Gatilho" : "Salvar Regra"}
          </button>
        </div>
      </div>
    </div>
  );
}