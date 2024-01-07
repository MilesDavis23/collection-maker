
const Jimp = require("jimp");
const { GifFrame, GifUtil } = require('gifwrap');
const fs = require("fs");
const path = require("path");

// gifs and their weights:
const layers = [
    {
        name: "background",
        images: [
            {file: "black.gif", weight: 50},
            {file: "blackcross.gif", weight: 50},
            {file: "lightbrown.gif", weight: 50}
        ]
    },
    {
        name: "body", 
        images: [
            {file: "bodyMain.gif", weight: 100}
        ]
    },
    {
        name: "skin",
        images: [
            {file: "common_skin.gif", weight: 50},
            {file: "navi_skin.gif", weight: 50}
        ]
    },
    {
        name: "mouth",
        images: [
            {file: "mouth_common.gif", weight: 100}
        ]
    },
    {
        name: "eye",
        images: [
            {file: "eye_common.gif", weight: 50},
            {file: "eye_rare.gif", weight: 50}
        ]
    },
    {
        name: "cigarette",
        images: [
            {file: "cig.gif", weight: 20},
            {file: "nocig.gif", weight: 50}
        ]
    }
];

function getRandomImage(layer, layerPath) {
    const totalWeight = layer.images.reduce((acc, image) => acc + image.weight, 0);
    const randomValue = Math.random() * totalWeight;

    let weightSum = 0;
    for (const image of layer.images) {
        weightSum += image.weight;
        if(randomValue <= weightSum) {
            console.log(`Layer path: ${layerPath}, Image file: ${image.file}`); // Debugging log
            return path.join(layerPath, image.file);
        }
    }
}

//generate gif
async function generateGif() {
    // Define the dimensions and background color for the canvas
    const width = 240; // Example width, adjust as needed
    const height = 240; // Example height, adjust as needed
    //const backgroundColor = 0x00000000; // RGBA (Here, transparent background)

    // Create an empty canvas
    let canvasFrames = [];


    const baseLayerGif = await GifUtil.read(path.join("./testInputGif", layers[0].name, layers[0].images[0].file));

    for (let i = 0; i < baseLayerGif.frames.length; i++) {
        const frameCanvas = new Jimp(width, height, 0xFFFFFFFF ) //initalize a new canvas for each frame (transapernt)
        canvasFrames.push(new GifFrame(frameCanvas.bitmap, baseLayerGif.frames[i].delayCentisecs )) // Use the delay from the base layer GIF
    }

    // Apply each layer to the canvas
    for (const layer of layers) {
        const layerPath = path.join("./testInputGif", layer.name);
        const randomGifPath = getRandomImage(layer, layerPath);
        console.log(`Selected .gif element for layer '${layer.name}' :`, randomGifPath);
        const layerGif = await GifUtil.read(randomGifPath);

        canvasFrames.forEach((canvasFrame, index) => {

            if (index < layerGif.frames.length) {
                const layerFrame = layerGif.frames[index];
                const jimpCanvas = new Jimp(canvasFrame.bitmap);
                const jimpLayerFrame = new Jimp(layerFrame.bitmap);
    
                jimpCanvas.composite(jimpLayerFrame, 0, 0);
                canvasFrame.bitmap = jimpCanvas.bitmap;
            }
        });
    }

    return canvasFrames
}

const numberOfPics = 3;

(async () => {
    const outputFolder = "./outputFolder";

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    for (let i = 0; i < numberOfPics; i++) {
        const canvasFrames = await generateGif();
        const outPutPath = path.join(outputFolder, `shhh_${i + 1}.gif`);
        await GifUtil.write(outPutPath, canvasFrames);
        console.log(`Generated NFT ${i + 1}`);
    }
})();