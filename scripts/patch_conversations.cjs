const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/conversations/page.tsx', 'utf8');

const oldState = `    const [panelConfig, setPanelConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realizzare_contact_panel_config');
      if (saved) return JSON.parse(saved);
    }
    return {
      order: ["personal", "cursos", "automacoes", "transacoes", "timeline", "notes"],
      openState: { personal: true, cursos: false, automacoes: false, transacoes: false, timeline: false, notes: false }
    };
  });`;

const newState = `    const [panelConfig, setPanelConfig] = useState(() => {
    const defaultState = {
      order: ["personal", "cursos", "automacoes", "transacoes", "notes"],
      openState: { personal: true, cursos: false, automacoes: false, transacoes: false, notes: false }
    };
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('realizzare_contact_panel_config');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.order && parsed.order.includes('timeline')) {
            parsed.order = parsed.order.map((k) => k === 'timeline' ? 'automacoes' : k);
            if (parsed.openState && parsed.openState.timeline !== undefined) {
              parsed.openState.automacoes = parsed.openState.timeline;
              delete parsed.openState.timeline;
            }
            if (!parsed.order.includes('automacoes')) parsed.order.push('automacoes');
            localStorage.setItem('realizzare_contact_panel_config', JSON.stringify(parsed));
          } else if (parsed.order && !parsed.order.includes('automacoes')) {
             parsed.order.push('automacoes');
             localStorage.setItem('realizzare_contact_panel_config', JSON.stringify(parsed));
          }
          return parsed;
        } catch (e) { }
      }
    }
    return defaultState;
  });`;

c = c.replace(oldState, newState);

const oldLabels = "sec === 'personal' ? 'Info Pessoais' : sec === 'cursos' ? 'Cursos' : sec === 'automacoes' ? 'Fluxos de Automação' : sec === 'transacoes' ? 'Transações' : sec === 'timeline' ? 'Linha do Tempo' : 'Observações'";
const newLabels = "sec === 'personal' ? 'Info Pessoais' : sec === 'cursos' ? 'Cursos' : sec === 'automacoes' ? 'Fluxos de Automação' : sec === 'transacoes' ? 'Transações' : 'Observações'";

c = c.replace(oldLabels, newLabels);

fs.writeFileSync('src/app/dashboard/conversations/page.tsx', c);
console.log('Fixed state and labels');
