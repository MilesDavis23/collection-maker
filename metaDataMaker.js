const fs = require("fs");
const path = require("path");

const pieceName = (number) => {
    return `shhh_${number}`
}; // name of a single NFT


const metaDataMaker = async (ordinal) => {
    const outputFolder = "./outputFolder"
    let ordinalNumber = ordinal + 1

    const metadata = {
        "name" : pieceName(ordinalNumber),
        "symbol": "Sh",
        "description" : `A collection of test NFTs. This is the number ${ordinalNumber}`,
        "image": `${pieceName(ordinalNumber)}.gif`,
        "attributes": [],
        "properties": {
            "files": [
                {
                    "uri": `${pieceName(ordinalNumber)}.gif`,
                    "type": "image/gif"
                }
            ]
        }
    }

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    let outputFilePath =  path.join(outputFolder, `shhh_${ordinalNumber}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(metadata, null, 2))

    console.log(`Metadata for piece #${ordinalNumber} created at: ${outputFilePath}`);
};

module.exports = metaDataMaker


