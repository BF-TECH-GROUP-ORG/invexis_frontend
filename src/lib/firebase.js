import { initializeApp } from "firebase/app";
import { getMessaging, onMessage, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging and export it
let messaging = null;

if (typeof window !== "undefined") {
    isSupported().then(supported => {
        if (supported) {
            messaging = getMessaging(app);
            console.log("Firebase Messaging initialized.");
        }
    }).catch(err => {
        console.warn("Firebase Messaging skip initialization:", err.message);
    });
}

export { app, messaging, getToken, onMessage };
export default app;
