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
        // array of player ids in the order of how they were given
        this.playerIDs = playersObj.arr;
        // used to determine who the next player is, negative if we are going the other way
        this.turnFlow = 1;
        // randomizes who starts first
        this.turnIndex = Math.floor(Math.random() * players.length);
    }

    /**
     * Starts the game by giving each player their hand
     * @param {Array} players 
     */
    initGame(players) {
        const playersMap = new Map();
        const playerIDs = [];
        for (const player of players) {
            playersMap.set(player.id, new Player(player.username, player.id, this.deck.getHand()));
            playerIDs.push(player.id);
        }
        this.prevCard = this.deck.getCard();
        return { map: playersMap, arr: playerIDs };
    }

    /**
     * Handles the move of a player
     * @param {Object} player 
     * @param {Object} card 
     */
    makeMove(player, card) {
        // makes sure that right player is making the move
        if (this.players[this.turnIndex].id !== player.id) {
            return { message: "It's not your turn right now!" };
        }

        // checks to see if the player actually has the card they are trying to use in their hand
        const playerCardIndex = this.hasCard(player, card);
        if (playerCardIndex) {
            this.removeCardFromHand(playerCardIndex, player);
            // if there is not a color, then it is a wild card, which can be used at any point in the game
            if (card.color === "none") {
                const newColor = card.selectedColor;
                // makes sure that the color selected is valid
                if (newColor === "red" || newColor === "yellow" || newColor === "green" || newColor === "blue") {
                    card.color = newColor;
                    if (card.type === "draw_4") {
                        return this.draw4Handler(card);
                    } else {
                        return { card: card, turnIndex: this.turnIndex, global_action: { newColor: card.color } };
                    }
                } else {
                    return { message: "Invalid color, please do not edit the values!" };
                }
                // a valid move is if the color of the previous card in the discarded pile is the same as the played card
                // or if the value of the card is the same
            } else if (card.color === this.prevCard.color || this.card.value === this.prevCard.value) {
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

    /**
     * When a player deicides to draw a card
     * @param {Object} player 
     */
    drawCard(player) {
        // makes sure that right player is making the move
        if (this.players[this.turnIndex].id !== player.id) {
            return { message: "It's not your turn right now!" };
        }
        const playerObj = this.players.get(player.id);
        playerObj.cards.push(this.deck.getCard());
        return { local_action: { id: player.id, playerObj: playerObj } };
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
        const nextTurnIndex = this.getNextTurn();
        const playerObj = this.players.get(this.playerIDs[nextTurnIndex]);
        for (let i = 0; i < 2; i++) {
            playerObj.cards.push(this.deck.getCard());
        }
        // we skip the player who had to draw
        this.turnIndex = this.getNextTurn();
        this.turnIndex = this.getNextTurn();
        return { card: card, turnIndex: this.turnIndex, local_action: { playerObj: playerObj } };
    }

    /**
     * Handles the reverse move
     * @param {Object} card 
     */
    reverseHandler(card) {
        this.turnFlow = this.turnFlow * -1;
        return this.normalMoveHandler(card);
    }

    /**
     * Handles the skip move
     * @param {Object} card 
     */
    skipHandler(card) {
        this.turnIndex = this.getNextTurn();
        return this.normalMoveHandler(card);
    }

    /**
     * Handles a normal move
     * @param {Object} card 
     */
    normalMoveHandler(card) {
        this.turnIndex = this.getNextTurn();
        return { card: card, turnIndex: this.turnIndex };
    }

    /**
     * Handles the draw 4 move
     * @param {Object} card 
     */
    draw4Handler(card) {
        const nextTurnIndex = this.getNextTurn();
        const playerObj = this.players.get(this.playerIDs[nextTurnIndex]);
        for (let i = 0; i < 4; i++) {
            playerObj.cards.push(this.deck.getCard());
        }
        this.turnIndex = this.getNextTurn();
        this.turnIndex = this.getNextTurn();
        return { card: card, turnIndex: this.turnIndex, global_action: { newColor: card.color }, local_action: { id: this.playerIDs[nextTurnIndex], playerObj: playerObj } };
    }

    /**
     * Gets the next turn based on the turn flow and the turn index
     */
    getNextTurn() {
        let nextTurnIndex = this.turnIndex + this.turnFlow;
        // when the turn overflows it makes sure it circles back
        if (nextTurnIndex === -1) {
            nextTurnIndex = this.players.length - 1;
        } else if (nextTurnIndex === this.players.length) {
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
        if (playerObj) {
            let i = 0;
            for (const checkCard of playerObj.cards) {
                if (card.index === checkCard.index) {
                    return i;
                }
                i++;
            }
        }
    }
}

module.exports = Game;
