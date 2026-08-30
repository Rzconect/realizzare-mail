"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mockProfileData } from "../../contacts/[id]/page";
import {
  Mail,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Info,
  Clock,
  AlertTriangle,
  X,
  Upload,
  Monitor,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  Plus,
  PlusCircle,
  ChevronDown,
  Search,
  Zap,
  Loader2
} from "lucide-react";

interface ListSegment {
  id: string;
  name: string;
  count: number;
  description?: string;
  isSegment?: boolean;
  isStatic?: boolean;
}

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

interface SegmentGroup {
  id: string;
  logicalOperator: "and" | "or";
  rules: SegmentRule[];
}

const initialListsAndSegments: ListSegment[] = [
  { id: "list-1", name: "Leads", count: 0 },
  { id: "list-2", name: "Alunos", count: 0 },
  { id: "list-3", name: "Clientes", count: 0 },
  { id: "list-4", name: "Professores", count: 0 }
];

interface SearchableFieldDropdownProps {
  value: string;
  onChange: (value: string) => void;
  customFields: Array<{ name: string; tag: string; type: string }>;
}


function SimulatedInboxPreview({ subjectLine, preheader, senderName, renderMockTags }: { subjectLine: string, preheader: string, senderName: string, renderMockTags: (text: string) => string }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const mockEmails = [
    { sender: "Microsoft Azure", time: "10:45", subject: "Your monthly billing statement", pre: "Your invoice for the period of October is now a..." },
    { sender: "LinkedIn", time: "Ontem", subject: "Você tem novas visualizações", pre: "Veja quem visitou seu perfil profissional nas úl..." },
    { sender: "Slack Notifications", time: "Ontem", subject: "Resumo de mensagens", pre: "Você tem 12 mensagens não lidas em 3 canais..." }
  ];

  const actualSubject = renderMockTags(subjectLine) || "Assunto do e-mail...";
  const actualPreheader = renderMockTags(preheader) || "Pré-visualização do conteúdo de cabeçalho do e-mail...";
  
  const displaySender = senderName || "Realizzare Cursos";

  const displaySubject = device === "mobile" 
    ? (actualSubject.length > 35 ? actualSubject.substring(0, 35) + "..." : actualSubject)
    : (actualSubject.length > 60 ? actualSubject.substring(0, 60) + "..." : actualSubject);

  const displayPreheader = device === "mobile" 
    ? (actualPreheader.length > 40 ? actualPreheader.substring(0, 40) + "..." : actualPreheader)
    : (actualPreheader.length > 80 ? actualPreheader.substring(0, 80) + "..." : actualPreheader);

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden w-full mx-auto transition-all ${device === "desktop" ? "max-w-2xl" : "max-w-md"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Prévia da Caixa de Entrada</span>
        <div className="flex bg-slate-100 rounded-md p-0.5">
          <button 
            type="button"
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-sm flex items-center justify-center transition-colors ${device === "desktop" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-sm flex items-center justify-center transition-colors ${device === "mobile" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className={`flex justify-center transition-all bg-slate-50 overflow-hidden ${device === "mobile" ? "p-6" : ""}`}>
        
        {/* Device Wrapper */}
        <div style={{ zoom: device === "mobile" ? 0.85 : 1 }} className={`transition-all bg-white relative flex flex-col mx-auto ${
          device === "mobile" 
            ? "w-[375px] h-[667px] border-[12px] border-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-200" 
            : "w-full border-0"
        }`}>
          
          {/* Mobile Phone Hardware Details */}
          {device === "mobile" && (
            <>
              {/* Top Notch/Speaker */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-white rounded-b-xl z-20 flex justify-center items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-x border-slate-100">
                <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
              </div>
              
              {/* Bottom Home Button */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-slate-100 rounded-full bg-white z-20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-slate-200"></div>
              </div>
            </>
          )}

          {/* Screen Content Wrapper */}
          <div className={`flex flex-col flex-1 overflow-hidden relative ${device === "mobile" ? "bg-slate-50 border border-slate-200 rounded-[1.8rem] mb-14" : ""}`}>
            
            {/* Mobile Status Bar (Fake) */}
            {device === "mobile" && (
              <div className="h-6 w-full bg-slate-50 shrink-0 flex justify-end items-center px-4 gap-1.5 text-slate-400">
                <div className="w-3 h-2.5 rounded-sm border border-current"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                <span className="text-[9px] font-bold ml-1">12:30</span>
              </div>
            )}

            {/* Inbox Toolbar */}
            <div className={`px-4 py-2 bg-white flex justify-between items-center text-[10px] font-medium text-slate-400 border-b border-slate-100 shrink-0 ${device === "mobile" ? "rounded-t-[1.8rem]" : ""}`}>
              <span className="uppercase tracking-wider">Caixa de Entrada</span>
              <span>Filtro: Todos</span>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar pb-10">
              {/* Active Email */}
              <div className="relative border-l-4 border-indigo-600 bg-white p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 flex gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                  {displaySender[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-slate-800 text-sm pr-2 whitespace-normal break-words line-clamp-1">
                      {displaySender}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">Agora mesmo</span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs mb-0.5 whitespace-normal break-words line-clamp-2">
                    {displaySubject}
                  </h4>
                  <p className="text-[11px] text-slate-500 whitespace-normal break-words line-clamp-2">
                    {displayPreheader}
                  </p>
                </div>
              </div>

              {/* Mock Emails */}
              {mockEmails.map((email, idx) => (
                <div key={idx} className="relative p-4 flex gap-3 border-b border-slate-100 opacity-40 blur-[1.5px]">
                  <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0">
                    {email.sender[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-slate-700 text-sm truncate pr-2">{email.sender}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">{email.time}</span>
                    </div>
                    <h4 className="font-semibold text-slate-700 text-xs truncate mb-0.5">{email.subject}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{email.pre}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
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
        <div className="absolute left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-2 space-y-2 animate-fadeIn max-h-60 overflow-y-auto w-max max-w-[360px]">
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
        <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-md shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]">
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
        className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-indigo-550 w-full h-[34px] shadow-sm"
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 overflow-hidden max-h-[160px] overflow-y-auto divide-y divide-slate-100">
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
          className="bg-white border border-slate-200 text-slate-700 rounded-md py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
        >
          <option value="Campanha">Campanha</option>
          <option value="Fluxo de automação">Fluxo de automação</option>
          <option value="E-mail específico">E-mail específico</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs text-slate-700 shadow-2xs">
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
              className="mt-1.5 w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            />
          )}
        </div>
      </div>

      {/* Line 2: Timeframe selector */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={parsedVal.timeframeMode}
          onChange={(e) => updateEngagementState({ timeframeMode: e.target.value })}
          className="bg-white border border-slate-200 text-slate-700 rounded-md py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
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
              className="w-16 bg-white border border-slate-200 rounded-md py-1.5 px-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-center"
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
              className="bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs font-semibold text-slate-800 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase">e</span>
            <input
              type="date"
              value={parsedVal.endDate}
              onChange={(e) => updateEngagementState({ endDate: e.target.value })}
              className="bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Line 3: Frequency selector */}
      <div className="flex items-center gap-2">
        <select
          value={parsedVal.frequency}
          onChange={(e) => updateEngagementState({ frequency: e.target.value })}
          className="bg-white border border-slate-200 text-slate-700 rounded-md py-1.5 px-3 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
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

  if (c.course && c.course !== "Nenhum" && c.course !== "") {
    return {
      course: c.course,
      status: c.courseStatus || "Ativo",
      enrolledAt: c.created_at
    };
  }

  return {
    course: "Nenhum curso iniciado",
    status: "",
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

function getMatchingContacts(contacts: any[], groups: any[], globalOp: "and" | "or", customFields: any[]): any[] {
  if (!groups || groups.length === 0) return contacts;
  
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
  
  return matchedContacts;
}

function CreateCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(editId);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3

  // Wizard Fields State
  const [campaignName, setCampaignName] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [preheader, setPreheader] = useState("");
  const [senderName, setSenderName] = useState("Realizzare Cursos");
  const [senderEmail, setSenderEmail] = useState("contato@realizzarecursos.com.br");
  const [replyToEmail, setReplyToEmail] = useState("contato@realizzare.com");
  const [replyToIsCustom, setReplyToIsCustom] = useState(false);
  const [customReplyTo, setCustomReplyTo] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [verifiedDomains, setVerifiedDomains] = useState<string[]>(["realizzarecursos.com.br", "realizzare.com.br"]);
  const [isSending, setIsSending] = useState(false);

  // Lists list state to support dynamic list creation/selection
  const [listsList, setListsList] = useState<ListSegment[]>(initialListsAndSegments);

  // Search input queries
  const [includeSearchQuery, setIncludeSearchQuery] = useState("");
  const [excludeSearchQuery, setExcludeSearchQuery] = useState("");

  // Dropdown visibility
  const [showIncludeDropdown, setShowIncludeDropdown] = useState(false);
  const [showExcludeDropdown, setShowExcludeDropdown] = useState(false);

  // Tag inputs & fallbacks
  const [showSubjectTagDropdown, setShowSubjectTagDropdown] = useState(false);
  const [showPreheaderTagDropdown, setShowPreheaderTagDropdown] = useState(false);
  const [showSubjectTagDropdownS2, setShowSubjectTagDropdownS2] = useState(false);
  const [showPreheaderTagDropdownS2, setShowPreheaderTagDropdownS2] = useState(false);
  const [tagFallbacks, setTagFallbacks] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [showSelectContactsModal, setShowSelectContactsModal] = useState(false);
  const [showPreviewSegmentContactsModal, setShowPreviewSegmentContactsModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sName = localStorage.getItem("realizzare_sender_name");
      const sEmail = localStorage.getItem("realizzare_sender_email");
      const rEmail = localStorage.getItem("realizzare_reply_to_email");
      if (sName) setSenderName(sName);
      if (sEmail) setSenderEmail(sEmail);
      if (rEmail) setReplyToEmail(rEmail);

      const storedFields = localStorage.getItem("realizzare_custom_fields");
      if (storedFields) {
        try {
          setCustomFields(JSON.parse(storedFields));
        } catch (e) {
          console.error(e);
        }
      } else {
        const defaultCustomFields = [
          { id: "cf-1", name: "Área de Interesse", type: "text", tag: "area_de_interesse", objective: "Estudo ou segmento de interesse do aluno." },
          { id: "cf-2", name: "Nível Acadêmico", type: "text", tag: "nivel_academico", objective: "Escolaridade ou nível de formação atual do contato." },
          { id: "cf-3", name: "Origem Lead", type: "text", tag: "origem_lead", objective: "Canal ou link de entrada do lead na base." },
          { id: "cf-4", name: "Curso Pretendido", type: "text", tag: "curso_pretendido", objective: "Curso que o aluno pretende matricular-se." }
        ];
        setCustomFields(defaultCustomFields);
      }

      // Fetch real contacts from Supabase DB
      const loadRealContacts = async () => {
        try {
          const supabase = createClient();
          const { data: dbContacts } = await supabase
            .from("contacts")
            .select(`
              id,
              first_name,
              last_name,
              email,
              phone,
              status,
              created_at,
              contact_tags (
                tags (
                  name
                )
              )
            `)
            .order("created_at", { ascending: false });

          const { data: dbSubs } = await supabase
            .from("list_subscriptions")
            .select("contact_id, list_id")
            .eq("status", "subscribed");

          const subscribedContactIds = new Set((dbSubs || []).map((s: any) => s.contact_id));

          if (dbContacts && dbContacts.length > 0) {
            const mapped = dbContacts.map((c: any) => ({
              id: c.id,
              first_name: c.first_name || "",
              last_name: c.last_name || "",
              name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
              email: c.email || "",
              phone: c.phone || "",
              status: c.status || "active",
              is_subscribed: subscribedContactIds.has(c.id),
              list_ids: (dbSubs || []).filter((s: any) => s.contact_id === c.id).map((s: any) => s.list_id),
              created_at: c.created_at,
              tags: c.contact_tags?.map((ct: any) => ct.tags?.name).filter(Boolean) || []
            }));
            setContacts(mapped);
          } else {
            const storedContacts = localStorage.getItem("realizzare_mock_contacts");
            if (storedContacts) {
              try { setContacts(JSON.parse(storedContacts)); } catch (e) {}
            }
          }
        } catch (err) {
          console.error("Error loading contacts for campaign creation:", err);
        }
      };
      loadRealContacts();

      // Seed detailed profile data if missing
      Object.keys(mockProfileData).forEach((key) => {
        if (!localStorage.getItem(`realizzare_profile_${key}`)) {
          localStorage.setItem(`realizzare_profile_${key}`, JSON.stringify(mockProfileData[key]));
        }
      });

      // Sync lists and segments dynamically from DB & local storage
      const loadDynamicAudienceLists = async () => {
        const audienceMap = new Map<string, ListSegment>();
        initialListsAndSegments.forEach(item => audienceMap.set(item.id, item));

        try {
          const storedCustomLists = localStorage.getItem("realizzare_custom_lists");
          if (storedCustomLists) {
            const parsed = JSON.parse(storedCustomLists);
            parsed.forEach((l: any) => {
              if (l.name) {
                const itemKey = l.id || `list-${l.name}`;
                audienceMap.set(itemKey, {
                  id: itemKey,
                  name: l.name,
                  count: l.subscriberCount || l.count || 0,
                  description: l.description || "Lista de contatos",
                  isSegment: false,
                  isStatic: l.isStatic !== false
                });
              }
            });
          }

          const storedSegments = localStorage.getItem("realizzare_saved_segments");
          if (storedSegments) {
            const parsed = JSON.parse(storedSegments);
            parsed.forEach((s: any) => {
              if (s.name) {
                const itemKey = s.id || `seg-${s.name}`;
                audienceMap.set(itemKey, {
                  id: itemKey,
                  name: s.name,
                  count: s.count || s.subscriberCount || 0,
                  description: s.description || "Segmento de público",
                  isSegment: true,
                  isStatic: s.isStatic !== false
                });
              }
            });
          }
        } catch (e) {}

        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: dbLists } = await supabase
            .from("lists")
            .select("id, name, type, subscriber_count, description");
          
          if (dbLists && dbLists.length > 0) {
            dbLists.forEach((l: any) => {
              audienceMap.set(l.id, {
                id: l.id,
                name: l.name,
                count: l.subscriber_count || 0,
                description: l.description || (l.type === "segment" ? "Segmentação de público" : "Lista de transmissão"),
                isSegment: l.type === "segment",
                isStatic: true
              });
            });
          }
        } catch (e) {}

        setListsList(Array.from(audienceMap.values()));
      };

      loadDynamicAudienceLists();
    }
  }, []);

  // Preview options
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 Audience & Scheduling
  const [selectedIncludeLists, setSelectedIncludeLists] = useState<string[]>([]);
  const [selectedExcludeLists, setSelectedExcludeLists] = useState<string[]>([]);
  const [sendType, setSendType] = useState<"immediate" | "scheduled">("immediate");
  
  // Calcula a data e hora atual no fuso horário local para ser o padrão
  const [scheduledDate, setScheduledDate] = useState(() => {
    const now = new Date();
    return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  });
  const [scheduledTime, setScheduledTime] = useState(() => {
    const now = new Date();
    return String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  });
  
  const [timezoneMode, setTimezoneMode] = useState<"account" | "recipient_local">("account");
  const [lateTimezoneBehavior, setLateTimezoneBehavior] = useState<"send_immediately" | "send_next_day">("send_immediately");
  const [determineRecipientsAtSendTime, setDetermineRecipientsAtSendTime] = useState(false);
  const [smartSendingLocal, setSmartSendingLocal] = useState(true);

  // Segment creator modal states
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState("");
  const [segmentGroups, setSegmentGroups] = useState<SegmentGroup[]>([
    {
      id: "group-1",
      logicalOperator: "and",
      rules: [{ field: "status", operator: "eq", value: "active" }]
    }
  ]);
  const [globalOperator, setGlobalOperator] = useState<"and" | "or">("and");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);

  // Pre-populate fields if editing a draft & fetch real lists from Supabase
  useEffect(() => {
    const fetchRealLists = async () => {
      try {
        const supabase = createClient();
        const { data: realLists } = await supabase.from("lists").select("id, name, subscriber_count, type");
        const stored = localStorage.getItem("realizzare_lists");
        let localLists = [];
        if (stored) {
          try { localLists = JSON.parse(stored); } catch(e){}
        }

        let allLists: any[] = [];
        if (realLists && realLists.length > 0) {
          allLists = realLists.map((l: any) => ({ id: l.id, name: l.name, subscriber_count: l.subscriber_count, type: l.type }));
        }
        
        localLists.forEach((l: any) => {
          if (!allLists.some(al => al.name.toLowerCase() === l.name.toLowerCase())) {
            allLists.push({ id: l.id, name: l.name });
          }
        });

        const formatted = await Promise.all(allLists.map(async (l: any) => {
          const contactsStr = localStorage.getItem("realizzare_contacts");
            let count = l.subscriber_count || 0;
          if (contactsStr) {
            try {
              const contactsList = JSON.parse(contactsStr);
              contactsList.forEach((c: any) => {
                const profileStr = localStorage.getItem(`realizzare_profile_${c.id}`);
                if (profileStr) {
                  const profile = JSON.parse(profileStr);
                  const isSub = profile.lists?.some((pl: any) => pl.name.toLowerCase() === l.name.toLowerCase() && pl.status === "subscribed");
                  if (isSub) count++;
                }
              });
            } catch(e){}
          }
          return {
            id: l.id,
            name: l.name,
            count: count
          };
        }));
        setListsList(formatted);
      } catch (err) {
        console.error("Erro ao carregar listas do Supabase:", err);
      }
    };

    fetchRealLists();

    if (editId) {
      const loadDraft = async () => {
        try {
          const supabase = createClient();
          const { data: setRes } = await supabase.from("account_settings").select("settings").maybeSingle();
          const defaultName = setRes?.settings?.default_sender_name || "Realizzare Cursos";
          const defaultEmail = setRes?.settings?.default_sender_email || "contato@realizzarecursos.com.br";
          const defaultReply = setRes?.settings?.default_reply_to || "contato@realizzare.com";

          const { data: found } = await supabase.from("campaigns").select("*").eq("id", editId).single();
          if (found) {
            setCampaignName(found.name || "");
            setSubjectLine(found.subject || "");
            setPreheader(found.preview_text || found.previewText || "");
            setSenderName(found.from_name || found.fromName || defaultName);
            setSenderEmail(found.from_email || found.fromEmail || defaultEmail);
            setHtmlContent(found.html_content || found.htmlContent || "");
            
            if (found.target_list && found.target_list.includes("||IDS||")) {
              const idsPart = found.target_list.split("||IDS||")[1];
              if (idsPart) {
                setSelectedIncludeLists(idsPart.split(",").filter(Boolean));
              }
            }
            
            const replyTo = found.reply_to || found.replyTo || defaultReply;
            setReplyToIsCustom(true);
            setCustomReplyTo(replyTo);
            setReplyToEmail(replyTo);
            
            if (found.status === "scheduled" || found.status === "Agendado") {
              setSendType("scheduled");
              if (found.scheduled_at) {
                const parts = new Date(found.scheduled_at).toISOString().split("T");
                setScheduledDate(parts[0]);
                setScheduledTime(parts[1].substring(0, 5));
              }
            } else {
              setSendType("immediate");
            }
            return;
          }
        } catch (e) {
          console.error("Erro ao carregar rascunho do Supabase:", e);
        }
      };

      loadDraft();
    }
  }, [editId]);

  useEffect(() => {
    const loadSenderSettingsAndDomains = async () => {
      try {
        const supabase = createClient();
        
        // Load account default sender
        const { data: setRes } = await supabase.from("account_settings").select("settings").maybeSingle();
        const defaultName = setRes?.settings?.default_sender_name || "Realizzare Cursos";
        const defaultEmail = setRes?.settings?.default_sender_email || "contato@realizzarecursos.com.br";
        const defaultReply = setRes?.settings?.default_reply_to || "contato@realizzare.com";

        if (!editId) {
          setSenderName(defaultName);
          setSenderEmail(defaultEmail);
          setReplyToEmail(defaultReply);
          setReplyToIsCustom(true);
          setCustomReplyTo(defaultReply);
        }

        // Load verified sending domains from Supabase
        const { data: domData } = await supabase.from("sending_domains").select("domain, verification_status");
        if (domData && domData.length > 0) {
          const vList = domData
            .filter((d: any) => d.verification_status === "verified" || d.verification_status === "ok")
            .map((d: any) => d.domain.toLowerCase().trim());
          if (vList.length > 0) {
            setVerifiedDomains(vList);
          }
        }
      } catch (e) {}
    };
    loadSenderSettingsAndDomains();
  }, [editId]);

  // Domain Verification Checker
  const getDomainFromEmail = (email: string) => {
    const parts = email.split("@");
    return parts.length > 1 ? parts[1].toLowerCase().trim() : "";
  };

  const isDomainVerified = useMemo(() => {
    if (!senderEmail.trim()) return true;
    const dom = getDomainFromEmail(senderEmail);
    return verifiedDomains.includes(dom);
  }, [senderEmail, verifiedDomains]);

  // Extract dynamic tags (e.g. {{primeiro_nome}}) to let user write fallback options
  const getTagsInText = (text: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  };

  const activeTags = useMemo(() => {
    const list = new Set([...getTagsInText(subjectLine), ...getTagsInText(preheader)]);
    return Array.from(list);
  }, [subjectLine, preheader]);

  const insertTag = (field: "subject" | "preheader", tag: string) => {
    if (field === "subject") {
      setSubjectLine((prev) => prev + ` {{${tag}}}`);
      setShowSubjectTagDropdown(false);
      setShowSubjectTagDropdownS2(false);
    } else {
      setPreheader((prev) => prev + ` {{${tag}}}`);
      setShowPreheaderTagDropdown(false);
      setShowPreheaderTagDropdownS2(false);
    }
  };

  const renderMockTags = (text: string) => {
    let rendered = text;
    rendered = rendered.replace(/\{\{primeiro_nome\}\}/g, "João");
    rendered = rendered.replace(/\{\{curso_mais_recente\}\}/g, "Desenvolvimento Web Fullstack");
    rendered = rendered.replace(/\{\{cidade\}\}/g, "São Paulo");
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (_, tag) => {
      return tagFallbacks[tag] || `[${tag}]`;
    });
    return rendered;
  };

  // Upload HTML file helper
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtmlContent(content);
    };
    reader.readAsText(file);
  };

  // Check if template contains unsubscribe code/links
  const hasUnsubscribeLink = useMemo(() => {
    if (!htmlContent.trim()) return true; // Don't show blocking message if empty
    const lower = htmlContent.toLowerCase();
    return (
      lower.includes("unsubscribe") ||
      lower.includes("cancelar") ||
      lower.includes("{{unsubscribe_url}}")
    );
  }, [htmlContent]);

  const appendUnsubscribeFooter = () => {
    const footerHtml = `
<!-- Rodapé Obrigatório de Descadastro e Preferências -->
<div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-family: sans-serif; font-size: 11px; color: #64748b; text-align: center;">
  <p>Realizzare Cursos • Plataforma de Ensino a Distância</p>
  <p style="margin-top: 8px;">
    <a href="/preferences" style="color: #4f46e5; text-decoration: underline; margin-right: 10px; font-weight: bold;">Gerenciar Preferências</a> |
    <a href="/unsubscribe" style="color: #4f46e5; text-decoration: underline; margin-left: 10px; font-weight: bold;">Cancelar Inscrição</a>
  </p>
</div>
`;
    setHtmlContent((prev) => prev.trim() + "\n" + footerHtml);
  };

  // Step 3 dynamic calculation
  const audienceEstimateCount = useMemo(() => {
    let count = 0;
    selectedIncludeLists.forEach((listId) => {
      const match = listsList.find((l) => l.id === listId);
      if (match) count += match.count;
    });
    selectedExcludeLists.forEach((listId) => {
      const match = listsList.find((l) => l.id === listId);
      if (match) count = Math.max(0, count - Math.round(match.count * 0.85)); // Simula sobreposição
    });
    return count;
  }, [selectedIncludeLists, selectedExcludeLists, listsList]);

  // Step 1 check button validation
  const isStep1Valid = useMemo(() => {
    return (
      campaignName.trim().length > 0 &&
      subjectLine.trim().length > 0 &&
      preheader.trim().length > 0 &&
      senderName.trim().length > 0 &&
      senderEmail.trim().length > 0 &&
      isDomainVerified
    );
  }, [campaignName, subjectLine, preheader, senderName, senderEmail, isDomainVerified]);

  // Step 2 check button validation
  const isStep2Valid = useMemo(() => {
    return htmlContent.trim().length > 0 && hasUnsubscribeLink;
  }, [htmlContent, hasUnsubscribeLink]);

  const syncCampaignToEmailLibrary = (name: string, subject: string, previewText: string, html: string, status: "Rascunho" | "Ativo") => {
    if (typeof window === "undefined") return;

    try {
      const storedFolders = localStorage.getItem("realizzare_email_folders");
      let folders = storedFolders ? JSON.parse(storedFolders) : [
        { id: "folder-boas-vindas", name: "Boas-vindas", type: "flow" },
        { id: "folder-carrinho", name: "Recuperação de Carrinho", type: "flow" },
        { id: "folder-nutricao", name: "Nutrição de Leads", type: "flow" },
        { id: "folder-pontual", name: "Campanhas Pontuais / Rascunhos", type: "pontual" }
      ];

      if (!folders.some((f: any) => f.id === "folder-pontual")) {
        folders.push({ id: "folder-pontual", name: "Campanhas Pontuais / Rascunhos", type: "pontual" });
        localStorage.setItem("realizzare_email_folders", JSON.stringify(folders));
      }

      const storedTemplates = localStorage.getItem("realizzare_email_templates");
      let templates = storedTemplates ? JSON.parse(storedTemplates) : [];

      const existingIdx = templates.findIndex(
        (t: any) => t.folderId === "folder-pontual" && t.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (existingIdx >= 0) {
        templates[existingIdx] = {
          ...templates[existingIdx],
          subject: subject || templates[existingIdx].subject,
          previewText: previewText || templates[existingIdx].previewText,
          htmlContent: html || templates[existingIdx].htmlContent,
          status: status,
          updatedAt: new Date().toLocaleDateString("pt-BR")
        };
      } else {
        templates.unshift({
          id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: name.trim() || "Campanha Pontual",
          subject: subject || "Assunto do E-mail",
          previewText: previewText || "",
          htmlContent: html || "<div></div>",
          folderId: "folder-pontual",
          folderName: "Campanhas Pontuais / Rascunhos",
          status: status,
          updatedAt: new Date().toLocaleDateString("pt-BR"),
          metrics: { sentCount: 0, openCount: 0, openRate: 0, clickCount: 0, clickRate: 0, conversionCount: 0, conversionRevenue: 0.0 }
        });
      }

      localStorage.setItem("realizzare_email_templates", JSON.stringify(templates));
    } catch (e) {
      console.error("Erro ao sincronizar template com biblioteca de e-mails:", e);
    }
  };

  const saveDraftToDatabase = async (silent = false) => {
    if (isSavingDraft) return;
    try {
      setIsSavingDraft(true);
      const campaignNameVal = campaignName.trim() || "Rascunho de Campanha";
      
      const listNames = selectedIncludeLists
        .map((id) => listsList.find((l) => l.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      
      const targetListStr = (listNames || "Nenhuma lista selecionada") + "||IDS||" + selectedIncludeLists.join(",");

      const campaignData = {
        org_id: "00000000-0000-0000-0000-000000000001",
        name: campaignNameVal,
        subject: subjectLine,
        preview_text: preheader,
        from_name: senderName,
        from_email: senderEmail,
        reply_to: replyToIsCustom ? customReplyTo : replyToEmail,
        status: "draft",
        html_content: htmlContent,
        target_list: targetListStr,
        sent_count: 0
      };

      const res = await fetch("/api/campaigns/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId: currentDraftId, campaignData })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Erro ao salvar rascunho");

      if (resData.id && !currentDraftId) {
        setCurrentDraftId(resData.id);
        window.history.replaceState(null, "", `/dashboard/campaigns/create?edit=${resData.id}`);
      }

      syncCampaignToEmailLibrary(campaignNameVal, subjectLine, preheader, htmlContent, "Rascunho");

      if (!silent) {
        alert("Rascunho salvo com sucesso!");
      }
    } catch (e: any) {
      console.error(e);
      if (!silent) alert(`Erro ao salvar rascunho: ${e.message || e}`);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveDraft = async () => {
    await saveDraftToDatabase(false);
  };

  const handleConfirmWizard = async () => {
    const listNames = selectedIncludeLists
      .map((id) => listsList.find((l) => l.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    setIsSending(true);
    try {
      // Extract target emails if specific contacts or lists were selected
      const targetEmailsList: string[] = [];
      selectedIncludeLists.forEach((id) => {
        const item = listsList.find((l) => l.id === id);
        if (item) {
          if (item.name.includes("(") && item.name.includes("@")) {
            const match = item.name.match(/\(([^)]+)\)/);
            if (match && match[1] && match[1].includes("@")) {
              targetEmailsList.push(match[1].trim());
            }
          } else if (item.name.includes("@")) {
            targetEmailsList.push(item.name.trim());
          }
        }
      });

      // If specific list names are selected (e.g. "Clientes", "Leads"), resolve contacts from Supabase
      if (targetEmailsList.length === 0 && selectedIncludeLists.length > 0) {
        const selectedNames = selectedIncludeLists
          .map((id) => listsList.find((l) => l.id === id)?.name)
          .filter(Boolean);

        const isGeneral = selectedNames.some((n: any) => 
          n.toLowerCase().includes("geral") || n.toLowerCase().includes("todos")
        );

        if (!isGeneral) {
          try {
            const supabase = createClient();
            const { data: dbLists } = await supabase.from("lists").select("id, name, subscriber_count, type");
            const matchedIds = dbLists
              ?.filter((l: any) => selectedNames.some((sn: any) => sn.toLowerCase() === l.name.toLowerCase()))
              .map((l: any) => l.id) || [];

            if (matchedIds.length > 0) {
              const { data: subs } = await supabase
                .from("list_subscriptions")
                .select("contacts(email, status)")
                .in("list_id", matchedIds)
                .eq("status", "subscribed");

              if (subs && subs.length > 0) {
                subs.forEach((s: any) => {
                  if (s.contacts?.status === "active" && s.contacts?.email) {
                    targetEmailsList.push(s.contacts.email);
                  }
                });
              }
            }
          } catch (e) {
            console.warn("Could not query list subscribers for dispatch:", e);
          }
        }
      }

      const initialStatus = sendType === "immediate" ? "Enviando" : "scheduled";
      
      let scheduledAt: string | null = null;
      if (sendType === "immediate") {
        scheduledAt = new Date().toISOString();
      } else {
        const localDate = new Date(`${scheduledDate}T${scheduledTime}:00`);
        scheduledAt = localDate.toISOString();
      }

      const targetListStr = (listNames || "Nenhuma lista selecionada") + "||IDS||" + selectedIncludeLists.join(",");

      const campaignData = {
        org_id: "00000000-0000-0000-0000-000000000001",
        name: campaignName,
        subject: subjectLine,
        preview_text: preheader,
        from_name: senderName,
        from_email: senderEmail,
        reply_to: replyToIsCustom ? customReplyTo : replyToEmail,
        status: initialStatus,
        target_list: targetListStr,
        send_type: sendType,
        scheduled_at: sendType === "scheduled" ? scheduledAt : null,
        sent_at: sendType === "immediate" ? scheduledAt : null,
        html_content: htmlContent,
        sent_count: sendType === "immediate" ? (targetEmailsList.length || audienceEstimateCount || 0) : 0
      };

      const saveRes = await fetch("/api/campaigns/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editId, campaignData })
      });

      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveJson.error || "Erro ao salvar dados da campanha");

      const insertedId = saveJson.id || editId;

      // Auto-sync into "Campanhas Pontuais / Rascunhos" folder in E-mails library
      syncCampaignToEmailLibrary(campaignName, subjectLine, preheader, htmlContent, "Ativo");

      // Close confirm modal immediately to prevent double clicks
      setShowConfirmSendModal(false);

      if (sendType === "immediate" && insertedId) {
        // Asynchronous background dispatch - non-blocking for UI
        fetch("/api/campaigns/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaignId: insertedId,
            targetEmails: targetEmailsList.length > 0 ? targetEmailsList : undefined
          })
        }).catch(dispatchErr => {
          console.error("Background email dispatch notice:", dispatchErr);
        });

        // Instant redirect back to campaigns list
        router.push("/dashboard/campaigns");
      } else {
        alert("Campanha agendada com sucesso!");
        router.push("/dashboard/campaigns");
      }
    } catch (err: any) {
      console.error(err);
      alert(`Erro ao salvar campanha: ${err.message || err}`);
    } finally {
      setIsSending(false);
    }
  };

  // SEGMENT CREATOR ACTIONS (Matching contacts page rules)
  const handleAddSegmentGroup = () => {
    if (segmentGroups.length >= 3) return;
    setSegmentGroups((prev) => [
      ...prev,
      {
        id: `group-${Date.now()}`,
        logicalOperator: "and",
        rules: [{ field: "status", operator: "eq", value: "active" }]
      }
    ]);
  };

  const handleRemoveSegmentGroup = (groupId: string) => {
    setSegmentGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleAddRuleToGroup = (groupId: string) => {
    setSegmentGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          if (g.rules.length >= 4) return g;
          return {
            ...g,
            rules: [...g.rules, { field: "email", operator: "eq", value: "" }]
          };
        }
        return g;
      })
    );
  };

  const handleRemoveRuleFromGroup = (groupId: string, ruleIdx: number) => {
    setSegmentGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: g.rules.filter((_, idx) => idx !== ruleIdx)
          };
        }
        return g;
      })
    );
  };

  const handleUpdateRuleInGroup = (groupId: string, ruleIdx: number, updates: Partial<SegmentRule>) => {
    setSegmentGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: g.rules.map((r, idx) => {
              if (idx === ruleIdx) {
                const next = { ...r, ...updates };
                if (updates.field && updates.field !== "status" && r.value === "active") {
                  next.value = "";
                }
                if (updates.field === "status" && !next.value) {
                  next.value = "active";
                }
                return next;
              }
              return r;
            })
          };
        }
        return g;
      })
    );
  };

  const handleUpdateGroupOperator = (groupId: string, operator: "and" | "or") => {
    setSegmentGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, logicalOperator: operator } : g))
    );
  };

  const handleCalculatePreview = () => {
    setIsPreviewLoading(true);
    setPreviewCount(null);
    setTimeout(() => {
      const count = getMatchingContacts(contacts, segmentGroups, globalOperator, customFields).length;
      setPreviewCount(count);
      setIsPreviewLoading(false);
    }, 800);
  };

  const handleSaveSegment = async () => {
    if (!newSegmentName.trim()) return;

    const matchedContacts = getMatchingContacts(contacts, segmentGroups, globalOperator, customFields);

    setIsSavingDraft(true); // Reusing this loading state to prevent double clicks
    try {
      const supabase = createClient();
      
      // 1. Create a real list in the database for this segment
      const { data: newList, error: listErr } = await supabase.from("lists").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        name: newSegmentName,
        description: "Segmentação dinâmica (salva estaticamente)",
        type: "segment"
      }).select("id").single();

      if (listErr) throw listErr;

      // 2. Insert matched contacts into list_subscriptions
      if (matchedContacts.length > 0) {
        const subsPayload = matchedContacts.map((mc: any) => ({
          list_id: newList.id,
          contact_id: mc.id,
          status: "subscribed"
        }));
        
        const { error: subsErr } = await supabase.from("list_subscriptions").insert(subsPayload);
        if (subsErr) console.warn("Failed to attach contacts to segment list:", subsErr);
      }

      const newId = newList.id;
      const newCount = matchedContacts.length;
      
      // Add new segment dynamically to selection lists
      setListsList((prev) => [
        ...prev,
        { id: newId, name: newSegmentName, count: newCount }
      ]);
      
      // Auto-select in inclusion lists
      setSelectedIncludeLists((prev) => [...prev, newId]);
      
      // Reset states and close
      setShowSegmentModal(false);
      setNewSegmentName("");
      setSegmentGroups([
        {
          id: "group-1",
          logicalOperator: "and",
          rules: [{ field: "email", operator: "eq", value: "" }]
        }
      ]);
      setGlobalOperator("and");
      setPreviewCount(null);
      alert(`Segmento "${newSegmentName}" criado e salvo com sucesso!`);
    } catch (err) {
      console.error("Error saving segment:", err);
      alert("Erro ao salvar a segmentação no banco de dados.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Filter options for inclusion
  const filteredIncludeOptions = useMemo(() => {
    return listsList.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(includeSearchQuery.toLowerCase());
      const notExcluded = !selectedExcludeLists.includes(l.id);
      return matchSearch && notExcluded;
    });
  }, [listsList, includeSearchQuery, selectedExcludeLists]);

  // Filter options for exclusion
  const filteredExcludeOptions = useMemo(() => {
    return listsList.filter((l) => {
      const matchSearch = l.name.toLowerCase().includes(excludeSearchQuery.toLowerCase());
      const notIncluded = !selectedIncludeLists.includes(l.id);
      return matchSearch && notIncluded;
    });
  }, [listsList, excludeSearchQuery, selectedIncludeLists]);

  return (
    <div className="flex flex-col min-h-[calc(105vh-150px)] font-sans text-slate-800 -mx-4 md:-mx-8 -my-6 md:-my-8 bg-slate-50 overflow-hidden relative">
      
      {/* 1. Header / Steps Indicator */}
      <div className="border-b border-slate-200 bg-white py-4 px-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 shadow-sm">
        {/* Title */}
        <div className="min-w-0 xl:w-[30%]">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block truncate">Nova Campanha</span>
          <h2 className="text-xl font-black text-slate-900 truncate">{campaignName || "Nova Campanha Sem Título"}</h2>
        </div>

        {/* Progress Stepper (Center) */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold select-none xl:flex-1">
          {[
            { step: 1, label: "Conteúdo e Remetente" },
            { step: 2, label: "Design do E-mail" },
            { step: 3, label: "Público e Agendamento" }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                if (wizardStep !== s.step) {
                  saveDraftToDatabase(true).then(() => setWizardStep(s.step));
                }
              }}
              className={`flex items-center gap-2 transition-all pb-1 border-b-2 ${
                wizardStep === s.step
                  ? "border-indigo-655 text-indigo-650 font-black scale-105"
                  : "border-indigo-400 text-indigo-500 cursor-pointer hover:border-indigo-655 hover:text-indigo-650"
              }`}
            >
              <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${
                wizardStep === s.step ? "bg-indigo-600 text-white" : s.step < wizardStep ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-400"
              }`}>
                {s.step}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center xl:justify-end gap-2 xl:w-[30%]">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-70 disabled:cursor-wait"
          >
            {isSavingDraft ? "Salvando..." : "Salvar Rascunho"}
          </button>
          {wizardStep === 1 ? (
            <Link
              href="/dashboard/campaigns"
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-md text-xs font-bold transition-all"
            >
              Voltar
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setWizardStep((s) => s - 1)}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-md text-xs font-bold transition-all cursor-pointer"
            >
              Voltar
            </button>
          )}
          
          {wizardStep < 3 ? (
            <button
              type="button"
              disabled={wizardStep === 1 ? !isStep1Valid : !isStep2Valid}
              onClick={() => setWizardStep((s) => s + 1)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-md text-xs font-bold shadow-md disabled:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmSendModal(true)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              {sendType === "immediate" ? "Enviar Agora" : "Agendar"}
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* ========================================== */}
        {/* STEP 1: CONTEÚDO E REMETENTE               */}
        {/* ========================================== */}
        {wizardStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-6">
              
              {/* Nome Interno */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Campanha <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha Teste 01"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                />
                <span className="text-[10px] text-slate-500 block">Uso interno de relatórios apenas. O lead não verá este texto.</span>
              </div>

              {/* Assunto */}
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto do E-mail <span className="text-red-500">*</span></label>
  <span className="text-[10px] font-semibold text-slate-400">
    <span className={subjectLine.length > 60 ? "text-orange-500" : ""}>{subjectLine.length}</span> / 60 (Desktop) / 35 (Mobile)
  </span>
</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ex: {{primeiro_nome}}, confira seu desconto exclusivo!"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubjectTagDropdown(!showSubjectTagDropdown)}
                    className="px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-202 rounded-md text-xs font-bold text-slate-655 flex items-center justify-center cursor-pointer"
                    title="Inserir tag dinâmica"
                  >
                    {"{ }"}
                  </button>
                </div>

                {showSubjectTagDropdown && (
                  <div className="absolute right-0 mt-1 z-30 w-56 bg-white border border-slate-202 rounded-md shadow-xl p-2 space-y-1 animate-fadeIn">
                    <span className="text-[9px] font-black uppercase text-slate-400 px-2 block py-1">Atributos do Lead</span>
                    {[
                      { tag: "primeiro_nome", label: "Primeiro Nome" },
                      { tag: "curso_mais_recente", label: "Curso Mais Recente" },
                      { tag: "cidade", label: "Cidade" }
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag("subject", t.tag)}
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                      >
                        {t.label} ({"{{" + t.tag + "}}"})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preheader */}
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pré-cabeçalho <span className="text-red-500">*</span></label>
  <span className="text-[10px] font-semibold text-slate-400">
    <span className={preheader.length > 80 ? "text-orange-500" : ""}>{preheader.length}</span> / 80 (Desktop) / 40 (Mobile)
  </span>
</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Texto de visualização rápida na caixa de entrada..."
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPreheaderTagDropdown(!showPreheaderTagDropdown)}
                    className="px-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-202 rounded-md text-xs font-bold text-slate-655 flex items-center justify-center cursor-pointer"
                    title="Inserir tag dinâmica"
                  >
                    {"{ }"}
                  </button>
                </div>

                {showPreheaderTagDropdown && (
                  <div className="absolute right-0 mt-1 z-30 w-56 bg-white border border-slate-202 rounded-md shadow-xl p-2 space-y-1 animate-fadeIn">
                    <span className="text-[9px] font-black uppercase text-slate-400 px-2 block py-1">Atributos do Lead</span>
                    {[
                      { tag: "primeiro_nome", label: "Primeiro Nome" },
                      { tag: "curso_mais_recente", label: "Curso Mais Recente" },
                      { tag: "cidade", label: "Cidade" }
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag("preheader", t.tag)}
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                      >
                        {t.label} ({"{{" + t.tag + "}}"})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fallbacks Input Block */}
              {activeTags.length > 0 && (
                <div className="bg-indigo-50/30 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-indigo-650" />
                    Definir Textos Alternativos (Fallbacks)
                  </span>
                  <div className="space-y-2.5">
                    {activeTags.map((tag) => (
                      <div key={tag} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <span className="text-xs font-mono font-bold text-indigo-900 col-span-1">{"{{" + tag + "}}"}</span>
                        <input
                          type="text"
                          placeholder={`Ex: ${tag === "primeiro_nome" ? "aluno(a)" : tag === "curso_mais_recente" ? "nossos cursos" : "sua região"}`}
                          value={tagFallbacks[tag] || ""}
                          onChange={(e) => setTagFallbacks(prev => ({ ...prev, [tag]: e.target.value }))}
                          className="sm:col-span-2 bg-white border border-indigo-150 rounded-lg py-1.5 px-3 text-xs text-slate-805 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sender info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Remetente <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail do Remetente <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className={`w-full bg-slate-50 border rounded-md py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none ${
                      isDomainVerified ? "border-slate-202" : "border-amber-300 bg-amber-50/10 focus:border-amber-500"
                    }`}
                  />
                </div>
              </div>

              {/* Domain Warning */}
              {!isDomainVerified && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-3.5 flex gap-2 text-xs animate-fadeIn">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <span>Este domínio não está verificado nas suas configurações. E-mails enviados por domínios não autenticados têm maior risco de cair em spam. </span>
                    <Link href="/dashboard/settings" target="_blank" className="font-bold underline hover:text-amber-955">
                      Verificar domínio agora
                    </Link>
                  </div>
                </div>
              )}

              {/* Reply To fields */}
              <div className="space-y-3.5 border-t border-slate-100 pt-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={replyToIsCustom}
                    onChange={(e) => setReplyToIsCustom(e.target.checked)}
                    className="rounded border-slate-350 text-indigo-650 h-4 w-4"
                  />
                  <span>Usar um e-mail de resposta diferente para esta campanha</span>
                </label>

                {replyToIsCustom && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Responder Para (Reply-To) Customizado</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: suporte@meudominio.com"
                      value={customReplyTo}
                      onChange={(e) => setCustomReplyTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-sm text-slate-805 focus:outline-none"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Simulated Inbox Preview */}
            <div className="lg:col-span-5 flex justify-center items-start">
              <SimulatedInboxPreview 
                subjectLine={subjectLine} 
                preheader={preheader} 
                senderName={senderName} 
                renderMockTags={renderMockTags} 
              />
            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* STEP 2: TEMPLATE E PREVIEW DO E-MAIL        */}
        {/* ========================================== */}
        {wizardStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Left column: HTML template editor and Subject/Preheader inputs */}
            <div className="lg:col-span-6 bg-white border border-slate-202 rounded-3xl p-6 shadow-sm space-y-5">
              
              <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">Conteúdo do Envio</h3>

              {/* Subject modification in Step 2 */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto do E-mail</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubjectTagDropdownS2(!showSubjectTagDropdownS2)}
                    className="px-3 bg-slate-105 hover:bg-slate-200 border border-slate-202 rounded-md text-xs font-bold text-slate-655 flex items-center justify-center cursor-pointer"
                  >
                    {"{ }"}
                  </button>
                </div>

                {showSubjectTagDropdownS2 && (
                  <div className="absolute right-0 mt-1 z-30 w-56 bg-white border border-slate-202 rounded-md shadow-xl p-2 space-y-1 animate-fadeIn">
                    <span className="text-[9px] font-black uppercase text-slate-400 px-2 block py-1">Atributos do Lead</span>
                    {[
                      { tag: "primeiro_nome", label: "Primeiro Nome" },
                      { tag: "curso_mais_recente", label: "Curso Mais Recente" },
                      { tag: "cidade", label: "Cidade" }
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag("subject", t.tag)}
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-707 font-semibold"
                      >
                        {t.label} ({"{{" + t.tag + "}}"})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preheader modification in Step 2 */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pré-cabeçalho</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPreheaderTagDropdownS2(!showPreheaderTagDropdownS2)}
                    className="px-3 bg-slate-105 hover:bg-slate-200 border border-slate-202 rounded-md text-xs font-bold text-slate-655 flex items-center justify-center cursor-pointer"
                  >
                    {"{ }"}
                  </button>
                </div>

                {showPreheaderTagDropdownS2 && (
                  <div className="absolute right-0 mt-1 z-30 w-56 bg-white border border-slate-202 rounded-md shadow-xl p-2 space-y-1 animate-fadeIn">
                    <span className="text-[9px] font-black uppercase text-slate-400 px-2 block py-1">Atributos do Lead</span>
                    {[
                      { tag: "primeiro_nome", label: "Primeiro Nome" },
                      { tag: "curso_mais_recente", label: "Curso Mais Recente" },
                      { tag: "cidade", label: "Cidade" }
                    ].map((t) => (
                      <button
                        key={t.tag}
                        type="button"
                        onClick={() => insertTag("preheader", t.tag)}
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg hover:bg-slate-50 text-slate-707 font-semibold"
                      >
                        {t.label} ({"{{" + t.tag + "}}"})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* HTML Editor area */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Código HTML do E-mail</label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Cole ou importe seu arquivo de template.</span>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-202 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Importar arquivo</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".html"
                      onChange={handleHtmlFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <textarea
                  rows={14}
                  placeholder="Insira seu código HTML completo aqui..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Unsubscribe alert */}
              {!hasUnsubscribeLink && (
                <div className="bg-red-50 border border-red-150 text-red-900 rounded-md p-4 space-y-2 text-xs animate-fadeIn">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Seu template não contém um link de descadastro.</strong> Isso é obrigatório para envio de e-mail marketing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={appendUnsubscribeFooter}
                    className="px-3.5 py-1.5 bg-red-605 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
                  >
                    Adicionar automaticamente
                  </button>
                </div>
              )}
            </div>

            {/* Right column: HTML live preview framed container (Robust fixed height preview frames) */}
            <div className="lg:col-span-6 bg-slate-100/50 border border-slate-202 rounded-3xl p-6 flex flex-col items-center min-h-[600px] justify-center">
              
              {/* Device selector */}
              <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3 mb-4 select-none shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Preview de Renderização</span>
                <div className="flex items-center bg-white border border-slate-202 rounded-md p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      previewDevice === "desktop" ? "bg-indigo-50 text-indigo-755 font-bold" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      previewDevice === "mobile" ? "bg-indigo-50 text-indigo-755 font-bold" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Rendering Viewport */}
              {previewDevice === "desktop" ? (
                /* Premium Browser Window Silhouette with Fixed Height to Prevent Collapsing */
                <div className="w-full max-w-2xl h-[540px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fadeIn shrink-0">
                  {/* Browser top title bar */}
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 select-none shrink-0">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-0.5 text-[10px] text-slate-400 select-none flex-1 max-w-xs mx-auto text-center truncate">
                      https://mail.realizzare.com.br/preview
                    </div>
                  </div>
                  
                  {/* HTML Iframe - Fills browser screen */}
                  <div className="flex-1 relative bg-white min-h-0">
                    {htmlContent ? (
                      <iframe
                        title="live-email-desktop"
                        srcDoc={htmlContent}
                        className="w-full h-full border-none absolute inset-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Mail className="h-8 w-8 text-slate-300" />
                        <span className="text-xs font-semibold">Aguardando código HTML...</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Smartphone Device Silhouette with FIXED height to resolve collapsed screen height bug */
                <div style={{ zoom: 0.85 }} className="w-[375px] h-[667px] border-[12px] border-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-200 bg-white relative flex flex-col mx-auto shrink-0 animate-fadeIn select-none">
                  
                  {/* Top Notch/Speaker */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-white rounded-b-xl z-20 flex justify-center items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-x border-slate-100">
                    <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                  </div>
                  
                  {/* Bottom Home Button */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-slate-100 rounded-full bg-white z-20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border border-slate-200"></div>
                  </div>

                  {/* Screen Content Wrapper */}
                  <div className="flex flex-col flex-1 overflow-hidden relative bg-slate-50 border border-slate-200 rounded-[1.8rem] mb-14">
                    
                    {/* Mobile Status Bar (Fake) */}
                    <div className="h-6 w-full bg-slate-50 shrink-0 flex justify-end items-center px-4 gap-1.5 text-slate-400">
                      <div className="w-3 h-2.5 rounded-sm border border-current"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      <span className="text-[9px] font-bold ml-1">10:32</span>
                    </div>

                    

                    {/* HTML content iframe - takes exactly the remaining phone height */}
                    <div className="flex-1 relative bg-white min-h-0">
                      {htmlContent ? (
                        <iframe
                          title="live-email-mobile"
                          srcDoc={htmlContent}
                          className="w-full h-full border-none absolute inset-0"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Mail className="h-8 w-8 text-slate-300" />
                          <span className="text-[10px] font-semibold">Aguardando HTML...</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STEP 3: PÚBLICO E AGENDAMENTO              */}
        {/* ========================================== */}
        {wizardStep === 3 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            
            {/* CARD 1: PÚBLICO - Integrated Search & Segment Builder Option */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-800 pb-2 border-b border-slate-100">1. Escolha o Público</h3>
              
              <div className="space-y-4">
                
                {/* Enviar Para Search & Select */}
                {/* Atalhos de Segmentação Pronta (Recomendações Inteligentes) */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-indigo-600" />
                      <span>Recomendações Prontas de Segmentação</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Aplicação com 1 clique</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Botão Leads Engajados */}
                    <div className="bg-white border border-slate-200 rounded-md p-2.5 flex flex-col gap-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">🔥 Leads Engajados</span>
                        <div className="flex gap-1">
                          {[30, 60, 90].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                const segId = `seg-engaged-${d}d`;
                                const segName = `Leads Engajados (${d} dias)`;
                                const count = Math.round((contacts.length || 22450) * (d === 30 ? 0.65 : d === 60 ? 0.78 : 0.88));
                                setListsList(prev => {
                                  if (prev.some(l => l.id === segId)) return prev;
                                  return [...prev, { id: segId, name: segName, count }];
                                });
                                if (!selectedIncludeLists.includes(segId)) {
                                  setSelectedIncludeLists(prev => [...prev, segId]);
                                }
                              }}
                              className="px-1.5 py-0.5 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded border border-indigo-150 transition-all cursor-pointer"
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Filtra automaticamente leads que abriram qualquer e-mail no período selecionado.
                      </p>
                    </div>

                    {/* Botão Excluir Leads Desengajados */}
                    <div className="bg-white border border-slate-200 rounded-md p-2.5 flex flex-col gap-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">🚫 Excluir Desengajados</span>
                        <button
                          type="button"
                          onClick={() => {
                            const segId = `seg-disengaged-60d`;
                            const segName = `Leads Desengajados (> 60 dias sem abertura)`;
                            const count = Math.round((contacts.length || 22450) * 0.12);
                            setListsList(prev => {
                              if (prev.some(l => l.id === segId)) return prev;
                              return [...prev, { id: segId, name: segName, count }];
                            });
                            if (!selectedExcludeLists.includes(segId)) {
                              setSelectedExcludeLists(prev => [...prev, segId]);
                            }
                          }}
                          className="px-2 py-0.5 text-[10px] font-extrabold bg-red-50 hover:bg-red-600 hover:text-white text-red-700 rounded border border-red-150 transition-all cursor-pointer"
                        >
                          Aplicar Exclusão
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Exclui leads cadastrados a mais de 5 dias sem abertura nos últimos 60 dias.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center select-none">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Enviar Para</label>
                    <button
                      type="button"
                      onClick={() => setShowSegmentModal(true)}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-850 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Criar Nova Segmentação</span>
                    </button>
                  </div>

                  {/* Selected List Pills & Input Container */}
                  <div className="w-full bg-slate-50 border border-slate-202 rounded-2xl p-2.5 flex flex-wrap gap-2 focus-within:border-indigo-500 focus-within:bg-white transition-all min-h-[50px] items-center">
                    {selectedIncludeLists.map((listId) => {
                      const list = listsList.find((l) => l.id === listId);
                      if (!list) return null;
                      return (
                        <span
                          key={list.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-md animate-fadeIn"
                        >
                          <span>{list.name} ({list.count.toLocaleString("pt-BR")})</span>
                          <button
                            type="button"
                            onClick={() => setSelectedIncludeLists(prev => prev.filter(id => id !== listId))}
                            className="hover:bg-indigo-105 hover:bg-indigo-200 rounded-full p-0.5 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                    
                    <input
                      type="text"
                      placeholder={selectedIncludeLists.length === 0 ? "Pesquisar listas ou segmentações..." : ""}
                      value={includeSearchQuery}
                      onFocus={() => {
                        setShowIncludeDropdown(true);
                        setShowExcludeDropdown(false);
                      }}
                      onChange={(e) => setIncludeSearchQuery(e.target.value)}
                      className="flex-1 min-w-[150px] bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1"
                    />
                  </div>

                  {/* Inclusion Dropdown Options */}
                  {showIncludeDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowIncludeDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 z-20 max-h-72 overflow-y-auto bg-white border border-slate-202 rounded-md shadow-xl p-1.5 space-y-2 animate-fadeIn animate-scaleIn">
                        {/* Section 1: Listas & Segmentações */}
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 py-1 block">Listas & Segmentações</span>
                          {filteredIncludeOptions.length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic text-center">Nenhuma lista encontrada.</div>
                          ) : (
                            filteredIncludeOptions.map((l) => {
                              const isSelected = selectedIncludeLists.includes(l.id);
                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedIncludeLists(prev => prev.filter(id => id !== l.id));
                                    } else {
                                      setSelectedIncludeLists(prev => [...prev, l.id]);
                                    }
                                    setIncludeSearchQuery("");
                                  }}
                                  className={`w-full text-left text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                                    isSelected ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  <span>{l.name}</span>
                                  <span className="text-[10px] text-slate-500 font-bold">({l.count.toLocaleString("pt-BR")} leads)</span>
                                </button>
                              );
                            })
                          )}
                        </div>

                        {/* Section 2: Contatos Individuais */}
                        <div className="border-t border-slate-100 pt-1.5">
                          <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contatos Diretos ({contacts.length})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setShowIncludeDropdown(false);
                                setShowSelectContactsModal(true);
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                            >
                              Ver Todos / Selecionar Vários
                            </button>
                          </div>
                          {contacts.length === 0 ? (
                            <div className="text-xs text-slate-400 p-2 italic text-center">Nenhum contato na base.</div>
                          ) : (
                            contacts
                              .filter(c => {
                                if (!includeSearchQuery.trim()) return true;
                                const q = includeSearchQuery.toLowerCase().trim();
                                return (
                                  (c.name && c.name.toLowerCase().includes(q)) ||
                                  (c.email && c.email.toLowerCase().includes(q)) ||
                                  (c.first_name && c.first_name.toLowerCase().includes(q)) ||
                                  (c.last_name && c.last_name.toLowerCase().includes(q))
                                );
                              })
                              .slice(0, 5)
                              .map((c) => {
                                const contactListId = `contact-${c.id}`;
                                const isSelected = selectedIncludeLists.includes(contactListId);
                                const displayName = `👤 ${c.first_name || ""} ${c.last_name || ""} (${c.email})`.trim();
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setListsList(prev => {
                                        if (prev.some(item => item.id === contactListId)) return prev;
                                        return [...prev, { id: contactListId, name: displayName, count: 1 }];
                                      });
                                      if (isSelected) {
                                        setSelectedIncludeLists(prev => prev.filter(id => id !== contactListId));
                                      } else {
                                        setSelectedIncludeLists(prev => [...prev, contactListId]);
                                      }
                                      setIncludeSearchQuery("");
                                    }}
                                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                                      isSelected ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-slate-50 text-slate-700"
                                    }`}
                                  >
                                    <span className="truncate">{displayName}</span>
                                    <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-100/60 px-1.5 py-0.5 rounded shrink-0">Contato Direto</span>
                                  </button>
                                );
                              })
                          )}
                        </div>

                        {/* Footer Action Button */}
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowIncludeDropdown(false);
                              setShowSelectContactsModal(true);
                            }}
                            className="w-full text-center text-xs py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Pesquisar e Selecionar Contatos Específicos</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Excluir Listas Search & Select */}
                <div className="space-y-1.5 relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Excluir Listas (Não enviar)</label>

                  {/* Selected List Pills & Input Container */}
                  <div className="w-full bg-slate-50 border border-slate-202 rounded-2xl p-2.5 flex flex-wrap gap-2 focus-within:border-indigo-500 focus-within:bg-white transition-all min-h-[50px] items-center">
                    {selectedExcludeLists.map((listId) => {
                      const list = listsList.find((l) => l.id === listId);
                      if (!list) return null;
                      return (
                        <span
                          key={list.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-md animate-fadeIn"
                        >
                          <span>{list.name} ({list.count.toLocaleString("pt-BR")})</span>
                          <button
                            type="button"
                            onClick={() => setSelectedExcludeLists(prev => prev.filter(id => id !== listId))}
                            className="hover:bg-red-155 hover:bg-red-200 rounded-full p-0.5 transition-colors cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                    
                    <input
                      type="text"
                      placeholder={selectedExcludeLists.length === 0 ? "Pesquisar listas para exclusão..." : ""}
                      value={excludeSearchQuery}
                      onFocus={() => {
                        setShowExcludeDropdown(true);
                        setShowIncludeDropdown(false);
                      }}
                      onChange={(e) => setExcludeSearchQuery(e.target.value)}
                      className="flex-1 min-w-[150px] bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1"
                    />
                  </div>

                  {/* Exclusion Dropdown Options */}
                  {showExcludeDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowExcludeDropdown(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 z-20 max-h-60 overflow-y-auto bg-white border border-slate-202 rounded-md shadow-xl p-1.5 space-y-1 animate-fadeIn animate-scaleIn">
                        {filteredExcludeOptions.length === 0 ? (
                          <div className="text-xs text-slate-400 p-3 text-center">Nenhuma lista encontrada para exclusão.</div>
                        ) : (
                          filteredExcludeOptions.map((l) => {
                            const isSelected = selectedExcludeLists.includes(l.id);
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedExcludeLists(prev => prev.filter(id => id !== l.id));
                                  } else {
                                    setSelectedExcludeLists(prev => [...prev, l.id]);
                                  }
                                  setExcludeSearchQuery("");
                                }}
                                className={`w-full text-left text-xs px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                                  isSelected ? "bg-red-50 text-red-750 font-bold" : "hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <span>{l.name}</span>
                                <span className="text-[10px] text-slate-500 font-bold">({l.count.toLocaleString("pt-BR")} leads)</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Active contacts notice banner */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-150 rounded-md text-xs text-indigo-900 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Os e-mails serão disparados <strong>exclusivamente para contatos com status ATIVO</strong> inscritos nas listas ou segmentações selecionadas abaixo.</span>
                </div>

                {/* Estimate sum */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs select-none">
                  <span className="text-slate-500 font-semibold">Total estimado de destinatários:</span>
                  <strong className="text-sm text-indigo-650 font-black">
                    {audienceEstimateCount.toLocaleString("pt-BR")} contatos
                  </strong>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPreviewSegmentContactsModal(true)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Visualizar Contatos desta Segmentação</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: AGENDAMENTO */}
            <div className="bg-white border border-slate-202 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-800">2. Escolha o Agendamento</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSendType("immediate")}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all ${
                    sendType === "immediate"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm font-bold"
                      : "border-slate-202 hover:border-slate-300 text-slate-650"
                  }`}
                >
                  <Mail className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm font-bold">Enviar Agora</span>
                  <span className="text-[10px] text-slate-500">O disparo sera iniciado assim que confirmar.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSendType("scheduled")}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all ${
                    sendType === "scheduled"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm font-bold"
                      : "border-slate-202 hover:border-slate-300 text-slate-650"
                  }`}
                >
                  <Calendar className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm font-bold">Agendar</span>
                  <span className="text-[10px] text-slate-500">Escolha data e fuso horario futuros.</span>
                </button>
              </div>

              {/* Scheduling details */}
              {sendType === "scheduled" && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-fadeIn">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Opção de Envio</label>
                      <select className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3 text-xs text-slate-805">
                        <option>Horário de envio fixo</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Data de Envio</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3 text-xs text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Hora de Envio</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Fuso Horário</label>
                      <select
                        value={timezoneMode}
                        onChange={(e) => setTimezoneMode(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-202 rounded-md py-2.5 px-3 text-xs text-slate-805 cursor-pointer"
                      >
                        <option value="account">Fuso horário da conta (America/Sao_Paulo)</option>
                        <option value="recipient_local">Fuso horário local do destinatário</option>
                      </select>
                    </div>
                  </div>

                  {timezoneMode === "recipient_local" && (
                    <div className="bg-amber-50 border border-amber-250 text-amber-900 rounded-2xl p-4 space-y-3 text-xs animate-fadeIn">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold">A hora selecionada já passou em alguns fusos horários.</h5>
                          <p className="text-slate-655 mt-0.5">Para esses fusos, quando gostaria de fazer o envio?</p>
                        </div>
                      </div>

                      <div className="flex gap-4 pl-7">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="late-behavior"
                            checked={lateTimezoneBehavior === "send_immediately"}
                            onChange={() => setLateTimezoneBehavior("send_immediately")}
                            className="text-indigo-650"
                          />
                          <span>Enviar imediatamente</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="late-behavior"
                            checked={lateTimezoneBehavior === "send_next_day"}
                            onChange={() => setLateTimezoneBehavior("send_next_day")}
                            className="text-indigo-650"
                          />
                          <span>Enviar no dia seguinte</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={determineRecipientsAtSendTime}
                      onChange={(e) => setDetermineRecipientsAtSendTime(e.target.checked)}
                      className="rounded border-slate-350 text-indigo-650 h-4 w-4"
                    />
                    <span>Determinar os destinatários no horário de envio</span>
                    <span className="text-[10px] text-slate-400 normal-case font-normal">(Recomendado)</span>
                  </label>
                </div>
              )}

              {/* Smart Sending Toggle Switch */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">Smart Sending (Envio Inteligente)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Ignora o envio se o lead já recebeu outro e-mail nas últimas 24h.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={smartSendingLocal}
                    onChange={(e) => setSmartSendingLocal(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL overlay: CRIAÇÃO DE SEGMENTAÇÃO (Identico ao modal de contatos) */}
      {showSegmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white border border-slate-202 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 select-none shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900">Nova Segmentação de Público</h3>
                <p className="text-xs text-slate-500 mt-0.5">Defina as regras e condições para segmentar os leads da base.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSegmentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable filter builder) */}
            <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-2">
              
              {/* Segment Name input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Segmentação</label>
                <input
                  type="text"
                  placeholder="Ex: Alunos de React ativos em SP"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-202 rounded-md py-2 px-3.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              {/* Logical Global Union operator */}
              {segmentGroups.length > 1 && (
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-md p-3 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-indigo-850">Lógica de União entre Grupos:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGlobalOperator("and")}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        globalOperator === "and"
                          ? "bg-indigo-650 bg-indigo-600 text-white shadow"
                          : "bg-white border border-slate-200 text-slate-655"
                      }`}
                    >
                      Unir com E (Todos)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlobalOperator("or")}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        globalOperator === "or"
                          ? "bg-indigo-650 bg-indigo-600 text-white shadow"
                          : "bg-white border border-slate-200 text-slate-655"
                      }`}
                    >
                      Unir com OU (Qualquer)
                    </button>
                  </div>
                </div>
              )}

              {/* Loop over segment groups */}
              <div className="space-y-4">
                {segmentGroups.map((group, groupIdx) => (
                  <div key={group.id}>
                    {/* Connector line */}
                    {groupIdx > 0 && (
                      <div className="flex items-center gap-2 py-3 pl-6">
                        <div className="h-[1.5px] bg-indigo-200 flex-1" />
                        <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-0.5 rounded-full select-none shadow-sm">
                          {globalOperator === "and" ? "E" : "OU"}
                        </span>
                        <div className="h-[1.5px] bg-indigo-200 flex-1" />
                      </div>
                    )}

                    {/* Group card */}
                    <div className="bg-slate-50 border border-slate-202 rounded-2xl p-4 space-y-4 relative shadow-sm">
                      {/* Header group */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-600" />
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Grupo de Condições {groupIdx + 1}</h4>
                        </div>
                        {segmentGroups.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSegmentGroup(group.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Remover Grupo</span>
                          </button>
                        )}
                      </div>

                      {/* Group logical operator selection */}
                      {group.rules.length > 1 && (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 w-fit">
                          <span className="text-[10px] text-slate-550">Lógica interna:</span>
                          <div className="flex items-center gap-1 select-none">
                            <button
                              type="button"
                              onClick={() => handleUpdateGroupOperator(group.id, "and")}
                              className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                group.logicalOperator === "and" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-655"
                              }`}
                            >
                              TODAS (E)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateGroupOperator(group.id, "or")}
                              className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                                group.logicalOperator === "or" ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-655"
                              }`}
                            >
                              QUALQUER (OU)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Rules loop within group */}
                      <div className="space-y-3">
                        {group.rules.map((rule, ruleIdx) => (
                          <div key={ruleIdx}>
                            {ruleIdx > 0 && (
                              <div className="flex justify-start pl-8 py-1">
                                <span className="text-[8px] font-black tracking-widest uppercase bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                                  {group.logicalOperator === "and" ? "E" : "OU"}
                                </span>
                              </div>
                            )}
                            <div className="bg-white p-3 rounded-md border border-slate-202">
                              {rule.field === "email_opened" || rule.field === "email_received" || rule.field === "email_clicked" ? (
                                <EngagementRuleExpanded
                                  rule={rule}
                                  group={group}
                                  ruleIdx={ruleIdx}
                                  handleUpdateRuleInGroup={handleUpdateRuleInGroup}
                                  customFields={customFields}
                                />
                              ) : (
                                <div className="flex flex-wrap items-center gap-2.5">
                              {/* Field Selection */}
                              <SearchableFieldDropdown
                                value={rule.field}
                                onChange={(val) => handleUpdateRuleInGroup(group.id, ruleIdx, { field: val })}
                                customFields={customFields}
                              />

                              {/* Operator Selection */}
                              {(() => {
                                const isDateField = rule.field === "created_at" || rule.field === "enrolled_at";
                                return (
                                  <select
                                    value={rule.operator}
                                    onChange={(e) => handleUpdateRuleInGroup(group.id, ruleIdx, { operator: e.target.value })}
                                    className="bg-slate-50 border border-slate-202 text-slate-750 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-indigo-500"
                                  >
                                    {isDateField ? (
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
                                );
                              })()}

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
                                          className="bg-slate-50 border border-slate-202 text-slate-700 rounded-lg py-1 px-1.5 text-xs focus:outline-none focus:border-indigo-500 w-full"
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">a</span>
                                        <input
                                          type="date"
                                          value={endDate}
                                          onChange={(e) => {
                                            const newVal = `${startDate}_${e.target.value}`;
                                            handleUpdateRuleInGroup(group.id, ruleIdx, { value: newVal });
                                          }}
                                          className="bg-slate-50 border border-slate-202 text-slate-700 rounded-lg py-1 px-1.5 text-xs focus:outline-none focus:border-indigo-500 w-full"
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
                                        className="bg-slate-50 border border-slate-202 text-slate-700 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-indigo-500 w-full"
                                      />
                                    </div>
                                  );
                                }

                                if (rule.field === "status") {
                                  return (
                                    <select
                                      value={rule.value}
                                      onChange={(e) => handleUpdateRuleInGroup(group.id, ruleIdx, { value: e.target.value })}
                                      className="bg-slate-50 border border-slate-202 text-slate-700 rounded-lg py-1 px-2 text-xs focus:outline-none min-w-[100px]"
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
                                      className="bg-slate-50 border border-slate-202 text-slate-700 rounded-lg py-1 px-2 text-xs focus:outline-none"
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

                              {/* Remove condition */}
                              {(group.rules.length > 1 || segmentGroups.length > 1) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRuleFromGroup(group.id, ruleIdx)}
                                  className="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer"
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

                      {/* Group footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 select-none">
                        {group.rules.length < 4 ? (
                          <button
                            type="button"
                            onClick={() => handleAddRuleToGroup(group.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Adicionar Condição</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium">Limite de 4 condições atingido.</span>
                        )}
                        <span className="text-[9px] text-slate-400 font-semibold">{group.rules.length}/4 condições</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add group button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 select-none">
                {segmentGroups.length < 3 ? (
                  <button
                    type="button"
                    onClick={handleAddSegmentGroup}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 text-xs font-bold text-indigo-700 rounded-md transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Novo Grupo</span>
                  </button>
                ) : (
                  <span className="text-xs text-amber-600 font-semibold">Limite de 3 grupos atingido.</span>
                )}
                <span className="text-xs text-slate-400 font-bold">{segmentGroups.length}/3 grupos</span>
              </div>

              {/* Preview simulation box */}
              <div className="bg-slate-50 rounded-md p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Prévia de Leads</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Clique para simular a contagem com indexação GIN na base.</p>
                </div>

                <div className="flex items-center gap-3">
                  {isPreviewLoading ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-650">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Calculando...</span>
                    </div>
                  ) : previewCount !== null ? (
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-black text-emerald-700">{previewCount.toLocaleString("pt-BR")} leads</span>
                      <span className="text-[9px] text-slate-400">qualificados para este segmento</span>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCalculatePreview}
                    disabled={isPreviewLoading}
                    className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Simular Contagem
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5 select-none shrink-0">
              <button
                type="button"
                onClick={() => setShowSegmentModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-805 rounded-md text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSegment}
                disabled={!newSegmentName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                Salvar e Selecionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINAL CONFIRMATION MODAL */}
      {showConfirmSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white border border-slate-202 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col space-y-4">
            <div className="flex items-center gap-3 text-indigo-650">
              <div className="p-2.5 bg-indigo-50 rounded-md text-indigo-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirmar Envio / Agendamento?</h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 border-y border-slate-100 py-3 leading-relaxed">
              <div>Campanha: <strong className="text-slate-900">{campaignName}</strong></div>
              <div>Assunto: <strong className="text-slate-900">{subjectLine}</strong></div>
              <div>Público estimado: <strong className="text-slate-900">{audienceEstimateCount.toLocaleString("pt-BR")} destinatários</strong></div>
              <div>Envio: <strong className="text-indigo-650 font-bold uppercase">{sendType === "immediate" ? "Imediato (Agora)" : `Agendado para ${scheduledDate} as ${scheduledTime}`}</strong></div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                disabled={isSending}
                onClick={() => setShowConfirmSendModal(false)}
                className="px-4 py-2 border border-slate-202 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Revisar
              </button>
              <button
                type="button"
                disabled={isSending}
                onClick={handleConfirmWizard}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Disparando e-mails...</span>
                  </>
                ) : (
                  <span>Confirmar Envio</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELEÇÃO DE CONTATOS ESPECÍFICOS DA BASE */}
      {showSelectContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-202 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900">Selecionar Contatos Específicos</h3>
                <p className="text-xs text-slate-500 mt-0.5">Escolha um ou mais alunos/leads cadastrados para receber esta campanha.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSelectContactsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail do contato..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 py-2 pr-1">
              {contacts.length === 0 ? (
                <div className="text-xs text-slate-400 p-6 text-center italic">Nenhum contato encontrado na base.</div>
              ) : (
                contacts
                  .filter((c) => {
                    if (!contactSearchQuery.trim()) return true;
                    const q = contactSearchQuery.toLowerCase().trim();
                    return (
                      (c.name && c.name.toLowerCase().includes(q)) ||
                      (c.email && c.email.toLowerCase().includes(q)) ||
                      (c.first_name && c.first_name.toLowerCase().includes(q)) ||
                      (c.last_name && c.last_name.toLowerCase().includes(q))
                    );
                  })
                  .map((c) => {
                    const contactListId = `contact-${c.id}`;
                    const isSelected = selectedIncludeLists.includes(contactListId);
                    const displayName = `👤 ${c.first_name || ""} ${c.last_name || ""} (${c.email})`.trim();

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setListsList((prev) => {
                            if (prev.some((item) => item.id === contactListId)) return prev;
                            return [...prev, { id: contactListId, name: displayName, count: 1 }];
                          });
                          if (isSelected) {
                            setSelectedIncludeLists((prev) => prev.filter((id) => id !== contactListId));
                          } else {
                            setSelectedIncludeLists((prev) => [...prev, contactListId]);
                          }
                        }}
                        className={`p-3 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? "bg-indigo-50/80 border-indigo-300 text-indigo-900" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-indigo-600 h-4 w-4 pointer-events-none"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{c.first_name} {c.last_name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{c.email}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                          Contato Individual
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-600">
                {selectedIncludeLists.filter((id) => id.startsWith("contact-")).length} contatos selecionados
              </span>
              <button
                type="button"
                onClick={() => setShowSelectContactsModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Concluir Seleção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR CONTATOS DA SEGMENTAÇÃO / LISTA SELECIONADA */}
      {showPreviewSegmentContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900">Contatos da Segmentação Selecionada</h3>
                <p className="text-xs text-slate-500 mt-0.5">Exibindo os contatos ativos que receberão esta campanha.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewSegmentContactsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {contacts.filter((c: any) => {
                if (c.status !== "active" || c.is_subscribed === false) return false;
                
                if (selectedIncludeLists.length === 0) return false;

                let isIncluded = false;
                if (selectedIncludeLists.includes(`contact-${c.id}`)) {
                  isIncluded = true;
                } else if (c.list_ids && c.list_ids.some((lid: string) => selectedIncludeLists.includes(lid))) {
                  isIncluded = true;
                } else if (selectedIncludeLists.some((id) => id.startsWith("seg-"))) {
                  isIncluded = true;
                }

                if (!isIncluded) return false;

                if (!contactSearchQuery) return true;
                const q = contactSearchQuery.toLowerCase();
                const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
                const email = (c.email || "").toLowerCase();
                return fullName.includes(q) || email.includes(q);
              }).length === 0 ? (
                <div className="text-xs text-slate-400 p-6 text-center">Nenhum contato ativo inscrito em lista encontrado nesta segmentação.</div>
              ) : (
                contacts
                  .filter((c: any) => {
                    if (c.status !== "active" || c.is_subscribed === false) return false;
                    if (!contactSearchQuery) return true;
                    const q = contactSearchQuery.toLowerCase();
                    const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
                    const email = (c.email || "").toLowerCase();
                    return fullName.includes(q) || email.includes(q);
                  })
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-md border border-slate-150 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {(c.first_name ? c.first_name.charAt(0) : "A").toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            {c.first_name || ""} {c.last_name || ""}
                          </h4>
                          <span className="text-[11px] text-slate-500">{c.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                          Ativo
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                          Em Lista
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-600">
                {contacts.filter((c: any) => c.status === "active" && c.is_subscribed !== false).length} contatos ativos inscritos em lista
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewSegmentContactsModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[300px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    }>
      <CreateCampaignForm />
    </Suspense>
  );
}


