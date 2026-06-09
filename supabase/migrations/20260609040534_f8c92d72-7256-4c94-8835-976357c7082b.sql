-- Move helper into private schema (not exposed via API) to satisfy linter
CREATE OR REPLACE FUNCTION private.current_reseller_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.resellers WHERE user_id = auth.uid() LIMIT 1
$$;

-- Recreate policies to reference private.current_reseller_id
DROP POLICY "Resellers read own tx" ON public.reseller_transactions;
CREATE POLICY "Resellers read own tx" ON public.reseller_transactions
  FOR SELECT TO authenticated
  USING (reseller_id = private.current_reseller_id());

DROP POLICY "Resellers manage own payments" ON public.payments;
CREATE POLICY "Resellers manage own payments" ON public.payments
  FOR ALL TO authenticated
  USING (reseller_id = private.current_reseller_id())
  WITH CHECK (reseller_id = private.current_reseller_id());

DROP POLICY "Resellers manage own investments" ON public.investments;
CREATE POLICY "Resellers manage own investments" ON public.investments
  FOR ALL TO authenticated
  USING (reseller_id = private.current_reseller_id())
  WITH CHECK (reseller_id = private.current_reseller_id());

DROP POLICY "Resellers manage own clients" ON public.clients;
CREATE POLICY "Resellers manage own clients" ON public.clients
  FOR ALL TO authenticated
  USING (reseller_id = private.current_reseller_id())
  WITH CHECK (reseller_id = private.current_reseller_id());

DROP FUNCTION public.current_reseller_id();