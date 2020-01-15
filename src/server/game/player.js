/**
 * Player class for the game, houses the hand of the player, their username and their id
 */
class Player {
    constructor(username, id, cards) {
        this.username = username;
        this.id = id;
        this.cards = cards;
    }
}

module.exports = Player;
