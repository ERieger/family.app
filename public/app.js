const loginPage = document.querySelector('#login-page');
const txtEmail = document.querySelector('#txtEmail');
const txtPassword = document.querySelector('#txtPassword');
const txtUsername = document.querySelector('#txtUsername');
const left = document.querySelector('#left');
const right = document.querySelector('#right');
const btnSignOut = document.querySelector('#btnSignOut');

const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');

let signIn = false;

function changeEventList() {
    if (signIn == false) {
        signIn = true;
    } else {
        signIn = false;
    }

    setEventList();
}

function setEventList() {
    if (signIn == true) {
        left.replaceWith(left.cloneNode(true));
        right.innerHTML = 'Sign In';
        left.innerHTML = 'Sign Up';

        // Sign up existing user
        left.addEventListener('click', function signUp() {
            // TODO: Check for real email.
            let email = txtEmail.value;
            let password = txtPassword.value;

            const promise = auth.createUserWithEmailAndPassword(email, password);
            promise.catch(e => console.log(e.message));
        });

        txtUsername.classList.remove('hidden');
        console.log(signIn, 'sign up');
    } else if (signIn == false) {
        left.replaceWith(left.cloneNode(true));
        right.innerHTML = 'Sign Up';
        left.innerHTML = 'Sign In';

        // Sign existing user in
        left.addEventListener('click', function signIn() {
            let email = txtEmail.value;
            let password = txtPassword.value;

            const promise = auth.signInWithEmailAndPassword(email, password);
            promise.catch(e => console.log(e.message));
        });

        txtUsername.classList.add('hidden');
        console.log(signIn, 'sign in');

    }
}

setEventList();

// Sign out current user
btnSignOut.addEventListener('click', e => {
    firebase.auth().signOut();
});

// Detecy when auth state changes
firebase.auth().onAuthStateChanged(firebaseUser => {
    // If signed in
    if (firebaseUser) {
        console.log(firebaseUser);
        btnSignOut.classList.remove('hidden'); // Show logout button

        // Check user exists in db
        users.doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) { // User exists
                console.log("Document data:", doc.data());
            } else { // Add user data to db
                console.log("No such document!");
                writeUserToDB();
            }

            loginPage.classList.add('hidden');
        }).catch((error) => { // Catch any errors
            console.log("Error getting document:", error);
        });

    } else { // Confirm logout
        console.log('not logged in.');
        btnSignOut.classList.add('hidden');
        loginPage.classList.remove('hidden');
    }
});

// Add new user information to database
function writeUserToDB() {
    let username = txtUsername.value;
    let uid = auth.currentUser.uid;
    let email = txtEmail.value;

    users.doc(uid).set({ // Write to db
        username: username,
        uid: uid,
        email: email
    })
        .then(() => { // If success
            console.log("Document successfully written!");
        })
        .catch((error) => { // Catch errors
            console.error("Error writing document: ", error);
        });
};