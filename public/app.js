(function () {
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBbTVuvvvt3HJ8Cf5aqVYKPFAGOTsvJsec",
    authDomain: "family-app-3a825.firebaseapp.com",
    projectId: "family-app-3a825",
    storageBucket: "family-app-3a825.appspot.com",
    messagingSenderId: "889947396324",
    appId: "1:889947396324:web:ce3adc8ba5925582c534f1"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
});

const txtEmail = document.querySelector('#txtEmail');
const txtPassword = document.querySelector('#txtPassword');
const btnSignIn = document.querySelector('#btnSignIn');
const btnSignUp = document.querySelector('#btnSignUp');
const btnSignOut = document.querySelector('#btnSignOut');

btnSignIn.addEventListener('click', e => {
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
});

btnSignOut.addEventListener('click', e => {
    firebase.auth().signOut();
});

btnSignUp.addEventListener('click', e => {
    // TODO: Check for real email.
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
});

firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        console.log(firebaseUser);
        btnSignOut.classList.remove('hide');
    } else {
        console.log('not logged in.');
        btnSignOut.classList.add('hide');
    }
});