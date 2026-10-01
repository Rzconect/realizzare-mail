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
    const { channel, event, payload, socket_id } = await request.json();

    // Ensure only authenticated users can trigger events
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await pusher.trigger(channel, event, payload, socket_id ? { socket_id } : undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
