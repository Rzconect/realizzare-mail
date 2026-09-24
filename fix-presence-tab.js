const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const setupTarget = `        let me: any = null;
        const { data: { session } } = await supabase.auth.getSession();`;
const setupReplacement = `        const myClientId = Math.random().toString(36).substring(2, 15);
        let me: any = null;
        const { data: { session } } = await supabase.auth.getSession();`;
c = c.replace(setupTarget, setupReplacement);

const trackTarget = `await channel.track({ user_id: me.id, name: me.name, viewing_deal_id: null });
            (window as any).__crm_me = me;
            (window as any).__crm_channel = channel;`;
const trackReplacement = `await channel.track({ client_id: myClientId, user_id: me.id, name: me.name, viewing_deal_id: null });
            (window as any).__crm_me = me;
            (window as any).__crm_client_id = myClientId;
            (window as any).__crm_channel = channel;`;
c = c.replace(trackTarget, trackReplacement);

const filterTarget = `if (presence.viewing_deal_id && presence.user_id !== me.id) {`;
const filterReplacement = `if (presence.viewing_deal_id && presence.client_id !== myClientId) {`;
c = c.replace(filterTarget, filterReplacement);

const modalEffectTarget = `// Track modal open/close
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
  
const modalEffectReplacement = `// Track modal and hover
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);

  useEffect(() => {
    const w = window as any;
    if (w.__crm_channel && w.__crm_me && w.__crm_client_id) {
      const activeDealId = (isModalOpen && selectedDeal) ? selectedDeal.id : hoveredDealId;
      w.__crm_channel.track({ 
        client_id: w.__crm_client_id, 
        user_id: w.__crm_me.id, 
        name: w.__crm_me.name, 
        viewing_deal_id: activeDealId 
      });
    }
  }, [isModalOpen, selectedDeal, hoveredDealId]);`;
c = c.replace(modalEffectTarget, modalEffectReplacement);

c = c.replace(/<div\s+id=\{\`deal-\$\{deal\.id\}\`\}\s+className="group relative flex cursor-grab flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all active:cursor-grabbing"/g, 
`<div id={\`deal-\${deal.id}\`} 
                      onMouseEnter={() => setHoveredDealId(deal.id)}
                      onMouseLeave={() => setHoveredDealId(null)}
                      className={\`group relative flex cursor-grab flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all active:cursor-grabbing \${
                        activeUsersByDeal[deal.id] && activeUsersByDeal[deal.id].length > 0 
                          ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/30' 
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                      }\`}`);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
