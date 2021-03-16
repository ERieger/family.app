// HTML page references
const loginPage = document.querySelector('#login-page');
const txtEmail = document.querySelector('#txtEmail');
const txtPassword = document.querySelector('#txtPassword');
const txtUsername = document.querySelector('#txtUsername');
const left = document.querySelector('#left');
const right = document.querySelector('#right');
const btnSignOut = document.querySelector('#btnSignOut');
const appPage = document.querySelector('#app-page');

// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');
const families = db.collection('families');

// Sign in bools
let signIn = false;
let listener = false;

function changeEventList() {
    if (signIn == false) {
        signIn = true;
    } else {
        signIn = false;
    }

    setEventList();
}

let signUserUp = () => {
    let email = txtEmail.value;
    let password = txtPassword.value;

    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
};

let signUserIn = () => {
    let email = txtEmail.value;
    let password = txtPassword.value;

    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
};

function setEventList() {
    if (signIn == true) {
        if (listener == true) {
            left.removeEventListener('click', signUserIn);
            listener = false;
        }
        right.innerHTML = 'Sign In';
        left.innerHTML = 'Sign Up';

        // Sign up existing user
        left.addEventListener('click', signUserUp);

        txtUsername.classList.remove('hidden');
        listener = true;
    } else if (signIn == false) {
        if (listener == true) {
            left.removeEventListener('click', signUserUp);
            listener = false;
        }
        right.innerHTML = 'Sign Up';
        left.innerHTML = 'Sign In';

        // Sign existing user in
        left.addEventListener('click', signUserIn);

        txtUsername.classList.add('hidden');
        listener = true;
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
            appPage.classList.remove('hidden');
        }).catch((error) => { // Catch any errors
            console.log("Error getting document:", error);
        });

    } else { // Confirm logout
        console.log('not logged in.');
        btnSignOut.classList.add('hidden');
        appPage.classList.add('hidden');
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


// Generate a generic UUID
function createUUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}

// function createFamily() {
//     families.doc(createUUID())
// }