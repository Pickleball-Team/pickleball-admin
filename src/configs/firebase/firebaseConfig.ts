// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging } from 'firebase/messaging';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAmskRuFz3SAGrjVd-ctrPYZLCCJEebLR4',
  authDomain: 'spocepicker.firebaseapp.com',
  databaseURL:
    'https://spocepicker-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'spocepicker',
  storageBucket: 'spocepicker.firebasestorage.app',
  messagingSenderId: '443076766052',
  appId: '1:443076766052:web:946e6ef75213dd3b863271',
  measurementId: 'G-GTEMM5X7SJ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);
const database = getDatabase(app);

export { analytics, messaging, database };
