import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { poemService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function Home() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [apiLoaded, setApiLoaded] = useState(false);
    const [commentsByPoem, setCommentsByPoem] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const fallbackPoems = t('poems.items', { returnObjects: true });

    const displayedPoems = useMemo(() => {
        if (poems.length || apiLoaded) {
            return poems;
        }

        return fallbackPoems.map((item, index) => ({
            id: `fallback-${index}`,
            title: item.title,
            content: item.lines.join('\n'),
            theme: item.theme,
            likesCount: 0,
            commentsCount: 0,
            authorName: 'Auteur',
            createdAt: new Date().toISOString()
        }));
    }, [poems, fallbackPoems]);

    useEffect(() => {
        const loadPoems = async () => {
            try {
                const data = await poemService.list();
                setPoems(data.poems || []);
                setApiLoaded(true);
            } catch (err) {
                setError(err.message || 'Impossible de charger les poemes');
            } finally {
                setLoading(false);
            }
        };

        loadPoems();
    }, []);

    const loadComments = async (poemId) => {
        if (String(poemId).startsWith('fallback-')) {
            return;
        }

        if (commentsByPoem[poemId]) {
            setCommentsByPoem((prev) => ({ ...prev, [poemId]: null }));
            return;
        }

        try {
            const data = await poemService.getComments(poemId);
            setCommentsByPoem((prev) => ({ ...prev, [poemId]: data.comments || [] }));
        } catch {
            setCommentsByPoem((prev) => ({ ...prev, [poemId]: [] }));
        }
    };

    const toggleLike = async (poemId) => {
        if (!user) {
            alert('Inscris-toi ou connecte-toi pour liker');
            return;
        }

        if (String(poemId).startsWith('fallback-')) {
            return;
        }

        try {
            const data = await poemService.toggleLike(poemId);
            setPoems((prev) =>
                prev.map((poem) => (poem.id === poemId ? { ...poem, likesCount: data.likesCount } : poem))
            );
        } catch {
            alert('Like impossible pour le moment');
        }
    };

    const addComment = async (poemId) => {
        if (!user) {
            alert('Inscris-toi ou connecte-toi pour commenter');
            return;
        }

        if (String(poemId).startsWith('fallback-')) {
            return;
        }

        const value = (commentInputs[poemId] || '').trim();
        if (value.length < 2) {
            return;
        }

        try {
            const data = await poemService.addComment(poemId, value);
            setCommentInputs((prev) => ({ ...prev, [poemId]: '' }));
            setCommentsByPoem((prev) => ({
                ...prev,
                [poemId]: [data.comment, ...(prev[poemId] || [])]
            }));
            setPoems((prev) =>
                prev.map((poem) =>
                    poem.id === poemId
                        ? { ...poem, commentsCount: Number(poem.commentsCount || 0) + 1 }
                        : poem
                )
            );
        } catch {
            alert('Commentaire impossible pour le moment');
        }
    };

    const deletePoem = async (poemId) => {
        if (user?.role !== 'admin') {
            return;
        }

        const confirmed = window.confirm('Supprimer ce poeme ?');
        if (!confirmed) {
            return;
        }

        try {
            await poemService.remove(poemId);
            setPoems((prev) => prev.filter((poem) => poem.id !== poemId));
            setCommentsByPoem((prev) => {
                const next = { ...prev };
                delete next[poemId];
                return next;
            });
            setCommentInputs((prev) => {
                const next = { ...prev };
                delete next[poemId];
                return next;
            });
        } catch (err) {
            alert(err.message || 'Suppression impossible');
        }
    };

    return (
        <div className="text-stone-100">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.14),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(244,63,94,0.14),transparent_28%),linear-gradient(120deg,#110f19_0%,#1f1730_45%,#2d1831_100%)]" />

            <section id="hero" className="mx-auto flex min-h-[46vh] w-full max-w-6xl flex-col justify-center px-4 pb-8 pt-14 md:px-6 md:pt-16">
                <p className="mb-5 text-xs uppercase tracking-[0.35em] text-amber-100/70">{t('home.kicker')}</p>
                <h1 className="mb-5 max-w-4xl text-5xl leading-tight md:text-7xl">{t('home.title')}</h1>
                <p className="max-w-2xl text-lg leading-relaxed text-amber-50/85 md:text-xl">{t('home.subtitle')}</p>
                {!user && (
                    <p className="mt-6 rounded-xl border border-amber-100/20 bg-stone-900/50 px-4 py-3 text-sm text-amber-100/80">
                        Cree un compte pour liker et commenter. Un admin peut ensuite t'autoriser a publier.
                    </p>
                )}
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-6" id="collection">
                <h2 className="mb-4 text-3xl md:text-4xl">{t('home.featured')}</h2>
                {loading && <p className="text-amber-100/70">Chargement des poemes...</p>}
                {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}
                {!loading && !error && apiLoaded && displayedPoems.length === 0 && (
                    <p className="mb-4 text-sm text-amber-100/75">
                        Aucun poeme publie pour le moment. Utilise le dashboard auteur pour publier le premier.
                    </p>
                )}

                <div className="grid gap-5">
                    {displayedPoems.map((poem, poemIndex) => {
                        const comments = commentsByPoem[poem.id];

                        return (
                            <article
                                className={`rounded-2xl border px-5 py-5 shadow-xl ${
                                    poemIndex === 0
                                        ? 'border-amber-300/50 bg-linear-to-br from-rose-900/60 to-stone-950/80'
                                        : 'border-amber-100/20 bg-stone-950/70'
                                }`}
                                key={poem.id}
                            >
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs uppercase tracking-[0.28em] text-amber-200/70">{poem.theme || 'Poeme'}</p>
                                    <p className="text-xs text-amber-100/65">
                                        {new Date(poem.createdAt).toLocaleDateString()} - {poem.authorName || poem.authorEmail}
                                    </p>
                                </div>

                                <h3 className="mb-3 text-3xl">{poem.title}</h3>
                                <div className="space-y-1 whitespace-pre-wrap text-base text-amber-50/90">{poem.content}</div>

                                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                                    <button
                                        type="button"
                                        onClick={() => toggleLike(poem.id)}
                                        className="rounded-full border border-amber-100/30 px-3 py-1.5 transition hover:border-amber-200"
                                    >
                                        Like ({poem.likesCount || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => loadComments(poem.id)}
                                        className="rounded-full border border-amber-100/30 px-3 py-1.5 transition hover:border-amber-200"
                                    >
                                        Commentaires ({poem.commentsCount || 0})
                                    </button>
                                    {user?.role === 'admin' && !String(poem.id).startsWith('fallback-') && (
                                        <button
                                            type="button"
                                            onClick={() => deletePoem(poem.id)}
                                            className="rounded-full border border-rose-300/60 px-3 py-1.5 text-rose-200 transition hover:bg-rose-900/40"
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>

                                {comments && (
                                    <div className="mt-4 rounded-xl border border-amber-100/15 bg-stone-900/70 p-3">
                                        {user && (
                                            <div className="mb-3 flex gap-2">
                                                <input
                                                    value={commentInputs[poem.id] || ''}
                                                    onChange={(event) =>
                                                        setCommentInputs((prev) => ({ ...prev, [poem.id]: event.target.value }))
                                                    }
                                                    placeholder="Ajouter un commentaire"
                                                    className="w-full rounded-lg border border-amber-100/30 bg-stone-950 px-3 py-2 text-sm outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => addComment(poem.id)}
                                                    className="rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-stone-950"
                                                >
                                                    Envoyer
                                                </button>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {comments.length === 0 && <p className="text-sm text-amber-100/65">Aucun commentaire.</p>}
                                            {comments.map((comment) => (
                                                <div key={comment.id} className="rounded-lg border border-amber-100/15 px-3 py-2 text-sm">
                                                    <p className="mb-1 text-amber-200/80">{comment.userName || comment.userEmail}</p>
                                                    <p className="text-amber-50/90">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>

            <section id="manifest" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-6">
                <div className="rounded-2xl border border-dashed border-amber-200/50 bg-stone-950/55 p-6">
                    <h2 className="mb-3 text-2xl md:text-3xl">{t('home.manifestTitle')}</h2>
                    <p className="max-w-3xl leading-relaxed text-amber-50/85">{t('home.manifestText')}</p>
                </div>
            </section>
        </div>
    );
}

export default Home;