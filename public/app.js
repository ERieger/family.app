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

btnSignUp.addEventListener('click', e => {
    // TODO: Check for real email.
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
});

btnSignOut.addEventListener('click', e => {
    firebase.auth().signOut();
});

firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser);
        btnSignOut.classList.remove('hidden');
    } else {
        console.log('not logged in.');
        btnSignOut.classList.add('hidden');
    }
});