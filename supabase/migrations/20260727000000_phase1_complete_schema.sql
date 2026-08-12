-- =====================================================================
-- REALIZZARE MAIL — Fase 1: Schema Completo do Backend
-- =====================================================================
-- Migration: 20260727000000_phase1_complete_schema.sql
-- Descrição: Schema completo para produção, substituindo as migrations
--            preliminares. Cobre todas as telas já construídas no frontend.
--
-- Organização:
--   Seção 00: Extensões
--   Seção 01: Tipos Enum
--   Seção 02: Tabelas Core (Auth / Organizações)
--   Seção 03: Tabelas de Contatos
--   Seção 04: Tabelas de Listas e Segmentos
--   Seção 05: Tabelas de Cursos e Matrículas
--   Seção 06: Tabelas de Campanhas
--   Seção 07: Tabelas de Fluxos / Automações
--   Seção 08: Tabelas de Configurações
--   Seção 09: Tabelas de Conteúdo / Mídia
--   Seção 10: Tabelas de Eventos (alto volume, append-only)
--   Seção 11: Tabelas de Agregação (estrutura para Fase 2)
--   Seção 12: Índices
--   Seção 13: Funções e Triggers
--   Seção 14: RLS Policies
-- =====================================================================

-- =====================================================================
-- LIMPEZA DO SCHEMA EXISTENTE (GARANTE SLA CLEAN)
-- =====================================================================
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Dropar tabelas
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    -- Dropar enums
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;


-- =====================================================================
-- SEÇÃO 00: EXTENSÕES
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Busca textual por similaridade (LIKE/ILIKE otimizado)

-- =====================================================================
-- SEÇÃO 01: TIPOS ENUM
-- =====================================================================
-- Nota: Usamos enums PostgreSQL para validação nativa e legibilidade.
-- Valores armazenados em inglês para consistência técnica; o frontend
-- faz a tradução visual (ex: 'active' → 'Ativo').

-- Domínio: Contatos
CREATE TYPE contact_status AS ENUM ('active', 'bounced', 'unsubscribed');
CREATE TYPE custom_field_type AS ENUM ('text', 'number', 'boolean', 'date');
CREATE TYPE list_subscription_status AS ENUM ('subscribed', 'unsubscribed');

-- Domínio: Cursos
CREATE TYPE course_type AS ENUM ('online', 'presencial', 'hibrido');
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped');
CREATE TYPE purchase_status AS ENUM ('paid', 'refunded', 'failed');
CREATE TYPE product_type AS ENUM ('course', 'subscription', 'certificate', 'other');

-- Domínio: Campanhas
CREATE TYPE campaign_status AS ENUM ('draft', 'sending', 'sent', 'scheduled', 'archived');
CREATE TYPE send_type AS ENUM ('immediate', 'scheduled');

-- Domínio: Segmentos
CREATE TYPE segment_type AS ENUM ('dynamic', 'static');
CREATE TYPE logical_operator AS ENUM ('and', 'or');

-- Domínio: Fluxos / Automações
CREATE TYPE flow_status AS ENUM ('draft', 'active', 'paused');
CREATE TYPE flow_type AS ENUM ('automation', 'transactional', 'system');
CREATE TYPE flow_node_type AS ENUM (
    'trigger', 'email', 'sms', 'whatsapp', 'delay', 'split',
    'update_contact', 'update_list', 'internal_alert', 'webhook', 'end'
);
CREATE TYPE flow_enrollment_status AS ENUM ('active', 'completed', 'removed');
CREATE TYPE flow_reentry_mode AS ENUM ('no_reentry', 'allow_reentry', 'reentry_after_period');

-- Domínio: Eventos
CREATE TYPE email_event_type AS ENUM (
    'sent', 'delivered', 'opened', 'clicked',
    'bounced', 'spam_complaint', 'unsubscribed'
);
CREATE TYPE course_event_type AS ENUM (
    'started', 'progress_updated', 'completed', 'certificate_issued'
);
CREATE TYPE webhook_processing_status AS ENUM ('pending', 'processed', 'failed');

-- Domínio: Configurações
CREATE TYPE domain_check_status AS ENUM ('ok', 'pending');
CREATE TYPE domain_verification_status AS ENUM ('verified', 'pending');
CREATE TYPE api_key_scope AS ENUM ('full', 'read_only');
CREATE TYPE webhook_config_status AS ENUM ('active', 'inactive');
CREATE TYPE suppression_reason AS ENUM ('complaint', 'hard_bounce', 'unsubscribe', 'soft_bounce_repeated');

-- Domínio: Auth / Membros
CREATE TYPE member_role AS ENUM ('admin', 'editor', 'viewer');

-- =====================================================================
-- SEÇÃO 02: TABELAS CORE (AUTH / ORGANIZAÇÕES)
-- =====================================================================
-- Multi-tenant: cada recurso pertence a uma organização (tenant).
-- org_members vincula auth.users do Supabase a uma organização com role.

CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE organizations IS 'Tenant principal. Cada empresa/conta é uma organização isolada.';

CREATE TABLE org_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role        member_role NOT NULL DEFAULT 'viewer',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, user_id)
);
COMMENT ON TABLE org_members IS 'Membros de cada organização com roles (admin, editor, viewer).';

-- =====================================================================
-- SEÇÃO 03: TABELAS DE CONTATOS
-- =====================================================================

CREATE TABLE contacts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name  TEXT,
    last_name   TEXT,
    email       TEXT NOT NULL,
    phone       TEXT,
    birth_date  DATE,
    gender      TEXT,
    country     TEXT,
    state       TEXT,
    city        TEXT,
    status      contact_status NOT NULL DEFAULT 'active',
    source      TEXT,                           -- Origem do lead (ex: formulário, importação, API)
    total_spent NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, email)                      -- Email único por organização
);
COMMENT ON TABLE contacts IS 'Dados principais de cada lead/aluno. Camada transacional.';

CREATE TABLE custom_fields (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    type        custom_field_type NOT NULL DEFAULT 'text',
    tag         TEXT NOT NULL,                  -- Identificador técnico (ex: area_de_interesse)
    objective   TEXT,                           -- Descrição/objetivo do campo
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, tag)                        -- Tag única por organização
);
COMMENT ON TABLE custom_fields IS 'Definição de campos personalizados por organização.';

CREATE TABLE contact_custom_values (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    field_id        UUID NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
    value_text      TEXT,
    value_number    NUMERIC,
    value_date      DATE,
    value_boolean   BOOLEAN,
    UNIQUE (contact_id, field_id)               -- Um valor por campo por contato
);
COMMENT ON TABLE contact_custom_values IS 'Valores dos campos personalizados. Colunas tipadas para comparações nativas.';

CREATE TABLE tags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color       TEXT,                           -- Classes CSS para estilização (ex: bg-indigo-50...)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, name)
);
COMMENT ON TABLE tags IS 'Tags globais do sistema por organização.';

CREATE TABLE contact_tags (
    contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (contact_id, tag_id)
);
COMMENT ON TABLE contact_tags IS 'Associação M:N entre contatos e tags.';

-- =====================================================================
-- SEÇÃO 04: TABELAS DE LISTAS E SEGMENTOS
-- =====================================================================

CREATE TABLE lists (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name              TEXT NOT NULL,
    description       TEXT,
    url               TEXT,                     -- URL de origem da lista (formulário, landing page)
    subscriber_count  INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE lists IS 'Listas de transmissão estáticas (ex: Lista Geral de Alunos).';

CREATE TABLE list_subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    list_id     UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    status      list_subscription_status NOT NULL DEFAULT 'subscribed',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contact_id, list_id)
);
COMMENT ON TABLE list_subscriptions IS 'Inscrição de contatos em listas com status de assinatura.';

CREATE TABLE segments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    description      TEXT,
    type             segment_type NOT NULL DEFAULT 'dynamic',
    global_operator  logical_operator NOT NULL DEFAULT 'and',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE segments IS 'Segmentações dinâmicas ou estáticas para público-alvo.';

CREATE TABLE segment_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id      UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    group_index     INTEGER NOT NULL DEFAULT 0,  -- Índice do grupo de condições (0, 1, 2)
    group_operator  logical_operator NOT NULL DEFAULT 'and',
    field           TEXT NOT NULL,               -- Nome do campo (ex: status, course, tag, cf_area_de_interesse)
    operator        TEXT NOT NULL,               -- Operador (eq, neq, contains, gt, gte, lte, between)
    value           TEXT NOT NULL,               -- Valor comparado (texto serializado)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE segment_rules IS 'Regras individuais de cada segmento, agrupadas por group_index.';

-- =====================================================================
-- SEÇÃO 05: TABELAS DE CURSOS E MATRÍCULAS
-- =====================================================================

CREATE TABLE courses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    price       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    type        course_type,
    sku         TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE courses IS 'Catálogo de cursos da Realizzare.';

CREATE TABLE enrollments (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id               UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id           UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    course_id            UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status               enrollment_status NOT NULL DEFAULT 'active',
    progress             NUMERIC(5,2) NOT NULL DEFAULT 0.00
                         CHECK (progress >= 0.00 AND progress <= 100.00),
    enrolled_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at         TIMESTAMPTZ,
    certificate_issued   BOOLEAN NOT NULL DEFAULT false,
    certificate_issued_at TIMESTAMPTZ,
    last_accessed_at     TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contact_id, course_id)              -- Uma matrícula por contato por curso
);
COMMENT ON TABLE enrollments IS 'Matrículas de contatos em cursos com progresso e certificação.';

CREATE TABLE purchases (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    product_type    product_type NOT NULL,
    product_name    TEXT NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    sku             TEXT,
    status          purchase_status NOT NULL DEFAULT 'paid',
    paid_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE purchases IS 'Compras/transações financeiras (cursos, certificados, assinaturas).';

-- =====================================================================
-- SEÇÃO 06: TABELAS DE CAMPANHAS
-- =====================================================================

CREATE TABLE campaigns (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                            TEXT NOT NULL,
    subject                         TEXT,
    preview_text                    TEXT,
    from_name                       TEXT,
    from_email                      TEXT,
    reply_to                        TEXT,
    status                          campaign_status NOT NULL DEFAULT 'draft',
    html_content                    TEXT,
    target_list                     TEXT,            -- Nome da lista alvo (legível, para exibição)
    send_type                       send_type NOT NULL DEFAULT 'immediate',
    scheduled_at                    TIMESTAMPTZ,
    sent_at                         TIMESTAMPTZ,
    timezone_mode                   TEXT DEFAULT 'account',
    late_timezone_behavior          TEXT DEFAULT 'send_immediately',
    determine_recipients_at_send    BOOLEAN NOT NULL DEFAULT false,
    -- Métricas inline (atualizadas por triggers na Fase 2)
    sent_count                      INTEGER NOT NULL DEFAULT 0,
    open_count                      INTEGER NOT NULL DEFAULT 0,
    click_count                     INTEGER NOT NULL DEFAULT 0,
    bounce_count                    INTEGER NOT NULL DEFAULT 0,
    spam_count                      INTEGER NOT NULL DEFAULT 0,
    unsubscribe_count               INTEGER NOT NULL DEFAULT 0,
    conversions                     INTEGER NOT NULL DEFAULT 0,
    revenue                         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE campaigns IS 'Campanhas de e-mail marketing (pontuais e dentro de flows).';

CREATE TABLE campaign_segments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    segment_id      UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('include', 'exclude')),
    UNIQUE (campaign_id, segment_id)
);
COMMENT ON TABLE campaign_segments IS 'Segmentos incluídos/excluídos por campanha (M:N).';

-- =====================================================================
-- SEÇÃO 07: TABELAS DE FLUXOS / AUTOMAÇÕES
-- =====================================================================

CREATE TABLE flows (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    status                  flow_status NOT NULL DEFAULT 'draft',
    flow_type               flow_type NOT NULL DEFAULT 'automation',
    trigger_type            TEXT,                -- Tipo do disparador (ex: 'Iniciou Curso')
    trigger_metric          TEXT,                -- Métrica detalhada do trigger
    trigger_filters         JSONB NOT NULL DEFAULT '[]'::jsonb,
    profile_filters         JSONB NOT NULL DEFAULT '[]'::jsonb,
    re_entry_mode           flow_reentry_mode NOT NULL DEFAULT 'no_reentry',
    re_entry_period_value   INTEGER,
    re_entry_period_unit    TEXT,                -- minutes, hours, days, weeks
    exit_conditions         JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Métricas inline (atualizadas por processos na Fase 2)
    active_contacts         INTEGER NOT NULL DEFAULT 0,
    finished_contacts       INTEGER NOT NULL DEFAULT 0,
    certificates_issued     INTEGER NOT NULL DEFAULT 0,
    revenue                 NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE flows IS 'Metadados de fluxos de automação e transacionais.';

CREATE TABLE flow_nodes (
    id              TEXT PRIMARY KEY,            -- ID gerado pelo frontend (ex: node-1721...)
    flow_id         UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    node_type       flow_node_type NOT NULL,
    position_x      DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y      DOUBLE PRECISION NOT NULL DEFAULT 0,
    config          JSONB NOT NULL DEFAULT '{}'::jsonb,  -- Configuração específica do nó
    parent_node_id  TEXT,                        -- Referência ao nó pai (tree structure)
    branch_label    TEXT,                        -- 'yes' ou 'no' para splits condicionais
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE flow_nodes IS 'Nós do fluxo visual (email, delay, split, webhook, etc.).';

CREATE TABLE flow_node_connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id         UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    source_node_id  TEXT NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
    target_node_id  TEXT NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
    branch_label    TEXT
);
COMMENT ON TABLE flow_node_connections IS 'Conexões direcionais entre nós do fluxo.';

CREATE TABLE flow_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    flow_id         UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    current_node_id TEXT REFERENCES flow_nodes(id) ON DELETE SET NULL,
    status          flow_enrollment_status NOT NULL DEFAULT 'active',
    entered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    exited_at       TIMESTAMPTZ,
    exit_reason     TEXT
);
COMMENT ON TABLE flow_enrollments IS 'Contatos dentro de um fluxo com estado de progressão.';

-- =====================================================================
-- SEÇÃO 08: TABELAS DE CONFIGURAÇÕES
-- =====================================================================

CREATE TABLE sending_domains (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain                  TEXT NOT NULL,
    verification_status     domain_verification_status NOT NULL DEFAULT 'pending',
    spf_status              domain_check_status NOT NULL DEFAULT 'pending',
    dkim_status             domain_check_status NOT NULL DEFAULT 'pending',
    dmarc_status            domain_check_status NOT NULL DEFAULT 'pending',
    dns_records             JSONB,               -- Registros DNS esperados (SPF, DKIM, DMARC)
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, domain)
);
COMMENT ON TABLE sending_domains IS 'Domínios de envio com verificação SPF/DKIM/DMARC.';

CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    key_hash        TEXT NOT NULL,               -- Hash da chave (nunca armazenar plaintext)
    key_prefix      TEXT NOT NULL,               -- Prefixo visível (ex: sk_live_••••d87a)
    scope           api_key_scope NOT NULL DEFAULT 'full',
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE api_keys IS 'Chaves de API privadas para integrações externas.';

CREATE TABLE webhooks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    events      TEXT[] NOT NULL DEFAULT '{}',    -- Array de tipos de evento (Delivered, Bounce, etc.)
    status      webhook_config_status NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE webhooks IS 'Configurações de webhooks outbound (notificações para URLs externas).';

CREATE TABLE suppression_list (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    reason      suppression_reason NOT NULL,
    origin      TEXT,                           -- Origem da supressão (ex: Campanha Black Friday)
    removable   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, email)
);
COMMENT ON TABLE suppression_list IS 'E-mails suprimidos (bounces, complaints, unsubscribes manuais).';

CREATE TABLE account_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    settings    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id)                             -- Uma configuração por organização
);
COMMENT ON TABLE account_settings IS 'Configurações gerais da conta em JSONB (remetente padrão, timezone, etc.).';
COMMENT ON COLUMN account_settings.settings IS 'Exemplo: {"sender_name": "Realizzare", "sender_email": "contato@realizzare.com.br", "reply_to": "suporte@...", "timezone": "America/Sao_Paulo", "currency": "BRL", "smart_sending_hours": 16, "ses_config_set": "...", "address": "..."}';

-- =====================================================================
-- SEÇÃO 09: TABELAS DE CONTEÚDO / MÍDIA
-- =====================================================================

CREATE TABLE media_folders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE media_folders IS 'Pastas para organização de arquivos de mídia.';

CREATE TABLE media_files (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    size_bytes  BIGINT,
    file_type   TEXT,                           -- PNG, JPEG, GIF, etc.
    url         TEXT,                           -- URL do arquivo no Storage
    folder_id   UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE media_files IS 'Arquivos de mídia (imagens, logos, banners) para templates de email.';

-- =====================================================================
-- SEÇÃO 10: TABELAS DE EVENTOS (ALTO VOLUME, APPEND-ONLY)
-- =====================================================================
-- Essas tabelas registram interações e eventos detalhados.
-- São append-only e projetadas para alto volume.
-- Na Fase 2, terão triggers para alimentar tabelas de agregação.

CREATE TABLE email_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    flow_id     UUID REFERENCES flows(id) ON DELETE SET NULL,
    flow_node_id TEXT,                          -- ID do nó do fluxo (se aplicável)
    event_type  email_event_type NOT NULL,
    metadata    JSONB,                          -- Dados extras (URL clicada, user-agent, IP)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE email_events IS 'Eventos de e-mail (envio, entrega, abertura, clique, bounce, spam, unsub). Camada de eventos.';

CREATE TABLE course_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
    course_id       UUID REFERENCES courses(id) ON DELETE SET NULL,
    enrollment_id   UUID REFERENCES enrollments(id) ON DELETE SET NULL,
    event_type      course_event_type NOT NULL,
    metadata        JSONB,                      -- Dados extras (progresso %, nota, etc.)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE course_events IS 'Eventos da plataforma Realizzare (matrícula, progresso, conclusão, certificado). Camada de eventos.';

CREATE TABLE flow_step_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id          UUID REFERENCES contacts(id) ON DELETE SET NULL,
    flow_id             UUID REFERENCES flows(id) ON DELETE SET NULL,
    flow_enrollment_id  UUID REFERENCES flow_enrollments(id) ON DELETE SET NULL,
    from_node_id        TEXT,
    to_node_id          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE flow_step_logs IS 'Log de progressão de contatos entre nós de fluxos. Camada de eventos.';

CREATE TABLE inbound_webhook_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source          TEXT NOT NULL,              -- 'ses', 'realizzare', 'zapier', etc.
    event_type      TEXT NOT NULL,              -- Tipo do evento recebido
    payload         JSONB NOT NULL,             -- Payload bruto do webhook
    status          webhook_processing_status NOT NULL DEFAULT 'pending',
    processed_at    TIMESTAMPTZ,
    error_message   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE inbound_webhook_events IS 'Webhooks recebidos de sistemas externos (SES, Realizzare, etc.). Fila de processamento.';

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,              -- Descrição da ação (ex: 'Novo domínio adicionado')
    resource_type   TEXT,                       -- Tipo do recurso (ex: 'domain', 'campaign', 'contact')
    resource_id     TEXT,                       -- ID do recurso afetado
    details         JSONB,                      -- Dados extras e contexto da ação
    ip_address      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE audit_logs IS 'Log de auditoria de ações administrativas (segurança e compliance).';

-- =====================================================================
-- SEÇÃO 11: TABELAS DE AGREGAÇÃO (ESTRUTURA PARA FASE 2)
-- =====================================================================
-- Essas tabelas serão populadas por triggers e jobs na Fase 2.
-- Na Fase 1, ficam criadas e vazias ou com dados seed.
-- Objetivo: leitura rápida de dashboards sem COUNT/SUM em eventos brutos.

CREATE TABLE daily_metrics_summary (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date              DATE NOT NULL,
    emails_sent       INTEGER NOT NULL DEFAULT 0,
    emails_delivered  INTEGER NOT NULL DEFAULT 0,
    emails_opened     INTEGER NOT NULL DEFAULT 0,
    emails_clicked    INTEGER NOT NULL DEFAULT 0,
    emails_bounced    INTEGER NOT NULL DEFAULT 0,
    spam_complaints   INTEGER NOT NULL DEFAULT 0,
    unsubscribes      INTEGER NOT NULL DEFAULT 0,
    new_contacts      INTEGER NOT NULL DEFAULT 0,
    revenue           NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, date)
);
COMMENT ON TABLE daily_metrics_summary IS 'Métricas diárias agregadas para o dashboard principal. Camada de agregação.';

CREATE TABLE campaign_metrics_summary (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    sent            INTEGER NOT NULL DEFAULT 0,
    delivered       INTEGER NOT NULL DEFAULT 0,
    opened          INTEGER NOT NULL DEFAULT 0,
    clicked         INTEGER NOT NULL DEFAULT 0,
    bounced         INTEGER NOT NULL DEFAULT 0,
    spam            INTEGER NOT NULL DEFAULT 0,
    unsubscribed    INTEGER NOT NULL DEFAULT 0,
    conversions     INTEGER NOT NULL DEFAULT 0,
    revenue         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, campaign_id, date)
);
COMMENT ON TABLE campaign_metrics_summary IS 'Métricas diárias por campanha para relatórios detalhados. Camada de agregação.';

CREATE TABLE flow_metrics_summary (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    flow_id         UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    entries         INTEGER NOT NULL DEFAULT 0,
    completions     INTEGER NOT NULL DEFAULT 0,
    exits           INTEGER NOT NULL DEFAULT 0,
    emails_sent     INTEGER NOT NULL DEFAULT 0,
    emails_opened   INTEGER NOT NULL DEFAULT 0,
    emails_clicked  INTEGER NOT NULL DEFAULT 0,
    revenue         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (org_id, flow_id, date)
);
COMMENT ON TABLE flow_metrics_summary IS 'Métricas diárias por fluxo para relatórios de automações. Camada de agregação.';

-- =====================================================================
-- SEÇÃO 12: ÍNDICES
-- =====================================================================
-- Estratégia: índices compostos alinhados com os filtros reais do frontend.
-- Prioridade: colunas usadas em WHERE, ORDER BY e JOIN das telas principais.

-- ---- Organizações ----
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);

-- ---- Contatos ----
CREATE INDEX idx_contacts_org_status ON contacts(org_id, status);
CREATE INDEX idx_contacts_org_created ON contacts(org_id, created_at DESC);
CREATE INDEX idx_contacts_org_email ON contacts(org_id, email);
CREATE INDEX idx_contacts_email ON contacts(email);
-- Índice trigram para busca textual por nome (ILIKE '%termo%')
CREATE INDEX idx_contacts_name_trgm ON contacts USING GIN (
    (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) gin_trgm_ops
);

-- ---- Campos Personalizados ----
CREATE INDEX idx_custom_fields_org ON custom_fields(org_id);
CREATE INDEX idx_ccv_contact ON contact_custom_values(contact_id);
CREATE INDEX idx_ccv_field ON contact_custom_values(field_id);

-- ---- Tags ----
CREATE INDEX idx_tags_org ON tags(org_id);
CREATE INDEX idx_contact_tags_contact ON contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag ON contact_tags(tag_id);

-- ---- Listas ----
CREATE INDEX idx_lists_org ON lists(org_id);
CREATE INDEX idx_list_subs_contact ON list_subscriptions(contact_id);
CREATE INDEX idx_list_subs_list_status ON list_subscriptions(list_id, status);

-- ---- Segmentos ----
CREATE INDEX idx_segments_org ON segments(org_id);
CREATE INDEX idx_segment_rules_segment ON segment_rules(segment_id);

-- ---- Cursos ----
CREATE INDEX idx_courses_org ON courses(org_id);
CREATE INDEX idx_enrollments_contact_status ON enrollments(contact_id, status);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_org ON enrollments(org_id);
CREATE INDEX idx_purchases_contact ON purchases(contact_id);
CREATE INDEX idx_purchases_org_paid ON purchases(org_id, paid_at DESC);

-- ---- Campanhas ----
CREATE INDEX idx_campaigns_org_status ON campaigns(org_id, status);
CREATE INDEX idx_campaigns_org_created ON campaigns(org_id, created_at DESC);
CREATE INDEX idx_campaigns_org_sent ON campaigns(org_id, sent_at DESC);
CREATE INDEX idx_campaign_segments_campaign ON campaign_segments(campaign_id);

-- ---- Fluxos ----
CREATE INDEX idx_flows_org_status ON flows(org_id, status);
CREATE INDEX idx_flows_org_created ON flows(org_id, created_at DESC);
CREATE INDEX idx_flow_nodes_flow ON flow_nodes(flow_id);
CREATE INDEX idx_flow_connections_flow ON flow_node_connections(flow_id);
CREATE INDEX idx_flow_enrollments_contact ON flow_enrollments(contact_id);
CREATE INDEX idx_flow_enrollments_flow_status ON flow_enrollments(flow_id, status);
CREATE INDEX idx_flow_enrollments_org ON flow_enrollments(org_id);

-- ---- Configurações ----
CREATE INDEX idx_domains_org ON sending_domains(org_id);
CREATE INDEX idx_api_keys_org ON api_keys(org_id);
CREATE INDEX idx_webhooks_org ON webhooks(org_id);
CREATE INDEX idx_suppression_org_email ON suppression_list(org_id, email);

-- ---- Mídia ----
CREATE INDEX idx_media_folders_org ON media_folders(org_id);
CREATE INDEX idx_media_files_org ON media_files(org_id);
CREATE INDEX idx_media_files_folder ON media_files(folder_id);

-- ---- Eventos (alto volume — índices críticos para performance) ----
CREATE INDEX idx_email_events_org_type_created ON email_events(org_id, event_type, created_at DESC);
CREATE INDEX idx_email_events_campaign ON email_events(campaign_id, event_type);
CREATE INDEX idx_email_events_contact ON email_events(contact_id);
CREATE INDEX idx_email_events_flow ON email_events(flow_id);

CREATE INDEX idx_course_events_org ON course_events(org_id, created_at DESC);
CREATE INDEX idx_course_events_contact ON course_events(contact_id);
CREATE INDEX idx_course_events_course ON course_events(course_id);

CREATE INDEX idx_flow_step_logs_flow ON flow_step_logs(flow_id, created_at DESC);
CREATE INDEX idx_flow_step_logs_contact ON flow_step_logs(contact_id);

CREATE INDEX idx_inbound_webhook_status ON inbound_webhook_events(status, created_at);
CREATE INDEX idx_inbound_webhook_org ON inbound_webhook_events(org_id);

CREATE INDEX idx_audit_logs_org ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- ---- Agregações ----
CREATE INDEX idx_dms_org_date ON daily_metrics_summary(org_id, date DESC);
CREATE INDEX idx_cms_campaign_date ON campaign_metrics_summary(campaign_id, date DESC);
CREATE INDEX idx_fms_flow_date ON flow_metrics_summary(flow_id, date DESC);

-- =====================================================================
-- SEÇÃO 13: FUNÇÕES E TRIGGERS
-- =====================================================================

-- ------------------------------------------------------------------
-- Função helper: retorna o org_id do usuário autenticado atual.
-- Usada em todas as RLS policies para isolamento de tenant.
-- STABLE = cacheada dentro da mesma transação (performance).
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT org_id FROM org_members
    WHERE user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_user_org_id IS 'Retorna o org_id do usuário autenticado. Usada nas RLS policies.';

-- ------------------------------------------------------------------
-- Trigger genérico: atualiza updated_at automaticamente em UPDATEs.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trigger_set_updated_at IS 'Trigger genérico para atualizar automaticamente a coluna updated_at.';

-- Aplicar trigger em todas as tabelas com coluna updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'organizations', 'contacts', 'lists', 'list_subscriptions',
            'segments', 'courses', 'enrollments', 'campaigns',
            'flows', 'sending_domains', 'webhooks', 'account_settings'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
            tbl
        );
    END LOOP;
END $$;

-- ------------------------------------------------------------------
-- Função: atualizar subscriber_count da lista após mudanças.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_list_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza a lista afetada (pode ser INSERT, UPDATE ou DELETE)
    UPDATE lists SET subscriber_count = (
        SELECT COUNT(*) FROM list_subscriptions
        WHERE list_id = COALESCE(NEW.list_id, OLD.list_id)
        AND status = 'subscribed'
    )
    WHERE id = COALESCE(NEW.list_id, OLD.list_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_list_subscriber_count
    AFTER INSERT OR UPDATE OR DELETE ON list_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_list_subscriber_count();

-- ------------------------------------------------------------------
-- Função: atualizar total_spent do contato após nova compra.
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_contact_total_spent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contacts SET total_spent = (
        SELECT COALESCE(SUM(amount), 0.00) FROM purchases
        WHERE contact_id = COALESCE(NEW.contact_id, OLD.contact_id)
        AND status = 'paid'
    )
    WHERE id = COALESCE(NEW.contact_id, OLD.contact_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_contact_total_spent
    AFTER INSERT OR UPDATE OR DELETE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_contact_total_spent();

-- =====================================================================
-- SEÇÃO 14: ROW LEVEL SECURITY (RLS)
-- =====================================================================
-- Estratégia: isolamento por organização (multi-tenant).
-- Todas as tabelas com org_id usam get_user_org_id() na policy.
-- Tabelas de junção (contact_tags, etc.) herdam segurança via FK.

-- ---- Habilitar RLS em todas as tabelas ----
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_node_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sending_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_metrics_summary ENABLE ROW LEVEL SECURITY;

-- ---- Policies: Tabelas com org_id direto ----
-- Padrão: membro autenticado da organização tem acesso total.

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'contacts', 'custom_fields', 'tags', 'lists', 'segments',
            'courses', 'enrollments', 'purchases',
            'campaigns', 'flows', 'flow_enrollments',
            'sending_domains', 'api_keys', 'webhooks', 'suppression_list',
            'account_settings', 'media_folders', 'media_files',
            'email_events', 'course_events', 'flow_step_logs',
            'inbound_webhook_events', 'audit_logs',
            'daily_metrics_summary', 'campaign_metrics_summary',
            'flow_metrics_summary'
        ])
    LOOP
        EXECUTE format(
            'CREATE POLICY tenant_isolation_%I ON %I
             FOR ALL TO authenticated
             USING (org_id = get_user_org_id())
             WITH CHECK (org_id = get_user_org_id());',
            tbl, tbl
        );
    END LOOP;
END $$;

-- ---- Policies: organizations ----
CREATE POLICY org_member_access ON organizations
    FOR ALL TO authenticated
    USING (id = get_user_org_id())
    WITH CHECK (id = get_user_org_id());

-- ---- Policies: org_members ----
CREATE POLICY org_members_access ON org_members
    FOR ALL TO authenticated
    USING (org_id = get_user_org_id())
    WITH CHECK (org_id = get_user_org_id());

-- ---- Policies: Tabelas de junção sem org_id (segurança via FK) ----
-- segment_rules: acesso se o segmento pertence à organização do usuário
CREATE POLICY tenant_isolation_segment_rules ON segment_rules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM segments
            WHERE segments.id = segment_rules.segment_id
            AND segments.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM segments
            WHERE segments.id = segment_rules.segment_id
            AND segments.org_id = get_user_org_id()
        )
    );

-- contact_tags: acesso se o contato pertence à organização do usuário
CREATE POLICY tenant_isolation_contact_tags ON contact_tags
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = contact_tags.contact_id
            AND contacts.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = contact_tags.contact_id
            AND contacts.org_id = get_user_org_id()
        )
    );

-- contact_custom_values: acesso se o contato pertence à organização
CREATE POLICY tenant_isolation_contact_custom_values ON contact_custom_values
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = contact_custom_values.contact_id
            AND contacts.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = contact_custom_values.contact_id
            AND contacts.org_id = get_user_org_id()
        )
    );

-- list_subscriptions: acesso se o contato pertence à organização
CREATE POLICY tenant_isolation_list_subscriptions ON list_subscriptions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = list_subscriptions.contact_id
            AND contacts.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM contacts
            WHERE contacts.id = list_subscriptions.contact_id
            AND contacts.org_id = get_user_org_id()
        )
    );

-- campaign_segments: acesso se a campanha pertence à organização
CREATE POLICY tenant_isolation_campaign_segments ON campaign_segments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_segments.campaign_id
            AND campaigns.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_segments.campaign_id
            AND campaigns.org_id = get_user_org_id()
        )
    );

-- flow_nodes: acesso se o flow pertence à organização
CREATE POLICY tenant_isolation_flow_nodes ON flow_nodes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM flows
            WHERE flows.id = flow_nodes.flow_id
            AND flows.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM flows
            WHERE flows.id = flow_nodes.flow_id
            AND flows.org_id = get_user_org_id()
        )
    );

-- flow_node_connections: acesso se o flow pertence à organização
CREATE POLICY tenant_isolation_flow_node_connections ON flow_node_connections
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM flows
            WHERE flows.id = flow_node_connections.flow_id
            AND flows.org_id = get_user_org_id()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM flows
            WHERE flows.id = flow_node_connections.flow_id
            AND flows.org_id = get_user_org_id()
        )
    );

-- ---- Policy para service_role (API routes com admin access) ----
-- O service_role do Supabase já bypassa RLS por padrão.
-- Não é necessário criar policies adicionais para ele.

-- =====================================================================
-- FIM DA MIGRATION — FASE 1 COMPLETA
-- =====================================================================
