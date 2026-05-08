
import { writable } from "svelte/store";

// set the default value of appOnline with current status of browser
export const online = writable(navigator.onLine);

// update online status based on network status event of the browser
window.addEventListener('online', () => online.set(true));
window.addEventListener('offline', () => online.set(false));
