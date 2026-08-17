import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  // Retrieve user JWT token sent by Supabase browser client
  const clientAuthHeader = request.headers.get('authorization');
  const token = clientAuthHeader ? clientAuthHeader.split(' ')[1] : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Missing session token" }, { status: 401 });
  }

  // Validate the JWT token against Supabase Auth
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized: Invalid or expired session" }, { status: 401 });
  }
  
  const targetUrl = `${supabaseUrl}/${path}${url.search}`;
  
  const headers = new Headers(request.headers);
  headers.set('apikey', serviceRoleKey);
  headers.set('authorization', `Bearer ${serviceRoleKey}`);
  headers.delete('host'); // Let fetch set the correct host for Supabase
  headers.delete('origin'); // Avoid CORS issues from the proxy
  headers.delete('referer');
  
  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });
    
    const responseHeaders = new Headers(res.headers);
    // Remove Supabase CORS headers as Next.js will handle CORS for its own API routes
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
