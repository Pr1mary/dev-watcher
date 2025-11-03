import {
	authSessionEvent,
	login,
	logout,
	updatePass,
	type UserIntf
} from '../helper/firebase_helper';

const checkLogin = async (storageKey: string) => {
	try {
		return {
			success: true,
			isLogin: (await authSessionEvent(sessionStorage, storageKey)) as boolean,
			message: 'Login check success!'
		};
	} catch (error) {
		if (error instanceof Error) {
			return {
				success: false,
				isLogin: false,
				message: error.message
			};
		} else {
			return {
				success: false,
				isLogin: false,
				message: 'Unknown error detected!'
			};
		}
	}
};

const logoutRequest = () => {
	logout();
};

const loginRequest = async (email: unknown, password: unknown, saveLogin: boolean) => {
	try {
		if (typeof email !== 'string' || typeof password !== 'string') {
			throw Error('Input email and/or password might be not a string!');
		}

		const userData = await login(email, password, saveLogin);
		if (userData != null) {
			return {
				success: true,
				errorType: 0,
				message: 'User succesfully signed in!'
			};
		} else {
			return {
				success: false,
				errorType: 1,
				message: 'Email or Password might be wrong!'
			};
		}
	} catch (error) {
		if (error instanceof Error) {
			return {
				success: false,
				errorType: 2,
				message: 'Error when logging in: ' + error.message
			};
		} else {
			return {
				success: false,
				errorType: 2,
				message: 'Unknown error when logging in'
			};
		}
	}
};

const changePassRequest = async (
	email: string,
	password: string,
	newPassword: string,
	newPasswordRe: string
) => {
	try {
		if (newPassword !== newPasswordRe) {
			return {
				success: false,
				errorType: 1,
				message: 'Password and Retyped Password is not same!'
			};
		}
		const updateSuccess = await updatePass(email, password, newPassword);
		if (updateSuccess) {
			return {
				success: false,
				errorType: 0,
				message: 'Password successfully updated!'
			};
		} else {
			throw Error('Error when updating password to firebase');
		}
	} catch (error) {
		if (error instanceof Error) {
			return {
				success: false,
				errorType: 2,
				message: 'Error when update password: ' + error.message
			};
		} else {
			return {
				success: false,
				errorType: 2,
				message: 'Unknown error when update password'
			};
		}
	}
};

const getUserEmail = (storageKey: string) => {
	const rawUserData = sessionStorage.getItem(storageKey);
	if (rawUserData !== null) {
		const userData: UserIntf = JSON.parse(rawUserData);
		return userData.email;
	} else {
		return '';
	}
};

export { checkLogin, logoutRequest, loginRequest, changePassRequest, getUserEmail };
