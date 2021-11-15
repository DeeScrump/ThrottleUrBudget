const request = window.indexedDB.open("budget", 1);
let db;

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("waitForIt", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;

    // This will check if we are online before grabbing db info posted
    if(navigator.onLine) {
        dbCheck();
    }
};

// If error, let user know
request.onerror = (e) => {
    console.log(`Doh! ${e.target.errorCode}`);
};

function dbCheck() {
    let transaction = db.transaction(["waitForIt"], "readwrite");
    let track = transaction.objectStore("waitForIt");

    let data = track.getAll();

    data.onsuccess = function() {
        // check that data is not empty and grab it and post it, then remove from cache
        if(data.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(data.result),
                headers: {
                    "Content-Type":"application/json"
                }
            })
            .then(response => {
                return response.json();
            })
            .then(() => {
                let transaction = db.transaction(["waitForIt"], "readwrite");
                let track = transaction.objectStore("waitForIt");

                track.clear();
            });
        }
    };
}

function saveIt(data) {
    let transaction = db.transaction(["waitForIt"], "readwrite");
    const track = transaction.objectStore("waitForIt");

    track.add(data);
}

// Checking for online status
window.addEventListener("online", dbCheck);