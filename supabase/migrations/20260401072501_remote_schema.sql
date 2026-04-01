drop extension if exists "pg_net";

alter table "public"."draw_entries" drop constraint "draw_entries_draw_id_user_id_key";

alter table "public"."draws" drop constraint "draws_month_year_key";

drop index if exists "public"."draw_entries_draw_id_user_id_key";

drop index if exists "public"."draws_month_year_key";


  create table "public"."charity_events" (
    "id" uuid not null default gen_random_uuid(),
    "charity_id" uuid not null,
    "title" text not null,
    "description" text,
    "event_date" timestamp with time zone,
    "location" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."charity_events" enable row level security;


  create table "public"."draw_simulations" (
    "id" uuid not null default gen_random_uuid(),
    "draw_id" uuid not null,
    "simulated_numbers" integer[] not null,
    "meta" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."draw_simulations" enable row level security;

alter table "public"."charities" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."charities" enable row level security;

alter table "public"."draw_entries" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."draw_entries" enable row level security;

alter table "public"."draws" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."draws" enable row level security;

alter table "public"."golf_scores" enable row level security;

alter table "public"."payments" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."payments" enable row level security;

alter table "public"."prize_pools" add column "created_at" timestamp with time zone not null default now();

alter table "public"."prize_pools" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."prize_pools" enable row level security;

alter table "public"."profiles" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."profiles" enable row level security;

alter table "public"."subscription_plans" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."subscription_plans" enable row level security;

alter table "public"."subscriptions" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."subscriptions" enable row level security;

alter table "public"."user_charity_preferences" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."user_charity_preferences" enable row level security;

alter table "public"."winner_claims" add column "updated_at" timestamp with time zone not null default now();

alter table "public"."winner_claims" enable row level security;

CREATE UNIQUE INDEX charity_events_pkey ON public.charity_events USING btree (id);

CREATE UNIQUE INDEX draw_entries_draw_user_unique ON public.draw_entries USING btree (draw_id, user_id);

CREATE UNIQUE INDEX draw_simulations_pkey ON public.draw_simulations USING btree (id);

CREATE UNIQUE INDEX draws_month_year_unique ON public.draws USING btree (month, year);

CREATE INDEX idx_charities_is_active ON public.charities USING btree (is_active);

CREATE INDEX idx_charities_is_featured ON public.charities USING btree (is_featured);

CREATE INDEX idx_charity_events_charity_id ON public.charity_events USING btree (charity_id);

CREATE INDEX idx_draw_entries_draw_id ON public.draw_entries USING btree (draw_id);

CREATE INDEX idx_draw_entries_result_tier ON public.draw_entries USING btree (result_tier);

CREATE INDEX idx_draw_entries_user_id ON public.draw_entries USING btree (user_id);

CREATE INDEX idx_draw_simulations_draw_id ON public.draw_simulations USING btree (draw_id);

CREATE INDEX idx_draws_status ON public.draws USING btree (status);

CREATE INDEX idx_draws_year_month ON public.draws USING btree (year DESC, month DESC);

CREATE INDEX idx_golf_scores_user_id ON public.golf_scores USING btree (user_id);

CREATE INDEX idx_golf_scores_user_played_at_desc ON public.golf_scores USING btree (user_id, played_at DESC, created_at DESC);

CREATE INDEX idx_payments_type ON public.payments USING btree (type);

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

CREATE INDEX idx_subscriptions_renewal_date ON public.subscriptions USING btree (renewal_date);

CREATE INDEX idx_subscriptions_status ON public.subscriptions USING btree (status);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);

CREATE INDEX idx_user_charity_preferences_charity_id ON public.user_charity_preferences USING btree (charity_id);

CREATE INDEX idx_user_charity_preferences_user_id ON public.user_charity_preferences USING btree (user_id);

CREATE INDEX idx_winner_claims_payment_status ON public.winner_claims USING btree (payment_status);

CREATE INDEX idx_winner_claims_review_status ON public.winner_claims USING btree (review_status);

CREATE INDEX idx_winner_claims_user_id ON public.winner_claims USING btree (user_id);

alter table "public"."charity_events" add constraint "charity_events_pkey" PRIMARY KEY using index "charity_events_pkey";

alter table "public"."draw_simulations" add constraint "draw_simulations_pkey" PRIMARY KEY using index "draw_simulations_pkey";

alter table "public"."charity_events" add constraint "charity_events_charity_id_fkey" FOREIGN KEY (charity_id) REFERENCES public.charities(id) ON DELETE CASCADE not valid;

alter table "public"."charity_events" validate constraint "charity_events_charity_id_fkey";

alter table "public"."draw_entries" add constraint "draw_entries_draw_user_unique" UNIQUE using index "draw_entries_draw_user_unique";

alter table "public"."draw_entries" add constraint "draw_entries_prize_amount_check" CHECK ((prize_amount >= (0)::numeric)) not valid;

alter table "public"."draw_entries" validate constraint "draw_entries_prize_amount_check";

alter table "public"."draw_entries" add constraint "draw_entries_scores_snapshot_valid" CHECK (public.is_valid_score_array(scores_snapshot)) not valid;

alter table "public"."draw_entries" validate constraint "draw_entries_scores_snapshot_valid";

alter table "public"."draw_simulations" add constraint "draw_simulations_draw_id_fkey" FOREIGN KEY (draw_id) REFERENCES public.draws(id) ON DELETE CASCADE not valid;

alter table "public"."draw_simulations" validate constraint "draw_simulations_draw_id_fkey";

alter table "public"."draw_simulations" add constraint "draw_simulations_numbers_valid" CHECK (public.is_valid_draw_numbers(simulated_numbers)) not valid;

alter table "public"."draw_simulations" validate constraint "draw_simulations_numbers_valid";

alter table "public"."draws" add constraint "draws_month_year_unique" UNIQUE using index "draws_month_year_unique";

alter table "public"."draws" add constraint "draws_numbers_valid" CHECK (public.is_valid_draw_numbers(numbers)) not valid;

alter table "public"."draws" validate constraint "draws_numbers_valid";

alter table "public"."prize_pools" add constraint "prize_pools_pool_3_amount_check" CHECK ((pool_3_amount >= (0)::numeric)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_pool_3_amount_check";

alter table "public"."prize_pools" add constraint "prize_pools_pool_4_amount_check" CHECK ((pool_4_amount >= (0)::numeric)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_pool_4_amount_check";

alter table "public"."prize_pools" add constraint "prize_pools_pool_5_amount_check" CHECK ((pool_5_amount >= (0)::numeric)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_pool_5_amount_check";

alter table "public"."prize_pools" add constraint "prize_pools_rollover_in_check" CHECK ((rollover_in >= (0)::numeric)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_rollover_in_check";

alter table "public"."prize_pools" add constraint "prize_pools_rollover_out_check" CHECK ((rollover_out >= (0)::numeric)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_rollover_out_check";

alter table "public"."prize_pools" add constraint "prize_pools_subscriber_count_check" CHECK ((subscriber_count >= 0)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_subscriber_count_check";

alter table "public"."prize_pools" add constraint "prize_pools_total_pool_amount_check" CHECK ((total_pool_amount >= (0)::numeric)) not valid;

alter table "public"."prize_pools" validate constraint "prize_pools_total_pool_amount_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_golf_score(p_user_id uuid, p_score integer, p_played_at date)
 RETURNS public.golf_scores
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  inserted_score public.golf_scores;
  score_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if auth.uid() <> p_user_id and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  if p_score < 1 or p_score > 45 then
    raise exception 'Score must be between 1 and 45';
  end if;

  insert into public.golf_scores (user_id, score, played_at)
  values (p_user_id, p_score, p_played_at)
  returning * into inserted_score;

  select count(*)
  into score_count
  from public.golf_scores
  where user_id = p_user_id;

  if score_count > 5 then
    delete from public.golf_scores
    where id in (
      select id
      from public.golf_scores
      where user_id = p_user_id
      order by played_at asc, created_at asc
      limit (score_count - 5)
    );
  end if;

  return inserted_score;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_draw_numbers(arr integer[])
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select
    arr is not null
    and coalesce(array_length(arr, 1), 0) = 5
    and not exists (
      select 1
      from unnest(arr) as x
      where x < 1 or x > 45
    );
$function$
;

CREATE OR REPLACE FUNCTION public.is_valid_score_array(arr integer[])
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
  select
    arr is not null
    and coalesce(array_length(arr, 1), 0) = 5
    and not exists (
      select 1
      from unnest(arr) as x
      where x < 1 or x > 45
    );
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."charity_events" to "anon";

grant insert on table "public"."charity_events" to "anon";

grant references on table "public"."charity_events" to "anon";

grant select on table "public"."charity_events" to "anon";

grant trigger on table "public"."charity_events" to "anon";

grant truncate on table "public"."charity_events" to "anon";

grant update on table "public"."charity_events" to "anon";

grant delete on table "public"."charity_events" to "authenticated";

grant insert on table "public"."charity_events" to "authenticated";

grant references on table "public"."charity_events" to "authenticated";

grant select on table "public"."charity_events" to "authenticated";

grant trigger on table "public"."charity_events" to "authenticated";

grant truncate on table "public"."charity_events" to "authenticated";

grant update on table "public"."charity_events" to "authenticated";

grant delete on table "public"."charity_events" to "service_role";

grant insert on table "public"."charity_events" to "service_role";

grant references on table "public"."charity_events" to "service_role";

grant select on table "public"."charity_events" to "service_role";

grant trigger on table "public"."charity_events" to "service_role";

grant truncate on table "public"."charity_events" to "service_role";

grant update on table "public"."charity_events" to "service_role";

grant delete on table "public"."draw_simulations" to "anon";

grant insert on table "public"."draw_simulations" to "anon";

grant references on table "public"."draw_simulations" to "anon";

grant select on table "public"."draw_simulations" to "anon";

grant trigger on table "public"."draw_simulations" to "anon";

grant truncate on table "public"."draw_simulations" to "anon";

grant update on table "public"."draw_simulations" to "anon";

grant delete on table "public"."draw_simulations" to "authenticated";

grant insert on table "public"."draw_simulations" to "authenticated";

grant references on table "public"."draw_simulations" to "authenticated";

grant select on table "public"."draw_simulations" to "authenticated";

grant trigger on table "public"."draw_simulations" to "authenticated";

grant truncate on table "public"."draw_simulations" to "authenticated";

grant update on table "public"."draw_simulations" to "authenticated";

grant delete on table "public"."draw_simulations" to "service_role";

grant insert on table "public"."draw_simulations" to "service_role";

grant references on table "public"."draw_simulations" to "service_role";

grant select on table "public"."draw_simulations" to "service_role";

grant trigger on table "public"."draw_simulations" to "service_role";

grant truncate on table "public"."draw_simulations" to "service_role";

grant update on table "public"."draw_simulations" to "service_role";


  create policy "charities_admin_manage"
  on "public"."charities"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "charities_public_read_active"
  on "public"."charities"
  as permissive
  for select
  to public
using (((is_active = true) OR public.is_admin()));



  create policy "charity_events_admin_manage"
  on "public"."charity_events"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "charity_events_public_read_active_or_admin"
  on "public"."charity_events"
  as permissive
  for select
  to public
using ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.charities c
  WHERE ((c.id = charity_events.charity_id) AND (c.is_active = true))))));



  create policy "draw_entries_admin_manage"
  on "public"."draw_entries"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "draw_entries_select_own_or_admin"
  on "public"."draw_entries"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "draw_simulations_admin_only"
  on "public"."draw_simulations"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "draws_admin_manage"
  on "public"."draws"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "draws_public_read_published_or_admin"
  on "public"."draws"
  as permissive
  for select
  to public
using (((status = 'published'::public.draw_status) OR public.is_admin()));



  create policy "golf_scores_delete_own_or_admin"
  on "public"."golf_scores"
  as permissive
  for delete
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "golf_scores_insert_own_or_admin"
  on "public"."golf_scores"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "golf_scores_select_own_or_admin"
  on "public"."golf_scores"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "golf_scores_update_own_or_admin"
  on "public"."golf_scores"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR public.is_admin()))
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "payments_admin_manage"
  on "public"."payments"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "payments_select_own_or_admin"
  on "public"."payments"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "prize_pools_admin_manage"
  on "public"."prize_pools"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "prize_pools_read_authenticated_or_admin"
  on "public"."prize_pools"
  as permissive
  for select
  to public
using (((auth.uid() IS NOT NULL) OR public.is_admin()));



  create policy "profiles_insert_own"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "profiles_select_own_or_admin"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR public.is_admin()));



  create policy "profiles_update_own_or_admin"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.uid() = id) OR public.is_admin()))
with check (((auth.uid() = id) OR public.is_admin()));



  create policy "subscription_plans_admin_manage"
  on "public"."subscription_plans"
  as permissive
  for all
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "subscription_plans_public_read"
  on "public"."subscription_plans"
  as permissive
  for select
  to public
using (((is_active = true) OR public.is_admin()));



  create policy "subscriptions_delete_admin_only"
  on "public"."subscriptions"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "subscriptions_insert_own_or_admin"
  on "public"."subscriptions"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "subscriptions_select_own_or_admin"
  on "public"."subscriptions"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "subscriptions_update_admin_only"
  on "public"."subscriptions"
  as permissive
  for update
  to public
using (public.is_admin())
with check (public.is_admin());



  create policy "charity_preferences_delete_own_or_admin"
  on "public"."user_charity_preferences"
  as permissive
  for delete
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "charity_preferences_insert_own_or_admin"
  on "public"."user_charity_preferences"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "charity_preferences_select_own_or_admin"
  on "public"."user_charity_preferences"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "charity_preferences_update_own_or_admin"
  on "public"."user_charity_preferences"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR public.is_admin()))
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "winner_claims_delete_admin_only"
  on "public"."winner_claims"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "winner_claims_insert_own_or_admin"
  on "public"."winner_claims"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR public.is_admin()));



  create policy "winner_claims_select_own_or_admin"
  on "public"."winner_claims"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR public.is_admin()));



  create policy "winner_claims_update_own_or_admin"
  on "public"."winner_claims"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR public.is_admin()))
with check (((auth.uid() = user_id) OR public.is_admin()));


CREATE TRIGGER set_charities_updated_at BEFORE UPDATE ON public.charities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_charity_events_updated_at BEFORE UPDATE ON public.charity_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_draw_entries_updated_at BEFORE UPDATE ON public.draw_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_draws_updated_at BEFORE UPDATE ON public.draws FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_golf_scores_updated_at BEFORE UPDATE ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_prize_pools_updated_at BEFORE UPDATE ON public.prize_pools FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_charity_preferences_updated_at BEFORE UPDATE ON public.user_charity_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_winner_claims_updated_at BEFORE UPDATE ON public.winner_claims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


