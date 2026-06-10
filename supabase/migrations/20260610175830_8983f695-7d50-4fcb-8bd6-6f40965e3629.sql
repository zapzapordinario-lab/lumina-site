CREATE TABLE public.instruction_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.instruction_credentials TO authenticated;
GRANT ALL ON public.instruction_credentials TO service_role;

ALTER TABLE public.instruction_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage instruction credentials"
ON public.instruction_credentials
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_instruction_credentials_updated_at
BEFORE UPDATE ON public.instruction_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();