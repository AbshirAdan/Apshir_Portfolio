const fs = require('fs');
const pdfParse = require('pdf-parse');

const getPdfPageCount = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.numpages || null;
  } catch {
    return null;
  }
};

module.exports = { getPdfPageCount };
