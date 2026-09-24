import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Inicializa o Rate Limit apenas se as chaves estiverem configuradas no .env.
// Isso garante que NADA QUEBRE se as chaves nǜo estiverem presentes (Fail-open).
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit: Ratelimit | null = null;

if (redisUrl && redisToken) {
  ratelimit = new Ratelimit({
    redis: new Redis({
      url: redisUrl,
      token: redisToken,
    }),
    // Limite de 100 requisiçǜes por minuto por IP
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  });
}

export async function middleware(request: NextRequest) {
  const ip = (request as any).ip ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // 1. GARANTIA DE ESCALABILIDADE E INTEGRAÇǜES (PAGAR.ME / REALIZZARE)
  // Ignoramos completamente os webhooks do Rate Limit.
  // Dessa forma, não existe a possibilidade de barrar eventos críticos.
  if (path.startsWith('/api/webhooks') || path.startsWith('/api/v1/realizzare-events')) {
    return NextResponse.next();
  }

  // 2. RATE LIMITING PARA ROTAS VULNERÁVEIS (Apenas se configurado)
  if (ratelimit && (path.startsWith('/api/') || path.startsWith('/login'))) {
    const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests - Rate limit exceeded' },
        { 
          status: 429, 
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          } 
        }
      );
    }
  }

  const response = NextResponse.next();
  
  // 3. CABEÇALHOS DE SEGURANÇA EXTRAS (Edge)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  // Executa o middleware em todas as rotas, exceto arquivos estáticos
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
