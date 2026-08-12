"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Award, TrendingUp, Search, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Course {
  id: string;
  name: string;
  price: number;
  type: string;
  sku: string;
  enrollment_count: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Metrics
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const supabase = createClient();

        // 1. Fetch courses with enrollment counts
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select(`
            id,
            name,
            price,
            type,
            sku,
            enrollments (
              id,
              status
            )
          `);

        if (coursesError) throw coursesError;

        let enrollmentsCount = 0;
        let completedCount = 0;

        const formattedCourses: Course[] = (coursesData || []).map((c: any) => {
          const count = c.enrollments?.length || 0;
          enrollmentsCount += count;
          completedCount += c.enrollments?.filter((e: any) => e.status === "completed").length || 0;

          return {
            id: c.id,
            name: c.name,
            price: parseFloat(c.price || 0),
            type: c.type || "online",
            sku: c.sku || "N/A",
            enrollment_count: count
          };
        });

        setCourses(formattedCourses);
        setTotalCourses(formattedCourses.length);
        setTotalEnrollments(enrollmentsCount);
        
        if (enrollmentsCount > 0) {
          setCompletionRate(Math.round((completedCount / enrollmentsCount) * 100));
        }

      } catch (err) {
        console.error("Erro ao buscar cursos do Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-130px)] items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold tracking-wider text-indigo-650 uppercase">Cursos</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mt-1">Catálogo de Cursos</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Gerencie seus cursos da Realizzare e acompanhe o engajamento dos alunos.
          </p>
        </div>

        <button
          onClick={() => alert("Funcionalidade de criação de cursos será disponibilizada em breve.")}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Novo Curso</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cursos Ativos</span>
            <h3 className="text-2xl font-black text-slate-800">{totalCourses}</h3>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Matrículas</span>
            <h3 className="text-2xl font-black text-slate-800">{totalEnrollments}</h3>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Conclusão</span>
            <h3 className="text-2xl font-black text-slate-800">{completionRate}%</h3>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome do curso ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{course.name}</h4>
                <span className={`shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${
                  course.type === "online" 
                    ? "bg-indigo-50 border-indigo-100 text-indigo-650"
                    : "bg-emerald-50 border-emerald-100 text-emerald-650"
                }`}>
                  {course.type}
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-500 text-[11px] font-medium">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">SKU</span>
                  <span>{course.sku}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Preço</span>
                  <span className="font-semibold text-slate-700">R$ {course.price.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3.5 mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                <span>{course.enrollment_count} {course.enrollment_count === 1 ? "aluno matriculado" : "alunos matriculados"}</span>
              </div>
              
              <span className="text-[10px] font-extrabold text-indigo-650 flex items-center gap-0.5 hover:underline cursor-pointer">
                Ver detalhes <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400 text-xs italic">
            Nenhum curso correspondente encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
