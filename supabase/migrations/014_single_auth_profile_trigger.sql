-- Replace the original core signup trigger with the hardened native bootstrap.
-- 001_kilode_core.sql creates on_auth_user_created; 002_auth_profile_bootstrap.sql
-- creates on_auth_user_created_kilode_profile but previously left the first trigger
-- enabled. Both triggers insert the same profile for one auth.users row, which can
-- make signup fail with a duplicate primary-key violation. Keep exactly one trigger.
drop trigger if exists on_auth_user_created on auth.users;

drop trigger if exists on_auth_user_created_kilode_profile on auth.users;
create trigger on_auth_user_created_kilode_profile
  after insert on auth.users
  for each row execute function public.handle_new_kilode_user();

-- The replacement function assigns role='user' regardless of client metadata.
-- Account kind may come from the explicit account-type choice; privileged app role
-- is never accepted from client signup metadata.
