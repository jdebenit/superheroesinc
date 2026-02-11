/**
 * Parses and rolls dice based on a string format like "1d10", "5d10", "1d100+30".
 */
export const parseAndRollDice = (diceString: string): { total: number, detail: string } | null => {
    // Clean string: remove spaces, lowercase
    const cleanStr = diceString.toLowerCase().replace(/\s/g, '');

    // Regex for XdY(+/-Z)
    // Matches:
    // Group 1: Number of dice (X)
    // Group 2: Sides (Y)
    // Group 3: Modifier (+/-Z) - optional
    const regex = /^(\d+)d(\d+)([+-]\d+)?$/;
    const match = cleanStr.match(regex);

    if (!match) {
        return null;
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifierStr = match[3];
    const modifier = modifierStr ? parseInt(modifierStr, 10) : 0;

    let total = 0;
    const rolls: number[] = [];

    for (let i = 0; i < count; i++) {
        // Roll 1 to Sides
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
    }

    total += modifier;

    // Format detail string
    // Example: "[5, 8] + 2" or "[5]"
    let detail = `[${rolls.join(', ')}]`;
    if (modifier !== 0) {
        detail += ` ${modifier > 0 ? '+' : ''}${modifier}`;
    }

    return { total, detail };
};
