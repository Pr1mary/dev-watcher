<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
    import { Button, Container, Modal, ModalBody, ModalHeader, Navbar } from '@sveltestrap/sveltestrap';
	import { onMount } from 'svelte';
	import { authSessionEvent, login, logout } from '../helper/firebase_helper';
	import { pageStatus } from "../helper/shared_state.svelte";

	let { children } = $props();
	
    let inputEmail = $state();
    let inputPassword = $state();
	const userDataKey = "userData";
	const userData = sessionStorage.getItem(userDataKey);
	pageStatus.isLogin = (userData)?true:false;

	onMount(() => {
		authSessionEvent(sessionStorage, userDataKey);
	});

	const logoutProcess = () => {
		logout();
		inputEmail = "";
		inputPassword = "";
		pageStatus.isLogin = false;
	}

    const processLogin = async (email: unknown, password: unknown) => {
        
        try {
            if (typeof email !== 'string' || typeof password !== 'string'){
                throw "Neither email nor password is string"
            }

            const userData = await login(email, password);
            if (userData != null) {
                console.log("User succesfully signed in!");
                pageStatus.isLogin = true;
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

<Navbar sticky=true class="mb-4 shadow" expand="md">
	<Container class="d-flex justify-content-between">
		<h2>Project Uptime</h2>
		{#if pageStatus.isLogin}
		<Button onclick={() => logoutProcess()}>
			Logout	
		</Button>
		{/if}
	</Container>	
</Navbar>

<Modal isOpen={!pageStatus.isLogin} backdrop="static" class="modal-dialog-centered">
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
