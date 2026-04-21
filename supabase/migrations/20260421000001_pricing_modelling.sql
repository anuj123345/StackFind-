-- Add pricing_modelling field to tools table
-- This field will store structured pricing data (e.g. token costs, seat tiers)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS pricing_modelling JSONB DEFAULT '[]'::JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.tools.pricing_modelling IS 'Structured pricing data including units, prices, and billing metrics.';

-- Ensure the field is also in submissions for new tools
-- Assuming tool_data is the JSONB blob in submissions
-- (Existing API logic already handles saving whatever is in the body, 
-- but this migration makes it official for the tools table)
