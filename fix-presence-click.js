const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const subscribeTarget = `          if (status === 'SUBSCRIBED') {
            await channel.track({ client_id: myClientId, user_id: me.id, name: me.name, viewing_deal_id: null });
            const w = window as any;
            if (w.__crm_channel && w.__crm_channel !== channel) {
               try { w.__crm_channel.unsubscribe(); } catch(e) {}
            }`;
const subscribeReplacement = `          if (status === 'SUBSCRIBED') {
            try {
              await channel.track({ client_id: myClientId, user_id: me.id, name: me.name, viewing_deal_id: null });
            } catch(e) { console.warn("Initial presence track failed", e); }
            
            const w = window as any;
            if (w.__crm_channel && w.__crm_channel !== channel) {
               try { w.__crm_channel.unsubscribe(); } catch(e) {}
            }`;
c = c.replace(subscribeTarget, subscribeReplacement);

const hoverTarget = `  // Track modal and hover
  const [hoveredDealId, setHoveredDealId] = useState<string | null>(null);
  const trackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverAutoClearRef = useRef<NodeJS.Timeout | null>(null);

  const handleCardHover = (dealId: string | null) => {
    setHoveredDealId(dealId);
    if (hoverAutoClearRef.current) clearTimeout(hoverAutoClearRef.current);
    
    // Auto-clear hover after 3 seconds of inactivity (if not in modal)
    if (dealId) {
      hoverAutoClearRef.current = setTimeout(() => {
        setHoveredDealId(null);
      }, 3000);
    }
  };

  useEffect(() => {
    const w = window as any;
    if (w.__crm_channel && w.__crm_me && w.__crm_client_id) {
      const activeDealId = (isModalOpen && selectedDeal) ? selectedDeal.id : hoveredDealId;
      
      if (trackTimeoutRef.current) clearTimeout(trackTimeoutRef.current);
      
      trackTimeoutRef.current = setTimeout(() => {
        w.__crm_channel.track({ 
          client_id: w.__crm_client_id, 
          user_id: w.__crm_me.id, 
          name: w.__crm_me.name, 
          viewing_deal_id: activeDealId 
        }).catch((err: any) => console.warn('Presence track error:', err));
      }, 300);
    }
    
    return () => {
      if (trackTimeoutRef.current) clearTimeout(trackTimeoutRef.current);
      if (hoverAutoClearRef.current) clearTimeout(hoverAutoClearRef.current);
    };
  }, [isModalOpen, selectedDeal, hoveredDealId]);`;

const hoverReplacement = `  // Track modal and drag
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  useEffect(() => {
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

c = c.replace(hoverTarget, hoverReplacement);

const dragStartTarget = `const handleDragStart = (e: React.DragEvent, dealId: string) => {`;
const dragStartReplacement = `const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);`;
c = c.replace(dragStartTarget, dragStartReplacement);

const dragEndTarget = `const handleDragEnd = (e: React.DragEvent, dealId: string) => {`;
const dragEndReplacement = `const handleDragEnd = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(null);`;
c = c.replace(dragEndTarget, dragEndReplacement);

const jsxHoverTarget = `                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={(e) => handleDragEnd(e, deal.id)}
                      onMouseEnter={() => handleCardHover(deal.id)}
                      onMouseMove={() => handleCardHover(deal.id)}
                      onMouseLeave={() => handleCardHover(null)}
                      onClick={(e) => {`;
const jsxHoverReplacement = `                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onDragEnd={(e) => handleDragEnd(e, deal.id)}
                      onClick={(e) => {`;
c = c.replace(jsxHoverTarget, jsxHoverReplacement);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
console.log('done');
