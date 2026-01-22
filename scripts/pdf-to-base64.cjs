const fs = require('fs');
const path = require('path');

const pdfPath = path.join(__dirname, '../public/ficha_template.pdf');
const outputPath = path.join(__dirname, '../src/data/pdfTemplate.ts');

console.log(`Reading PDF from: ${pdfPath}`);

if (!fs.existsSync(pdfPath)) {
    console.error('Error: PDF file not found!');
    process.exit(1);
}

try {
    const fileBuffer = fs.readFileSync(pdfPath);
    const base64 = fileBuffer.toString('base64');
    const fileContent = `// Auto-generated file. Do not edit manually.\nexport const PDF_TEMPLATE_BASE64 = "${base64}";\n`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully generated ${outputPath}`);
    console.log(`Base64 length: ${base64.length}`);
} catch (err) {
    console.error('Error processing PDF:', err);
    process.exit(1);
}
