\connect layersdb;

ALTER TABLE public.task ALTER COLUMN json TYPE text USING json::text;
ALTER TABLE public.task ALTER COLUMN error TYPE text USING error::text;
--ALTER TABLE public.task_history ALTER COLUMN history_elt TYPE text USING history_elt::text;