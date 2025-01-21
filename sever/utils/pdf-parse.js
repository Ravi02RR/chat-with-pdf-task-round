const pdf = require("pdf-parse");
const fs = require("fs");

const extractPdfData = async (pathtopdf) => {
    try {
        const dataBuffer = fs.readFileSync(pathtopdf);
        const data = await pdf(dataBuffer);
        
        return {
            numpages: data.numpages,
            numrender: data.numrender,
            info: data.info,
            metadata: data.metadata,
            version: data.version,
            text: data.text
        };
    } catch (error) {
        throw new Error(`Error extracting PDF data: ${error.message}`);
    }
};

module.exports = { extractPdfData };

