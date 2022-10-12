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
    this.ready1_ = false;
    this.ready2_ = false;
    const self = this;
    this.massAuth_ = new MassStore(null,()=>{
      self.ready1_ = true;
      self.tryCallReady_(cb);
    });
    this.massRecovery_ = new MassStore(null,() => {
      self.ready2_ = true;
      self.tryCallReady_(cb);
    });
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
      updated:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${didCode}#${this.massAuth_.address()}`,
          type: 'ed25519',
          publicKeyBase64: this.massAuth_.pub(),
        },
        {
          id:`${didCode}#${this.massRecovery_.address()}`,
          type: 'ed25519',
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
  appendDocument(keyid) {
    return didDoc;
  }
  tryCallReady_(cb) {
    if(this.ready1_ && this.ready2_) {
      this.document();
      cb();
    }
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
    this.loadAuthMass_();
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
  appendDocument(keyid,keyB64) {
    if(DIDLinkedDocument.debug) {
      console.log('DIDLinkedDocument::appendDocument:keyid=<',keyid,'>');
      console.log('DIDLinkedDocument::appendDocument:keyB64=<',keyB64,'>');
      console.log('DIDLinkedDocument::appendDocument:this.didDoc_=<',this.didDoc_,'>');
    }
    const didCode = this.didDoc_.id;
    const newDidDoc = Object.assign({},this.didDoc_);
    newDidDoc.updated = (new Date()).toISOString();
    const newPublicKey = {
      id:`${didCode}#${keyid}`,
      type: 'ed25519',
      publicKeyBase64: keyB64,      
    };
    newDidDoc.publicKey.push(newPublicKey);
    newDidDoc.authentication.push(`${didCode}#${keyid}`);
    delete newDidDoc.proof;
    const creator = `${didCode}#${this.massAuth_.address_}`;
    const proofs = this.didDoc_.proof.filter(( proof ) => {
      return proof.creator !== creator;
    });
    const signedMsg = this.massAuth_.signWithoutTS(newDidDoc);
    const proof = {
      type:'ed25519',
      creator:creator,
      signatureValue:signedMsg.auth.sign,
    };
    proofs.push(proof); 
    newDidDoc.proof = proofs;
    return newDidDoc;
  }
  loadAuthMass_() {
    if(DIDLinkedDocument.debug) {
      console.log('DIDLinkedDocument::loadAuthMass_:this.didDoc_=<',this.didDoc_,'>');
    }
    const self = this;
    for(const authentication of this.didDoc_.authentication) {
      if(DIDLinkedDocument.debug) {
        console.log('DIDLinkedDocument::loadAuthMass_:authentication=<',authentication,'>');
      }
      const authParams = authentication.split('#');
      if(authParams.length >1 ) {
        const keyId = authParams[authParams.length-1];
        if(DIDLinkedDocument.debug) {
          console.log('DIDLinkedDocument::loadAuthMass_:keyId=<',keyId,'>');
        }
        if(keyId && !this.massAuth_) {
          const mass = new MassStore(keyId,(good)=>{
            if(DIDLinkedDocument.debug) {
              console.log('DIDLinkedDocument::loadAuthMass_:good=<',good,'>');
            }
            if(good) {
              self.massAuth_ = mass;
              if(typeof self.cb_ === 'function') {
                self.cb_();
              }
            }
          });
        }
      }
    }
  }
}


export class DIDGuestDocument {
  static debug = true;
  constructor(address,cb) {
    this.address_ = address;
    const self = this;
    this.massAuth_ = new MassStore(null,() => {
      self.document();
      cb();
    });
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
      updated:(new Date()).toISOString(),
      publicKey:[
        {
          id:`${this.address()}#${this.massAuth_.address()}`,
          type: 'ed25519',
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
