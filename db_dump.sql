--
-- PostgreSQL database dump
--

\restrict JgCmeRv6eoPg9PpMebmXrKw5KNvrex1oURHnqzHF1xsQQd2qHQ0JgTzR7scHsPU

-- Dumped from database version 17.6 (Debian 17.6-1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-1)

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
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    type_id integer NOT NULL,
    priority integer NOT NULL,
    name text NOT NULL,
    encrypted_data text NOT NULL
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: lessonstype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessonstype (
    id integer NOT NULL,
    type character varying(20) NOT NULL
);


ALTER TABLE public.lessonstype OWNER TO postgres;

--
-- Name: lessonstype_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessonstype_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessonstype_id_seq OWNER TO postgres;

--
-- Name: lessonstype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessonstype_id_seq OWNED BY public.lessonstype.id;


--
-- Name: student_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    correct_answers integer NOT NULL,
    total_questions integer NOT NULL,
    attempt_count integer NOT NULL,
    max_attempts integer NOT NULL,
    passed boolean NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.student_progress OWNER TO postgres;

--
-- Name: student_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_progress_id_seq OWNER TO postgres;

--
-- Name: student_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_progress_id_seq OWNED BY public.student_progress.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role_id integer NOT NULL,
    login character varying(20) NOT NULL,
    password character varying(100) NOT NULL,
    name character varying(20) NOT NULL,
    surname character varying(20) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

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
-- Name: usersrole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usersrole (
    id integer NOT NULL,
    role character varying(20) NOT NULL
);


ALTER TABLE public.usersrole OWNER TO postgres;

--
-- Name: usersrole_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usersrole_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usersrole_id_seq OWNER TO postgres;

--
-- Name: usersrole_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usersrole_id_seq OWNED BY public.usersrole.id;


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: lessonstype id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessonstype ALTER COLUMN id SET DEFAULT nextval('public.lessonstype_id_seq'::regclass);


--
-- Name: student_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_progress ALTER COLUMN id SET DEFAULT nextval('public.student_progress_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: usersrole id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersrole ALTER COLUMN id SET DEFAULT nextval('public.usersrole_id_seq'::regclass);


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, type_id, priority, name, encrypted_data) FROM stdin;
2	2	1	Вопросы легкой сложности	d7b835d82ff3eb96bbb2844409cd4ab1:26e8c559246f55bd27faf4aee7c0ba610b20a229eb56e91e16b1bbc1008429d61c996ee19d6063f15e35f459f5bee95d8a88c69f11f41912602e0f09ea2e555a036f935722e6e39bff516057a406f20f3abac090c56c2801e1cdbe85057f4aadbba4e8c5c2712b5db99e84707e36a56dc57ecc244c4bd4d2561a1861e87d0d9156af626c360c54d8d7b574d97d0fe94a26691453ce791c97e5d6b0674584df531d6dda4a3d3f5a6074d8fd4a8e5b611c3060fa2d02970e5e83bf79e884fca27cc9dd5e88448e9dcb94c7bc33e242a9d672cf8625a7ea73ba87e9816f546742eb94980db25801c3d74fc84e35460d0b140554e9e4a6d814479d48f860a0057d358c77154e10fe27d0de72126e3bd93014c6601ad26cf1af4c08c09a9c2b2601e67d5c5c9bae184cbd08bd26a34e4f7a5892800a5694bdaacd1aa171318b75754cd62c3c6f26506a39e1d5ed346b2feb5eed1dcc584cb0e3ea1d1fc46521936c10d449849d405cf3fd28701a36ec5b3cacfb03054a2cd1d412b9043123cb069ad0a2a65bf7aea7408c919d1ff03d59e3741b498795c744f0b0898a05420a5f6a67a2d70b8007178bf024116b830caee638b6b4f043cf05b04e3ac2e5f85368b6515c7725af41f22eba19d279a98c6611102c03d6623919776d3318f83f0cf6c6debeac672f47fc7345a6b86b508b68c147f1e86b74f155f80d4229a4d4576995b9279592cdb2694577b29d7d09570b520a28c0d6d9ab0b0398a8f20ff0e67453db
4	3	1	Финишная прямая	49dc9e11891a060445190789a2c5a1fa:0461be1d1ebeccd24c98174d56798a1107c10e68f54bb3d47053e360b27a21caf40434bd67ff21b81c9360d33062bbda4b83556768b2206ce6b498b0938016a4c1bdc427651f17948314fd29e929f0637af0b4ef51128d7e428205280efaf489ed07ea9ecfaa8894d76c8c56823682eaf407906ddc63fc55a317839a00d9770c207beb41c84f1b90bd01a1a4fcec441fef45e0e5e8abe1a308862de09582aa686c2659f232f4ed5326056a968eccd635dbde6f554492d48faec83a62904831811917fd5ee4ae5d34aadef774afdb0ea4bea63237e4a78424f0741caa5bcda536e2ab40f81c346b5aa1c6fc844815f80940b446a98cb6e6f6ccbc214d86ed7dddf47867ea096bbb6e5c5849dc54cc76cb29c5a6dd965fd3632f9aa589b43f8caf8ba51943545df2e571aad444f6f24a92466e12bd8e5cece70b53d672c335cf51e5600b53f0aeb956c9ae34db60c98edb0e5748bbe2e0ae1a617c978dfa4da3583d6864d17f69f66fac8a6d2898f015bc9d7ba56046362de1ab81b770a4727bfcff547c2df4b21cb99442ebaa0e1fbf1f49df5983cf12aaac58c752193838a830e2021ef4c22945295a583f56342f23da125e604e2e02d990f1adebfd0e0c21526ef18e0594fca60da9dda82b708fd024aa81e121fe1949a97cb2087c1c25d133e199989a51c5754ead2f476e6f6bc38c13ae6cf5449cb527f2d252ee90e32d361c7d5657a39e5ab40a65035398830d4c
1	1	2	ООП	97251fe43426d8c338bbeb52a9f037dd:ae5e635ac835352ba858a7a48c783c48095a214c995bfd97c96874f33595f7f5cd9b940789662c77928f93b23f2482bc542805bcd47cad7cbc9e32b222080b2f23395bf8979c993470d62bb1f714ed3c47306ad498a5874325dab5e8f4eae972bdb4b4f11068a259beebbe395b8b24834c984b9dcf94031bfcb08b292bf32181
3	1	3	Патерны	6e065d490535d98a3fc1bb2bcd9d2999:ed45649ebe5fec0fd7a0f2772f0e9c4db46c352a690b70bdce671fe20794c4067ac60e31cf4e471da3d00f3a93df33f2fe0c6e2a7c2e91a6a0e13c4f7e8043ff34b4909201c1f36ee69fce96e62130178e77e29c4c54738d23f7bea641637bccb1d89238f5d378b70ec18c61de2c8ed63cc1865a6fb11377da0240f4212ef93e0aec99496911900bd82712bd7b2b29b3
5	2	2	Вопросы средней сложности	e2121f98a2045e3fae1a2f55d8591b75:d9d4dfe8df83d2b9daa060b351fe79cd90fdbeeed158ef1f76b269ac75501f368c12c9323b4f34bebd7dfa2b6faaa3a86959ac0b2956e4a2cd277094b0da113f5e5c959cd7f1f26499b120e3ca7001f9
6	1	1	Многопоточность	31e4b98bafd4370e3e04974ad2948e2c:136443caafffe461f2ee13b5199d2275739ec9a9894402a9b3e399d92f5029a772866223a239edc70bf48822abe941209463efe7437d26269f248413c744293f10c60bd6d0daa0edc4af04a161f3f46d853a3fb4862022d73ae382a7f7c862e7bc696064b3545e828ccea20bda03c2fff98dcffb37070cce4af13c238a70140daedae55f4486dfd66f4ef986b6ed68743dd39256f23e928c270d2d369b58137396eeefe9a28a069c4948c0f095ccd52be199127cbe432fbbaa92c00cc17b9a261a8e65fafa7659c424a31581037a8d17fc24113a3c5fd2479a4591ab5e725b542662008d80fc10d1a5e89a499dc66c075da0203f483512616125bc26d195c2f7c52ca3d32ef067f779cec65fa25badbd4dbda2e6ff1f557a1e35f5e4d8e590ec68bae19abae2aea646e44c658ad44bdc28726cf570e23259e9621f54488251910ef1993111bf5c5c5f22b626c826b6937070811f93ceb4dd502ba91ecba0b45f1174b9021a3cbedc62b7346686fafbbef9cd0e6160fead98031b245dadb288ff96c0338e0914aaf23a347bdda8eaf27e7669812f1bf32d60b83457c02c71a795e0c71bda2cb245cd8f0b827b63f4f5bfb04fd4321ec9a832629daecc11817dfed0fa79fea62d089f9795cbc1004365405f0e402c802855a4cb0eaa6282ca51d8c0de25332c7f10d0f9f70800c4aac7b52f99d29f00970e559936e89479e9d8df29ae3e21995913b15a769d40e75ecd4faf0ad92a9f205665d7dddd0fc35870c7619a92c0152ce65e3d40fd8e980c97d10cc553313184c1226d0aa0fa498d6164326785733c55a48c8f5abf90ff07e357d2359f8464be5ddbe6702c8590b98c26d2ed383da9b37c9cdafe2bed7633867538aee9f00bc25cfa33b1cea9fc1964a4b10cd25cd6745070fc3d8289e987df4932c0ae07b0e8e74fa1b52df7d09fcda6ac942036a5102cb618d092b2980d2465d2f6193deba110e99da2fa3a3b2d8ca66ee233a337dda1317fd58ef1160ffea3e10ec288130b108e1a9aeff709a6c5e1d0db5e363f2dd52faa5db95c53d62c8249639128546b9dce008bfb7409b3113900eed5f7d98d1ab7065236ddfac91276a6b49c7f80249cec14185ca0cb7542275ad4f342b0c97cbb316761ddfa6b395e93400c3fee6b2fd0670a9a34f8eeb21455fd85e4e9ccf9d02e0e7ea465740effc23db7be21fbda9f9739e15bdc085a17d1ead738e95d7c7cf95fe4516d0a90119ebe2ad83bf0bcd01214647faa963cb2830f4a5bcb7e9b1862e18077c5e268826e3beae4c961d6f9743062c8388f95ef0afa1a9025ac5d65ec435b1a25653f1f44c94d0f0a34ae4887bf00590a9619bfdb82cbc1b96d4766ae1409be2374f1ce2ea9b3021c9f746893f788c999989cc0f9fbbedc5ab4cb4e74e62e2aa3d71921968413dd07787e1933a7ceb9b8c2e5acfbefbde5039225c8c25241624bc86f5c
\.


--
-- Data for Name: lessonstype; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessonstype (id, type) FROM stdin;
1	Лекция
2	Тест
3	Итоговый тест
\.


--
-- Data for Name: student_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_progress (id, user_id, lesson_id, correct_answers, total_questions, attempt_count, max_attempts, passed, created_at) FROM stdin;
36	1	6	5	5	0	100	t	2025-10-14 00:40:06.170191
37	1	1	1	1	0	100	t	2025-10-14 00:40:13.369376
38	1	3	1	1	0	100	t	2025-10-14 00:40:17.423392
39	1	2	5	5	1	3	t	2025-10-14 00:40:25.656837
40	1	5	1	1	1	3	t	2025-10-14 00:40:30.410242
41	1	4	5	5	0	100	t	2025-10-14 00:41:04.087721
49	9	6	5	5	0	100	t	2025-10-18 19:35:27.59076
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, role_id, login, password, name, surname) FROM stdin;
2	2	teacher	$2b$10$hBhTddhCKT8F0dv0gFoUhOD57Ir3BahofP53r.8k/7GpgaYXdCpI6	Сергей	Конов
1	1	admin	$2b$10$4yiN6O.JOl3kRxLLDnpIDukDYXKRG1yojmgKlyYEJwUl0dW0hySoW	Максик	Атас
9	3	james	$2b$10$jwDDDUwdzKRNwCixSM8I0eYeqiDA8UbpQRwDulAcrApGNDvqTaxVO	Клаус	Вадим
\.


--
-- Data for Name: usersrole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usersrole (id, role) FROM stdin;
1	Администратор
2	Преподаватель
3	Студент
\.


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 8, true);


--
-- Name: lessonstype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessonstype_id_seq', 3, true);


--
-- Name: student_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.student_progress_id_seq', 49, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- Name: usersrole_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usersrole_id_seq', 3, true);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: lessonstype lessonstype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessonstype
    ADD CONSTRAINT lessonstype_pkey PRIMARY KEY (id);


--
-- Name: lessonstype lessonstype_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessonstype
    ADD CONSTRAINT lessonstype_type_key UNIQUE (type);


--
-- Name: student_progress student_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT student_progress_pkey PRIMARY KEY (id);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: usersrole usersrole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersrole
    ADD CONSTRAINT usersrole_pkey PRIMARY KEY (id);


--
-- Name: usersrole usersrole_role_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usersrole
    ADD CONSTRAINT usersrole_role_key UNIQUE (role);


--
-- Name: lessons lessons_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.lessonstype(id);


--
-- Name: student_progress student_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT student_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: student_progress student_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_progress
    ADD CONSTRAINT student_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.usersrole(id);


--
-- PostgreSQL database dump complete
--

\unrestrict JgCmeRv6eoPg9PpMebmXrKw5KNvrex1oURHnqzHF1xsQQd2qHQ0JgTzR7scHsPU

