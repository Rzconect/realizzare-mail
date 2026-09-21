"use client";

import { X, Save, User } from "lucide-react";
import { useState, useEffect } from "react";

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dealData: any) => void;
}

export default function AddDealModal({ isOpen, onClose, onAdd }: AddDealModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("Sem responsável");

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("realizzare_auth_users");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUsers(parsed);
          
          const session = localStorage.getItem("realizzare_current_session") || sessionStorage.getItem("realizzare_current_session");
          if (session) {
             const parsedSession = JSON.parse(session);
             if (parsedSession?.name) {
               setSelectedUser(parsedSession.name);
             }
          }
        } catch (e) {}
      } else {
        setUsers([{ name: "Leonardo Christian", email: "leonardo@realizzare.com.br" }]);
      }
      
      // Reset fields
      setTitle("");
      setValue("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title || !clientName) return;
    
    setIsSaving(true);
    setTimeout(() => {
      const initialsMatch = clientName.match(/\b\w/g);
      const tempInitials = initialsMatch ? initialsMatch.join('').substring(0, 2).toUpperCase() : "NO";
      
      onAdd({
        id: `d-${Date.now()}`,
        title,
        value: parseFloat(value || "0"),
        clientInitials: tempInitials,
        clientName,
        clientColor: "bg-blue-600",
        columnId: "novo",
        phone: clientPhone,
        email: clientEmail,
        assignedTo: selectedUser
      });
      setIsSaving(false);
      onClose();
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 m-auto h-fit max-h-[90vh] w-full max-w-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Novo Negócio</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Título do Negócio *</label>
            <input 
              type="text" 
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Novo Teste Aprovado"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Valor (R$)</label>
            <input 
              type="number" 
              value={value} onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Dados do Contato</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome Completo *</label>
                <input 
                  type="text" 
                  value={clientName} onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">E-mail</label>
                  <input 
                    type="email" 
                    value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">WhatsApp</label>
                  <input 
                    type="text" 
                    value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: 5531999999999"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Responsável pelo Card</label>
             <select 
               value={selectedUser}
               onChange={(e) => setSelectedUser(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
             >
               <option value="Sem responsável">Sem responsável</option>
               {users.map((u, i) => (
                 <option key={i} value={u.name || u.email}>{u.name || u.email}</option>
               ))}
             </select>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !title || !clientName}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            {isSaving ? <span className="animate-spin text-lg block h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="h-4 w-4" />}
            Criar Negócio
          </button>
        </div>
      </div>
    </>
  );
}
