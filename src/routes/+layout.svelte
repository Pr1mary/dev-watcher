<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import {
		Button,
		Container,
		Modal,
		ModalBody,
		ModalHeader,
		Navbar
	} from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { authSessionEvent, login, logout } from '../helper/firebase_helper';
	import { pageStatus } from '../helper/shared_state_helper.svelte';

	let { children } = $props();

	let inputEmail = $state();
	let inputPassword = $state();
	let authCheckDone = $state(false);

	pageStatus.isLogin = false;
	pageStatus.waitFetch = true;

	onMount(async () => {
		try {
			pageStatus.isLogin = (await authSessionEvent(sessionStorage, 'userData')) as boolean
		} catch (err) {
			pageStatus.isLogin = false;
		}
		pageStatus.waitFetch = false;
		authCheckDone = true;
	});

	const logoutProcess = () => {
		logout();
		inputEmail = '';
		inputPassword = '';
		pageStatus.isLogin = false;
	};

	const processLogin = async (email: unknown, password: unknown) => {
		try {
			if (typeof email !== 'string' || typeof password !== 'string') {
				throw 'Neither email nor password is string';
			}

			const userData = await login(email, password);
			if (userData != null) {
				console.log('User succesfully signed in!');
				pageStatus.isLogin = true;
				email = '';
				password = '';
			} else {
				alert('Email or Password might be wrong!');
			}
		} catch (error) {
			alert('Login error, please contact administrator!');
			if (error instanceof Error) {
				console.log('Error when logging in: ', error.message);
			} else {
				console.log('Unknown error when logging in');
			}
		}
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
	/>
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
	/>
</svelte:head>

<Navbar class="mb-4 shadow sticky-top" color="light" expand="md">
	<Container class="d-flex justify-content-between">
		<h2>Project Uptime</h2>
		{#if authCheckDone && pageStatus.isLogin}
			<Button onclick={() => logoutProcess()}>Logout</Button>
		{/if}
	</Container>
</Navbar>

<!-- authCheckDone make the modal to not render until the firebase auth process done -->
{#if authCheckDone}
	<Modal isOpen={!pageStatus.isLogin} backdrop="static" class="modal-dialog-centered">
		<ModalHeader>
			<h2>User Login</h2>
		</ModalHeader>
		<ModalBody>
			<div class="mb-3">
				<label for="input-email" class="form-label">Email address</label>
				<input
					bind:value={inputEmail}
					type="email"
					class="form-control"
					id="input-email"
					aria-describedby="emailHelp"
				/>
			</div>
			<div class="mb-3">
				<label for="input-password" class="form-label">Password</label>
				<input bind:value={inputPassword} type="password" class="form-control" id="input-password" />
			</div>
			<button class="btn btn-primary" onclick={async () => processLogin(inputEmail, inputPassword)}
				>Submit</button
			>
		</ModalBody>
	</Modal>
{/if}

{@render children?.()}
