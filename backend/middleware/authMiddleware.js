const jwt = require('jsonwebtoken');
const pool = require('../db');
const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userCheck = await pool.query('SELECT statut FROM users WHERE id = $1',
      [decoded.id]);
    if (userCheck.rows.length === 0 || userCheck.rows[0].statut !== 'active') {
      return res.status(403).json({
        message: 'Compte en attente de validation par votre micro- finance'
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};
module.exports = verifyToken;