$(document).ready(() => {
    var database = firebase.database();
    var view = $('#playerList');

    setInterval(function () {
        view.empty();
        if (LOGGED_IN) {
            database.ref('/players').once('value').then(function (snapshot) {
                var loggedInUsers = snapshot.val();
                if (loggedInUsers === null) {
                    loggedInUsers = {};
                }
                LOGGED_IN_PLAYERS = loggedInUsers;

                for (prop in loggedInUsers) {
                    if (loggedInUsers[prop].uid != USER.uid) {
                        var timeDiff = moment().diff(moment(parseInt(loggedInUsers[prop].lastCheck)));
                        if (timeDiff < 5000) {
                            var listItem = $('<li class="list-group-item">');
                            listItem.text(loggedInUsers[prop].name);
                            if(!loggedInUsers[prop].inGame){
                                var challengeButton = $('<button class="challenge btn btn-outline-danger float-right" data-player="' + loggedInUsers[prop].uid + '">');
                                challengeButton.text("Challenge");
                                listItem.append(challengeButton);
                            }
                            view.append(listItem);
                        }else if(timeDiff < 10000){
                            var listItem = $('<li class="list-group-item list-group-item-warning">');
                            listItem.text(loggedInUsers[prop].name);
                            view.append(listItem);
                        }else if(timeDiff < 20000){
                            var listItem = $('<li class="list-group-item list-group-item-danger">');
                            listItem.text(loggedInUsers[prop].name);
                            view.append(listItem);
                        }
                    }
                }

                database.ref('/players/'+ USER.uid).set({
                    name: USER.name,
                    uid: USER.uid,
                    inGame: IN_GAME,
                    lastCheck: moment().valueOf()
                });
            });
        }
    }.bind(this), 5000);

});