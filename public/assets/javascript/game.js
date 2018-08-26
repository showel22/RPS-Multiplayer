$(document).ready(() => {
    var view = $('#game');
    var database = firebase.database();

    $(document).on('click', '.challenge', function () {
        var playerUID = $(this).attr('data-player');
        database.ref('/challenges/' + playerUID + '/' + USER.uid).set({
            challenger: USER.uid,
            challenegerName: USER.name,
            timestamp: moment().valueOf()
        });

    });

    $(document).on('click', '.acceptChallenge', function () {
        IN_GAME = true;
        var challengerID = $(this).attr('data-challenger');
        var gameId = firebase.database().ref().child('games').push().key;
        CURRENT_GAME = gameId;

        database.ref('/challenges/' + USER.uid + '/' + challengerID).remove();

        database.ref('/acceptedGames/' + challengerID).set({
            game: gameId,
            timestamp: moment().valueOf()
        });

        database.ref('/games/' + gameId).set({
            playerOne: USER.uid,
            playerTwo: challengerID,
            playerOneReady: true,
            gameStart: moment().valueOf()
        });

        showGame();
    });

    $(document).on('click', '.rock', function () {
        var player = $(this).attr('data-player');
        var round = $(this).attr('data-round');
        var gameUpdate = {};
        gameUpdate[player + round] = "rock";
        database.ref('/games/' + CURRENT_GAME).update(gameUpdate);
    });

    $(document).on('click', '.paper', function () {
        var player = $(this).attr('data-player');
        var round = $(this).attr('data-round');
        var gameUpdate = {};
        gameUpdate[player + round] = "paper";
        database.ref('/games/' + CURRENT_GAME).update(gameUpdate);
    });

    $(document).on('click', '.scissors', function () {
        var player = $(this).attr('data-player');
        var round = $(this).attr('data-round');
        var gameUpdate = {};
        gameUpdate[player + round] = "scissors";
        database.ref('/games/' + CURRENT_GAME).update(gameUpdate);
    });

    setInterval(function () {
        database.ref('/challenges/' + USER.uid).once('value').then(function (snapshot) {
            var sv = snapshot.val();
            var challengesList = $('#challengesList');
            challengesList.empty();

            for (prop in sv) {
                // Only show challenges from players who are active.
                if (moment().diff(moment(parseInt(LOGGED_IN_PLAYERS[sv[prop].challenger].lastCheck))) < 20000) {
                    var item = $('<li class="list-group-item">');
                    item.text('Challenge from ' + sv[prop].challenegerName);
                    var challengeButton = $('<button class="acceptChallenge btn btn-outline-danger float-right">');
                    challengeButton.attr('data-challenger', sv[prop].challenger);
                    challengeButton.text("Accept");
                    item.append(challengeButton);
                    challengesList.append(item);
                }
            }

        });

        database.ref('/acceptedGames/' + USER.uid).once('value').then(function (snapshot) {
            var sv = snapshot.val();
            if (sv != null) {

                if (moment().diff(moment(parseInt(sv.timestamp))) < 120000) {
                    CURRENT_GAME = sv.game
                }

                if (CURRENT_GAME) {
                    database.ref('/games/' + CURRENT_GAME).update({
                        playerTwoReady: 'true'
                    });
                    showGame();
                }
            }

        });
    }.bind(this), 5000);


    function showGame() {
        database.ref('/games/' + CURRENT_GAME).on('value', function (snapshot) {
            var sv = snapshot.val();
            var player;

            if (sv.playerOne === USER.uid) {
                player = "playerOne";
            } else {
                player = "playerTwo";
            }

            if (sv.playerOneReady && !sv.playerTwoReady) {
                view.empty();
                var message = $('<h3 class="col-12">');
                message.text('Waiting for challenger...');
                view.append(message);
            } else if (sv.playerOneReady && sv.playerTwoReady && !sv.playerOneRoundOne && !sv.playerTwoRoundOne) {
                view.empty();
                var messageRow = $('<div class="row">');
                var message = $('<h3 class="col-12">');
                message.text('Choose your move:');
                messageRow.append(message);
                var pickRow = $('<div class="row">');
                var rock = $('<button class="rock btn btn-primary col-4">');
                rock.attr('data-player', player);
                rock.attr('data-round', "RoundOne");
                rock.text('Rock');
                pickRow.append(rock);
                var paper = $('<button class="paper btn btn-primary col-4">');
                paper.attr('data-player', player);
                paper.attr('data-round', "RoundOne");
                paper.text('Paper');
                pickRow.append(paper);
                var scissors = $('<button class="scissors btn btn-primary col-4">');
                scissors.attr('data-player', player);
                scissors.attr('data-round', "RoundOne");
                scissors.text('Scissors');
                pickRow.append(scissors);
                view.append(messageRow);
                view.append(pickRow);
                database.ref('/games/' + CURRENT_GAME).update({
                    round: "one"
                });
            } else if (sv.round === "one") {
                var roundResult;

                if (sv.playerOneRoundOne === 'rock') {
                    if (sv.playerTwoRoundOne === "rock") {
                        roundResult = "draw";
                    } else if (sv.playerTwoRoundOne === "paper") {
                        roundResult = sv.playerTwo;
                    } else if (sv.playerTwoRoundOne === "scissors") {
                        roundResult = sv.playerTwo;
                    }
                } else if (sv.playerOneRoundOne === 'paper') {
                    if (sv.playerTwoRoundOne === "rock") {
                        roundResult = sv.playerOne;
                    } else if (sv.playerTwoRoundOne === "paper") {
                        roundResult = "draw";
                    } else if (sv.playerTwoRoundOne === "scissors") {
                        roundResult = sv.playerTwo;
                    }
                } else if (sv.playerOneRoundOne === 'scissors') {
                    if (sv.playerTwoRoundOne === "rock") {
                        roundResult = sv.playerTwo;
                    } else if (sv.playerTwoRoundOne === "paper") {
                        roundResult = sv.playerOne;
                    } else if (sv.playerTwoRoundOne === "scissors") {
                        roundResult = "draw";
                    }
                }

                var update = {};
                if (roundResult === "draw") {
                    update.playerOneRoundOne = null;
                    update.playerTwoRoundOne = null;
                } else if (roundResult == null) {
                    return;
                } else {
                    if (sv[roundResult + "Wins"] == null) {
                        update[roundResult + "Wins"] = 1;
                    } else {
                        update[roundResult + "Wins"] = sv[roundResult + "Wins"] + 1;
                    }
                    update.round = "two";
                }

                database.ref('/games/' + CURRENT_GAME).update(update);
            } else if (!sv.playerOneRoundTwo && !sv.playerTwoRoundTwo) {
                view.empty();
                var messageRow = $('<div class="row">');
                var message = $('<h3 class="col-12">');
                message.text('Choose your move:');
                messageRow.append(message);
                var pickRow = $('<div class="row">');
                var rock = $('<button class="rock btn btn-primary col-4">');
                rock.attr('data-player', player);
                rock.attr('data-round', "RoundTwo");
                rock.text('Rock');
                pickRow.append(rock);
                var paper = $('<button class="paper btn btn-primary col-4">');
                paper.attr('data-player', player);
                paper.attr('data-round', "RoundTwo");
                paper.text('Paper');
                pickRow.append(paper);
                var scissors = $('<button class="scissors btn btn-primary col-4">');
                scissors.attr('data-player', player);
                scissors.attr('data-round', "RoundTwo");
                scissors.text('Scissors');
                pickRow.append(scissors);
                view.append(messageRow);
                view.append(pickRow);
                database.ref('/games/' + CURRENT_GAME).update({
                    round: "Two"
                });
            } else if (sv.round === "two") {
                var roundResult;

                if (sv.playerOneRoundTwo === 'rock') {
                    if (sv.playerTwoRoundTwo === "rock") {
                        roundResult = "draw";
                    } else if (sv.playerTwoRoundTwo === "paper") {
                        roundResult = sv.playerTwo;
                    } else if (sv.playerTwoRoundTwo === "scissors") {
                        roundResult = sv.playerTwo;
                    }
                } else if (sv.playerOneRoundTwo === 'paper') {
                    if (sv.playerTwoRoundTwo === "rock") {
                        roundResult = sv.playerOne;
                    } else if (sv.playerTwoRoundTwo === "paper") {
                        roundResult = "draw";
                    } else if (sv.playerTwoRoundTwo === "scissors") {
                        roundResult = sv.playerTwo;
                    }
                } else if (sv.playerOneRoundTwo === 'scissors') {
                    if (sv.playerTwoRoundOne === "rock") {
                        roundResult = sv.playerTwo;
                    } else if (sv.playerTwoRoundTwo === "paper") {
                        roundResult = sv.playerOne;
                    } else if (sv.playerTwoRoundTwo === "scissors") {
                        roundResult = "draw";
                    }
                }

                var update = {};
                if (roundResult === "draw") {
                    update.playerOneRoundTwo = null;
                    update.playerTwoRoundTwo = null;
                } else if (roundResult == null) {
                    return;
                } else {
                    if (sv[roundResult + "Wins"] == null) {
                        update[roundResult + "Wins"] = 1;
                    } else {
                        update[roundResult + "Wins"] = sv[roundResult + "Wins"] + 1;
                    }
                    update.round = "two";
                }

                database.ref('/games/' + CURRENT_GAME).update(update);
            } else if (!sv.playerOneRoundThree && !sv.playerTwoRoundThree) {
                view.empty();
                var messageRow = $('<div class="row">');
                var message = $('<h3 class="col-12">');
                message.text('Choose your move:');
                messageRow.append(message);
                var pickRow = $('<div class="row">');
                var rock = $('<button class="rock btn btn-primary col-4">');
                rock.attr('data-player', player);
                rock.attr('data-round', "RoundThree");
                rock.text('Rock');
                pickRow.append(rock);
                var paper = $('<button class="paper btn btn-primary col-4">');
                paper.attr('data-player', player);
                paper.attr('data-round', "RoundThree");
                paper.text('Paper');
                pickRow.append(paper);
                var scissors = $('<button class="scissors btn btn-primary col-4">');
                scissors.attr('data-player', player);
                scissors.attr('data-round', "RoundThree");
                scissors.text('Scissors');
                pickRow.append(scissors);
                view.append(messageRow);
                view.append(pickRow);
                database.ref('/games/' + CURRENT_GAME).update({
                    round: "Three"
                });
            } else if (sv.round === "three") {
                var roundResult;

                if (sv.playerOneRoundThree === 'rock') {
                    if (sv.playerTwoRoundThree === "rock") {
                        roundResult = "draw";
                    } else if (sv.playerTwoRoundThree === "paper") {
                        roundResult = sv.playerTwo;
                    } else if (sv.playerTwoRoundThree === "scissors") {
                        roundResult = sv.playerTwo;
                    }
                } else if (sv.playerOneRoundThree === 'paper') {
                    if (sv.playerTwoRoundThree === "rock") {
                        roundResult = sv.playerOne;
                    } else if (sv.playerTwoRoundThree === "paper") {
                        roundResult = "draw";
                    } else if (sv.playerTwoRoundThree === "scissors") {
                        roundResult = sv.playerTwo;
                    }
                } else if (sv.playerOneRoundThree === 'scissors') {
                    if (sv.playerTwoRoundThree === "rock") {
                        roundResult = sv.playerTwo;
                    } else if (sv.playerTwoRoundThree === "paper") {
                        roundResult = sv.playerOne;
                    } else if (sv.playerTwoRoundThree === "scissors") {
                        roundResult = "draw";
                    }
                }

                var update = {};
                if (roundResult === "draw") {
                    update.playerOneRoundThree = null;
                    update.playerTwoRoundThree = null;
                } else if (roundResult == null) {
                    return;
                } else {
                    if (sv[roundResult + "Wins"] == null) {
                        update[roundResult + "Wins"] = 1;
                    } else {
                        update[roundResult + "Wins"] = sv[roundResult + "Wins"] + 1;
                    }
                    update.round = "final";
                }

                database.ref('/games/' + CURRENT_GAME).update(update);
            } else if (sv.round === "final") {

                var winnerId, winner;
                if (sv[sv.playerOne + "Wins"] > sv[sv.playerTwo + "Wins"]) {
                    winnerId = sv.playerOne;
                } else {
                    winnerId = sv.playerTwo;
                }

                if (winnerId === USER.uid) {
                    winner = "you."
                } else {
                    winner = "your opponent."
                }

                view.empty();
                var message = $('<h3 class="col-12">');
                message.text('The winner is... ' + winner);
                view.append(message);
                database.ref('/games/' + CURRENT_GAME).update({
                    winner: winnerId,
                    round: "gameOver"
                });

                database.ref('/stats/' + USER.uid).once('value').then(function (snapshot) {
                    var sv = snapshot.val();
                    if (sv != null) {

                        var totalGames = sv.totalGames || 0;
                        var wins = sv.wins || 0;
                        var loses = sv.loses || 0;

                        totalGames++;
                        
                        if(winnerId === USER.uid){
                            wins++;
                        }else{
                            loses++;
                        }

                        if (CURRENT_GAME) {
                            database.ref('/stats/' + USER.uid).update({
                                wins: wins,
                                loses: loses,
                                totalGames: totalGames
                            });
                            showGame();
                        }
                    }

                });

            } else if (round === "gameOver") {
                view.empty();
                return;
            }
        });
    }
});