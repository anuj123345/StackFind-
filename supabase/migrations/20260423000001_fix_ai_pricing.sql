-- Migration to fix AI pricing and missing modelling column
-- Updated at: 2026-04-23 (v2)

-- 1. Ensure pricing_modelling column exists
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS pricing_modelling JSONB DEFAULT '[]'::JSONB;

-- 2. Populate starting prices for major AI tools
-- Prices are in USD as per standard Pro tiers

-- CLAUDE FAMILY
UPDATE public.tools SET 
  starting_price_usd = 20,
  managed_billing_enabled = true,
  convenience_fee_percent = 5,
  pricing_modelling = '[
    {"label": "Pro Plan", "value": "$20", "unit": "month"},
    {"label": "Context", "value": "200k", "unit": "tokens"},
    {"label": "Model", "value": "Claude 3.5 Sonnet", "unit": ""}
  ]'::JSONB
WHERE slug IN ('claude', 'claude-sonnet', 'claude-haiku', 'claude-opus-47');

-- PERPLEXITY
UPDATE public.tools SET 
  starting_price_usd = 20,
  managed_billing_enabled = true,
  convenience_fee_percent = 5,
  pricing_modelling = '[
    {"label": "Pro Plan", "value": "$20", "unit": "month"},
    {"label": "Searches", "value": "Unlimited", "unit": ""},
    {"label": "Model", "value": "GPT-4o/Claude 3.5", "unit": ""}
  ]'::JSONB
WHERE slug IN ('perplexity', 'perplexity-ai');

-- GEMINI
UPDATE public.tools SET 
  starting_price_usd = 20,
  managed_billing_enabled = true,
  convenience_fee_percent = 5,
  pricing_modelling = '[
    {"label": "Gemini Advanced", "value": "$20", "unit": "month"},
    {"label": "Storage", "value": "2TB", "unit": "Google One"},
    {"label": "Model", "value": "Gemini 1.5 Pro", "unit": ""}
  ]'::JSONB
WHERE slug IN ('gemini', 'google-gemini', 'gemini-advanced');

-- CHATGPT / OPENAI
UPDATE public.tools SET 
  starting_price_usd = 20,
  managed_billing_enabled = true,
  convenience_fee_percent = 5,
  pricing_modelling = '[
    {"label": "Plus Plan", "value": "$20", "unit": "month"},
    {"label": "Access", "value": "Priority", "unit": ""},
    {"label": "Model", "value": "GPT-4o", "unit": ""}
  ]'::JSONB
WHERE slug IN ('chatgpt', 'openai', 'openai-chatgpt');

-- MISTRAL
UPDATE public.tools SET 
  starting_price_usd = 10,
  managed_billing_enabled = true,
  convenience_fee_percent = 5,
  pricing_modelling = '[
    {"label": "Pro Plan", "value": "$10", "unit": "month"},
    {"label": "Model", "value": "Mistral Large 2", "unit": ""}
  ]'::JSONB
WHERE slug = 'mistral';

-- GROQ / DEEPSEEK (Free / API based)
UPDATE public.tools SET 
  starting_price_usd = 0,
  managed_billing_enabled = true,
  convenience_fee_percent = 5,
  pricing_modelling = '[
    {"label": "Usage", "value": "Free", "unit": "Beta"},
    {"label": "Speed", "value": "Ultra-fast", "unit": "LPU"}
  ]'::JSONB
WHERE slug IN ('groq', 'deepseek');
