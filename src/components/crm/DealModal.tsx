"use client";

import { X, SlidersHorizontal, ExternalLink, MessageCircle, Edit3, Save, ChevronDown, Send, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ContactNotes from "./ContactNotes";
import { FileText } from "lucide-react";
import ItemTitleWithCoupon from "@/components/ui/ItemTitleWithCoupon";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: any;
  columns?: any[];
  onEdit?: () => void;
  onUpdate?: (updatedDeal: any) => void;
  currentUser?: any;
}

export default function DealModal({ isOpen, onClose, deal, columns = [], onEdit, onUpdate, currentUser }: DealModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("Sem responsável");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCustomFieldsOpen, setIsCustomFieldsOpen] = useState(true);

  // Timeline State
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);

  // Contact Real Data State
  const [contactData, setContactData] = useState<any>(null);
  const [duplicateProfilesCount, setDuplicateProfilesCount] = useState(0);

  useEffect(() => {
    if (deal) {
      setSelectedUser(deal.assignedTo || "Sem responsável");
    }
  }, [deal]);

  useEffect(() => {
    if (isOpen && deal) {
      const fetchAllData = async () => {
         const supabase = createClient();
         
         const getPhoneVariants = (phone: string) => {
           const clean = phone.replace(/[^\d]/g, '');
           if (clean.startsWith('55') && (clean.length === 12 || clean.length === 13)) {
             const areaCode = clean.substring(2, 4);
             let number = clean.substring(4);
             if (number.length === 9 && number.startsWith('9')) {
               number = number.substring(1);
             }
             const without9 = `55${areaCode}${number}`;
             const with9 = `55${areaCode}9${number}`;
             return [with9, without9];
           }
           return [clean];
         };

         // 1. Fetch Contact Real Data
         if (deal.phone || deal.email) {
            let fetchedContacts: any[] = [];
            
            if (deal.phone) {
               const variants = getPhoneVariants(deal.phone);
               const orQuery = variants.map(v => `phone.ilike.%${v}%`).join(',');
               const { data } = await supabase
                 .from('contacts')
                 .select('*')
                 .or(orQuery)
                 .order('created_at', { ascending: false });
               fetchedContacts = data || [];
            }
            
            if (fetchedContacts.length === 0 && deal.email) {
               const { data } = await supabase
                 .from('contacts')
                 .select('*')
                 .eq('email', deal.email)
                 .order('created_at', { ascending: false });
               fetchedContacts = data || [];
            }
            
            if (fetchedContacts.length > 0) {
               setContactData(fetchedContacts[0]);
               setDuplicateProfilesCount(fetchedContacts.length);
            }
         }

                  // 2. Fetch Timeline Events
         if (deal.email) {
           const { data: events } = await supabase
             .from('reporting_events')
             .select('*')
             .eq('contact_email', deal.email)
             .order('created_at', { ascending: false });
           
           if (events) {
             const uniqueEvents: any[] = [];
             const seen = new Set();
             
                          const grouped = new Map();
             
             events.forEach((evt: any) => {
                const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';
                let title = evt.metadata?.item_title || evt.metadata?.course_name || "Produto";
                const amt = evt.metadata?.amount || "0";
                const timeStr = new Date(evt.created_at).toISOString().slice(0, 16); // Up to minutes
                
                // If title is the fallback, mark it so we can prefer real titles
                const isFallback = title.includes("Certificado / Curso Realizzare");
                
                // Group by amount + minute
                const key = `${amt}-${timeStr}`;
                
                if (!grouped.has(key)) {
                  grouped.set(key, { ...evt, _isPaid: isPaid, _isFallback: isFallback, _title: title });
                } else {
                  const existing = grouped.get(key);
                  // Prefer paid status
                  if (isPaid) existing._isPaid = true;
                  // Prefer real title over fallback
                  if (existing._isFallback && !isFallback) {
                    existing._title = title;
                    existing._isFallback = false;
                    existing.metadata = { ...existing.metadata, item_title: title }; // Update metadata for rendering
                  }
                  // If we upgraded to paid, update metadata event so mapping logic renders it green
                  if (isPaid && (!existing.metadata?.event || !existing.metadata.event.includes('paid'))) {
                    existing.metadata = { ...existing.metadata, event: 'order.paid' };
                  }
                }
             });
             
             setTimelineEvents(Array.from(grouped.values()));
           }
         }

         // 3. Fetch Users
         try {
           const res = await fetch('/api/auth/users');
           if (res.ok) {
             const data = await res.json();
             if (data && Array.isArray(data.users)) {
               setUsers(data.users);
             }
           }
         } catch(e) { console.error(e); }
      };
      fetchAllData();
    }
  }, [isOpen, deal]);

  if (!isOpen) return null;

  const currentColumn = columns.find(c => c.id === deal?.columnId) || { title: "Novo", color: "bg-slate-400" };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const handleOpenConversation = () => {
    // Navigate to conversations page with the user's phone number and name
    const phone = deal?.phone || "5531973301958";
    const name = encodeURIComponent(deal?.clientName || "Contato");
    router.push(`/dashboard/conversations?phone=${phone}&name=${name}`);
    onClose();
  };

  const assignUser = (userName: string) => {
    setSelectedUser(userName);
    setIsUserDropdownOpen(false);
    if (onUpdate && deal) {
      onUpdate({ ...deal, assignedTo: userName });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-slate-100 shadow-2xl z-50 flex flex-col animate-slideInRight border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-100 bg-white">
          <div className="flex flex-col gap-1 w-[85%]">
            <div className="flex items-center gap-3">
              <ItemTitleWithCoupon 
                rawTitle={deal?.title?.includes("Pagamento:") ? "Aguardando Pagamento" : (deal?.title || "Negócio")}
                titleClassName="text-xl font-black text-slate-800 tracking-tight"
                containerClassName="flex items-center gap-2"
              />
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                deal?.boardId === 'pedidos_pendentes' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-cyan-50 text-cyan-600 border-cyan-200'
              }`}>{currentColumn.title}</span>
            </div>
            {deal?.title?.includes("Pagamento:") && (
              <span className="text-sm font-semibold text-slate-500 line-clamp-1">
                {deal.title.split(":").slice(1).join(":").trim()}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors self-start mt-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
          {deal?.boardId === 'atividades' ? (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="relative">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsável</span>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center justify-between w-full text-left focus:outline-none group"
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {selectedUser}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)}></div>
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                        <button 
                          onClick={() => assignUser("Sem responsável")}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Sem responsável
                        </button>
                        {users.map((u, i) => {
                          const nameParts = u.name ? u.name.split(" ") : u.email.split("@")[0].split(" ");
                          const shortName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0];
                          return (
                            <button 
                              key={i}
                              onClick={() => assignUser(shortName)}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                            >
                              {shortName}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Prioridade</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider inline-block ${
                    deal?.priority === 'Alta' ? 'bg-red-100 text-red-600' : 
                    deal?.priority === 'Média' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {deal?.priority || 'Normal'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Data de Criação
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    {deal?.createdAt ? new Date(deal.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 text-orange-600">
                    Previsão / Prazo
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    {deal?.dueDate ? new Date(deal.dueDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Observações e Detalhes</span>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-sm text-slate-700 min-h-[80px] whitespace-pre-wrap">
                  {deal?.description || <span className="text-slate-400 italic">Nenhuma observação adicionada.</span>}
                </div>
              </div>

              {deal?.todos && deal.todos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Checklist da Tarefa</span>
                    <span className="text-xs font-bold text-indigo-600">
                      {deal.todos.filter((t: any) => t.done).length}/{deal.todos.length} Concluídos
                    </span>
                  </div>
                  <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                    {deal.todos.map((todo: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors group">
                        <input 
                          type="checkbox"
                          checked={todo.done}
                          onChange={(e) => {
                            if (onUpdate && deal) {
                              const newTodos = [...deal.todos];
                              newTodos[idx] = { ...newTodos[idx], done: e.target.checked };
                              onUpdate({ ...deal, todos: newTodos });
                            }
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className={`text-sm flex-1 cursor-pointer ${todo.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                          {todo.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Custom Fields Section */}
              <div className="py-2 mt-2">
                <button 
                  onClick={() => setIsCustomFieldsOpen(!isCustomFieldsOpen)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors w-full mb-3 outline-none"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider flex-1 text-left">Detalhes do Contato</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCustomFieldsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCustomFieldsOpen && (
                  <div className="animate-fadeIn">
                    {duplicateProfilesCount > 1 && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-700 p-2.5 rounded-lg text-[10px] font-medium flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">⚠️</span>
                        <span>
                          O número de telefone deste contato ({deal?.phone}) está vinculado a {duplicateProfilesCount} perfis diferentes na base.
                          <br/>
                          Exibindo dados do perfil mais recente.
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nome Completo</label>
                        <input readOnly type="text" value={deal?.clientName || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Telefone / WhatsApp</label>
                        <input readOnly type="text" value={deal?.phone || contactData?.phone || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">E-mail</label>
                        <input readOnly type="email" value={contactData?.email || deal?.email || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Data de Cadastro</label>
                        <input readOnly type="text" value={contactData?.created_at ? new Date(contactData.created_at).toLocaleDateString('pt-BR') : ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">ID do Perfil</label>
                        <input readOnly type="text" value={contactData?.id || ''} className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                      </div>
                    </div>
                    {contactData?.id && (
                      <div className="mt-3 flex justify-end">
                        <Link 
                          href={`/dashboard/contacts/${contactData.id}`}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg"
                        >
                          Ver ficha completa
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 bg-white p-5 rounded-xl shadow-sm border border-slate-100 mt-2 mb-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor da Oportunidade</span>
                  <p className="text-lg font-black text-slate-900 leading-none">R$ {Number(deal?.value || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Etapa Atual</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${currentColumn.color.replace('bg-', 'bg-').replace('-500', '-400')} shadow-sm`}></span>
                    <span className="text-sm font-bold text-slate-800">{currentColumn.title}</span>
                  </div>
                </div>
                
                <div className="relative border-t border-slate-100 pt-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsável</span>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center justify-between w-[90%] text-left text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer group"
                  >
                    {selectedUser} <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                  
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsUserDropdownOpen(false)}></div>
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                        <button 
                          onClick={() => assignUser("Sem responsável")}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Sem responsável
                        </button>
                        {users.map((u, i) => {
                          const nameParts = u.name ? u.name.split(' ') : u.email.split('@')[0].split(' ');
                          const shortName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0];
                          return (
                            <button 
                              key={i}
                              onClick={() => assignUser(shortName)}
                              className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                            >
                              {shortName}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Criado em
                  </span>
                  <p className="text-sm font-bold text-slate-700">
                    {deal?.createdAt ? new Date(deal.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>

              <div className="border-b border-slate-200/80 my-2"></div>

              {/* Timeline Panel */}
              <div className="py-3 flex flex-col">
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Linha do Tempo de Transações</span>
                </div>
                
                <div className="flex-1 space-y-4">
                  {timelineEvents.length === 0 ? (
                    <div className="h-20 flex items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma transação encontrada.
                    </div>
                  ) : (
                    timelineEvents.map((evt, idx) => {
                      const isPaid = evt.metadata?.status === 'paid' || evt.event === 'order.paid' || evt.metadata?.event === 'order.paid' || evt.metadata?.event === 'charge.paid';
                      return (
                        <div key={evt.id || idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                              <span className="text-[10px] font-bold">{isPaid ? 'R$' : '⏳'}</span>
                            </div>
                            {idx < timelineEvents.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1"></div>}
                          </div>
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 mb-2 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {isPaid ? 'Compra Aprovada' : 'Pedido Gerado'}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {new Date(evt.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 leading-snug">
                              {evt.metadata?.item_title || evt.metadata?.course_name || "Produto Realizzare"}
                            </p>
                            {evt.metadata?.amount && (
                              <p className="text-xs font-bold text-slate-500 mt-1.5">
                                R$ {Number(evt.metadata.amount).toFixed(2).replace('.', ',')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            
                <div className="border-b border-slate-200/80 my-2"></div>
                <div className="py-3 flex flex-col mt-2">
                  <div className="flex items-center gap-2 text-slate-500 mb-4">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Observações</span>
                  </div>
                  <div className="bg-slate-100/50 rounded-xl border border-slate-200 p-3 h-[300px]">
                    <ContactNotes contactId={deal.contactId} currentUser={currentUser} />
                  </div>
                </div>
</>
          )}
          
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-slate-200/50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button onClick={onClose} className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all">
            Fechar
          </button>
          <button onClick={handleOpenConversation} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all">
            <MessageCircle className="h-3.5 w-3.5" />
            Abrir conversa
          </button>
          <button onClick={onEdit} className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm">
            <Edit3 className="h-3.5 w-3.5" />
            Editar
          </button>
        </div>
      </div>
    </>
  );
}

function UserIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
