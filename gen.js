var videoshow = require('videoshow')
var audioconcat = require('audioconcat')
var seedrandom = require('seedrandom');

const fs = require('fs')
const { createCanvas, loadImage } = require('canvas');
const { resolve } = require('path');

const width = 320
const height = 320
const maxWidth = 320

const canvas = createCanvas(width, height)
const context = canvas.getContext('2d')

/*
<!-- 
 _____ _____ _____ _____ _____ __    _____ _____ _____   
|     |  |  |  _  |     |   __|  |  |   __|     |   | |  
|   --|     |     | | | |   __|  |__|   __|  |  | | | |  
|_____|__|__|__|__|_|_|_|_____|_____|_____|_____|_|___| 
 ██████ ██   ██  █████  ███    ███ ███████ ██      ███████  ██████  ███    ██     
██      ██   ██ ██   ██ ████  ████ ██      ██      ██      ██    ██ ████   ██     
██      ███████ ███████ ██ ████ ██ █████   ██      █████   ██    ██ ██ ██  ██     
██      ██   ██ ██   ██ ██  ██  ██ ██      ██      ██      ██    ██ ██  ██ ██     
 ██████ ██   ██ ██   ██ ██      ██ ███████ ███████ ███████  ██████  ██   ████     

CHAMELEON 

Joan Heemskerk (JODI)
Billy Rennekamp (OKWME)

-- 2021 --
-->
*/

// CHAMELEON
const go = async (tokenID, ownerAddress) => {

  seedrandom(tokenID, { global: true });

  var ownerAddress3 = 'output/' + tokenID + ownerAddress;

  var str1 = ownerAddress;
  var str2 = "00";
  var ownerAddress2 = str1.concat(str2);

  var sounds = [...ownerAddress2];
  sounds = sounds.map(i => 'bithex/' + i +'.mp3');

  var ran = Math.floor((Math.random() * 6)); // dice
  var goseed =["12000004","12000022","12000028","12000034","12000052","12000054","12000056","12000068","12000073","12000077","12000082","12000090","12000091","12000101","12000106","12000116","12000120","12000123","12000140","12000143","12000157","12000158","12000166","12000168","12000173","12000174","12000180","12000190","12000191","12000192","12000205","12000209","12000214","12000221","12000224","12000233","12000240","12000249"]
  ran  = goseed.indexOf(tokenID) > 0 ? 0 : 1
  console.log(`TokenID ${tokenID} = Dice ${ran}`)
  var binimages, binimagesbit

  await run_audio()
  
  context.imageSmoothingEnabled = false
  
  context.fillStyle = '#000000'
  context.fillRect(0, 288, width, height)
  context.fillStyle = '#'+ownerAddress.substr(2, 6); // rGB
  context.fillRect(0, 0, width, 288)
  
  ownerAddress = ownerAddress.replace("0x", "").toLowerCase();

  var dir = 'go/' + tokenID + '0x' + ownerAddress;
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  
  if (ran < 1){
      image = await loadImage('bitimg/game.png')
      context.drawImage(image, 0, 0, 320, 320)
  }
  
  image = await loadImage('bitimg/o.png')
  context.drawImage(image, 0, 256, 16, 16)
  
  image = await loadImage('bitimg/x.png')
  context.drawImage(image, 0, 272, 16, 16)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync('go/' + tokenID + '0x' + ownerAddress + '/0000.png', buffer)
  
  binimages = [...ownerAddress];
  binimages = binimages.map(k => 'bitimg/' + k +'.png');
  binimagesbit = [...ownerAddress];
  binimagesbit = binimagesbit.map(l => 'bitbitimg/' + l +'.png');
  await all()

  async function run_audio() {
    return new Promise((resolve, reject) => {
      
      audioconcat(sounds)
      .concat("go/" + tokenID + ownerAddress+'.mp3')
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

  async function all(i = 0){
    if (i < binimages.length){
      ownerAddress = ownerAddress.replace("0x", "").toLowerCase();
      context.fillStyle = '#'+ownerAddress.substr(i, 6);
      context.fillRect(0, 0, width, 288)
      
    if (ran < 1){
        image = await loadImage('bitimg/game.png')
        context.drawImage(image, 0, 0, 320, 320)
    }
    
      image = await loadImage('bitimg/o.png')
      context.drawImage(image, 0, 256, 16, 16)
      
      image = await loadImage('bitimg/x.png')
      context.drawImage(image, 0, 272, 16, 16)
      canvas.toBuffer('image/png')
      
      image = await loadImage(binimagesbit[i])
      if(i<20){
        context.drawImage(image, (((i+1)*16)-16), 224, 16, 64)
      }else{
        context.drawImage(image, ((((i+1)-20)*16)-16), 224, 16, 64)
      }
      
      image = await loadImage(binimages[i])
      if(i<20){
        context.drawImage(image, (((i+1)*16)-16), 288, 16, 16)
      }else{
        context.drawImage(image, ((((i+1)-20)*16)-16), 304, 16, 16)
      }
      
      const buffer = canvas.toBuffer('image/png')
      fs.writeFileSync('go/' + tokenID + '0x' + ownerAddress + '/000' + (i + 1) + '.png', buffer)
      i++
      await all(i)
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
        im = "go/" + tokenID + '0x' + ownerAddress + "/000" + i + ".png";
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
      .audio("go/" + tokenID + '0x' + ownerAddress + '.mp3', audioParams)
      .save(ownerAddress3+'.mp4')
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
}

module.exports = go
