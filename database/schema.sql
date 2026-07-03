CREATE TABLE microfinances (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    ville VARCHAR(50) NOT NULL,
    telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (
        role IN (
            'admin',
            'collecteur',
            'membre',
            'super_admin'
        )
    ) NOT NULL,
    microfinance_id INTEGER REFERENCES microfinances (id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE membres (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    montant_cotisation NUMERIC(10, 2) DEFAULT 0,
    solde NUMERIC(10, 2) DEFAULT 0,
    collecteur_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cotisations (
    id SERIAL PRIMARY KEY,
    membre_id INTEGER REFERENCES membres (id) ON DELETE CASCADE,
    montant NUMERIC(10, 2) NOT NULL,
    statut VARCHAR(20) CHECK (
        statut IN ('attente', 'valide')
    ) DEFAULT 'attente',
    date_cotisation DATE DEFAULT CURRENT_DATE,
    heure_validation TIMESTAMP,
    collecteur_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cotisations
ADD COLUMN initiee_par VARCHAR(20) DEFAULT 'collecteur' CHECK (
    initiee_par IN ('collecteur', 'membre')
);

ALTER TABLE cotisations
ADD COLUMN mode_paiement VARCHAR(30) CHECK (
    mode_paiement IN ('mix_by_yas', 'moov_money')
);

CREATE TABLE engagements_mensuels (
    id SERIAL PRIMARY KEY,
    membre_id INTEGER REFERENCES membres (id) ON DELETE CASCADE,
    mois INTEGER NOT NULL,
    annee INTEGER NOT NULL,
    montant_journalier NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (membre_id, mois, annee)
);

CREATE TABLE demandes_retrait (
    id SERIAL PRIMARY KEY,
    membre_id INTEGER REFERENCES membres (id) ON DELETE CASCADE,
    montant NUMERIC(10, 2) NOT NULL,
    mode_paiement VARCHAR(30) CHECK (
        mode_paiement IN ('mix_by_yas', 'moov_money')
    ),
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (
        statut IN (
            'en_attente',
            'validee',
            'rejetee'
        )
    ),
    motif_rejet TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    traite_le TIMESTAMP
);

ALTER TABLE microfinances
ADD COLUMN statut VARCHAR(20) DEFAULT 'en_attente' CHECK (
    statut IN (
        'en_attente',
        'active',
        'rejetee'
    )
);

ALTER TABLE microfinances
ADD COLUMN plan VARCHAR(20) CHECK (
    plan IN (
        'starter',
        'standard',
        'premium'
    )
);

ALTER TABLE microfinances
ADD COLUMN domaine_email VARCHAR(50) UNIQUE;

CREATE TABLE demandes_inscription (
    id SERIAL PRIMARY KEY,
    nom_microfinance VARCHAR(100) NOT NULL,
    ville VARCHAR(50) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    numero_agrement VARCHAR(50),
    nom_directeur VARCHAR(50) NOT NULL,
    prenom_directeur VARCHAR(50) NOT NULL,
    email_directeur VARCHAR(100) NOT NULL,
    plan_choisi VARCHAR(20) CHECK (
        plan_choisi IN (
            'starter',
            'standard',
            'premium'
        )
    ),
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (
        statut IN (
            'en_attente',
            'validee',
            'rejetee'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN statut VARCHAR(20) DEFAULT 'active' CHECK (
    statut IN (
        'en_attente',
        'active',
        'rejete'
    )
);

ALTER TABLE membres ADD COLUMN adresse VARCHAR(150);

ALTER TABLE membres ADD COLUMN lieu_travail VARCHAR(100);

ALTER TABLE membres ADD COLUMN ville_village VARCHAR(50);

ALTER TABLE membres ADD COLUMN telephone VARCHAR(20);

ALTER TABLE membres ADD COLUMN photo_url VARCHAR(255);

ALTER TABLE membres ADD COLUMN numero_compte VARCHAR(30) UNIQUE;

CREATE TABLE profils_collecteurs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    lieu_travail_avant VARCHAR(100),
    date_naissance DATE,
    photo_url VARCHAR(255),
    cv_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);