import User from '../models/user.model.js';

export const listUsers = async (req, res) => {
    try {
        const users = await User.listAll();
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de charger les utilisateurs' });
    }
};

export const updateUserPublishing = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { canPublish, role } = req.body;

        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role invalide' });
        }

        if (role) {
            await User.setRole(userId, role);
        }

        if (typeof canPublish === 'boolean') {
            await User.setPublishPermission(userId, canPublish);
        }

        const updatedUser = await User.findById(userId);

        if (!updatedUser) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        res.json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de mettre a jour cet utilisateur' });
    }
};
