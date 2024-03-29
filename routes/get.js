var express = require('express');
const { ethers } = require("ethers");
require('dotenv').config()
contracts = require('folia-contracts')
const fs = require('fs');
const { Gone } = require('http-errors');
const go = require('../gen.js');
const fetch = require('node-fetch');


var checkCount = function () {
  console.log('checking count')
  for (let i = 1; i < 257; i++) {
    h = ("00" + i).slice(-3);
    const tokenID = ('12000' + h)
    checkTrans(tokenID)
  }

  async function checkTrans(token) {
    fs.readdir('output', (error, files) => {
      const startsWithtokenID = files.filter((files) => files.slice(0, 8) === token.toString());
      let data = startsWithtokenID.length - 1;
      if (data < 0) {
        data = 0
      }

      fs.writeFile("public/txt/" + token.toString() + ".txt", data.toString(), (err) => {
        if (err) console.log(err);
      });
    });
  };
}
checkCount()
setInterval(checkCount, 24 * 60 * 60 * 1000)

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


// var keepGoing = (tokenID, owner) => {
//     try {
//       await go(tokenID, owner)
//     } catch(_) {
//       await keepGoing(tokenId, owner)
//     }
// }


var refreshOpensea = function (tokenID) {
  // var url = `https://api.opensea.io/api/v1/asset/${folia.address}/${tokenID}/?force_update=true`
  const url = `https://api.opensea.io/v2/chain/ethereum/contract/${folia.address}/nfts/${tokenID}/refresh`
  const options = {
    method: 'POST',
    headers: { accept: 'application/json', 'X-API-KEY': process.env.OPENSEA_API }
  };
  // console.log({ url })
  fetch(url, options)
    .then(response => response.json())
    .then(data => console.log({ opensea: data }))
    .catch(error => { console.error(error) })
}

var checkAll = async (first = false) => {
  console.log(`check all`)
  var makeVid = async (tokenID, owner) => {
    const vid = `output/${tokenID.toString() + owner.toLowerCase()}.mp4`
    console.log(`MAKE VID: (${vid})`)
    try {
      if (!first) {
        fs.accessSync(vid)
        console.log(`EXISTS ALREADY: ${vid}`)
        return
      } else {
        throw new Error('make it anyway')
      }
    } catch (_) {
      try {
        await go(tokenID, owner)
        refreshOpensea(tokenID)
      } catch (error) {
        console.log(`FAILED TO MAKE: ${vid}`)
        console.log(`RETRY IN 1sec`)
        console.log({ error })
        setTimeout(async () => {
          makeVid(tokenID, owner)
        }, 1000)
      }
    }
  }
  var totalSupply = Number((await folia.totalSupply()).toString())
  for (var i = 1; i < totalSupply + 1; i++) {
    var tokenID = (seriesID * 1_000_000) + i
    var owner = (await folia.ownerOf(tokenID)).toLowerCase()
    makeVid(tokenID, owner)
    await (() => {
      return new Promise((resolve, _) => {
        setTimeout(resolve, 10 * 1000) // 10 sec
      })
    })()
  }
}
var checkAllInterval = setInterval(checkAll, 60 * 60 * 1000) // 60 min
checkAll(true)


folia.on('Transfer', async (...args) => {
  console.log(`onTransfer ${args[2].toString()}`)
  var newOwner = args[1].toLowerCase()
  var sameTokenID = args[2].toString()
  tokenID = ethers.BigNumber.from(sameTokenID)
  if (tokenID.div(1_000_000).toString() !== seriesID) return

  var makeVid = async (tokenID, owner) => {
    const vid = `output/${tokenID.toString() + owner.toLowerCase()}.mp4`
    console.log(`MAKE VID: (${vid})`)
    try {
      fs.accessSync(vid)
      console.log(`EXISTS ALREADY: ${vid}`)
      return
    } catch (_) {
      try {
        await go(tokenID, owner)
        refreshOpensea(tokenID)
      } catch (error) {
        console.log(`FAILED TO MAKE: ${vid}`)
        console.log(`RETRY IN 1sec`)
        console.log({ error })
        setTimeout(async () => {
          makeVid(tokenID, owner)
        }, 1000)
      }
    }
  }

  makeVid(sameTokenID, newOwner)

})



var boo = function (res, int) {
  return res.status(404).send(int.toString() || '404')
}
var router = express.Router();

router.get('/list', async function (req, res, next) {
  try {
    // var work = await foliaControllerV2.works(seriesID)
    // var printed = work.printed.toNumber()
    var printed = 272
    var list = [...Array(printed)].map((_, y) => `https://chameleon.folia.app/get/${(seriesID * 1_000_000) + y + 1}.png`);
    return res.end(JSON.stringify({ list }));
  } catch (error) {
    boo(res, error)
  }
})


router.get('/gen/*', async function (req, res, next) {

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
  if (suf !== 'mp4' && suf !== 'png') return boo(res, 4)

  if (tokenID.div(1_000_000).toString() !== seriesID) return boo(res, 5)

  let owner
  try {
    owner = (await folia.ownerOf(tokenID)).toLowerCase()
  } catch (_) {
    return boo(res, 5)
  }


  // const vid = `output/${tokenID.toString() + owner}.mp4`

  try {
    console.log(`generate video ${tokenId}`)
    await go(tokenID.toString(), owner)
    refreshOpensea(tokenID.toString())
  } catch (_) {
    console.log('failed to generate video, waiting 1sec and trying again')
    setTimeout(async () => {
      try {
        await go(tokenID.toString(), owner)
      } catch (_) {
        return res.status(500).send("didn't work")
      }
    }, 1000)
  }
  return res.status(200).send("OK")

})

/* GET users listing. */
router.get('/*', async function (req, res, next) {

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
  if (suf !== 'mp4' && suf !== 'png') return boo(res, 4)

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
        if (count > 25) {
          reject()
        } else {
          setTimeout(async () => {
            try {
              await isTheVideoReady(vid, count + 1)
              resolve()
            } catch (_) {
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
    } catch (_) {
      return boo(res, "please standby")
      // await go(tokenID.toString(), owner)
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
        : fileSize - 1
      const chunksize = (end - start) + 1
      const file = fs.createReadStream(path, { start, end })
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
