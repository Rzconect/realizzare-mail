import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuracao ausente' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const mappedUsers = data.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'Usuário'),
      role: u.user_metadata?.role || (u.email?.toLowerCase() === 'contato@realizzarecursos.com.br' ? 'Administrador' : 'Editor'),
      isNewUser: u.user_metadata?.is_new_user === true,
      lastSignInAt: u.last_sign_in_at || u.updated_at || u.created_at,
      createdAt: u.created_at,
      lastPage: u.user_metadata?.last_page || '/dashboard'
    }));

    return NextResponse.json({ users: mappedUsers }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
