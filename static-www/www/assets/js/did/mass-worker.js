import nacl from 'https://cdn.jsdelivr.net/npm/tweetnacl-es6@1.0.3/nacl-fast-es.min.js';
console.log('::::nacl=<',nacl,'>');

const MassWoker = {
  trace:true,
  debug:true
};

const createMassKey_ = () => {
  const keyPair = nacl.sign.keyPair();
  if(MassWoker.trace) {
    console.log('MassWoker::createMassKey_:keyPair=<',keyPair,'>');
  }
  self.postMessage(keyPair);
}

self.addEventListener('message', (e) =>{
  console.log('MassWoker::::e=<',e,'>');
  if(e.data.cmd === 'createKey') {
    createMassKey_();
  }  
}, false);
