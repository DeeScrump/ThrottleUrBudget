const request = window.indexedDB.open("budget", 1);
let db;

request.onupgradeneeded = ({ e }) => {
    let db = e.result;
    db.createObjectStore("waitForIt", { autoIncrement: true });
};

request.onsuccess = ({ e }) => {
    db = e.result;

    // This will check if we are online before grabbing db info posted
    if(navigator.onLine) {
        dbCheck();
    }
};

// If error, let user know
request.onerror = (e) => {
    console.log(`Doh! ${e.target.errorCode}`);
};
