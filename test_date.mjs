
import yaml from 'yaml';

const content = `birthDate: 0006-06-06`;
const parsed = yaml.parse(content);
console.log('YAML parsed:', parsed.birthDate);
console.log('YAML parsed year:', parsed.birthDate instanceof Date ? parsed.birthDate.getFullYear() : 'Not a date');

const d = new Date('0006-06-06');
console.log('new Date("0006-06-06"):', d);
console.log('Year:', d.getFullYear());

const d2 = new Date();
d2.setFullYear(6, 5, 6);
console.log('setFullYear(6):', d2);
console.log('Year:', d2.getFullYear());
