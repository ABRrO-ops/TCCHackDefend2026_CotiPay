const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const { genererEmailInterne } = require('../utils/genererEmail');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé - Admin uniquement' });
  }
  next();
};

// GET /api/admin/export/cotisations
router.get('/export/cotisations', verifyToken, isAdmin, async (req, res) => {
  try {
    const { debut, fin } = req.query;
    const result = await pool.query(`
      SELECT u.nom, u.prenom, c.montant, c.statut, c.mode_paiement, c.date_cotisation, c.heure_validation
      FROM cotisations c
      JOIN membres m ON m.id = c.membre_id
      JOIN users u ON u.id = m.user_id
      WHERE c.date_cotisation BETWEEN $1 AND $2
      ORDER BY c.date_cotisation
    `, [debut, fin]);

    const csvWriter = createCsvWriter({
      header: [
        { id: 'nom', title: 'Nom' },
        { id: 'prenom', title: 'Prénom' },
        { id: 'montant', title: 'Montant' },
        { id: 'statut', title: 'Statut' },
        { id: 'mode_paiement', title: 'Mode de paiement' },
        { id: 'date_cotisation', title: 'Date' },
      ]
    });

    const csvHeader = csvWriter.getHeaderString();
    const csvBody = csvWriter.stringifyRecords(result.rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=export_cotisations.csv');
    res.send(csvHeader + csvBody);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalMembres = await pool.query('SELECT COUNT(*) FROM membres');
    const cotisationsAujourdhui = await pool.query(`
      SELECT COUNT(*) FROM cotisations
      WHERE DATE(date_cotisation) = CURRENT_DATE AND statut = 'valide'
    `);
    const totalCollecte = await pool.query(`
      SELECT COALESCE(SUM(montant), 0) as total
      FROM cotisations
      WHERE DATE(date_cotisation) = CURRENT_DATE AND statut = 'valide'
    `);
    res.json({
      totalMembres: parseInt(totalMembres.rows[0].count),
      cotisationsAujourdhui: parseInt(cotisationsAujourdhui.rows[0].count),
      totalCollecte: parseFloat(totalCollecte.rows[0].total)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/cotisations/today
router.get('/cotisations/today', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.nom, u.prenom, c.montant, c.statut, c.heure_validation
      FROM cotisations c
      JOIN membres m ON m.id = c.membre_id
      JOIN users u ON u.id = m.user_id
      WHERE DATE(c.date_cotisation) = CURRENT_DATE
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/collecteurs
router.post('/collecteurs', verifyToken, isAdmin, async (req, res) => {
  try {
    const { nom, prenom } = req.body;
    const adminId = req.user.id;
    const adminInfo = await pool.query('SELECT microfinance_id FROM users WHERE id = $1', [adminId]);
    const microfinanceId = adminInfo.rows[0].microfinance_id;
    const mf = await pool.query('SELECT domaine_email FROM microfinances WHERE id = $1', [microfinanceId]);
    const domaineEmail = mf.rows[0].domaine_email;
    const email = await genererEmailInterne(prenom, nom, domaineEmail);
    const motDePasseTemp = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(motDePasseTemp, 10);
    await pool.query(`
      INSERT INTO users (nom, prenom, email, mot_de_passe, role, microfinance_id)
      VALUES ($1, $2, $3, $4, 'collecteur', $5)
    `, [nom, prenom, email, hash, microfinanceId]);
    res.json({ message: 'Collecteur créé', email, motDePasseTemp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/membres
router.post('/membres', verifyToken, isAdmin, async (req, res) => {
  try {
    const { nom, prenom, collecteur_id } = req.body;
    const adminId = req.user.id;
    const adminInfo = await pool.query('SELECT microfinance_id FROM users WHERE id = $1', [adminId]);
    const microfinanceId = adminInfo.rows[0].microfinance_id;
    const mf = await pool.query('SELECT domaine_email FROM microfinances WHERE id = $1', [microfinanceId]);
    const domaineEmail = mf.rows[0].domaine_email;
    const email = await genererEmailInterne(prenom, nom, domaineEmail);
    const motDePasseTemp = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(motDePasseTemp, 10);
    const newUser = await pool.query(`
      INSERT INTO users (nom, prenom, email, mot_de_passe, role, microfinance_id)
      VALUES ($1, $2, $3, $4, 'membre', $5)
      RETURNING id
    `, [nom, prenom, email, hash, microfinanceId]);
    await pool.query(`
      INSERT INTO membres (user_id, solde, collecteur_id)
      VALUES ($1, 0, $2)
    `, [newUser.rows[0].id, collecteur_id]);
    res.json({ message: 'Membre créé', email, motDePasseTemp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/collecteurs
router.get('/collecteurs', verifyToken, isAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const adminInfo = await pool.query('SELECT microfinance_id FROM users WHERE id = $1', [adminId]);
    const microfinanceId = adminInfo.rows[0].microfinance_id;
    const result = await pool.query(`
      SELECT id, nom, prenom FROM users
      WHERE role = 'collecteur' AND microfinance_id = $1
      ORDER BY nom
    `, [microfinanceId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/retraits/valider/:id
router.post('/retraits/valider/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const demande = await pool.query('SELECT membre_id, montant FROM demandes_retrait WHERE id = $1', [id]);
    if (demande.rows.length === 0) {
      return res.status(404).json({ error: 'Demande introuvable' });
    }
    const { membre_id, montant } = demande.rows[0];
    await pool.query(`UPDATE demandes_retrait SET statut = 'validee', traite_le = NOW() WHERE id = $1`, [id]);
    await pool.query(`UPDATE membres SET solde = solde - $1 WHERE id = $2`, [montant, membre_id]);
    res.json({ message: 'Retrait validé et solde mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/retraits/rejeter/:id
router.post('/retraits/rejeter/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;
    await pool.query(`UPDATE demandes_retrait SET statut = 'rejetee', motif_rejet = $1, traite_le = NOW() WHERE id = $2`, [motif, id]);
    res.json({ message: 'Retrait rejeté' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/retraits/en-attente
router.get('/retraits/en-attente', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dr.id, dr.montant, dr.mode_paiement, dr.created_at, u.nom, u.prenom
      FROM demandes_retrait dr
      JOIN membres m ON m.id = dr.membre_id
      JOIN users u ON u.id = m.user_id
      WHERE dr.statut = 'en_attente'
      ORDER BY dr.created_at ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;