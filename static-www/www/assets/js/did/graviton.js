import {MassStore} from './mass-store.js';
//import * as mqtt from 'https://cdn.jsdelivr.net/npm/mqtt@4.3.7/dist/mqtt.min.js';

const iConstOneHourInMs  = 1000 * 3600;
export class Graviton {
  static trace = false;
  static debug = true;
  constructor(evidences,resolve,cb) {
    if(Graviton.trace) {
      console.log('Graviton::constructor:evidences=<',evidences,'>');
    }
    this.evidences_ = evidences;
    this.cb_ = cb;
    this.mqttJwt_ = resolve;
    this.mass_ = false;
    const self = this;
    this.searchMassOfMine_((mass)=>{
      if(Graviton.trace) {
        console.log('Graviton::constructor:mass=<',mass,'>');
      }
      if(self.mass_ === false) {
        self.mass_ = mass;
        self.checkLocalMqttJwt_();
      }
    });
  }
  publish(topic,msg) {
    if(Graviton.debug) {
      console.log('Graviton::publish:topic=<',topic,'>');
    }
    const msgSigned = this.mass_.sign(msg);
    if(Graviton.debug) {
      console.log('Graviton::publish:msgSigned=<',msgSigned,'>');
    }
    this.mqttClient_.publish(topic,JSON.stringify(msgSigned));
  }
  
  searchMassOfMine_(cb) {
    if(Graviton.trace) {
      console.log('Graviton::searchMassOfMine_:this.evidences_=<',this.evidences_,'>');
    }
    for(const evidence of this.evidences_) {
      if(Graviton.trace) {
        console.log('Graviton::searchMassOfMine_:evidence=<',evidence,'>');
      }
      for(const publicKey of evidence.publicKey) {
        if(Graviton.trace) {
          console.log('Graviton::searchMassOfMine_:publicKey=<',publicKey,'>');
        }
        const keyId= publicKey.id
        if(Graviton.trace) {
          console.log('Graviton::searchMassOfMine_:keyId=<',keyId,'>');
        }
        const keyIdParams = publicKey.id.split('#');
        if(Graviton.trace) {
          console.log('Graviton::searchMassOfMine_:keyIdParams=<',keyIdParams,'>');
        }
        if(keyIdParams.length > 1) {
          const keyAddress = keyIdParams[1];
          if(Graviton.trace) {
            console.log('Graviton::searchMassOfMine_:keyAddress=<',keyAddress,'>');
          }
          const mass = new MassStore(keyAddress,()=>{
            if(Graviton.trace) {
              console.log('Graviton::searchMassOfMine_:mass=<',mass,'>');
            }
            if(typeof cb === 'function') {
              cb(mass)
            }
          });
        }
      }
    }
  }
  
  checkLocalMqttJwt_() {
    if(Graviton.debug) {
      console.log('Graviton::checkLocalMqttJwt_:this.mass_=<',this.mass_,'>');
    }
    const jwtLSKey = `${constDIDTeamAuthGravitonJwtPrefix}/${this.mass_.address_}`;
    if(Graviton.debug) {
      console.log('Graviton::checkLocalMqttJwt_:jwtLSKey=<',jwtLSKey,'>');
    }
    const jwtStr = localStorage.getItem(jwtLSKey);
    if(jwtStr) {
      try {
        const jwt = JSON.parse(jwtStr);
        if(Graviton.debug) {
          console.log('Graviton::checkLocalMqttJwt_:jwt=<',jwt,'>');
        }
        if(jwt.payload && jwt.payload.exp ) {
          const jwtExpDate = new Date();
          const timeInMs = parseInt(jwt.payload.exp) *1000;
          jwtExpDate.setTime(timeInMs);
          if(Graviton.debug) {
            console.log('Graviton::checkLocalMqttJwt_:jwtExpDate=<',jwtExpDate,'>');
          }
          const exp_remain_ms = jwtExpDate - new Date();
          if(Graviton.debug) {
            console.log('Graviton::checkLocalMqttJwt_:exp_remain_ms=<',exp_remain_ms,'>');
          }
          if(exp_remain_ms > iConstOneHourInMs) {
            return this.createMqttConnection_(jwt.jwt,jwt.payload);
          }
        }
      } catch(err) {
        console.error('Graviton::checkLocalMqttJwt_:err=<',err,'>');
      }
    }
    this.reqMqttAuthOfJwt_();
  }
  reqMqttAuthOfJwt_() {
    if(Graviton.trace) {  
      console.log('Graviton::reqMqttAuthOfJwt_:this.evidences_=<',this.evidences_,'>');
    }
    this.createMqttAuthOfJwtConnection_();
  }
  createMqttAuthOfJwtConnection_() {
    if(Graviton.trace) {
      console.log('Graviton::createMqttAuthOfJwtConnection_:this.mqttJwt_=<',this.mqttJwt_,'>');
    }    
    const wsClient = new WebSocket(this.mqttJwt_);
    if(Graviton.debug) {
      console.log('Graviton::wsClient=<',wsClient,'>');
    }
    const self = this;
    wsClient.onopen = (evt)=> {
      if(Graviton.debug) {
        console.log('Graviton::createMqttAuthOfJwtConnection_::onopen:evt=<',evt,'>');
      }
      setTimeout(()=>{
        self.onMqttJwtChannelOpened_(wsClient);
      },100)
    }
    wsClient.onclose = (evt)=> {
      if(Graviton.debug) {
        console.log('Graviton::createMqttAuthOfJwtConnection_::onclose:evt=<',evt,'>');
      }
    }
    wsClient.onerror = (err)=> {
      console.error('Graviton::createMqttAuthOfJwtConnection_::onerror:err=<',err,'>');
    }
    wsClient.onmessage = (evt)=> {
      if(Graviton.debug) {
        console.log('Graviton::createMqttAuthOfJwtConnection_::onmessage:evt=<',evt,'>');
      }
      try {
        const msg = JSON.parse(evt.data);
        if(Graviton.debug) {
          console.log('Graviton::createMqttAuthOfJwtConnection_::onmessage:msg=<',msg,'>');
        }
        if(msg.jwt && msg.payload) {
          self.onMqttJwtReply_(msg.jwt,msg.payload,evt.data);
        }
      } catch(err) {
        console.error('Graviton::createMqttAuthOfJwtConnection_::onmessage:err=<',err,'>');
      }
    }

  }
  onMqttJwtChannelOpened_ (wsClient) {
    if(Graviton.debug) {
      console.log('onMqttJwtChannelOpened_::wsClient=<',wsClient,'>');
      console.log('onMqttJwtChannelOpened_::this.evidences_=<',this.evidences_,'>');
      console.log('Graviton::reqMqttAuthOfJwt_:this.mass_=<',this.mass_,'>');
    }
    const jwtReq = {
      jwt:{
        browser:true,
        address:this.mass_.address_,
      },
      evidences:this.evidences_
    }
    const signedJwtReq = this.mass_.sign(jwtReq);
    if(Graviton.debug) {
      console.log('onMqttJwtChannelOpened_::signedJwtReq=<',signedJwtReq,'>');
    }
    wsClient.send(JSON.stringify(signedJwtReq));
  }
  onMqttJwtReply_(jwt,payload,origData) {
    if(Graviton.debug) {
      console.log('onMqttJwtReply_::jwt=<',jwt,'>');
      console.log('onMqttJwtReply_::payload=<',payload,'>');
    }
    if(payload.keyid) {
      const jwtLSKey = `${constDIDTeamAuthGravitonJwtPrefix}/${payload.keyid}`;
      localStorage.setItem(jwtLSKey,origData);
    }
    this.createMqttConnection_(jwt,payload);
  }
  
  createMqttConnection_(jwt,payload) {
    if(Graviton.debug) {
      console.log('Graviton::createMqttConnection_:payload=<',payload,'>');
    }
    this.clientid_ = `${payload.clientid}@${this.mass_.randomId()}`;
    this.username_ = payload.username;
    this.did_ = payload.did;
    const options = {
      // Authentication
      clientId: this.clientid_,
      username: this.username_,
      password: jwt,
      protocolVersion:5,
      keepalive: 60*5,
      connectTimeout: 4000,
      clean: true,
      rejectUnauthorized: false
    }
    if(Graviton.debug) {
      console.log('Graviton::createMqttConnection_:options=<',options,'>');
    }
    this.mqttClient_ = mqtt.connect(payload.mqtt_uri,options);
    const self = this;
    this.mqttClient_.on('connect', () => {
      console.log('Graviton::createMqttConnection_ connect self.mqttClient_.connected:=<', self.mqttClient_.connected, '>');
    });
    this.mqttClient_.on('message', (channel, message) => {
      self.onMqttMessage_(channel, message);
    });
    const topics = [];
    if(payload.acl && payload.acl.all) {
      for(const topic of payload.acl.all) {
        topics.push(topic);
      }
    }
    if(payload.acl && payload.acl.sub) {
      for(const topic of payload.acl.sub) {
        topics.push(topic);
      }
    }
    this.mqttClient_.subscribe(topics,{qos:1,nl:true},(err, granted)=>{
      if(err) {
        console.error('Graviton::createMqttConnection_ subscribe err:=<', err, '>');
      }      
      console.log('Graviton::createMqttConnection_ subscribe granted:=<', granted, '>');      
    });
  }  

  onMqttMessage_(channel, message) {
    if(Graviton.debug) {
      console.log('Graviton::onMqttMessage_ channel:=<', channel, '>');
      console.log('Graviton::onMqttMessage_ message:=<', message, '>');
    }
    const msgStr = new TextDecoder().decode(message);
    if(Graviton.debug) {
      console.log('Graviton::onMqttMessage_ msgStr:=<', msgStr, '>');
    }
    try {
      const msgJson = JSON.parse(msgStr);
      if(Graviton.debug) {
        console.log('Graviton::onMqttMessage_ msgJson:=<', msgJson, '>');
      }
      const goodAuthed = this.mass_.verify(msgJson);
      if(Graviton.debug) {
        console.log('Graviton::onMqttMessage_ goodAuthed:=<', goodAuthed, '>');
      }
      /*
      if(goodAuthed && typeof this.cb_ === 'function') {
        if(channel.endsWith('/graviton/joined')) {
          this.onGravitonJoined_(msgJson);
        }
        this.cb_(channel, msgJson);
      }
      */
    } catch(err) {
      console.error('Graviton::onMqttMessage_ err:=<', err, '>');
      console.error('Graviton::onMqttMessage_ msgStr:=<', msgStr, '>');
    }
  }
  
  
  onGravitonJoined_(nodeMsg) {
    if(Graviton.debug) {
      console.log('Graviton::onGravitonJoined_ nodeMsg:=<', nodeMsg, '>');
    }
    const topic = 'joined';
    const fullTopic = `${this.username_}/graviton/${topic}`;
    if(nodeMsg.offer) {
      const echoWorld = {
        topic: fullTopic,
        clientid:this.clientid_,
        username:this.username_,
        address:this.mass_.address_,
        answer:true,
      }
      if(Graviton.debug) {
        console.log('Graviton::onGravitonJoined_::echoWorld=<',echoWorld,'>');
      }
      this.publish_(fullTopic,echoWorld);      
    }
  }
  publish_(fullTopic,msg) {
    const signedMsg = this.mass_.sign(msg);
    if(Graviton.debug) {
      console.log('Graviton::publish_::signedMsg=<',signedMsg,'>');
    }
    if(Graviton.debug) {
      console.log('Graviton::publish_::fullTopic=<',fullTopic,'>');
    }
    this.mqttClient_.publish(fullTopic,JSON.stringify(signedMsg),{qos:1},(err) => {
      if(Graviton.debug) {
        console.log('Graviton::publish_::err=<',err,'>');
      }      
    });
    
  }
}

