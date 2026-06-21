// server.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config({ override: true });

const { testConnection } = await import('./src/config/db.js');
const { default: authRoutes } = await import('./src/routes/auth.routes.js');
const { default: emailRoutes } = await import('./src/routes/email.routes.js');
const { default: poemRoutes } = await import('./src/routes/poem.routes.js');
const { default: adminRoutes } = await import('./src/routes/admin.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;
// Connexion BDD
testConnection();
// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
// Logger (dev)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
        next();
    });
}
// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Starter Kit API (ES Modules)', status: 'online' });
});
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/poems', poemRoutes);
app.use('/api/admin', adminRoutes);
// 404
app.use((req, res) => res.status(404).json({ error: 'Route non trouvée' }));
// Démarrage
app.listen(PORT, () => {
    console.log(`Serveur sur http://localhost:${PORT}`);
});