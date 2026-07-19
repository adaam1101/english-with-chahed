-- Run this once in Supabase: SQL Editor > New query > Run.
-- Change the email below if Chaheed will use a different teacher email.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own student profile" on public.profiles;
create policy "Users can update their own student profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id and role = 'student')
with check ((select auth.uid()) = id and role = 'student');


create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when lower(new.email) = 'chaheed@example.com' then 'teacher' else 'student' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Each student can create an account; only the exact email above becomes teacher.

-- Enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  age integer not null,
  date_of_birth date not null,
  email text,
  course text not null check (course in ('English A1', 'English A2', 'English for BAC students', 'English for BEM students')),
  status text not null default 'Pending' check (status in ('Pending', 'Called', 'Accepted')),
  created_at timestamptz not null default now()
);

alter table public.enrollments enable row level security;

-- Policies for Enrollments
drop policy if exists "Anyone can insert enrollments" on public.enrollments;
create policy "Anyone can insert enrollments"
  on public.enrollments for insert to anon, authenticated
  with check (true);

drop policy if exists "Only teachers can manage enrollments" on public.enrollments;
create policy "Only teachers can manage enrollments"
  on public.enrollments for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'teacher'
    )
  );

