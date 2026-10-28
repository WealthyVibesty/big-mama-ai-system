-- Offer stack catalog (prices locked, in cents).
-- lead magnet free | tripwire $27 | order bump $17 | signature tiers $97 / $297 / $997
insert into public.products (slug, name, kind, price, file_path)
values
  ('lead_magnet', 'The AI Workflow Map', 'lead_magnet', 0, 'products/lead_magnet.md'),
  ('tripwire_offer', 'Brand Starter Kit', 'tripwire', 2700, 'products/tripwire_offer.md'),
  ('order_bump', 'Canva Templates Pack', 'order_bump', 1700, 'products/order_bump.md'),
  ('signature_offer', 'The 24/7 Digital Architect', 'signature', 99700, 'products/signature_offer.md')
on conflict (slug) do nothing;
