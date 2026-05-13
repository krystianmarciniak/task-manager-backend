--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'todo'::character varying NOT NULL,
    due_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_user_id integer,
    project_id integer,
    estimated_hours numeric(5,2) DEFAULT 0,
    logged_hours numeric(5,2) DEFAULT 0
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: task_time_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_time_logs (
    id integer NOT NULL,
    task_id integer NOT NULL,
    hours numeric(5,2) NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.task_time_logs OWNER TO postgres;

CREATE SEQUENCE public.task_time_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.task_time_logs_id_seq OWNER TO postgres;
ALTER SEQUENCE public.task_time_logs_id_seq OWNED BY public.task_time_logs.id;
ALTER TABLE ONLY public.task_time_logs ALTER COLUMN id SET DEFAULT nextval('public.task_time_logs_id_seq'::regclass);

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects (id, name, description, created_at) VALUES
(1, 'Task Manager JS', 'Główny projekt aplikacji do zarządzania zadaniami', '2026-04-14 23:22:27.950874'),
(2, 'Frontend Kanban', 'Widok tablicy Kanban i interfejs użytkownika', '2026-04-14 23:22:27.950874'),
(3, 'Backend API', 'Obsługa danych, endpointy i połączenie z bazą', '2026-04-14 23:22:27.950874');


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tasks (id, title, description, status, due_date, created_at, assigned_user_id, project_id, estimated_hours, logged_hours) VALUES
(1, 'Pierwsze zadanie', 'Opis pierwszego zadania', 'todo', '2026-04-20', '2026-04-14 19:17:32.50588', 1, 1, 5, 2.5),
(2, 'Drugie zadanie', 'Opis drugiego zadania', 'in_progress', '2026-04-22', '2026-04-14 19:17:32.50588', 2, 2, 10, 8),
(3, 'Trzecie zadanie', 'Opis trzeciego zadania', 'done', '2026-04-25', '2026-04-14 19:17:32.50588', 3, 3, 3, 3),
(4, 'Nowe zadanie z API - edycja', 'To zadanie zostało zmienione przez endpoint PUT', 'in_progress', '2026-05-05', '2026-04-14 20:02:59.315361', 1, 1, 0, 0),
(6, 'Nowe zadanie relacyjne - edycja', 'Po zmianie użytkownika i projektu', 'in_progress', '2026-05-20', '2026-04-15 04:20:29.953132', 3, 2, 8, 0);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, name, email, created_at) VALUES
(1, 'Krystian Marciniak', 'krystian@example.com', '2026-04-14 22:49:29.149821'),
(2, 'Dawid Kostka', 'dawid@example.com', '2026-04-14 22:49:29.149821'),
(3, 'Marcin Kaminski', 'marcin@example.com', '2026-04-14 22:49:29.149821');


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 3, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: tasks fk_tasks_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: tasks fk_tasks_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_tasks_user FOREIGN KEY (assigned_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.task_time_logs
    ADD CONSTRAINT task_time_logs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.task_time_logs
    ADD CONSTRAINT fk_time_logs_task FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

CREATE TABLE public.labels (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(30) DEFAULT 'blue'::character varying NOT NULL,
    icon character varying(50) DEFAULT 'tag'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE public.labels_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.labels_id_seq OWNED BY public.labels.id;
ALTER TABLE ONLY public.labels ALTER COLUMN id SET DEFAULT nextval('public.labels_id_seq'::regclass);

CREATE TABLE public.task_labels (
    task_id integer NOT NULL,
    label_id integer NOT NULL
);

ALTER TABLE ONLY public.labels ADD CONSTRAINT labels_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.task_labels ADD CONSTRAINT task_labels_pkey PRIMARY KEY (task_id, label_id);
ALTER TABLE ONLY public.task_labels ADD CONSTRAINT fk_task_labels_task FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.task_labels ADD CONSTRAINT fk_task_labels_label FOREIGN KEY (label_id) REFERENCES public.labels(id) ON DELETE CASCADE;

INSERT INTO public.labels (name, color, icon) VALUES
('Bug', 'red', 'bug'),
('Feature', 'blue', 'star'),
('Pilne', 'orange', 'flame');


--
-- PostgreSQL database dump complete
--

