// layouts/AuthLayout.jsx
import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_18%_20%,rgba(251,191,36,0.14),transparent_34%),linear-gradient(120deg,#110f19_0%,#1f1730_45%,#2d1831_100%)] text-amber-50">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6">
                <Link to="/" className="text-sm text-amber-100/90 transition hover:text-amber-300">
                    ← Retour a l'accueil
                </Link>
            </div>
            <Outlet />
        </div>
    );
}

export default AuthLayout;