<script>
  var isDev = true;
  import Router, {location, pop, push, querystring, replace} from 'svelte-spa-router';

  import business from './routes/Business.svelte';
  import dashboard from './routes/Dashboard.svelte';
  import login from './routes/Login.svelte';
  // Import the functions you need from the SDKs you need
  import {initializeApp} from 'firebase/app';
  import {connectAuthEmulator, getAuth} from 'firebase/auth';
  import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';
  import {connectStorageEmulator, getStorage} from 'firebase/storage';

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: 'AIzaSyAUoinNhvJ_Oh3MToqcqXnDD7dZw1aIGPw',
    authDomain: 'myreviewrca.firebaseapp.com',
    projectId: 'myreviewrca',
    storageBucket: 'myreviewrca.appspot.com',
    messagingSenderId: '985989261311',
    appId: '1:985989261311:web:7f9ae762ca76261870e9ca',
    measurementId: 'G-G7Q0CSQ2FS',
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  window.db = getFirestore(app);
  window.storage = getStorage(app);
  window.auth = getAuth(app);

  if (isDev) {
    connectFirestoreEmulator(window.db, '127.0.0.1', 8080);
    connectStorageEmulator(window.storage, 'localhost', 9199);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  } else {
    window.db = getFirestore(window.firebaseApp);
    window.storage = getStorage(window.firebaseApp);
  }

  //grab the location
  let currentLocation;
  const unsubscribeLocation = location.subscribe((value) => {
    currentLocation = value;
  });

  let currentQuerystring;
  const unsubscribeQueryString = querystring.subscribe((value) => {
    currentQuerystring = value;
  });

  const routes = {
    '/': login,
    '/dashboard': dashboard,
    '/b/:id': business,
  };

  let currentRoute = '';

  window.spa = {
    push: async (url) => {
      await push(url);
      handleRouteChange();
    }, // The push(url) method navigates to another page, just like clicking on a link
    pop, // The pop() method is equivalent to hitting the back button in the browser
    replace, // The pop() method is equivalent to hitting the back button in the browser
    location: () => currentLocation,
    querystring: () => currentQuerystring,
  };

  function handleRouteChange() {
    window.scrollTo(0, 0);
  }
</script>

<Router {routes} on:routeChanged={handleRouteChange} />
