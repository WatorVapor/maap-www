import * as MASS from './gravity/mass.js';
export class DIDAuth {
  static DIDAuth = true;
  constructor() {
    if(DIDAuth.debug) {
      console.log('DIDAuth::constructor:MASS=<',MASS,'>');
    }
    this.mass_ = new MASS.Mass(constDIDAuthPrefix);
    if(DIDAuth.debug) {
      console.log('DIDAuth::constructor:this.mass_=<',this.mass_,'>');
    }
    DIDAuth.name_ = localStorage.getItem(constEdAuthName);
  }
  pub() {
    return this.mass_.pubKeyB64_;
  }
  secret() {
    return this.mass_.priKeyB64_;
  }
  address() {
    return 'did:maap:' + this.mass_.address_;
  }
  name() {
    return DIDAuth.name_;
  }
  document() {
    const didDoc = {
      '@context':'https://www.wator.xyz/maap/',
      id:this.address(),
      version:1.0,
      created:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${this.address()}#${this.mass_.address_}`,
          type: 'ed25519',
          controller: `${this.address()}`,
          publicKeyBase64: this.pub(),
        }
      ],
      authentication:[
        `${this.address()}#${this.mass_.address_}`,
      ],
      recovery:[],
      service: [
        {
          id:`${this.address()}#${this.mass_.address_}`,
          type: 'mqtturi',
          serviceEndpoint: 'wss://wator.xyz:8084/jwt',
          serviceMqtt:{
            uri:'wss://wator.xyz:8084/mqtt',
            acl:{
              all:[
                '${username}/#',
              ]
            }
          }
        },
      ],
    };
    const signedMsg = this.mass_.signWithoutTS(didDoc);
    const proof = {
      type:'ed25519',
      creator:`${this.address()}#${this.mass_.address_}`,
      signatureValue:signedMsg.auth.sign,
    };
    didDoc.proof = [];
    didDoc.proof.push(proof);
    return didDoc;
  }
  storeName(name) {
    DIDAuth.name_ = name;
    localStorage.setItem(constEdAuthName,name);
  }
  verifySecretKey(secretKey) {
    if(DIDAuth.debug) {
      console.log('DIDAuth::verifySecretKey:secretKey=<',secretKey,'>');
    }
    return this.mass_.verifySecretKey(secretKey);
  }

  importSecretKey(secretKey) {
    if(DIDAuth.debug) {
      console.log('DIDAuth::importSecretKey:secretKey=<',secretKey,'>');
    }
    return this.mass_.importSecretKey(secretKey);
  }
  static debug = false;
  static name_ = null;
}
