import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore/lite";

const firebase_config = {
  apiKey: "AIzaSyAjxfOaGElAlZDhoD8j9Y1TK5L60PjqjRU",
  authDomain: "homelab-mraflis.firebaseapp.com",
  projectId: "homelab-mraflis",
  storageBucket: "homelab-mraflis.firebasestorage.app",
  messagingSenderId: "858563340378",
  appId: "1:858563340378:web:f84de1118943f9915a9063"
};

const app = initializeApp(firebase_config);
const auth = getAuth(app);
const db = getFirestore(app);

const login = async (email: string, password: string) => {
    let user = null;
    try {
        user = (await signInWithEmailAndPassword(auth, email, password)).user;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error signin in: ", error.message);
        } else {
            console.log("Unknown error when signin in");
        }
        user = null;
    }
    return user;
}

const logout = async () => {
    let user = null;
    try {
        await signOut(auth);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Error signin out: ", error.message);
        } else {
            console.log("Unknown error when signin out");
        }
        user = null;
    }
    return user;
}

const authSessionEvent = (storage: Storage, storageKey: string) => {
    onAuthStateChanged(
        auth,
        user => {
            if (user != null) {
                const userData = {
                    id: user.uid,
                    name: user.displayName,
                    anonymous: user.isAnonymous,
                };
                storage.setItem(storageKey, JSON.stringify(userData));
            } else {
                storage.removeItem(storageKey);    
            }
            
        },
        error => {
            storage.removeItem(storageKey);
            console.log("error when change user state: ", error.message);
        }
    )
}

const fetchData = async (collectionName: string) => {
    const result: object[]= []
    const queryData = await getDocs(collection(db, collectionName));
    queryData.forEach(doc => {
        result.push(doc.data())
    });
    return result;
}

export {
    login,
    logout,
    authSessionEvent,
    fetchData
}

