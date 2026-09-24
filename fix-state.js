const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const target = `  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d));
    dispatchNotification(updatedDeal);
  };

  const handleDeleteDeal = (dealId: string) => {
    if (confirm('Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.')) {
      setDeals(prev => prev.filter(d => d.id !== dealId));
    }
  };

  // Drag handlers for Cards
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    
    setTimeout(() => {
      const el = document.getElementById(\`deal-\${dealId}\`);
      if (el) el.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(null);
    setDragOverColId(null);
    const el = document.getElementById(\`deal-\${dealId}\`);
    if (el) el.style.opacity = "1";
  };

  // Drag handlers for Columns
  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault(); 
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: ColumnId) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    setDragOverColId(null);
    if (!draggedDealId) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === draggedDealId ? { ...d, columnId: colId } : d))
    );
    
    // Save state
    fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedDealId, action: "update", payload: { columnId: colId } })
    });
  };`;

const replacement = `  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(d => d.id === updatedDeal.id ? { ...d, ...updatedDeal } : d));
    dispatchNotification(updatedDeal);
    
    // Save state
    fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: updatedDeal.id, action: "update", payload: { columnId: updatedDeal.columnId, assignedTo: updatedDeal.assignedTo } })
    });
  };

  const handleDeleteDeal = (dealId: string) => {
    if (confirm('Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.')) {
      setDeals(prev => prev.filter(d => d.id !== dealId));
      
      // Save state
      fetch("/api/crm/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, action: "archive" })
      });
    }
  };

  // Drag handlers for Cards
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    
    setTimeout(() => {
      const el = document.getElementById(\`deal-\${dealId}\`);
      if (el) el.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(null);
    setDragOverColId(null);
    const el = document.getElementById(\`deal-\${dealId}\`);
    if (el) el.style.opacity = "1";
  };

  // Drag handlers for Columns
  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault(); 
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: ColumnId) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    setDragOverColId(null);
    if (!draggedDealId) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === draggedDealId ? { ...d, columnId: colId } : d))
    );
    
    // Save state
    fetch("/api/crm/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggedDealId, action: "update", payload: { columnId: colId } })
    });
  };`;

// Regex replacement
const regex = /const\ handleUpdateDeal[\s\S]*?body:\ JSON\.stringify\(\{ id: draggedDealId, action: "update", payload: \{ columnId: colId \} \}\)\s*\}\);\s*\};/g;

// Wait, the original text does NOT have the fetch inside handleDrop.
// My target string has it. Let me just replace the whole block by finding index.

let newC = c.replace(/const handleUpdateDeal = \(updatedDeal: Deal\) => \{[\s\S]*?const handleDrop = \(e: React\.DragEvent, colId: ColumnId\) => \{[\s\S]*?\}\);[\s]*\};/, replacement);

fs.writeFileSync('src/app/dashboard/crm/page.tsx', newC);
console.log('done');
