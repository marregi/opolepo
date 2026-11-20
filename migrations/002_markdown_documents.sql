-- Ejecutar una vez en proyectos con la tabla documents anterior.
begin;
alter table public.documents alter column url drop not null;
alter table public.documents add column markdown text;
alter table public.documents add constraint documents_source_check check (
  (url is not null and markdown is null) or
  (url is null and markdown is not null and length(trim(markdown)) > 0 and octet_length(markdown) <= 1048576)
);
commit;
