const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

// Insert Pusher import
content = content.replace('import { Plus, Archive, Settings, Eye, EyeOff, ChevronUp, ChevronDown, Clock, AlertCircle, Trash2 } from "lucide-react";', 'import { Plus, Archive, Settings, Eye, EyeOff, ChevronUp, ChevronDown, Clock, AlertCircle, Trash2 } from "lucide-react";\nimport Pusher from "pusher-js";');

// Replace setupPresence completely
const oldSetupStart = content.indexOf('  // Setup Supabase Presence and Realtime sync');
const oldSetupEnd = content.indexOf('  // Track modal and drag');

if (oldSetupStart !== -1 && oldSetupEnd !== -1) {
  const newSetup = `  // Setup Pusher Presence and Realtime sync
  useEffect(() => {
    let pusher: any = null;
    let channel: any = null;
    let isMounted = true;
    
    const setupPresence = async () => {
        const myClientId = Math.random().toString(36).substring(2, 15);
        
        pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          authEndpoint: '/api/pusher/auth',
        });
        
        channel = pusher.subscribe('presence-crm');

        channel.bind('pusher:subscription_succeeded', (members: any) => {
          if (!isMounted) return;
          const users: any[] = [];
          members.each((member: any) => {
            users.push({ user_id: member.id, name: member.info?.name, email: member.info?.email });
          });
          setActiveUsersInPage(users);
        });

        channel.bind('pusher:member_added', (member: any) => {
          if (!isMounted) return;
          setActiveUsersInPage((prev: any[]) => {
            if (prev.find(u => u.user_id === member.id)) return prev;
            return [...prev, { user_id: member.id, name: member.info?.name, email: member.info?.email }];
          });
        });

        channel.bind('pusher:member_removed', (member: any) => {
          if (!isMounted) return;
          setActiveUsersInPage((prev: any[]) => prev.filter(u => u.user_id !== member.id));
        });

        // Listen for real-time moves and deletes
        channel.bind('card_moved', (payload: any) => {
          if (!isMounted) return;
          setDeals((prev: any[]) => prev.map(d => d.id === payload.dealId ? { ...d, columnId: payload.colId } : d));
        });

        channel.bind('card_deleted', (payload: any) => {
          if (!isMounted) return;
          setDeals((prev: any[]) => prev.filter(d => d.id !== payload.dealId));
        });

        channel.bind('card_updated', (payload: any) => {
          if (!isMounted) return;
          setDeals((prev: any[]) => prev.map(d => d.id === payload.deal.id ? { ...d, ...payload.deal } : d));
        });
        
        const w = window as any;
        if (w.__crm_pusher && w.__crm_pusher !== pusher) {
           try { w.__crm_pusher.disconnect(); } catch(e) {}
        }
        w.__crm_client_id = myClientId;
        w.__crm_pusher = pusher;
        w.__crm_socket_id = null;
        
        pusher.connection.bind('connected', () => {
          w.__crm_socket_id = pusher?.connection.socket_id;
        });
    };
    
    setupPresence();
    
    return () => {
      isMounted = false;
      if (pusher) {
        pusher.unsubscribe('presence-crm');
        pusher.disconnect();
      }
    };
  }, []);
  
`;
  content = content.substring(0, oldSetupStart) + newSetup + content.substring(oldSetupEnd);
}

// Replace w.__crm_channel.send with fetch
content = content.replace(/const w = window as any;\s*if \(w\.__crm_channel\) {\s*w\.__crm_channel\.send\(\{ type: 'broadcast', event: 'card_updated', payload: \{ deal: updatedDeal \} \}\);\s*}/g, 
  `const w = window as any;
    if (w.__crm_pusher) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'presence-crm', event: 'card_updated', payload: { deal: updatedDeal }, socket_id: w.__crm_socket_id })
      }).catch(e => console.error('Error broadcasting:', e));
    }`);

content = content.replace(/const w = window as any;\s*if \(w\.__crm_channel\) {\s*w\.__crm_channel\.send\(\{ type: 'broadcast', event: 'card_deleted', payload: \{ dealId \} \}\);\s*}/g, 
  `const w = window as any;
    if (w.__crm_pusher) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'presence-crm', event: 'card_deleted', payload: { dealId }, socket_id: w.__crm_socket_id })
      }).catch(e => console.error('Error broadcasting:', e));
    }`);

content = content.replace(/const w = window as any;\s*if \(w\.__crm_channel\) {\s*w\.__crm_channel\.send\(\{ type: 'broadcast', event: 'card_moved', payload: \{ dealId: draggedDealId, colId \} \}\);\s*}/g, 
  `const w = window as any;
    if (w.__crm_pusher) {
      fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'presence-crm', event: 'card_moved', payload: { dealId: draggedDealId, colId }, socket_id: w.__crm_socket_id })
      }).catch(e => console.error('Error broadcasting:', e));
    }`);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', content);
console.log('CRM page updated');
