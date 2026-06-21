// components/Header.jsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
];

function Header() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'fr').slice(0, 2);

    const handleLanguageChange = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <header className="sticky top-0 z-20 border-b border-amber-100/15 bg-stone-950/85 text-amber-50 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
                <Link to="/" className="text-3xl tracking-wide" aria-label={t('nav.home')}>
                    {t('site.title')}
                </Link>

                <nav className="flex items-center gap-4 text-sm font-medium tracking-wide md:gap-6">
                    <a href="#collection" className="text-amber-100/80 transition hover:text-amber-300">{t('nav.collection')}</a>
                    <a href="#manifest" className="text-amber-100/80 transition hover:text-amber-300">{t('nav.manifest')}</a>
                    {user && (
                        <Link to="/dashboard" className="text-amber-100/80 transition hover:text-amber-300">
                            Dashboard
                        </Link>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="text-amber-100/80 transition hover:text-amber-300">
                            Admin
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {!user && (
                        <>
                            <Link to="/login" className="rounded-full border border-amber-100/30 px-3 py-1.5 text-sm transition hover:border-amber-200 hover:text-amber-300">
                                Connexion
                            </Link>
                            <Link to="/register" className="rounded-full bg-amber-200 px-3 py-1.5 text-sm font-semibold text-stone-900 transition hover:bg-amber-300">
                                Inscription
                            </Link>
                        </>
                    )}

                    {user && (
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-full border border-amber-100/30 px-3 py-1.5 text-sm transition hover:border-amber-200 hover:text-amber-300"
                        >
                            Deconnexion
                        </button>
                    )}

                    <select
                        value={currentLanguage}
                        onChange={handleLanguageChange}
                        className="rounded-full border border-amber-100/40 bg-stone-900/60 px-3 py-1.5 text-sm text-amber-100 outline-none transition hover:border-amber-100/70"
                        title="Changer de langue"
                    >
                        {languages.map((language) => (
                            <option key={language.code} value={language.code} className="text-black">
                                {language.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </header>
    );
}
export default Header;