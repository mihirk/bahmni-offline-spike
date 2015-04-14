var db;
var version = 1;

window.indexedStore = {};
function getByteLen(normal_val) {
    // Force string type
    normal_val = String(normal_val);

    var byteLen = 0;
    for (var i = 0; i < normal_val.length; i++) {
        var c = normal_val.charCodeAt(i);
        byteLen += c < (1 <<  7) ? 1 :
                   c < (1 << 11) ? 2 :
                   c < (1 << 16) ? 3 :
                   c < (1 << 21) ? 4 :
                   c < (1 << 26) ? 5 :
                   c < (1 << 31) ? 6 : Number.NaN;
    }
    return byteLen;
}

window.indexedStore.setup = function(handler) {
  // attempt to open the database
  var request = indexedDB.open("geomood", version);

  // upgrade/create the database if needed
  request.onupgradeneeded = function(event) {
    var db = request.result;
    if (event.oldVersion < 1) {
      // Version 1 is the first version of the database.
      var checkinsStore = db.createObjectStore("HELLO WORLD", { keyPath: "time" });
      var total = 0;
      for (var i=0; i<1000; i++){
        var some="HELLO WORLD - " + String(i);
        db.createObjectStore(some, { keyPath: "time" });
        total = total + getByteLen(some);
      }
      console.log("HERE Created");
      console.log(total);
      checkinsStore.createIndex("moodIndex", "mood", { unique: false });
    }
    if (event.oldVersion < 2) {
      // In future versions we'd upgrade our database here.
      // This will never run here, because we're version 1.
    }
    db = request.result;
  };

  request.onsuccess = function(ev) {
    // assign the database for access outside
    db = request.result;
    console.log(db);
    console.log("HERE Success");
    handler();
    db.onerror = function(ev) {
      console.log("db error", arguments);
    };
  };
};

window.indexedStore.setup();