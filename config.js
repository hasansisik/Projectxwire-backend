const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");

const firebaseConfig = {
  apiKey: "AIzaSyApSZwPwPS3U3ydssq7B1vh8nK-BVh_f64",
  authDomain: "planwire-9e539.firebaseapp.com",
  projectId: "planwire-9e539",
  storageBucket: "planwire-9e539.appspot.com",
  messagingSenderId: "982181421524",
  appId: "1:982181421524:web:f2654764525f24b7e93641",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = { storage };