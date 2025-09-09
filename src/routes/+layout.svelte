<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
    import { Button, Modal, ModalBody, ModalHeader, Navbar } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { authSessionEvent, login, logout } from '../helper/firebase_helper';
	import { goto } from '$app/navigation';

	let { children } = $props();
	
    let inputEmail = $state();
    let inputPassword = $state();
	const userDataKey = "userData";
	const userData = sessionStorage.getItem(userDataKey);
	let isLogin = $state((userData)?true:false);

	onMount(() => {
		authSessionEvent(sessionStorage, userDataKey);
	});

	const logoutProcess = () => {
		logout();
		isLogin = false;
	}

    const processLogin = async (email: unknown, password: unknown) => {
        
        try {
            if (typeof email !== 'string' || typeof password !== 'string'){
                throw "Neither email nor password is string"
            }

            const userData = await login(email, password);
            if (userData != null) {
                console.log("User succesfully signed in!");
                isLogin = true;
				email = "";
				password = "";
            } else {
                alert("Email or Password might be wrong!");
            }

        } catch (error) {
            alert("Login error, please contact administrator!");
            if (error instanceof Error){
                console.log("Error when logging in: ", error.message);
            } else {
                console.log("Unknown error when logging in");
            }
        }

    }
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
</svelte:head>

<Navbar sticky=true class="mb-4 shadow" color="light" light expand="md">

	<div class="container d-flex justify-content-between">
		<h4>Project Uptime</h4>
		{#if isLogin}
		<Button onclick={() => logoutProcess()}>
			Logout	
		</Button>
		{/if}
	</div>
	
</Navbar>

<Modal isOpen={!isLogin} backdrop="static" class="modal-dialog-centered">
	<ModalHeader>
		<h2>User Login</h2>
	</ModalHeader>
	<ModalBody>
		<div class="mb-3">
			<label for="input-email" class="form-label">Email address</label>
			<input bind:value={inputEmail} type="email" class="form-control" id="input-email" aria-describedby="emailHelp">
		</div>
		<div class="mb-3">
			<label for="input-password" class="form-label">Password</label>
			<input bind:value={inputPassword} type="password" class="form-control" id="input-password">
		</div>
		<button class="btn btn-primary" onclick="{async () => processLogin(inputEmail, inputPassword)}">Submit</button>
	</ModalBody>
</Modal>

{@render children?.()}
