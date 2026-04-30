import { json } from '@sveltejs/kit';
import { updateAssignment } from '$lib/server/firebase';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = String(params.id ?? '').trim();
	if (!id) {
		return json({ error: 'Ungültige ID.' }, { status: 400 });
	}

	const payload = (await request.json()) as {
		meaningfulMapping?: unknown;
		comment?: unknown;
	};

	await updateAssignment(id, Boolean(payload.meaningfulMapping), String(payload.comment ?? ''));
	return json({ ok: true });
};
