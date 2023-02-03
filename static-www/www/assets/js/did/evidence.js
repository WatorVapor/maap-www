import {DIDSeedDocument,DIDLinkedDocument,DIDGuestDocument} from './document.js';
import {Graviton} from './graviton.js';

import {Level} from 'https://cdn.jsdelivr.net/npm/level@8.0.0/+esm'

export class Evidence {
  static trace = false;
  static debug = true;
  static did_method = 'maap';
  static did_resolve = 'wss://wator.xyz:8084/jwt/did';
  constructor(docJson,cb,srcEvidence) {
    this.coc_ = {};
    if(Evidence.debug) {
      console.log('Evidence::constructor:docJson=<',docJson,'>');
    }
    if(srcEvidence) {
      return;
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
    if(this.didDoc) {
      return this.didDoc.address();
    }
    return `did:${Evidence.did_method}:`;
  }
  document() {
    if(this.didDoc) {
      return this.didDoc.document();
    }
    return {};
  }
  fission(newEvidence) {
    return this.createFromParent_(newEvidence);
  }
  mass(){
    return this.didDoc.massAuth_;
  }
  
  createFromJson_(docJson,cb) {
    if(Evidence.debug) {
      console.log('Evidence::createFromJson_:docJson=<',docJson,'>');
    }
    this.coc_.parent = docJson.parent;
    this.coc_.stage = docJson.stage;
    this.didDoc = new DIDLinkedDocument(docJson.didDoc,cb);
  }
  createFromParent_(newEvidence) {
    if(Evidence.debug) {
      console.log('Evidence::createFromParent_:newEvidence=<',newEvidence,'>');
    }
    const evidence = new Evidence(null,null,this);
    evidence.coc_.parent = this.calcBlockAddress_();    
    evidence.coc_.stage = 'stable';
    evidence.didDoc = this.didDoc;
    const keyId = this.calcAddress_(newEvidence.auth.pub);
    evidence.coc_.didDoc = this.didDoc.appendDocument(keyId,newEvidence.auth.pub);
    return evidence;
  }
  createSeed_(cb) {
    this.coc_.parent = null;
    this.coc_.stage = 'stable';
    this.didDoc = new DIDSeedDocument(cb);
  }
  joinDid(docJson,cb) {
    if(Evidence.debug) {
      console.log('Evidence::joinDid:docJson=<',docJson,'>');
    }
    this.coc_.parent = null;
    this.coc_.stage = 'guest';
    this.didDoc = new DIDGuestDocument(docJson.id,cb);
  }

  calcBlockAddress_() {
    const msgStr = JSON.stringify(this);
    if(Evidence.debug) {
      console.log('Evidence::calcAddress_:msgStr=<',msgStr,'>');
    }
    const msgB64 = nacl.util.encodeBase64(msgStr);
    return this.calcAddress_(msgB64);
  }
  calcStrAddress_(msgStr) {
    const msgB64 = nacl.util.encodeBase64(msgStr);
    return this.calcAddress_(msgB64);    
  }
  calcAddress_(msgB64) {
    const msgBin = nacl.util.decodeBase64(msgB64);
    const sha512 = nacl.hash(msgBin);
    const sha512B64 = nacl.util.encodeBase64(sha512);
    const sha1B64 = CryptoJS.SHA1(sha512B64).toString(CryptoJS.enc.Base64);
    if(Evidence.trace) {
      console.log('Evidence::calcAddress_:sha1B64=<',sha1B64,'>');
    }
    const sha1Buffer = nacl.util.decodeBase64(sha1B64);
    if(Evidence.trace) {
      console.log('Evidence::calcAddress_:sha1Buffer=<',sha1Buffer,'>');
    }
    const encoder = new base32.Encoder({ type: "rfc4648", lc: true });
    const address = encoder.write(sha1Buffer).finalize();
    if(Evidence.trace) {
      console.log('Evidence::calcAddress_:address=<',address,'>');
    }
    return address;
  }

}

export class ChainOfEvidence {
  static trace = false;
  static debug = true;
  static chainPrefix = 'didteam/cov';
  constructor(cb) {
    this.topEvidence_ = false;
    this.cb_ = cb;
    this.allBlocks_ = [];
    this.chainStore_ = new Level('maap_evidence_chain', { valueEncoding: 'json' });
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
    const self = this;
    this.topEvidence_ = new Evidence(null,()=> {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::createSeed:self.topEvidence_=<',self.topEvidence_.coc_,'>');
      }
      self.topEvidence_.coc_.didDoc = self.topEvidence_.document();
      localStorage.setItem(constDIDTeamAuthEvidenceTop,JSON.stringify(self.topEvidence_.coc_));
      if(typeof cb === 'function') {
        cb();
      }
      this.saveEvidencesToChain_(self.topEvidence_);
    });
  }
  joinDid(id,cb) {
    const guestEviJson = {id:id,_maap_guest:true};
    const self = this;
    this.topEvidence_ = new Evidence(guestEviJson,()=> {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::joinDid:self.topEvidence_=<',self.topEvidence_.coc_,'>');
      }
      self.topEvidence_.coc_.didDoc = self.topEvidence_.document();
      localStorage.setItem(constDIDTeamAuthEvidenceTop,JSON.stringify(self.topEvidence_.coc_));
      if(typeof cb === 'function') {
        cb();
      }
    });
  }
  isMember() {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::isMember:this.topEvidence_=<',this.topEvidence_,'>');
    }
    if(this.topEvidence_.coc_.stage === 'stable') {
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
    const topic = `${this.topEvidence_.address()}/invited/req/join/team`
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::reqJoinTeam:topic=<',topic,'>');
    }
    const msg = {
      evidence:this.topEvidence_,
      passcode:passcode,
    };
    this.graviton_.publish(topic,msg);
  }
  async allowJoinTeam(reqMsg) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::allowJoinTeam:reqMsg=<',reqMsg,'>');
    }
    const newTop = this.topEvidence_.fission(reqMsg);
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::allowJoinTeam:newTop=<',newTop,'>');
    }
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::allowJoinTeam:this.topEvidence_=<',this.topEvidence_,'>');
    }
    localStorage.setItem(constDIDTeamAuthEvidenceTop,JSON.stringify(newTop.coc_));
    await this.saveEvidencesToChain_(this.topEvidence_);
    this.topEvidence_ = newTop;
    const topic = `${newTop.address()}/invited/reply/join/team`
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::allowJoinTeam:topic=<',topic,'>');
    }
    this.pull2Root_(newTop.coc_,(evidences)=>{
      const msg = {
        top:newTop.coc_,
        evidences:evidences,
      };
      this.graviton_.publish(topic,msg);      
      /*
      setTimeout(()=>{
        location.reload();
      },1)
      */
    });
  }
  denyJoinTeam(reqMsg) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::denyJoinTeam:reqMsg=<',reqMsg,'>');
    }
    const topic = `${this.topEvidence_.address()}/invited/reply/join/team`
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::denyJoinTeam:topic=<',topic,'>');
    }
    const msg = {
      deny:true,
    };
    this.graviton_.publish(topic,msg);
  }
  
  loadEvidence_() {
    const topEviStr = localStorage.getItem(constDIDTeamAuthEvidenceTop);
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
          self.topEvidence_.coc_.didDoc = self.topEvidence_.document();
          self.pull2Root_(self.topEvidence_.coc_,(evidences)=>{
            if(ChainOfEvidence.debug) {
              console.log('ChainOfEvidence::loadEvidence_:evidences=<',evidences,'>');
            }            
          });
          self.createConnection_(self.topEvidence_);
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
    const mass = this.topEvidence_.mass();
    this.graviton_ = new Graviton(evidences,mass,Evidence.did_resolve,(good)=>{
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
    if(topic.endsWith('invited/req/join/team')) {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::onMQTTMsg_:topic=<',topic,'>');
        console.log('ChainOfEvidence::onMQTTMsg_:this.onJoinReq=<',this.onJoinReq,'>');
      }
      if(typeof this.onJoinReq === 'function') {
        this.onJoinReq(jMsg);
      }
    } else if(topic.endsWith('invited/reply/join/team')){
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::onMQTTMsg_:topic=<',topic,'>');
        console.log('ChainOfEvidence::onMQTTMsg_:this.onJoinReply=<',this.onJoinReply,'>');
      }
      if(typeof this.onJoinReply === 'function') {
        this.onJoinReply(jMsg);
      }
      if(typeof this.onJoinReplyInternal_ === 'function') {
        this.onJoinReplyInternal_(jMsg);
      }
    } else {
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::onMQTTMsg_:topic=<',topic,'>');
        console.log('ChainOfEvidence::onMQTTMsg_:jMsg=<',jMsg,'>');
      }      
    }
  }
  async saveEvidencesToChain_(evidence){
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::saveEvidencesToChain_:evidence=<',evidence,'>');
    }
    const chainAddress = evidence.calcBlockAddress_();
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::saveEvidencesToChain_:chainAddress=<',chainAddress,'>');
    }
    const chainPath = `${ChainOfEvidence.chainPrefix}/${chainAddress}`;
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::saveEvidencesToChain_:chainPath=<',chainPath,'>');
    }
    await this.chainStore_.put(chainPath,JSON.stringify(evidence.coc_));
  }
  pull2Root_(topBlock,cb) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::pull2Root_:topBlock=<',topBlock,'>');
    }
    this.allBlocks_ = [topBlock];
    this.pull2RootInternl_(topBlock,cb);
  }
  pull2RootInternl_(currBlock,cb) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::pull2RootInternl_:currBlock=<',currBlock,'>');
    }
    if(currBlock.parent) {
      const chainPath = `${ChainOfEvidence.chainPrefix}/${currBlock.parent}`;
      if(ChainOfEvidence.debug) {
        console.log('ChainOfEvidence::pull2RootInternl_:chainPath=<',chainPath,'>');
      }
      const self = this;
      this.chainStore_.getItem(chainPath,(err,value)=>{
        if(ChainOfEvidence.debug) {
          console.log('ChainOfEvidence::pull2RootInternl_:err=<',err,'>');
          console.log('ChainOfEvidence::pull2RootInternl_:value=<',value,'>');
        }
        if(err) {
          cb(self.allBlocks_);
        } else {
          const valueJson = JSON.parse(value);
          if(ChainOfEvidence.debug) {
            console.log('ChainOfEvidence::pull2RootInternl_:valueJson=<',valueJson,'>');
          }
          if(valueJson) {
            self.allBlocks_.push(valueJson);
            if(valueJson.parent) {
              self.pull2RootInternl_(valueJson,cb);
            } else {
              cb(self.allBlocks_);
            }
          } else {
            cb(self.allBlocks_);            
          }
        }
      });
    }
  }  
  
  onJoinReplyInternal_(jMsg) {
    if(ChainOfEvidence.debug) {
      console.log('ChainOfEvidence::onJoinReplyInternal_:jMsg=<',jMsg,'>');
      console.log('ChainOfEvidence::onJoinReplyInternal_:jMsg.top=<',jMsg.top,'>');
    }
    localStorage.setItem(constDIDTeamAuthEvidenceTop,JSON.stringify(jMsg.top));
  }
}

