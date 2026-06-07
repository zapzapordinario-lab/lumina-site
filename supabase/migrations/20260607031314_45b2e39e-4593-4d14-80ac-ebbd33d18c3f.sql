CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS public.app_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.app_role;
  assigned public.app_role;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO existing FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    assigned := 'admin';
  ELSE
    assigned := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), assigned)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN assigned;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_user_role() TO authenticated;