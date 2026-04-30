<script lang="ts">

	import "../app.css";

	let { data } = $props();

	type Assignment = {
		id: string;
		ma: string;
		client: string;
		meaningfulMapping: boolean;
		comment: string;
	};

	type SaveState = 'idle' | 'saving' | 'saved' | 'error';

	const assignments = $derived(data.assignments as Assignment[]);
	const systemUrl = $derived(data.systemUrl as string);
	const auflistungNummer = $derived(data.auflistungNummer as string);
	let currentIndex = $state(0);
	let currentSaveState = $state<SaveState>('idle');

	const currentAssignment = $derived(assignments[currentIndex] ?? null);
	const totalCount = $derived(assignments.length);
	const isLastAssignment = $derived(currentIndex >= totalCount - 1);

	function openMitarbeiterLink(assignment: Assignment): void {
		const base = `${systemUrl}/auflistung-${auflistungNummer}`;
		const maUrl = `${base}/MitarbeiterIn/${encodeURIComponent(assignment.ma)}`;
		window.open(maUrl, '_blank', 'noopener,noreferrer');
	}

	function openKlientLink(assignment: Assignment): void {
		const base = `${systemUrl}/auflistung-${auflistungNummer}`;
		const clientUrl = `${base}/KlientIn/${encodeURIComponent(assignment.client)}`;
		window.open(clientUrl, '_blank', 'noopener,noreferrer');
	}

	async function saveAndNext(): Promise<void> {
		if (!currentAssignment) return;
		currentSaveState = 'saving';
		try {
			const response = await fetch(`/api/assignments/${encodeURIComponent(currentAssignment.id)}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					meaningfulMapping: currentAssignment.meaningfulMapping,
					comment: currentAssignment.comment
				})
			});

			if (!response.ok) {
				currentSaveState = 'error';
				return;
			}

			currentSaveState = 'saved';
			if (!isLastAssignment) {
				currentIndex += 1;
				currentSaveState = 'idle';
			}
		} catch {
			currentSaveState = 'error';
		}
	}
</script>

<main class="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
	<section class="card bg-base-100 border border-base-300 shadow-sm">
		<div class="card-body">
			<h1 class="card-title text-2xl">ID-Zuordnungen</h1>
			<p class="text-base-content/70 text-sm">
				Prüfe jeweils eine Zuordnung und speichere sie manuell, um zur nächsten zu wechseln.
			</p>
		</div>
	</section>

	{#if totalCount === 0}
		<section class="card bg-base-100 border border-base-300 shadow-sm">
			<div class="card-body">
				<p>Keine Zuordnungen vorhanden.</p>
			</div>
		</section>
	{:else}
		<section class="card bg-base-100 border border-base-300 shadow-sm">
			<div class="card-body gap-6">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold">
						Eintrag {currentIndex + 1} von {totalCount}
					</h2>
					<div class="text-base-content/60 text-sm">
						MA: <span class="font-mono">{currentAssignment?.ma}</span> | Klient:
						<span class="font-mono">{currentAssignment?.client}</span>
					</div>
				</div>

				{#if currentAssignment}
					<div class="grid gap-6 md:grid-cols-[1fr_auto]">
						<div class="flex flex-col gap-4">
							<div class="flex flex-wrap gap-3">
								<button
									type="button"
									class="btn btn-outline"
									onclick={() => openMitarbeiterLink(currentAssignment)}
								>
									Mitarbeiter
								</button>
								<button
									type="button"
									class="btn btn-outline"
									onclick={() => openKlientLink(currentAssignment)}
								>
									Klient
								</button>
							</div>

							<label class="label cursor-pointer justify-start gap-3 rounded-box border border-base-300 px-4 py-3">
								<input
									type="checkbox"
									class="checkbox checkbox-primary"
									bind:checked={currentAssignment.meaningfulMapping}
								/>
								<span class="label-text">Sinnvolle Zuordnung</span>
							</label>

							<div class="flex flex-col gap-2">
								<label class="label p-0" for="assignment-comment">
									<span class="label-text">Kommentar (Optional)</span>
								</label>
								<textarea
									id="assignment-comment"
									class="textarea textarea-bordered min-h-36 w-full"
									rows="5"
									bind:value={currentAssignment.comment}
								></textarea>
							</div>
						</div>

						<div class="flex min-w-52 flex-col items-stretch gap-3">
							<button
								type="button"
								class="btn btn-primary"
								onclick={saveAndNext}
								disabled={currentSaveState === 'saving'}
							>
								{#if currentSaveState === 'saving'}
									Speichert...
								{:else if isLastAssignment}
									Speichern
								{:else}
									Speichern und weiter
								{/if}
							</button>

							{#if currentSaveState === 'saved' && isLastAssignment}
								<span class="badge badge-success badge-outline justify-center">Gespeichert</span>
							{:else if currentSaveState === 'error'}
								<span class="badge badge-error badge-outline justify-center">Fehler beim Speichern</span>
							{:else if currentSaveState === 'idle' && isLastAssignment}
								<span class="text-base-content/60 text-xs text-center">
									Letzter Eintrag
								</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}
</main>
