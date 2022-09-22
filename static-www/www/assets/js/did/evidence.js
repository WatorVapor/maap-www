import {MassStore} from '../gravity/mass-store.js';

export class Evidence {
  static trace = false;
  static debug = true;
  static did_method = 'maap';
  constructor(docJson,cb) {
    this.good = false;
    if(Evidence.trace) {
      console.log('Evidence::constructor:MassStore=<',MassStore,'>');
    }
    if(docJson) {
      this.createFromJson_(docJson,cb);
    } else {
      this.createSeed_(cb);
    }
  }
  address(){
    if(this.didDocument) {
      return this.didDocument.id;
    }
    if(this.massAuth_) {
      const did = `did:${Evidence.did_method}:${this.massAuth_.address()}`;
      if(Evidence.trace) {
        console.log('Evidence::address:did=<',did,'>');
      }
      return did;
    }
    return `did:${Evidence.did_method}:`;
  }
  document() {
    if(this.didDocument) {
      return this.didDocument;
    }
    const didDoc = {
      '@context':'https://www.wator.xyz/maap/',
      id:this.address(),
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
    
    
    this.didDocument = didDoc;
    return didDoc;
  }
  
  
  createFromJson_(docJson,cb) {
    if(Evidence.debug) {
      console.log('Evidence::createFromJson_:docJson=<',docJson,'>');
    }
    this.didDocument = docJson;
    //this.massAuth_ = new MassStore(docJson,cb);
  }
  createSeed_(cb) {
    this.massAuth_ = new MassStore(null,cb);
    this.massRecovery_ = new MassStore(null,cb);
  }
}

export class ChainOfEvidence {
  static trace = false;
  static debug = true;
  constructor() {
    this.topEvidence_ = false;
    this.loadEvidence_();
  }
  address() {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::address:this.topEvidence_=<',this.topEvidence_,'>');
    }
    if(this.topEvidence_) {
      return this.topEvidence_.address();
    }
    return `did:${Evidence.did_method}:`;
  }
  document() {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::address:this.topEvidence_=<',this.topEvidence_,'>');
    }
    if(this.topEvidence_) {
      return this.topEvidence_.document();
    }
    return {};
  }
  createSeed() {
    this.topEvidence_ = new Evidence(null,()=> {
      const doc = this.topEvidence_.document();
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::createSeed:doc=<',doc,'>');
      }
      localStorage.setItem(constDIDAuthEvidenceTop,JSON.stringify(doc));
    });
  }
  loadEvidence_() {
    const topEviStr = localStorage.getItem(constDIDAuthEvidenceTop);
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::loadEvidence_:topEviStr=<',topEviStr,'>');
    }
    if(topEviStr) {
      const topEviJson = JSON.parse(topEviStr);
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::loadEvidence_:topEviJson=<',topEviJson,'>');
      }
      if(topEviJson) {
        this.topEvidence_ = new Evidence(topEviJson,()=>{
          const doc = this.topEvidence_.document();
          if(ChainOfEvidence.debug) {
            console.log('ChainOfEvidence::createSeed:doc=<',doc,'>');
          }          
        });
      }
    } else {
    }
  }
}
