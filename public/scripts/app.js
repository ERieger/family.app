// Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

const users = db.collection('users');
const families = db.collection('families');

let username;

let task = {
    name: undefined,
    date: undefined,
    members: []
}

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
    families.doc(familyUID).get().then((doc) => {
        console.log(doc.data());
        data = doc.data();
        consts.headTitle.innerHTML = `The ${doc.data().name} Family`;
        getTodo();
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function createTodoItem() {
    let member;
    consts.todoInput.classList.remove('hidden');
    families.doc(familyUID).get().then((doc) => {
        console.log(doc.data().members, doc.data().members.length);
        console.log('about to for');

        while (consts.inputIcons.firstChild) {
            node.removeChild(myNode.firstChild);
        }

        for (let i = 0; i < doc.data().members.length; i++) {
            let item = {
                parent: document.createElement('div'),
                child: document.createElement('p'),
                childId: `icon-${i}`
            }

            member = doc.data().members[i];
            let id = member.substring(0, 2).toUpperCase();

            item.parent.classList.add('icon', 'icon-button', '--not-selected');
            item.child.setAttribute('id', item.childId);
            item.parent.appendChild(item.child);
            item.parent.setAttribute('data-name', member);
            consts.inputIcons.appendChild(item.parent);
            document.querySelector(`#${item.childId}`).innerHTML = id;
        }

        let buttons = document.getElementsByClassName('icon-button');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', function () {
                addUserToTask(this, buttons[i].getAttribute('data-name'));
            });
        }
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function addUserToTask(elem, name) {
    let colour = 'red';

    if (elem.classList.contains('--not-selected')) {
        elem.classList = '';
        elem.classList.add('icon', 'icon-button', `--${colour}`);
        task.members.push(name);
    } else {
        elem.classList = '';
        elem.classList.add('icon', 'icon-button', '--not-selected');
        for (let i = 0; i < task.members.length; i++) {
            if (task.members[i] == name) {
                task.members.splice(i, 1);
                break;
            }
        }
    }

    console.log(task);
}

function addTask() {
    task.name = consts.todoTask.value;
    task.date = consts.todoDateTime.value;

    families.doc(familyUID).collection('todo').doc().set({
        name: task.name,
        date: task.date,
        members: task.members
    }).then(() => { // If success
        console.log("Document successfully written!");
        task = {
            name: undefined,
            date: undefined,
            members: []
        }
    })
        .catch((error) => { // Catch errors
            console.error("Error writing document: ", error);
        });

    consts.todoInput.classList.add('hidden');
}

families.doc(familyUID).collection('todo').onSnapshot((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log('new');
        updateTodo(doc);
    })
});

function getTodo() {
    families.doc(familyUID).collection('todo').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            updateTodo(doc);
        });
    }).catch((error) => { // Catch any errors
        console.log("Error:", error);
    });
}

function updateTodo(doc) {
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
    elements.check.classList.add('item__check');
    elements.icons.classList.add('item__icons');

    elements.taskTitle.innerHTML = doc.data().name;
    elements.taskDue.innerHTML = `Due: ${doc.data().date}`;

    elements.parent.appendChild(elements.taskTitle);
    elements.parent.appendChild(elements.taskDue);
    elements.parent.appendChild(elements.check);
    elements.parent.appendChild(elements.icons);


    let colour = 'red';

    for (let i = 0; i < doc.data().members.length; i++) {
        let item = {
            parent: document.createElement('div'),
            child: document.createElement('p')
        }

        member = doc.data().members[i];
        let id = member.substring(0, 2).toUpperCase();

        item.parent.classList.add('icon', `--${colour}`);
        item.child.innerHTML = id;
        item.parent.appendChild(item.child);
        elements.icons.appendChild(item.parent);
    }


    consts.list.appendChild(elements.parent);
}
