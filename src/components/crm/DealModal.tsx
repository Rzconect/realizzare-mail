"use client";

import { X, SlidersHorizontal, ExternalLink, MessageCircle, Edit3, Save, ChevronDown, Send, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: any;
  columns?: any[];
}

export default function DealModal({ isOpen, onClose, deal, columns = [] }: DealModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("Sem responsável");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCustomFieldsOpen, setIsCustomFieldsOpen] = useState(false);

  // WhatsApp Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  // Contact Real Data State
  const [contactData, setContactData] = useState<any>(null);
  const [duplicateProfilesCount, setDuplicateProfilesCount] = useState(0);

  useEffect(() => {
    if (isOpen && deal) {
      const fetchAllData = async () => {
         const supabase = createClient();
         
         // 1. Fetch Contact Real Data
         if (deal.phone || deal.email) {
            let fetchedContacts: any[] = [];
            
            if (deal.phone) {
               const cleanPhone = deal.phone.replace(/[^\d]/g, '');
               const { data } = await supabase
                 .from('contacts')
                 .select('*')
                 .ilike('phone', `%${cleanPhone}%`)
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

         // 2. Fetch Chat
         if (deal.phone) {
           const cleanPhone = deal.phone.replace(/[^\d]/g, '');
           const { data: chatData } = await supabase
             .from('whatsapp_chats')
             .select('id, remote_jid, whatsapp_messages(*)')
             .eq('phone', cleanPhone)
             .single();
             
           if (chatData) {
             setChatId(chatData.id);
             const msgs = (chatData.whatsapp_messages || []).sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
             setChatMessages(msgs);
           }
         }
      };
      fetchAllData();
    }
  }, [isOpen, deal]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      const cleanPhone = deal?.phone.replace(/[^\d]/g, '');
      const remoteJid = `${cleanPhone}@s.whatsapp.net`;
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId || `temp-${cleanPhone}`,
          remoteJid: remoteJid,
          text: messageText
        })
      });
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: messageText,
        is_from_me: true,
        created_at: new Date().toISOString(),
        status: 'sending'
      }]);
      setMessageText("");
    } catch (e) {
       console.error("Failed to send message", e);
    }
    setIsSending(false);
  };


  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("realizzare_auth_users");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUsers(parsed);
        } catch (e) {}
      } else {
        setUsers([{ name: "Leonardo Christian", email: "leonardo@realizzare.com.br" }]);
      }
    }
  }, [isOpen]);

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
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[500px] bg-slate-100 shadow-2xl z-50 flex flex-col animate-slideInRight border-l border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{deal?.title || "Negócio"}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold border border-cyan-200 uppercase tracking-wider">{currentColumn.title}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 custom-scrollbar">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-3">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor</span>
              <p className="text-base font-bold text-slate-900">R$ {deal?.value || 0}</p>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Etapa</span>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${currentColumn.color.replace('bg-', 'bg-').replace('-500', '-400')}`}></span>
                <span className="text-sm font-semibold text-slate-700">{currentColumn.title}</span>
              </div>
            </div>
            
            <div className="relative">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Responsável</span>
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {selectedUser} <ChevronDown className="h-3 w-3" />
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
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Previsão de fecho</span>
              <p className="text-sm font-semibold text-slate-700">—</p>
            </div>
            <div className="col-span-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Criado em</span>
              <p className="text-sm font-semibold text-slate-700">18 de ago.</p>
            </div>
          </div>

          <div className="border-b border-slate-200/80 my-2"></div>

          {/* Custom Fields Section */}
          <div className="py-3">
            <button 
              onClick={() => setIsCustomFieldsOpen(!isCustomFieldsOpen)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors w-full mb-4 outline-none"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider flex-1 text-left">Detalhes do Contato</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCustomFieldsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCustomFieldsOpen && (
              <>
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
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Cidade</label>
                    <input readOnly type="text" value={contactData?.city || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Estado</label>
                    <input readOnly type="text" value={contactData?.state || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">E-mail</label>
                    <input readOnly type="email" value={contactData?.email || deal?.email || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Data de Cadastro</label>
                    <input readOnly type="text" value={contactData?.created_at ? new Date(contactData.created_at).toLocaleDateString('pt-BR') : ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">ID do Perfil</label>
                    <input readOnly type="text" value={contactData?.id || ''} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none" />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="border-b border-slate-200/80 my-2"></div>

          {/* WhatsApp Chat Panel */}
          <div className="py-3 flex flex-col flex-1 min-h-[300px]">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Conversa via WhatsApp</span>
              </div>
              <button onClick={handleOpenConversation} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                Abrir painel <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-t-xl p-3 overflow-y-auto space-y-3 h-64 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs font-semibold text-slate-400">
                  Nenhuma mensagem ainda. Envie a primeira!
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isFromMe = msg.sender === 'agent' || msg.is_from_me;
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm relative ${isFromMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                        {msg.text}
                        {msg.status === 'sending' && <Clock className="h-2.5 w-2.5 absolute bottom-1 right-1 opacity-50" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Message Input */}
            <div className="flex items-center gap-2 p-2 bg-white border border-t-0 border-slate-200 rounded-b-xl">
              <input 
                type="text" 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite uma mensagem..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isSending || !messageText.trim()}
                className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-50 transition-colors shrink-0"
              >
                {isSending ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 -ml-0.5" />}
              </button>
            </div>
          </div>
          
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
          <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm">
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
