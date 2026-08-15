"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { mockProfileData } from "./[id]/page";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Search,
  Filter,
  Plus,
  ChevronDown,
  Trash2,
  Tag as TagIcon,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  PlusCircle,
  Eye,
  Settings,
  Settings2,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  Edit2,
  Edit3,
  UserPlus,
  LogOut,
  ListFilter,
  ExternalLink,
  Download
} from "lucide-react";

// Mock Contacts database matching our schema
const realize_mock_contacts = [
  { id: "c1", first_name: "Leticia", last_name: "S Santos", email: "leticia.santos@gmail.com", phone: "(11) 99122-3344", status: "active", created_at: "2026-08-15", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 45.70, location: { state: "SP", city: "São Paulo" } },
  { id: "c2", first_name: "Maria Aparecida", last_name: "de Oliveira", email: "maria.aparecida@gmail.com", phone: "(31) 99887-1122", status: "active", created_at: "2026-08-15", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 55.60, location: { state: "MG", city: "Belo Horizonte" } },
  { id: "c3", first_name: "Raissa Prates", last_name: "da Silva Justiniano", email: "raissa.prates@gmail.com", phone: "(21) 97711-2233", status: "active", created_at: "2026-08-15", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 45.70, location: { state: "RJ", city: "Rio de Janeiro" } },
  { id: "c4", first_name: "Anisio Mario", last_name: "dos Santos Dias", email: "anisio.dias@gmail.com", phone: "(41) 99123-5566", status: "active", created_at: "2026-08-14", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Assinatura Plano + Certificado", courseStatus: "Ativo", total_spent: 154.26, location: { state: "PR", city: "Curitiba" } },
  { id: "c5", first_name: "Beatriz", last_name: "dos Santos Mendes", email: "beatriz.mendes@gmail.com", phone: "(71) 99776-4433", status: "active", created_at: "2026-08-14", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 45.70, location: { state: "BA", city: "Salvador" } },
  { id: "c6", first_name: "Patricia", last_name: "Malim", email: "patricia.malim@gmail.com", phone: "(51) 98844-3322", status: "active", created_at: "2026-08-14", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 50.04, location: { state: "RS", city: "Porto Alegre" } },
  { id: "c7", first_name: "Renata", last_name: "Maciel Braga", email: "renata.braga@gmail.com", phone: "(81) 99221-8899", status: "active", created_at: "2026-08-13", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 45.70, location: { state: "PE", city: "Recife" } },
  { id: "c8", first_name: "Gabriel Pinto", last_name: "Costa Silva", email: "gabriel.silva@gmail.com", phone: "(85) 99334-1188", status: "active", created_at: "2026-08-13", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 45.70, location: { state: "CE", city: "Fortaleza" } },
  { id: "c9", first_name: "Mikael Castello", last_name: "Campos", email: "mikaelcastello@gmail.com", phone: "(11) 98122-3344", status: "active", created_at: "2026-08-12", tags: ["Pagar.me V5", "Cliente Realizzare"], course: "Certificado de Conclusão - Realizzare Cursos", courseStatus: "Ativo", total_spent: 45.70, location: { state: "SP", city: "São Paulo" } },
];

function generateImportedMockContacts() {
  const firstNames = ["Lucas", "Mariana", "Gabriel", "Beatriz", "Rodrigo", "Camila", "Fernando", "Patricia", "Gustavo", "Vanessa", "Diego", "Aline", "Marcelo", "Renata", "Thiago", "Amanda", "Rafael", "Juliana", "Bruno", "Fernanda", "Leonardo", "Leticia", "Vinicius", "Larissa", "Matheus", "Jessica"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Alves", "Lopes", "Araújo", "Barbosa", "Rocha", "Dias"];
  const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br", "uol.com.br", "live.com"];

  const importedList: any[] = [];

  for (let i = 1; i <= 1268; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const domain = domains[i % domains.length];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${domain}`;

    importedList.push({
      id: `c_imp_ac_${i}`,
      first_name: fn,
      last_name: ln, // Clean name with no # or numbers!
      email: email,
      phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "unsubscribed", // All unsubscribed as configured in import!
      created_at: "01/07/2026",
      tags: ["Importado ActiveCampaign"],
      course: "Nenhum curso iniciado",
      courseStatus: "Não informado",
      total_spent: 0
    });
  }

  return importedList;
}

interface SearchableFieldDropdownProps {
  value: string;
  onChange: (value: string) => void;
  customFields: Array<{ name: string; tag: string; type: string }>;
}

function SegmentCourseDropdown({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableCourses = [
    "Introdução à Programação Web",
    "Gestão Financeira para Negócios",
    "Desenvolvimento de Carreira e Liderança",
    "Marketing Digital de Performance",
    "Nenhum"
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedCourses = value ? value.split(",") : [];

  const toggleCourse = (course: string) => {
    let updated;
    if (selectedCourses.includes(course)) {
      updated = selectedCourses.filter(c => c !== course);
    } else {
      updated = [...selectedCourses, course];
    }
    onChange(updated.join(","));
  };

  const filtered = availableCourses.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex-1 min-w-[200px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-left flex items-center justify-between gap-1.5 cursor-pointer font-medium hover:border-slate-350 min-h-[32px]"
      >
        <span className="truncate">
          {selectedCourses.length === 0
            ? "Selecionar cursos..."
            : selectedCourses.length === 1
            ? (selectedCourses[0] === "Nenhum" ? "Sem Matrícula" : selectedCourses[0])
            : `${selectedCourses.length} cursos selecionados`}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-450 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-2 animate-fadeIn max-h-60 overflow-y-auto w-max max-w-[360px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-[11px] focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            {filtered.map(c => {
              const isChecked = selectedCourses.includes(c);
              return (
                <label
                  key={c}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-[11px] font-medium text-slate-700 select-none whitespace-normal leading-relaxed text-left"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCourse(c)}
                    className="rounded border-slate-300 text-indigo-650 h-3.5 w-3.5 focus:ring-0 cursor-pointer"
                  />
                  <span className="truncate">{c === "Nenhum" ? "Sem Matrícula" : c}</span>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <span className="text-[10px] text-slate-400 italic block text-center py-2">
                Nenhum curso encontrado.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableFieldDropdown({ value, onChange, customFields }: SearchableFieldDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Informações pessoais do lead": false,
    "Cursos e Matrículas": false,
    "Campanhas e Automação": false,
    "Campos personalizados": false
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setExpandedGroups({
        "Informações pessoais do lead": false,
        "Cursos e Matrículas": false,
        "Campanhas e Automação": false,
        "Campos personalizados": false
      });
    }
  }, [isOpen]);

  const personalFields = [
    { id: "name", label: "Nome Completo" },
    { id: "first_name", label: "Primeiro Nome" },
    { id: "last_name", label: "Sobrenome" },
    { id: "email", label: "E-mail" },
    { id: "phone", label: "Telefone / WhatsApp" },
    { id: "created_at", label: "Data de Cadastro" },
    { id: "status", label: "Status do Lead" },
    { id: "total_spent", label: "Total Pago (Faturamento)" }
  ];

  const courseFields = [
    { id: "course", label: "Curso Matriculado" },
    { id: "courseStatus", label: "Status do Curso" },
    { id: "enrolled_at", label: "Data de Inscrição" },
    { id: "certificate_issued", label: "Certificado Emitido?" }
  ];

  const engagementFields = [
    { id: "tag", label: "Possui Tag" },
    { id: "email_received", label: "Recebeu E-mail" },
    { id: "email_opened", label: "Abriu E-mail" },
    { id: "email_clicked", label: "Clicou em E-mail" },
    { id: "active_in_list", label: "Inscrito na Lista" },
    { id: "active_in_flow", label: "Ativo na Automação" }
  ];

  const allFieldsGrouped = [
    {
      title: "Informações pessoais do lead",
      items: personalFields
    },
    {
      title: "Cursos e Matrículas",
      items: courseFields
    },
    {
      title: "Campanhas e Automação",
      items: engagementFields
    },
    {
      title: "Campos personalizados",
      items: (customFields || []).map((cf) => ({
        id: `cf_${cf.tag}`,
        label: `${cf.name} ({{ ${cf.tag} }})`
      }))
    }
  ];

  const selectedLabel = 
    personalFields.find(f => f.id === value)?.label ||
    courseFields.find(f => f.id === value)?.label ||
    engagementFields.find(f => f.id === value)?.label ||
    (customFields || []).find(cf => `cf_${cf.tag}` === value)?.name ||
    (customFields || []).find(cf => cf.tag === value)?.name ||
    value;

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isGroupExpanded = (title: string) => {
    if (search.trim() !== "") return true;
    return !!expandedGroups[title];
  };

  const filteredGroups = allFieldsGrouped.map(group => {
    return {
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase())
      )
    };
  }).filter(group => group.items.length > 0);

  return (
    <div className="relative flex-1 min-w-[180px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg py-1.5 px-3 text-xs focus:outline-none flex items-center justify-between gap-1.5 cursor-pointer h-[34px] shadow-sm font-medium text-left"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-slate-150 flex items-center gap-1.5 bg-slate-50">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar campo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 focus:outline-none w-full border-none p-0 focus:ring-0"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto py-1 flex-1 max-h-[250px] divide-y divide-slate-100">
            {filteredGroups.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-450 italic">
                Nenhum campo encontrado
              </div>
            ) : (
              filteredGroups.map(group => {
                const expanded = isGroupExpanded(group.title);
                return (
                  <div key={group.title} className="p-1.5">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between text-[9px] font-bold text-slate-400 hover:text-slate-655 uppercase px-2 py-1 select-none tracking-wider text-left cursor-pointer"
                    >
                      <span>{group.title}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    
                    {expanded && (
                      <div className="space-y-0.5 mt-1">
                        {group.items.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onChange(item.id);
                              setIsOpen(false);
                            }}
                            className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                              value === item.id
                                ? "bg-indigo-50 text-indigo-700 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ValueAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  field: string;
  contacts: any[];
  customFields: any[];
}

function EngagementRuleExpanded({
  rule,
  group,
  ruleIdx,
  handleUpdateRuleInGroup,
  customFields
}: {
  rule: any;
  group: any;
  ruleIdx: number;
  handleUpdateRuleInGroup: (groupId: string, ruleIdx: number, updates: Partial<any>) => void;
  customFields: any[];
}) {
  const parsedVal = useMemo(() => {
    try {
      if (rule.value && typeof rule.value === "string" && rule.value.startsWith("{")) {
        return JSON.parse(rule.value);
      }
    } catch (e) {}
    return {
      targetType: "Campanha",
      campaignScope: "Qualquer campanha",
      specificCampaign: "",
      timeframeMode: "last_days",
      daysCount: "30",
      startDate: "",
      endDate: "",
      frequency: "Pelo menos uma vez"
    };
  }, [rule.value]);

  const updateEngagementState = (updates: Record<string, any>) => {
    const newState = { ...parsedVal, ...updates };
    handleUpdateRuleInGroup(group.id, ruleIdx, { value: JSON.stringify(newState) });
  };

  return (
    <div className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 space-y-3 animate-fadeIn">
      {/* Line 1: Action + Entity Type + Campaign Picker */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchableFieldDropdown
          value={rule.field}
          onChange={(val) => handleUpdateRuleInGroup(group.id, ruleIdx, { field: val })}
          customFields={customFields}
        />

        <select
          value={parsedVal.targetType}
          onChange={(e) => updateEngagementState({ targetType: e.target.value })}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
        >
          <option value="Campanha">Campanha</option>
          <option value="Fluxo de automação">Fluxo de automação</option>
          <option value="E-mail específico">E-mail específico</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-700 shadow-2xs">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={parsedVal.campaignScope}
              onChange={(e) => updateEngagementState({ campaignScope: e.target.value })}
              className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none w-full cursor-pointer"
            >
              <option value="Qualquer campanha">Qualquer campanha</option>
              <option value="Campanha específica">Campanha específica...</option>
            </select>
          </div>
          {parsedVal.campaignScope === "Campanha específica" && (
            <input
              type="text"
              value={parsedVal.specificCampaign}
              onChange={(e) => updateEngagementState({ specificCampaign: e.target.value })}
              placeholder="Digite o nome da campanha..."
              className="mt-1.5 w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          )}
        </div>
      </div>

      {/* Line 2: Timeframe selector */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={parsedVal.timeframeMode}
          onChange={(e) => updateEngagementState({ timeframeMode: e.target.value })}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
        >
          <option value="last_days">No(s) último(s)</option>
          <option value="between">Entre datas</option>
          <option value="ever">Alguma vez</option>
        </select>

        {parsedVal.timeframeMode === "last_days" && (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={parsedVal.daysCount}
              onChange={(e) => updateEngagementState({ daysCount: e.target.value })}
              className="w-16 bg-white border border-slate-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-center"
            />
            <span className="text-xs font-semibold text-slate-600">dias</span>
          </div>
        )}

        {parsedVal.timeframeMode === "between" && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={parsedVal.startDate}
              onChange={(e) => updateEngagementState({ startDate: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl py-1.5 px-2 text-xs font-semibold text-slate-800 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase">e</span>
            <input
              type="date"
              value={parsedVal.endDate}
              onChange={(e) => updateEngagementState({ endDate: e.target.value })}
              className="bg-white border border-slate-200 rounded-xl py-1.5 px-2 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Line 3: Frequency selector */}
      <div className="flex items-center gap-2">
        <select
          value={parsedVal.frequency}
          onChange={(e) => updateEngagementState({ frequency: e.target.value })}
          className="bg-white border border-slate-200 text-slate-700 rounded-xl py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
        >
          <option value="Pelo menos uma vez">Pelo menos uma vez</option>
          <option value="Pelo menos 2 vezes">Pelo menos 2 vezes</option>
          <option value="Pelo menos 5 vezes">Pelo menos 5 vezes</option>
          <option value="Exatamente uma vez">Exatamente uma vez</option>
        </select>
      </div>
    </div>
  );
}

function ValueAutocompleteInput({ value, onChange, field, contacts, customFields }: ValueAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!field) {
      setSuggestions([]);
      return;
    }

    const values = new Set<string>();

    const defaultCustomFieldValues: Record<string, string[]> = {
      "area_de_interesse": ["Tecnologia da Informação", "Programação", "Marketing Digital", "Gestão Financeira", "Design Gráfico", "Ciência da Computação"],
      "nivel_academico": ["Ensino Médio Completo", "Ensino Superior Cursando", "Ensino Superior Completo", "Pós-Graduação"],
      "origem_lead": ["Instagram Ads", "Google Search", "Facebook Ads", "Indicação", "Blog Post"],
      "curso_pretendido": ["React Native com Expo", "Introdução à Programação Web", "Marketing Digital de Performance", "Gestão Financeira para Negócios"]
    };

    if (contacts && Array.isArray(contacts)) {
      contacts.forEach((c) => {
        if (field === "name") {
          values.add(`${c.first_name || ""} ${c.last_name || ""}`.trim());
        } else if (field === "first_name") {
          values.add(c.first_name || "");
        } else if (field === "last_name") {
          values.add(c.last_name || "");
        } else if (field === "email") {
          values.add(c.email || "");
        } else if (field === "phone") {
          values.add(c.phone || "");
        } else if (field === "course") {
          values.add(c.course || "");
        } else if (field === "status") {
          values.add(c.status || "");
        } else if (field === "total_spent") {
          values.add(String(c.total_spent || ""));
        } else if (field === "tag" && Array.isArray(c.tags)) {
          c.tags.forEach((t: string) => values.add(t));
        }
      });
    }

    if (field.startsWith("cf_")) {
      const cleanTag = field.substring(3);
      if (defaultCustomFieldValues[cleanTag]) {
        defaultCustomFieldValues[cleanTag].forEach(val => values.add(val));
      }

      const cfObj = (customFields || []).find((cf) => cf.tag === cleanTag);
      if (cfObj && contacts) {
        contacts.forEach((c) => {
          const storedProfile = localStorage.getItem(`realizzare_profile_${c.id}`);
          if (storedProfile) {
            try {
              const parsed = JSON.parse(storedProfile);
              const foundVal = parsed.custom_fields?.find(
                (cf: any) => cf.name.toLowerCase() === cfObj.name.toLowerCase()
              );
              if (foundVal && foundVal.value) {
                values.add(foundVal.value);
              }
            } catch (e) {
              console.error(e);
            }
          }
        });
      }
    }

    setSuggestions(Array.from(values).filter(Boolean).sort());
  }, [field, contacts, customFields]);

  const filteredSuggestions = (value || "").trim().length >= 3
    ? suggestions.filter(s =>
        s.toLowerCase().includes((value || "").toLowerCase())
      )
    : [];

  return (
    <div className="relative flex-1 min-w-[120px]" ref={containerRef}>
      <input
        type="text"
        placeholder="Digite ou selecione..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-indigo-500 w-full h-[34px] shadow-sm"
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[160px] overflow-y-auto divide-y divide-slate-100">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                onChange(suggestion);
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-3 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors truncate font-medium cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getContactSubscriptionStatus(c: any): string {
  if (c.status === "unsubscribed" || c.status === "bounced") {
    return "Inscrição Cancelada";
  }
  
  if (typeof window !== "undefined") {
    const storedProfile = localStorage.getItem(`realizzare_profile_${c.id}`);
    if (storedProfile) {
      try {
        const profileObj = JSON.parse(storedProfile);
        if (Array.isArray(profileObj.lists)) {
          const subbed = profileObj.lists.filter((l: any) => l.status === "subscribed");
          if (subbed.length === 0) {
            return "Não Inscrito";
          }
          return "Inscrito";
        }
      } catch (e) {}
    }
  }
  
  return c.status === "active" ? "Inscrito" : "Não Inscrito";
}

function getContactEnrollmentInfo(c: any): { course: string; status: string; enrolledAt: string } {
  if (typeof window !== "undefined") {
    const storedProfile = localStorage.getItem(`realizzare_profile_${c.id}`);
    if (storedProfile) {
      try {
        const profileObj = JSON.parse(storedProfile);
        if (Array.isArray(profileObj.enrollments) && profileObj.enrollments.length > 0) {
          const sorted = [...profileObj.enrollments].sort((a: any, b: any) => {
            return new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime();
          });
          const latest = sorted[0];
          let statusLabel = "Em Andamento";
          if (latest.status === "active") statusLabel = "Ativo";
          else if (latest.status === "completed") statusLabel = "Finalizado";
          
          return {
            course: latest.course_name,
            status: statusLabel,
            enrolledAt: latest.enrolled_at
          };
        }
      } catch (e) {}
    }
  }

  if (c.course && c.course !== "Nenhum" && c.course !== "Nenhum curso iniciado" && c.course !== "") {
    return {
      course: c.course,
      status: c.courseStatus || "Não informado",
      enrolledAt: c.created_at || ""
    };
  }

  return {
    course: "Nenhum curso iniciado",
    status: "Não informado",
    enrolledAt: ""
  };
}

function evaluateRule(contact: any, rule: { field: string; operator: string; value: string }, customFields: any[]): boolean {
  if (!rule.field) return true;
  
  let contactValue = "";
  
  // Custom checks for comma-separated courses or special engagement fields
  if (rule.field === "course") {
    const contactCourse = getContactEnrollmentInfo(contact).course;
    const selectedList = rule.value ? rule.value.split(",") : [];
    if (selectedList.length === 0) return true;
    const match = selectedList.some(c => {
      if (c === "Nenhum") {
        return contactCourse === "Nenhum curso iniciado" || contactCourse === "";
      }
      return contactCourse.toLowerCase() === c.toLowerCase();
    });
    if (rule.operator === "neq") return !match;
    return match;
  }
  
  if (rule.field === "courseStatus") {
    contactValue = getContactEnrollmentInfo(contact).status || "";
  } else if (rule.field === "enrolled_at") {
    contactValue = getContactEnrollmentInfo(contact).enrolledAt || "";
  } else if (rule.field === "certificate_issued") {
    let issued = false;
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem(`realizzare_profile_${contact.id}`);
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          issued = parsed.enrollments?.some((item: any) => item.certificate_issued) || false;
        } catch (e) {}
      }
    }
    contactValue = issued ? "sim" : "não";
  } else if (rule.field === "email_received") {
    contactValue = (contact.id === "c1" || contact.id === "c2" || contact.id === "c4" || contact.id === "c11") ? "sim" : "não";
  } else if (rule.field === "email_opened") {
    contactValue = (contact.id === "c1" || contact.id === "c4") ? "sim" : "não";
  } else if (rule.field === "email_clicked") {
    contactValue = (contact.id === "c1") ? "sim" : "não";
  } else if (rule.field === "active_in_list") {
    let inList = false;
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem(`realizzare_profile_${contact.id}`);
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          inList = parsed.lists?.some((pl: any) => pl.status === "subscribed" && pl.name.toLowerCase().includes(rule.value.toLowerCase())) || false;
        } catch (e) {}
      }
    }
    if (rule.operator === "neq") return !inList;
    return inList;
  } else if (rule.field === "active_in_flow") {
    let inFlow = false;
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem(`realizzare_profile_${contact.id}`);
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          inFlow = parsed.flows?.some((f: any) => f.status === "active" && f.name.toLowerCase().includes(rule.value.toLowerCase())) || false;
        } catch (e) {}
      }
    }
    if (rule.operator === "neq") return !inFlow;
    return inFlow;
  } else if (rule.field === "name") {
    contactValue = `${contact.first_name || ""} ${contact.last_name || ""}`;
  } else if (rule.field === "first_name") {
    contactValue = contact.first_name || "";
  } else if (rule.field === "last_name") {
    contactValue = contact.last_name || "";
  } else if (rule.field === "email") {
    contactValue = contact.email || "";
  } else if (rule.field === "phone") {
    contactValue = contact.phone || "";
  } else if (rule.field === "status") {
    contactValue = contact.status || "";
  } else if (rule.field === "total_spent") {
    contactValue = String(contact.total_spent || "");
  } else if (rule.field === "tag") {
    const targetTag = (rule.value || "").toLowerCase();
    if (Array.isArray(contact.tags)) {
      const hasTag = contact.tags.some((t: string) => t.toLowerCase().includes(targetTag));
      if (rule.operator === "contains" || rule.operator === "eq") return hasTag;
      if (rule.operator === "neq") return !hasTag;
    }
    return false;
  } else if (rule.field.startsWith("cf_")) {
    const cleanTag = rule.field.substring(3);
    const cfObj = (customFields || []).find(cf => cf.tag === cleanTag);
    if (cfObj) {
      if (typeof window !== "undefined") {
        const storedProfile = localStorage.getItem(`realizzare_profile_${contact.id}`);
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            const foundVal = parsed.custom_fields?.find(
              (cf: any) => cf.name.toLowerCase() === cfObj.name.toLowerCase()
            );
            contactValue = foundVal ? foundVal.value : "";
          } catch (e) {
            console.error(e);
          }
        } else {
          const defaultCustomFieldValuesMock: Record<string, Record<string, string>> = {
            "c1": { "area_de_interesse": "Tecnologia da Informação", "nivel_academico": "Ensino Superior Cursando", "origem_lead": "Instagram Ads", "curso_pretendido": "React Native com Expo" },
            "c2": { "area_de_interesse": "Gestão Financeira", "nivel_academico": "Ensino Superior Completo", "origem_lead": "Google Search", "curso_pretendido": "Gestão Financeira para Negócios" },
            "c3": { "area_de_interesse": "Programação", "nivel_academico": "Ensino Médio Completo", "origem_lead": "Indicação", "curso_pretendido": "Introdução à Programação Web" },
            "c4": { "area_de_interesse": "Liderança", "nivel_academico": "Pós-Graduação", "origem_lead": "Blog Post", "curso_pretendido": "Desenvolvimento de Carreira e Liderança" }
          };
          const mockProfile = defaultCustomFieldValuesMock[contact.id];
          if (mockProfile && mockProfile[cleanTag]) {
            contactValue = mockProfile[cleanTag];
          }
        }
      }
    }
  }
  
  // Date-based checks
  if (rule.field === "created_at" || rule.field === "enrolled_at") {
    if (!contactValue) return false;
    const contactTime = new Date(contactValue).getTime();
    
    if (rule.operator === "between") {
      const parts = rule.value.split("_");
      const startTime = parts[0] ? new Date(parts[0]).getTime() : null;
      const endTime = parts[1] ? new Date(parts[1]).getTime() : null;
      if (startTime && endTime) {
        return contactTime >= startTime && contactTime <= endTime;
      }
      return false;
    }
    
    const targetTime = rule.value ? new Date(rule.value).getTime() : null;
    if (!targetTime) return false;
    
    switch (rule.operator) {
      case "eq":
        return contactTime === targetTime;
      case "neq":
        return contactTime !== targetTime;
      case "gte":
        return contactTime >= targetTime;
      case "lte":
        return contactTime <= targetTime;
      default:
        return false;
    }
  }
  
  const ruleVal = (rule.value || "").toLowerCase();
  const valLower = contactValue.toLowerCase();
  
  switch (rule.operator) {
    case "eq":
      return valLower === ruleVal;
    case "neq":
      return valLower !== ruleVal;
    case "contains":
      return valLower.includes(ruleVal);
    case "gt":
      return parseFloat(contactValue) > parseFloat(rule.value);
    case "gte":
      return parseFloat(contactValue) >= parseFloat(rule.value);
    case "lte":
      return parseFloat(contactValue) <= parseFloat(rule.value);
    default:
      return false;
  }
}

function countMatchingContacts(contacts: any[], groups: any[], globalOp: "and" | "or", customFields: any[]): number {
  if (!groups || groups.length === 0) return contacts.length;
  
  const matchedContacts = contacts.filter((contact) => {
    const groupResults: boolean[] = groups.map((group) => {
      if (!group.rules || group.rules.length === 0) return true;
      
      const ruleResults: boolean[] = group.rules.map((rule: any) => evaluateRule(contact, rule, customFields));
      
      if (group.logicalOperator === "or") {
        return ruleResults.some((r: boolean) => r === true);
      } else {
        return ruleResults.every((r: boolean) => r === true);
      }
    });
    
    if (globalOp === "or") {
      return groupResults.some((r: boolean) => r === true);
    } else {
      return groupResults.every((r: boolean) => r === true);
    }
  });
  
  return matchedContacts.length;
}



interface SearchableCourseDropdownProps {
  value: string;
  onChange: (value: string) => void;
}
function SearchableCourseDropdown({ value, onChange }: SearchableCourseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const options = [
    { value: "all", label: "Todos os Cursos" },
    { value: "Introdução à Programação Web", label: "Introdução à Programação Web" },
    { value: "Gestão Financeira para Negócios", label: "Gestão Financeira para Negócios" },
    { value: "Desenvolvimento de Carreira e Liderança", label: "Desenvolvimento de Carreira e Liderança" },
    { value: "Marketing Digital de Performance", label: "Marketing Digital de Performance" },
    { value: "Nenhum", label: "Sem Matrícula" }
  ];
  
  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  
  const selectedLabel = options.find(o => o.value === value)?.label || "Todos os Cursos";
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 flex justify-between items-center cursor-pointer shadow-sm min-h-[38px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[260px]">
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar curso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-705 outline-none border-none p-0 focus:ring-0"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-slate-400 hover:text-slate-650"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto divide-y divide-slate-105 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left py-2 px-3 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-705 transition-colors truncate font-medium flex items-center justify-between cursor-pointer ${
                    value === o.value ? "bg-indigo-50/50 text-indigo-700 font-bold" : ""
                  }`}
                >
                  <span>{o.label}</span>
                  {value === o.value && <span className="text-indigo-650 font-bold">✓</span>}
                </button>
              ))
            ) : (
              <div className="py-3 px-3 text-xs text-slate-400 text-center">Nenhum curso encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface MultiSelectCourseStatusDropdownProps {
  selectedValues: string[];
  onChange: (values: string[]) => void;
}
function MultiSelectCourseStatusDropdown({ selectedValues, onChange }: MultiSelectCourseStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = ["Ativo", "Em Andamento", "Finalizado", "Não informado"];
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter(v => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };
  
  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 flex justify-between items-center cursor-pointer shadow-sm min-h-[38px]"
      >
        <span className="truncate">
          {selectedValues.length === 0 
            ? "Todos os Status de Curso" 
            : selectedValues.join(", ")}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden p-2 space-y-1.5 flex flex-col">
          {options.map((opt) => {
            const isChecked = selectedValues.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs text-slate-650 select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(opt)}
                  className="rounded border-slate-300 text-indigo-650 h-3.5 w-3.5 focus:ring-0 cursor-pointer"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tag: string) => void;
  existingTags: string[];
}
function AddTagModal({ isOpen, onClose, onConfirm, existingTags }: AddTagModalProps) {
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTagInput("");
      setShowSuggestions(false);
    }
  }, [isOpen]);

  const filteredSuggestions = useMemo(() => {
    const query = tagInput.trim().toLowerCase();
    if (!query) return [];
    return existingTags.filter(t => 
      t.toLowerCase().includes(query) && 
      t.toLowerCase() !== query
    );
  }, [tagInput, existingTags]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-visible flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Adicionar Tag em Massa</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 relative" ref={containerRef}>
          <p className="text-xs text-slate-500">
            Digite o nome da tag para adicionar aos contatos selecionados. Você pode criar uma nova tag ou escolher uma existente.
          </p>

          <div className="relative">
            <input
              type="text"
              placeholder="Digite o nome da tag..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-850 focus:outline-none focus:border-indigo-500"
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[140px] overflow-y-auto divide-y divide-slate-100">
                {filteredSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setTagInput(tag);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left py-2 px-3 text-xs text-slate-600 hover:bg-indigo-55/60 hover:text-indigo-705 transition-colors truncate cursor-pointer font-medium"
                  >
                    {tag} (Existente)
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (tagInput.trim()) {
                onConfirm(tagInput.trim());
              }
            }}
            disabled={!tagInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-250 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            Adicionar Tag
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actionType: "subscribe" | "unsubscribe" | "deactivate", listIds: string[]) => void;
  lists: Array<{ id: string; name: string; subscriberCount: number }>;
  onOpenCreateListModal: () => void;
}
function AddToListModal({ isOpen, onClose, onConfirm, lists, onOpenCreateListModal }: AddToListModalProps) {
  const [actionType, setActionType] = useState<"subscribe" | "unsubscribe" | "deactivate">("subscribe");
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setActionType("subscribe");
      setSelectedListIds([]);
    }
  }, [isOpen]);

  const toggleList = (id: string) => {
    if (selectedListIds.includes(id)) {
      setSelectedListIds(selectedListIds.filter(lid => lid !== id));
    } else {
      setSelectedListIds([...selectedListIds, id]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Gerenciar Inscrições em Listas</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Action Type Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Ação a Realizar</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType("subscribe")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  actionType === "subscribe"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-350"
                }`}
              >
                <span className="text-xs">Inscrever</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType("unsubscribe")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  actionType === "unsubscribe"
                    ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-350"
                }`}
              >
                <span className="text-xs">Desinscrever</span>
              </button>
              <button
                type="button"
                onClick={() => setActionType("deactivate")}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  actionType === "deactivate"
                    ? "border-red-500 bg-red-50/50 text-red-700 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-350"
                }`}
              >
                <span className="text-xs">Desativar</span>
              </button>
            </div>
          </div>

          {actionType === "deactivate" ? (
            <div className="bg-red-55/40 border border-red-200/80 rounded-xl p-4 flex gap-2 text-red-800 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Atenção: Desativação Completa</span>
                <p className="text-[11px] leading-relaxed text-red-700">
                  Esta ação desinscreverá os contatos selecionados de todas as listas atuais e marcará seus status de e-mail como <strong>Inscrição Cancelada</strong>. Eles não receberão nenhuma campanha ou automação.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {actionType === "subscribe" ? "Selecionar Listas para Adicionar" : "Selecionar Listas para Remover"}
                </span>
                {actionType === "subscribe" && (
                  <button
                    type="button"
                    onClick={onOpenCreateListModal}
                    className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 cursor-pointer"
                  >
                    + Criar Nova Lista
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {lists.map((list) => {
                  const isChecked = selectedListIds.includes(list.id);
                  return (
                    <label
                      key={list.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "border-indigo-200 bg-indigo-50/50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleList(list.id)}
                        className="rounded border-slate-350 text-indigo-650 h-4 w-4 mt-0.5 cursor-pointer focus:ring-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-850">{list.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {list.subscriberCount} contatos inscritos
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(actionType, selectedListIds)}
            disabled={actionType !== "deactivate" && selectedListIds.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              actionType === "deactivate"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/10"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
            }`}
          >
            {actionType === "deactivate"
              ? "Desativar Selecionados"
              : actionType === "subscribe"
              ? "Inscrever Selecionados"
              : "Desinscrever Selecionados"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateStaticSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  count: number;
}
function CreateStaticSegmentModal({ isOpen, onClose, onConfirm, count }: CreateStaticSegmentModalProps) {
  const [segmentName, setSegmentName] = useState("");

  useEffect(() => {
    if (isOpen) {
      const dateStr = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      setSegmentName(`Segmento Fixo (${dateStr})`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Criar Segmentação Fixa</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
            <span className="text-xs text-indigo-700 font-medium">Contatos selecionados:</span>
            <span className="text-sm font-bold text-indigo-800">{count} contatos</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Esta será uma segmentação fixa (estática). Os contatos marcados serão vinculados diretamente a esta segmentação e a lista não mudará dinamicamente.
          </p>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nome do Segmento</label>
            <input
              type="text"
              placeholder="Digite o nome do segmento..."
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (segmentName.trim()) {
                onConfirm(segmentName.trim());
              }
            }}
            disabled={!segmentName.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-250 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            Criar Segmento
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [courseStatusFilter, setCourseStatusFilter] = useState<string[]>([]);
  const [certFilter, setCertFilter] = useState("all");
  const [creditsFilter, setCreditsFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [showMassAddTagModal, setShowMassAddTagModal] = useState(false);
  const [showMassAddToListModal, setShowMassAddToListModal] = useState(false);
  const [showCreateStaticSegmentModal, setShowCreateStaticSegmentModal] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Dynamic states with localStorage persistence
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);

  // Consent page options
  const [activeConsentPageType, setActiveConsentPageType] = useState<"preferencias" | "inscricao" | "confirmacao" | "cancelamento">("confirmacao");
  const [consentColor, setConsentColor] = useState("#4f46e5");

  // Preferencias
  const [consentTitlePreferencias, setConsentTitlePreferencias] = useState("Preferências de E-mail");
  const [consentTextPreferencias, setConsentTextPreferencias] = useState("Gerencie sua inscrição e escolha quais categorias de conteúdo você deseja continuar recebendo.");
  const [consentBtnTextPreferencias, setConsentBtnTextPreferencias] = useState("Salvar Preferências");

  // Inscricao
  const [consentTitleInscricao, setConsentTitleInscricao] = useState("Página de Inscrição");
  const [consentTextInscricao, setConsentTextInscricao] = useState("Inscreva-se informando seu e-mail para receber nossos informativos e atualizações.");
  const [consentBtnTextInscricao, setConsentBtnTextInscricao] = useState("Cadastrar-se");

  // Confirmacao (Double Opt-in Confirmation Email Page)
  const [consentTitleConfirmacao, setConsentTitleConfirmacao] = useState("Confirmação de Inscrição");
  const [consentTextConfirmacao, setConsentTextConfirmacao] = useState("Por favor, clique no botão abaixo para confirmar seu cadastro e começar a receber nossas comunicações.");
  const [consentBtnTextConfirmacao, setConsentBtnTextConfirmacao] = useState("Confirmar minha Inscrição");

  // Cancelamento
  const [consentTitleCancelamento, setConsentTitleCancelamento] = useState("Cancelamento de Inscrição");
  const [consentTextCancelamento, setConsentTextCancelamento] = useState("Lamentamos ver você partir. Clique no botão abaixo para confirmar o cancelamento da sua assinatura de e-mails.");
  const [consentBtnTextCancelamento, setConsentBtnTextCancelamento] = useState("Cancelar Inscrição");

  // Settings Gear panel
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"listas" | "campos">("listas");

  // Add Contact Modal states
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [addContactName, setAddContactName] = useState("");
  const [addContactEmail, setAddContactEmail] = useState("");
  const [addContactPhone, setAddContactPhone] = useState("");
  const [addContactError, setAddContactError] = useState("");
  const [addContactExistsId, setAddContactExistsId] = useState<string | null>(null);

  // Double Opt-in state
  const [doubleOptInEnabled, setDoubleOptInEnabled] = useState(true);

  // New list creation/edition inside settings
  const [showAddListModal, setShowAddListModal] = useState(false);
  const [listModalMode, setListModalMode] = useState<"create" | "edit">("create");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [listModalName, setListModalName] = useState("");
  const [listModalUrl, setListModalUrl] = useState("");
  const [listModalDescription, setListModalDescription] = useState("");

  // New custom field creation inside settings
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldTag, setNewFieldTag] = useState("");
  const [newFieldObjective, setNewFieldObjective] = useState("");

  // Edit custom field states
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState("");
  const [editingFieldTag, setEditingFieldTag] = useState("");
  const [editingFieldObjective, setEditingFieldObjective] = useState("");

  // CSV import modal states
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [csvPreviewList, setCsvPreviewList] = useState<any[]>([]);

  // Default values
  const defaultCustomFields = [
    { id: "cf-1", name: "Área de Interesse", type: "text", tag: "area_de_interesse", objective: "Estudo ou segmento de interesse do aluno." },
    { id: "cf-2", name: "Nível Acadêmico", type: "text", tag: "nivel_academico", objective: "Escolaridade ou nível de formação atual do contato." },
    { id: "cf-3", name: "Origem Lead", type: "text", tag: "origem_lead", objective: "Canal ou link de entrada do lead na base." },
    { id: "cf-4", name: "Curso Pretendido", type: "text", tag: "curso_pretendido", objective: "Curso que o aluno pretende matricular-se." }
  ];

  const defaultLists = [
    { id: "l-1", name: "Lista Geral de Alunos", subscriberCount: 1240, url: "https://realizzarecursos.com.br", description: "Todos os contatos cadastrados que se matricularam ou demonstraram interesse em cursos." },
    { id: "l-2", name: "Carrinho Abandonado - 24h", subscriberCount: 85, url: "https://realizzarecursos.com.br/checkout", description: "Leads que iniciaram compra mas não finalizaram o pagamento nas últimas 24 horas." },
    { id: "l-3", name: "Interessados em Programação", subscriberCount: 420, url: "https://realizzarecursos.com.br/cursos/programacao", description: "Contatos com interesse específico na área de desenvolvimento de software." }
  ];

  // Load from Supabase
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      try {
        const supabase = createClient();

        // 1. Fetch Custom Fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from("custom_fields")
          .select("*");
        if (fieldsError) throw fieldsError;
        
        const mappedFields = fieldsData.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          tag: f.tag,
          objective: f.objective || ""
        }));
        setCustomFields(mappedFields);

        // 2. Fetch Lists
        const { data: listsData, error: listsError } = await supabase
          .from("lists")
          .select("*");
        if (listsError) throw listsError;
        
        const mappedLists = listsData.map((l: any) => ({
          id: l.id,
          name: l.name,
          subscriberCount: l.subscriber_count || 0,
          url: l.url || "",
          description: l.description || ""
        }));
        setLists(mappedLists);

        // 3. Fetch Contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from("contacts")
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone,
            status,
            created_at,
            total_spent,
            contact_tags (
              tags (
                name,
                color
              )
            ),
            enrollments (
              status,
              progress,
              courses (
                name
              )
            )
          `)
          .order("created_at", { ascending: false });
        if (contactsError) throw contactsError;

        const mappedContacts = contactsData.map((c: any) => {
          const tags = c.contact_tags?.map((ct: any) => ct.tags?.name).filter(Boolean) || [];
          const primaryEnrollment = c.enrollments?.[0];
          const course = primaryEnrollment?.courses?.name || "Nenhum";
          let courseStatus = "";
          if (primaryEnrollment) {
            if (primaryEnrollment.status === "active") {
              courseStatus = primaryEnrollment.progress < 100 ? "Em Andamento" : "Ativo";
            } else if (primaryEnrollment.status === "completed") {
              courseStatus = "Finalizado";
            } else if (primaryEnrollment.status === "dropped") {
              courseStatus = "Cancelado";
            }
          }

          return {
            id: c.id,
            first_name: c.first_name || "",
            last_name: c.last_name || "",
            email: c.email,
            phone: c.phone || "",
            status: c.status,
            created_at: new Date(c.created_at).toISOString().split("T")[0],
            tags,
            course,
            courseStatus,
            total_spent: parseFloat(c.total_spent || 0)
          };
        });

        // Check if there are local stored/imported contacts
        const storedContacts = localStorage.getItem("realizzare_contacts");
        if (storedContacts) {
          try {
            const parsed = JSON.parse(storedContacts);
            if (Array.isArray(parsed) && parsed.length > 50) {
              const cleaned = parsed
                .filter((item: any) => !item.id.match(/^c\d+$/)) // Filter out mock demo leads (c1..c12)
                .map((item: any) => ({
                  ...item,
                  last_name: (item.last_name || "").replace(/#\d+/g, "").trim(),
                  status: "unsubscribed",
                  course: "Nenhum curso iniciado",
                  courseStatus: "Não informado"
                }));
              
              // Also merge Pagar.me transactions as contacts
              const storedSims = localStorage.getItem("realizzare_simulated_events");
              if (storedSims) {
                try {
                  const simEvents = JSON.parse(storedSims);
                  simEvents.forEach((evt: any) => {
                    const cEmail = (evt.email || "").toLowerCase().trim();
                    if (!cEmail) return;
                    const exists = cleaned.some((c: any) => c.email.toLowerCase().trim() === cEmail);
                    if (!exists) {
                      const nameParts = (evt.name || "Aluno Realizzare").split(" ");
                      const fName = nameParts[0] || "Aluno";
                      const lName = nameParts.slice(1).join(" ") || "Realizzare";
                      const newC = {
                        id: `c_pagarme_${cEmail.replace(/[^a-z0-9]/gi, "")}`,
                        first_name: fName,
                        last_name: lName,
                        email: cEmail,
                        phone: evt.phone || "(11) 98765-4321",
                        status: "unsubscribed", // Not subscribed to marketing lists
                        created_at: evt.date || "01/08/2026",
                        tags: ["Pagar.me", "Cliente Realizzare"],
                        course: evt.itemTitle || evt.eventLabel || "Certificado / Curso Realizzare",
                        courseStatus: "Ativo",
                        total_spent: evt.amount || 49.90
                      };
                      cleaned.unshift(newC);

                      // Create rich profile for contact
                      const profileKey = `realizzare_profile_${newC.id}`;
                      if (!localStorage.getItem(profileKey)) {
                        localStorage.setItem(profileKey, JSON.stringify({
                          first_name: fName,
                          last_name: lName,
                          email: cEmail,
                          phone: evt.phone || "(11) 98765-4321",
                          birth_date: "1995-01-01",
                          gender: "Não informado",
                          status: "unsubscribed",
                          created_at: evt.date || "2026-08-01",
                          location: { country: "Brasil", state: "SP", city: "São Paulo" },
                          tags: ["Pagar.me", "Cliente Realizzare"],
                          custom_fields: [{ name: "Origem Lead", type: "text", value: "Pagar.me V5 Checkout" }],
                          lists: [],
                          enrollments: [{ course_name: evt.itemTitle || "Certificado / Curso Realizzare", price: `R$ ${evt.amount ? evt.amount.toFixed(2) : "49.90"}`, status: "active", progress: 100, enrolled_at: evt.date || "2026-08-01", certificate_issued: true, completed_at: evt.date || "2026-08-01" }],
                          purchases: [{ product_type: "certificado", product_name: evt.itemTitle || "Certificado / Curso Realizzare", amount: evt.amount || 49.90, paid_at: evt.date || "2026-08-01", status: "paid", sku: "PAGARME-V5" }],
                          flows: [],
                          timeline: [{ id: `evt-${Math.random()}`, type: "purchase", label: "Compra Aprovada via Pagar.me", details: `${evt.itemTitle || "Certificado / Curso Realizzare"} - R$ ${evt.amount ? evt.amount.toFixed(2) : "49.90"}`, timestamp: evt.date || "2026-08-01" }]
                        }));
                      }
                    }
                  });
                } catch (e) { console.error(e); }
              }

              setContacts(cleaned);
              localStorage.setItem("realizzare_contacts", JSON.stringify(cleaned));
            } else {
              const fullList = generateImportedMockContacts();
              setContacts(fullList);
              localStorage.setItem("realizzare_contacts", JSON.stringify(fullList));
            }
          } catch (e) {
            const fullList = generateImportedMockContacts();
            setContacts(fullList);
            localStorage.setItem("realizzare_contacts", JSON.stringify(fullList));
          }
        } else {
          const initialSet = generateImportedMockContacts();
          setContacts(initialSet);
          localStorage.setItem("realizzare_contacts", JSON.stringify(initialSet));
        }

        // 4. Consent Pages (Keep in localStorage for now as UI settings)
        const storedConsentPages = localStorage.getItem("realizzare_consent_pages_config");
        if (storedConsentPages) {
          try {
            const parsed = JSON.parse(storedConsentPages);
            if (parsed.preferencias) {
              setConsentTitlePreferencias(parsed.preferencias.title || "Preferências de E-mail");
              setConsentTextPreferencias(parsed.preferencias.text || "Gerencie sua inscrição...");
              setConsentBtnTextPreferencias(parsed.preferencias.btnText || "Salvar Preferências");
            }
            if (parsed.inscricao) {
              setConsentTitleInscricao(parsed.inscricao.title || "Página de Inscrição");
              setConsentTextInscricao(parsed.inscricao.text || "Inscreva-se...");
              setConsentBtnTextInscricao(parsed.inscricao.btnText || "Cadastrar-se");
            }
            if (parsed.confirmacao) {
              setConsentTitleConfirmacao(parsed.confirmacao.title || "Confirmação de Inscrição");
              setConsentTextConfirmacao(parsed.confirmacao.text || "Por favor, clique no botão abaixo...");
              setConsentBtnTextConfirmacao(parsed.confirmacao.btnText || "Confirmar minha Inscrição");
            }
            if (parsed.cancelamento) {
              setConsentTitleCancelamento(parsed.cancelamento.title || "Cancelamento de Inscrição");
              setConsentTextCancelamento(parsed.cancelamento.text || "Lamentamos ver você partir...");
              setConsentBtnTextCancelamento(parsed.cancelamento.btnText || "Cancelar Inscrição");
            }
            if (parsed.color) setConsentColor(parsed.color);
          } catch (e) { console.error(e); }
        }

        // 5. Double Opt-in status (Keep in localStorage for now as UI settings)
        const storedOptIn = localStorage.getItem("realizzare_double_opt_in");
        if (storedOptIn !== null) {
          setDoubleOptInEnabled(storedOptIn === "true");
        } else {
          localStorage.setItem("realizzare_double_opt_in", "true");
        }

      } catch (err) {
        console.error("Erro ao carregar dados do Supabase:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadDataFromSupabase();
  }, []);

  const saveContacts = (updated: any[]) => {
    setContacts(updated);
    localStorage.setItem("realizzare_mock_contacts", JSON.stringify(updated));
  };

  const saveCustomFields = (updated: any[]) => {
    setCustomFields(updated);
    localStorage.setItem("realizzare_custom_fields", JSON.stringify(updated));
  };

  const saveLists = (updated: any[]) => {
    setLists(updated);
    localStorage.setItem("realizzare_mock_lists", JSON.stringify(updated));
  };

  const handleMassAddTagConfirm = (tagToAdd: string) => {
    const updated = contacts.map(c => {
      if (selectedContacts.includes(c.id)) {
        const currentTags = c.tags || [];
        if (!currentTags.includes(tagToAdd)) {
          return { ...c, tags: [...currentTags, tagToAdd] };
        }
      }
      return c;
    });
    setContacts(updated);
    localStorage.setItem("realizzare_mock_contacts", JSON.stringify(updated));
    
    setShowMassAddTagModal(false);
    setSelectedContacts([]);
    alert(`Tag "${tagToAdd}" adicionada aos contatos selecionados com sucesso!`);
  };

  const handleMassListActionConfirm = (actionType: "subscribe" | "unsubscribe" | "deactivate", listIds: string[]) => {
    let contactsUpdated = false;
    
    const updatedContacts = contacts.map(c => {
      if (selectedContacts.includes(c.id)) {
        contactsUpdated = true;
        const storedProfile = localStorage.getItem(`realizzare_profile_${c.id}`);
        let profileObj: any = null;
        if (storedProfile) {
          try {
            profileObj = JSON.parse(storedProfile);
          } catch (e) {
            console.error(e);
          }
        }
        if (!profileObj) {
          profileObj = {
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            phone: c.phone,
            birth_date: "",
            gender: "",
            status: c.status,
            created_at: c.created_at,
            location: { country: "Brasil", state: "", city: "" },
            tags: c.tags || [],
            custom_fields: [],
            lists: [],
            enrollments: [],
            purchases: [],
            flows: [],
            timeline: []
          };
        }

        profileObj.lists = profileObj.lists || [];

        if (actionType === "deactivate") {
          profileObj.lists = profileObj.lists.map((pl: any) => ({
            ...pl,
            status: "unsubscribed",
            updated_at: new Date().toISOString()
          }));
          c.status = "unsubscribed";
          profileObj.status = "unsubscribed";
        } else if (actionType === "subscribe") {
          listIds.forEach(lid => {
            const listObj = lists.find(l => l.id === lid);
            if (listObj) {
              const listName = listObj.name;
              const subIndex = profileObj.lists.findIndex((pl: any) => pl.name === listName);
              if (subIndex > -1) {
                profileObj.lists[subIndex].status = "subscribed";
                profileObj.lists[subIndex].updated_at = new Date().toISOString();
              } else {
                profileObj.lists.push({
                  name: listName,
                  status: "subscribed",
                  updated_at: new Date().toISOString()
                });
              }
            }
          });
          if (c.status === "unsubscribed") {
            c.status = "active";
            profileObj.status = "active";
          }
        } else if (actionType === "unsubscribe") {
          listIds.forEach(lid => {
            const listObj = lists.find(l => l.id === lid);
            if (listObj) {
              const listName = listObj.name;
              const subIndex = profileObj.lists.findIndex((pl: any) => pl.name === listName);
              if (subIndex > -1) {
                profileObj.lists[subIndex].status = "unsubscribed";
                profileObj.lists[subIndex].updated_at = new Date().toISOString();
              }
            }
          });
        }

        localStorage.setItem(`realizzare_profile_${c.id}`, JSON.stringify(profileObj));
      }
      return c;
    });

    const updatedLists = lists.map(list => {
      let netChange = 0;
      selectedContacts.forEach(cid => {
        const storedProfile = localStorage.getItem(`realizzare_profile_${cid}`);
        let profileObj: any = null;
        if (storedProfile) {
          try { profileObj = JSON.parse(storedProfile); } catch (e) {}
        }
        const wasSubscribed = profileObj?.lists?.some((pl: any) => pl.name === list.name && pl.status === "subscribed");
        
        if (actionType === "deactivate" && wasSubscribed) {
          netChange--;
        } else if (actionType === "subscribe" && listIds.includes(list.id)) {
          if (!wasSubscribed) netChange++;
        } else if (actionType === "unsubscribe" && listIds.includes(list.id)) {
          if (wasSubscribed) netChange--;
        }
      });
      return {
        ...list,
        subscriberCount: Math.max(0, list.subscriberCount + netChange)
      };
    });

    saveLists(updatedLists);
    if (contactsUpdated) {
      setContacts(updatedContacts);
      localStorage.setItem("realizzare_mock_contacts", JSON.stringify(updatedContacts));
    }

    setShowMassAddToListModal(false);
    setSelectedContacts([]);
    alert("Inscrições e status em listas atualizados com sucesso!");
  };

  const handleCreateSegmentFromSelection = () => {
    if (selectedContacts.length === 0) return;
    setShowCreateStaticSegmentModal(true);
  };

  const handleCreateStaticSegmentConfirm = (name: string) => {
    const newId = `seg-static-${Date.now()}`;
    const newSegment = {
      id: newId,
      name: name,
      subscriberCount: selectedContacts.length,
      url: "",
      description: "Segmento fixo criado na tela de contatos",
      isStatic: true,
      contactIds: [...selectedContacts]
    };
    
    const updatedLists = [...lists, newSegment];
    saveLists(updatedLists);
    
    selectedContacts.forEach(cid => {
      const storedProfile = localStorage.getItem(`realizzare_profile_${cid}`);
      let profileObj: any = null;
      if (storedProfile) {
        try { profileObj = JSON.parse(storedProfile); } catch (e) {}
      }
      if (!profileObj) {
        const c = contacts.find(item => item.id === cid);
        profileObj = {
          first_name: c?.first_name || "",
          last_name: c?.last_name || "",
          email: c?.email || "",
          phone: c?.phone || "",
          birth_date: "",
          gender: "",
          status: c?.status || "active",
          created_at: c?.created_at || new Date().toISOString(),
          location: { country: "Brasil", state: "", city: "" },
          tags: c?.tags || [],
          custom_fields: [],
          lists: [],
          enrollments: [],
          purchases: [],
          flows: [],
          timeline: []
        };
      }
      
      profileObj.lists = profileObj.lists || [];
      const alreadySubbed = profileObj.lists.some((pl: any) => pl.name === name);
      if (!alreadySubbed) {
        profileObj.lists.push({
          name: name,
          status: "subscribed",
          updated_at: new Date().toISOString()
        });
      }
      localStorage.setItem(`realizzare_profile_${cid}`, JSON.stringify(profileObj));
    });

    setShowCreateStaticSegmentModal(false);
    setSelectedContacts([]);
    alert(`Segmento estático "${name}" criado com sucesso contendo ${newSegment.subscriberCount} contatos!`);
  };

  const allExistingTags = useMemo(() => {
    const tagsSet = new Set<string>();
    contacts.forEach(c => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t: string) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet).sort();
  }, [contacts]);

  const saveConsentPageConfig = (type: string, field: string, value: string) => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("realizzare_consent_pages_config");
    let current: any = {};
    if (raw) {
      try { current = JSON.parse(raw); } catch (e) { }
    }
    if (!current[type]) current[type] = {};
    current[type][field] = value;
    localStorage.setItem("realizzare_consent_pages_config", JSON.stringify(current));
  };

  const saveConsentColorConfig = (colorVal: string) => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("realizzare_consent_pages_config");
    let current: any = {};
    if (raw) {
      try { current = JSON.parse(raw); } catch (e) { }
    }
    current.color = colorVal;
    localStorage.setItem("realizzare_consent_pages_config", JSON.stringify(current));
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(25);
  
  // Full Import Page States
  const [showImportPage, setShowImportPage] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importRowCount, setImportRowCount] = useState<number | null>(null);
  const [importCsvRows, setImportCsvRows] = useState<any[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importMappings, setImportMappings] = useState<Record<string, string>>({});
  const [selectedEmailLists, setSelectedEmailLists] = useState<string[]>(["Alunos"]);
  const [selectedSmsLists, setSelectedSmsLists] = useState<string[]>([]);
  const [importTagsText, setImportTagsText] = useState("");
  const [importStatusMode, setImportStatusMode] = useState("Importar como Contato Ativo");
  
  // ALL OPTIONAL IMPORT CHECKBOXES UNCHECKED BY DEFAULT!
  const [updateExistingContacts, setUpdateExistingContacts] = useState(false);
  const [triggerWebhooks, setTriggerWebhooks] = useState(false);
  const [webhookScope, setWebhookScope] = useState<"added_updated" | "all">("added_updated");
  const [triggerAutomations, setTriggerAutomations] = useState(false);
  const [createCustomFieldOptions, setCreateCustomFieldOptions] = useState(false);

  // Import processing state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleDownloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "id,nome,telefone,email,datacad,data_nasc,sexo,cpf,endereco,num,complemento,cep,bairro\n" +
      "18633,Laura Beatriz,(65) 996430061,laurabeatriz5584@gmail.com,01/07/2026 00:44:41,15/04/1995,Feminino,123.456.789-00,Rua das Flores,100,Apto 201,30100-000,Centro\n" +
      "18634,Carlos Eduardo,(11) 988776655,carlos.eduardo@gmail.com,02/07/2026 14:20:10,20/08/1990,Masculino,987.654.321-11,Av. Paulista,1000,,01310-100,Bela Vista";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_activecampaign_realizzare.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      
      const lines = text.split("\n").filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert("O arquivo CSV precisa ter pelo menos o cabeçalho e uma linha de contatos.");
        return;
      }

      const delimiter = text.includes(";") ? ";" : ",";
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      setImportHeaders(headers);

      // Extract sample data rows
      const parsedRows = lines.slice(1).map(line => {
        return line.split(delimiter).map(col => col.trim().replace(/^["']|["']$/g, ''));
      });

      setImportCsvRows(parsedRows);
      setImportRowCount(parsedRows.length);

      // Auto-detect default field mappings
      const initialMappings: Record<string, string> = {};
      headers.forEach(h => {
        const hLower = h.toLowerCase();
        if (hLower.includes("email")) {
          initialMappings[h] = "endereço de email *";
        } else if (hLower.includes("nome") || hLower.includes("name")) {
          initialMappings[h] = "Nome";
        } else if (hLower.includes("telefone") || hLower.includes("phone")) {
          initialMappings[h] = "Telefone";
        } else {
          initialMappings[h] = "Não importar este campo";
        }
      });
      setImportMappings(initialMappings);
    };
    reader.readAsText(file);
  };

  const handleConfirmImportExecution = () => {
    setIsImporting(true);
    setImportProgress(10);

    const newImportedContacts: any[] = [];
    const firstNames = ["Lucas", "Mariana", "Gabriel", "Beatriz", "Rodrigo", "Camila", "Fernando", "Patricia", "Gustavo", "Vanessa", "Diego", "Aline", "Marcelo", "Renata", "Thiago", "Amanda", "Rafael", "Juliana", "Bruno", "Fernanda"];
    const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Alves", "Lopes", "Araújo", "Barbosa", "Rocha", "Dias"];
    const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br", "uol.com.br", "live.com"];

    const isUnsubscribedMode = importStatusMode.includes("Desinscrito");

    if (importCsvRows && importCsvRows.length > 0) {
      const emailHeader = Object.keys(importMappings).find(k => importMappings[k] === "endereço de email *");
      const nameHeader = Object.keys(importMappings).find(k => importMappings[k] === "Nome");
      const phoneHeader = Object.keys(importMappings).find(k => importMappings[k] === "Telefone");
      const dateHeader = Object.keys(importMappings).find(k => importMappings[k] === "Data de Cadastro");

      const emailIdx = emailHeader ? importHeaders.indexOf(emailHeader) : -1;
      const nameIdx = nameHeader ? importHeaders.indexOf(nameHeader) : -1;
      const phoneIdx = phoneHeader ? importHeaders.indexOf(phoneHeader) : -1;
      const dateIdx = dateHeader ? importHeaders.indexOf(dateHeader) : -1;

      importCsvRows.forEach((row, idx) => {
        const rawEmail = emailIdx !== -1 ? row[emailIdx] : `contato${idx + 1}@activecampaign.com`;
        if (!rawEmail || rawEmail === "NULL") return;

        const rawName = nameIdx !== -1 ? row[nameIdx] : `Contato AC ${idx + 1}`;
        const nameParts = rawName.split(" ");
        const first_name = nameParts[0] || `Contato`;
        const last_name = nameParts.slice(1).join(" ") || `Importado`;
        const phone = phoneIdx !== -1 ? row[phoneIdx] : `(11) 98${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const dateVal = dateIdx !== -1 && row[dateIdx] ? row[dateIdx].split(" ")[0] : "01/07/2026";

        newImportedContacts.push({
          id: `c_imp_${Date.now()}_${idx}`,
          first_name,
          last_name: last_name.replace(/#\d+/, "").trim(), // REMOVE any # numbers
          email: rawEmail.toLowerCase(),
          phone: phone !== "NULL" ? phone : "(11) 99887-1122",
          status: isUnsubscribedMode ? "unsubscribed" : "active",
          created_at: dateVal,
          tags: ["Importado ActiveCampaign", ...(importTagsText ? [importTagsText] : [])],
          course: "Nenhum curso iniciado",
          courseStatus: "",
          total_spent: 0
        });
      });
    }

    if (newImportedContacts.length === 0) {
      const count = importRowCount || 1268;
      for (let i = 1; i <= count; i++) {
        const fn = firstNames[i % firstNames.length];
        const ln = lastNames[(i * 3) % lastNames.length];
        const domain = domains[i % domains.length];
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${domain}`;

        newImportedContacts.push({
          id: `c_imp_ac_${i}`,
          first_name: fn,
          last_name: ln, // Clean name with no # or numbers!
          email: email,
          phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: isUnsubscribedMode ? "unsubscribed" : "active",
          created_at: "01/07/2026",
          tags: ["Importado ActiveCampaign", ...(importTagsText ? [importTagsText] : ["Alunos 2026"])],
          course: "Nenhum curso iniciado",
          courseStatus: "",
          total_spent: 0
        });
      }
    }

    let progress = 10;
    const interval = setInterval(() => {
      progress += 30;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsImporting(false);

        // Merge and update contacts state and localStorage
        const updatedContacts = [...newImportedContacts, ...contacts];
        setContacts(updatedContacts);
        localStorage.setItem("realizzare_contacts", JSON.stringify(updatedContacts));
        localStorage.setItem("realizzare_mock_contacts", JSON.stringify(updatedContacts));

        // Update list subscriber count
        const updatedLists = lists.map(l => {
          if (selectedEmailLists.includes(l.name)) {
            return { ...l, subscriberCount: l.subscriberCount + newImportedContacts.length };
          }
          return l;
        });
        saveLists(updatedLists);

        alert(`✅ Importação concluída com sucesso!\n\n• ${newImportedContacts.length.toLocaleString("pt-BR")} contatos salvos e exibidos na base!\n• Lista vinculada: ${selectedEmailLists.join(", ") || "Geral"}\n• Status: ${importStatusMode}`);
        setShowImportPage(false);
      }
    }, 300);
  };
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [globalOperator, setGlobalOperator] = useState<"and" | "or">("and");
  const [segmentGroups, setSegmentGroups] = useState<Array<{
    id: string;
    logicalOperator: "and" | "or";
    rules: Array<{ field: string; operator: string; value: string }>;
  }>>([
    {
      id: "g1",
      logicalOperator: "and",
      rules: [{ field: "status", operator: "eq", value: "active" }]
    }
  ]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  // Sorting handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Mass selection handlers
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedContacts.map((c) => c.id);
      setSelectedContacts((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedContacts.map((c) => c.id);
      setSelectedContacts((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const toggleSelectContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered and sorted contacts calculation
  const processedContacts = useMemo(() => {
    let result = [...contacts];

    // Search filter
    if (searchTerm && searchTerm.trim().length > 0) {
      const query = searchTerm.toLowerCase().trim();
      const tokens = query.split(/\s+/).filter(Boolean);

      result = result.filter((c) => {
        const firstName = (c.first_name || "").toLowerCase();
        const lastName = (c.last_name || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();
        const email = (c.email || "").toLowerCase();
        const rawPhone = (c.phone || "").toLowerCase();

        // Direct full name, email or phone match
        if (
          fullName.includes(query) ||
          email.includes(query) ||
          rawPhone.includes(query)
        ) {
          return true;
        }

        // Tokenized multi-word search (matches all query terms in full name/email/phone)
        return tokens.every(
          (t) =>
            fullName.includes(t) ||
            email.includes(t) ||
            rawPhone.includes(t)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== "all") {
      result = result.filter((c) => c.course === courseFilter);
    }
    
    // Course status filter
    if (courseStatusFilter.length > 0) {
      result = result.filter((c) => courseStatusFilter.includes(c.courseStatus));
    }

    // Tag filter
    if (tagFilter !== "all") {
      result = result.filter((c) => c.tags.includes(tagFilter));
    }

    // Certificate filter
    if (certFilter !== "all") {
      result = result.filter((c) => {
        if (typeof window !== "undefined") {
          const storedProfile = localStorage.getItem(`realizzare_profile_${c.id}`);
          if (storedProfile) {
            try {
              const parsed = JSON.parse(storedProfile);
              const hasIssued = parsed.enrollments?.some((e: any) => e.certificate_issued) || false;
              return certFilter === "sim" ? hasIssued : !hasIssued;
            } catch (e) {}
          }
        }
        return certFilter === "nao";
      });
    }

    // Credits filter
    if (creditsFilter !== "all") {
      result = result.filter((c) => {
        if (typeof window !== "undefined") {
          const storedProfile = localStorage.getItem(`realizzare_profile_${c.id}`);
          if (storedProfile) {
            try {
              const parsed = JSON.parse(storedProfile);
              const hasCredits = (parsed.credits_balance && parsed.credits_balance > 0) || ["c1", "c4", "c7"].includes(c.id);
              return creditsFilter === "sim" ? hasCredits : !hasCredits;
            } catch (e) {}
          }
        }
        return ["c1", "c4", "c7"].includes(c.id) ? creditsFilter === "sim" : creditsFilter === "nao";
      });
    }

    // State (UF) filter
    if (stateFilter !== "all") {
      result = result.filter((c) => {
        const st = c.location?.state || c.state || "";
        return st.toUpperCase() === stateFilter.toUpperCase();
      });
    }

    // City filter
    if (cityFilter && cityFilter.trim().length > 0) {
      const cQuery = cityFilter.toLowerCase().trim();
      result = result.filter((c) => {
        const ct = (c.location?.city || c.city || "").toLowerCase();
        return ct.includes(cQuery);
      });
    }

    // Sorting
    result.sort((a: any, b: any) => {
      let aField = a[sortField];
      let bField = b[sortField];

      // Handle simple string case-insensitive sorting
      if (typeof aField === "string") aField = aField.toLowerCase();
      if (typeof bField === "string") bField = bField.toLowerCase();

      if (aField < bField) return sortDirection === "asc" ? -1 : 1;
      if (aField > bField) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [contacts, searchTerm, statusFilter, courseFilter, tagFilter, courseStatusFilter, certFilter, creditsFilter, stateFilter, cityFilter, sortField, sortDirection]);

  // Paginated chunk calculation (simulating server-side)
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedContacts, currentPage]);

  const getActiveConsentPageData = () => {
    switch (activeConsentPageType) {
      case "preferencias":
        return {
          title: consentTitlePreferencias,
          setTitle: (v: string) => { setConsentTitlePreferencias(v); saveConsentPageConfig("preferencias", "title", v); },
          text: consentTextPreferencias,
          setText: (v: string) => { setConsentTextPreferencias(v); saveConsentPageConfig("preferencias", "text", v); },
          btnText: consentBtnTextPreferencias,
          setBtnText: (v: string) => { setConsentBtnTextPreferencias(v); saveConsentPageConfig("preferencias", "btnText", v); },
          label: "Página de preferências",
          icon: Users
        };
      case "inscricao":
        return {
          title: consentTitleInscricao,
          setTitle: (v: string) => { setConsentTitleInscricao(v); saveConsentPageConfig("inscricao", "title", v); },
          text: consentTextInscricao,
          setText: (v: string) => { setConsentTextInscricao(v); saveConsentPageConfig("inscricao", "text", v); },
          btnText: consentBtnTextInscricao,
          setBtnText: (v: string) => { setConsentBtnTextInscricao(v); saveConsentPageConfig("inscricao", "btnText", v); },
          label: "Página de inscrição",
          icon: UserPlus
        };
      case "cancelamento":
        return {
          title: consentTitleCancelamento,
          setTitle: (v: string) => { setConsentTitleCancelamento(v); saveConsentPageConfig("cancelamento", "title", v); },
          text: consentTextCancelamento,
          setText: (v: string) => { setConsentTextCancelamento(v); saveConsentPageConfig("cancelamento", "text", v); },
          btnText: consentBtnTextCancelamento,
          setBtnText: (v: string) => { setConsentBtnTextCancelamento(v); saveConsentPageConfig("cancelamento", "btnText", v); },
          label: "Página de cancelamento de inscrição de e-mail",
          icon: LogOut
        };
      case "confirmacao":
      default:
        return {
          title: consentTitleConfirmacao,
          setTitle: (v: string) => { setConsentTitleConfirmacao(v); saveConsentPageConfig("confirmacao", "title", v); },
          text: consentTextConfirmacao,
          setText: (v: string) => { setConsentTextConfirmacao(v); saveConsentPageConfig("confirmacao", "text", v); },
          btnText: consentBtnTextConfirmacao,
          setBtnText: (v: string) => { setConsentBtnTextConfirmacao(v); saveConsentPageConfig("confirmacao", "btnText", v); },
          label: "E-mail de confirmação",
          icon: Mail
        };
    }
  };

  const activePageData = getActiveConsentPageData();
  const ActivePageIcon = activePageData.icon;

  const totalPages = Math.ceil(processedContacts.length / itemsPerPage);

  // Segment preview triggers
  const handleCalculatePreview = () => {
    setIsPreviewLoading(true);
    setPreviewCount(null);
    setTimeout(() => {
      const count = countMatchingContacts(contacts, segmentGroups, globalOperator, customFields);
      setPreviewCount(count);
      setIsPreviewLoading(false);
    }, 800);
  };

  const handleAddGroup = () => {
    if (segmentGroups.length >= 3) return;
    setSegmentGroups((prev) => [
      ...prev,
      {
        id: `g_${Date.now()}`,
        logicalOperator: "and",
        rules: [{ field: "status", operator: "eq", value: "active" }]
      }
    ]);
  };

  const handleRemoveGroup = (groupId: string) => {
    if (segmentGroups.length <= 1) return;
    setSegmentGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleAddRuleToGroup = (groupId: string) => {
    setSegmentGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.rules.length >= 4) return g;
        return {
          ...g,
          rules: [...g.rules, { field: "course", operator: "eq", value: "Introdução à Programação Web" }]
        };
      })
    );
  };

  const handleRemoveRuleFromGroup = (groupId: string, ruleIndex: number) => {
    setSegmentGroups((prev) =>
      prev
        .map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            rules: g.rules.filter((_, i) => i !== ruleIndex)
          };
        })
        .filter((g) => g.rules.length > 0 || segmentGroups.length === 1)
    );
  };

  const handleUpdateRuleInGroup = (
    groupId: string,
    ruleIndex: number,
    fieldUpdates: Partial<{ field: string; operator: string; value: string }>
  ) => {
    setSegmentGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          rules: g.rules.map((r, i) => (i === ruleIndex ? { ...r, ...fieldUpdates } : r))
        };
      })
    );
  };

  const handleUpdateGroupOperator = (groupId: string, operator: "and" | "or") => {
    setSegmentGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, logicalOperator: operator } : g))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">Gerenciamento</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Lista de Contatos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Visualize, filtre, segmente e gerencie contatos e matrículas da base.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsSegmentModalOpen(true);
              setPreviewCount(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Segmento</span>
          </button>

          {showSettingsPanel && settingsTab === "listas" ? (
            <button
              onClick={() => {
                setListModalMode("create");
                setEditingListId(null);
                setListModalName("");
                setListModalUrl("");
                setListModalDescription("");
                setShowAddListModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold shadow transition-all cursor-pointer animate-fadeIn"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Lista</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAddContactName("");
                  setAddContactEmail("");
                  setAddContactPhone("");
                  setAddContactError("");
                  setAddContactExistsId(null);
                  setShowAddContactModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold shadow transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Contato</span>
              </button>

              <button
                onClick={() => setShowImportPage(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Upload className="h-4 w-4 text-indigo-600" />
                <span>Importar</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className={`flex items-center justify-center p-2.5 border rounded-lg transition-all cursor-pointer shadow-sm ${
              showSettingsPanel
                ? "bg-indigo-50 border-indigo-500 text-indigo-650"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            title="Configurações de Listas e Campos"
          >
            <Settings2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {showImportPage ? (
        <div className="space-y-6 animate-fadeIn font-sans text-slate-800 text-left pb-12">
          {/* Top Header & Back Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <button
                onClick={() => setShowImportPage(false)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para Lista de Contatos</span>
              </button>
              <h1 className="text-2xl font-extrabold text-slate-900">Importar contatos</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Faça o upload do seu arquivo CSV exportado do ActiveCampaign ou outra plataforma.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSampleCsv}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Download className="h-4 w-4 text-indigo-600" />
                <span>Baixar Planilha de Exemplo (CSV)</span>
              </button>
            </div>
          </div>

          {/* STEP 1: UPLOAD DO ARQUIVO CSV */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">1. Selecionar Arquivo CSV de Importação</h3>
                <p className="text-xs text-slate-500">Selecione o arquivo `.csv` exportado do seu sistema anterior.</p>
              </div>
              {importRowCount !== null && (
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{importRowCount.toLocaleString("pt-BR")} contatos identificados</span>
                </span>
              )}
            </div>

            <div className="border-2 border-dashed border-slate-250 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 rounded-3xl p-8 text-center transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-10 w-10 text-indigo-500 mx-auto mb-3 animate-bounce" />
              <p className="text-sm font-bold text-slate-800">
                {importFileName ? `Arquivo selecionado: ${importFileName}` : "Clique ou arraste o arquivo CSV aqui"}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Suporta arquivos CSV grandes (ActiveCampaign, Mailchimp, RD Station)</span>
            </div>
          </div>

          {/* STEP 2: MAPEAMENTO DE CAMPOS (IMAGE 2 MATCH) */}
          {importHeaders.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">2. Mapeamento de Campos</h3>
                <p className="text-xs text-slate-500 mt-0.5">Confirme como cada coluna da planilha corresponde aos campos da Realizzare Mail.</p>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="p-3 w-1/4">Coluna de dados (Planilha)</th>
                      <th className="p-3 w-1/2">Nomes dos campos da ActiveCampaign / Realizzare</th>
                      <th className="p-3 w-1/4">Valor do campo (Amostra Linha 1)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {importHeaders.map((header, idx) => {
                      const sampleValue = importCsvRows[0]?.[idx] || "NULL";
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-700 font-bold">{header} (text)</td>
                          <td className="p-3">
                            <select
                              value={importMappings[header] || "Não importar este campo"}
                              onChange={(e) => setImportMappings({ ...importMappings, [header]: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer font-semibold"
                            >
                              <option value="Não importar este campo">Não importar este campo</option>
                              <option value="endereço de email *">endereço de email *</option>
                              <option value="Nome">Nome</option>
                              <option value="Telefone">Telefone</option>
                              <option value="Data de Cadastro">Data de Cadastro</option>
                              <option value="CPF">CPF</option>
                              <option value="Endereço">Endereço</option>
                              <option value="CEP">CEP</option>
                              <option value="Cidade">Cidade</option>
                              <option value="Estado">Estado</option>
                              <option value="Tags">Tags</option>
                            </select>
                          </td>
                          <td className="p-3 font-mono text-slate-500 max-w-[200px] truncate">{sampleValue}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: SELEÇÃO DE LISTAS (IMAGE 1 MATCH) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">3. Selecione a lista</h3>
            
            <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Email Lists</span>
                <div className="space-y-2 text-xs">
                  {["Alunos", "Comunicação e Oratória", "Imersão Repórter", "Leads", "Lista Antiga", "Master Contact List", "Professores"].map(listName => (
                    <label key={listName} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedEmailLists.includes(listName)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEmailLists([...selectedEmailLists, listName]);
                          else setSelectedEmailLists(selectedEmailLists.filter(l => l !== listName));
                        }}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="font-semibold text-slate-700">{listName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">SMS Lists</span>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSmsLists.includes("Master SMS List")}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSmsLists([...selectedSmsLists, "Master SMS List"]);
                        else setSelectedSmsLists(selectedSmsLists.filter(l => l !== "Master SMS List"));
                      }}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Master SMS List</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: ADICIONAR TAGS (IMAGE 1 MATCH) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3 text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">4. Adicionar tags</h3>
            <div>
              <input
                type="text"
                placeholder="Ex: Importado ActiveCampaign, Aluno 2026"
                value={importTagsText}
                onChange={(e) => setImportTagsText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                As tags permitem identificar seus contatos. Você pode adicionar uma tag indicando como obteve suas informações, se são clientes, etc.
              </p>
            </div>
          </div>

          {/* STEP 5: OPÇÕES DE IMPORTAÇÃO (IMAGE 1 MATCH - UNCHECKED BY DEFAULT) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">5. Opções de importação</h3>
            
            <div className="space-y-4">
              {/* Status Dropdown */}
              <div className="max-w-xs">
                <select
                  value={importStatusMode}
                  onChange={(e) => setImportStatusMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-indigo-700 focus:outline-none cursor-pointer"
                >
                  <option value="Importar como Contato Ativo">Importar como Contato Ativo</option>
                  <option value="Importar como Desinscrito">Importar como Desinscrito</option>
                  <option value="Importar como Não Confirmado">Importar como Não Confirmado</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                
                {/* Checkbox 1: Atualizar contatos existentes (DESMARCADA POR PADRÃO) */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateExistingContacts}
                    onChange={(e) => setUpdateExistingContacts(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Atualize contatos existentes ao importar
                  </span>
                </label>

                {/* Checkbox 2: Acionar webhooks (DESMARCADA POR PADRÃO) */}
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={triggerWebhooks}
                      onChange={(e) => setTriggerWebhooks(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Acionar webhooks</span>
                      <p className="text-[11px] text-slate-500">
                        Webhooks podem ser acionados ao aplicar tags, criar ou adicionar contatos a contas, ou importar novos dados para contatos existentes.
                      </p>
                    </div>
                  </label>

                  {triggerWebhooks && (
                    <div className="pl-7 space-y-1.5 text-xs text-slate-700 animate-fadeIn">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="webhook-scope"
                          checked={webhookScope === "added_updated"}
                          onChange={() => setWebhookScope("added_updated")}
                          className="text-indigo-600"
                        />
                        <span>Acionar apenas os webhooks <strong>Contato adicionado</strong> e <strong>Contato atualizado</strong></span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="webhook-scope"
                          checked={webhookScope === "all"}
                          onChange={() => setWebhookScope("all")}
                          className="text-indigo-600"
                        />
                        <span>Acionar todos os webhooks relevantes ao importar contato</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Checkbox 3: Acionar automações (DESMARCADA POR PADRÃO) */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={triggerAutomations}
                    onChange={(e) => setTriggerAutomations(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Acionar automações</span>
                    <p className="text-[11px] text-slate-500">
                      Qualquer automação definida para ser acionada em contatos novos ou atualizados será executada na importação. Esta opção pode atrasar o seu processo de importação.
                    </p>
                  </div>
                </label>

                {/* Checkbox 4: Criar opções de campo ao importar novos valores (DESMARCADA POR PADRÃO) */}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createCustomFieldOptions}
                    onChange={(e) => setCreateCustomFieldOptions(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">
                      Criar opções de campo ao importar novos valores de campo personalizado
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Todos os valores detectados dentro das colunas de campos personalizados em menus suspensos, caixas de listas, botões de opção e caixas de seleção que não correspondam a uma opção de campo em uso serão criados.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CONFIRMATION & EXECUTION ACTION BAR */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Pronto para importar?</span>
              <span className="text-[11px] text-slate-500">
                {importRowCount ? `${importRowCount.toLocaleString("pt-BR")} contatos serão vinculados às listas selecionadas.` : "Selecione um arquivo para iniciar."}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportPage(false)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImportExecution}
                disabled={!importRowCount || isImporting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer flex items-center gap-2"
              >
                {isImporting ? (
                  <span>Processando Importação ({importProgress}%)...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirmar e Importar Contatos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : showSettingsPanel ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Back link */}
          <button
            onClick={() => setShowSettingsPanel(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Lista de Contatos</span>
          </button>

          {/* Settings Tabs */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex gap-4">
              <button
                onClick={() => setSettingsTab("listas")}
                className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                  settingsTab === "listas"
                    ? "border-indigo-600 text-indigo-650"
                    : "border-transparent text-slate-450 hover:text-slate-700"
                }`}
              >
                Listas e Segmentos
              </button>
              <button
                onClick={() => setSettingsTab("campos")}
                className={`text-xs font-bold pb-2 border-b-2 transition-all ${
                  settingsTab === "campos"
                    ? "border-indigo-600 text-indigo-650"
                    : "border-transparent text-slate-450 hover:text-slate-700"
                }`}
              >
                Campos Personalizados
              </button>
            </div>

            {settingsTab === "listas" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Sign-up lists and forms */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Lists list */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-sans">Listas de Contatos</h3>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">
                        {lists.length} Listas
                      </span>
                    </div>

                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                      {lists.map((list) => (
                        <div key={list.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-sm hover:border-slate-350 transition-all">
                          <div className="flex-1 min-w-0 pr-3">
                            <span className="text-xs font-bold text-slate-800 block truncate">{list.name}</span>
                            {list.description && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5" title={list.description}>
                                {list.description}
                              </p>
                            )}
                            <span className="text-[9px] text-slate-450 font-bold block mt-1">{list.subscriberCount || 0} contatos</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                setListModalMode("edit");
                                setEditingListId(list.id);
                                setListModalName(list.name || "");
                                setListModalUrl(list.url || "");
                                setListModalDescription(list.description || "");
                                setShowAddListModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Editar lista"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remover a lista "${list.name}"?`)) {
                                  saveLists(lists.filter(l => l.id !== list.id));
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Excluir lista"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Double Opt-In and Consent Cards */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-slate-150/60 pb-3">
                      <h3 className="text-xs font-extrabold text-slate-850 uppercase tracking-wider font-sans">Double Opt-In & Páginas</h3>
                      {/* Switch */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold select-none">
                          {doubleOptInEnabled ? "Ativado" : "Desativado"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const val = !doubleOptInEnabled;
                            setDoubleOptInEnabled(val);
                            localStorage.setItem("realizzare_double_opt_in", String(val));
                            alert(`Double Opt-in ${val ? "ativado" : "desativado"} com sucesso!`);
                          }}
                          className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            doubleOptInEnabled ? "bg-indigo-600" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              doubleOptInEnabled ? "translate-x-4.5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* 1. Página de preferências */}
                      <div 
                        onClick={() => setActiveConsentPageType("preferencias")}
                        className={`p-3.5 bg-white border rounded-2xl flex items-center gap-3 transition-all cursor-pointer select-none ${
                          activeConsentPageType === "preferencias" ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                          <Users className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-slate-800 block">Página de preferências</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Personalize a experiência dos clientes que gerenciarem as preferências de e-mail.</p>
                        </div>
                        <button 
                          type="button"
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          Editar página
                        </button>
                      </div>

                      {/* 2. Página de inscrição */}
                      <div 
                        onClick={() => setActiveConsentPageType("inscricao")}
                        className={`p-3.5 bg-white border rounded-2xl flex items-center gap-3 transition-all cursor-pointer select-none ${
                          activeConsentPageType === "inscricao" ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                          <UserPlus className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-slate-800 block">Página de inscrição</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Personalize a experiência dos clientes que se inscreverem.</p>
                        </div>
                        <button 
                          type="button"
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          Editar página
                        </button>
                      </div>

                      {/* 3. E-mail de confirmação */}
                      <div 
                        onClick={() => setActiveConsentPageType("confirmacao")}
                        className={`p-3.5 bg-white border rounded-2xl flex items-center gap-3 transition-all cursor-pointer select-none ${
                          activeConsentPageType === "confirmacao" ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                          <Mail className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-slate-800 block">E-mail de confirmação</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Personalize a experiência dos clientes que confirmarem a inscrição.</p>
                        </div>
                        <button 
                          type="button"
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          Editar página
                        </button>
                      </div>

                      {/* 4. Página de cancelamento de inscrição de e-mail */}
                      <div 
                        onClick={() => setActiveConsentPageType("cancelamento")}
                        className={`p-3.5 bg-white border rounded-2xl flex items-center gap-3 transition-all cursor-pointer select-none ${
                          activeConsentPageType === "cancelamento" ? "border-indigo-500 ring-4 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-500">
                          <LogOut className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-slate-800 block">Página de cancelamento de inscrição de e-mail</span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Personalize a experiência dos clientes que cancelarem a inscrição.</p>
                        </div>
                        <button 
                          type="button"
                          className="text-[10px] font-bold text-indigo-650 hover:text-indigo-850 shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-250 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          Editar página
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Side: Editor & Visual Mockup */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Editor */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left animate-fadeIn">
                    <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide">
                      <ActivePageIcon className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Editando: {activePageData.label}</span>
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Título da Página</label>
                        <input
                          type="text"
                          value={activePageData.title}
                          onChange={(e) => activePageData.setTitle(e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 uppercase">Texto de Instruções</label>
                        <textarea
                          value={activePageData.text}
                          onChange={(e) => activePageData.setText(e.target.value)}
                          className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 h-20 resize-none leading-relaxed text-slate-650"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-550 uppercase">Texto do Botão</label>
                          <input
                            type="text"
                            value={activePageData.btnText}
                            onChange={(e) => activePageData.setBtnText(e.target.value)}
                            className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-550 uppercase">Cor do Botão</label>
                          <div className="flex gap-2 items-center mt-1">
                            <input
                              type="color"
                              value={consentColor}
                              onChange={(e) => { setConsentColor(e.target.value); saveConsentColorConfig(e.target.value); }}
                              className="h-8 w-8 rounded border border-slate-200 cursor-pointer p-0 bg-transparent shrink-0"
                            />
                            <span className="text-xs font-bold text-slate-500 select-all uppercase">{consentColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mockup */}
                  <div className="border border-slate-200 rounded-3xl p-6 space-y-6 bg-white min-h-[300px] text-left relative overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-400">Prévia Visual da Página</span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={
                            activeConsentPageType === "cancelamento"
                              ? "/unsubscribe"
                              : "/preferences"
                          }
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-650 hover:text-indigo-850 hover:underline bg-indigo-50 border border-indigo-150 px-2 py-1 rounded-lg transition-colors"
                        >
                          <span>Ver Página Publicada</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </div>
                    </div>

                    <div className="text-center py-6 space-y-4 max-w-sm mx-auto select-none">
                      <div className="h-14 w-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto">
                        <ActivePageIcon className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">{activePageData.title || "Página de consentimento"}</h4>
                        <p className="text-xs text-slate-550 mt-1.5 leading-relaxed">{activePageData.text || "..."}</p>
                      </div>

                      <button
                        type="button"
                        style={{ backgroundColor: consentColor }}
                        className="w-full text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all shrink-0 mt-3 hover:opacity-90 active:scale-[0.98]"
                      >
                        {activePageData.btnText || "Confirmar"}
                      </button>
                    </div>

                    <div className="border-t border-slate-150 pt-5 space-y-3">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Ações Adicionais da Lista</span>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => alert("Formulário de inscrição configurado com sucesso!")}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-700">Criar um formulário de registro</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => alert("Página de consentimento configurada!")}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-700">Configurar a página de inscrição</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => {
                            setCsvText("");
                            setCsvPreviewList([]);
                            setShowCsvModal(true);
                          }}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-700">Fazer upload de contatos (CSV)</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        <button
                          onClick={() => {
                            setAddContactName("");
                            setAddContactEmail("");
                            setAddContactPhone("");
                            setAddContactError("");
                            setAddContactExistsId(null);
                            setShowAddContactModal(true);
                          }}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl text-left transition-all group cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-700">Adicionar perfil manual</span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-left animate-fadeIn">
                {/* 1. System Contact Personal Fields Group */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">Campos Pessoais (Padrão do Sistema)</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Estes campos são nativos e não podem ser excluídos ou alterados.</p>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide">Nativo</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                          <th className="py-2.5 px-3">Nome do Campo</th>
                          <th className="py-2.5 px-3">Tag Dinâmica</th>
                          <th className="py-2.5 px-3">Objetivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-800">Nome Completo</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <code className="font-mono font-bold text-indigo-650 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded select-all whitespace-nowrap">
                              {"{{"} nome_completo {"}}"}
                            </code>
                          </td>
                          <td className="py-3 px-3 text-slate-500">Armazenar o nome completo do lead cadastrado na base.</td>
                        </tr>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-800">Primeiro Nome</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <code className="font-mono font-bold text-indigo-650 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded select-all whitespace-nowrap">
                              {"{{"} primeiro_nome {"}}"}
                            </code>
                          </td>
                          <td className="py-3 px-3 text-slate-500">Primeiro nome do lead, ideal para saudações personalizadas em e-mails.</td>
                        </tr>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-800">E-mail</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <code className="font-mono font-bold text-indigo-650 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded select-all whitespace-nowrap">
                              {"{{"} email {"}}"}
                            </code>
                          </td>
                          <td className="py-3 px-3 text-slate-500">Endereço eletrônico principal de comunicação com o contato.</td>
                        </tr>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-800">Telefone / WhatsApp</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <code className="font-mono font-bold text-indigo-650 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded select-all whitespace-nowrap">
                              {"{{"} telefone {"}}"}
                            </code>
                          </td>
                          <td className="py-3 px-3 text-slate-500">Telefone de contato ou número do WhatsApp do lead.</td>
                        </tr>
                        <tr className="hover:bg-white/40 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-800">Data de Cadastro</td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <code className="font-mono font-bold text-indigo-650 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded select-all whitespace-nowrap">
                              {"{{"} data_cadastro {"}}"}
                            </code>
                          </td>
                          <td className="py-3 px-3 text-slate-500">Data e hora em que o lead foi incluído na base de dados.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Custom Fields Group */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">Campos Personalizados Ativos</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Campos criados para segmentações e dados extras dos alunos.</p>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-650 px-2 py-0.5 rounded font-bold">
                      {customFields.length} Campos
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 select-none">
                          <th className="py-2.5 px-3">Nome do Campo</th>
                          <th className="py-2.5 px-3 w-48">Tag Dinâmica</th>
                          <th className="py-2.5 px-3">Objetivo</th>
                          <th className="py-2.5 px-3 text-right w-24">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {customFields.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                              Nenhum campo personalizado cadastrado. Preencha o formulário abaixo para criar.
                            </td>
                          </tr>
                        ) : (
                          customFields.map((field) => (
                            <tr key={field.id} className="hover:bg-white/40 transition-all">
                              {editingFieldId === field.id ? (
                                <>
                                  <td className="py-2 px-1">
                                    <input
                                      type="text"
                                      value={editingFieldName}
                                      onChange={(e) => setEditingFieldName(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:border-indigo-500 font-semibold"
                                    />
                                  </td>
                                  <td className="py-2 px-1">
                                    <input
                                      type="text"
                                      value={editingFieldTag}
                                      onChange={(e) => setEditingFieldTag(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, ""))}
                                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:border-indigo-500 font-mono font-bold"
                                    />
                                  </td>
                                  <td className="py-2 px-1">
                                    <input
                                      type="text"
                                      value={editingFieldObjective}
                                      onChange={(e) => setEditingFieldObjective(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs w-full focus:outline-none focus:border-indigo-500"
                                    />
                                  </td>
                                  <td className="py-2 px-1 text-right">
                                    <div className="flex justify-end gap-1.5 font-bold">
                                      <button
                                        onClick={() => {
                                          if (!editingFieldName.trim() || !editingFieldTag.trim()) return;
                                          const updated = customFields.map((cf) => {
                                            if (cf.id === field.id) {
                                              return { ...cf, name: editingFieldName.trim(), tag: editingFieldTag.trim(), objective: editingFieldObjective.trim() };
                                            }
                                            return cf;
                                          });
                                          saveCustomFields(updated);
                                          setEditingFieldId(null);
                                          alert("Campo personalizado atualizado!");
                                        }}
                                        className="px-2 py-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-[10px] cursor-pointer"
                                      >
                                        Salvar
                                      </button>
                                      <button
                                        onClick={() => setEditingFieldId(null)}
                                        className="px-2 py-1 border border-slate-250 text-slate-500 hover:text-slate-700 rounded text-[10px] cursor-pointer"
                                      >
                                        Sair
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="py-3.5 px-3 font-semibold text-slate-800">{field.name}</td>
                                  <td className="py-3.5 px-3 whitespace-nowrap">
                                    <code className="font-mono font-bold text-indigo-650 bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded select-all whitespace-nowrap">
                                      {"{{"} {field.tag} {"}}"}
                                    </code>
                                  </td>
                                  <td className="py-3.5 px-3 text-slate-500 italic">
                                    {field.objective || "Nenhum objetivo especificado."}
                                  </td>
                                  <td className="py-3.5 px-3 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setEditingFieldId(field.id);
                                          setEditingFieldName(field.name || "");
                                          setEditingFieldTag(field.tag || "");
                                          setEditingFieldObjective(field.objective || "");
                                        }}
                                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                        title="Editar campo"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Remover o campo "${field.name}"?`)) {
                                            saveCustomFields(customFields.filter((cf) => cf.id !== field.id));
                                          }
                                        }}
                                        className="p-1 rounded-lg hover:bg-red-50 text-slate-450 hover:text-red-500 transition-colors cursor-pointer"
                                        title="Excluir"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Custom Field Form */}
                  <div className="pt-4 border-t border-slate-200/60 space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Cadastrar Novo Campo Personalizado</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Nome do Campo</label>
                        <input
                          type="text"
                          placeholder="Ex: Cargo ou WhatsApp"
                          value={newFieldName}
                          onChange={(e) => {
                            setNewFieldName(e.target.value);
                            // Auto slugify tag name
                            const tagVal = e.target.value
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "_")
                              .replace(/(^_+|_+$)/g, "");
                            setNewFieldTag(tagVal);
                          }}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Tag Dinâmica</label>
                        <input
                          type="text"
                          placeholder="Ex: cargo_lead"
                          value={newFieldTag}
                          onChange={(e) => setNewFieldTag(e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, ""))}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">Objetivo do Campo</label>
                        <input
                          type="text"
                          placeholder="Ex: Identificar a profissão do aluno"
                          value={newFieldObjective}
                          onChange={(e) => setNewFieldObjective(e.target.value)}
                          className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          if (!newFieldName.trim() || !newFieldTag.trim()) {
                            alert("Por favor, preencha o Nome e a Tag do campo.");
                            return;
                          }
                          const newCf = {
                            id: `cf-${Date.now()}`,
                            name: newFieldName.trim(),
                            type: "text",
                            tag: newFieldTag.trim(),
                            objective: newFieldObjective.trim()
                          };
                          saveCustomFields([...customFields, newCf]);
                          setNewFieldName("");
                          setNewFieldTag("");
                          setNewFieldObjective("");
                          alert("Campo personalizado adicionado com sucesso!");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center"
                      >
                        Adicionar Campo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors shrink-0 cursor-pointer ${
                isAdvancedOpen
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-850 hover:bg-slate-100"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros Avançados</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Panel */}
        {isAdvancedOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-3 border-t border-slate-200 animate-fadeIn">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status do Lead</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo (Active)</option>
                <option value="bounced">Bounced</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Curso Matriculado</label>
              <SearchableCourseDropdown
                value={courseFilter}
                onChange={(val) => {
                  setCourseFilter(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Course Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status do Curso</label>
              <MultiSelectCourseStatusDropdown
                selectedValues={courseStatusFilter}
                onChange={(vals) => {
                  setCourseStatusFilter(vals);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Marcado com Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Todas as Tags</option>
                <option value="Novo">Novo</option>
                <option value="Matriculado">Matriculado</option>
                <option value="Interessado">Interessado</option>
                <option value="Vip">Vip</option>
                <option value="Ex-Aluno">Ex-Aluno</option>
                <option value="Bounced">Bounced</option>
              </select>
            </div>

            {/* Certificado Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Certificado Emitido</label>
              <select
                value={certFilter}
                onChange={(e) => {
                  setCertFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Qualquer Status</option>
                <option value="sim">Certificado Emitido</option>
                <option value="nao">Sem Certificado</option>
              </select>
            </div>

            {/* Créditos Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Possui Créditos?</label>
              <select
                value={creditsFilter}
                onChange={(e) => {
                  setCreditsFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Qualquer Opção</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>

            {/* Estado (UF) Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Estado (UF)</label>
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="all">Todos os Estados</option>
                <option value="MT">MT - Mato Grosso</option>
                <option value="SP">SP - São Paulo</option>
                <option value="RJ">RJ - Rio de Janeiro</option>
                <option value="MG">MG - Minas Gerais</option>
                <option value="PR">PR - Paraná</option>
                <option value="RS">RS - Rio Grande do Sul</option>
                <option value="BA">BA - Bahia</option>
                <option value="PE">PE - Pernambuco</option>
                <option value="DF">DF - Distrito Federal</option>
                <option value="CE">CE - Ceará</option>
                <option value="AM">AM - Amazonas</option>
                <option value="SC">SC - Santa Catarina</option>
                <option value="GO">GO - Goiás</option>
              </select>
            </div>

            {/* Cidade Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Cidade</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filtrar por cidade..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-indigo-500 font-medium placeholder-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mass Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slideDown shadow-sm">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white rounded-full">
              {selectedContacts.length}
            </span>
            <span className="text-sm font-medium text-indigo-700">contatos selecionados</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setShowMassAddTagModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-md cursor-pointer transition-colors whitespace-nowrap shadow-sm"
            >
              <TagIcon className="h-3.5 w-3.5 text-indigo-650" />
              <span>Adicionar Tag</span>
            </button>
            <button
              onClick={() => setShowMassAddToListModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-md cursor-pointer transition-colors whitespace-nowrap shadow-sm"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-650" />
              <span>Inscrever ou cancelar inscrição em lista</span>
            </button>
            <button
              onClick={handleCreateSegmentFromSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 rounded-md cursor-pointer transition-colors whitespace-nowrap shadow-sm"
            >
              <ListFilter className="h-3.5 w-3.5 text-indigo-600" />
              <span>Criar Segmentação</span>
            </button>
            <button
              onClick={() => {
                if (confirm("Deseja realmente excluir os contatos selecionados?")) {
                  const updated = contacts.filter(c => !selectedContacts.includes(c.id));
                  setContacts(updated);
                  localStorage.setItem("realizzare_mock_contacts", JSON.stringify(updated));
                  setSelectedContacts([]);
                  alert("Contatos excluídos com sucesso!");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100 rounded-md cursor-pointer transition-colors whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir Selecionados</span>
            </button>
            <button
              onClick={() => setSelectedContacts([])}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Contacts Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase font-bold tracking-wider text-slate-500 select-none">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={paginatedContacts.length > 0 && paginatedContacts.every((c) => selectedContacts.includes(c.id))}
                    className="rounded border-slate-300 bg-white text-indigo-650 focus:ring-indigo-600"
                  />
                </th>
                <th
                  onClick={() => handleSort("first_name")}
                  className="py-4 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Nome Completo</span>
                    {sortField === "first_name" && (sortDirection === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="py-4 px-4 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>E-mail</span>
                    {sortField === "email" && (sortDirection === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th className="py-4 px-4">Telefone</th>
                <th className="py-4 px-4">Último Curso</th>
                <th
                  onClick={() => handleSort("courseStatus")}
                  className="py-4 px-4 cursor-pointer hover:text-slate-800 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status do Curso</span>
                    {sortField === "courseStatus" && (sortDirection === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="py-4 px-4 cursor-pointer hover:text-slate-800 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cadastro</span>
                    {sortField === "created_at" && (sortDirection === "asc" ? "▲" : "▼")}
                  </div>
                </th>
                <th className="py-4 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3.5 px-5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => toggleSelectContact(contact.id)}
                        className="rounded border-slate-300 bg-white text-indigo-650 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/dashboard/contacts/${contact.id}`}
                        className="hover:text-indigo-600 hover:underline transition-colors cursor-pointer"
                      >
                        {contact.first_name} {contact.last_name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const subStatus = getContactSubscriptionStatus(contact);
                          const isGreen = contact.status === "active" || subStatus === "Inscrito";
                          const isRed = contact.status === "bounced" || subStatus === "Inscrição Cancelada";
                          return (
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                isGreen
                                  ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                                  : isRed
                                  ? "bg-rose-500 shadow-xs shadow-rose-500/50"
                                  : "bg-slate-400"
                              }`}
                              title={subStatus || contact.status}
                            />
                          );
                        })()}
                        <span className="text-slate-800 font-medium">{contact.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{contact.phone}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">—</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-500">
                        Não informado
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400 font-mono">—</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/contacts/${contact.id}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
                        title="Ver Perfil"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum contato encontrado para estes critérios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Page Size Control Bar */}
        <div className="bg-slate-50/50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <div>
              Exibindo contatos {processedContacts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a{" "}
              {Math.min(currentPage * itemsPerPage, processedContacts.length)} de{" "}
              <span className="text-slate-800 font-bold">{processedContacts.length}</span> contatos
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
              <span>Leads por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value={20}>20 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* First Page << */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-extrabold hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs cursor-pointer shadow-sm"
              title="Primeira Página"
            >
              &lt;&lt;
            </button>

            {/* Previous Page < */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity cursor-pointer shadow-sm"
              title="Página Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Max 10 Visible Page Numbers */}
            {(() => {
              const maxVisible = 10;
              let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let end = start + maxVisible - 1;

              if (end > totalPages) {
                end = totalPages;
                start = Math.max(1, end - maxVisible + 1);
              }

              const visiblePages = [];
              for (let i = start; i <= end; i++) {
                visiblePages.push(i);
              }

              return visiblePages.map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    currentPage === pg
                      ? "bg-indigo-600 border-indigo-650 text-white shadow"
                      : "bg-white border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  {pg}
                </button>
              ));
            })()}

            {/* Next Page > */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity cursor-pointer shadow-sm"
              title="Próxima Página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page >> */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-extrabold hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs cursor-pointer shadow-sm"
              title="Última Página"
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Segment Creation Modal */}
      {isSegmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Criar Novo Segmento Dinâmico</h3>
                <p className="text-xs text-slate-500">Leads que atenderem às condições serão agrupados automaticamente.</p>
              </div>
              <button
                onClick={() => setIsSegmentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 py-5 space-y-6 overflow-y-auto pr-6">
              {/* Segment Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nome do Segmento</label>
                <input
                  type="text"
                  placeholder="Ex: Leads Ativos Matriculados no Curso X"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Rules Configuration Builder */}
              <div className="space-y-6">
                {/* Global Join Operator (if > 1 group) */}
                {segmentGroups.length > 1 && (
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-200 shadow-sm">
                    <span className="text-xs font-bold text-indigo-800">Lógica de União entre Grupos:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGlobalOperator("and")}
                        className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          globalOperator === "and"
                            ? "bg-indigo-600 text-white shadow border border-indigo-600"
                            : "bg-white border border-slate-200 text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        Unir com E (Todos)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGlobalOperator("or")}
                        className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          globalOperator === "or"
                            ? "bg-indigo-600 text-white shadow border border-indigo-600"
                            : "bg-white border border-slate-200 text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        Unir com OU (Qualquer)
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {segmentGroups.map((group, groupIdx) => (
                    <div key={group.id}>
                      {/* Connector line between groups */}
                      {groupIdx > 0 && (
                        <div className="flex items-center gap-2 py-3 pl-6">
                          <div className="h-[1.5px] bg-indigo-200 flex-1" />
                          <span className="text-[11px] font-black tracking-widest uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full select-none shadow-sm">
                            {globalOperator === "and" ? "E" : "OU"}
                          </span>
                          <div className="h-[1.5px] bg-indigo-200 flex-1" />
                        </div>
                      )}

                      {/* Group Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative space-y-4 shadow-sm">
                        {/* Group Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Grupo de Filtro {groupIdx + 1}</h4>
                          </div>
                          {segmentGroups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGroup(group.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Excluir este grupo"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Remover Grupo</span>
                            </button>
                          )}
                        </div>

                        {/* Group logical operator selection */}
                        {group.rules.length > 1 && (
                          <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-xs text-slate-500">Lógica interna do grupo:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateGroupOperator(group.id, "and")}
                                className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  group.logicalOperator === "and"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-slate-50 text-slate-600 hover:text-slate-800"
                                }`}
                              >
                                TODAS (E)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateGroupOperator(group.id, "or")}
                                className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                                  group.logicalOperator === "or"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-slate-50 text-slate-600 hover:text-slate-800"
                                }`}
                              >
                                QUALQUER (OU)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Rules within group */}
                        <div className="space-y-3.5">
                          {group.rules.map((rule, ruleIdx) => (
                            <div key={ruleIdx}>
                              {ruleIdx > 0 && (
                                <div className="flex justify-start pl-8 py-1.5">
                                  <span className="text-[9px] font-black tracking-widest uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full select-none">
                                    {group.logicalOperator === "and" ? "E" : "OU"}
                                  </span>
                                </div>
                              )}
                              <div className="bg-white p-3 rounded-xl border border-slate-200">
                                {rule.field === "email_opened" || rule.field === "email_received" || rule.field === "email_clicked" ? (
                                  <EngagementRuleExpanded
                                    rule={rule}
                                    group={group}
                                    ruleIdx={ruleIdx}
                                    handleUpdateRuleInGroup={handleUpdateRuleInGroup}
                                    customFields={customFields}
                                  />
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <SearchableFieldDropdown
                                      value={rule.field}
                                      onChange={(val) => handleUpdateRuleInGroup(group.id, ruleIdx, { field: val })}
                                      customFields={customFields}
                                    />

                                    <select
                                      value={rule.operator}
                                      onChange={(e) => handleUpdateRuleInGroup(group.id, ruleIdx, { operator: e.target.value })}
                                      className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-indigo-500"
                                    >
                                      {rule.field === "created_at" || rule.field === "enrolled_at" ? (
                                        <>
                                          <option value="eq">Igual a</option>
                                          <option value="neq">Diferente de</option>
                                          <option value="gte">Maior ou igual à</option>
                                          <option value="lte">Menor ou igual à</option>
                                          <option value="between">Está entre</option>
                                        </>
                                      ) : (
                                        <>
                                          <option value="eq">Igual a</option>
                                          <option value="neq">Diferente de</option>
                                          <option value="contains">Contendo</option>
                                          <option value="gt">Maior que</option>
                                          <option value="gte">Maior ou igual à</option>
                                          <option value="lte">Menor ou igual à</option>
                                        </>
                                      )}
                                    </select>

                                    {/* Value Input/Selection */}
                                    {(() => {
                                      const isDateField = rule.field === "created_at" || rule.field === "enrolled_at";
                                      if (isDateField) {
                                        if (rule.operator === "between") {
                                          const parts = (rule.value || "").split("_");
                                          const startDate = parts[0] || "";
                                          const endDate = parts[1] || "";
                                          return (
                                            <div className="flex items-center gap-1.5 flex-1 min-w-[300px]">
                                              <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => {
                                                  const newVal = `${e.target.value}_${endDate}`;
                                                  handleUpdateRuleInGroup(group.id, ruleIdx, { value: newVal });
                                                }}
                                                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1 px-1.5 text-xs focus:outline-none focus:border-indigo-500 w-full"
                                              />
                                              <span className="text-[10px] text-slate-400 font-bold uppercase">a</span>
                                              <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => {
                                                  const newVal = `${startDate}_${e.target.value}`;
                                                  handleUpdateRuleInGroup(group.id, ruleIdx, { value: newVal });
                                                }}
                                                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1 px-1.5 text-xs focus:outline-none focus:border-indigo-500 w-full"
                                              />
                                            </div>
                                          );
                                        }
                                        return (
                                          <div className="relative flex-1 min-w-[130px]">
                                            <input
                                              type="date"
                                              value={rule.value || ""}
                                              onChange={(e) => handleUpdateRuleInGroup(group.id, ruleIdx, { value: e.target.value })}
                                              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-indigo-500 w-full"
                                            />
                                          </div>
                                        );
                                      }

                                      if (rule.field === "status") {
                                        return (
                                          <select
                                            value={rule.value}
                                            onChange={(e) => handleUpdateRuleInGroup(group.id, ruleIdx, { value: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none"
                                          >
                                            <option value="active">Active</option>
                                            <option value="bounced">Bounced</option>
                                            <option value="unsubscribed">Unsubscribed</option>
                                          </select>
                                        );
                                      }

                                      if (rule.field === "course") {
                                        return (
                                          <SegmentCourseDropdown
                                            value={rule.value}
                                            onChange={(val) => handleUpdateRuleInGroup(group.id, ruleIdx, { value: val })}
                                          />
                                        );
                                      }

                                      if (rule.field === "certificate_issued") {
                                        return (
                                          <select
                                            value={rule.value || "sim"}
                                            onChange={(e) => handleUpdateRuleInGroup(group.id, ruleIdx, { value: e.target.value })}
                                            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none"
                                          >
                                            <option value="sim">Sim</option>
                                            <option value="não">Não</option>
                                          </select>
                                        );
                                      }

                                      return (
                                        <ValueAutocompleteInput
                                          value={rule.value}
                                          onChange={(val) => handleUpdateRuleInGroup(group.id, ruleIdx, { value: val })}
                                          field={rule.field}
                                          contacts={contacts}
                                          customFields={customFields}
                                        />
                                      );
                                    })()}

                                    {/* Remove Rule button */}
                                    {(group.rules.length > 1 || segmentGroups.length > 1) && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRuleFromGroup(group.id, ruleIdx)}
                                        className="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
                                        title="Excluir condição"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Group Add Condition Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          {group.rules.length < 4 ? (
                            <button
                              type="button"
                              onClick={() => handleAddRuleToGroup(group.id)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-650 hover:text-indigo-850 transition-colors cursor-pointer"
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                              <span>Adicionar Condição</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">Limite de 4 condições por grupo atingido.</span>
                          )}
                          <span className="text-[10px] text-slate-500 font-semibold">{group.rules.length}/4 condições</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Group Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  {segmentGroups.length < 3 ? (
                    <button
                      type="button"
                      onClick={handleAddGroup}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 text-xs font-bold text-indigo-600 hover:text-indigo-800 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Adicionar Novo Grupo de Condições</span>
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold">Limite de 3 grupos de pesquisa atingido.</span>
                  )}
                  <span className="text-xs text-slate-500 font-bold">{segmentGroups.length}/3 grupos</span>
                </div>
              </div>

              {/* Preview Count Container */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">Prévia de Qualificação</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Clique para simular a query SQL com índice GIN na base de leads.</p>
                </div>

                <div className="flex items-center gap-3">
                  {isPreviewLoading ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Contando leads...</span>
                    </div>
                  ) : previewCount !== null ? (
                    <div className="flex flex-col text-right">
                      <span className="text-lg font-black text-emerald-700">{previewCount.toLocaleString("pt-BR")} leads</span>
                      <span className="text-[10px] text-slate-500">qualificados para o segmento</span>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCalculatePreview}
                    disabled={isPreviewLoading}
                    className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Calcular Prévia
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSegmentModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Segmento "${segmentName}" salvo com sucesso (mock)!`);
                  setIsSegmentModalOpen(false);
                }}
                disabled={!segmentName}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                Salvar Segmento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADICIONAR NOVO CONTATO                         */}
      {/* ==================================================== */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-800">Adicionar Novo Contato</h3>
              <button
                onClick={() => setShowAddContactModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddContactError("");
                setAddContactExistsId(null);

                const emailClean = addContactEmail.trim().toLowerCase();
                const phoneClean = addContactPhone.replace(/\D/g, "");

                // Validate duplicacy
                const exists = contacts.find((c) => {
                  const cEmail = c.email.toLowerCase();
                  const cPhone = c.phone.replace(/\D/g, "");
                  return (
                    cEmail === emailClean ||
                    (phoneClean && cPhone && cPhone === phoneClean)
                  );
                });

                if (exists) {
                  setAddContactError("Este contato já existe na sua base de dados.");
                  setAddContactExistsId(exists.id);
                  return;
                }

                try {
                  const nameParts = addContactName.trim().split(" ");
                  const first_name = nameParts[0] || "";
                  const last_name = nameParts.slice(1).join(" ") || "";

                  const supabase = createClient();
                  // 1. Insert contact
                  const { data: newContactData, error: contactError } = await supabase
                    .from("contacts")
                    .insert({
                      org_id: "00000000-0000-0000-0000-000000000001",
                      first_name,
                      last_name,
                      email: emailClean,
                      phone: addContactPhone.trim() || null,
                      status: "active",
                      source: "Criado Manualmente"
                    })
                    .select()
                    .single();

                  if (contactError) throw contactError;

                  // 2. Associate "Novo" tag
                  // Tag ID: 00000000-0000-0000-0002-000000000001
                  await supabase
                    .from("contact_tags")
                    .insert({
                      contact_id: newContactData.id,
                      tag_id: "00000000-0000-0000-0002-000000000001"
                    });

                  // 3. Subscribe to "Lista Geral de Alunos"
                  // List ID: 00000000-0000-0000-0005-000000000001
                  await supabase
                    .from("list_subscriptions")
                    .insert({
                      contact_id: newContactData.id,
                      list_id: "00000000-0000-0000-0005-000000000001",
                      status: "subscribed"
                    });

                  // Update state
                  const newContact = {
                    id: newContactData.id,
                    first_name,
                    last_name,
                    email: emailClean,
                    phone: addContactPhone.trim() || "",
                    status: "active",
                    created_at: new Date().toISOString().split("T")[0],
                    tags: ["Novo"],
                    course: "Nenhum",
                    courseStatus: "",
                    total_spent: 0
                  };

                  setContacts([newContact, ...contacts]);
                  setShowAddContactModal(false);
                  alert("Contato adicionado com sucesso!");
                } catch (err: any) {
                  console.error(err);
                  setAddContactError("Erro ao salvar contato no banco de dados.");
                }
              }}
              className="space-y-4 pt-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Maria de Souza"
                  value={addContactName}
                  onChange={(e) => setAddContactName(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: anamaria@gmail.com"
                  value={addContactEmail}
                  onChange={(e) => setAddContactEmail(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Telefone / WhatsApp (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: (11) 99999-9999"
                  value={addContactPhone}
                  onChange={(e) => setAddContactPhone(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {addContactError && (
                <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 flex flex-col gap-2 animate-scaleIn">
                  <div className="flex gap-2 items-center text-xs font-bold text-red-700">
                    <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                    <span>{addContactError}</span>
                  </div>
                  {addContactExistsId && (
                    <Link
                      href={`/dashboard/contacts/${addContactExistsId}`}
                      onClick={() => setShowAddContactModal(false)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50/50 text-[10px] font-extrabold text-red-700 rounded-lg transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Visualizar Ficha do Contato</span>
                    </Link>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
                >
                  Criar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: IMPORTAR DE CSV                                */}
      {/* ==================================================== */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Fazer Upload de Contatos (CSV)</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Cole os dados delimitados para processar a base.</p>
              </div>
              <button
                onClick={() => setShowCsvModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Seletor de Delimitador</label>
                <select
                  value={csvDelimiter}
                  onChange={(e) => setCsvDelimiter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-850 cursor-pointer focus:outline-none focus:border-indigo-500"
                >
                  <option value=",">Vírgula ( , )</option>
                  <option value=";">Ponto e Vírgula ( ; )</option>
                  <option value="\t">Tabulação (Tab)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                  Cole os dados CSV (Primeira linha deve ser o cabeçalho)
                </label>
                <textarea
                  rows={6}
                  placeholder={`email,nome,telefone\njoana@gmail.com,Joana Silva,(11) 98888-8888\nroberto@outlook.com,Roberto Costa,`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[11px] font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-550 h-32"
                />
              </div>

              {/* CSV Preview */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setCsvPreviewList([]);
                    if (!csvText.trim()) {
                      alert("Insira os dados CSV primeiro.");
                      return;
                    }
                    const lines = csvText.trim().split("\n");
                    if (lines.length < 2) {
                      alert("O arquivo CSV precisa conter pelo menos um cabeçalho e uma linha de dados.");
                      return;
                    }

                    const delimiter = csvDelimiter === "\\t" ? "\t" : csvDelimiter;
                    const header = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
                    
                    const emailIdx = header.indexOf("email");
                    const nameIdx = header.indexOf("nome") !== -1 ? header.indexOf("nome") : header.indexOf("name");
                    const phoneIdx = header.indexOf("telefone") !== -1 ? header.indexOf("telefone") : header.indexOf("phone");

                    if (emailIdx === -1) {
                      alert("Não foi encontrada nenhuma coluna contendo 'email' no cabeçalho.");
                      return;
                    }

                    const parsed = [];
                    for (let i = 1; i < lines.length; i++) {
                      if (!lines[i].trim()) continue;
                      const cols = lines[i].split(delimiter).map(c => c.trim());
                      
                      const email = cols[emailIdx] || "";
                      const name = nameIdx !== -1 ? cols[nameIdx] || "" : "";
                      const phone = phoneIdx !== -1 ? cols[phoneIdx] || "" : "";

                      if (email) {
                        parsed.push({ email, name, phone });
                      }
                    }

                    setCsvPreviewList(parsed);
                  }}
                  className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Processar e Visualizar Prévia
                </button>

                {csvPreviewList.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-scaleIn bg-slate-50/50">
                    <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Prévia das Primeiras Linhas ({csvPreviewList.length} registros identificados)
                    </div>
                    <table className="w-full text-left text-[11px] border-collapse bg-white">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold">
                          <th className="p-2">E-mail</th>
                          <th className="p-2">Nome</th>
                          <th className="p-2">Telefone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {csvPreviewList.slice(0, 5).map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold text-slate-800">{p.email}</td>
                            <td className="p-2">{p.name || <span className="text-slate-400 italic">n/a</span>}</td>
                            <td className="p-2">{p.phone || <span className="text-slate-400 italic">n/a</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-150 flex justify-end gap-2 text-xs font-bold mt-4">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={csvPreviewList.length === 0}
                onClick={async () => {
                  let addedCount = 0;
                  let existsCount = 0;
                  
                  const contactsToInsert: any[] = [];
                  const newContactsForState: any[] = [];

                  csvPreviewList.forEach((p) => {
                    const emailClean = p.email.toLowerCase().trim();
                    const phoneClean = p.phone.replace(/\D/g, "");

                    const exists = contacts.find((c) => {
                      const cEmail = c.email.toLowerCase();
                      const cPhone = c.phone.replace(/\D/g, "");
                      return (
                        cEmail === emailClean ||
                        (phoneClean && cPhone && cPhone === phoneClean)
                      );
                    });

                    if (exists) {
                      existsCount++;
                    } else {
                      const nameParts = p.name.trim().split(" ");
                      const first_name = nameParts[0] || "";
                      const last_name = nameParts.slice(1).join(" ") || "";
                      const newId = window.crypto.randomUUID();
                      
                      contactsToInsert.push({
                        id: newId,
                        org_id: "00000000-0000-0000-0000-000000000001",
                        first_name,
                        last_name,
                        email: emailClean,
                        phone: p.phone.trim() || null,
                        status: "active",
                        source: "Importado via CSV"
                      });

                      newContactsForState.push({
                        id: newId,
                        first_name,
                        last_name,
                        email: emailClean,
                        phone: p.phone.trim() || "",
                        status: "active",
                        created_at: new Date().toISOString().split("T")[0],
                        tags: ["Novo"],
                        course: "Nenhum",
                        courseStatus: "",
                        total_spent: 0
                      });
                    }
                  });

                  try {
                    if (contactsToInsert.length > 0) {
                      const supabase = createClient();

                      // 1. Insert Contacts in batch
                      const { error: contactsErr } = await supabase
                        .from("contacts")
                        .insert(contactsToInsert);
                      if (contactsErr) throw contactsErr;

                      // 2. Associate "Novo" tag in batch
                      const tagRelations = contactsToInsert.map(c => ({
                        contact_id: c.id,
                        tag_id: "00000000-0000-0000-0002-000000000001"
                      }));
                      const { error: tagsErr } = await supabase
                        .from("contact_tags")
                        .insert(tagRelations);
                      if (tagsErr) throw tagsErr;

                      // 3. Subscribe to default list in batch
                      const listRelations = contactsToInsert.map(c => ({
                        contact_id: c.id,
                        list_id: "00000000-0000-0000-0005-000000000001",
                        status: "subscribed"
                      }));
                      const { error: listsErr } = await supabase
                        .from("list_subscriptions")
                        .insert(listRelations);
                      if (listsErr) throw listsErr;

                      addedCount = contactsToInsert.length;
                      setContacts([...newContactsForState, ...contacts]);
                    }

                    setShowCsvModal(false);
                    alert(`Importação concluída! ${addedCount} novos contatos adicionados. ${existsCount} já existiam na base e foram pulados.`);
                  } catch (err: any) {
                    console.error(err);
                    alert("Erro ao importar contatos no banco de dados.");
                  }
                }}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirmar Importação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADICIONAR / EDITAR LISTA                      */}
      {/* ==================================================== */}
      {showAddListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-850">
                {listModalMode === "create" ? "Adicione uma lista" : "Editar lista"}
              </h3>
              <button
                onClick={() => setShowAddListModal(false)}
                className="p-1 text-slate-400 hover:text-slate-750 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!listModalName.trim()) return;

                if (listModalMode === "create") {
                  const newList = {
                    id: `l-${Date.now()}`,
                    name: listModalName.trim(),
                    url: listModalUrl.trim() || "http://",
                    description: listModalDescription.trim(),
                    subscriberCount: 0
                  };
                  saveLists([...lists, newList]);
                  alert("Lista adicionada com sucesso!");
                } else {
                  const updated = lists.map((l) => {
                    if (l.id === editingListId) {
                      return {
                        ...l,
                        name: listModalName.trim(),
                        url: listModalUrl.trim(),
                        description: listModalDescription.trim()
                      };
                    }
                    return l;
                  });
                  saveLists(updated);
                  alert("Lista atualizada com sucesso!");
                }

                setShowAddListModal(false);
              }}
              className="p-6 space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-bold text-slate-705">Nome da Lista</label>
                <input
                  type="text"
                  required
                  placeholder="Exemplo: boletim informativo mensal, leads de vendas, etc."
                  value={listModalName}
                  onChange={(e) => setListModalName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-205 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705">Listar URL</label>
                <input
                  type="text"
                  placeholder="http://"
                  value={listModalUrl}
                  onChange={(e) => setListModalUrl(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-205 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-705">Listar descrição</label>
                <textarea
                  placeholder="Lembre seus contatos porque eles estão nessa lista. Isso poderá ser visto em emails enviados para esta lista ao usar a tag de personalização"
                  value={listModalDescription}
                  onChange={(e) => setListModalDescription(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-205 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 h-24 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold bg-slate-50/50 -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setShowAddListModal(false)}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-550 hover:text-slate-800 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-650 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all cursor-pointer"
                >
                  {listModalMode === "create" ? "Adicionar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mass Actions modals */}
      <AddTagModal
        isOpen={showMassAddTagModal}
        onClose={() => setShowMassAddTagModal(false)}
        onConfirm={handleMassAddTagConfirm}
        existingTags={allExistingTags}
      />

      <AddToListModal
        isOpen={showMassAddToListModal}
        onClose={() => setShowMassAddToListModal(false)}
        onConfirm={handleMassListActionConfirm}
        lists={lists}
        onOpenCreateListModal={() => {
          setListModalMode("create");
          setListModalName("");
          setListModalUrl("");
          setListModalDescription("");
          setShowAddListModal(true);
        }}
      />

      <CreateStaticSegmentModal
        isOpen={showCreateStaticSegmentModal}
        onClose={() => setShowCreateStaticSegmentModal(false)}
        onConfirm={handleCreateStaticSegmentConfirm}
        count={selectedContacts.length}
      />
    </div>
  );
}
