-- Replace Clearbit logo URLs with Google Favicon S2 service (more reliable globally)
UPDATE tools SET logo_url = CASE slug
  WHEN 'cursor'        THEN 'https://www.google.com/s2/favicons?domain=cursor.com&sz=256'
  WHEN 'chatgpt'       THEN 'https://www.google.com/s2/favicons?domain=openai.com&sz=256'
  WHEN 'claude'        THEN 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=256'
  WHEN 'gemini'        THEN 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=256'
  WHEN 'perplexity'    THEN 'https://www.google.com/s2/favicons?domain=perplexity.ai&sz=256'
  WHEN 'midjourney'    THEN 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=256'
  WHEN 'elevenlabs'    THEN 'https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=256'
  WHEN 'notion-ai'     THEN 'https://www.google.com/s2/favicons?domain=notion.so&sz=256'
  WHEN 'runway'        THEN 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=256'
  WHEN 'grammarly'     THEN 'https://www.google.com/s2/favicons?domain=grammarly.com&sz=256'
  WHEN 'copy-ai'       THEN 'https://www.google.com/s2/favicons?domain=copy.ai&sz=256'
  WHEN 'descript'      THEN 'https://www.google.com/s2/favicons?domain=descript.com&sz=256'
  WHEN 'chatpdf'       THEN 'https://www.google.com/s2/favicons?domain=chatpdf.com&sz=256'
  WHEN 'supermaven'    THEN 'https://www.google.com/s2/favicons?domain=supermaven.com&sz=256'
  WHEN 'sarvam-ai'     THEN 'https://www.google.com/s2/favicons?domain=sarvam.ai&sz=256'
  WHEN 'krutrim'       THEN 'https://www.google.com/s2/favicons?domain=krutrim.com&sz=256'
  WHEN 'murf-ai'       THEN 'https://www.google.com/s2/favicons?domain=murf.ai&sz=256'
  WHEN 'dhruva'        THEN 'https://www.google.com/s2/favicons?domain=sarvam.ai&sz=256'
  WHEN 'yellow-ai'     THEN 'https://www.google.com/s2/favicons?domain=yellow.ai&sz=256'
  WHEN 'vernacular-ai' THEN 'https://www.google.com/s2/favicons?domain=vernacular.ai&sz=256'
  ELSE logo_url
END
WHERE slug IN (
  'cursor','chatgpt','claude','gemini','perplexity','midjourney','elevenlabs',
  'notion-ai','runway','grammarly','copy-ai','descript','chatpdf','supermaven',
  'sarvam-ai','krutrim','murf-ai','dhruva','yellow-ai','vernacular-ai'
);
