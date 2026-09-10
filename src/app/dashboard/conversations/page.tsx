"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, MessageSquare, Plus, ChevronDown, CheckCheck, Send, Phone, User as UserIcon, Lock, MoreVertical, X, Bot } from "lucide-react";

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isConnected, setIsConnected] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<"minhas" | "fila" | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterAssignedTo, setFilterAssignedTo] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");

  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    // Check connection
    const connected = localStorage.getItem("realizzare_wa_connected");
    // For now we assume connected since we are testing Evolution API directly
    // if (connected !== "true") {
    //   setIsConnected(false);
    // }

    const loadUsers = () => {
      // Load users
      const storedUsers = localStorage.getItem("realizzare_auth_users");
      if (storedUsers) {
        try {
          const parsed = JSON.parse(storedUsers);
          // Get current user from session
          const sessionStr = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
          let currentSessionUser = parsed[0];
          
          if (sessionStr) {
            currentSessionUser = JSON.parse(sessionStr);
            setCurrentUser(currentSessionUser);
          } else {
            setCurrentUser(currentSessionUser);
          }
          
          // Force the users array to use the name from the session for the current user
          const updatedParsed = parsed.map((u: any) => {
            if (u.email && currentSessionUser.email && u.email.toLowerCase() === currentSessionUser.email.toLowerCase()) {
              return { ...u, name: currentSessionUser.name };
            }
            return u;
          });
          
          // Remove duplicates based on name to prevent "Leonardo Christian" appearing twice
          const uniqueUsers = Array.from(new Map(updatedParsed.map(u => [u.name, u])).values());
          
          setUsers(uniqueUsers);
        } catch (e) {}
      } else {
        const mockUser = { name: "Leonardo Christian", email: "leonardo@realizzare.com.br" };
        setUsers([mockUser]);
        setCurrentUser(mockUser);
      }
    };

    loadUsers();
    
    // Listen for cross-tab or cross-component storage changes
    window.addEventListener("storage", loadUsers);
    return () => window.removeEventListener("storage", loadUsers);
  }, []);

  useEffect(() => {
    // Fetch initial chats
    const fetchChats = async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: chatsData } = await supabase
        .from('whatsapp_chats')
        .select('*, whatsapp_messages(*)')
        .order('last_message_time', { ascending: false });

      if (chatsData) {
        const mappedChats = chatsData.map(c => {
          // Sort messages ascending by created_at
          const sortedMessages = (c.whatsapp_messages || []).sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          return {
            id: c.id,
            remoteJid: c.remote_jid,
            name: c.name,
            phone: c.phone,
            initials: c.name.substring(0, 2).toUpperCase(),
            color: "bg-[#0f7650]",
            assignedTo: c.assigned_to,
            status: c.status,
            lastMessageTime: new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: sortedMessages.map((m: any) => ({
              id: m.id,
              sender: m.sender === 'user' ? 'client' : m.sender,
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
          };
        });

        setChats(mappedChats);
      }

      // Subscribe to real-time changes
      const channel = supabase.channel('whatsapp-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, payload => {
          fetchChats(); // Naive refresh on new message
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_chats' }, payload => {
          fetchChats();
        })
        .subscribe();

      // Fallback Polling every 4 seconds to guarantee delivery
      const interval = setInterval(() => {
        fetchChats();
      }, 4000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    };

    fetchChats();
  }, []);

  useEffect(() => {
    // Handle URL param for new conversation
    const phoneToOpen = searchParams.get("phone");
    if (phoneToOpen && chats.length > 0) {
      const existingChat = chats.find(c => c.phone === phoneToOpen);
      if (existingChat) {
        setActiveChatId(existingChat.id);
      } else {
        // We shouldn't create mock chats in real DB directly from URL unless they send a message
        console.log("Chat not found for phone:", phoneToOpen);
      }
      
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, chats, router]);

  const currentActiveChat = chats.find(c => c.id === activeChatId);
  const activeChatMessagesLength = currentActiveChat?.messages?.length || 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, activeChatMessagesLength]);

  if (!isConnected) {
    return (
      <div className="flex flex-col h-full bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-sm items-center justify-center p-8 text-center">
        <div className="h-20 w-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">WhatsApp Desconectado</h2>
        <p className="text-slate-500 max-w-md text-sm mb-6">
          Você precisa conectar o número de WhatsApp da sua empresa antes de utilizar o módulo de conversas.
        </p>
        <button 
          onClick={() => router.push("/dashboard/settings")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Ir para Configurações
        </button>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId) return;

    const chat = chats.find(c => c.id === activeChatId);
    if (!chat) return;

    // Optimistic UI update + Auto Assign
    const textToSend = messageText;
    const newAssignedTo = currentUser?.name || chat.assignedTo;
    setMessageText("");
    
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          assignedTo: newAssignedTo,
          status: newAssignedTo ? "Aberto" : "Em fila",
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [
            ...c.messages,
            { id: "optimistic" + Date.now(), sender: "agent", text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]
        };
      }
      return c;
    }));

    // Call real API
    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          remoteJid: chat.remoteJid,
          text: textToSend
        })
      });
      
      // Update assigned_to in Supabase
      if (newAssignedTo !== chat.assignedTo) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase
          .from('whatsapp_chats')
          .update({ assigned_to: newAssignedTo, status: 'Aberto' })
          .eq('id', chat.id);
      }
    } catch (error) {
      console.error("Failed to send message or assign:", error);
    }
  };

  const handleAssignUser = async (userName: string | null) => {
    if (!activeChatId) return;
    
    // Optimistic UI update
    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          assignedTo: userName,
          status: userName ? "Aberto" : "Em fila"
        };
      }
      return chat;
    }));
    setIsAssignDropdownOpen(false);
    
    // Update Supabase
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase
        .from('whatsapp_chats')
        .update({ assigned_to: userName, status: userName ? 'Aberto' : 'Em fila' })
        .eq('id', activeChatId);
    } catch (error) {
      console.error("Failed to update assigned user:", error);
    }
  };

  const filteredChats = chats.filter(chat => {
    if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase()) && !chat.phone.includes(searchQuery)) {
      return false;
    }
    if (filterAssignedTo !== null) {
      if (filterAssignedTo === "Não Atribuído" && chat.assignedTo !== null) {
        return false;
      } else if (filterAssignedTo !== "Não Atribuído" && chat.assignedTo !== filterAssignedTo) {
        return false;
      }
    }
    if (activeFilter === "minhas") return chat.assignedTo === currentUser?.name;
    if (activeFilter === "fila") return !chat.assignedTo;
    return true; // "todos"
  });

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim()) return;
    
    // Clean phone numbers: remove anything that is not digit or +
    const cleanPhone = newChatPhone.replace(/[^\d+]/g, '');

    const newChat = {
      id: "c" + Date.now(),
      name: "Novo Contato",
      phone: cleanPhone,
      initials: "NC",
      color: "bg-slate-500",
      assignedTo: currentUser?.name || "Leonardo Christian",
      status: "Aberto",
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setShowNewChatModal(false);
    setNewChatPhone("");
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex h-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* LEFT SIDEBAR - CHAT LIST */}
      <div className="w-[340px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/50">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Conversas</h2>
            <div className="flex gap-2 relative">
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${filterAssignedTo || isFilterDropdownOpen ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}
                title="Filtrar por Atendente"
              >
                <Filter className="h-4 w-4" />
              </button>
              
              {isFilterDropdownOpen && (
                <div className="absolute top-full right-10 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Filtrar por Usuário
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    <button 
                      onClick={() => { setFilterAssignedTo(null); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${filterAssignedTo === null ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>Todos</span>
                      {filterAssignedTo === null && <CheckCheck className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => { setFilterAssignedTo("Não Atribuído"); setIsFilterDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${filterAssignedTo === "Não Atribuído" ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>Não Atribuído</span>
                      {filterAssignedTo === "Não Atribuído" && <CheckCheck className="h-4 w-4" />}
                    </button>
                    {users.map(u => (
                      <button 
                        key={u.email}
                        onClick={() => { setFilterAssignedTo(u.name); setIsFilterDropdownOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${filterAssignedTo === u.name ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <span className="truncate">{u.name}</span>
                        {filterAssignedTo === u.name && <CheckCheck className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowNewChatModal(true)}
                className="p-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors cursor-pointer"
                title="Nova Conversa"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar ou começar nova conversa" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center px-2 py-2 border-b border-slate-200 gap-1">
          <button 
            onClick={() => setActiveFilter("minhas")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeFilter === "minhas" ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"}`}
          >
            Minhas ({chats.filter(c => c.assignedTo === currentUser?.name).length})
          </button>
          <button 
            onClick={() => setActiveFilter("fila")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeFilter === "fila" ? "bg-amber-100 text-amber-700" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"}`}
          >
            Em fila ({chats.filter(c => !c.assignedTo).length})
          </button>
          <button 
            onClick={() => setActiveFilter("todos")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeFilter === "todos" ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"}`}
          >
            Todos ({chats.length})
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`flex items-start gap-3 p-3 border-b border-slate-100 cursor-pointer transition-colors ${activeChatId === chat.id ? "bg-indigo-50/50" : "hover:bg-white"}`}
            >
              <div className={`h-10 w-10 shrink-0 text-white rounded-full flex items-center justify-center font-bold text-sm ${chat.color}`}>
                {chat.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{chat.name}</h4>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {chat.messages.length > 0 && chat.messages[chat.messages.length - 1].sender === "agent" && (
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  )}
                  <p className="text-xs text-slate-500 truncate">
                    {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "Nenhuma mensagem"}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${chat.assignedTo ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {chat.assignedTo ? "Aberto" : "Aguardando"}
                  </span>
                  {chat.assignedTo && (
                    <span className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                      <UserIcon className="h-3 w-3" /> {chat.assignedTo.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Nenhuma conversa encontrada.
            </div>
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#EFEAE2]">
        
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-[68px] flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200 shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 shrink-0 text-white rounded-full flex items-center justify-center font-bold text-sm ${activeChat.color}`}>
                  {activeChat.initials}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">{activeChat.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                    <Phone className="h-3 w-3" />
                    <span>+{activeChat.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Atribuição visual idêntica ao print */}
                <div className="relative">
                  <button 
                    onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                    className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer max-w-[250px]"
                  >
                    <div className="h-6 w-6 shrink-0 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left flex flex-col justify-center min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight truncate">Responsável</span>
                      <span className="text-xs font-bold text-slate-700 leading-tight truncate">
                        {activeChat.assignedTo ? activeChat.assignedTo : "Atribuir..."}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                  
                  {isAssignDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsAssignDropdownOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                        <button 
                          onClick={() => handleAssignUser(null)}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
                        >
                          Sem responsável (Voltar para fila)
                        </button>
                        {users.map((u, i) => {
                          const fullName = u.name || u.email.split("@")[0];
                          const nameParts = fullName.split(" ");
                          const initials = nameParts.length > 1 ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}` : fullName.charAt(0);
                          return (
                            <button 
                              key={i}
                              onClick={() => handleAssignUser(fullName)}
                              className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer truncate"
                            >
                              <div className="h-5 w-5 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px]">
                                {initials.toUpperCase()}
                              </div>
                              <span className="truncate">{fullName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                
                <button className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold text-xs bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                  Ver detalhes do contato
                </button>
                <div className="relative">
                  <button 
                    onClick={() => {
                      const dropdown = document.getElementById("chat-options-dropdown");
                      if (dropdown) dropdown.classList.toggle("hidden");
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div id="chat-options-dropdown" className="hidden absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    <button 
                      onClick={async () => {
                        if (confirm("Tem certeza que deseja apagar esta conversa?")) {
                          // Call Supabase to delete
                          const { createClient } = await import('@supabase/supabase-js');
                          const supabase = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                          );
                          await supabase.from('whatsapp_chats').delete().eq('id', activeChat.id);
                          setChats(prev => prev.filter(c => c.id !== activeChat.id));
                          setActiveChatId(null);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Apagar Conversa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 relative custom-scrollbar bg-[#EFEAE2]">
              
              <div className="flex justify-center mb-6">
                <span className="bg-white/80 backdrop-blur border border-slate-200/50 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                  Hoje
                </span>
              </div>

              {activeChat.messages.map((msg: any) => {
                const isMine = msg.sender === "agent";
                const isBot = msg.sender === "bot";
                
                if (isBot) {
                  return (
                    <div key={msg.id} className="flex justify-start mb-4">
                      <div className="max-w-[75%] lg:max-w-[60%] rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm relative group bg-indigo-50 border border-indigo-100">
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="h-3 w-3 text-indigo-500" />
                          <span className="text-[10px] font-bold text-indigo-500">Bot Realizzare</span>
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[9px] font-semibold text-slate-400">{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-4`}>
                    <div 
                      className={`max-w-[75%] lg:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm relative group ${
                        isMine 
                          ? "bg-[#d9fdd3] border border-[#c3f2bc] rounded-tr-none" 
                          : "bg-white border border-slate-100 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-[9px] font-semibold ${isMine ? "text-emerald-700/60" : "text-slate-400"}`}>{msg.time}</span>
                        {isMine && <CheckCheck className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] p-3 border-t border-slate-200 shrink-0">
              {activeChat.assignedTo !== currentUser?.name && activeChat.assignedTo !== currentUser?.email?.split('@')[0].split(' ')[0] && activeChat.assignedTo !== null && currentUser ? (
                <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-200 bg-amber-50 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold">
                    <Lock className="h-4 w-4" />
                    Esta conversa está atribuída a {activeChat.assignedTo}.
                  </div>
                  <button 
                    onClick={() => handleAssignUser(currentUser.name)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
                  >
                    Assumir Atendimento
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-white rounded-2xl border border-slate-200 p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                  <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors shrink-0 cursor-pointer">
                    <Plus className="h-5 w-5" />
                  </button>
                  <textarea 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Digite uma mensagem"
                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3 text-sm text-slate-800 custom-scrollbar"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button 
                    type="submit" 
                    disabled={!messageText.trim()}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="h-24 w-24 bg-slate-200/50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-light text-slate-700 mb-2">WhatsApp Realizzare</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Selecione uma conversa na lista ao lado ou busque por um contato para iniciar o atendimento.
            </p>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Nova Conversa</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNewChat} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Número do WhatsApp
                </label>
                <div className="flex rounded-xl overflow-hidden shadow-sm border border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                  <div className="bg-slate-50 border-r border-slate-300 px-3 py-2.5 flex items-center justify-center text-slate-500 text-sm font-medium">
                    +
                  </div>
                  <input
                    type="text"
                    value={newChatPhone}
                    onChange={(e) => setNewChatPhone(e.target.value)}
                    placeholder="Ex: 5511999998888"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Digite o Código do País (55) + DDD + Número. Apenas números. Exemplo para o Brasil: 5531988887777.
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newChatPhone.trim()}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Iniciar Conversa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
