const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

c = c.replace(
  `const [activeUsersByDeal, setActiveUsersByDeal] = useState<Record<string, any[]>>({});`,
  `const [activeUsersByDeal, setActiveUsersByDeal] = useState<Record<string, any[]>>({});\n  const [activeUsersInPage, setActiveUsersInPage] = useState<any[]>([]);`
);

const syncTarget = `        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const newActiveUsers: Record<string, any[]> = {};
          
          for (const userId in state) {
            const presences = state[userId];
            if (presences && presences.length > 0) {
              const presence = presences[0];
              if (presence.viewing_deal_id && presence.client_id !== myClientId) {
                if (!newActiveUsers[presence.viewing_deal_id]) newActiveUsers[presence.viewing_deal_id] = [];
                newActiveUsers[presence.viewing_deal_id].push(presence);
              }
            }
          }
          setActiveUsersByDeal(newActiveUsers);
        });`;
        
const syncReplacement = `        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const newActiveUsers: Record<string, any[]> = {};
          const usersInPageMap: Record<string, any> = {};
          
          for (const userId in state) {
            const presences = state[userId];
            if (presences && presences.length > 0) {
              const presence = presences[0];
              
              usersInPageMap[presence.client_id] = presence;
              
              if (presence.viewing_deal_id && presence.client_id !== myClientId) {
                if (!newActiveUsers[presence.viewing_deal_id]) newActiveUsers[presence.viewing_deal_id] = [];
                newActiveUsers[presence.viewing_deal_id].push(presence);
              }
            }
          }
          setActiveUsersByDeal(newActiveUsers);
          setActiveUsersInPage(Object.values(usersInPageMap));
        });`;

c = c.replace(syncTarget, syncReplacement);

const headerTarget = `<div className="flex items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          CRM <span className="mx-2 text-slate-300">•</span> FUNIL DE VENDAS
        </div>`;

const headerReplacement = `<div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-widest uppercase w-full">
          <div>CRM <span className="mx-2 text-slate-300">•</span> FUNIL DE VENDAS</div>
          
          <div className="flex items-center">
             <span className="mr-3 normal-case text-xs text-slate-400 font-medium flex items-center gap-1.5">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               {activeUsersInPage.length} online
             </span>
             <div className="flex -space-x-2">
                {activeUsersInPage.map((u, i) => (
                   <div key={u.client_id} className="h-8 w-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-transparent hover:ring-indigo-300 transition-all cursor-default" title={u.name} style={{ zIndex: 10 - i }}>
                     {u.name.substring(0, 2).toUpperCase()}
                   </div>
                ))}
             </div>
          </div>
        </div>`;

c = c.replace(headerTarget, headerReplacement);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
