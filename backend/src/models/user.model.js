// models/user.model.js
import { query } from '../config/db.js'; // Extension .js obligatoire ! ⬅️
import bcrypt from 'bcrypt';
const User = {
    // Trouver par email
    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email.toLowerCase()]);
        return results[0] || null;
    },
    // Trouver par ID (sans le password)
    async findById(id) {
        const sql = `
SELECT id, email, firstname, lastname, role, can_publish AS canPublish, created_at
FROM users
WHERE id = ?
`;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    async listAll() {
        const sql = `
SELECT id, email, firstname, lastname, role, can_publish AS canPublish, created_at
FROM users
ORDER BY created_at DESC
`;
        return query(sql);
    },

    async setPublishPermission(id, canPublish) {
        const sql = 'UPDATE users SET can_publish = ? WHERE id = ?';
        await query(sql, [canPublish ? 1 : 0, id]);
        return this.findById(id);
    },

    async setRole(id, role) {
        const sql = 'UPDATE users SET role = ? WHERE id = ?';
        await query(sql, [role, id]);
        return this.findById(id);
    },

    // Créer un utilisateur
    async create({ email, password, firstname = null, lastname = null }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
INSERT INTO users (email, password, firstname, lastname, role, can_publish)
VALUES (?, ?, ?, ?, 'user', 0)
`;
        const result = await query(sql, [
            email.toLowerCase(),
            hashedPassword,
            firstname,
            lastname
        ]);
        return this.findById(result.insertId);
    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
export default User;