import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(form);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Inscription impossible');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-xl px-4 py-14 text-amber-50 md:px-6">
            <div className="rounded-2xl border border-amber-100/20 bg-stone-950/75 p-6">
                <h1 className="mb-5 text-4xl">Inscription</h1>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Prenom"
                            value={form.firstname}
                            onChange={(event) => onChange('firstname', event.target.value)}
                            className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            value={form.lastname}
                            onChange={(event) => onChange('lastname', event.target.value)}
                            className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(event) => onChange('email', event.target.value)}
                        className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={(event) => onChange('password', event.target.value)}
                        className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 outline-none"
                        required
                    />
                    {error && <p className="text-sm text-rose-300">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-amber-200 px-4 py-2 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:opacity-70"
                    >
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>
                </form>
                <p className="mt-4 text-sm text-amber-100/75">
                    Deja un compte ? <Link to="/login" className="underline">Se connecter</Link>
                </p>
            </div>
        </section>
    );
}

export default Register;
