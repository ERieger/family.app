// Global variables
let signIn = false;
let listener = false;
let familyUID;

function changeEventList() {
    if (signIn == false) {
        signIn = true;
    } else {
        signIn = false;
    }

    setEventList();
}

let signUserUp = () => {
    let email = consts.txtEmail.value;
    let password = consts.txtPassword.value;

    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
};

let signUserIn = () => {
    let email = consts.txtEmail.value;
    let password = consts.txtPassword.value;

    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
};

function setEventList() {
    if (signIn) {
        if (listener == true) {
            consts.left.removeEventListener('click', signUserIn);
            listener = false;
        }
        consts.right.innerHTML = 'Sign In';
        consts.left.innerHTML = 'Sign Up';

        // Sign up existing user
        consts.left.addEventListener('click', signUserUp);

        consts.txtUsername.classList.remove('hidden');
        listener = true;
    } else if (!signIn) {
        if (listener == true) {
            consts.left.removeEventListener('click', signUserUp);
            listener = false;
        }
        consts.right.innerHTML = 'Sign Up';
        consts.left.innerHTML = 'Sign In';

        // Sign existing user in
        consts.left.addEventListener('click', signUserIn);

        consts.txtUsername.classList.add('hidden');
        listener = true;
    }
}

setEventList();

// Sign out current user
consts.btnSignOut.addEventListener('click', e => {
    firebase.auth().signOut();
});

// Detecy when auth state changes
firebase.auth().onAuthStateChanged(firebaseUser => {
    // If signed in
    if (firebaseUser) {
        // Check user exists in db
        users.doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) { // User exists
                familyUID = doc.data().family;
                loadFamily();
            } else { // Add user data to db
                console.log("No such user!");
                writeUserToDB();
            }

            consts.loginPage.classList.add('hidden');

        }).catch((error) => { // Catch any errors
            console.log("Error getting document:", error);
        });
    } else {
        console.log('not logged in.');
        consts.appPage.classList.add('hidden');
        consts.loginPage.classList.remove('hidden');
        familyUID = false;
    }
});

// Add new user information to database
function writeUserToDB() {
    let username = consts.txtUsername.value;
    let uid = auth.currentUser.uid;
    let email = consts.txtEmail.value;

    users.doc(uid).set({ // Write to db
        username: username,
        uid: uid,
        email: email,
        family: false
    })
        .then(() => { // If success
            console.log("Document successfully written!");
        })
        .catch((error) => { // Catch errors
            console.error("Error writing document: ", error);
        });

    familyUID = false;
    loadFamily();
};