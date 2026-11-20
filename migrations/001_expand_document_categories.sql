-- Para proyectos creados con el límite inicial de cuatro categorías.
alter table public.documents drop constraint if exists documents_cat_check;
alter table public.documents add constraint documents_cat_check check(cat >= 0);
