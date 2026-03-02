-- Migration: Update homepage/pricing related copy in DB-backed pricing plans

-- Builder tier description (pricing page reads from get_pricing_plans RPC)
update public.pricing_plans
set description = 'Unlock builder-tier assets, high-quality build packs, and early access to new drops.'
where tier = 'builder';
