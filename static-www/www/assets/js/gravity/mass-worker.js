import * as NACL from 'https://cdn.jsdelivr.net/npm/tweetnacl@1.0.3/nacl-fast.min.js';
console.log('::::NACL=<',NACL,'>');

self.addEventListener('message', (e) =>{
  console.log('MassWoker::::e=<',e,'>');
  if(e.data === 'startMineKey') {
    mineMassStoreKey_();
  }
}, false);
//console.log('::::self=<',self,'>');

const MassWoker = {
  trace:true,
  debug:false
};


const mineMassStoreKey_ = () => {
  while(true) {
    const keyPair = nacl.sign.keyPair();
    if(MassWoker.trace) {
      console.log('MassWoker::mineMassStoreKey_:keyPair=<',keyPair,'>');
    }
    const b64Pub = nacl.util.encodeBase64(keyPair.publicKey);
    if(MassWoker.trace) {
      console.log('MassWoker::mineMassStoreKey_:b64Pub=<',b64Pub,'>');
    }
    const address = calcAddress_(b64Pub);
    if(address.startsWith('mp')) {
      return keyPair;
    }
  }
}

const calcAddress_ = (b64Pub) => {
  const binPub = nacl.util.decodeBase64(b64Pub);
  const hash512 = nacl.hash(binPub);
  const hash512B64 = nacl.util.encodeBase64(hash512);
  const hash1Pub = CryptoJS.SHA1(hash512B64).toString(CryptoJS.enc.Base64);
  if(MassWoker.trace) {
    console.log('MassWoker::calcAddress_:hash1Pub=<',hash1Pub,'>');
  }
  const hash1pubBuffer = nacl.util.decodeBase64(hash1Pub);
  if(MassWoker.trace) {
    console.log('MassWoker::calcAddress_:hash1pubBuffer=<',hash1pubBuffer,'>');
  }
  const encoder = new base32.Encoder({ type: "rfc4648", lc: true });
  const address = encoder.write(hash1pubBuffer).finalize();
  if(MassWoker.trace) {
    console.log('MassWoker::calcAddress_:address=<',address,'>');
  }
  return address;
}

