const Deck = require("./deck");
const Player = require("./player");

/**
 * Handles the entire game
 */
class Game {
    /**
     * Using an array of players, the game is created
     * @param {Array} players 
     */
    constructor(players) {
        this.deck = new Deck();
        const playersObj = this.initGame(players);
        // player ids mapped to their object
        this.players = playersObj.map;
        // array of player names and card count
        this.publicPlayers = playersObj.publicArr;
        // array of player ids in the order of how they were given
        this.playerIDs = playersObj.arr;
        // used to determine who the next player is, negative if we are going the other way
        this.turnFlow = 1;
        // randomizes who starts first
        this.turnIndex = Math.floor(Math.random() * players.length);
    }

    removePlayer(player) {
        const index = this.playerIDs.indexOf(player.id);
        const playerObj = this.players.get(player.id);
        if (index) {
            if (this.turnIndex === index) {
                this.turnIndex = this.getNextTurn();
            }
            this.players.delete(player.id);
            this.publicPlayers.splice(index, 1);
            this.playerIDs.splice(index, 1);
        }
        return {announce: `${playerObj.username} has left the game!`};
    }

    /**
     * Tries to catch players that didn't call "one done"
     */
    oneStun(playerChallenge) {
        let index = 0;
        for (let [key, player] of this.players) {
            console.log(player.cards.length + " " + !player.called + " " + index + " " + key)
            if (player.cards.length === 1 && !player.called) {
                for (let i = 0; i < 2; i++) {
                    player.cards.push(this.deck.getCard());
                    this.publicPlayers[index].cardCount++;
                }
                player.called = false;
                console.log("this works");
                return {announce: `${player.username} failed to call "one done" and was "one stunned" by ${playerChallenge.username}`};
            }
            index++;
        }
        console.log("why this running??/");
        return {message: "No player has one card left or has already been called!"}
    }

    oneDone(player) {
        const playerObj = this.players.get(player.id);
        console.log(playerObj);
        if (playerObj.cards.length === 1 && !playerObj.called) {
            playerObj.called = true;
            return {announce: `${playerObj.username} called "one done!"`}
        }
        return {message: "You do not have one card left or you have already called one done!"}

    }

    /**
     * Starts the game by giving each player their hand
     * @param {Array} players 
     */
    initGame(players) {
        const playersMap = new Map();
        const playerIDs = [];
        const publicArr = [];
        for (const player of players) {
            const newPlayer = new Player(player.username, player.id, this.deck.getHand());
            publicArr.push({ username: player.username, cardCount: newPlayer.cards.length });
            playersMap.set(player.id, newPlayer);
            playerIDs.push(player.id);
        }
        this.prevCard = this.deck.getCard();
        while (this.prevCard.color === "none") {
            this.prevCard = this.deck.getCard();
        }
        return { map: playersMap, arr: playerIDs, publicArr: publicArr };
    }

    /**
     * Handles the move of a player
     * @param {Object} player 
     * @param {Object} card 
     */
    makeMove(player, card) {
        // makes sure that right player is making the move
        if (this.playerIDs[this.turnIndex] !== player.id) {
            return { message: "It's not your turn right now!" };
        }

        // checks to see if the player actually has the card they are trying to use in their hand
        const playerCardIndex = this.hasCard(player, card);
        if (playerCardIndex !== -1) {
            const newColor = card.selectedColor;
            // if there is not a color, then it is a wild card, which can be used at any point in the game
            if (card.color === "none" && (newColor === "red" || newColor === "yellow" || newColor === "green" || newColor === "blue")) {
                this.removeCardFromHand(playerCardIndex, player);
                this.prevCard = card;
                this.publicPlayers[this.turnIndex].cardCount--;
                const gameStatus = this.isGameOver(this.publicPlayers[this.turnIndex].cardCount);
                if (gameStatus) {
                    return gameStatus;
                }
                // makes sure that the color selected is valid
                card.color = newColor;
                if (card.value === "draw_4") {
                    return this.draw4Handler(card);
                } else {
                    return this.wildCardHandler(card);
                }
                // a valid move is if the color of the previous card in the discarded pile is the same as the played card
                // or if the value of the card is the same
            } else if (card.color === this.prevCard.color || card.value === this.prevCard.value) {
                this.removeCardFromHand(playerCardIndex, player);
                this.publicPlayers[this.turnIndex].cardCount--;
                const gameStatus = this.isGameOver(this.publicPlayers[this.turnIndex].cardCount);
                if (gameStatus) {
                    return gameStatus;
                }
                this.prevCard = card;
                if (card.type === "number") {
                    return this.normalMoveHandler(card);
                } else {
                    switch (card.value) {
                        case "skip":
                            return this.skipHandler(card);
                        case "reverse":
                            return this.reverseHandler(card);
                        case "draw_2":
                            return this.draw2Handler(card);
                    }
                }
            } else {
                return { message: "Invalid move, please try again!" };
            }
        } else {
            return { message: "You do not have this card in your deck!" };
        }
    }

    isGameOver (cardCount) {
        if (cardCount === 0) {
            const playerObj = this.players.get(this.playerIDs[this.turnIndex]);
            return { gameOver: true, announce: `${playerObj.username} just won! Game over!` }
        }
    }

        /**
     * Handles if the player tries to make a move from their drawn card
     * @param {Object} player 
     * @param {Object} card 
     */
    tryToMakeMove(player, card) {
        // makes sure that right player is making the move
        if (this.playerIDs[this.turnIndex] !== player.id) {
            return { message: "It's not your turn right now!" };
        }

        // checks to see if the player actually has the card they are trying to use in their hand
        const playerCardIndex = this.hasCard(player, card);
        if (playerCardIndex !== -1) {
            const newColor = card.selectedColor;
            // if there is not a color, then it is a wild card, which can be used at any point in the game
            if (card.color === "none" && (newColor === "red" || newColor === "yellow" || newColor === "green" || newColor === "blue")) {
                this.removeCardFromHand(playerCardIndex, player);
                this.prevCard = card;
                this.publicPlayers[this.turnIndex].cardCount--;
                // makes sure that the color selected is valid
                card.color = newColor;
                if (card.value === "draw_4") {
                    return this.draw4Handler(card);
                } else {
                    return this.wildCardHandler(card);
                }
                // a valid move is if the color of the previous card in the discarded pile is the same as the played card
                // or if the value of the card is the same
            } else if (card.color === this.prevCard.color || card.value === this.prevCard.value) {
                this.removeCardFromHand(playerCardIndex, player);
                this.publicPlayers[this.turnIndex].cardCount--;
                this.prevCard = card;
                if (card.type === "number") {
                    return this.normalMoveHandler(card);
                } else {
                    switch (card.value) {
                        case "skip":
                            return this.skipHandler(card);
                        case "reverse":
                            return this.reverseHandler(card);
                        case "draw_2":
                            return this.draw2Handler(card);
                    }
                }
            } else {
                return this.notToPlay(player);
            }
        } else {
            return this.notToPlay(player);        
        }
    }

    /**
     * When a player deicides to draw a card
     * @param {Object} player 
     */
    drawCard(player) {
        // makes sure that right player is making the move
        if (this.playerIDs[this.turnIndex] !== player.id) {
            return { message: "It's not your turn right now!" };
        }
        const playerObj = this.players.get(player.id);
        // players need to call one done again if they get more than one card again!
        playerObj.called = false;
        playerObj.cards.push(this.deck.getCard());
        this.publicPlayers[this.turnIndex].cardCount++;
        return { local_action: { id: player.id, playerObj: playerObj }, announce: `${playerObj.username} drew a card!` };
    }

    notToPlay(player) {
        // makes sure that right player is making the move
        if (this.playerIDs[this.turnIndex] !== player.id) {
            return { message: "It's not your turn right now!" };
        }
        const playerObj = this.players.get(player.id);
        this.turnIndex = this.getNextTurn();
        const currentPlayer = this.players.get(this.playerIDs[this.turnIndex]);
        return {announce: `${playerObj.username} didn't play his drawn card, it's now ${currentPlayer.username}'s turn!` };
    }

    /**
     * Removes a card from a player's hand by the index
     * @param {Number} playerCardIndex 
     * @param {Object} player 
     */
    removeCardFromHand(playerCardIndex, player) {
        const playerObj = this.players.get(player.id);
        playerObj.cards.splice(playerCardIndex, 1);
    }

    /**
     * Handles the draw 2 move
     * @param {Object} card 
     */
    draw2Handler(card) {
        const prevPlayerObj = this.players.get(this.playerIDs[this.turnIndex])
        const nextTurnIndex = this.getNextTurn();
        const playerObj = this.players.get(this.playerIDs[nextTurnIndex]);
        for (let i = 0; i < 2; i++) {
            playerObj.cards.push(this.deck.getCard());
            this.publicPlayers[nextTurnIndex].cardCount++;
        }
        playerObj.called = false;
        // we skip the player who had to draw
        this.turnIndex = this.getNextTurn();
        this.turnIndex = this.getNextTurn();
        const currentPlayer = this.players.get(this.playerIDs[this.turnIndex]);
        return { card: card, turnIndex: this.turnIndex, local_action: { playerObj: playerObj }, announce: `${prevPlayerObj.username} played a draw 2 on ${playerObj.username}, it's now ${currentPlayer.username}'s turn!` };
    }

    /**
     * Handles the reverse move
     * @param {Object} card 
     */
    reverseHandler(card) {
        let nextTurnIndex = this.getNextTurn();
        let currentIndex = this.turnIndex;
        if (this.playerIDs.length > 2) {
            this.turnFlow = this.turnFlow * -1;
        } else {
            this.turnIndex = nextTurnIndex;
            nextTurnIndex = currentIndex;
        }
        const prevPlayerObj = this.players.get(this.playerIDs[currentIndex])
        const playerObj = this.players.get(this.playerIDs[nextTurnIndex]);
        return this.normalMoveHandler(card, `${prevPlayerObj.username} played a reverse card, it's now ${playerObj.username}'s turn!`);
    }

    /**
     * Handles the skip move
     * @param {Object} card 
     */
    skipHandler(card) {
        const prevPlayerObj = this.players.get(this.playerIDs[this.turnIndex])
        this.turnIndex = this.getNextTurn();
        const playerObj = this.players.get(this.playerIDs[this.turnIndex]);
        console.log(this.getNextTurn());
        const nextPlayerObj = this.players.get(this.playerIDs[this.getNextTurn()]);
        return this.normalMoveHandler(card, `${prevPlayerObj.username} played a skip card on ${playerObj.username}, it's now ${nextPlayerObj.username}'s turn!`);

    }

    /**
     * Handles a normal move
     * @param {Object} card 
     */
    normalMoveHandler(card, announce) {
        const prevPlayerObj = this.players.get(this.playerIDs[this.turnIndex])
        this.turnIndex = this.getNextTurn();
        const playerObj = this.players.get(this.playerIDs[this.turnIndex])
        return { card: card, turnIndex: this.turnIndex, announce: announce ? announce : `${prevPlayerObj.username} played a card, it's now ${playerObj.username}'s turn!` };
    }

    /**
     * Handles the draw 4 move
     * @param {Object} card 
     */
    draw4Handler(card) {
        const prevPlayerObj = this.players.get(this.playerIDs[this.turnIndex]);
        const nextTurnIndex = this.getNextTurn();
        const playerObj = this.players.get(this.playerIDs[nextTurnIndex]);
        for (let i = 0; i < 4; i++) {
            console.log("hello!");
            playerObj.cards.push(this.deck.getCard());
            this.publicPlayers[nextTurnIndex].cardCount++;
        }
        playerObj.called = false;
        this.turnIndex = this.getNextTurn();
        this.turnIndex = this.getNextTurn();
        const currentPlayer = this.players.get(this.playerIDs[this.turnIndex]);
        return { card: card, turnIndex: this.turnIndex, global_action: { newColor: card.color }, local_action: { id: this.playerIDs[nextTurnIndex], playerObj: playerObj }, announce: `${prevPlayerObj.username} played a draw 4 on ${playerObj.username} and changed the color to ${card.selectedColor}, it's now ${currentPlayer.username}'s turn!` };
    }

    /**
     * Handles the wild card move
     * @param {Object} card 
     */
    wildCardHandler(card) {
        const prevPlayerObj = this.players.get(this.playerIDs[this.turnIndex]);
        this.turnIndex = this.getNextTurn();
        const currentPlayer = this.players.get(this.playerIDs[this.turnIndex]);
        return { card: card, turnIndex: this.turnIndex, global_action: { newColor: card.color }, announce: `${prevPlayerObj.username} changed the color to ${card.selectedColor}, it's now ${currentPlayer.username}'s turn!` };
    }

    /**
     * Gets the next turn based on the turn flow and the turn index
     */
    getNextTurn() {
        let nextTurnIndex = this.turnIndex + this.turnFlow;
        // when the turn overflows it makes sure it circles back
        if (nextTurnIndex === -1) {
            nextTurnIndex = this.playerIDs.length - 1;
        } else if (nextTurnIndex === this.playerIDs.length) {
            nextTurnIndex = 0;
        }
        return nextTurnIndex;
    }

    /**
     * Makes sure that the user owns the card they are trying to play and returns that index
     * @param {Object} player 
     * @param {Object} card 
     */
    hasCard(player, card) {
        const playerObj = this.players.get(player.id);
        console.log(playerObj.cards);
        if (playerObj) {
            let i = 0;
            for (const checkCard of playerObj.cards) {
                console.log(`${card.cardID} ${checkCard.cardID}`)
                if (card.cardID === checkCard.cardID) {
                    return i;
                }
                i++;
            }
        }
        return -1;
    }
}

module.exports = Game;
