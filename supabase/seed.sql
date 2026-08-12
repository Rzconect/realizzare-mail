BEGIN;

-- 1. Organization
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Realizzare Cursos', 'realizzare-cursos')
ON CONFLICT (id) DO NOTHING;

-- 2. Contacts (12 contacts)
INSERT INTO contacts (id, org_id, first_name, last_name, email, phone, status, created_at, total_spent, gender, country, state, city, birth_date, source)
VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Ana', 'Oliveira', 'ana.oliveira@gmail.com', '(11) 98877-6655', 'active', '2026-07-01', 197.00, 'Feminino', 'Brasil', 'SP', 'São Paulo', '1995-03-15', 'Formulário do Site'),
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Bruno', 'Santos', 'bruno.santos@yahoo.com', '(21) 97766-5544', 'active', '2026-06-28', 0.00, 'Masculino', 'Brasil', 'RJ', 'Rio de Janeiro', '1990-08-22', 'Matricula em Curso'),
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Carla', 'Lima', 'carla.lima@outlook.com', '(31) 96655-4433', 'unsubscribed', '2026-06-25', 197.00, 'Feminino', 'Brasil', 'MG', 'Belo Horizonte', NULL, 'Importação Manual'),
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Daniel', 'Costa', 'daniel.costa@hotmail.com', '(41) 95544-3322', 'active', '2026-07-03', 497.00, 'Masculino', 'Brasil', 'PR', 'Curitiba', '1988-11-30', 'Compra de Certificado'),
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Eduarda', 'Pereira', 'eduarda.p@gmail.com', '(51) 94433-2211', 'bounced', '2026-06-20', 0.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', 'Felipe', 'Almeida', 'felipe.almeida@gmail.com', '(11) 93322-1100', 'active', '2026-07-05', 197.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', 'Gabriela', 'Rocha', 'gabriela.rocha@uol.com.br', '(21) 92211-0099', 'active', '2026-07-06', 0.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000001', 'Hugo', 'Nunes', 'hugo.nunes@gmail.com', '(31) 91100-9988', 'active', '2026-06-15', 497.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000001', 'Isabela', 'Martins', 'isabela.m@live.com', '(81) 99988-7766', 'active', '2026-07-07', 0.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000001', 'João', 'Silva', 'joao.silva@gmail.com', '(11) 98899-0011', 'unsubscribed', '2026-05-10', 297.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000001', 'Karina', 'Dias', 'karina.dias@gmail.com', '(19) 97788-9900', 'active', '2026-07-02', 197.00, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000001', 'Lucas', 'Fernandes', 'lucas.fer@gmail.com', '(47) 96677-8899', 'active', '2026-06-30', 0.00, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Tags
INSERT INTO tags (id, org_id, name, color)
VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'Novo', 'bg-blue-50 border-blue-100 text-blue-700'),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'Matriculado', 'bg-emerald-50 border-emerald-100 text-emerald-700'),
('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'Interessado', 'bg-amber-50 border-amber-100 text-amber-700'),
('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'Vip', 'bg-purple-50 border-purple-100 text-purple-700'),
('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000001', 'Ex-Aluno', 'bg-slate-50 border-slate-100 text-slate-700'),
('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000001', 'Bounced', 'bg-red-50 border-red-100 text-red-700'),
('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000001', 'Alunos 2026', 'bg-indigo-50 border-indigo-100 text-indigo-700'),
('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0000-000000000001', 'Inadimplentes', 'bg-red-50 border-red-100 text-red-700'),
('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0000-000000000001', 'Lead Quente', 'bg-amber-50 border-amber-100 text-amber-700'),
('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0000-000000000001', 'Certificado Emitido', 'bg-emerald-50 border-emerald-100 text-emerald-700')
ON CONFLICT (id) DO NOTHING;

-- 4. Contact-Tag Associations
INSERT INTO contact_tags (contact_id, tag_id)
VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001'), -- Ana: Novo
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002'), -- Ana: Matriculado
('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000003'), -- Bruno: Interessado
('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0002-000000000005'), -- Carla: Ex-Aluno
('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0002-000000000004'), -- Daniel: Vip
('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0002-000000000006'), -- Eduarda: Bounced
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000001'), -- Felipe: Novo
('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0002-000000000002'), -- Felipe: Matriculado
('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0002-000000000003'), -- Gabriela: Interessado
('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0002-000000000002'), -- Hugo: Matriculado
('00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0002-000000000001'), -- Isabela: Novo
('00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0002-000000000005'), -- João: Ex-Aluno
('00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0002-000000000004'), -- Karina: Vip
('00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0002-000000000001')  -- Lucas: Novo
ON CONFLICT (contact_id, tag_id) DO NOTHING;

-- 5. Courses
INSERT INTO courses (id, org_id, name, price, type)
VALUES
('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'Introdução à Programação Web', 197.00, 'online'),
('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'Gestão Financeira para Negócios', 297.00, 'online'),
('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'Desenvolvimento de Carreira e Liderança', 497.00, 'online'),
('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'Marketing Digital de Performance', 197.00, 'online')
ON CONFLICT (id) DO NOTHING;

-- 6. Enrollments
INSERT INTO enrollments (id, org_id, contact_id, course_id, status, progress, certificate_issued)
VALUES
('00000000-0000-0000-000f-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0003-000000000001', 'active', 45.00, false), -- Ana -> Intro Web
('00000000-0000-0000-000f-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0003-000000000002', 'active', 30.00, false), -- Bruno -> Gestão Financeira
('00000000-0000-0000-000f-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0003-000000000001', 'completed', 100.00, true), -- Carla -> Intro Web
('00000000-0000-0000-000f-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0003-000000000003', 'active', 60.00, false), -- Daniel -> Desenv. Carreira
('00000000-0000-0000-000f-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0003-000000000004', 'active', 25.00, false), -- Felipe -> Marketing Digital
('00000000-0000-0000-000f-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0003-000000000001', 'active', 10.00, false), -- Gabriela -> Intro Web
('00000000-0000-0000-000f-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0003-000000000003', 'completed', 100.00, true), -- Hugo -> Desenv. Carreira
('00000000-0000-0000-000f-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0003-000000000002', 'completed', 100.00, true), -- João -> Gestão Financeira
('00000000-0000-0000-000f-000000000009', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0003-000000000004', 'active', 50.00, false)  -- Karina -> Marketing Digital
ON CONFLICT (id) DO NOTHING;

-- 7. Custom Fields
INSERT INTO custom_fields (id, org_id, name, type, tag, objective)
VALUES
('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0000-000000000001', 'Área de Interesse', 'text', 'area_de_interesse', 'Estudo ou segmento de interesse do aluno.'),
('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0000-000000000001', 'Nível Acadêmico', 'text', 'nivel_academico', 'Escolaridade ou nível de formação atual do contato.'),
('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0000-000000000001', 'Origem Lead', 'text', 'origem_lead', 'Canal ou link de entrada do lead na base.'),
('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0000-000000000001', 'Curso Pretendido', 'text', 'curso_pretendido', 'Curso que o aluno pretende matricular-se.')
ON CONFLICT (id) DO NOTHING;

-- 8. Contact Custom Values
INSERT INTO contact_custom_values (id, contact_id, field_id, value_text)
VALUES
('00000000-0000-0000-0010-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0004-000000000001', 'Desenvolvimento Web'),
('00000000-0000-0000-0010-000000000002', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0004-000000000002', 'Graduação'),
('00000000-0000-0000-0010-000000000003', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0004-000000000003', 'Google Ads'),
('00000000-0000-0000-0010-000000000004', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0004-000000000004', 'React Developer'),
('00000000-0000-0000-0010-000000000005', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0004-000000000001', 'Finanças'),
('00000000-0000-0000-0010-000000000006', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0004-000000000002', 'Pós-Graduação'),
('00000000-0000-0000-0010-000000000007', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0004-000000000003', 'Indicação'),
('00000000-0000-0000-0010-000000000008', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0004-000000000004', 'MBA Finanças'),
('00000000-0000-0000-0010-000000000009', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0004-000000000001', 'Programação'),
('00000000-0000-0000-0010-000000000010', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0004-000000000002', 'Técnico'),
('00000000-0000-0000-0010-000000000011', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0004-000000000003', 'Redes Sociais'),
('00000000-0000-0000-0010-000000000012', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0004-000000000001', 'Liderança'),
('00000000-0000-0000-0010-000000000013', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0004-000000000002', 'MBA'),
('00000000-0000-0000-0010-000000000014', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0004-000000000003', 'LinkedIn')
ON CONFLICT (id) DO NOTHING;

-- 9. Lists
INSERT INTO lists (id, org_id, name, description, url, subscriber_count)
VALUES
('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0000-000000000001', 'Lista Geral de Alunos', 'Todos os contatos cadastrados que se matricularam ou demonstraram interesse em cursos.', 'https://realizzarecursos.com.br', 1240),
('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0000-000000000001', 'Carrinho Abandonado - 24h', 'Leads que iniciaram compra mas não finalizaram o pagamento nas últimas 24 horas.', 'https://realizzarecursos.com.br/checkout', 85),
('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0000-000000000001', 'Interessados em Programação', 'Contatos com interesse específico na área de desenvolvimento de software.', 'https://realizzarecursos.com.br/cursos/programacao', 420)
ON CONFLICT (id) DO NOTHING;

-- 10. List Subscriptions
INSERT INTO list_subscriptions (id, contact_id, list_id, status)
VALUES
('00000000-0000-0000-0013-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000002', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000003', '00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000004', '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000005', '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000006', '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000007', '00000000-0000-0000-0001-000000000009', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000008', '00000000-0000-0000-0001-000000000011', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000009', '00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0005-000000000001', 'subscribed'),
('00000000-0000-0000-0013-000000000010', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0005-000000000003', 'subscribed'),
('00000000-0000-0000-0013-000000000011', '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0005-000000000003', 'subscribed'),
('00000000-0000-0000-0013-000000000012', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0005-000000000003', 'unsubscribed')
ON CONFLICT (id) DO NOTHING;

-- 11. Campaigns
INSERT INTO campaigns (id, org_id, name, subject, status, from_name, from_email, target_list, sent_count, open_count, click_count, conversions, revenue, reply_to)
VALUES
('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000001', 'Oferta Relâmpago - Cursos Gratuitos', 'Oferta Relâmpago!', 'sending', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Carrinho Abandonado - 24h', 500, 120, 15, 2, 398.00, 'suporte@realizzare.com.br'),
('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0000-000000000001', 'Black Friday 2025 - Oferta Antecipada', '🚀 Black Friday Antecipada', 'sent', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Lista Geral de Alunos', 22450, 15715, 4490, 224, 44128.00, 'suporte@realizzare.com.br'),
('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0000-000000000001', 'Newsletter Semanal - Novidades de IA', '🤖 Novidades de IA', 'sent', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Interessados em Programação', 2693, 642, 4, 0, 0.00, 'suporte@realizzare.com.br'),
('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0000-000000000001', 'Boas-vindas - Curso de JavaScript Pro', 'Bem-vindo(a) ao JS Pro!', 'scheduled', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Alunos Matriculados - JS Pro', 0, 0, 0, 0, 0.00, 'suporte@realizzare.com.br'),
('00000000-0000-0000-0006-000000000005', '00000000-0000-0000-0000-000000000001', 'Lançamento Python para Data Science', '🐍 Python para Data Science', 'draft', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Interessados em Python', 0, 0, 0, 0, 0.00, 'suporte@realizzare.com.br'),
('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0000-000000000001', 'Recuperação de Carrinho - Fullstack Pro', 'Não esqueça do Fullstack Pro!', 'sent', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Carrinho Abandonado - 24h', 1200, 960, 384, 96, 18912.00, 'suporte@realizzare.com.br'),
('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0000-000000000001', 'Promoção Dia do Programador 2025', '🎉 Feliz Dia do Programador!', 'archived', 'Realizzare Cursos', 'contato@realizzare.com.br', 'Lista Geral de Alunos', 20000, 12000, 2400, 120, 23640.00, 'suporte@realizzare.com.br')
ON CONFLICT (id) DO NOTHING;

-- 12. Flows
INSERT INTO flows (id, org_id, name, status, flow_type, trigger_type, trigger_metric, active_contacts, finished_contacts, certificates_issued, revenue)
VALUES
('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0000-000000000001', 'Boas-vindas - Novo Aluno React', 'active', 'automation', 'Iniciou Curso', 'Iniciou um Curso', 24, 145, 92, 4590.00),
('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0000-000000000001', 'Confirmação de Compra - Certificado', 'active', 'transactional', 'Comprou Certificado', 'Comprou um Certificado', 8, 312, 312, 12800.00),
('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0000-000000000001', 'Reengajamento - Leads Inativos', 'paused', 'automation', 'Inativos 30 dias', 'N/A', 0, 54, 0, 850.00),
('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0000-000000000001', 'Recuperação de Carrinho - Fullstack', 'draft', 'automation', 'Abandonou Carrinho', 'Abandonou Carrinho no checkout', 0, 12, 0, 0.00)
ON CONFLICT (id) DO NOTHING;

-- 13. Sending Domains
INSERT INTO sending_domains (id, org_id, domain, verification_status, spf_status, dkim_status, dmarc_status)
VALUES
('00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0000-000000000001', 'realizzare.com.br', 'verified', 'ok', 'ok', 'ok'),
('00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0000-000000000001', 'realizzarecursos.com.br', 'pending', 'pending', 'pending', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 14. API Keys
INSERT INTO api_keys (id, org_id, name, key_hash, key_prefix, scope, last_used_at, created_at)
VALUES
('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0000-000000000001', 'Produção Integração CRM', 'sk_live_hashed_d87a', 'sk_live_••••••••d87a', 'full', '2026-07-13', '2026-06-10'),
('00000000-0000-0000-0009-000000000002', '00000000-0000-0000-0000-000000000001', 'Zapier webhook feed', 'sk_live_hashed_91ab', 'sk_live_••••••••91ab', 'read_only', '2026-07-12', '2026-06-22')
ON CONFLICT (id) DO NOTHING;

-- 15. Webhooks
INSERT INTO webhooks (id, org_id, url, events, status)
VALUES
('00000000-0000-0000-000a-000000000001', '00000000-0000-0000-0000-000000000001', 'https://api.crmrealizzare.com.br/v1/webhooks/ses', ARRAY['Delivered','Bounce','Complaint'], 'active'),
('00000000-0000-0000-000a-000000000002', '00000000-0000-0000-0000-000000000001', 'https://hooks.zapier.com/hooks/catch/923910', ARRAY['Open','Click','Unsubscribe'], 'active')
ON CONFLICT (id) DO NOTHING;

-- 16. Suppression List
INSERT INTO suppression_list (id, org_id, email, reason, origin, removable)
VALUES
('00000000-0000-0000-000b-000000000001', '00000000-0000-0000-0000-000000000001', 'carlos.spam@gmail.com', 'complaint', 'Campanha Black Friday', false),
('00000000-0000-0000-000b-000000000002', '00000000-0000-0000-0000-000000000001', 'maria.bounce@yahoo.com', 'hard_bounce', 'Automatizado - Boas-vindas', false),
('00000000-0000-0000-000b-000000000003', '00000000-0000-0000-0000-000000000001', 'joao.optout@hotmail.com', 'unsubscribe', 'Manual - Unsubscribe Link', true),
('00000000-0000-0000-000b-000000000004', '00000000-0000-0000-0000-000000000001', 'vendedor.fake@bol.com.br', 'soft_bounce_repeated', 'Manual', true)
ON CONFLICT (id) DO NOTHING;

-- 17. Account Settings
INSERT INTO account_settings (id, org_id, settings)
VALUES
('00000000-0000-0000-000e-000000000001', '00000000-0000-0000-0000-000000000001', '{
  "sender_name": "Realizzare Cursos",
  "sender_email": "contato@realizzare.com.br",
  "reply_to": "suporte@realizzare.com.br",
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "currency": "BRL",
  "smart_sending_hours": 16,
  "ses_config_set": "RealizzareMail-Prod-Set",
  "address": "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
  "unsubscribe_text": "Deseja parar de receber estes e-mails? Cancele sua inscrição.",
  "profiles_limit": 5000,
  "profiles_used": 4585,
  "emails_limit": 50000,
  "emails_used": 30972,
  "mobile_limit": 5.00,
  "mobile_used": 0.00
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 18. Media Folders and Files
INSERT INTO media_folders (id, org_id, name)
VALUES
('00000000-0000-0000-000c-000000000001', '00000000-0000-0000-0000-000000000001', 'Biblioteca Padrão'),
('00000000-0000-0000-000c-000000000002', '00000000-0000-0000-0000-000000000001', 'Banners Black Friday')
ON CONFLICT (id) DO NOTHING;

INSERT INTO media_files (id, org_id, name, size_bytes, file_type, url, folder_id)
VALUES
('00000000-0000-0000-000d-000000000001', '00000000-0000-0000-0000-000000000001', 'logo_realizzare_main.png', 24500, 'PNG', '/logo.png', '00000000-0000-0000-000c-000000000001'),
('00000000-0000-0000-000d-000000000002', '00000000-0000-0000-0000-000000000001', 'banner_black_friday_2026.jpg', 342000, 'JPEG', NULL, '00000000-0000-0000-000c-000000000002'),
('00000000-0000-0000-000d-000000000003', '00000000-0000-0000-0000-000000000001', 'instructor_avatar_leonardo.png', 85200, 'PNG', NULL, '00000000-0000-0000-000c-000000000001'),
('00000000-0000-0000-000d-000000000004', '00000000-0000-0000-0000-000000000001', 'background_email_newsletter.jpg', 112400, 'JPEG', NULL, '00000000-0000-0000-000c-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 19. Audit Logs
INSERT INTO audit_logs (id, org_id, user_id, action, resource_type, ip_address, created_at)
VALUES
('00000000-0000-0000-0011-000000000001', '00000000-0000-0000-0000-000000000001', NULL, 'Novo domínio adicionado (realizzarecursos.com.br)', 'domain', '177.105.80.22', '2026-07-14 00:15'),
('00000000-0000-0000-0011-000000000002', '00000000-0000-0000-0000-000000000001', NULL, 'Exportação da Suppression List em formato CSV', 'suppression_list', '177.105.80.22', '2026-07-13 23:42'),
('00000000-0000-0000-0011-000000000003', '00000000-0000-0000-0000-000000000001', NULL, 'Chave de API gerada (Zapier webhook feed)', 'api_key', '186.200.41.9', '2026-07-12 15:10'),
('00000000-0000-0000-0011-000000000004', '00000000-0000-0000-0000-000000000001', NULL, 'Alteração de remetente padrão de e-mail', 'account_settings', '177.105.80.22', '2026-07-10 18:30')
ON CONFLICT (id) DO NOTHING;

-- 20. Purchases
INSERT INTO purchases (id, org_id, contact_id, product_type, product_name, amount, status)
VALUES
('00000000-0000-0000-0012-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'course', 'Introdução à Programação Web', 197.00, 'paid'),
('00000000-0000-0000-0012-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'course', 'Introdução à Programação Web', 197.00, 'paid'),
('00000000-0000-0000-0012-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000004', 'course', 'Desenvolvimento de Carreira e Liderança', 497.00, 'paid'),
('00000000-0000-0000-0012-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000006', 'course', 'Marketing Digital de Performance', 197.00, 'paid'),
('00000000-0000-0000-0012-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000008', 'course', 'Desenvolvimento de Carreira e Liderança', 497.00, 'paid'),
('00000000-0000-0000-0012-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000010', 'course', 'Gestão Financeira para Negócios', 297.00, 'paid'),
('00000000-0000-0000-0012-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000011', 'course', 'Marketing Digital de Performance', 197.00, 'paid')
ON CONFLICT (id) DO NOTHING;

COMMIT;
