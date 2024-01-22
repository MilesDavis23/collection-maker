const Jimp = require('jimp');
const { GifUtil } = require('gifwrap');
const fs = require('fs');
const path = require('path');

async function extractGifFrames(gifPath, outputFolder) {

    if (!fs.existsSync(outputFolder)){
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    const gif = await GifUtil.read(gifPath);

    let prevCanvas = null;

    for (let i = 0; i < gif.frames.length; i++) {
        const frame = gif.frames[i];

        // If there's a previous canvas and the disposal method is 1, draw on top of it
        if (prevCanvas && frame.disposalMethod === 1) {
            const jimpFrame = await Jimp.read(frame.bitmap);
            prevCanvas.composite(jimpFrame, 0, 0);
        } else {
            // Otherwise, start with a new 
            prevCanvas = await Jimp.read(frame.bitmap);
        }

        const outputPath = path.join(outputFolder, `frame_${i}.png`);
        await prevCanvas.writeAsync(outputPath);
        console.log(`Frame ${i} saved to ${outputPath}`);
    }
}

async function logGifFrameDisposalMethods(gifPath) {
    // Read the gif
    const gif = await GifUtil.read(gifPath);

    // log each frames disposal method
    gif.frames.forEach((frame, index) => {
        console.log(`Frame ${index}: Disposal Method = ${frame.disposalMethod}`);
    });
}

async function areFramesDifferent(frame1, frame2Promise) {
    // Await the promise for frame2
    const frame2 = await frame2Promise;

    // Check if both frames are defined
    if (!frame1 || !frame2) {
        return true; // If one of the frames is missing, they are considered different
    }

    const bitmap1 = frame1.bitmap;
    const bitmap2 = frame2.bitmap;

    // Compare dimensions first for a quick check
    if (bitmap1.width !== bitmap2.width || bitmap1.height !== bitmap2.height) {
        return true; // Different dimensions mean they are different
    }

    // Compare the data of the bitmaps
    for (let i = 0; i < bitmap1.data.length; i++) {
        if (bitmap1.data[i] !== bitmap2.data[i]) {
            return true; // If any pixel value is different, frames are different
        }
    }

    // If all pixel values are the same, the frames are not different
    return false;
}

async function isLayerStatic(layerFrames) {
    let firstFrameData = (await layerFrames[0]).bitmap.data;
    for (let i = 1; i < layerFrames.length; i++) {
        let currentFrameData = (await layerFrames[i]).bitmap.data;
        if (!currentFrameData.every((val, index) => val === firstFrameData[index])) {
            return false; // Found a frame that is different
        }
    }
    return true;
}

// Example usage
const gifPath = './testInputGif/background/black.gif'; // Replace with your GIF file path
const outputFolder = './debug';

logGifFrameDisposalMethods(gifPath)
    .then(() => console.log('Finished logging disposal methods'))
    .catch(err => console.error(err));
//extractGifFrames(gifPath, outputFolder)
    //.then(() => console.log('All frames extracted'))
    //.catch(err => console.error(err));
