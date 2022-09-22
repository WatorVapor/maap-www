import {MassStore} from '../gravity/mass-store.js';
export class DIDDocument {
  static debug = true;
  static did_method = 'maap';
  constructor(id) {
    if(DIDDocument.debug) {
      console.log('DIDDocument::constructor:id=<',id,'>');
    }
    this.address_ = id;
  }
  address() {
    return this.address_;
  }
}

export class DIDSeedDocument extends DIDDocument {
  static debug = true;
  constructor(cb) {
    this.massAuth_ = new MassStore(null,cb);
    this.massRecovery_ = new MassStore(null,cb);
    const address = `did:${DIDDocument.did_method}:${this.massAuth_.address()}`;
    super(address);
  }
  document() {
    const didDoc = {
      '@context':'https://www.wator.xyz/maap/',
      id:super.address(),
      version:1.0,
      created:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${this.massAuth_.address()}#${this.massAuth_.address()}`,
          type: 'ed25519',
          controller: `${this.massAuth_.address()}`,
          publicKeyBase64: this.massAuth_.pub(),
        },
        {
          id:`${this.massRecovery_.address()}#${this.massRecovery_.address()}`,
          type: 'ed25519',
          controller: `${this.massRecovery_.address()}`,
          publicKeyBase64: this.massRecovery_.pub(),
        },
      ],
      authentication:[
        `${this.massAuth_.address()}#${this.massAuth_.address()}`,
      ],
      recovery:[
       `${this.massRecovery_.address()}#${this.massRecovery_.address()}`,
     ],
      service: [
        {
          id:`${this.massAuth_.address()}#${this.massAuth_.address()}`,
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
    didDoc.proof = [];
    const signedMsg = this.massAuth_.signWithoutTS(didDoc);
    const proof = {
      type:'ed25519',
      creator:`${this.address()}#${this.massAuth_.address_}`,
      signatureValue:signedMsg.auth.sign,
    };
    didDoc.proof.push(proof);
    
    const signedMsg2 = this.massRecovery_.signWithoutTS(didDoc);
    const proof2 = {
      type:'ed25519',
      creator:`${this.address()}#${this.massRecovery_.address_}`,
      signatureValue:signedMsg2.auth.sign,
    };
    didDoc.proof.push(proof2);
    super.didDoc_ = didDoc;
    return didDoc;
  }
}

export class DIDLinkedDocument extends DIDDocument {
  static debug = true;
  constructor(evidence,cb) {
    if(DIDLinkedDocument.debug) {
      console.log('DIDLinkedDocument::constructor:evidence=<',evidence,'>');
    }
    super(evidence.id);
    this.didDoc_ = evidence;
  }
  document() {
    return this.didDoc_;
  }
}


export class DIDGuestDocument extends DIDDocument {
  static debug = true;
  constructor(id,cb) {
    this.massAuth_ = new MassStore(null,cb);
    super(id);
  }
  document() {
    const didDoc = {
      '@context':'https://www.wator.xyz/maap/',
      id:super.address(),
      version:1.0,
      created:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${super.address()}#${this.massAuth_.address()}`,
          type: 'ed25519',
          controller: `${this.massAuth_.address()}`,
          publicKeyBase64: this.massAuth_.pub(),
        }
      ],
      authentication:[
        `${super.address()}#${this.massAuth_.address()}`,
      ],
      service: [
        {
          id:`${super.address()}#${this.massAuth_.address()}`,
          type: 'mqtturi',
          serviceEndpoint: 'wss://wator.xyz:8084/jwt',
          serviceMqtt:{
            uri:'wss://wator.xyz:8084/mqtt',
            acl:{
              all:[
                '${username}/guest/#',
              ]
            }
          }
        },
      ],
    };
    didDoc.proof = [];
    const signedMsg = this.massAuth_.signWithoutTS(didDoc);
    const proof = {
      type:'ed25519',
      creator:`${this.address()}#${this.massAuth_.address_}`,
      signatureValue:signedMsg.auth.sign,
    };
    didDoc.proof.push(proof);
    super.didDoc_ = didDoc;
    return didDoc;
  }
}
