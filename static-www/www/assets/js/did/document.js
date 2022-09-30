import {MassStore} from './mass-store.js';

export class DIDDocument {
  static debug = true;
  static did_method = 'maap';
  static did_context = 'https://www.wator.xyz/maap/';
  static did_mqtt_end_point = 'wss://wator.xyz:8084/jwt/did';
  static did_mqtt_uri = 'wss://wator.xyz:8084/mqtt';
  constructor() {
  }
}

export class DIDSeedDocument {
  static debug = true;
  constructor(cb) {
    this.massAuth_ = new MassStore(null,cb);
    this.massRecovery_ = new MassStore(null,cb);
  }
  address() {
    return `did:${DIDDocument.did_method}:${this.massAuth_.address()}`;
  }
  document() {
    const didCode = `did:${DIDDocument.did_method}:${this.massAuth_.address()}`;
    const didDoc = {
      '@context':`${DIDDocument.did_context}`,
      id:didCode,
      version:1.0,
      created:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${didCode}#${this.massAuth_.address()}`,
          type: 'ed25519',
          controller: `${this.massAuth_.address()}`,
          publicKeyBase64: this.massAuth_.pub(),
        },
        {
          id:`${didCode}#${this.massRecovery_.address()}`,
          type: 'ed25519',
          controller: `${this.massRecovery_.address()}`,
          publicKeyBase64: this.massRecovery_.pub(),
        },
      ],
      authentication:[
        `${didCode}#${this.massAuth_.address()}`,
      ],
      recovery:[
       `${didCode}#${this.massRecovery_.address()}`,
     ],
      service: [
        {
          id:`${didCode}#${this.massAuth_.address()}`,
          type: 'mqtturi',
          serviceEndpoint: `${DIDDocument.did_mqtt_end_point}`,
          serviceMqtt:{
            uri:`${DIDDocument.did_mqtt_uri}`,
            acl:{
              all:[
              `${didCode}/#`,
              ]
            }
          }
        },
      ],
    };
    const proofs = [];
    const signedMsg = this.massAuth_.signWithoutTS(didDoc);
    const proof = {
      type:'ed25519',
      creator:`${didCode}#${this.massAuth_.address_}`,
      signatureValue:signedMsg.auth.sign,
    };
    proofs.push(proof);
    
    didDoc.proof = proofs;
    this.didDoc_ = didDoc;
    return didDoc;
  }
}

export class DIDLinkedDocument {
  static debug = true;
  constructor(evidence,cb) {
    if(DIDLinkedDocument.debug) {
      console.log('DIDLinkedDocument::constructor:evidence=<',evidence,'>');
    }
    this.cb_ = cb;
    this.address_ = evidence.id;
    this.didDoc_ = evidence;
    setTimeout(()=> {
      if(typeof this.cb_ === 'function') {
        this.cb_();
      }
    },1);
  }
  address() {
    return this.address_;
  }
  document() {
    if(DIDLinkedDocument.debug) {
      console.log('DIDLinkedDocument::document:this.didDoc_=<',this.didDoc_,'>');
    }
    return this.didDoc_;
  }
}


export class DIDGuestDocument {
  static debug = true;
  constructor(address,cb) {
    this.address_ = address;
    this.massAuth_ = new MassStore(null,cb);
  }
  address() {
    return this.address_;
  }
  document() {
    const didDoc = {
      '@context':`${DIDDocument.did_context}`,
      id:this.address(),
      version:1.0,
      created:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${this.address()}#${this.massAuth_.address()}`,
          type: 'ed25519',
          controller: `${this.massAuth_.address()}`,
          publicKeyBase64: this.massAuth_.pub(),
        }
      ],
      authentication:[
        `${this.address()}#${this.massAuth_.address()}`,
      ],
      service: [
        {
          id:`${this.address()}#${this.massAuth_.address()}`,
          type: 'mqtturi',
          serviceEndpoint: `${DIDDocument.did_mqtt_end_point}`,
          serviceMqtt:{
            uri:`${DIDDocument.did_mqtt_uri}`,
            acl:{
              all:[
                `${this.address()}/guest/#`,
              ]
            }
          }
        },
      ],
    };
    const proofs = [];
    const signedMsg = this.massAuth_.signWithoutTS(didDoc);
    const proof = {
      type:'ed25519',
      creator:`${this.address()}#${this.massAuth_.address_}`,
      signatureValue:signedMsg.auth.sign,
    };
    proofs.push(proof);
    didDoc.proof = proofs;
    super.didDoc_ = didDoc;
    return didDoc;
  }
}
