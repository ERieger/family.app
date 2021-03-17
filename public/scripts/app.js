// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');
const families = db.collection('families');

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
    if (signIn == true) {
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
    } else if (signIn == false) {
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
        console.log(firebaseUser);
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

function loadFamily() {
    if (!familyUID) {
        consts.famReg.classList.remove('hidden');
        consts.famCreate.addEventListener('click', loadFamUI);
        consts.famJoin.addEventListener('click', joinFamily);
    } else {
        consts.appPage.classList.remove('hidden');
        displayData();
    }
}


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

function loadFamUI() {
    console.log('create');
    consts.famSelectForm.classList.add('hidden');
    consts.famCreateForm.classList.remove('hidden');

    consts.createFamBtn.addEventListener('click', createFamily);
}

// function createFamily() {
//     let exists = true;

//     do {
//         familyUID = families.doc(createUUID());

//         families.doc().get().then((doc) => {
//             if (doc.exists) {
                
//             } else {
//                 families.doc(familyUID)
//             }
//         }).catch((error) => { // Catch any errors
//             console.log("Error getting document:", error);
//         });
//     } while (!exists);
// }

function joinFamily() {
    console.log('join');
}

function displayData() {
    console.log('display data');
}