GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT SELECT ON public.plans TO anon;
GRANT ALL ON public.plans TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_flows TO authenticated;
GRANT ALL ON public.automation_flows TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.iptv_access TO authenticated;
GRANT ALL ON public.iptv_access TO service_role;