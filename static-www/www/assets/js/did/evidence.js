import {DIDSeedDocument,DIDLinkedDocument,DIDGuestDocument} from './document.js';
import {Graviton} from './graviton.js';

export class Evidence {
  static trace = false;
  static debug = true;
  static did_method = 'maap';
  static did_resolve = 'wss://wator.xyz:8084/jwt/did';
  constructor(docJson,cb) {
    this.good = false;
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
    this.stage_ = docJson.stage;
    this.didDoc_ = new DIDLinkedDocument(docJson.didDoc,cb);
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
  constructor(cb) {
    this.topEvidence_ = false;
    this.cb_ = cb;
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
  createSeed(cb) {
    this.topEvidence_ = new Evidence(null,()=> {
      const doc = this.topEvidence_.document();
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::createSeed:doc=<',doc,'>');
      }
      const saveEvidence = {
        stage:'stable',
        didDoc:doc,
        parent:false,
      };
      localStorage.setItem(constDIDAuthEvidenceTop,JSON.stringify(saveEvidence));
      if(typeof cb === 'function') {
        cb();
      }
    });
  }
  joinDid(id) {
    const guestEviJson = {id:id,_maap_guest:true};
    this.topEvidence_ = new Evidence(guestEviJson,()=> {
      const doc = this.topEvidence_.document();
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::joinDid:doc=<',doc,'>');
      }
      const saveEvidence = {
        stage:'guest',
        didDoc:doc,
        parent:false,
      };
      localStorage.setItem(constDIDAuthEvidenceTop,JSON.stringify(saveEvidence));
    });
  }
  isMember() {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::isMember:this.topEvidence_=<',this.topEvidence_,'>');
    }
    if(this.topEvidence_.stage_ === 'stable') {
      return true;
    }
    return false;
  }
  reqJoinTeam(passcode) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::reqJoinTeam:this.topEvidence_=<',this.topEvidence_,'>');
    }
    if(this.isMember()) {
      console.log('ChainOfEvidence::reqJoinTeam:this.isMember()=<',this.isMember(),'>');
      return;
    }
    if(!this.graviton_ ) {
      console.log('ChainOfEvidence::reqJoinTeam:this.graviton_=<',this.graviton_,'>');
      return;      
    }
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::reqJoinTeam:this.graviton_=<',this.graviton_,'>');
    }
    const topic = `${this.topEvidence_.address()}/guest/req/join/team`
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::reqJoinTeam:topic=<',topic,'>');
    }
    const msg = {
      evidence:this.topEvidence_,
      passcode:passcode,
    };
    this.graviton_.publish(topic,msg);
  }
  
  loadEvidence_() {
    const topEviStr = localStorage.getItem(constDIDAuthEvidenceTop);
    if(ChainOfEvidence.trace) {
      console.log('ChainOfEvidence::loadEvidence_:topEviStr=<',topEviStr,'>');
    }
    if(topEviStr) {
      const topEviJson = JSON.parse(topEviStr);
      if(ChainOfEvidence.trace) {
        console.log('ChainOfEvidence::loadEvidence_:topEviJson=<',topEviJson,'>');
      }
      if(topEviJson) {
        const self = this;
        this.topEvidence_ = new Evidence(topEviJson,()=>{
          const doc = this.topEvidence_.document();
          if(ChainOfEvidence.trace) {
            console.log('ChainOfEvidence::loadEvidence_:doc=<',doc,'>');
          }
          self.createConnection_(this.topEvidence_);
          if(typeof self.cb_ === 'function') {
            self.cb_(true);
          }
        });
      }
    } else {
    }
  }
  createConnection_(topEvid) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::createConnection_:topEvid=<',topEvid,'>');
    }
    const evidences = [this.topEvidence_.document()];
    const self = this;
    this.graviton_ = new Graviton(evidences,Evidence.did_resolve,(good)=>{
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::createConnection_:good=<',good,'>');
      }
      self.graviton_.ready = good;
    });
    this.graviton_.onMQTTMsg = (topic,jMsg) => {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::createConnection_:topic=<',topic,'>');
        console.log('ChainOfEvidence::createConnection_:jMsg=<',jMsg,'>');
      }      
      self.onMQTTMsg_(topic,jMsg);
    }
  }
  onMQTTMsg_(topic,jMsg) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::onMQTTMsg_:topic=<',topic,'>');
      console.log('ChainOfEvidence::onMQTTMsg_:jMsg=<',jMsg,'>');
    }
    if(topic.endsWith('guest/req/join/team')) {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::onMQTTMsg_:topic=<',topic,'>');
        console.log('ChainOfEvidence::onMQTTMsg_:this.onJoinReq=<',this.onJoinReq,'>');
      }
      if(typeof this.onJoinReq === 'function') {
        this.onJoinReq(jMsg);
      }
    } else {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::onMQTTMsg_:topic=<',topic,'>');
        console.log('ChainOfEvidence::onMQTTMsg_:jMsg=<',jMsg,'>');
      }      
    }
  }
}
