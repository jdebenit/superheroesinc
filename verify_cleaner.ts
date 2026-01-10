
import { calculateDiff, mergeWithDefaults } from './src/utils/dataCleaner';
import { initialCharacterState } from './src/data/wizardConfig';

const runHeader = (name: string) => console.log(`\n=== TEST: ${name} ===`);
const runCheck = (condition: boolean, msg: string) => {
    if (condition) console.log(`✅ PASS: ${msg}`);
    else console.error(`❌ FAIL: ${msg}`);
};

const runComparison = () => {
    runHeader("calculateDiff");

    // Test 1: Full default should return undefined
    const diff1 = calculateDiff(initialCharacterState, initialCharacterState);
    runCheck(diff1 === undefined, "Full default state returns undefined");

    // Test 2: Single field change
    const char2 = JSON.parse(JSON.stringify(initialCharacterState));
    char2.name = "Test Character";
    const diff2 = calculateDiff(char2, initialCharacterState);
    runCheck(diff2 && diff2.name === "Test Character" && Object.keys(diff2).length === 1, "Single field change returns only that field");

    // Test 3: Deep field change
    const char3 = JSON.parse(JSON.stringify(initialCharacterState));
    char3.attributes = { ...char3.attributes, values: { ...char3.attributes.values, Fuerza: 50 } };
    const diff3 = calculateDiff(char3, initialCharacterState);

    runCheck(
        diff3.attributes?.values?.Fuerza === 50 &&
        diff3.attributes?.values?.Agilidad === undefined,
        "Deep field change returns minimal diff"
    );

    runHeader("mergeWithDefaults");

    // Test 4: Merge empty/undefined
    const merged4 = mergeWithDefaults(undefined, initialCharacterState);
    runCheck(JSON.stringify(merged4) === JSON.stringify(initialCharacterState), "Merge undefined returns full default");

    // Test 5: Merge partial
    const partial = { name: "Partial", attributes: { values: { Fuerza: 99 } } };
    const merged5 = mergeWithDefaults(partial, initialCharacterState);

    runCheck(merged5.name === "Partial", "Merged name is correct");
    runCheck(merged5.attributes.values.Fuerza === 99, "Merged deep value is correct");
    runCheck(merged5.attributes.values.Agilidad === 40, "Merged missing sibling is restored");
    runCheck(merged5.skills !== undefined, "Merged missing root key is restored");

};

try {
    runComparison();
} catch (e) {
    console.error("Test crashed", e);
}
