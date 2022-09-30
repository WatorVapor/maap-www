import * as Vue from 'https://cdn.jsdelivr.net/npm/vue@3.2.39/dist/vue.esm-browser.prod.js';
import { DIDTeamAuth } from '/maap/assets/js/did-team-auth.js';
//console.log('::DIDTeamAuth=<',DIDTeamAuth,'>');
document.addEventListener('DOMContentLoaded', async (evt) => {
  console.log('DOMContentLoaded::evt=<',evt,'>');
  createAccountApp_();
});

const gApp = {};
let gDidTeam = false;

const createAccountApp_ = async ()=> {
  gDidTeam = new DIDTeamAuth();
  const appJoin = Vue.createApp({
    data() {
      return {
        didAuth:{
          didText:'',
          didQR:'',
          didDocument:{},
        }
      };
    }
  });
  gApp.join = appJoin.mount('#vue-ui-didAuth-join');
  const appToken = Vue.createApp({
    data() {
      return {
        didAuth:{
          didText:gDidTeam.address(),
          name:gDidTeam.name()
        }
      };
    }
  });
  gApp.token = appToken.mount('#vue-ui-didAuth-token');
  
  const qrcode = await new QRCode.toDataURL(gDidTeam.address());
  const appDetails = Vue.createApp({
    data() {
      return {
        didAuth:{
          didText:gDidTeam.address(),
          didQR:qrcode,
          didDocumentJson:JSON.stringify(gDidTeam.document(),undefined,2),          
        }
      };
    }
  });
  console.log('createAccountApp_::appDetails=<',appDetails,'>');
  gApp.details = appDetails.mount('#vue-ui-didAuth-details');   
  console.log('createAccountApp_::gApp=<',gApp,'>');
}


window.onUIClickCreateDid = async (elem) => {
  console.log('onUIClickCreateDid::elem=<',elem,'>');
  try {
    const spinElem = elem.parentElement.getElementsByTagName('div')[0];
    console.log('onUIClickCreateDid::spinElem=<',spinElem,'>');
    spinElem.setAttribute('class','spinner-border text-success ');
    gDidTeam.createDid();
    spinElem.setAttribute('class','spinner-border text-success d-none');
    gApp.token.didAuth.didText = gDidTeam.address();
    const qrcode = await new QRCode.toDataURL(gDidTeam.address());
    gApp.token.didAuth.didQR = qrcode;
    gApp.token.didAuth.didDocumentJson = JSON.stringify(gDidTeam.document(),undefined,2);
    //location.reload();
  } catch(err) {
    console.error('onUIClickCreateDid::err=<',err,'>');
  }
}

window.onUIClickApplyGravitionTokenName = (elem) => {
  //console.log('onUIClickApplyGravitionTokenName::elem=<',elem,'>');
  const root = elem.parentElement.parentElement;
  //console.log('onUIClickApplyGravitionTokenName::root=<',root,'>');
  const valueElem = root.getElementsByTagName('input')[0];
  //console.log('onUIClickApplyGravitionTokenName::valueElem=<',valueElem,'>');
  const value = valueElem.value.trim();
  //console.log('onUIClickApplyGravitionTokenName::value=<',value,'>');
  if(value) {
    edAuth.storeName(value);
  }
}

window.onUIChangeQRCodeSecretKey = (elem) => {
  //console.log('onUIChangeQRCodeSecretKey::elem=<',elem,'>');
  const root = elem.parentElement.parentElement;
  //console.log('onUIChangeQRCodeSecretKey::root=<',root,'>');
  const fileList = elem.files;
  //console.log('onUIChangeQRCodeSecretKey::fileList=<',fileList,'>');
  if(fileList.length > 0) {
    const file = fileList[0];
    //console.log('onUIChangeQRCodeSecretKey::file=<',file,'>');
    readQRCodeFromFile(file);
  }
}
const readQRCodeFromFile = (fileName) => {
  //console.log('readQRCodeFromFile::fileName=<',fileName,'>');
  const fileReader = new FileReader();
  fileReader.onload = () => {
    //console.log('readQRCodeFromFile::fileReader.result=<',fileReader.result,'>');
    gVMKeyImport.edAuth.secretQR = fileReader.result;
  }
  fileReader.readAsDataURL( fileName );
}

window.onQRCodeResult = (secretKey) => {
  gVMKeyImport.edAuth.secret = secretKey;
  if(edAuth && secretKey) {
    const result = edAuth.verifySecretKey(secretKey.trim());
    console.log('onUIQRCodeLoaded::result=<',result,'>');
    if(result) {
      enableImportKey();
    }
  }
}

window.onUIQRCodeLoaded = (img) => {
  //console.log('onUIQRCodeLoaded::img=<',img,'>');
  //console.log('onUIQRCodeLoaded::img.naturalWidth=<',img.naturalWidth,'>');
  //console.log('onUIQRCodeLoaded::img.naturalHeight=<',img.naturalHeight,'>');
  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth;
  cv.height = img.naturalHeight;  
  const ct = cv.getContext('2d');
  ct.drawImage(img, 0, 0);
  const imageData = ct.getImageData(0, 0, cv.width, cv.height);
  //console.log('onUIQRCodeLoaded::imageData=<',imageData,'>');
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  //console.log('onUIQRCodeLoaded::code=<',code,'>');
  if(code) {
    onQRCodeResult(code.data);
  }
}

/*
window.onUIClickVerifyGravitionSecret = (elem) => {
  console.log('onUIClickVerifyGravitionSecret::elem=<',elem,'>');
  const secretKey = gVMKeyImport.edAuth.secret;
  console.log('onUIClickVerifyGravitionSecret::secretKey=<',secretKey,'>');
  if(edAuth && secretKey) {
    edAuth.verifySecretKey(secretKey.trim());
  }
}
*/

const constConfCamera = {
  video:{
    facingMode:'environment',
    width:{
      ideal:640
    },
    height:{
      ideal:480
    }
  },
  audio:false,
};

window.onUIClickScanSecretKey = async (elem) => {
  console.log('onUIClickScanSecretKey::elem=<',elem,'>');
  const stream = await navigator.mediaDevices.getUserMedia(constConfCamera);
  console.log('onUIClickScanSecretKey::stream=<',stream,'>');

  const video=document.createElement('video');
  video.setAttribute('autoplay','');
  video.setAttribute('muted','');
  video.setAttribute('playsinline','');
  video.srcObject = stream;
  video.onloadedmetadata = function(e){video.play();};
  const prev=document.getElementById('qrcode-preview');
  setTimeout(()=>{
    ScanQRCode(video,prev);
  },500);
}

const ScanQRCode = (video,preview) => {
  const w = video.videoWidth;
  const h = video.videoHeight;
  //console.log('ScanQRCode::w=<',w,'>');
  //console.log('ScanQRCode::h=<',h,'>'); 
  preview.style.width=(w/2)+"px";
  preview.style.height=(h/2)+"px";
  preview.setAttribute('width',w);
  preview.setAttribute('height',h);
  let m = 0;
  if(w>h){
    m = h*0.5;
  } else {
    m = w*0.5;
  }
  const x1 = (w-m)/2;
  const y1 = (h-m)/2;
  const prev_ctx = preview.getContext('2d');  
  prev_ctx.drawImage(video,0,0,w,h);
  prev_ctx.beginPath();
  prev_ctx.strokeStyle='rgb(255,0,0)';
  prev_ctx.lineWidth=2;
  prev_ctx.rect(x1,y1,m,m);
  prev_ctx.stroke();
  const tmp = document.createElement('canvas');
  const tmp_ctx = tmp.getContext('2d');
  tmp.setAttribute('width',m);
  tmp.setAttribute('height',m);
  tmp_ctx.drawImage(preview,x1,y1,m,m,0,0,m,m);
  const imageData = tmp_ctx.getImageData(0,0,m,m);
  const scanResult = jsQR(imageData.data,m,m);
  if(scanResult) {
    console.log('ScanQRCode::scanResult=<',scanResult,'>');
    onQRCodeResult(scanResult.data);
  } else {
    setTimeout(()=> {
      ScanQRCode(video,preview);
    },200);
  }
}

window.onUIChangeTextDid = async (elem) => {
  console.log('onUIChangeTextDid::elem=<',elem,'>');
  const didText = elem.textContent.trim(); 
  console.log('onUIChangeTextDid::didText=<',didText,'>');
  enableJoinDid(elem);
}

const enableJoinDid = (elem)=> {
  const rootElem = elem.parentElement.parentElement.parentElement;
  console.log('enableJoinDid::rootElem=<',rootElem,'>');
  const joinBtns = rootElem.getElementsByTagName('button');
  console.log('enableJoinDid::joinBtns=<',joinBtns,'>');
  if(joinBtns.length >1) {
    joinBtns[1].removeAttribute('disabled');
  }  
}


window.onUIClickJoinDid = async (elem) => {
  console.log('onUIClickJoinDid::elem=<',elem,'>');
  const didInput = elem.parentElement.parentElement.getElementsByTagName('input')[0];
  console.log('onUIClickJoinDid::didInput=<',didInput,'>');
  if(didInput && gDidTeam) {
    console.log('onUIClickJoinDid::didInput=<',didInput,'>');
    const didText = didInput.value.trim();
    console.log('onUIClickJoinDid::didText=<',didText,'>');
    gDidTeam.joinDid(didText);
  }
}
