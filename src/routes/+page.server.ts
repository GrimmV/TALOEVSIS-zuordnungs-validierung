import { fail } from '@sveltejs/kit';
import { listAssignments, updateAssignment } from '$lib/server/firebase';
import { env } from '$env/dynamic/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		assignments: await listAssignments(),
		systemUrl: env.PRIVATE_SYSTEM_URL ?? '',
		auflistungNummer: env.PRIVATE_AUFLISTUNG_NUMMER ?? ''
	};
};

export const actions: Actions = {
	update: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '').trim();
		const meaningfulMapping = data.get('meaningfulMapping') === 'on';
		const comment = String(data.get('comment') ?? '');

		if (!id) {
			return fail(400, { error: 'Ungültige ID.' });
		}

		await updateAssignment(id, meaningfulMapping, comment);
		return { success: true };
	}
};
