# Realizzare Mail — Documentação do Schema de Backend (Supabase/PostgreSQL)

## Visão Geral

Este documento descreve a arquitetura completa do banco de dados do Realizzare Mail, uma plataforma de e-mail marketing e automação para a Realizzare Cursos. O schema está organizado em **3 camadas** e **10 domínios** funcionais.

---

## Arquitetura de 3 Camadas

| Camada | Propósito | Volume Esperado | Tabelas |
|--------|-----------|-----------------|---------|
| **Transacional** | Dados do produto (CRUD principal) | Médio | contacts, campaigns, flows, segments, settings |
| **Eventos** | Registros append-only de interações | Alto | email_events, course_events, flow_step_logs |
| **Agregação** | Leitura rápida para dashboards/KPIs | Baixo | daily_metrics_summary, campaign_metrics_summary, flow_metrics_summary |

**Regra de ouro**: Telas de dashboard e KPIs leem das tabelas de agregação. Telas de detalhe/auditoria leem das tabelas de eventos. CRUD principal opera nas tabelas transacionais.

---

## Domínios e Tabelas

### 1. Auth / Organizações (Multi-Tenant)

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `organizations` | Transacional | Tenant principal (empresa/conta) |
| `org_members` | Transacional | Membros da org com roles (admin, editor, viewer) |

Todas as demais tabelas possuem `org_id` referenciando `organizations.id` para isolamento de dados.

### 2. Contatos

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `contacts` | Transacional | Dados principais do lead (nome, email, telefone, localização, status) |
| `custom_fields` | Transacional | Definição de campos personalizados (nome, tipo, tag) |
| `contact_custom_values` | Transacional | Valores tipados dos campos personalizados por contato |
| `tags` | Transacional | Tags globais do sistema com cor |
| `contact_tags` | Transacional | Associação M:N contato ↔ tag |

### 3. Listas e Segmentos

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `lists` | Transacional | Listas de transmissão estáticas |
| `list_subscriptions` | Transacional | Inscrições de contatos em listas (subscribed/unsubscribed) |
| `segments` | Transacional | Segmentações dinâmicas ou estáticas |
| `segment_rules` | Transacional | Regras de cada segmento (campo, operador, valor, grupo lógico) |

### 4. Cursos e Matrículas

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `courses` | Transacional | Catálogo de cursos |
| `enrollments` | Transacional | Matrículas com progresso e certificação |
| `purchases` | Transacional | Transações financeiras |

### 5. Campanhas

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `campaigns` | Transacional | Campanhas de e-mail (assunto, remetente, HTML, métricas inline) |
| `campaign_segments` | Transacional | Segmentos incluídos/excluídos por campanha |

### 6. Fluxos / Automações

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `flows` | Transacional | Metadados do fluxo (trigger, reentry, exit conditions) |
| `flow_nodes` | Transacional | Nós do fluxo visual (email, delay, split, webhook) |
| `flow_node_connections` | Transacional | Conexões entre nós |
| `flow_enrollments` | Transacional | Contatos dentro de um fluxo com estado de progressão |

### 7. Configurações

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `sending_domains` | Transacional | Domínios verificados (SPF, DKIM, DMARC) |
| `api_keys` | Transacional | Chaves de API para integrações externas |
| `webhooks` | Transacional | Webhooks outbound (URLs e eventos) |
| `suppression_list` | Transacional | E-mails suprimidos |
| `account_settings` | Transacional | Configurações gerais em JSONB |

### 8. Conteúdo / Mídia

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `media_folders` | Transacional | Pastas para organização de mídia |
| `media_files` | Transacional | Arquivos (imagens, logos) para templates |

### 9. Eventos (Alto Volume)

| Tabela | Tipo | Descrição | Integração Futura |
|--------|------|-----------|-------------------|
| `email_events` | Evento | Eventos de e-mail (sent, delivered, opened, clicked, bounced, spam, unsub) | Amazon SES (SNS) |
| `course_events` | Evento | Eventos da Realizzare (matrícula, progresso, conclusão, certificado) | API Realizzare |
| `flow_step_logs` | Evento | Log de progressão entre nós de fluxos | Interno |
| `inbound_webhook_events` | Evento | Webhooks recebidos de sistemas externos (fila de processamento) | SES, Realizzare, Zapier |
| `audit_logs` | Evento | Log de auditoria de ações administrativas | Interno |

### 10. Agregações (Fase 2)

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `daily_metrics_summary` | Agregação | Métricas diárias para dashboard principal |
| `campaign_metrics_summary` | Agregação | Métricas diárias por campanha |
| `flow_metrics_summary` | Agregação | Métricas diárias por fluxo |

**Status atual**: Estrutura criada, sem triggers de preenchimento automático. Na Fase 2, triggers `AFTER INSERT` em `email_events` farão UPSERT incremental nestas tabelas.

---

## Segurança (RLS)

- **Multi-tenant**: Todas as tabelas com `org_id` usam `get_user_org_id()` na policy
- **Tabelas de junção** (contact_tags, etc.): RLS via subquery na tabela pai
- **Service Role**: Bypassa RLS automaticamente (usado em API routes e webhooks)
- **Função helper**: `get_user_org_id()` é `STABLE SECURITY DEFINER` para performance

---

## Triggers Automáticos

| Trigger | Tabela | Ação |
|---------|--------|------|
| `set_updated_at` | 12 tabelas com `updated_at` | Atualiza timestamp automaticamente |
| `trg_list_subscriber_count` | `list_subscriptions` | Recalcula `lists.subscriber_count` |
| `trg_contact_total_spent` | `purchases` | Recalcula `contacts.total_spent` |

---

## Índices Estratégicos

- **Compostos B-tree** em filtros comuns: `(org_id, status)`, `(org_id, created_at DESC)`
- **Trigram GIN** em `contacts` para busca textual por nome
- **Eventos**: Índices em `(campaign_id, event_type)` e `(org_id, event_type, created_at)`
- **Agregações**: Índices em `(org_id, date DESC)` e `(campaign_id, date DESC)`

---

## Pontos de Expansão Futura (Fase 2)

1. **Triggers de agregação**: `email_events` → `campaign_metrics_summary`
2. **Materialized Views**: `contact_engagement_mv`, `deliverability_daily_mv`
3. **Segment Members Cache**: Tabela `segment_members` materializada
4. **pg_cron jobs**: Refresh de views e processamento de filas
5. **Particionamento**: `email_events` por data para volumes altos
6. **Cursor-based pagination**: Substituir OFFSET nas listagens

---

## Estrutura de Arquivos

```
supabase/
├── migrations/
│   └── 20260727000000_phase1_complete_schema.sql   ← Schema completo
└── seed.sql                                         ← Dados mockados iniciais

src/lib/supabase/
├── client.ts     ← Cliente browser (createBrowserClient)
├── server.ts     ← Cliente server (createServerClient + createServiceRoleClient)
└── types.ts      ← Tipos TypeScript gerados do schema (~1300 linhas)
```
