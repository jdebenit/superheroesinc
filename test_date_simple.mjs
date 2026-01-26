
const d = new Date('0006-06-06');
console.log('new Date("0006-06-06"):', d);
console.log('Year:', d.getFullYear());

const d2 = new Date();
d2.setFullYear(6, 5, 6);
console.log('setFullYear(6):', d2);
console.log('Year:', d2.getFullYear());

const d3 = new Date('0006-06-06T00:00:00.000Z');
console.log('new Date("0006-06-06T00:00:00.000Z"):', d3);
console.log('Year:', d3.getFullYear());
