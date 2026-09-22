"use client";

import { X, Save, User } from "lucide-react";
import { useState, useEffect } from "react";

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dealData: any) => void;
  activeBoard?: "teste_aprovado" | "pedidos_pendentes" | "atividades";
}

export default function AddDealModal({ isOpen, onClose, onAdd, activeBoard = "teste_aprovado" }: AddDealModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  
  // Activity specific
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Alta" | "Média" | "Baixa">("Média");
  const [todos, setTodos] = useState<{ id: string; text: string; done: boolean }[]>([]);
  
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("Sem responsável");

  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/users')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.users)) {
            setUsers(data.users);
          }
        })
        .catch(e => console.error(e));
      
      // Reset fields
      setTitle("");
      setValue("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setDescription("");
      setDueDate("");
      setPriority("Média");
      setTodos([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title || (activeBoard !== 'atividades' && !clientName)) return;
    
    setIsSaving(true);
    setTimeout(() => {
      const actualClientName = clientName || "Atividade Genérica";
      const initialsMatch = actualClientName.match(/\b\w/g);
      const tempInitials = initialsMatch ? initialsMatch.join('').substring(0, 2).toUpperCase() : "NO";
      
      onAdd({
        id: `d-${Date.now()}`,
        title,
        value: activeBoard === 'atividades' ? 0 : parseFloat(value || "0"),
        clientInitials: tempInitials,
        clientName: actualClientName,
        clientColor: "bg-blue-600",
        columnId: "novo",
        phone: clientPhone,
        email: clientEmail,
        assignedTo: selectedUser,
        createdAt: new Date().toISOString(),
        dueDate,
        description,
        priority,
        todos
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
          <h2 className="text-lg font-bold text-slate-800">
            {activeBoard === 'atividades' ? 'Nova Atividade' : 'Novo Negócio'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              {activeBoard === 'atividades' ? 'Título da Tarefa *' : 'Título do Negócio *'}
            </label>
            <input 
              type="text" 
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={activeBoard === 'atividades' ? "Ex: Ligar para o cliente" : "Ex: Novo Teste Aprovado"}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          {activeBoard !== 'atividades' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Valor (R$)</label>
              <input 
                type="number" 
                value={value} onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {activeBoard === 'atividades' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Previsão (Término)</label>
                  <input 
                    type="date" 
                    value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Prioridade</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Observações / Descrição</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes da tarefa..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Checklist (To-Do)</label>
                <div className="space-y-2 mb-2">
                  {todos.map((todo, idx) => (
                    <div key={todo.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <input 
                        type="checkbox" 
                        checked={todo.done}
                        onChange={(e) => setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: e.target.checked } : t))}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input 
                        type="text"
                        value={todo.text}
                        onChange={(e) => setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, text: e.target.value } : t))}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                        placeholder="Item do checklist..."
                      />
                      <button 
                        onClick={() => setTodos(prev => prev.filter(t => t.id !== todo.id))}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setTodos(prev => [...prev, { id: Date.now().toString(), text: '', done: false }])}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                >
                  + Adicionar Item
                </button>
              </div>
            </>
          )}

          {activeBoard !== 'atividades' && (
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
          )}
          
          <div className="pt-2 border-t border-slate-100">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                {activeBoard === 'atividades' ? 'Responsável' : 'Responsável pelo Card'}
             </label>
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
            disabled={isSaving || !title || (activeBoard !== 'atividades' && !clientName)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            {isSaving ? <span className="animate-spin text-lg block h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="h-4 w-4" />}
            {activeBoard === 'atividades' ? 'Criar Atividade' : 'Criar Negócio'}
          </button>
        </div>
      </div>
    </>
  );
}
