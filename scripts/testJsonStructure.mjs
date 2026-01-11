#!/usr/bin/env node
/**
 * Quick test to verify JSON structure after conversion
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPG_DIR = path.join(__dirname, '../src/content/rpg');

// Test a few files
const testFiles = ['alice.json', 'la-naga.json', 'centurion.json'];

console.log('🔍 Testing JSON structure after conversion...\n');

for (const file of testFiles) {
    const filePath = path.join(RPG_DIR, file);

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);

        console.log(`📄 ${file}:`);
        console.log(`   Name: ${data.name}`);
        console.log(`   Has skills: ${!!data.skills}`);
        console.log(`   Has skills.generalItems: ${!!data.skills?.generalItems}`);
        console.log(`   General skills count: ${data.skills?.generalItems?.length || 0}`);
        console.log(`   Has skills.specialItems: ${!!data.skills?.specialItems}`);
        console.log(`   Special skills count: ${data.skills?.specialItems?.length || 0}`);

        if (data.skills?.generalItems?.length > 0) {
            console.log(`   First general skill: ${data.skills.generalItems[0].name} = ${data.skills.generalItems[0].value}`);
        }

        console.log('');

    } catch (error) {
        console.error(`❌ Error reading ${file}:`, error.message);
    }
}

console.log('✅ Test complete');
