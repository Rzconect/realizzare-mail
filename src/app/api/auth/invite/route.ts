import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_PASSWORD = '123456';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Configuração do Supabase ausente no servidor');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// POST /api/auth/invite — cria usuário com senha padrão "123456"
export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        is_new_user: true
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/auth/invite — reseta senha para "123456" e remove todos os fatores MFA do usuário
export async function PATCH(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Busca o usuário pelo email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    const user = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Reseta a senha para "123456" e marca como novo usuário (forçar troca de senha no login)
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: DEFAULT_PASSWORD,
      user_metadata: { ...user.user_metadata, is_new_user: true }
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Remove todos os fatores MFA (TOTP) do usuário
    const factors = (user as any).factors ?? [];
    for (const factor of factors) {
      await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId: user.id, id: factor.id });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/auth/invite — exclui usuário do Supabase
export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Busca o usuário pelo email para obter o UUID
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    const user = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
