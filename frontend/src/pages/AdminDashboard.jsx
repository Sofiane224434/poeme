import { useEffect, useState } from 'react';
import { adminService } from '../services/api.js';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        try {
            const data = await adminService.listUsers();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message || 'Impossible de charger les utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const togglePublish = async (user) => {
        try {
            const data = await adminService.updateUser(user.id, { canPublish: !user.canPublish });
            setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...data.user } : item)));
        } catch (err) {
            alert(err.message || 'Mise a jour impossible');
        }
    };

    return (
        <section className="mx-auto max-w-6xl px-4 py-14 text-amber-50 md:px-6">
            <h1 className="mb-6 text-4xl">Dashboard admin</h1>
            {loading && <p>Chargement...</p>}
            {error && <p className="text-sm text-rose-300">{error}</p>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-2xl border border-amber-100/20 bg-stone-950/75">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-amber-100/20 bg-stone-900/70 text-amber-200">
                            <tr>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Nom</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Publication</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-amber-100/10">
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">{`${user.firstname || ''} ${user.lastname || ''}`.trim() || '-'}</td>
                                    <td className="px-4 py-3">{user.role}</td>
                                    <td className="px-4 py-3">{user.canPublish ? 'Oui' : 'Non'}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => togglePublish(user)}
                                            className="rounded-lg border border-amber-100/40 px-3 py-1.5 transition hover:border-amber-200"
                                        >
                                            {user.canPublish ? 'Retirer' : 'Autoriser'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default AdminDashboard;
