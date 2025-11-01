<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import {
		Button,
		Container,
		Icon,
		Input,
		Modal,
		ModalBody,
		ModalHeader,
		Navbar,
		Spinner,
		Styles
	} from '@sveltestrap/sveltestrap';

	import { onMount } from 'svelte';
	import { pageStatus } from '../helper/shared_state_helper.svelte';
	import { changePassRequest, checkLogin, getUserEmail, loginRequest, logoutRequest } from './layout_logic';

	let { children } = $props();

	const SettingsMenuEnum = {
		BASE: 0,
		CHANGE_PASSWORD: 1,
		ABOUT: 2,
		APP_CONFIG: 3
	};

	let inputEmail = $state("");
	let inputPassword = $state("");
	let inputNewPassword = $state("");
	let inputNewPasswordRe = $state("");
	let saveLogin = $state(false);
	let authCheckDone = $state(false);
	let showSettingsFlag = $state(false);
	let currSettingsMenu = $state(SettingsMenuEnum.BASE);
	let waitProcess = $state(false);
	let darkModeToggle = $state(false);

	let themeLoaded = false;

	pageStatus.isLogin = false;
	pageStatus.waitFetch = true;

	onMount(async () => {
		pageStatus.isLogin = (await checkLogin('userData')).isLogin;
		pageStatus.waitFetch = false;
		authCheckDone = true;
	});

	const logoutProcess = () => {
		logoutRequest();
		inputEmail = '';
		inputPassword = '';
		pageStatus.isLogin = false;
		pageStatus.waitFetch = false;
		showSettingsFlag = false;
	};

	const toggleShowSettings = () => {
		showSettingsFlag = !showSettingsFlag;
		currSettingsMenu = SettingsMenuEnum.BASE;
	};

	const settingsMenuSwitch = (menuOption: number) => {
		currSettingsMenu = menuOption;

		if (currSettingsMenu === SettingsMenuEnum.CHANGE_PASSWORD) {
			inputEmail = getUserEmail('userData');
		} else {
			inputEmail = '';
			inputPassword = '';
			inputNewPassword = '';
			inputNewPasswordRe = '';
		}
	};

	const processLogin = async () => {
		// wait process flag set to true until this process completed
		waitProcess = true;

		// login process
		const userLogin = await loginRequest(inputEmail, inputPassword, saveLogin);
		switch (userLogin.errorType) {
			case 0:
				console.log(userLogin.message);
				pageStatus.isLogin = true;
				inputEmail = '';
				inputPassword = '';
				inputNewPassword = '';
				inputNewPasswordRe = '';
				break;
			case 1:
				alert(userLogin.message);
				break;
			default:
				alert('Login error, please contact administrator!');
				console.log(userLogin.message);
				break;
		}

		// wait process flag set to true until this process completed
		waitProcess = false;
	};

	const processUpdatePassword = async () => {
		// wait process flag set to true until this process completed
		waitProcess = true;

		// update password flow
		const changePassResult = await changePassRequest(inputEmail, inputPassword, inputNewPassword, inputNewPasswordRe);
		switch (changePassResult.errorType) {
			case 0:
				alert(changePassResult.message);
				inputEmail = '';
				inputPassword = '';
				inputNewPassword = '';
				inputNewPasswordRe = '';
				currSettingsMenu = SettingsMenuEnum.BASE;
				break;
			case 1:
				alert("Neither email nor password is string");
				break;
			default:
				alert('Update password error, please contact administrator!');
				console.log(changePassResult.message);
				break;
		}

		// wait process flag set to true until this process completed
		waitProcess = false;
	};

	let theme: 'dark' | 'light' = $state('dark');

	$effect(() => {
		if (!themeLoaded) {
			let lastDarkMode = localStorage.getItem('darkmode');
			if (lastDarkMode && lastDarkMode === 'enabled') {
				darkModeToggle = true;
			}
			themeLoaded = true;
		}

		if (darkModeToggle) {
			theme = 'dark';
			localStorage.setItem('darkmode', 'enabled');
		} else {
			theme = 'light';
			localStorage.setItem('darkmode', 'disabled');
		}
	});
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
	<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
</svelte:head>

<Styles {theme} />

<Navbar class="mb-4 shadow sticky-top" color={theme} expand="md">
	<Container class="d-flex justify-content-between">
		<h2><Icon name="fire" /><strong>Flame</strong>Tower</h2>

		<Button
			disabled={!(authCheckDone && pageStatus.isLogin)}
			onclick={() => toggleShowSettings()}
			aria-label="settings"
		>
			<Icon name="gear-fill" />
		</Button>
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
				<input
					bind:value={inputPassword}
					type="password"
					class="form-control"
					id="input-password"
				/>
			</div>
			<div class="mb-3">
				<input
				class="form-check-input"
				type="checkbox"
				bind:checked={saveLogin}
				id="input-save-login">
				<label for="input-save-login" class="form-label">Save login</label>
			</div>
			<button class="btn btn-primary" onclick={processLogin} disabled={waitProcess}
				>Login {#if waitProcess}<Spinner size="sm"></Spinner>{/if}
			</button>
		</ModalBody>
	</Modal>
{/if}

<!-- show the modal when open settings flag is true -->
<Modal isOpen={showSettingsFlag} centered={true}>
	<ModalHeader toggle={toggleShowSettings}>Settings</ModalHeader>
	<ModalBody>
		{#if currSettingsMenu == SettingsMenuEnum.BASE}
			<Container class="d-flex flex-column">
				<a
					href="/"
					class="menu-btn"
					onclick={() => settingsMenuSwitch(SettingsMenuEnum.CHANGE_PASSWORD)}
				>
					<h6><Icon name="briefcase" /> Change Password</h6>
				</a>
				<a
					href="/"
					class="menu-btn"
					onclick={() => settingsMenuSwitch(SettingsMenuEnum.APP_CONFIG)}
				>
					<h6><Icon name="sliders" /> App Config</h6>
				</a>
				<a href="/" class="menu-btn" onclick={() => settingsMenuSwitch(SettingsMenuEnum.ABOUT)}>
					<h6><Icon name="info-circle" /> About</h6>
				</a>
				<a href="/" class="menu-btn" onclick={logoutProcess}>
					<h6><Icon name="box-arrow-right" /> Sign-Out</h6>
				</a>
			</Container>
		{:else if currSettingsMenu == SettingsMenuEnum.CHANGE_PASSWORD}
			<Container>
				<div class="mb-3">
					<a href="/" class="menu-btn" onclick={() => settingsMenuSwitch(SettingsMenuEnum.BASE)}>
						<h6><Icon name="arrow-left" /> Change Password</h6>
					</a>
				</div>

				<div class="mb-3">
					<label for="input-email" class="form-label">Email address</label>
					<input
						bind:value={inputEmail}
						type="email"
						class="form-control"
						id="input-email"
						aria-describedby="emailHelp"
						disabled
					/>
				</div>
				<div class="mb-3">
					<label for="input-password" class="form-label">Current Password</label>
					<input
						bind:value={inputPassword}
						type="password"
						class="form-control"
						id="input-password"
					/>
				</div>
				<div class="mb-3">
					<label for="input-password" class="form-label">New Password</label>
					<input
						bind:value={inputNewPassword}
						type="password"
						class="form-control"
						id="input-password"
					/>
				</div>
				<div class="mb-3">
					<label for="input-password-re" class="form-label">Retype New Password</label>
					<input
						bind:value={inputNewPasswordRe}
						type="password"
						class="form-control"
						id="input-password-re"
					/>
				</div>
				<button class="btn btn-primary" onclick={processUpdatePassword} disabled={waitProcess}
					>Submit Update {#if waitProcess}<Spinner size="sm"></Spinner>{/if}
				</button>
			</Container>
		{:else if currSettingsMenu == SettingsMenuEnum.ABOUT}
			<Container class="d-flex flex-column">
				<a href="/" class="menu-btn" onclick={() => settingsMenuSwitch(SettingsMenuEnum.BASE)}>
					<h6><Icon name="arrow-left" /> About</h6>
				</a>

				<p>Uptime monitoring dashboard with firebase stack</p>
			</Container>
		{:else if currSettingsMenu == SettingsMenuEnum.APP_CONFIG}
			<Container class="d-flex flex-column">
				<a href="/" class="menu-btn" onclick={() => settingsMenuSwitch(SettingsMenuEnum.BASE)}>
					<h6><Icon name="arrow-left" /> App Config</h6>
				</a>
				<div>
					<Input theme="light" type="switch" label="Dark mode" bind:checked={darkModeToggle} />
				</div>
			</Container>
		{/if}
	</ModalBody>
</Modal>

{@render children?.()}

<style>
	.menu-btn {
		margin-top: 2%;
		margin-bottom: 3%;
		text-decoration: none;
	}
</style>
