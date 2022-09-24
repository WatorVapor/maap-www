import {MassStore} from '../gravity/mass-store.js';
import {DIDSeedDocument,DIDLinkedDocument,DIDGuestDocument} from './document.js';

export class Evidence {
  static trace = false;
  static debug = true;
  static did_method = 'maap';
  constructor(docJson,cb) {
    this.good = false;
    if(Evidence.trace) {
      console.log('Evidence::constructor:MassStore=<',MassStore,'>');
    }
    if(Evidence.debug) {
      console.log('Evidence::constructor:docJson=<',docJson,'>');
    }
    if(docJson) {
      if(docJson._maap_guest) {
        this.joinDid(docJson,cb);
      } else {
        this.createFromJson_(docJson,cb);
      }
    } else {
      this.createSeed_(cb);
    }
  }
  address(){
    if(this.didDoc_) {
      return this.didDoc_.address();
    }
    return `did:${Evidence.did_method}:`;
  }
  document() {
    if(this.didDoc_) {
      return this.didDoc_.document();
    }
    return {};
  }
  
  
  createFromJson_(docJson,cb) {
    if(Evidence.debug) {
      console.log('Evidence::createFromJson_:docJson=<',docJson,'>');
    }
    this.didDoc_ = new DIDLinkedDocument(docJson,cb);
  }
  createSeed_(cb) {
    this.didDoc_ = new DIDSeedDocument(cb);
  }
  joinDid(docJson,cb) {
    if(Evidence.debug) {
      console.log('Evidence::joinDid:docJson=<',docJson,'>');
    }
    this.didDoc_ = new DIDGuestDocument(docJson.id,cb);
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
  joinDid(id) {
    const guestEviJson = {id:id,_maap_guest:true};
    this.topEvidence_ = new Evidence(guestEviJson,()=> {
      const doc = this.topEvidence_.document();
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::joinDid:doc=<',doc,'>');
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
