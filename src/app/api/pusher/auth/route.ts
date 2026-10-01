import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { createClient } from '@/lib/supabase/server';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2198909',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '94bf9c2f552d80c7721e',
  secret: process.env.PUSHER_SECRET || '109a49b40e350429fa66',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'sa1',
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const socketId = data.get('socket_id') as string;
    const channel = data.get('channel_name') as string;

    // Temporarily bypass Supabase auth to test Pusher connection
    const presenceData = {
      user_id: 'user_' + Math.random().toString(36).substring(2, 9),
      user_info: {
        name: 'Vendedor (Teste)',
        email: 'vendedor@realizzare.com',
      },
    };

    const authResponse = pusher.authorizeChannel(socketId, channel, presenceData);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
