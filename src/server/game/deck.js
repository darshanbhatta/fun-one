const Card = require("./card");

/**
 * Handles all the deck related functions
 */
class Deck {
    constructor() {
        this.deck = this.generateDeck();
        this.usedPile = [];
    }

    /**
     * Gets a card from the deck
     */
    getCard() {
        // if there are no cards left in the deck, then we have to use the discard pile
        if (this.deck.length === 0) {
            this.resetDeck();
        }
        const cardIndex = this.deck.pop();
        this.usedPile.push(cardIndex);
        return new Card(cardIndex);
    }

    /**
     * Resets the deck by using the discard pile
     */
    resetDeck() {
        this.deck = this.shuffleArray(this.usedPile);
        this.usedPile = [];
    }

    /**
     * Generates a random order of cardIDs
     */
    generateDeck() {
        const cardIndexInOrder = Array.from({ length: 108 }, (v, i) => i);
        return this.shuffleArray(cardIndexInOrder);
    }

    /**
     * Shuffles array in random order
     * @param {Array} a 
     */
    shuffleArray(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /**
     * Gets the initial hand for a player, used when the game starts
     */
    getHand() {
        const hand = [];
        for (let i = 0; i < 7; i++) {
            hand.push(this.getCard());
        }
        return hand;
    }
}

module.exports = Deck;
