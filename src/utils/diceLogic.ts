/**
 * Parses and rolls dice based on a string format like "1d10", "5d10", "1d100+30".
 */
export const parseAndRollDice = (diceString: string): { total: number, detail: string } | null => {
    // Clean string: remove spaces, lowercase
    const cleanStr = diceString.toLowerCase().replace(/\s/g, '');

    // Regex for XdY followed by optional modifiers
    // Matches: 1d100, 1d100+10, 1d100-5+10
    const mainRegex = /^(\d+)d(\d+)(.*)$/;
    const match = cleanStr.match(mainRegex);

    if (!match) {
        return null;
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const remainder = match[3];

    let total = 0;
    const rolls: number[] = [];

    // Parse modifiers from the remainder string
    let modifier = 0;
    if (remainder) {
        // Match all +N or -N
        const modRegex = /([+-]\d+)/g;
        const modMatches = remainder.match(modRegex);

        if (modMatches) {
            modMatches.forEach(m => {
                modifier += parseInt(m, 10);
            });
        }
    }

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
