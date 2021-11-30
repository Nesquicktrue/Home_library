let firebaseConfig = {
    apiKey: "AIzaSyB5TZnqd4Lwel74yhtYNaHfOjsfgWIJF_4",
    authDomain: "home-library-js.firebaseapp.com",
    databaseURL: "https://home-library-js-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "home-library-js",
    storageBucket: "home-library-js.appspot.com",
    messagingSenderId: "109962970996",
    appId: "1:109962970996:web:2317b678700fc00da40e21"
};

firebase.initializeApp(firebaseConfig);

// Přihlašovací dialog pro Firebase
let uiConfig = {

    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            console.log(authResult)
            return true;
        },
        uiShown: function() {
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'index.html',
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
        //  firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url
    // tosUrl: '<your-tos-url>',
    // Privacy policy url
    // privacyPolicyUrl: '<your-privacy-policy-url>'
};

let ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#loginUI', uiConfig)