var express = require('express');
const { ethers } = require("ethers");
require('dotenv').config()
contracts = require('folia-contracts')
const fs = require('fs');
const { Gone } = require('http-errors');
const go = require('../gen.js')

const seriesID = '2'
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

var router = express.Router();

/* GET users listing. */
router.get('/*', async function(req, res, next) {
  var boo = function (int) {
    return res.status(404).send(int.toString() || '404')
  }
  const splat = req.params[0]
  if (!splat) return boo(1)
  const splats = splat.split('.')
  if (splats.length !== 2) return boo(2)
  let tokenID
  try {
    tokenID = ethers.BigNumber.from(splats[0])
  } catch (_) {
    return boo(3)
  }
  const suf = splats[1]
  if(suf !== 'mp4' && suf !== 'png') return boo(4)

  if (tokenID.div(1_000_000).toString() !== seriesID) return boo(5)

  let owner
  try {
    owner = (await folia.ownerOf(tokenID)).toLowerCase()
  } catch (_) {
    return boo(5)
  }

  const vid = `output/${tokenID.toString() + owner}.mp4`

  try {
    fs.accessSync(vid)
  } catch (_) {
    await go(tokenID.toString(), owner)
  }

  try {
    fs.accessSync(vid)
  } catch (_) {
    boo(6)
  }

  if (suf == 'mp4') {
    const data = fs.readFileSync(vid)
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
    })
    return res.end(data);
  } else {
    const data = fs.readFileSync(vid.replace('.mp4', '/00040.png').replace('output', 'go'))
    res.writeHead(200, {
      'Content-Type': 'image/png',
    })
    return res.end(data);
  }
});

module.exports = router;