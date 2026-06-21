import { useState } from 'react';
import { poemService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function Dashboard() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const canPublish = user?.role === 'admin' || user?.canPublish;

    const onSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await poemService.create({ title, content });
            setMessage('Poeme publie avec succes');
            setTitle('');
            setContent('');
        } catch (err) {
            setError(err.message || 'Publication impossible');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-4xl px-4 py-14 text-amber-50 md:px-6">
            <h1 className="mb-2 text-4xl">Dashboard auteur</h1>
            <p className="mb-6 text-amber-100/80">
                Role: <span className="font-semibold">{user?.role || 'user'}</span> - Autorise a publier:{' '}
                <span className="font-semibold">{canPublish ? 'Oui' : 'Non'}</span>
            </p>

            {!canPublish && (
                <div className="rounded-xl border border-amber-100/20 bg-stone-950/70 p-4 text-sm text-amber-100/85">
                    Tu peux liker et commenter, mais seul un admin peut te donner l'autorisation de publier.
                </div>
            )}

            {canPublish && (
                <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-amber-100/20 bg-stone-950/75 p-6">
                    <h2 className="text-3xl">Publier un poeme</h2>
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Titre"
                        className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        required
                    />
                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Texte du poeme"
                        rows={8}
                        className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        required
                    />
                    {message && <p className="text-sm text-emerald-300">{message}</p>}
                    {error && <p className="text-sm text-rose-300">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-amber-200 px-4 py-2 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-70"
                    >
                        {loading ? 'Publication...' : 'Publier'}
                    </button>
                </form>
            )}
        </section>
    );
}

export default Dashboard;
