const pool = require('../db');
async function genererNumeroCompte(microfinanceId) {
    const mf = await pool.query('SELECT domaine_email FROM microfinances WHERE id = $1', [microfinanceId]);
    const prefixe = mf.rows[0].domaine_email.toUpperCase();
    const count = await pool.query(` 
SELECT COUNT(*) FROM membres m 
JOIN users u ON m.user_id = u.id 
WHERE u.microfinance_id = $1 
`, [microfinanceId]);
    const numero = (parseInt(count.rows[0].count) + 1).toString().padStart(4, '0');
    return `${prefixe}-${numero}`;
}
module.exports = { genererNumeroCompte };