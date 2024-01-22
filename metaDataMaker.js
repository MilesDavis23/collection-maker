const fs = require("fs");
const path = require("path");

const pieceName = (number) => {
    return `Ugly_Pal_${number}`
}; // name of a single NFT


const metaDataMaker = async (ordinal) => {
    const outputFolder = "./outputFolder"
    let ordinalNumber = ordinal + 1

    const metadata = {
        "name" : pieceName(ordinalNumber),
        "symbol": "Ugly Pals",
        "description" : `A collection of 1111 Ugly Pals on the solana blockchain. This is the number ${ordinalNumber}`,
        "image": `${pieceName(ordinalNumber)}.png`,
        "attributes": [],
        "properties": {
            "files": [
                {
                    "uri": `${pieceName(ordinalNumber)}.png`,
                    "type": "image/png"
                }
            ]
        }
    }

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    let outputFilePath =  path.join(outputFolder, `Ugly_Pal_${ordinalNumber}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(metadata, null, 2))

    console.log(`Metadata for piece #${ordinalNumber} created at: ${outputFilePath}`);
};

module.exports = metaDataMaker


