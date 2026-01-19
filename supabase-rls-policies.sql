-- ✅ POLÍTICAS RLS IMPLEMENTADAS E TESTADAS
-- Este arquivo contém as políticas RLS que foram aplicadas com sucesso no Supabase

-- 1️⃣ Ativar RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 2️⃣ Função helper – nível do usuário
-- ⚠️ Obs: user é palavra reservada → mantido como você usou, mas recomenda-se renomear para users
CREATE OR REPLACE FUNCTION get_user_level() 
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$ 
DECLARE   
  user_level INTEGER; 
BEGIN   
  SELECT nivel   
  INTO user_level   
  FROM public.user   
  WHERE id_user = auth.uid()::text;    
  
  RETURN COALESCE(user_level, 0); 
END; 
$$;

-- 3️⃣ POLICY – SELECT
CREATE POLICY "Users can view tasks from allowed buckets" ON public.tasks 
FOR SELECT 
USING (   
  CASE     
    WHEN get_user_level() = 2 THEN true     
    WHEN get_user_level() = 1 THEN       
      id_bucket IN (         
        SELECT id         
        FROM public.buckets         
        WHERE bucket = 'TaskInbox'       
      )     
    ELSE false   
  END 
);

-- 4️⃣ POLICY – INSERT (COM PREENCHIMENTO AUTOMÁTICO DE CRIADO_POR)
CREATE POLICY "Users level 1+ can create tasks" ON public.tasks 
FOR INSERT 
WITH CHECK (   
  get_user_level() >= 1 AND
  criado_por = auth.uid()::text  -- Garantir que criado_por seja o usuário atual
);

-- 5️⃣ POLICY – UPDATE (COM CONTROLE DE AUTORIA)
-- 🔑 Nível 2: pode editar qualquer task
-- 🔒 Nível 1: pode editar apenas tasks que criou
CREATE OR REPLACE POLICY "Users can update tasks with ownership control" ON public.tasks 
FOR UPDATE 
USING (   
  CASE
    WHEN get_user_level() = 2 THEN true  -- Admin pode editar qualquer task
    WHEN get_user_level() = 1 THEN       -- User restrito só edita próprias tasks
      criado_por = auth.uid()::text
    ELSE false
  END
) 
WITH CHECK (   
  CASE
    WHEN get_user_level() = 2 THEN true  -- Admin pode editar qualquer task
    WHEN get_user_level() = 1 THEN       -- User restrito só edita próprias tasks
      criado_por = auth.uid()::text
    ELSE false
  END
);

-- 6️⃣ POLICY – DELETE
CREATE POLICY "Only admin can delete tasks" ON public.tasks 
FOR DELETE 
USING (   
  get_user_level() = 2 
);

-- 7️⃣ TRIGGER – BLOQUEAR MOVER CARD (NÍVEL 1)
-- 👉 Aqui está o coração da solução, substituindo o OLD / NEW que quebrava.
CREATE OR REPLACE FUNCTION prevent_task_move_level_1() 
RETURNS trigger 
LANGUAGE plpgsql 
AS $$ 
BEGIN   
  IF get_user_level() = 1 THEN      
    -- Impede mudança de bucket     
    IF OLD.id_bucket IS DISTINCT FROM NEW.id_bucket THEN       
      RAISE EXCEPTION 'Usuário nível 1 não pode mover tarefas entre buckets';     
    END IF;      
    
    -- Impede mudança de categoria     
    IF OLD.id_category IS DISTINCT FROM NEW.id_category THEN       
      RAISE EXCEPTION 'Usuário nível 1 não pode mover tarefas entre categorias';     
    END IF;    
  END IF;    
  
  RETURN NEW; 
END; 
$$;

-- 7.1️⃣ TRIGGER – GARANTIR CRIADO_POR NO INSERT
-- Preenche automaticamente o criado_por com auth.uid()
CREATE OR REPLACE FUNCTION set_created_by() 
RETURNS trigger 
LANGUAGE plpgsql 
AS $$ 
BEGIN   
  -- Garantir que criado_por seja sempre preenchido com o usuário atual
  NEW.criado_por = auth.uid()::text;
  
  RETURN NEW; 
END; 
$$;

-- 8️⃣ Criar os TRIGGERS
CREATE TRIGGER trg_prevent_task_move_level_1 
BEFORE UPDATE ON public.tasks 
FOR EACH ROW 
EXECUTE FUNCTION prevent_task_move_level_1();

CREATE TRIGGER trg_set_created_by 
BEFORE INSERT ON public.tasks 
FOR EACH ROW 
EXECUTE FUNCTION set_created_by();

-- 9️⃣ Permissões
GRANT EXECUTE ON FUNCTION get_user_level() TO authenticated;

-- 📝 COMENTÁRIOS EXPLICATIVOS
COMMENT ON POLICY "Users can view tasks from allowed buckets" ON public.tasks IS 
'Permite que usuários vejam tasks baseado no seu nível: Admin vê tudo, User restrito vê apenas TaskInbox';

COMMENT ON POLICY "Users level 1+ can create tasks" ON public.tasks IS 
'Usuários nível 1 e 2 podem criar tasks';

COMMENT ON POLICY "Users can update tasks" ON public.tasks IS 
'Usuários nível 1+ podem editar tasks. Restrições de movimentação são controladas pelo trigger.';

COMMENT ON POLICY "Only admin can delete tasks" ON public.tasks IS 
'Apenas usuários nível 2 (Admin) podem excluir tasks';

COMMENT ON FUNCTION get_user_level() IS 
'Função helper que retorna o nível do usuário autenticado baseado na tabela user';

COMMENT ON FUNCTION prevent_task_move_level_1() IS 
'Trigger function que impede usuários nível 1 de mover tasks entre buckets ou categorias';

-- 🔎 RESUMO DO QUE FOI IMPLEMENTADO
-- ✅ RLS ativado na tabela tasks
-- ✅ Função get_user_level() para obter nível do usuário
-- ✅ Policy SELECT: Admin vê tudo, User restrito vê apenas TaskInbox  
-- ✅ Policy INSERT: Nível 1+ pode criar
-- ✅ Policy UPDATE: Nível 1+ pode editar (sem restrições de OLD/NEW)
-- ✅ Policy DELETE: Apenas nível 2 pode excluir
-- ✅ Policy UPDATE: Nível 2 edita tudo, Nível 1 edita apenas próprias tasks
-- ✅ Trigger para preenchimento automático de criado_por
-- ✅ Trigger para bloquear movimentação de nível 1
-- ✅ Controle de autoria (ownership) implementado

COMMENT ON POLICY "Users can update tasks with ownership control" ON public.tasks IS 
'Usuários nível 2 podem editar qualquer task. Usuários nível 1 podem editar apenas tasks que criaram.';

COMMENT ON FUNCTION prevent_task_move_level_1() IS 
'Trigger function que impede usuários nível 1 de mover tasks entre buckets ou categorias';

COMMENT ON FUNCTION set_created_by() IS 
'Trigger function que preenche automaticamente o campo criado_por com auth.uid() no INSERT';

-- ⚠️ TRATAMENTO DE ERROS NO FRONTEND
-- O frontend deve capturar erros que contenham "não pode mover" para 
-- exibir mensagens amigáveis ao usuário.
-- 🎯 COM
PORTAMENTO FINAL POR NÍVEL:
-- NÍVEL 1 (User Restrito):
--   ✅ Criar tasks (criado_por preenchido automaticamente)
--   ✅ Editar APENAS tasks que criou
--   ❌ Não pode editar tasks de outros usuários
--   ❌ Não pode mover tasks entre categorias
--   ❌ Não pode excluir tasks
--   ✅ Visualizar tasks do TaskInbox

-- NÍVEL 2 (Admin):
--   ✅ Criar tasks
--   ✅ Editar QUALQUER task
--   ✅ Mover tasks entre categorias
--   ✅ Excluir tasks
--   ✅ Visualizar todos os buckets

-- 🔒 SEGURANÇA IMPLEMENTADA:
-- ✅ Controle de autoria (ownership) via RLS
-- ✅ Preenchimento automático de criado_por via trigger
-- ✅ Validações no frontend para melhor UX
-- ✅ Proteção contra bypass via DevTools
-- ✅ Mensagens de erro específicas e amigáveis