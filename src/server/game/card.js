/**
 * Creates a card object based on the card id
 * There are 108 cards: 4 colors each with 25 cards (0, [1-9, skip, reverse, +2](repeated twice)) and then 4 wild cards and 4 wild draw 4 cards.
 */
class Card {
    constructor(cardID) {
        this.cardID = cardID;
        this.color = this.getColor(cardID);
        this.value = this.getValue(cardID);
        this.type = this.getType();
    }

    /**
     * Gets the color of the card based on its id
     * @param {Number} cardID 
     */
    getColor(cardID) {
        // if our card id is greater than 99, then it is one of the wild cards
        if (cardID > 99) {
            return "none";
        }

        // the card color is determined by which multiple of 25 the card id belongs to, since each color has 25 cards.
        const colorCardID = Math.floor(cardID / 25);
        switch (colorCardID) {
            case 0:
                return "red";
            case 1:
                return "yellow";
            case 2:
                return "green";
            case 3:
                return "blue";
        }
    }

    /**
     * Gets the value of the card based on its id
     * @param {Number} cardID 
     */
    getValue(cardID) {
        // if greater than 99, its a special card
        if (cardID > 99) {
            if (cardID >= 100 && cardID <= 103) {
                return "wild_card"
            } else {
                return "draw_4"
            }
        }

        // the value of the card depends on which index between 0 and 24 the card is, since there are 2 sets of [1-9, skip, reverse, +2], we need to subtract back
        let valueCardID = cardID % 25;
        if (valueCardID > 12) {
            valueCardID -= 12;
        }

        if (valueCardID < 10) {
            return valueCardID.toString();
        } else if (valueCardID === 10) {
            return "skip";
        } else if (valueCardID === 11) {
            return "reverse";
        } else {
            return "draw_2";
        }
    }

    /**
     * Gets what type of card the card is based on the value it has
     */
    getType() {
        // checks to see if the value is a number
        if (!isNaN(this.value)) {
            return "number";
        }
        return "action";
    }
}

module.exports = Card;
