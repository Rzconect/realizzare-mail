import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Cria uma instância do cliente Supabase para uso no lado do servidor (Server Components, Server Actions e Route Handlers).
 * Gerencia a autenticação e a persistência de sessão através dos cookies da requisição.
 *
 * @returns Promise com a instância tipada do cliente Supabase para o servidor.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O método `setAll` foi chamado a partir de um Server Component.
            // Isso pode ser ignorado caso exista um Middleware gerenciando as sessões dos usuários.
          }
        },
      },
    }
  )
}

/**
 * Cria uma instância com privilégios administrativos (Service Role) do cliente Supabase
 * utilizando a chave `SUPABASE_SERVICE_ROLE_KEY`.
 *
 * Esta função destina-se a operações de administração (como webhooks e rotas internas de API)
 * no lado do servidor que precisam ignorar as regras de RLS (Row Level Security).
 *
 * @returns Instância tipada do cliente Supabase com acesso administrativo.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
