var videoshow = require('videoshow')
var audioconcat = require('audioconcat')
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas');
const { resolve } = require('path');

const width = 320
const height = 320
const maxWidth = 320

const canvas = createCanvas(width, height)
const context = canvas.getContext('2d')

var tokenID = '0xb113a7b59e7cd692e2cd5cc50ed14ea0b7a230e4';
var tokenID3 = 'output/' + tokenID;

var str1 = tokenID;
var str2 = "00";
var tokenID2 = str1.concat(str2);

var sounds = [...tokenID2];
sounds = sounds.map(i => 'bithex/' + i +'.mp3');
var binimages, binimagesbit
go()


async function go() {
  await run_audio()
  
  context.imageSmoothingEnabled = false
  
  context.fillStyle = '#000000'
  context.fillRect(0, 288, width, height)
  context.fillStyle = '#'+tokenID.substr(0, 6);
  context.fillRect(0, 0, width, 288)
  
  
  image = await loadImage('bitimg/game.png')
  context.drawImage(image, 0, 0, 320, 320)
  
  image = await loadImage('bitimg/o.png')
  context.drawImage(image, 0, 256, 16, 16)
  
  image = await loadImage('bitimg/x.png')
  context.drawImage(image, 0, 272, 16, 16)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('go/0000.png', buffer)
  
  tokenID = tokenID.replace("0x", "").toLowerCase();
  binimages = [...tokenID];
  binimages = binimages.map(k => 'bitimg/' + k +'.png');
  binimagesbit = [...tokenID];
  binimagesbit = binimagesbit.map(l => 'bitbitimg/' + l +'.png');
  await all()
}

async function run_audio() {
  return new Promise((resolve, reject) => {
    //console.log(sounds);
    
    audioconcat(sounds)
    .concat(tokenID3+'.mp3')
    .on('start', function (command) {
      console.log('ffmpeg process started:', command)
    })
    .on('error', function (err, stdout, stderr) {
      console.error('Error:', err)
      console.error('ffmpeg stderr:', stderr)
      reject(err)
    })
    .on('end', function (output) {
      console.error('Audio created in:', output)
      resolve()
    })
  })
}

i=0;
async function all(){
  if (i < binimages.length){
    tokenID = tokenID.replace("0x", "").toLowerCase();
    context.fillStyle = '#'+tokenID.substr(i, 6);
    context.fillRect(0, 0, width, 288)
    
    image = await loadImage('bitimg/game.png')
    context.drawImage(image, 0, 0, 320, 320)
    
    image = await loadImage('bitimg/o.png')
    context.drawImage(image, 0, 256, 16, 16)
    
    image = await loadImage('bitimg/x.png')
    context.drawImage(image, 0, 272, 16, 16)
    canvas.toBuffer('image/png')
    
    image = await loadImage(binimagesbit[i])
    if(i<=20){
      context.drawImage(image, (((i+1)*16)-16), 224, 16, 64)
    }else{
      context.drawImage(image, ((((i+1)-20)*16)-16), 224, 16, 64)
    }
    
    image = await loadImage(binimages[i])
    if(i<=20){
      context.drawImage(image, (((i+1)*16)-16), 288, 16, 16)
    }else{
      context.drawImage(image, ((((i+1)-20)*16)-16), 304, 16, 16)
    }
    
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('go/000' + (i + 1) + '.png', buffer)
    i++
    await all()
  } else {
    await video()
  }
}

//INSERT COIN

async function video(){
  return new Promise((resolve, reject) => {
    var numberOfImages = 41; 
    var im, images = new Array();
    for (var i = 0; i < numberOfImages ; i++) {
      im = "go/000" + i + ".png";
      images.push(im);
    }
    
    
    var videoOptions = {
      fps: 25,
      loop: 0.16, // seconds
      transition: false,
      transitionDuration: 0.01, // seconds
      videoBitrate: 1024,
      videoCodec: 'libx264',
      size: '320x?',
      audioBitrate: '128k',
      audioChannels: 2,
      format: 'mp4',
      pixelFormat: 'yuv420p'
    }
    
    var audioParams = {
      fade: false,
      delay: 0.01 // seconds
    }
    
    videoshow(images, videoOptions)
    .audio(tokenID3+'.mp3', audioParams)
    .save(tokenID3+'.mp4')
    .on('start', function (command) {
      console.log('ffmpeg process started:', command)
    })
    .on('error', function (err, stdout, stderr) {
      console.error('Error:', err)
      console.error('ffmpeg stderr:', stderr)
      reject(err)
    })
    .on('end', function (output) {
      console.error('Video created in:', output)
      resolve()
    })
  })
}
