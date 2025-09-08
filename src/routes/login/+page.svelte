<script lang="ts">
    import { Card, Form } from '@sveltestrap/sveltestrap';
    import { login } from "../../helper/firebase_helper";
	import { goto } from '$app/navigation';

    let inputEmail = $state();
    let inputPassword = $state();
    const existUserData = sessionStorage.getItem("userData");
    if (existUserData) {
        console.log("User already loged in!");
        goto("/");
    }

    const processLogin = async (email: unknown, password: unknown) => {
        
        try {
            if (typeof email !== 'string' || typeof password !== 'string'){
                throw "Neither email nor password is string"
            }

            const userData = await login(email, password);
            if (userData != null) {
                console.log("User succesfully signed in!");
                goto("/");
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

<Card body class="m-3 shadow">
    <div class="mb-3">
        <label for="input-email" class="form-label">Email address</label>
        <input bind:value={inputEmail} type="email" class="form-control" id="input-email" aria-describedby="emailHelp">
    </div>
    <div class="mb-3">
        <label for="input-password" class="form-label">Password</label>
        <input bind:value={inputPassword} type="password" class="form-control" id="input-password">
    </div>
    <button class="btn btn-primary" onclick="{async () => processLogin(inputEmail, inputPassword)}">Submit</button>
</Card>