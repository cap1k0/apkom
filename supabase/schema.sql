-- ============================================================
-- PROFILES (linked 1:1 with auth.users)
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  password_set boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ARTICLES (public read, admin-only write)
-- ============================================================
create table articles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  published_at timestamptz default now()
);

alter table articles enable row level security;

create policy "anyone can read articles"
  on articles for select using (true);

create policy "only admins can insert articles"
  on articles for insert with check (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "only admins can update articles"
  on articles for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "only admins can delete articles"
  on articles for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- PAGES (Privacy Policy, Terms — public read, admin-only write)
-- ============================================================
create table pages (
  slug text primary key,
  title text not null,
  content text not null,
  updated_at timestamptz default now()
);

alter table pages enable row level security;

create policy "anyone can read pages"
  on pages for select using (true);

create policy "only admins can write pages"
  on pages for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

insert into pages (slug, title, content) values
  ('privacy-policy', 'Privacy Policy', 'Write your privacy policy here.'),
  ('terms', 'Terms of Service', 'Write your terms here.');

-- ============================================================
-- STORAGE (media bucket, served via Supabase's built-in CDN)
-- ============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "public can view media"
  on storage.objects for select using (bucket_id = 'media');

create policy "admins can upload media"
  on storage.objects for insert with check (
    bucket_id = 'media' and
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- After running this: manually set your own row's is_admin = true
-- in the Supabase Table Editor to create the first admin.
-- ============================================================
