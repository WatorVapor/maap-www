import * as MASS from '../gravity/mass.js';
export class DIDDocument {
  static debug = true;
  constructor(prefix) {
    if(DIDDocument.debug) {
      console.log('DIDDocument::constructor:MASS=<',MASS,'>');
    }
    this.mass_ = new MASS.Mass(prefix);
    if(DIDDocument.debug) {
      console.log('DIDDocument::constructor:this.mass_=<',this.mass_,'>');
    }
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
}

export class DIDSeedDocument extends DIDDocument {
  static debug = true;
  constructor() {
    super(constDIDAuthMassPrefix);
  }
}

export class DIDGuestDocument extends DIDDocument {
  static debug = true;
  constructor() {
    super(constDIDAuthMassPrefix);
  }
}
