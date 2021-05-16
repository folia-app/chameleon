var videoshow = require('videoshow')
var audioconcat = require('audioconcat')

var tokenID = '0xb113a7b59e7cd692e2cd5cc50ed14ea0b7a230e4';
var tokenID3 = 'output/' + tokenID;

var str1 = tokenID;
var str2 = "00";
var tokenID2 = str1.concat(str2);

var sounds = [...tokenID2];
sounds = sounds.map(i => 'bithex/' + i +'.mp3');

//console.log(sounds);

audioconcat(sounds)
.concat(tokenID3+'.mp3')
.on('start', function (command) {
  console.log('ffmpeg process started:', command)
})
.on('error', function (err, stdout, stderr) {
  console.error('Error:', err)
  console.error('ffmpeg stderr:', stderr)
})
.on('end', function (output) {
  console.error('Audio created in:', output)
})

const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

const width = 320
const height = 320
const maxWidth = 320

const canvas = createCanvas(width, height)
const context = canvas.getContext('2d')
context.imageSmoothingEnabled = false

context.fillStyle = '#000000'
context.fillRect(0, 288, width, height)
context.fillStyle = '#'+tokenID.substr(0, 6);
context.fillRect(0, 0, width, 288)


loadImage('bitimg/game.png').then(image => {
  context.drawImage(image, 0, 0, 320, 320)
})

loadImage('bitimg/o.png').then(image => {
  context.drawImage(image, 0, 256, 16, 16)
})

loadImage('bitimg/x.png').then(image => {
  context.drawImage(image, 0, 272, 16, 16)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('go/0000.png', buffer)
  setTimeout( all, 1000);
})

tokenID = tokenID.replace("0x", "").toLowerCase();
var binimages = [...tokenID];
binimages = binimages.map(k => 'bitimg/' + k +'.png');
var binimagesbit = [...tokenID];
binimagesbit = binimagesbit.map(l => 'bitbitimg/' + l +'.png');

i=0;
function all(){
  if (i < binimages.length){
    tokenID = tokenID.replace("0x", "").toLowerCase();
    context.fillStyle = '#'+tokenID.substr(i, 6);
    context.fillRect(0, 0, width, 288)
    
    loadImage('bitimg/game.png').then(image => {
      context.drawImage(image, 0, 0, 320, 320)
    })

    loadImage('bitimg/o.png').then(image => {
      context.drawImage(image, 0, 256, 16, 16)
    })

    loadImage('bitimg/x.png').then(image => {
      context.drawImage(image, 0, 272, 16, 16)
      const buffer = canvas.toBuffer('image/png')
    })

    loadImage(binimagesbit[i]).then(image => {
      if(i<=20){
        context.drawImage(image, ((i*16)-16), 224, 16, 64)
      }else{
        context.drawImage(image, (((i-20)*16)-16), 224, 16, 64)
      }
    })
    
    loadImage(binimages[i]).then(image => {
      if(i<=20){
        context.drawImage(image, ((i*16)-16), 288, 16, 16)
      }else{
        context.drawImage(image, (((i-20)*16)-16), 304, 16, 16)
      }
      
      const buffer = canvas.toBuffer('image/png')
      fs.writeFileSync('go/000' + i +'.png', buffer)
    })
    //console.log(i); 
    i++
    setTimeout( all, 1000);
  }
  else{
    setTimeout( video, 1000);
  }
}


//INSERT COIN


function video(){
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
  })
  .on('end', function (output) {
    console.error('Video created in:', output)
  })
}
