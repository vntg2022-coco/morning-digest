-- Learning languages form one ordered list (like the macOS Preferred Languages
-- list): the top N, where N is the plan's slots, are active; the rest are paused.
alter table public.learning_languages add column sort_order integer;

update public.learning_languages l
set sort_order = ranked.rn
from (
  select user_id, lang,
         row_number() over (partition by user_id order by active desc, created_at) as rn
  from public.learning_languages
) ranked
where l.user_id = ranked.user_id and l.lang = ranked.lang;

alter table public.learning_languages alter column sort_order set not null;
alter table public.learning_languages alter column sort_order set default 1000;
