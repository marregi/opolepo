create table if not exists public.study_state (
  owner uuid primary key references auth.users(id) on delete cascade,
  value jsonb not null
);
create table if not exists public.questions (id text primary key, value jsonb not null);
alter table public.study_state enable row level security;
alter table public.questions enable row level security;
create policy own_state on public.study_state for all to authenticated
using (owner = auth.uid()) with check (owner = auth.uid());
create policy read_questions on public.questions for select to authenticated using (true);
create policy admin_questions on public.questions for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');
grant select,insert,update on public.study_state,public.questions to authenticated;
create table public.documents (
 id uuid primary key, title text not null, cat integer not null check(cat >= 0),
 url text check(url ~* '^https?://'),
 markdown text,
 constraint documents_source_check check (
   (url is not null and markdown is null) or
   (url is null and markdown is not null and length(trim(markdown)) > 0 and octet_length(markdown) <= 1048576)
 )
);
alter table public.documents enable row level security;
create policy read_documents on public.documents for select to authenticated using(true);
create policy add_document on public.documents for insert to authenticated
with check ((auth.jwt()->'app_metadata'->>'role') = 'admin');
grant select,insert on public.documents to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('corpus','corpus',true,10485760,array['application/pdf']) on conflict do nothing;
create policy upload_corpus on storage.objects for insert to authenticated
with check(bucket_id='corpus' and (auth.jwt()->'app_metadata'->>'role')='admin');
