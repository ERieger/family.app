const txtEmail = document.querySelector('#txtEmail');
const txtPassword = document.querySelector('#txtPassword');
const txtUsername = document.querySelector('#txtUsername');
const btnSignIn = document.querySelector('#btnSignIn');
const btnSignUp = document.querySelector('#btnSignUp');
const btnSignOut = document.querySelector('#btnSignOut');
const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');

btnSignIn.addEventListener('click', e => {
    let email = txtEmail.value;
    let password = txtPassword.value;

    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
});

btnSignUp.addEventListener('click', e => {
    // TODO: Check for real email.
    let email = txtEmail.value;
    let password = txtPassword.value;

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
        writeUserToDB();

    } else {
        console.log('not logged in.');
        btnSignOut.classList.add('hidden');
    }
});

function writeUserToDB() {
    let username = txtUsername.value;
    let uid = auth.currentUser.uid;

    users.doc(uid).set({
            username: username,
            uid: uid
        })
        .then(() => {
            console.log("Document successfully written!");
        })
        .catch((error) => {
            console.error("Error writing document: ", error);
        });
};