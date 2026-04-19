-- Update logo URLs for all seeded tools using Clearbit (128px) + fallbacks
UPDATE tools SET logo_url = CASE slug
  WHEN 'cursor'        THEN 'https://logo.clearbit.com/cursor.com?size=128'
  WHEN 'chatgpt'       THEN 'https://logo.clearbit.com/openai.com?size=128'
  WHEN 'claude'        THEN 'https://logo.clearbit.com/anthropic.com?size=128'
  WHEN 'gemini'        THEN 'https://logo.clearbit.com/google.com?size=128'
  WHEN 'perplexity'    THEN 'https://logo.clearbit.com/perplexity.ai?size=128'
  WHEN 'midjourney'    THEN 'https://logo.clearbit.com/midjourney.com?size=128'
  WHEN 'elevenlabs'    THEN 'https://logo.clearbit.com/elevenlabs.io?size=128'
  WHEN 'notion-ai'     THEN 'https://logo.clearbit.com/notion.so?size=128'
  WHEN 'runway'        THEN 'https://logo.clearbit.com/runwayml.com?size=128'
  WHEN 'grammarly'     THEN 'https://logo.clearbit.com/grammarly.com?size=128'
  WHEN 'copy-ai'       THEN 'https://logo.clearbit.com/copy.ai?size=128'
  WHEN 'descript'      THEN 'https://logo.clearbit.com/descript.com?size=128'
  WHEN 'chatpdf'       THEN 'https://logo.clearbit.com/chatpdf.com?size=128'
  WHEN 'supermaven'    THEN 'https://logo.clearbit.com/supermaven.com?size=128'
  WHEN 'sarvam-ai'     THEN 'https://logo.clearbit.com/sarvam.ai?size=128'
  WHEN 'krutrim'       THEN 'https://logo.clearbit.com/krutrim.com?size=128'
  WHEN 'murf-ai'       THEN 'https://logo.clearbit.com/murf.ai?size=128'
  WHEN 'dhruva'        THEN 'https://logo.clearbit.com/sarvam.ai?size=128'
  WHEN 'yellow-ai'     THEN 'https://logo.clearbit.com/yellow.ai?size=128'
  WHEN 'vernacular-ai' THEN 'https://logo.clearbit.com/vernacular.ai?size=128'
  ELSE logo_url
END
WHERE slug IN (
  'cursor','chatgpt','claude','gemini','perplexity','midjourney','elevenlabs',
  'notion-ai','runway','grammarly','copy-ai','descript','chatpdf','supermaven',
  'sarvam-ai','krutrim','murf-ai','dhruva','yellow-ai','vernacular-ai'
);
