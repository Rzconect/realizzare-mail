-- Passo 1: Habilitar RLS em todas as tabelas
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
  END LOOP;
END $$;

-- Passo 2: Criar uma política padrão "Allow all" para evitar que o sistema pare de funcionar
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = r.tablename 
      AND policyname = 'allow_all_for_backward_compatibility'
    ) THEN
      EXECUTE 'CREATE POLICY allow_all_for_backward_compatibility ON public.' || quote_ident(r.tablename) || ' FOR ALL USING (true)';
    END IF;
  END LOOP;
END $$;
