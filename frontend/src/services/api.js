// services/api.js
const API_URL = 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
	const token = localStorage.getItem('token');
	const headers = {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
		...(options.headers || {})
	};

	try {
		const response = await fetch(`${API_URL}${endpoint}`, {
			...options,
			headers
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			throw { status: response.status, message: data.error || 'Erreur' };
		}

		return data;
	} catch (error) {
		if (!error.status) {
			throw { status: 0, message: 'Serveur inaccessible' };
		}

		throw error;
	}
}

export const authService = {
	register: (userData) => fetchAPI('/auth/register', {
		method: 'POST',
		body: JSON.stringify(userData)
	}),
	login: (email, password) => fetchAPI('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password })
	}),
	getProfile: () => fetchAPI('/auth/me')
};

export const emailService = {
	send: (payload) => fetchAPI('/email/send', {
		method: 'POST',
		body: JSON.stringify(payload)
	})
};

export const poemService = {
	list: () => fetchAPI('/poems'),
	create: (payload) => fetchAPI('/poems', {
		method: 'POST',
		body: JSON.stringify(payload)
	}),
	getComments: (poemId) => fetchAPI(`/poems/${poemId}/comments`),
	addComment: (poemId, content) => fetchAPI(`/poems/${poemId}/comments`, {
		method: 'POST',
		body: JSON.stringify({ content })
	}),
	toggleLike: (poemId) => fetchAPI(`/poems/${poemId}/likes/toggle`, {
		method: 'POST'
	})
};

export const adminService = {
	listUsers: () => fetchAPI('/admin/users'),
	updateUser: (userId, payload) => fetchAPI(`/admin/users/${userId}`, {
		method: 'PATCH',
		body: JSON.stringify(payload)
	})
};