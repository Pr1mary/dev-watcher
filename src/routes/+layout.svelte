<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
    import { Button, Navbar } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { authSessionEvent, logout } from '../helper/firebase_helper';

	let { children } = $props();

	const userDataKey = "userData";
	const userData = sessionStorage.getItem(userDataKey);
	let showLogout = $state((userData)?true:false);

	onMount(() => {
		authSessionEvent(sessionStorage, userDataKey);
	});

	const logoutProcess = () => {
		logout();
		showLogout = false;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
</svelte:head>

<Navbar sticky=true class="mb-4 shadow" color="light" light expand="md">
	<div class="container">
		<h1>Project Uptime</h1>
	</div>

	{#if showLogout}
		<Button onclick={() => logoutProcess()}>
			Logout	
		</Button>
	{/if}
</Navbar>

{@render children?.()}
