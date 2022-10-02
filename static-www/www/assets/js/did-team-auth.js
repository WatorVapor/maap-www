import { Evidence,ChainOfEvidence } from './did/evidence.js';
export class DIDTeamAuth {
  static debug = false;
  static name_ = null;
  constructor(cb) {
    DIDTeamAuth.name_ = localStorage.getItem(constDIDAuthName);
    this.cb_ = cb;
    this.cov_ = new ChainOfEvidence(cb);
  }
  pub() {
  }
  address() {
    return this.cov_.address();
  }
  name() {
    return DIDTeamAuth.name_;
  }
  document() {
    return this.cov_.document();
  }
  storeName(name) {
    DIDTeamAuth.name_ = name;
    localStorage.setItem(constDIDAuthName,name);
  }
  createDid(cb) {
    this.cov_.createSeed(cb);
  }
  joinDid(id,cb) {
    this.cov_.joinDid(id,cb);
  }
  isMember() {
    return this.cov_.isMember();
  }
  reqJoinTeam() {
    return this.cov_.reqJoinTeam();
  }
}
