import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, getDocs, getFirestore, Timestamp } from "firebase/firestore/lite";
import firebase_config from "./firebase_config.json";

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
    fetchData,
    
    Timestamp
}

