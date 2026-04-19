-- ============================================================
-- Seed: Tools + tool_categories links
-- ============================================================

-- Insert tools
INSERT INTO tools (slug, name, tagline, description, website, pricing_model, has_inr_billing, has_gst_invoice, has_upi, has_india_support, is_made_in_india, status, upvotes, approved_at, featured_until)
VALUES
  ('cursor',        'Cursor',         'The AI-first code editor that knows your entire codebase.',                                          'Cursor is a fork of VS Code with deep AI integration. It can write, edit, and explain code using your entire codebase as context.',                                        'https://cursor.com',         'freemium', false, false, false, true,  false, 'approved', 2841, now(), now() + interval '60 days'),
  ('sarvam-ai',     'Sarvam AI',      'Full-stack AI platform built for India. 10 Indian languages, INR billing, GST invoices.',           'Sarvam AI provides LLMs, speech recognition, translation, and voice synthesis tuned for Indian languages. Offers INR billing and GST invoices.',                           'https://sarvam.ai',          'freemium', true,  true,  true,  true,  true,  'approved', 987,  now(), now() + interval '60 days'),
  ('krutrim',       'Krutrim',        'India''s own AI built by Ola. Trained on Indian languages and culture.',                           'Krutrim is a multilingual AI assistant built by Ola for Indian users. It understands context from Indian culture, supports regional languages, and offers INR pricing.', 'https://krutrim.com',        'free',     true,  true,  true,  true,  true,  'approved', 743,  now(), now() + interval '60 days'),
  ('perplexity',    'Perplexity',     'AI search that gives you answers, not just links.',                                                  'Perplexity is an AI-powered answer engine that searches the web in real-time and provides cited, accurate responses to any question.',                                   'https://perplexity.ai',      'freemium', true,  false, false, true,  false, 'approved', 1920, now(), now() + interval '30 days'),
  ('elevenlabs',    'ElevenLabs',     'The most realistic AI voice generator. Clone any voice in seconds.',                                'ElevenLabs creates the most realistic and versatile AI voices. Generate speech in 29 languages, clone voices, and build voice products.',                              'https://elevenlabs.io',      'freemium', false, false, false, false, false, 'approved', 2103, now(), now() + interval '30 days'),
  ('midjourney',    'Midjourney',     'Create stunning AI images. The world''s most powerful image generator.',                            'Midjourney is an AI art generation tool that creates high-quality, artistic images from text prompts. Known for its photorealistic and painterly outputs.',              'https://midjourney.com',     'paid',     false, false, false, false, false, 'approved', 3210, now(), null),
  ('notion-ai',     'Notion AI',      'Think bigger. Work faster. AI built right into your workspace.',                                    'Notion AI is integrated into the Notion workspace. It helps with writing, summarising, translating, and answering questions about your documents.',                        'https://notion.so',          'freemium', true,  false, false, true,  false, 'approved', 1872, now(), null),
  ('runway',        'Runway',         'AI magic tools for video editing. Generate, edit and transform video.',                             'Runway is a creative AI company offering tools for video generation, editing, background removal, motion tracking, and more through its Gen-2 model.',                   'https://runwayml.com',       'freemium', false, false, false, false, false, 'approved', 1654, now(), null),
  ('copy-ai',       'Copy.ai',        'AI copywriting that writes marketing copy in seconds.',                                              'Copy.ai generates high-converting marketing copy including blog posts, ad copy, product descriptions, and social media content using AI.',                             'https://copy.ai',            'freemium', true,  false, true,  true,  false, 'approved', 921,  now(), null),
  ('murf-ai',       'Murf AI',        'Studio-quality AI voices. 120+ voices across 20 languages including Indian languages.',             'Murf AI is an Indian voice synthesis platform offering 120+ realistic voices, supporting Hindi and regional Indian languages, with INR pricing and UPI payments.',     'https://murf.ai',            'freemium', true,  true,  true,  true,  true,  'approved', 567,  now(), null),
  ('descript',      'Descript',       'Edit video by editing text. AI-powered video and podcast editor.',                                  'Descript lets you edit video as easily as editing a document. Features include AI transcription, filler word removal, screen recording, and overdub.',                  'https://descript.com',       'freemium', false, false, false, false, false, 'approved', 834,  now(), null),
  ('chatpdf',       'ChatPDF',        'Chat with any PDF using AI. Instant answers from any document.',                                    'ChatPDF lets you have a conversation with any PDF file. Upload a document and ask questions to get instant, cited answers.',                                            'https://chatpdf.com',        'freemium', false, false, false, false, false, 'approved', 445,  now(), null),
  ('supermaven',    'Supermaven',     'The fastest AI code completion. 300k token context window.',                                        'Supermaven provides ultra-fast AI code completions with a massive 300,000 token context window, supporting all major IDEs.',                                             'https://supermaven.com',     'freemium', false, false, false, false, false, 'approved', 678,  now(), null),
  ('dhruva',        'Dhruva',         'Speech recognition and synthesis for 14 Indian languages.',                                         'Dhruva by Sarvam AI is a speech platform supporting Automatic Speech Recognition and Text-to-Speech for 14 Indian languages with high accuracy.',                      'https://dhruva.sarvam.ai',   'freemium', true,  true,  false, true,  true,  'approved', 412,  now(), null),
  ('yellow-ai',     'Yellow.ai',      'Enterprise-grade conversational AI platform, built in India.',                                      'Yellow.ai is a conversational AI platform used by enterprises globally. It supports omnichannel bots across WhatsApp, web, and voice with multilingual support.',   'https://yellow.ai',          'paid',     true,  true,  false, true,  true,  'approved', 621,  now(), null),
  ('vernacular-ai', 'Vernacular.ai',  'Conversational AI for Indian vernacular languages at scale.',                                       'Vernacular.ai enables businesses to automate customer interactions in regional Indian languages including Hindi, Bengali, Tamil, and more.',                            'https://vernacular.ai',      'freemium', true,  true,  true,  true,  true,  'approved', 388,  now(), null),
  ('chatgpt',       'ChatGPT',        'The world''s most popular AI assistant. Now with INR billing.',                                     'ChatGPT by OpenAI is a conversational AI that can answer questions, write code, draft documents, and reason through complex problems.',                                 'https://chat.openai.com',    'freemium', true,  false, false, true,  false, 'approved', 8921, now(), null),
  ('claude',        'Claude',         'Anthropic''s AI assistant. Thoughtful, harmless, and genuinely helpful.',                           'Claude is Anthropic''s AI assistant known for thoughtful, nuanced responses. Excels at writing, analysis, coding, and following complex instructions safely.',         'https://claude.ai',          'freemium', true,  false, false, true,  false, 'approved', 4532, now(), null),
  ('gemini',        'Gemini',         'Google''s most capable AI model. Multimodal from the ground up.',                                   'Gemini by Google is a multimodal AI that understands text, images, audio, and code. Available across Google products and as a standalone assistant.',                   'https://gemini.google.com',  'freemium', true,  false, false, true,  false, 'approved', 3102, now(), null),
  ('grammarly',     'Grammarly',      'AI writing assistant that helps you write clearly and confidently.',                                 'Grammarly checks grammar, spelling, style, and tone in real time. It works across the web, in documents, and in your email.',                                         'https://grammarly.com',      'freemium', true,  false, false, true,  false, 'approved', 2234, now(), null)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  upvotes = EXCLUDED.upvotes,
  status = EXCLUDED.status;

-- Link tools to categories using slug lookups
INSERT INTO tool_categories (tool_id, category_id)
SELECT t.id, c.id FROM tools t, categories c
WHERE (t.slug = 'cursor'        AND c.slug = 'coding')
   OR (t.slug = 'sarvam-ai'     AND c.slug = 'chatbots')
   OR (t.slug = 'sarvam-ai'     AND c.slug = 'made-in-india')
   OR (t.slug = 'krutrim'       AND c.slug = 'chatbots')
   OR (t.slug = 'krutrim'       AND c.slug = 'made-in-india')
   OR (t.slug = 'perplexity'    AND c.slug = 'chatbots')
   OR (t.slug = 'elevenlabs'    AND c.slug = 'video')
   OR (t.slug = 'midjourney'    AND c.slug = 'image-generation')
   OR (t.slug = 'notion-ai'     AND c.slug = 'productivity')
   OR (t.slug = 'runway'        AND c.slug = 'video')
   OR (t.slug = 'copy-ai'       AND c.slug = 'writing')
   OR (t.slug = 'copy-ai'       AND c.slug = 'marketing')
   OR (t.slug = 'murf-ai'       AND c.slug = 'marketing')
   OR (t.slug = 'murf-ai'       AND c.slug = 'made-in-india')
   OR (t.slug = 'descript'      AND c.slug = 'video')
   OR (t.slug = 'chatpdf'       AND c.slug = 'productivity')
   OR (t.slug = 'supermaven'    AND c.slug = 'coding')
   OR (t.slug = 'dhruva'        AND c.slug = 'made-in-india')
   OR (t.slug = 'yellow-ai'     AND c.slug = 'chatbots')
   OR (t.slug = 'yellow-ai'     AND c.slug = 'automation')
   OR (t.slug = 'yellow-ai'     AND c.slug = 'made-in-india')
   OR (t.slug = 'vernacular-ai' AND c.slug = 'chatbots')
   OR (t.slug = 'vernacular-ai' AND c.slug = 'made-in-india')
   OR (t.slug = 'chatgpt'       AND c.slug = 'chatbots')
   OR (t.slug = 'claude'        AND c.slug = 'chatbots')
   OR (t.slug = 'claude'        AND c.slug = 'writing')
   OR (t.slug = 'gemini'        AND c.slug = 'chatbots')
   OR (t.slug = 'grammarly'     AND c.slug = 'writing')
   OR (t.slug = 'grammarly'     AND c.slug = 'productivity')
ON CONFLICT DO NOTHING;

-- Refresh category tool counts
UPDATE categories c
SET tool_count = (
  SELECT COUNT(*) FROM tool_categories tc
  JOIN tools t ON t.id = tc.tool_id
  WHERE tc.category_id = c.id AND t.status = 'approved'
);
