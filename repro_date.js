
const yaml = require('js-yaml');

const content = `
date1: 0050-01-01
date2: "0050-01-01"
`;

const parsed = yaml.load(content);
console.log('Date1 (no quotes):', parsed.date1, 'Type:', typeof parsed.date1);
if (parsed.date1 instanceof Date) {
    console.log('Date1 FullYear:', parsed.date1.getFullYear());
}

console.log('Date2 (quotes):', parsed.date2, 'Type:', typeof parsed.date2);
