-- Managed INR Billing v2
-- 1. Update tools table with billing fields
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS managed_billing_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inr_purchase_link TEXT,
ADD COLUMN IF NOT EXISTS convenience_fee_percent NUMERIC DEFAULT 5.0;

-- 2. Create billing_requests table for lead capture
CREATE TABLE IF NOT EXISTS public.billing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processed, closed
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add RLS for billing_requests
ALTER TABLE public.billing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own billing requests"
ON public.billing_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own billing requests"
ON public.billing_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can see all billing requests"
ON public.billing_requests FOR ALL
USING (public.is_admin());

-- 4. Comments
COMMENT ON COLUMN public.tools.managed_billing_enabled IS 'Whether StackFind managed billing is supported for this tool.';
COMMENT ON COLUMN public.tools.inr_purchase_link IS 'The direct payment link for StackFind managed billing (e.g. Razorpay).';
COMMENT ON COLUMN public.tools.convenience_fee_percent IS 'The percentage markup for managed billing convenience.';
