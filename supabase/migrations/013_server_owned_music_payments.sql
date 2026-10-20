-- Payment intents and purchase entitlements are trusted-server records.
-- The native client does not yet have a verified payment-intent Edge Function, so
-- do not allow it to create arbitrary pending payment rows (including forged
-- amounts/provider labels) while that server workflow is absent.

drop policy if exists music_payments_insert_pending_own on public.music_payments;
revoke insert, update, delete, truncate, references, trigger
  on public.music_payments from anon, authenticated;

-- Entitlements are created only after trusted provider verification; explicitly
-- deny direct client writes even if table grants change in a future environment.
revoke insert, update, delete, truncate, references, trigger
  on public.music_entitlements from anon, authenticated;

-- Payment initiation must be implemented in a trusted Edge Function that derives
-- prices/currency from server-owned catalogue data, creates an idempotent intent,
-- and returns only the provider checkout details. A verified webhook then updates
-- status and grants entitlements. No client-side success path is permitted.
