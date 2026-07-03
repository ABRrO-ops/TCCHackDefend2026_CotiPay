const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const verifyToken = require('../middleware/authMiddleware');
const { genererEmailInterne } = require('../utils/genererEmail');
const { genererNumeroCompte } = require('../utils/genererNumeroCompte');
// GET /api/selfservice/microfinances (liste publique pour recherche) 
router.get('/microfinances', async (req, res) => {
    try {
        const result = await pool.query(` 
SELECT id, nom, ville FROM microfinances WHERE statut = 'active' ORDER BY nom 
`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// POST /api/selfservice/inscription-membre (PUBLIQUE) 
router.post('/inscription-membre', upload.single('photo'), async (req, res) => {
    try {
        const { microfinance_id, nom, prenom, adresse, lieu_travail, ville_village, telephone,
            montant_choisi } = req.body;
        const photoUrl = req.file ? `/uploads/photos/${req.file.filename}` : null;
        const mf = await pool.query('SELECT domaine_email FROM microfinances WHERE id = $1', [microfinance_id]);
        if (mf.rows.length === 0) {
            return res.status(404).json({ error: 'Micro-finance introuvable' });
        }
        const domaineEmail = mf.rows[0].domaine_email;
        const email = await genererEmailInterne(prenom, nom, domaineEmail);
        const motDePasseTemp = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(motDePasseTemp, 10);
        const newUser = await pool.query(` 
INSERT INTO users (nom, prenom, email, mot_de_passe, role, microfinance_id, 
statut) 
VALUES ($1, $2, $3, $4, 'membre', $5, 'en_attente') 
RETURNING id 
`, [nom, prenom, email, hash, microfinance_id]);
        const numeroCompte = await genererNumeroCompte(microfinance_id);
        await pool.query(` 
INSERT INTO membres (user_id, adresse, lieu_travail, ville_village, telephone, 
photo_url, numero_compte, solde) 
VALUES ($1, $2, $3, $4, $5, $6, $7, 0) 
`, [newUser.rows[0].id, adresse, lieu_travail, ville_village, telephone, photoUrl,
            numeroCompte]);
        res.json({
            message: 'Inscription enregistrée, en attente de validation par votre micro-finance',
            email,
            motDePasseTemp,
            numeroCompte
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// POST /api/selfservice/inscription-collecteur (PUBLIQUE) 
router.post('/inscription-collecteur', upload.fields([{ name: 'photo', maxCount: 1 }, {
    name: 'cv', maxCount: 1
}]), async (req, res) => {
    try {
        const { microfinance_id, nom, prenom, lieu_travail_avant, date_naissance } =
            req.body;
        const photoUrl = req.files?.photo ? `/uploads/photos/${req.files.photo[0].filename}` :
            null;
        const cvUrl = req.files?.cv ? `/uploads/cv/${req.files.cv[0].filename}` : null;
        const mf = await pool.query('SELECT domaine_email FROM microfinances WHERE id = $1', [microfinance_id]);
        if (mf.rows.length === 0) {
            return res.status(404).json({ error: 'Micro-finance introuvable' });
        }
        const domaineEmail = mf.rows[0].domaine_email;
        const email = await genererEmailInterne(prenom, nom, domaineEmail);
        const motDePasseTemp = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(motDePasseTemp, 10);

        const newUser = await pool.query(` 
      INSERT INTO users (nom, prenom, email, mot_de_passe, role, microfinance_id, 
statut) 
      VALUES ($1, $2, $3, $4, 'collecteur', $5, 'en_attente') 
      RETURNING id 
    `, [nom, prenom, email, hash, microfinance_id]);

        await pool.query(` 
      INSERT INTO profils_collecteurs (user_id, lieu_travail_avant, date_naissance, 
photo_url, cv_url) 
      VALUES ($1, $2, $3, $4, $5) 
    `, [newUser.rows[0].id, lieu_travail_avant, date_naissance, photoUrl, cvUrl]);

        res.json({
            message: 'Inscription enregistrée, en attente de validation par votre micro-finance',
            email,
            motDePasseTemp
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/selfservice/inscriptions-attente (cote admin) 
router.get('/inscriptions-attente', verifyToken, async (req, res) => {
    try {
        const adminId = req.user.id;
        const adminInfo = await pool.query('SELECT microfinance_id FROM users WHERE id = $1', [adminId]);
        const microfinanceId = adminInfo.rows[0].microfinance_id;
        const membres = await pool.query(` 
SELECT u.id, u.nom, u.prenom, u.email, m.adresse, m.lieu_travail, m.ville_village, 
m.telephone, m.photo_url, m.numero_compte, u.created_at 
FROM users u 
JOIN membres m ON m.user_id = u.id 
WHERE u.role = 'membre' AND u.statut = 'en_attente' AND u.microfinance_id = $1 
`, [microfinanceId]);
        const collecteurs = await pool.query(` 
SELECT u.id, u.nom, u.prenom, u.email, pc.lieu_travail_avant, pc.date_naissance, 
pc.photo_url, pc.cv_url, u.created_at 
FROM users u 
JOIN profils_collecteurs pc ON pc.user_id = u.id 
WHERE u.role = 'collecteur' AND u.statut = 'en_attente' AND u.microfinance_id = $1 
`, [microfinanceId]);
        res.json({ membres: membres.rows, collecteurs: collecteurs.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// POST /api/selfservice/valider-membre/:id (necessite assignation collecteur) 
router.post('/valider-membre/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { collecteur_id } = req.body;
        if (!collecteur_id) {
            return res.status(400).json({ error: 'Vous devez assigner un collecteur' });
        }
        await pool.query(`UPDATE users SET statut = 'active' WHERE id = $1`, [id]);
        await pool.query(`UPDATE membres SET collecteur_id = $1 WHERE user_id = $2`,
            [collecteur_id, id]);
        res.json({ message: 'Membre validé et assigné' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// POST /api/selfservice/valider-collecteur/:id 
router.post('/valider-collecteur/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`UPDATE users SET statut = 'active' WHERE id = $1`, [id]);
        res.json({ message: 'Collecteur validé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// POST /api/selfservice/rejeter/:id 
router.post('/rejeter/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(`UPDATE users SET statut = 'rejete' WHERE id = $1`, [id]);
        res.json({ message: 'Demande rejetée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
module.exports = router; 