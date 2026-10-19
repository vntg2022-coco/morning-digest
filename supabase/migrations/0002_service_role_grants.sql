-- The project does not auto-expose new tables, which also means the server's
-- secret key (service_role) gets no table privileges by default. Grant them
-- for existing and future tables. service_role bypasses RLS and is server-only.

grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
