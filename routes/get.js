var express = require('express');
const { ethers } = require("ethers");
require('dotenv').config()
contracts = require('folia-contracts')
const fs = require('fs');
const { Gone } = require('http-errors');
const go = require('../gen.js');
// const { FoliaControllerV2 } = require('folia-contracts');
// const { FoliaControllerV2 } = require('folia-contracts');

const seriesID = '12'
const network = "homestead";
const networks = {
  'homestead': '1',
  'rinkeby': '4'
}
const networkID = networks[network]

const provider = new ethers.providers.InfuraProvider(
  network, 
  process.env.INFURA_API_KEY,
);

folia = new ethers.Contract(
  contracts.Folia.networks[networkID].address,
  contracts.Folia.abi, provider
)

// foliaControllerV2 = new ethers.Contract(
//   contracts.FoliaControllerV2.networks[networkID].address,
//   contracts.FoliaControllerV2.abi, provider
// )


folia.on('Transfer', (...args) => {
  console.log(`onTransfer ${args[2].toString()}`)
  var newOwner = args[1].toLowerCase()
  var sameTokenID = args[2].toString()
  tokenID = ethers.BigNumber.from(sameTokenID)
  if (tokenID.div(1_000_000).toString() !== seriesID) return
  go(sameTokenID, newOwner)
})

var boo = function (res, int) {
  return res.status(404).send(int.toString() || '404')
}
var router = express.Router();

router.get('/list', async function(req, res, next) {
  try {
    // var work = await foliaControllerV2.works(seriesID)
    // var printed = work.printed.toNumber()
    var printed = 256
    var list = [...Array(printed)].map((_, y) => `https://chameleon.folia.app/get/${(seriesID * 1_000_000) + y + 1}.png`);
    return res.end(JSON.stringify({list}));
  } catch (error) {
    boo(res, error)
  }
})



/* GET users listing. */
router.get('/*', async function(req, res, next) {

  const splat = req.params[0]
  if (!splat) return boo(res, 1)
  const splats = splat.split('.')
  if (splats.length !== 2) return boo(res, 2)
  let tokenID
  try {
    tokenID = ethers.BigNumber.from(splats[0])
  } catch (_) {
    return boo(res, 3)
  }
  const suf = splats[1]
  if(suf !== 'mp4' && suf !== 'png') return boo(res, 4)

  if (tokenID.div(1_000_000).toString() !== seriesID) return boo(res, 5)

  let owner
  try {
    owner = (await folia.ownerOf(tokenID)).toLowerCase()
  } catch (_) {
    return boo(res, 5)
  }


  const vid = `output/${tokenID.toString() + owner}.mp4`


  var isTheVideoReady = async (vid, count = 0) => {
    console.log(`isTheVideoReady (${vid}) Try #${count}`)
    return new Promise((resolve, reject) => {
      try {
        fs.accessSync(vid)
        resolve()
      } catch (_) {
        if (count > 7) {
          reject()
        } else {
          setTimeout(async () => {
            try {
              await isTheVideoReady(vid, count + 1)
              resolve()
            } catch(_) {
              reject()
            }
          }, 1000)
        }
      }
    }) 
  }

  try {
    fs.accessSync(vid)
  } catch (_) {
    try {
      await isTheVideoReady(vid)
    } catch(_) {
      await go(tokenID.toString(), owner)
    }
  }

  try {
    fs.accessSync(vid)
  } catch (_) {
    boo(res, 6)
  }

  if (suf == 'mp4') {
    const path = vid
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] 
        ? parseInt(parts[1], 10)
        : fileSize-1
      const chunksize = (end-start)+1
      const file = fs.createReadStream(path, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }

    // const data = fs.readFileSync(vid)
    // res.writeHead(200, {
    //   'Content-Type': 'video/mp4',
    // })
    // return res.end(data);
  } else {
    const data = fs.readFileSync(vid.replace('.mp4', '/00040.png').replace('output', 'go'))
    res.writeHead(200, {
      'Content-Type': 'image/png',
    })
    return res.end(data);
  }
});

module.exports = router;
