import { query } from '../config/db.js';

const toPoemResponse = (poem) => ({
    ...poem,
    likesCount: Number(poem.likesCount || 0),
    commentsCount: Number(poem.commentsCount || 0)
});

export const listPublishedPoems = async (req, res) => {
    try {
        const sql = `
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id AS authorId,
    p.created_at AS createdAt,
    CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.lastname, '')) AS authorName,
    u.email AS authorEmail,
    COALESCE(l.likesCount, 0) AS likesCount,
    COALESCE(c.commentsCount, 0) AS commentsCount
FROM poems p
JOIN users u ON u.id = p.author_id
LEFT JOIN (
    SELECT poem_id, COUNT(*) AS likesCount
    FROM poem_likes
    GROUP BY poem_id
) l ON l.poem_id = p.id
LEFT JOIN (
    SELECT poem_id, COUNT(*) AS commentsCount
    FROM comments
    GROUP BY poem_id
) c ON c.poem_id = p.id
WHERE p.is_published = 1
ORDER BY p.created_at DESC
`;

        const poems = await query(sql);
        res.json({ poems: poems.map(toPoemResponse) });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de charger les poemes' });
    }
};

export const createPoem = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Titre et contenu requis' });
        }

        const canCreate = req.user.role === 'admin' || req.user.canPublish;
        if (!canCreate) {
            return res.status(403).json({ error: 'Autorisation de publication requise' });
        }

        const insertSql = `
INSERT INTO poems (title, content, author_id, is_published)
VALUES (?, ?, ?, 1)
`;

        const result = await query(insertSql, [title.trim(), content.trim(), req.user.id]);

        const [poem] = await query(
            `
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id AS authorId,
    p.created_at AS createdAt,
    CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.lastname, '')) AS authorName,
    u.email AS authorEmail,
    0 AS likesCount,
    0 AS commentsCount
FROM poems p
JOIN users u ON u.id = p.author_id
WHERE p.id = ?
`,
            [result.insertId]
        );

        res.status(201).json({ poem: toPoemResponse(poem) });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de publier le poeme' });
    }
};

export const listPoemComments = async (req, res) => {
    try {
        const poemId = Number(req.params.id);

        const comments = await query(
            `
SELECT
    c.id,
    c.content,
    c.created_at AS createdAt,
    c.user_id AS userId,
    CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.lastname, '')) AS userName,
    u.email AS userEmail
FROM comments c
JOIN users u ON u.id = c.user_id
WHERE c.poem_id = ?
ORDER BY c.created_at DESC
`,
            [poemId]
        );

        res.json({ comments });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de charger les commentaires' });
    }
};

export const createComment = async (req, res) => {
    try {
        const poemId = Number(req.params.id);
        const { content } = req.body;

        if (!content || content.trim().length < 2) {
            return res.status(400).json({ error: 'Commentaire trop court' });
        }

        const poem = await query('SELECT id FROM poems WHERE id = ? AND is_published = 1', [poemId]);
        if (!poem.length) {
            return res.status(404).json({ error: 'Poeme introuvable' });
        }

        const result = await query(
            'INSERT INTO comments (poem_id, user_id, content) VALUES (?, ?, ?)',
            [poemId, req.user.id, content.trim()]
        );

        const [comment] = await query(
            `
SELECT
    c.id,
    c.content,
    c.created_at AS createdAt,
    c.user_id AS userId,
    CONCAT(COALESCE(u.firstname, ''), ' ', COALESCE(u.lastname, '')) AS userName,
    u.email AS userEmail
FROM comments c
JOIN users u ON u.id = c.user_id
WHERE c.id = ?
`,
            [result.insertId]
        );

        res.status(201).json({ comment });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de publier le commentaire' });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const poemId = Number(req.params.id);

        const poem = await query('SELECT id FROM poems WHERE id = ? AND is_published = 1', [poemId]);
        if (!poem.length) {
            return res.status(404).json({ error: 'Poeme introuvable' });
        }

        const existing = await query(
            'SELECT poem_id FROM poem_likes WHERE poem_id = ? AND user_id = ?',
            [poemId, req.user.id]
        );

        let liked = false;

        if (existing.length) {
            await query('DELETE FROM poem_likes WHERE poem_id = ? AND user_id = ?', [poemId, req.user.id]);
        } else {
            await query('INSERT INTO poem_likes (poem_id, user_id) VALUES (?, ?)', [poemId, req.user.id]);
            liked = true;
        }

        const [{ likesCount }] = await query('SELECT COUNT(*) AS likesCount FROM poem_likes WHERE poem_id = ?', [poemId]);

        res.json({ liked, likesCount: Number(likesCount) });
    } catch (error) {
        res.status(500).json({ error: 'Impossible de gerer le like' });
    }
};

export const deletePoem = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acces admin requis' });
        }

        const poemId = Number(req.params.id);

        const poem = await query('SELECT id FROM poems WHERE id = ?', [poemId]);
        if (!poem.length) {
            return res.status(404).json({ error: 'Poeme introuvable' });
        }

        await query('DELETE FROM poems WHERE id = ?', [poemId]);

        return res.json({ message: 'Poeme supprime' });
    } catch (error) {
        return res.status(500).json({ error: 'Impossible de supprimer le poeme' });
    }
};
