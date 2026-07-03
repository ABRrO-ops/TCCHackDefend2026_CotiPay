--
-- PostgreSQL database dump
--

\restrict ZtJVJbB7C8yJWhJhSsKs9aInjCQLIaTdPgvoyPRhC7mWU58Dbs8x5Nc7XnKuZXT

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

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
-- Name: cotisations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cotisations (
    id integer NOT NULL,
    membre_id integer,
    montant numeric(10,2) NOT NULL,
    statut character varying(20) DEFAULT 'attente'::character varying,
    date_cotisation date DEFAULT CURRENT_DATE,
    heure_validation timestamp without time zone,
    collecteur_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    initiee_par character varying(20) DEFAULT 'collecteur'::character varying,
    mode_paiement character varying(30),
    CONSTRAINT cotisations_initiee_par_check CHECK (((initiee_par)::text = ANY ((ARRAY['collecteur'::character varying, 'membre'::character varying])::text[]))),
    CONSTRAINT cotisations_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['mix_by_yas'::character varying, 'moov_money'::character varying])::text[]))),
    CONSTRAINT cotisations_statut_check CHECK (((statut)::text = ANY ((ARRAY['attente'::character varying, 'valide'::character varying])::text[])))
);


ALTER TABLE public.cotisations OWNER TO postgres;

--
-- Name: cotisations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cotisations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cotisations_id_seq OWNER TO postgres;

--
-- Name: cotisations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cotisations_id_seq OWNED BY public.cotisations.id;


--
-- Name: demandes_inscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_inscription (
    id integer NOT NULL,
    nom_microfinance character varying(100) NOT NULL,
    ville character varying(50) NOT NULL,
    telephone character varying(20) NOT NULL,
    numero_agrement character varying(50),
    nom_directeur character varying(50) NOT NULL,
    prenom_directeur character varying(50) NOT NULL,
    email_directeur character varying(100) NOT NULL,
    plan_choisi character varying(20),
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT demandes_inscription_plan_choisi_check CHECK (((plan_choisi)::text = ANY ((ARRAY['starter'::character varying, 'standard'::character varying, 'premium'::character varying])::text[]))),
    CONSTRAINT demandes_inscription_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'rejetee'::character varying])::text[])))
);


ALTER TABLE public.demandes_inscription OWNER TO postgres;

--
-- Name: demandes_inscription_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demandes_inscription_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demandes_inscription_id_seq OWNER TO postgres;

--
-- Name: demandes_inscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demandes_inscription_id_seq OWNED BY public.demandes_inscription.id;


--
-- Name: demandes_retrait; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_retrait (
    id integer NOT NULL,
    membre_id integer,
    montant numeric(10,2) NOT NULL,
    mode_paiement character varying(30),
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    motif_rejet text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    traite_le timestamp without time zone,
    CONSTRAINT demandes_retrait_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['mix_by_yas'::character varying, 'moov_money'::character varying])::text[]))),
    CONSTRAINT demandes_retrait_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'validee'::character varying, 'rejetee'::character varying])::text[])))
);


ALTER TABLE public.demandes_retrait OWNER TO postgres;

--
-- Name: demandes_retrait_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demandes_retrait_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demandes_retrait_id_seq OWNER TO postgres;

--
-- Name: demandes_retrait_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demandes_retrait_id_seq OWNED BY public.demandes_retrait.id;


--
-- Name: engagements_mensuels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.engagements_mensuels (
    id integer NOT NULL,
    membre_id integer,
    mois integer NOT NULL,
    annee integer NOT NULL,
    montant_journalier numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.engagements_mensuels OWNER TO postgres;

--
-- Name: engagements_mensuels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.engagements_mensuels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.engagements_mensuels_id_seq OWNER TO postgres;

--
-- Name: engagements_mensuels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.engagements_mensuels_id_seq OWNED BY public.engagements_mensuels.id;


--
-- Name: membres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membres (
    id integer NOT NULL,
    user_id integer,
    montant_cotisation numeric(10,2) DEFAULT 0,
    solde numeric(10,2) DEFAULT 0,
    collecteur_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    adresse character varying(150),
    lieu_travail character varying(100),
    ville_village character varying(50),
    telephone character varying(20),
    photo_url character varying(255),
    numero_compte character varying(30)
);


ALTER TABLE public.membres OWNER TO postgres;

--
-- Name: membres_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.membres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.membres_id_seq OWNER TO postgres;

--
-- Name: membres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.membres_id_seq OWNED BY public.membres.id;


--
-- Name: microfinances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.microfinances (
    id integer NOT NULL,
    nom character varying(100) NOT NULL,
    ville character varying(50) NOT NULL,
    telephone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(20) DEFAULT 'en_attente'::character varying,
    plan character varying(20),
    domaine_email character varying(50),
    CONSTRAINT microfinances_plan_check CHECK (((plan)::text = ANY ((ARRAY['starter'::character varying, 'standard'::character varying, 'premium'::character varying])::text[]))),
    CONSTRAINT microfinances_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'active'::character varying, 'rejetee'::character varying])::text[])))
);


ALTER TABLE public.microfinances OWNER TO postgres;

--
-- Name: microfinances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.microfinances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.microfinances_id_seq OWNER TO postgres;

--
-- Name: microfinances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.microfinances_id_seq OWNED BY public.microfinances.id;


--
-- Name: profils_collecteurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profils_collecteurs (
    id integer NOT NULL,
    user_id integer,
    lieu_travail_avant character varying(100),
    date_naissance date,
    photo_url character varying(255),
    cv_url character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.profils_collecteurs OWNER TO postgres;

--
-- Name: profils_collecteurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profils_collecteurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profils_collecteurs_id_seq OWNER TO postgres;

--
-- Name: profils_collecteurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profils_collecteurs_id_seq OWNED BY public.profils_collecteurs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nom character varying(50) NOT NULL,
    prenom character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    mot_de_passe character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    microfinance_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    statut character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'collecteur'::character varying, 'membre'::character varying, 'super_admin'::character varying])::text[]))),
    CONSTRAINT users_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'active'::character varying, 'rejete'::character varying])::text[])))
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
-- Name: cotisations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotisations ALTER COLUMN id SET DEFAULT nextval('public.cotisations_id_seq'::regclass);


--
-- Name: demandes_inscription id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_inscription ALTER COLUMN id SET DEFAULT nextval('public.demandes_inscription_id_seq'::regclass);


--
-- Name: demandes_retrait id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_retrait ALTER COLUMN id SET DEFAULT nextval('public.demandes_retrait_id_seq'::regclass);


--
-- Name: engagements_mensuels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagements_mensuels ALTER COLUMN id SET DEFAULT nextval('public.engagements_mensuels_id_seq'::regclass);


--
-- Name: membres id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membres ALTER COLUMN id SET DEFAULT nextval('public.membres_id_seq'::regclass);


--
-- Name: microfinances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.microfinances ALTER COLUMN id SET DEFAULT nextval('public.microfinances_id_seq'::regclass);


--
-- Name: profils_collecteurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profils_collecteurs ALTER COLUMN id SET DEFAULT nextval('public.profils_collecteurs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cotisations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cotisations (id, membre_id, montant, statut, date_cotisation, heure_validation, collecteur_id, created_at, initiee_par, mode_paiement) FROM stdin;
1	1	2000.00	valide	2026-06-06	\N	\N	2026-06-06 13:49:16.68413	collecteur	\N
2	2	5000.00	valide	2026-06-06	\N	\N	2026-06-06 22:45:15.38967	collecteur	\N
11	1	2000.00	valide	2026-06-18	\N	\N	2026-06-18 00:01:38.012054	collecteur	\N
12	2	5000.00	valide	2026-06-18	\N	\N	2026-06-18 00:01:44.402752	collecteur	\N
13	3	1000.00	valide	2026-06-18	\N	\N	2026-06-18 09:26:46.795722	collecteur	\N
14	1	2000.00	valide	2026-06-19	\N	\N	2026-06-19 18:48:15.516877	collecteur	\N
15	2	5000.00	valide	2026-06-19	\N	\N	2026-06-19 18:48:30.140826	collecteur	\N
16	1	2000.00	valide	2026-06-23	2026-06-23 00:42:52.965844	\N	2026-06-23 00:42:52.965844	collecteur	\N
17	2	5000.00	valide	2026-06-23	2026-06-23 00:42:54.586806	\N	2026-06-23 00:42:54.586806	collecteur	\N
18	3	1000.00	valide	2026-06-23	2026-06-23 00:42:55.764246	\N	2026-06-23 00:42:55.764246	collecteur	\N
19	1	2000.00	valide	2026-06-24	2026-06-24 22:51:01.315203	\N	2026-06-24 22:51:01.315203	collecteur	\N
20	2	5000.00	valide	2026-06-24	2026-06-24 22:51:07.625969	\N	2026-06-24 22:51:07.625969	collecteur	\N
21	3	1000.00	valide	2026-06-24	2026-06-24 22:51:13.569169	\N	2026-06-24 22:51:13.569169	collecteur	\N
22	1	2000.00	valide	2026-06-25	2026-06-25 00:05:58.272529	\N	2026-06-25 00:05:37.826884	membre	mix_by_yas
23	2	5000.00	valide	2026-06-25	2026-06-25 00:54:48.729709	\N	2026-06-25 00:27:34.506223	membre	moov_money
24	3	1000.00	valide	2026-06-25	2026-06-25 01:17:18.874167	\N	2026-06-25 00:52:32.339531	membre	moov_money
25	2	5000.00	valide	2026-06-26	2026-06-26 07:35:04.123856	\N	2026-06-26 07:34:18.585342	membre	mix_by_yas
26	4	2000.00	valide	2026-06-27	2026-06-27 23:29:20.197116	\N	2026-06-27 23:28:33.297047	membre	mix_by_yas
27	4	0.00	valide	2026-06-28	2026-06-28 00:07:44.894404	\N	2026-06-28 00:07:44.894404	collecteur	\N
28	4	2000.00	valide	2026-06-29	2026-06-29 15:45:17.803885	\N	2026-06-29 15:43:32.049285	membre	mix_by_yas
29	1	2000.00	valide	2026-07-03	2026-07-03 10:40:59.019494	\N	2026-07-03 08:47:28.810968	membre	mix_by_yas
30	3	1000.00	valide	2026-07-03	2026-07-03 10:41:03.861183	\N	2026-07-03 10:41:03.861183	collecteur	\N
\.


--
-- Data for Name: demandes_inscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_inscription (id, nom_microfinance, ville, telephone, numero_agrement, nom_directeur, prenom_directeur, email_directeur, plan_choisi, statut, created_at) FROM stdin;
1	CECA	Lomé	92806802	AR-2021 123	BAWA	Abdoul-Madjid	abdoul-Madjid.bawa@ipnetinstitute.com	standard	validee	2026-06-28 20:35:59.866321
2	CECAV	Lomé	72337535	AV-2001 267	BAWA	Abdoul-Madjid	abdoulmladjidbawa3@gmail.com	premium	en_attente	2026-06-29 16:55:48.473461
\.


--
-- Data for Name: demandes_retrait; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_retrait (id, membre_id, montant, mode_paiement, statut, motif_rejet, created_at, traite_le) FROM stdin;
1	1	30000.00	moov_money	validee	\N	2026-06-28 00:00:00	2026-06-29 00:00:00
2	1	50000.00	mix_by_yas	validee	\N	2026-05-30 00:00:00	2026-05-31 00:00:00
3	1	40000.00	moov_money	validee	\N	2026-04-29 00:00:00	2026-04-30 00:00:00
4	1	25000.00	mix_by_yas	rejetee	\N	2026-03-31 00:00:00	2026-04-01 00:00:00
\.


--
-- Data for Name: engagements_mensuels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.engagements_mensuels (id, membre_id, mois, annee, montant_journalier, created_at) FROM stdin;
1	1	6	2026	2000.00	2026-06-23 21:38:58.656283
2	2	6	2026	5000.00	2026-06-23 21:38:58.656283
3	3	6	2026	1000.00	2026-06-23 21:38:58.656283
4	4	6	2026	2000.00	2026-06-27 23:28:33.279243
5	1	7	2026	2000.00	2026-07-03 08:47:28.788198
\.


--
-- Data for Name: membres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membres (id, user_id, montant_cotisation, solde, collecteur_id, created_at, adresse, lieu_travail, ville_village, telephone, photo_url, numero_compte) FROM stdin;
2	4	5000.00	55000.00	2	2026-06-06 22:43:37.62305	\N	\N	\N	\N	\N	\N
4	17	0.00	0.00	16	2026-06-27 23:27:10.386266	\N	\N	\N	\N	\N	\N
1	3	2000.00	24000.00	2	2026-06-06 12:59:30.721044	\N	\N	\N	\N	\N	\N
3	5	1000.00	13000.00	2	2026-06-06 22:43:41.621847	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: microfinances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.microfinances (id, nom, ville, telephone, created_at, statut, plan, domaine_email) FROM stdin;
1	CECAV Fraternit‚	Lom‚	22615709	2026-06-06 12:58:43.298753	active	standard	cecav
2	CECA	Lomé	92806802	2026-06-28 20:56:11.797307	active	standard	ceca
\.


--
-- Data for Name: profils_collecteurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profils_collecteurs (id, user_id, lieu_travail_avant, date_naissance, photo_url, cv_url, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nom, prenom, email, mot_de_passe, role, microfinance_id, created_at, statut) FROM stdin;
1	Admin	CotiPay	admin@cotipay.tg	$2b$10$oOXsu1EmoBbPTIfmxbHdG.qFYsko8vTkXvrYT2aeZSzAyr5lU6y7u	admin	1	2026-06-06 12:58:56.339552	active
2	Kofri	Ali	agent@cotipay.tg	$2b$10$oOXsu1EmoBbPTIfmxbHdG.qFYsko8vTkXvrYT2aeZSzAyr5lU6y7u	collecteur	1	2026-06-06 12:59:06.96699	active
3	Dossou	Ama	membre@cotipay.tg	$2b$10$oOXsu1EmoBbPTIfmxbHdG.qFYsko8vTkXvrYT2aeZSzAyr5lU6y7u	membre	1	2026-06-06 12:59:19.661065	active
4	Mensah	Kofi	kofi@cotipay.tg	$2b$10$oOXsu1EmoBbPTIfmxbHdG.qFYsko8vTkXvrYT2aeZSzAyr5lU6y7u	membre	1	2026-06-06 22:43:26.896373	active
5	Adjoavi	Koffi	adjoavi@cotipay.tg	$2b$10$oOXsu1EmoBbPTIfmxbHdG.qFYsko8vTkXvrYT2aeZSzAyr5lU6y7u	membre	1	2026-06-06 22:43:32.168401	active
6	vjhb	lnlnlkn	lnlnlkn.vjhb@cecav.cotipay.tg	$2b$10$J2riGKRDlZYETwtFKDH2Ueh/sa8NcJ/eSqZgfv99lZAVqdViOuAha	collecteur	1	2026-06-27 22:25:35.626441	active
7	TA	ABRro	abrro.ta@cecav.cotipay.tg	$2b$10$AqhvRTujtuB0rrCm44rRcObH.NVaF0QNs/9.Zc7dKfqpQ0jGGodgG	collecteur	1	2026-06-27 22:25:55.420731	active
8	tjbkjn	kjkhoi	kjkhoi.tjbkjn@cecav.cotipay.tg	$2b$10$jH2jNfmW3puXr105e7Uat.g0rqf7O8ZBTEB88rEbWKH8LTNJnAlPq	collecteur	1	2026-06-27 22:29:40.591449	active
9	gct	jbkjkn	jbkjkn.gct@cecav.cotipay.tg	$2b$10$0iVDzSLOk40xvRB7Uxx.sewekeLO1nqHyg6tVzIuhFUmqxwPGCoFm	collecteur	1	2026-06-27 22:30:54.421802	active
10	vvhb	kjjbbh	kjjbbh.vvhb@cecav.cotipay.tg	$2b$10$SIkakLnYmRMGvlZ4w/7dMu3z2kYu6KSY59ei8DRMCCz2rftQGTC/2	collecteur	1	2026-06-27 22:36:20.414879	active
11	qdsqd	bjby	bjby.qdsqd@cecav.cotipay.tg	$2b$10$K6.Wo5bWTbXy7r4LK8kVBO/q835.PAsEA9E2NE3JH3WF28cqwPSyS	collecteur	1	2026-06-27 22:36:42.579387	active
12	hvvv	kjkjb	kjkjb.hvvv@cecav.cotipay.tg	$2b$10$5LyfPJqFc74f2eSRqSjMp.PblvfHfI7zk8.AVVOd6nGVMAEqzAjCy	collecteur	1	2026-06-27 22:39:21.53999	active
13	scgcs	jkjb	jkjb.scgcs@cecav.cotipay.tg	$2b$10$RF0Iz5WWXoYzhH49avFD2us/lnThlvNl0fkRuQDHUw8OuHu0a0PpO	collecteur	1	2026-06-27 22:46:34.907634	active
14	AB	ABRrO	abrro.ab@cecav.cotipay.tg	$2b$10$sl459zzmvPUWm0MOLeFvU.MBWlDplJXoOLH6JH94M4aRLInYFtM9W	collecteur	1	2026-06-27 23:01:22.415932	active
15	hj	UI	ui.hj@cecav.cotipay.tg	$2b$10$8Lx6gmoHh8fUsmZxuIhVfuwlGeenchEX0uyJSt9kb.KRpSSTenHbm	collecteur	1	2026-06-27 23:17:21.739044	active
16	YT	AB	ab.yt@cecav.cotipay.tg	$2b$10$rfEPtx1iBIuYtx1wHiQICuNds6BOwHyyB4AbywK3IpddNyYv94jFa	collecteur	1	2026-06-27 23:24:46.496405	active
17	pa	Aro	aro.pa@cecav.cotipay.tg	$2b$10$5GWh/FJ7SsIim36xBrUJJOq/tXB4v/rcrE8F7BZ7u4OiIIVoJcTBO	membre	1	2026-06-27 23:27:10.378482	active
18	CotiPay	SuperAdmin	superadmin@cotipay.tg	$2b$10$hqQwwxLJGhOJzTQekZYoceFI3yyX9u9eKIDKHth6pq4OS6uVj4Gfm	super_admin	\N	2026-06-28 20:48:18.026572	active
19	BAWA	Abdoul-Madjid	abdoul-madjid.bawa@ceca.cotipay.tg	$2b$10$tMwpHyU2xkqt5fmtIt5OZ.io1UTDmHji5lsa/gsmH7DWkF/v.x5LS	admin	2	2026-06-28 20:56:12.042231	active
20	ro	ab	ab.ro@cecav.cotipay.tg	$2b$10$qVvfeGHvb5k4O5IkcbTdKeZO21ykZDu0BmKRyiDFBAFjueknN/LzC	collecteur	1	2026-06-29 17:05:31.639435	active
21	nj	nkn	nkn.nj@cecav.cotipay.tg	$2b$10$SY5nc4e9fhsFm4sb6uCFRekmHuxq9BpnhjOnQa0hbcskgbK68KNfa	collecteur	1	2026-07-03 20:27:29.539637	active
\.


--
-- Name: cotisations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cotisations_id_seq', 30, true);


--
-- Name: demandes_inscription_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demandes_inscription_id_seq', 2, true);


--
-- Name: demandes_retrait_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demandes_retrait_id_seq', 4, true);


--
-- Name: engagements_mensuels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.engagements_mensuels_id_seq', 5, true);


--
-- Name: membres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.membres_id_seq', 4, true);


--
-- Name: microfinances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.microfinances_id_seq', 3, true);


--
-- Name: profils_collecteurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profils_collecteurs_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 21, true);


--
-- Name: cotisations cotisations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotisations
    ADD CONSTRAINT cotisations_pkey PRIMARY KEY (id);


--
-- Name: demandes_inscription demandes_inscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_inscription
    ADD CONSTRAINT demandes_inscription_pkey PRIMARY KEY (id);


--
-- Name: demandes_retrait demandes_retrait_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_retrait
    ADD CONSTRAINT demandes_retrait_pkey PRIMARY KEY (id);


--
-- Name: engagements_mensuels engagements_mensuels_membre_id_mois_annee_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagements_mensuels
    ADD CONSTRAINT engagements_mensuels_membre_id_mois_annee_key UNIQUE (membre_id, mois, annee);


--
-- Name: engagements_mensuels engagements_mensuels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagements_mensuels
    ADD CONSTRAINT engagements_mensuels_pkey PRIMARY KEY (id);


--
-- Name: membres membres_numero_compte_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membres
    ADD CONSTRAINT membres_numero_compte_key UNIQUE (numero_compte);


--
-- Name: membres membres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membres
    ADD CONSTRAINT membres_pkey PRIMARY KEY (id);


--
-- Name: membres membres_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membres
    ADD CONSTRAINT membres_user_id_key UNIQUE (user_id);


--
-- Name: microfinances microfinances_domaine_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.microfinances
    ADD CONSTRAINT microfinances_domaine_email_key UNIQUE (domaine_email);


--
-- Name: microfinances microfinances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.microfinances
    ADD CONSTRAINT microfinances_pkey PRIMARY KEY (id);


--
-- Name: profils_collecteurs profils_collecteurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profils_collecteurs
    ADD CONSTRAINT profils_collecteurs_pkey PRIMARY KEY (id);


--
-- Name: profils_collecteurs profils_collecteurs_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profils_collecteurs
    ADD CONSTRAINT profils_collecteurs_user_id_key UNIQUE (user_id);


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
-- Name: cotisations cotisations_collecteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotisations
    ADD CONSTRAINT cotisations_collecteur_id_fkey FOREIGN KEY (collecteur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cotisations cotisations_membre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cotisations
    ADD CONSTRAINT cotisations_membre_id_fkey FOREIGN KEY (membre_id) REFERENCES public.membres(id) ON DELETE CASCADE;


--
-- Name: demandes_retrait demandes_retrait_membre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_retrait
    ADD CONSTRAINT demandes_retrait_membre_id_fkey FOREIGN KEY (membre_id) REFERENCES public.membres(id) ON DELETE CASCADE;


--
-- Name: engagements_mensuels engagements_mensuels_membre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagements_mensuels
    ADD CONSTRAINT engagements_mensuels_membre_id_fkey FOREIGN KEY (membre_id) REFERENCES public.membres(id) ON DELETE CASCADE;


--
-- Name: membres membres_collecteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membres
    ADD CONSTRAINT membres_collecteur_id_fkey FOREIGN KEY (collecteur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: membres membres_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membres
    ADD CONSTRAINT membres_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profils_collecteurs profils_collecteurs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profils_collecteurs
    ADD CONSTRAINT profils_collecteurs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_microfinance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_microfinance_id_fkey FOREIGN KEY (microfinance_id) REFERENCES public.microfinances(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZtJVJbB7C8yJWhJhSsKs9aInjCQLIaTdPgvoyPRhC7mWU58Dbs8x5Nc7XnKuZXT

