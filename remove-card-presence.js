const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

c = c.replace(`const [activeUsersByDeal, setActiveUsersByDeal] = useState<Record<string, any[]>>({});`, '');

const trackingEffectTarget = `  useEffect(() => {
    const w = window as any;
    if (w.__crm_channel && w.__crm_me && w.__crm_client_id) {
      const activeDealId = (isModalOpen && selectedDeal) ? selectedDeal.id : draggedDealId;
      
      w.__crm_channel.track({ 
        client_id: w.__crm_client_id, 
        user_id: w.__crm_me.id, 
        name: w.__crm_me.name, 
        viewing_deal_id: activeDealId 
      }).catch((err: any) => console.warn('Presence track error:', err));
    }
  }, [isModalOpen, selectedDeal, draggedDealId]);`;
c = c.replace(trackingEffectTarget, '');

c = c.replace(`name: me.name, viewing_deal_id: null`, `name: me.name`);

const presenceSyncTarget = `        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const newActiveUsers: Record<string, any[]> = {};
          const usersInPageMap: Record<string, any> = {};
          
          for (const userId in state) {
            const presences = state[userId];
            if (presences && presences.length > 0) {
              for (const presence of presences) {
                usersInPageMap[presence.user_id] = presence;
                
                if (presence.viewing_deal_id && presence.client_id !== myClientId) {
                  if (!newActiveUsers[presence.viewing_deal_id]) newActiveUsers[presence.viewing_deal_id] = [];
                  // Deduplicate by user_id so one user doesn't show multiple times on the same card if they use multiple tabs
                  if (!newActiveUsers[presence.viewing_deal_id].find(u => u.user_id === presence.user_id)) {
                    newActiveUsers[presence.viewing_deal_id].push(presence);
                  }
                }
              }
            }
          }
          setActiveUsersByDeal(newActiveUsers);
          setActiveUsersInPage(Object.values(usersInPageMap));
        });`;
const presenceSyncReplacement = `        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const usersInPageMap: Record<string, any> = {};
          
          for (const userId in state) {
            const presences = state[userId];
            if (presences && presences.length > 0) {
              for (const presence of presences) {
                usersInPageMap[presence.user_id] = presence;
              }
            }
          }
          setActiveUsersInPage(Object.values(usersInPageMap));
        });`;
c = c.replace(presenceSyncTarget, presenceSyncReplacement);

const jsxTarget = `                      className={\`p-4 rounded-2xl shadow-sm cursor-pointer transition-all active:cursor-grabbing group relative border \${
                        activeUsersByDeal[deal.id] && activeUsersByDeal[deal.id].length > 0
                          ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/40'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }\`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={(e) => handleDragEnd(e, deal.id)}
                      onClick={(e) => {
                        // Prevent opening modal if clicking archive button
                        if ((e.target as HTMLElement).closest('.archive-btn')) return;
                        openDealModal(deal);
                      }}
                    >
                      {/* Active Users Viewing this Deal */}
                      {activeUsersByDeal[deal.id] && activeUsersByDeal[deal.id].map((user, idx) => (
                        <div 
                          key={user.user_id}
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-blue-300 animate-pulse z-50"
                          title={\`\${user.name} está visualizando este card\`}
                        >
                          {user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      ))}`;
const jsxReplacement = `                      className="p-4 rounded-2xl shadow-sm cursor-pointer transition-all active:cursor-grabbing group relative border bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={(e) => handleDragEnd(e, deal.id)}
                      onClick={(e) => {
                        // Prevent opening modal if clicking archive button
                        if ((e.target as HTMLElement).closest('.archive-btn')) return;
                        openDealModal(deal);
                      }}
                    >`;
c = c.replace(jsxTarget, jsxReplacement);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
