var html5rocks = {};
window.indexedDB = window.indexedDB || window.webkitIndexedDB ||
window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
    window.IDBTransaction = window.webkitIDBTransaction;
    window.IDBKeyRange = window.webkitIDBKeyRange;
}

html5rocks.indexedDB = {};
html5rocks.indexedDB.db = null;

html5rocks.indexedDB.onerror = function (e) {
    console.log(e);
};

html5rocks.indexedDB.open = function () {
    var version = 1;
    var request = indexedDB.open("todos", version);

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function (e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = html5rocks.indexedDB.onerror;

        if (db.objectStoreNames.contains("todo")) {
            db.deleteObjectStore("todo");
        }

        var store = db.createObjectStore("todo",
            {keyPath: "timeStamp"});
    };

    request.onsuccess = function (e) {
        html5rocks.indexedDB.db = e.target.result;
        html5rocks.indexedDB.getAllTodoItems();
    };

    request.onerror = html5rocks.indexedDB.onerror;
};

html5rocks.indexedDB.addTodo = function (todoText) {
    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    for (var i = 0; i < 5000; i++) {
        var data = {
            "text": todoText + " " + String(i),
            "timeStamp": String(new Date().getTime()) + String(i)
        };
        var request = store.put(data);
    }

    request.onsuccess = function (e) {
        console.log(html5rocks.indexedDB.db.transaction(["todo"], "readwrite").objectStore("todo"));
        html5rocks.indexedDB.getAllTodoItems();
    };

    request.onerror = function (e) {
        console.log("Error Adding: ", e);
    };
};

html5rocks.indexedDB.deleteTodo = function (id) {
    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    var request = store.delete(id);

    request.onsuccess = function (e) {
        html5rocks.indexedDB.getAllTodoItems();
    };

    request.onerror = function (e) {
        console.log("Error Adding: ", e);
    };
};

html5rocks.indexedDB.getAllTodoItems = function () {
    var todos = document.getElementById("todoItems");
    todos.innerHTML = "";

    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    var storeSize = 0;
    cursorRequest.onsuccess = function (e) {
        var result = e.target.result;
        if (!!result == false) {
            storeSize = storeSize / (1024 * 1024);
            document.getElementById("size").innerHTML = "<h2>DB Size = " + storeSize + " MBs </h2>";
            return;

        }
        renderTodo(result.value);
        storeSize = storeSize + getByteLen(result.value.text) + getByteLen(result.value.timeStamp);
        result.continue();
    };

    cursorRequest.onerror = html5rocks.indexedDB.onerror;
};

function renderTodo(row) {
    var todos = document.getElementById("todoItems");
    var li = document.createElement("li");
    var a = document.createElement("a");
    var t = document.createTextNode(row.text);

    a.addEventListener("click", function () {
        html5rocks.indexedDB.deleteTodo(row.timeStamp);
    }, false);

    a.href = "#";
    a.textContent = " [Delete]";
    li.appendChild(t);
    li.appendChild(a);
    todos.appendChild(li);
}

function getByteLen(normal_val) {
    // Force string type
    normal_val = String(normal_val);

    var byteLen = 0;
    for (var i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen += c < (1 << 7) ? 1 :
            c < (1 << 11) ? 2 :
                c < (1 << 16) ? 3 :
                    c < (1 << 21) ? 4 :
                        c < (1 << 26) ? 5 :
                            c < (1 << 31) ? 6 : Number.NaN;
    }
    return byteLen;
}

function addTodo() {
    var todo = document.getElementById("todo");
    html5rocks.indexedDB.addTodo(todo.value);
    todo.value = "";
}

function init() {
    html5rocks.indexedDB.open();
}

window.addEventListener("DOMContentLoaded", init, false);