import { env } from '$env/dynamic/private';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

type AssignmentNode = {
	ma?: unknown;
	client?: unknown;
	meaningfulMapping?: unknown;
	comment?: unknown;
};

export type Assignment = {
	id: string;
	ma: string;
	client: string;
	meaningfulMapping: boolean;
	comment: string;
};

function readServiceAccount() {
	const serviceAccountJson = env.PRIVATE_FIREBASE_SERVICE_ACCOUNT_JSON;

	if (serviceAccountJson) {
		return JSON.parse(serviceAccountJson);
	}

	throw new Error('Missing PRIVATE_FIREBASE_SERVICE_ACCOUNT_JSON');
}

function getOrInitApp() {
	const databaseURL = env.PRIVATE_FIREBASE_DATABASE_URL;

	if (!databaseURL) {
		throw new Error('Missing PRIVATE_FIREBASE_DATABASE_URL');
	}

	if (getApps().length > 0) return getApps()[0];

	const serviceAccount = readServiceAccount();

	return initializeApp({
		credential: cert(serviceAccount),
		databaseURL
	});
}

function dbRef(path: string) {
	const app = getOrInitApp();
	return getDatabase(app).ref(path);
}

export async function listAssignments(): Promise<Assignment[]> {
	const snapshot = await dbRef('assignments').get();
	const data = (snapshot.val() ?? {}) as Record<string, AssignmentNode>;

	return Object.entries(data)
		.map(([id, node]) => ({
			id,
			ma: String(node.ma ?? '').trim(),
			client: String(node.client ?? '').trim(),
			meaningfulMapping: Boolean(node.meaningfulMapping),
			comment: String(node.comment ?? '')
		}))
		.filter((item) => item.ma.length > 0 && item.client.length > 0)
		.sort((a, b) => a.ma.localeCompare(b.ma));
}

export async function updateAssignment(id: string, meaningfulMapping: boolean, comment: string): Promise<void> {
	await dbRef(`assignments/${id}`).update({
		meaningfulMapping,
		comment: comment.trim()
	});
}
