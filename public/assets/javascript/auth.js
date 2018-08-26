var authentication = firebase.auth();
var googleProvider = new firebase.auth.GoogleAuthProvider();

$(document).ready(() => {
    $('#googleSignIn').click(function () {
        authentication.signInWithPopup(googleProvider).then(function (result) {
            LOGGED_IN = true;
            // Set the User
            var user = firebase.auth().currentUser;
            USER = {
                name: user.displayName,
                email: user.email,
                photoUrl: user.photoURL,
                emailVerified: user.emailVerified,
                uid: user.uid
            };
            $('#user').text(USER.name);
        }).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            console.error(errorMessage);
        });
    });

    $('#signOut').click(function () {
        firebase.auth().signOut().then(function () {
            LOGGED_IN = false;
            // Sign-out successful.
            console.log("Signed Out");
        }).catch(function (error) {
            // An error happened.
            console.error("Error on Sign Out");
        });
    });
}); 