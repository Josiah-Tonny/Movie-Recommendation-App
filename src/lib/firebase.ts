import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { // Firebase configuration object with API key and other details
  apiKey: "AIzaSyDYrcJmNxXj_9p1oGIy_0k0BL2GjDzsBKs",
  authDomain: "movie-recommendation-app-f3e1f.firebaseapp.com",
  projectId: "movie-recommendation-app-f3e1f",
  storageBucket: "movie-recommendation-app-f3e1f.appspot.com",
  messagingSenderId: "846331168175",
  appId: "1:846331168175:web:9c9b9b0b0b0b0b0b0b0b0b"
};

const app = initializeApp(firebaseConfig);  // Initialize Firebase app with the configuration
export const auth = getAuth(app);

// Add auth state listener
auth.onAuthStateChanged((user) => { // Listen for changes in user authentication state
  if (user) {
    console.log('User is signed in:', user);
  } else {
    console.log('User is signed out');
  }
});