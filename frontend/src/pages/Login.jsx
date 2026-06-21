import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Connexion impossible');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-xl px-4 py-14 text-amber-50 md:px-6">
            <div className="rounded-2xl border border-amber-100/20 bg-stone-950/75 p-6">
                <h1 className="mb-5 text-4xl">Connexion</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        required
                    />
                    {error && <p className="text-sm text-rose-300">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-amber-200 px-4 py-2 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-70"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <p className="mt-4 text-sm text-amber-100/75">
                    Pas encore inscrit ? <Link to="/register" className="underline">Creer un compte</Link>
                </p>
            </div>
        </section>
    );
}

export default Login;
