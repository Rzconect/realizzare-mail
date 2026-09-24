const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const stateTarget = `  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);`;
const stateReplacement = `  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);
  const [activeUsersByDeal, setActiveUsersByDeal] = useState<Record<string, any[]>>({});

  // Setup Supabase Presence and Realtime sync
  useEffect(() => {
    let channel: any = null;
    let isMounted = true;
    
    const setupPresence = async () => {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        let me: any = null;
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (profile) me = profile;
        }
        
        if (!me) me = { id: Math.random().toString(), name: "Colaborador", email: "guest@example.com" };
        
        channel = supabase.channel('crm_presence', {
          config: { presence: { key: me.id } },
        });
        
        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState();
          const newActiveUsers: Record<string, any[]> = {};
          
          for (const userId in state) {
            const presences = state[userId];
            if (presences && presences.length > 0) {
              const presence = presences[0];
              if (presence.viewing_deal_id && presence.user_id !== me.id) {
                if (!newActiveUsers[presence.viewing_deal_id]) newActiveUsers[presence.viewing_deal_id] = [];
                newActiveUsers[presence.viewing_deal_id].push(presence);
              }
            }
          }
          setActiveUsersByDeal(newActiveUsers);
        });

        // Listen for real-time moves and deletes
        channel.on('broadcast', { event: 'card_moved' }, (payload: any) => {
          if (!isMounted) return;
          setDeals(prev => prev.map(d => d.id === payload.payload.dealId ? { ...d, columnId: payload.payload.colId } : d));
        });

        channel.on('broadcast', { event: 'card_deleted' }, (payload: any) => {
          if (!isMounted) return;
          setDeals(prev => prev.filter(d => d.id !== payload.payload.dealId));
        });

        channel.on('broadcast', { event: 'card_updated' }, (payload: any) => {
          if (!isMounted) return;
          setDeals(prev => prev.map(d => d.id === payload.payload.deal.id ? { ...d, ...payload.payload.deal } : d));
        });
        
        channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: me.id, name: me.name, viewing_deal_id: null });
            (window as any).__crm_me = me;
            (window as any).__crm_channel = channel;
          }
        });
    };
    
    setupPresence();
    
    return () => {
      isMounted = false;
      if (channel) channel.unsubscribe();
    };
  }, []);
  
  // Track modal open/close
  useEffect(() => {
    const w = window as any;
    if (w.__crm_channel && w.__crm_me) {
      if (isModalOpen && selectedDeal) {
        w.__crm_channel.track({ user_id: w.__crm_me.id, name: w.__crm_me.name, viewing_deal_id: selectedDeal.id });
      } else {
        w.__crm_channel.track({ user_id: w.__crm_me.id, name: w.__crm_me.name, viewing_deal_id: null });
      }
    }
  }, [isModalOpen, selectedDeal]);`;

c = c.replace(stateTarget, stateReplacement);

const updateTarget = `fetch("/api/crm/update", {
      method: "POST",`;
const updateReplacement = `const w = window as any;
    if (w.__crm_channel) {
      w.__crm_channel.send({ type: 'broadcast', event: 'card_updated', payload: { deal: updatedDeal } });
    }
    
    fetch("/api/crm/update", {
      method: "POST",`;
c = c.replace(updateTarget, updateReplacement);

const archiveTarget = `fetch("/api/crm/update", {
        method: "POST",`;
const archiveReplacement = `const w = window as any;
      if (w.__crm_channel) {
        w.__crm_channel.send({ type: 'broadcast', event: 'card_deleted', payload: { dealId } });
      }
      
      fetch("/api/crm/update", {
        method: "POST",`;
c = c.replace(archiveTarget, archiveReplacement);

const dropTarget = `fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedDealId, action: "update", payload: { columnId: colId } })
    });`;
const dropReplacement = `const w = window as any;
    if (w.__crm_channel) {
      w.__crm_channel.send({ type: 'broadcast', event: 'card_moved', payload: { dealId: draggedDealId, colId } });
    }
    
    fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedDealId, action: "update", payload: { columnId: colId } })
    });`;
c = c.replace(dropTarget, dropReplacement);

const cardTarget = `<button
                        onClick={(e) => {`;
const cardReplacement = `{activeUsersByDeal[deal.id] && activeUsersByDeal[deal.id].map((user, idx) => (
                        <div key={user.user_id} className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-blue-300 animate-pulse z-20" title={\`\${user.name} está visualizando\`} style={{ right: \`\${idx * -10 - 8}px\` }}>
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      
                      <button
                        onClick={(e) => {`;
c = c.split(cardTarget).join(cardReplacement);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
