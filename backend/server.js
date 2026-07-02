require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const cotisationsRoutes = require('./routes/cotisations');
const adminRoutes = require('./routes/admin');
const membresRoutes = require('./routes/membres');
const inscriptionRoutes = require('./routes/inscription');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', require('express').static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/membres', membresRoutes);
app.use('/api/cotisations', cotisationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inscription', inscriptionRoutes);

app.get('/', (req, res) => {
  res.send('CotiPay API fonctionne ✅');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});