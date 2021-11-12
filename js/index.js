var firebaseConfig = {
    apiKey: "AIzaSyB5TZnqd4Lwel74yhtYNaHfOjsfgWIJF_4",
    authDomain: "home-library-js.firebaseapp.com",
    databaseURL: "https://home-library-js-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "home-library-js",
    storageBucket: "home-library-js.appspot.com",
    messagingSenderId: "109962970996",
    appId: "1:109962970996:web:2317b678700fc00da40e21"
};

firebase.initializeApp(firebaseConfig);

let ui = new firebaseui.auth.AuthUI(firebase.auth());

let uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        //     // User successfully signed in.
        //     // Return type determines whether we continue the redirect automatically
        //     // or whether we leave that to developer to handle.
            
             console.log(authResult)
             return true;
        },
        uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
        },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: 'main.html',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //  firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
  };

  
ui.start('#loginUI', uiConfig)
