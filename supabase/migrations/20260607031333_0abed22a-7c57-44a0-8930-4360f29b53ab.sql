REVOKE EXECUTE ON FUNCTION public.ensure_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_user_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_role() TO authenticated;