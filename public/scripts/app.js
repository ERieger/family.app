// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');
const families = db.collection('families');

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

    console.log(uuid);

    return uuid;
}

function loadFamUI() {
    console.log('create');
    consts.famSelectForm.classList.add('hidden');
    consts.famCreateForm.classList.remove('hidden');

    consts.createFamBtn.addEventListener('click', createFamily);
}

function createFamily() {
    let familyName = consts.famNameIn.value;
    familyUID = createUUID();

    families.doc(familyUID).get().then((doc) => {
        if (doc.exists) {
            throw 'That user exists, please submit again.'
        } else {
            families.doc(familyUID).set({
                name: familyName,
                uuid: familyUID
            })
                .then(() => {
                    console.log("Document successfully written!");
                    users.doc(auth.currentUser.uid).set({ // Write to db
                        family: familyUID
                    }, {
                        merge: true
                    })
                        .then(() => { // If success
                            console.log("Document successfully written!");
                        })
                        .catch((error) => { // Catch errors
                            console.error("Error writing document: ", error);
                        });

                    consts.famReg.classList.add('hidden');
                    loadFamily();
                })
                .catch((error) => {
                    console.error("Error writing document: ", error);
                });
        }
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function joinFamily() {
    console.log('join');
}

function displayData() {
    console.log('display data');

    families.doc(familyUID).get().then((doc) => {
        console.log(doc.data());
        consts.headTitle.innerHTML = `The ${doc.data().name} Family`;

    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}