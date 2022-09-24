import { Evidence,ChainOfEvidence } from './did/evidence.js';
export class DIDAuth {
  static debug = false;
  static name_ = null;
  constructor() {
    DIDAuth.name_ = localStorage.getItem(constDIDAuthName);
    this.cov_ = new ChainOfEvidence();
  }
  pub() {
  }
  address() {
    return this.cov_.address();
  }
  name() {
    return DIDAuth.name_;
  }
  document() {
    return this.cov_.document();
  }
  storeName(name) {
    DIDAuth.name_ = name;
    localStorage.setItem(constDIDAuthName,name);
  }
  createDid() {
    this.cov_.createSeed();
  }
  joinDid(id) {
    this.cov_.joinDid(id);
  }
}
