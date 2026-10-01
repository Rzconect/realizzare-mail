"use client";

import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PusherGlobalPresence() {
  const pathname = usePathname();
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    let pusher: Pusher | null = null;
    let channel: any = null;
    let isMounted = true;

    const setup = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const myClientId = Math.random().toString(36).substring(2, 15);
      const currentUserId = session?.user?.id || myClientId;
      const currentUserName = session?.user?.user_metadata?.name || session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuário';

      pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '94bf9c2f552d80c7721e', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'sa1',
        authEndpoint: '/api/pusher/auth',
        auth: {
          params: {
            user_id: currentUserId,
            user_name: currentUserName
          }
        }
      });

      // Format pathname to a valid channel name (max 164 chars, a-zA-Z0-9_-)
      const formattedPath = (pathname || '/').replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'home';
      const channelName = `presence-global-${formattedPath}`;

      channel = pusher.subscribe(channelName);

      channel.bind('pusher:subscription_succeeded', (members: any) => {
        if (!isMounted) return;
        const users: any[] = [];
        members.each((member: any) => {
          users.push({ id: member.id, name: member.info?.name });
        });
        setActiveUsers(users);
      });

      channel.bind('pusher:member_added', (member: any) => {
        if (!isMounted) return;
        setActiveUsers(prev => {
          if (prev.find(u => u.id === member.id)) return prev;
          return [...prev, { id: member.id, name: member.info?.name }];
        });
      });

      channel.bind('pusher:member_removed', (member: any) => {
        if (!isMounted) return;
        setActiveUsers(prev => prev.filter(u => u.id !== member.id));
      });
    };

    setup();

    return () => {
      isMounted = false;
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [pathname]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mr-2">
      <div className="flex -space-x-1.5 hover:-space-x-0.5 transition-all duration-200">
        {activeUsers.map((u) => {
          const initials = (u.name || 'U').substring(0, 2).toUpperCase();
          const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-pink-500'];
          const color = colors[(u.name?.length || 0) % colors.length];
          
          return (
            <div 
              key={u.id}
              className={`h-7 w-7 rounded-full text-white flex items-center justify-center text-[9px] font-bold border-2 border-white shadow-sm ${color} transition-transform hover:scale-110 hover:z-10`}
              title={`${u.name} está nesta tela`}
            >
              {initials}
            </div>
          );
        })}
      </div>
    </div>
  );
}
