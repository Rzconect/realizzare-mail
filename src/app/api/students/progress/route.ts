import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Validar Token de Autorização (Bearer Token)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer realizzare_secret_api_key_")) {
      return NextResponse.json(
        { success: false, message: "Não autorizado. Token de API inválido ou ausente." },
        { status: 401 }
      );
    }

    // 2. Extrair dados da requisição
    const body = await request.json();
    const { student_email, course_name, progress_percentage, status, last_accessed_at } = body;

    // Validar campos obrigatórios
    if (!student_email || !course_name || progress_percentage === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Campos obrigatórios ausentes. Certifique-se de enviar: student_email, course_name e progress_percentage." 
        },
        { status: 400 }
      );
    }

    // Nota de Arquitetura:
    // Em ambiente de produção real, neste ponto o Next.js faria uma chamada direta ao banco de dados (ex: Supabase ou PostgreSQL)
    // para gravar ou atualizar a matrícula do aluno. Como o frontend atual é uma demonstração que consome do localStorage,
    // o endpoint retorna os dados validados com sucesso e simulados.
    
    return NextResponse.json(
      {
        success: true,
        message: "Dados de progresso recebidos e validados com sucesso no servidor do Realizzare Mail.",
        data: {
          student_email,
          course_name,
          progress_percentage: Number(progress_percentage),
          status: status || "Em Andamento",
          last_accessed_at: last_accessed_at || new Date().toISOString(),
          processed_at: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Erro interno no servidor ao processar requisição.", error: error.message },
      { status: 500 }
    );
  }
}
