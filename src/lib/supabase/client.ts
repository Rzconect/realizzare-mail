import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Cria ou retorna uma instância do cliente Supabase para ser utilizada no navegador (Client Components).
 *
 * Utiliza o `createBrowserClient` do pacote `@supabase/ssr` para gerenciar
 * a autenticação no lado do cliente com persistência em cookies.
 *
 * @returns Instância tipada do cliente Supabase para o navegador.
 */
export function createClient(): any {
  return createBrowserClient<Database>(
    "/api/supabase-proxy",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as any
}
