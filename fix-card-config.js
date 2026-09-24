const fs = require('fs');
let c = fs.readFileSync('src/app/dashboard/crm/page.tsx', 'utf8');

const target = `  const [cardConfig, setCardConfig] = useState(initialCardConfig);
  const [atividadeCardConfig, setAtividadeCardConfig] = useState(initialAtividadeCardConfig);`;

const replacement = `  const [cardConfig, setCardConfig] = useState(initialCardConfig);
  const [atividadeCardConfig, setAtividadeCardConfig] = useState(initialAtividadeCardConfig);

  useEffect(() => {
    try {
      const savedCardConfig = localStorage.getItem("crm_card_config");
      if (savedCardConfig) setCardConfig(JSON.parse(savedCardConfig));
      const savedAtividadeConfig = localStorage.getItem("crm_atividade_card_config");
      if (savedAtividadeConfig) setAtividadeCardConfig(JSON.parse(savedAtividadeConfig));
    } catch(e){}
  }, []);

  useEffect(() => {
    localStorage.setItem("crm_card_config", JSON.stringify(cardConfig));
  }, [cardConfig]);

  useEffect(() => {
    localStorage.setItem("crm_atividade_card_config", JSON.stringify(atividadeCardConfig));
  }, [atividadeCardConfig]);`;

if (c.includes(target)) {
  c = c.replace(target, replacement);
  fs.writeFileSync('src/app/dashboard/crm/page.tsx', c);
  console.log('done');
} else {
  console.log('target not found');
}
