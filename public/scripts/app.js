// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const users = db.collection('users');
const families = db.collection('families');
const storageRef = storage.ref();

let username;
let taskMembers = [];
let itemCount = 0;

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
        }).catch((error) => { // Catch errors
            console.error("Error: ", error);
        });

        while (consts.list.childNodes.length > 2) {
            consts.list.removeChild(consts.list.lastChild);
        }

        families.doc(familyUID).collection('todo').onSnapshot((querySnapshot) => {
            while (consts.list.childNodes.length > 2) {
                consts.list.removeChild(consts.list.lastChild);
            }

            itemCount = 0;

            updateIcon();

            querySnapshot.forEach((doc) => {
                itemCount++;
                consts.todoCount.innerHTML = itemCount;

                updateTodo(doc);
            });
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
                            families.doc(familyUID).collection('members').doc(auth.currentUser.uid).set({ // Write to db
                                username: username,
                                uid: auth.currentUser.uid,
                                colour: 'red'

                            })
                                .then(() => { // If success
                                    console.log("Document successfully written!");
                                    consts.famReg.classList.add('hidden');
                                    loadFamily();
                                })
                                .catch((error) => { // Catch errors
                                    console.error("Error writing document: ", error);
                                });
                        })
                        .catch((error) => { // Catch errors
                            console.error("Error writing document: ", error);
                        });
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
    families.doc(familyUID).get().then((doc) => {
        data = doc.data();
        consts.headTitle.innerHTML = `The ${doc.data().name} Family`;
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function createTodoItem() {
    let member;
    consts.todoInput.classList.remove('hidden');

    while (consts.inputIcons.firstChild) {
        consts.inputIcons.removeChild(consts.inputIcons.firstChild);
    }

    families.doc(familyUID).collection('members').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let item = {
                parent: document.createElement('div'),
                child: document.createElement('p'),
            }

            member = doc.data().username;
            let id = member.substring(0, 2).toUpperCase();


            item.parent.classList.add('icon', 'icon-button', '--not-selected');
            item.child.setAttribute('id', item.childId);
            item.parent.appendChild(item.child);
            item.child.innerHTML = id;
            item.parent.addEventListener('click', function () {
                addUserToTask(this, doc.data().uid);
            });
            consts.inputIcons.appendChild(item.parent);
        })
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function addUserToTask(elem, uid) {
    let colour;

    families.doc(familyUID).collection('members').doc(uid).get().then((doc) => {
        colour = doc.data().colour;

        if (elem.classList.contains('--not-selected')) {
            elem.classList = '';
            elem.classList.add('icon', 'icon-button', `--${colour}`);
            taskMembers.push(uid);
        } else {
            elem.classList = '';
            elem.classList.add('icon', 'icon-button', '--not-selected');
            for (let i = 0; i < taskMembers.length; i++) {
                if (taskMembers[i] == uid) {
                    taskMembers.splice(i, 1);
                    break;
                }
            }
        }
    }).catch((error) => {
        console.log("Error:", error);
    });
}

function addTask() {
    let name = consts.todoTask.value;
    let date = consts.todoDate.value;
    let time = consts.todoTime.value;

    families.doc(familyUID).collection('todo').doc().set({
        name: name,
        date: date,
        time: time,
        members: taskMembers
    }).then(() => { // If success
        console.log("Document successfully written!");
        taskMembers = [];
    })
        .catch((error) => { // Catch errors
            console.error("Error writing document: ", error);
        });

    consts.todoInput.classList.add('hidden');
}


function updateTodo(doc) {
    let member;

    let elements = {
        parent: document.createElement('div'),
        taskTitle: document.createElement('p'),
        taskDue: document.createElement('p'),
        check: document.createElement('div'),
        icons: document.createElement('div')
    }

    elements.parent.classList.add('item');
    elements.taskTitle.classList.add('item__task');
    elements.taskDue.classList.add('item__due');
    elements.check.classList.add('item__check', 'incomplete');
    elements.icons.classList.add('item__icons');

    elements.taskTitle.innerHTML = doc.data().name;
    elements.taskDue.innerHTML = `Due: ${doc.data().date} at ${doc.data().time}`;

    elements.check.addEventListener('click', () => {
        completeTask(elements.check, doc.id);
    });

    elements.parent.appendChild(elements.taskTitle);
    elements.parent.appendChild(elements.taskDue);
    elements.parent.appendChild(elements.check);
    elements.parent.appendChild(elements.icons);

    let colour;

    for (let i = 0; i < doc.data().members.length; i++) {
        families.doc(familyUID).collection('members').doc(doc.data().members[i]).get().then((doc) => {
            colour = doc.data().colour;

            let item = {
                parent: document.createElement('div'),
                child: document.createElement('p')
            }

            member = doc.data().username;
            let id = member.substring(0, 2).toUpperCase();

            item.parent.classList.add('icon', `--${colour}`);
            item.child.innerHTML = id;
            item.parent.appendChild(item.child);
            elements.icons.appendChild(item.parent);
        });
    }

    consts.list.appendChild(elements.parent);
}

function updateIcon() {
    if (itemCount >= 1) {
        consts.status.setAttribute('class', 'todo__status --meh');
    } else if (itemCount < 1) {
        consts.status.setAttribute('class', 'todo__status --ok');
    }
}

function completeTask(elem, id) {
    itemCount--;
    elem.classList.remove('incomplete');
    elem.classList.add('complete');
    families.doc(familyUID).collection('todo').doc(id).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}

function upload() {
    let file = consts.file.files[0];
    let filePathRef = storageRef.ref(`${familyUID}/${file.name}`);

    filePathRef.put(file).then((snapshot) => {
        console.log('Uploaded a blob or file!', snapshot);
    });

    families.doc(familyUID).collection('files').doc().set({
        name: file.name,
        filePath: filePathRef
    }).catch((error) => {
        console.error('Error writing document', error);
    })
}