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
      authentication:[
        {
          id:`${this.address()}#`,
          type: 'ed25519',
          controller: `${this.address()}`,
          publicKeyBase64: this.pub(),
        }
      ],
      service: [
        {
          id:`${this.address()}#`,
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
      ]
    };
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
