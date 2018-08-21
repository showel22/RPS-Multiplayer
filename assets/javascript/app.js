 var config = {
    apiKey: "AIzaSyD2npkHSlclbzRHyoi9c5uuTSiU1N8jE04",
    authDomain: "rps-multiplayer-57efc.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-57efc.firebaseio.com",
    projectId: "rps-multiplayer-57efc",
    storageBucket: "rps-multiplayer-57efc.appspot.com",
    messagingSenderId: "319118141942"
};
firebase.initializeApp(config);
var database = firebase.database();
var authentication = firebase.auth();
var googleProvider = new firebase.auth.GoogleAuthProvider();

$(document).ready(() => {
    $('#googleSignIn').click(function(){
        authentication.signInWithRedirect(googleProvider);

        authentication.getRedirectResult().then(function(result){
        if(result.credential) {
            var token = result.credential.accessToken;
        }

        var user = result.user
        $('#user').text(result.user);
        }).catch(function(error){
            var errorCode = error.code;
            var errorMessage = error.message;

            var email = error.email;

            var credential = error.credential;
        });
    });

    $('#signOut').click(function(){
        firebase.auth().signOut().then(function() {
        // Sign-out successful.
        }).catch(function(error) {
        // An error happened.
        });
    });
}); 
