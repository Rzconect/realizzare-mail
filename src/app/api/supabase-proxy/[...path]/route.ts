import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function OPTIONS(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }

async function handleRequest(request: Request, params: { path: string[] }) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200 });
  }

  const url = new URL(request.url);
  const path = params.path.join('/');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const targetUrl = `${supabaseUrl}/${path}${url.search}`;
  
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('origin');
  headers.delete('referer');

  // Auth endpoints (login, MFA, etc.) need the original user JWT so Supabase
  // can identify the user. Replacing with service role key causes
  // "missing sub claim" because it has no user identity.
  // Only REST/storage endpoints need service role key to bypass RLS.
  const isAuthPath = path.startsWith('auth/v1/');
  if (isAuthPath) {
    // Forward original Authorization from client; fallback to anon key
    const originalAuth = request.headers.get('authorization');
    if (originalAuth) {
      headers.set('authorization', originalAuth);
    } else {
      headers.set('authorization', `Bearer ${anonKey}`);
    }
    headers.set('apikey', anonKey);
  } else {
    // For data endpoints, use service role key to bypass RLS
    headers.set('apikey', serviceRoleKey);
    headers.set('authorization', `Bearer ${serviceRoleKey}`);
  }
  
  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });
    
    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('access-control-allow-origin');
    responseHeaders.delete('access-control-allow-methods');
    responseHeaders.delete('access-control-allow-headers');
    responseHeaders.delete('content-encoding');
    
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
