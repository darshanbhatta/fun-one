module.exports = {
    getCardImage(cardID) {
        let colorPath = "/img/cards/"
        // if our card id is greater than 99, then it is one of the wild cards
        if (cardID > 99) {
            colorPath += "wild";
        } else {
            // the card color is determined by which multiple of 25 the card id belongs to, since each color has 25 cards.
            const colorCardID = Math.floor(cardID / 25);
            switch (colorCardID) {
                case 0:
                    colorPath += "red";
                    break;
                case 1:
                    colorPath += "yellow";
                    break;
                case 2:
                    colorPath += "green";
                    break;
                case 3:
                    colorPath += "blue";
                    break;
            }
        }
        colorPath += "_";
        // if greater than 99, its a special card
        if (cardID > 99) {
            if (cardID >= 100 && cardID <= 103) {
                colorPath += "color_changer"
            } else {
                colorPath += "pick_four"
            }
        } else {
            // the value of the card depends on which index between 0 and 24 the card is, since there are 2 sets of [1-9, skip, reverse, +2], we need to subtract back
            let valueCardID = cardID % 25;
            if (valueCardID > 12) {
                valueCardID -= 12;
            }

            if (valueCardID < 10) {
                colorPath += valueCardID.toString();
            } else if (valueCardID === 10) {
                colorPath += "skip";
            } else if (valueCardID === 11) {
                colorPath += "reverse";
            } else {
                colorPath += "picker";
            }
        }
        colorPath += ".png";
        return colorPath;
    }
};