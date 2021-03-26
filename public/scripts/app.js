// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');
const families = db.collection('families');

let username;

consts.todoAddBtn.addEventListener('click', createTodoItem);

function loadFamily() {
    if (!familyUID) {
        consts.famReg.classList.remove('hidden');
        consts.famCreate.addEventListener('click', loadFamUI);
        consts.famJoin.addEventListener('click', joinFamily);
    } else {
        consts.appPage.classList.remove('hidden');
        users.doc(auth.currentUser.uid).get().then((doc) => {
            username = doc.data().username;
        })
            .catch((error) => { // Catch errors
                console.error("Error: ", error);
            });

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
                            families.doc(familyUID).update({ // Write to db
                                members: firebase.firestore.FieldValue.arrayUnion(username)
                            })
                                .then(() => { // If success
                                    console.log("Document successfully written!");
                                })
                                .catch((error) => { // Catch errors
                                    console.error("Error writing document: ", error);
                                });
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
    let data;

    families.doc(familyUID).get().then((doc) => {
        console.log(doc.data());
        data = doc.data();
        consts.headTitle.innerHTML = `The ${doc.data().name} Family`;
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function createTodoItem() {
    consts.todoInput.classList.remove('hidden');
    families.doc(familyUID).get().then((doc) => {
        console.log(doc.data().members, doc.data().members.length);
        console.log('about to for');

        while (consts.inputIcons.firstChild) {
            node.removeChild(myNode.firstChild);
        }

        for (let i = 0; i < doc.data().members.length; i++) {
            console.log('foring');
            let item = {
                parent: document.createElement('div'),
                child: document.createElement('p'),
                childId: `icon-${i}`
            }

            let member = doc.data().members[i];
            let id = member.substring(0, 2).toUpperCase();
            console.log(member, id);

            item.parent.classList.add('createIcon');
            item.parent.classList.add('--not-selected');
            item.child.setAttribute('id', item.childId);
            item.parent.appendChild(item.child);
            consts.inputIcons.appendChild(item.parent);
            document.querySelector(`#${item.childId}`).innerHTML = id;
        }
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function addUserToTask(elem) {
    console.log(elem);
}

// let elements = {
//     parent: document.createElement('div'),
//     taskTitle: document.createElement('p'),
//     taskDue: document.createElement('p'),
// }