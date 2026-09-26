const fs = require('fs');

let c = fs.readFileSync('src/components/FlowCanvas.tsx', 'utf8');

const eventVarsLogic = `
  const [showVarsPanel, setShowVarsPanel] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const getEventVarsForTrigger = (triggerMetric: string) => {
    const base = [
      { label: 'Primeiro Nome', tag: '{{primeiro_nome}}' },
      { label: 'Nome Completo', tag: '{{nome_completo}}' },
      { label: 'E-mail', tag: '{{email}}' },
      { label: 'Telefone', tag: '{{telefone}}' },
      { label: 'Link Descadastro', tag: '{{link_descadastro}}' },
      { label: 'Link Preferências', tag: '{{link_preferencias}}' },
    ];
    const eventVars: Record<string, {label: string, tag: string}[]> = {
      'Matrícula Realizada': [
        { label: 'Nome do Curso', tag: '{{evento.course_name}}' },
      ],
      'Certificado Emitido': [
        { label: 'Nome do Curso', tag: '{{evento.course_name}}' },
        { label: 'Link do Certificado', tag: '{{evento.cert_url}}' },
        { label: 'Código do Certificado', tag: '{{evento.cert_code}}' },
      ],
      'Transação Aprovada': [
        { label: 'Valor', tag: '{{evento.amount}}' },
        { label: 'Produto', tag: '{{evento.item_title}}' },
        { label: 'Forma de Pagamento', tag: '{{evento.payment_method}}' },
        { label: 'ID do Pedido', tag: '{{evento.pagarme_id}}' },
      ],
      'Boleto Gerado': [
        { label: 'Valor', tag: '{{evento.amount}}' },
        { label: 'Produto', tag: '{{evento.item_title}}' },
        { label: 'ID do Pedido', tag: '{{evento.pagarme_id}}' },
      ],
      'Carrinho Abandonado': [
        { label: 'Nome do Curso', tag: '{{evento.course_name}}' },
      ],
      'Reprovação na Prova': [
        { label: 'Nome do Curso', tag: '{{evento.course_name}}' },
      ],
      'Novo Lead Cadastrado': [
        { label: 'Origem do Lead', tag: '{{evento.origin}}' },
      ],
    };
    const extra = Object.entries(eventVars).find(([k]) => triggerMetric?.includes(k))?.[1] || [];
    return [...extra, ...base];
  };
`;

c = c.replace('const [showTagsDropdown, setShowTagsDropdown] = useState(false);', 'const [showTagsDropdown, setShowTagsDropdown] = useState(false);\n' + eventVarsLogic);

const iconImport = `import { Settings, Play, Pause, Save, Check, Code, Mail, Clock, LayoutDashboard, Copy, CheckCircle2, ChevronDown, ListFilter, Users, MousePointer2, BoxSelect, Trash2, ArrowLeft, MoreVertical, Search, Zap, Plus, Type, Braces } from "lucide-react";`;
c = c.replace(/import \{.*?\} from "lucide-react";/, iconImport);

fs.writeFileSync('src/components/FlowCanvas.tsx', c);
console.log('done vars logic');
