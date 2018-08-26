 var config = {
    apiKey: "AIzaSyD2npkHSlclbzRHyoi9c5uuTSiU1N8jE04",
    authDomain: "rps-multiplayer-57efc.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-57efc.firebaseio.com",
    projectId: "rps-multiplayer-57efc",
    storageBucket: "rps-multiplayer-57efc.appspot.com",
    messagingSenderId: "319118141942"
};
firebase.initializeApp(config);

// Global Variables for whole app
var LOGGED_IN = false;
var IN_GAME = false;
var CURRENT_GAME = '';
var LOGGED_IN_PLAYERS = {};
var USER;

// Test Data
LOGGED_IN = true;
USER = {
    name: 'Steven Howell',
    email: 'schyoyo@gmail.com',
    photoUrl: 'https://lh6.googleusercontent.com/-FcMjZM1Q0co/AAAAAAAAAAI/AAAAAAAABN4/l6C7x3_tFDI/photo.jpg',
    emailVerified: true,
    uid: 'syGrikJ6w5OzYFLWdI66Tz5h4Kh1'
};