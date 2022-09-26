export class Graviton {
  static trace = true;
  static debug = true;
  constructor(evidences,cb) {
    if(Graviton.trace) {
      console.log('Graviton::constructor:evidences=<',evidences,'>');
    }
    this.evidences_ = evidences;
    this.cb_ = cb;
    this.reqMqttAuthOfJwt_();
    //this.createMqttClient_();
  }
  reqMqttAuthOfJwt_() {
    if(Graviton.trace) {
      console.log('Graviton::reqMqttAuthOfJwt_:this.evidences_=<',this.evidences_,'>');
    }
    if(this.evidences_.length > 0 && this.evidences_[0].service.length > 0) {
      this.mqttJwt_ = this.evidences_[0].service[0].serviceEndpoint;
      if(Graviton.trace) {
        console.log('Graviton::reqMqttAuthOfJwt_:this.mqttJwt_=<',this.mqttJwt_,'>');
        this.createMqttAuthOfJwtConnection_();
      }
    } else {
      if(typeof this.cb_ === 'function') {
        this.cb_(false);
      }
    }
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
          onMqttJwtReply_(msg.jwt,msg.payload,evt.data);
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
    }
    wsClient.send(JSON.stringify(this.evidences_));
  }
  
  createMqttClient_() {
    const keyPath = `${constMansionMqttJwtPrefix}/${this.mass_.address_}`
    if(Graviton.trace) {
      console.log('Graviton::createMqttClient_:keyPath=<',keyPath,'>');
    }
    const jwtReplyStr = localStorage.getItem(keyPath);
    if(Graviton.trace) {
      console.log('Graviton::createMqttClient_:jwtReplyStr=<',jwtReplyStr,'>');
    }
    if(!jwtReplyStr) {
      return this.jump2jwtRequest_();
    }
    const jwtReply = JSON.parse(jwtReplyStr);
    if(Graviton.trace) {
      console.log('Graviton::createMqttClient_:jwtReply=<',jwtReply,'>');
    }
    const isGood = this.verifyJwt_(jwtReply)
    if(Graviton.trace) {
      console.log('Graviton::createMqttClient_:isGood=<',isGood,'>');
    }
    if(!isGood) {
      return this.jump2jwtRequest_();
    }
    this.clientid_ = jwtReply.payload.clientid;
    this.username_ = jwtReply.payload.username;
    this.createMqttConnection_(jwtReply);
  }
  jump2jwtRequest_() {
    const jwtPaht = `${constAppPrefix}/mqtt_jwt/`;
    if(Graviton.trace) {
      console.log('Graviton::jump2jwtRequest_:jwtPaht=<',jwtPaht,'>');
    }
    window.location.assign(jwtPaht) ;
  }
  createMqttConnection_(jwtReply) {
    const options = {
      // Authentication
      clientId: jwtReply.payload.clientid,
      username: jwtReply.payload.username,
      password: jwtReply.jwt,
      protocolVersion:5,
      keepalive: 60*5,
      connectTimeout: 4000,
      clean: true,
      rejectUnauthorized: false
    }
    if(Graviton.debug) {
      console.log('Graviton::createMqttConnection_:options=<',options,'>');
    }
    this.mqttClient_ = mqtt.connect('wss://wator.xyz:8084/mqtt',options);
    const self = this;
    this.mqttClient_.on('connect', () => {
      console.log('Graviton::createMqttConnection_ connect self.mqttClient_.connected:=<', self.mqttClient_.connected, '>');
    });
    this.mqttClient_.on('message', (channel, message) => {
      self.onMqttMessage_(channel, message);
    });
    const topics = [
      `${jwtReply.payload.username}/graviton/#`,
    ];
    this.mqttClient_.subscribe(topics,{qos:1,nl:true},(err, granted)=>{
      if(err) {
        console.error('Graviton::createMqttConnection_ subscribe err:=<', err, '>');
      }      
      console.log('Graviton::createMqttConnection_ subscribe granted:=<', granted, '>');      
    });
  }  
  verifyJwt_(jwtReply) {
    if(!jwtReply.jwt) {
      return false;
    }
    // wait decode jwt...
    // this time believe payload from server.
    if(!jwtReply.payload) {
      return false;
    }
    const now = new Date();
    const iat = new Date();
    iat.setTime(parseInt(jwtReply.payload.iat) * 1000);
    const exp = new Date();
    exp.setTime(parseInt(jwtReply.payload.exp) * 1000);
    if(Graviton.trace) {
      console.log('Graviton::verifyJwt_:now=<',now,'>');
      console.log('Graviton::verifyJwt_:iat=<',iat,'>');
      console.log('Graviton::verifyJwt_:iat=<',exp,'>');
    }
    const remain_ms = exp - now;
    const remain_hour = parseFloat(remain_ms)/(1000.0*3600.0);
    if(Graviton.trace) {
      console.log('Graviton::verifyJwt_:remain_ms=<',remain_ms,'>');
      console.log('Graviton::verifyJwt_:remain_hour=<',remain_hour,'>');
    }
    if(remain_ms > 0) {
      return true;
    } else {
      return false;
    }
  }

  onMqttMessage_(channel, message) {
    //console.log('Graviton::onMqttMessage_ channel:=<', channel, '>');
    //console.log('Graviton::onMqttMessage_ message:=<', message, '>');
    const msgStr = new TextDecoder().decode(message);
    //console.log('Graviton::onMqttMessage_ msgStr:=<', msgStr, '>');
    try {
      const msgJson = JSON.parse(msgStr);
      if(Graviton.debug) {
        console.log('Graviton::onMqttMessage_ msgJson:=<', msgJson, '>');
      }
      const goodAuthed = this.mass_.verify(msgJson);
      if(Graviton.debug) {
        console.log('Graviton::onMqttMessage_ goodAuthed:=<', goodAuthed, '>');
      }
      if(goodAuthed && typeof this.cb_ === 'function') {
        if(channel.endsWith('/graviton/joined')) {
          this.onGravitonJoined_(msgJson);
        }
        this.cb_(channel, msgJson);
      }
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

