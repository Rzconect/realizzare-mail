const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

// 1. Add cursors state
const stateInsert = `
  const [activeUsersInPage, setActiveUsersInPage] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number, y: number, name: string }>>({});
  const lastCursorUpdateRef = useRef<number>(0);
`;
content = content.replace('  const [activeUsersInPage, setActiveUsersInPage] = useState<any[]>([]);', stateInsert);

// 2. Add client-cursor-move bind and update member_removed
const pusherBindInsert = `
        channel.bind('pusher:member_removed', (member: any) => {
          if (!isMounted) return;
          setActiveUsersInPage((prev: any[]) => prev.filter(u => u.user_id !== member.id));
          setCursors((prev: any) => {
            const next = { ...prev };
            delete next[member.id];
            return next;
          });
        });

        channel.bind('client-cursor-move', (payload: any) => {
          if (!isMounted || !payload.userId) return;
          // Filter out our own
          const w = window as any;
          if (payload.userId === w.__crm_client_id) return;
          
          setCursors((prev: any) => ({
            ...prev,
            [payload.userId]: { x: payload.x, y: payload.y, name: payload.name }
          }));
        });
`;
content = content.replace(/        channel\.bind\('pusher:member_removed', \(member: any\) => \{\s*if \(\!isMounted\) return;\s*setActiveUsersInPage\(\(prev: any\[\]\) => prev\.filter\(u => u\.user_id !== member\.id\)\);\s*\}\);/, pusherBindInsert);

// 3. Export channel and user name to window
const windowSetupInsert = `
        const w = window as any;
        if (w.__crm_pusher && w.__crm_pusher !== pusher) {
           try { w.__crm_pusher.disconnect(); } catch(e) {}
        }
        w.__crm_client_id = currentUserId;
        w.__crm_user_name = currentUserName;
        w.__crm_pusher = pusher;
        w.__crm_pusher_channel = channel;
`;
content = content.replace(/        const w = window as any;\s*if \(w\.__crm_pusher && w\.__crm_pusher !== pusher\) \{\s*try \{ w\.__crm_pusher\.disconnect\(\); \} catch\(e\) \{\}\s*\}\s*w\.__crm_client_id = myClientId;\s*w\.__crm_pusher = pusher;/, windowSetupInsert);

// 4. Add mouse move handler and cursor rendering
const mainRenderMatch = '  return (\n    <div className="flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm">';
const mainRenderInsert = `  const handleMouseMove = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastCursorUpdateRef.current > 50) { // 50ms throttle
      lastCursorUpdateRef.current = now;
      const w = window as any;
      if (w.__crm_pusher_channel) {
        w.__crm_pusher_channel.trigger('client-cursor-move', {
          userId: w.__crm_client_id,
          name: w.__crm_user_name,
          x: e.clientX,
          y: e.clientY,
        });
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-full overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm relative"
      onMouseMove={handleMouseMove}
    >
      {/* Collaborative Cursors */}
      {Object.entries(cursors).map(([id, cursor]) => (
        <div 
          key={id} 
          className="pointer-events-none fixed z-[9999] transition-all duration-75 ease-linear"
          style={{ 
            left: cursor.x, 
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          {/* Cursor SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
            <path d="M5.65376 2.15376C5.40578 1.90578 5.01166 1.96866 4.84651 2.28014L0.283184 10.8879C0.0898687 11.2526 0.35415 11.6875 0.764491 11.6875H4.6875V15.6105C4.6875 16.0208 5.12239 16.2851 5.48713 16.0918L14.0949 11.5285C14.4063 11.3633 14.4692 10.9692 14.2212 10.7212L5.65376 2.15376Z" fill="#F43F5E"/>
            <path d="M5.65376 2.15376C5.40578 1.90578 5.01166 1.96866 4.84651 2.28014L0.283184 10.8879C0.0898687 11.2526 0.35415 11.6875 0.764491 11.6875H4.6875V15.6105C4.6875 16.0208 5.12239 16.2851 5.48713 16.0918L14.0949 11.5285C14.4063 11.3633 14.4692 10.9692 14.2212 10.7212L5.65376 2.15376Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full rounded-tl-none shadow-sm whitespace-nowrap mt-1 ml-3">
            {cursor.name}
          </div>
        </div>
      ))}
`;
content = content.replace(mainRenderMatch, mainRenderInsert);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', content);
console.log('Cursor logic injected successfully!');
