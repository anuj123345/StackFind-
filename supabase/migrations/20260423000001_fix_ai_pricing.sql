-- Migration to fix AI pricing and missing modelling column
-- Created at: 2026-04-23

-- 1. Ensure pricing_modelling column exists
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS pricing_modelling JSONB DEFAULT '[]'::JSONB;

-- 2. Populate starting prices for major AI tools
-- Prices are in USD as per standard Pro tiers
UPDATE public.tools SET 
  starting_price_usd = 20,
  pricing_modelling = '[
    {"label": "Pro Plan", "value": "$20", "unit": "month"},
    {"label": "Context", "value": "200k", "unit": "tokens"},
    {"label": "Model", "value": "Claude 3.5 Sonnet", "unit": ""}
  ]'::JSONB
WHERE slug = 'claude';

UPDATE public.tools SET 
  starting_price_usd = 20,
  pricing_modelling = '[
    {"label": "Pro Plan", "value": "$20", "unit": "month"},
    {"label": "Searches", "value": "Unlimited", "unit": ""},
    {"label": "Model", "value": "GPT-4o/Claude 3.5", "unit": ""}
  ]'::JSONB
WHERE slug = 'perplexity';

UPDATE public.tools SET 
  starting_price_usd = 20,
  pricing_modelling = '[
    {"label": "Gemini Advanced", "value": "$20", "unit": "month"},
    {"label": "Storage", "value": "2TB", "unit": "Google One"},
    {"label": "Model", "value": "Gemini 1.5 Pro", "unit": ""}
  ]'::JSONB
WHERE slug = 'gemini';

UPDATE public.tools SET 
  starting_price_usd = 20,
  pricing_modelling = '[
    {"label": "Plus Plan", "value": "$20", "unit": "month"},
    {"label": "Access", "value": "Priority", "unit": ""},
    {"label": "Model", "value": "GPT-4o", "unit": ""}
  ]'::JSONB
WHERE slug = 'openai';

-- 3. Enable managed billing for these tools if not already
UPDATE public.tools SET 
  managed_billing_enabled = true,
  convenience_fee_percent = 5
WHERE slug IN ('claude', 'perplexity', 'gemini', 'openai');
