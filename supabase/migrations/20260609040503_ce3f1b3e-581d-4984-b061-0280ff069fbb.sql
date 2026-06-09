-- ============ RESELLERS ============
CREATE TABLE public.resellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  contact text,
  balance numeric NOT NULL DEFAULT 0,
  credit_cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ativo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resellers TO authenticated;
GRANT ALL ON public.resellers TO service_role;
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;

-- Helper: get reseller id for current user (after table exists)
CREATE OR REPLACE FUNCTION public.current_reseller_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.resellers WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE POLICY "Admins manage resellers" ON public.resellers
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers read own row" ON public.resellers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Resellers update own contact" ON public.resellers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============ RESELLER TRANSACTIONS ============
CREATE TABLE public.reseller_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'credit_purchase',
  amount numeric NOT NULL DEFAULT 0,
  balance_after numeric,
  description text,
  reference text,
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reseller_transactions TO authenticated;
GRANT ALL ON public.reseller_transactions TO service_role;
ALTER TABLE public.reseller_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage reseller tx" ON public.reseller_transactions
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers read own tx" ON public.reseller_transactions
  FOR SELECT TO authenticated
  USING (reseller_id = public.current_reseller_id());

-- ============ PAYMENTS (revenue history) ============
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  reseller_id uuid REFERENCES public.resellers(id) ON DELETE SET NULL,
  amount numeric NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'paid',
  reference text,
  description text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers manage own payments" ON public.payments
  FOR ALL TO authenticated
  USING (reseller_id = public.current_reseller_id())
  WITH CHECK (reseller_id = public.current_reseller_id());

-- ============ INVESTMENTS ============
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid REFERENCES public.resellers(id) ON DELETE SET NULL,
  panel_name text,
  amount numeric NOT NULL DEFAULT 0,
  credits integer,
  notes text,
  invested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage investments" ON public.investments
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Resellers manage own investments" ON public.investments
  FOR ALL TO authenticated
  USING (reseller_id = public.current_reseller_id())
  WITH CHECK (reseller_id = public.current_reseller_id());

-- ============ CLIENTS: link to reseller ============
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS reseller_id uuid REFERENCES public.resellers(id) ON DELETE SET NULL;

CREATE POLICY "Resellers manage own clients" ON public.clients
  FOR ALL TO authenticated
  USING (reseller_id = public.current_reseller_id())
  WITH CHECK (reseller_id = public.current_reseller_id());

-- updated_at triggers
CREATE TRIGGER update_resellers_updated_at BEFORE UPDATE ON public.resellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();