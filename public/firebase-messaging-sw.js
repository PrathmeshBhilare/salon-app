importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDno_OdcY0n31apovqRJFORyPlajrbzT5k",
  authDomain: "hairsaloon-5f7e7.firebaseapp.com",
  projectId: "hairsaloon-5f7e7",
  storageBucket: "hairsaloon-5f7e7.firebasestorage.app",
  messagingSenderId: "967280251037",
  appId: "1:967280251037:web:4dc2f75325b1df12554474",
  measurementId: "G-9R8VHRE37B"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/icon.png', // Fallback icon if none provided
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
