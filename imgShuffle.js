const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const layers = 

[
    {
        name: "background",
        images: [
            {file: "rarebody_2.png", weight: 50},
            {file: "rarebody_1.png", weight: 50},
            {file: "commonbody_2.png", weight: 50},
            {file: "commonbody_1.png", weight: 20},
            {file: "backgroundbody.png", weight: 10},
        ]
    },
    {
        name: "skin",
        images: [
            {file: "common_1.png", weight: 20},
            {file: "common_2.png", weight: 20},
            {file: "common_3.png", weight: 20},
            {file: "rare_1.png", weight: 20},
            {file: "rare_2.png", weight: 10},
            {file: "superrare_2.png", weight: 5},
            {file: "superrare_1.png", weight: 5},
            {file: "legendary.png", weight: 1},
        ]
    },
    {
        name: "body",
        images: [
            {file: "body_one.png", weight: 100},
        ]
    },
    {
        name: "mouth",
        images: [
            {file: "common_1.png", weight: 50},
            {file: "common_2.png", weight: 50},
            {file: "common_3.png", weight: 50},
            {file: "rare_1.png", weight: 20},
            {file: "rare_2.png", weight: 10},
        ]
    },
    {
        name: "eye",
        images: [
            {file: "common_1.png", weight: 50},
            {file: "common_2.png", weight: 50},
            {file: "common_3.png", weight: 50},
            {file: "rare_1.png", weight: 20},
            {file: "rare_2.png", weight: 10},
            {file: "superrare_2.png", weight: 5},
            {file: "superrare_1.png", weight: 5},
            {file: "legendary_2.png", weight: 1},
            {file: "legendary_1.png", weight: 1},

        ]
    },
    {
        name: "hat",
        images: [
            {file: "common_1.png", weight: 10},
            {file: "common_2.png", weight: 10},
            {file: "rare_1.png", weight: 20},
            {file: "rare_2.png", weight: 10},
            {file: "superrare_2.png", weight: 5},
            {file: "superrare_1.png", weight: 5},
            {file: "superrare_3.png", weight: 5},

        ]
    },
    {
        name: "mustache",
        images: [
            {file: "common_1.png", weight: 20},
            {file: "common_2.png", weight: 20},
            {file: "common_3.png", weight: 20},
            {file: "rare_1.png", weight: 20},
            {file: "rare_2.png", weight: 10},
            {file: "superrare_2.png", weight: 5},
            {file: "superrare_1.png", weight: 5},
            {file: "legendary.png", weight: 1},
        ]
    },
    {
        name: "nose",
        images: [
            {file: "common_1.png", weight: 20},
            {file: "common_2.png", weight: 20},
            {file: "rare_1.png", weight: 20},
            {file: "rare_2.png", weight: 10},
            {file: "superrare_2.png", weight: 5},
            {file: "superrare_1.png", weight: 5},
            {file: "legendary.png", weight: 1},

        ]
    },
    {
        name: "cig",
        images: [
            {file: "cig.png", weight: 4},
            {file: "cigar.png", weight: 4},
        ]
    },

]


async function generateTest() {
    const width = 2040;
    const height = 2040;
  
    let canvas = new Jimp(width, height, 0x00000000);
  
    for (const layer of layers) {
      const layerPath = path.join("./testInput", layer.name);
      const randomImage = getRandomImage(layer, layerPath);
      console.log(`Selected image for layer '${layer.name}':`, randomImage);
      const image = await Jimp.read(randomImage);
      image.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);
      canvas.composite(image, 0, 0);
    }
  
    return canvas;
  }

  function getRandomImage(layer, layerPath) {
    const totalWeight = layer.images.reduce((acc, image) => acc + image.weight, 0);
    const randomValue = Math.random() * totalWeight;

    let weightSum = 0;
    for (const image of layer.images) {
        weightSum += image.weight;
        if(randomValue <= weightSum) {
            return path.join(layerPath, image.file);
        }
    }
} 

const numberOfPics = 3; // define how many images u want
const outPut = "./outputFolder";

if (!fs.existsSync(outPut)) {
  fs.mkdirSync(outPut, { recursive: true });
}

(async () => {
    const imageBuffers = [];

  for (let i = 0; i < numberOfPics; i++) {
    const nft = await generateTest();
    const imageBuffer = await nft.getBufferAsync(Jimp.MIME_PNG)
    await nft.writeAsync(`${outPut}/ugly_pal_${i + 1}.png`);
    console.log(`Generated NFT ${i + 1}`);
    imageBuffers.push(imageBuffer)
  }

  checkUniqueness(imageBuffers);
})();

const crypto = require('crypto');

function checkUniqueness(imageBuffers){
    const imageHashes = new Set();

    for (const buffer of imageBuffers) {
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');
        imageHashes.add(hash);
    }

    if(imageHashes.size === imageBuffers.length){
        console.log('All images are unique!');
    } else {
        console.log(`Some images are duplicates. Unique images: ${imageHashes.size} / ${imageBuffers.length}`)
    }
}


//function for calculating 
function calculateTotalVariations(layers) {
    return layers.reduce((total, layer) => total * layer.images.length, 1);
  }
  
  const totalVariations = calculateTotalVariations(layers);
  console.log(`Total possible variations: ${totalVariations}`);