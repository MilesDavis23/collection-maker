const Jimp = require("jimp");
const { GifFrame, GifUtil } = require('gifwrap');
const fs = require("fs");
const path = require("path");
const metaDataMaker = require("./metaDataMaker");

// gifs and their weights:
const layers = [
    {
        name: "background",
        images: [
            {file: "bage_static.gif", weight: 50},
            {file: "black.gif", weight: 50},
            {file: "blue_static.gif", weight: 50},
            {file: "blue.gif", weight: 50},
            {file: "green_static.gif", weight: 50},
            {file: "lightbrown.gif", weight: 50},
            {file: "pink_static.gif", weight: 50},
            {file: "yellow_static.gif", weight: 50},
        ]
    },
    {
        name: "skin",
        images: [
            {file: "common_skin.gif", weight: 50},
            {file: "navi_skin.gif", weight: 50},
            {file: "pale_skin.gif", weight: 20},
            {file: "common2_skin.gif", weight: 50}
        ]
    },
    {
        name: "mouth",
        images: [
            {file: "mouth_common.gif", weight: 90},
            {file: "mouth_red.gif", weight: 20}
        ]
    },
    {
        name: "eye",
        images: [
            {file: "eye_rare.gif", weight: 20},
            {file: "eye_obsessed.gif", weight: 5},
            {file: "eye_common.gif", weight: 50}
        ]
    },
    {
        name: "glasses",
        images: [
            {file: "black_tainted.gif", weight: 20},
            {file: "censored.gif", weight: 1},
            {file: "cool_tainted.gif", weight: 20},
            {file: "normal.gif", weight: 20},
            {file: "noglasses.gif", weight: 50},
            {file: "pirate.gif", weight: 5},
            {file: "red_tainted.gif", weight: 10}
        ]
    },
    {
        name: "hat",
        images: [
            {file: "cap.gif", weight: 20},
            {file: "captain.gif", weight: 2},
            {file: "nohat.gif", weight: 50},
            {file: "laser.gif", weight: 5},
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



//get a random layer:
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
    const width = 240; 
    const height = 240;

    let layersFrames = [];
    let prevCanvases = new Array(layers.length).fill(null); // Array to store the previous canvas for each layer
    
    let selectedImages = [] //storing the selected images
    for (const [index, layer] of layers.entries()) {
        const layerPath = path.join("./testInputGif", layer.name);
        const selectedImage = getRandomImage(layer, layerPath);
        selectedImages.push(selectedImage);
    
        const layerGif = await GifUtil.read(selectedImage);
        console.log(`Layer: ${layer.name}, Image file: ${selectedImage}, Frame count: ${layerGif.frames.length}`);
        
        let layerFrames = [];
    
        for (let i = 0; i < layerGif.frames.length; i++) {
            const frame = layerGif.frames[i];
            let jimpFrame;
            console.log(frame.disposalMethod)
            // Check if we should composite on top of the previous frame
            if (prevCanvases[index] && frame.disposalMethod === 1) {
                //console.log(frame.bitmap)
                jimpFrame = await Jimp.read(frame.bitmap);
                prevCanvases[index].composite(jimpFrame, 0, 0);
                jimpFrame = prevCanvases[index].clone(); // Clone the composited frame for this layer
            } else {
                // Otherwise, start with a new canvas 
                //console.log(frame.bitmap)
                jimpFrame = await Jimp.read(frame.bitmap);
                prevCanvases[index] = jimpFrame.clone(); // Update the previous canvas for this layer
            }
    
            layerFrames.push(jimpFrame);
        }
    
        layersFrames.push(layerFrames);
    }

    let canvasFrames = [];
    const frameCount = layersFrames[0].length;

    let baseCanvas = new Jimp(width, height, 0x00000000); // Persistent base canvas

    for (let i = 0; i < frameCount; i++) {
        for (let j = 0; j < layersFrames.length; j++) {
            const jimpLayerFrame = await layersFrames[j][i];
            if (!jimpLayerFrame) {
                console.error(`Frame ${i} in layer ${layers[j].name} is undefined. Image file: ${selectedImages[j]}`);
                continue;            
            }
            baseCanvas.composite(jimpLayerFrame, 0, 0, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 1,
                opacityDest: 1
            });
        }

        // Create a clone of the baseCanvas for this frame
        const frameCanvas = baseCanvas.clone();
        const canvasFrameBitmap = frameCanvas.bitmap;
        const delay = 1; // Set a default delay
        canvasFrames.push(new GifFrame(canvasFrameBitmap, { delay: delay }));
        await frameCanvas.writeAsync(`./debug/composited_frame_${i}.png`);
    }

    return canvasFrames;
}


const numberOfPics = 10;

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
        await metaDataMaker(i)
        console.log(`Generated JSON ${i +  1}`);
    }
})();

