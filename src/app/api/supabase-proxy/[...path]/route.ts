import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }
export async function OPTIONS(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return handleRequest(request, await params); }

async function handleRequest(request: Request, params: { path: string[] }) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200 });
  }

  const url = new URL(request.url);
  const path = params.path.join('/');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const targetUrl = `${supabaseUrl}/${path}${url.search}`;

  // Build clean headers for outgoing request
  const outHeaders = new Headers();

  // Copy safe headers from original request
  const copyHeaders = ['content-type', 'x-client-info', 'x-supabase-api-version', 'prefer', 'range'];
  for (const h of copyHeaders) {
    const val = request.headers.get(h);
    if (val) outHeaders.set(h, val);
  }

  // Auth endpoints (login, MFA, session refresh, etc.) need the ORIGINAL user JWT.
  // Using service_role_key here causes "missing sub claim" because it has no user identity.
  // Data endpoints (rest/v1/) need the service_role_key to bypass RLS.
  const isAuthPath = path.startsWith('auth/v1/');

  if (isAuthPath) {
    const originalAuth = request.headers.get('authorization');
    outHeaders.set('authorization', originalAuth ?? `Bearer ${anonKey}`);
    outHeaders.set('apikey', anonKey);
  } else {
    outHeaders.set('apikey', serviceRoleKey);
    outHeaders.set('authorization', `Bearer ${serviceRoleKey}`);
  }

  // Do NOT send Accept-Encoding — we want a plain (non-gzip) response
  // so we can safely buffer and forward it without double-decompression issues.
  outHeaders.set('accept-encoding', 'identity');

  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: outHeaders,
      body,
    });

    // Build response headers — strip CORS and encoding headers
    const responseHeaders = new Headers();
    const copyResponseHeaders = ['content-type', 'x-request-id', 'cf-ray', 'sb-gateway-version'];
    for (const h of copyResponseHeaders) {
      const val = res.headers.get(h);
      if (val) responseHeaders.set(h, val);
    }

    const responseBody = await res.text();

    return new NextResponse(responseBody, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('[supabase-proxy] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
