import * as Vue from 'https://cdn.jsdelivr.net/npm/vue@3.2.39/dist/vue.esm-browser.prod.js';
import { DIDAuth } from '/maap/assets/js/did-auth.js';
//console.log('::DIDAuth=<',DIDAuth,'>');
document.addEventListener('DOMContentLoaded', async (evt) => {
  console.log('DOMContentLoaded::evt=<',evt,'>');
  createAccountApp_();
});

const gApp = {};
let gDidAuth = false;

const createAccountApp_ = async ()=> {
  gDidAuth = new DIDAuth();
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
          didText:gDidAuth.address(),
          name:gDidAuth.name()
        }
      };
    }
  });
  gApp.token = appToken.mount('#vue-ui-didAuth-token');
  
  const qrcode = await new QRCode.toDataURL(gDidAuth.address());
  const appDetails = Vue.createApp({
    data() {
      return {
        didAuth:{
          didText:gDidAuth.address(),
          didQR:qrcode,
          didDocumentJson:JSON.stringify(gDidAuth.document(),undefined,2),          
        }
      };
    }
  });
  console.log('createAccountApp_::appDetails=<',appDetails,'>');
  gApp.details = appDetails.mount('#vue-ui-didAuth-details');   
  console.log('createAccountApp_::gApp=<',gApp,'>');
}


window.onUIClickCreateDid = (elem) => {
  console.log('onUIClickCreateDid::elem=<',elem,'>');
  try {
    const spinElem = elem.parentElement.getElementsByTagName('div')[0];
    console.log('onUIClickCreateDid::spinElem=<',spinElem,'>');
    spinElem.setAttribute('class','spinner-border text-success ');
    gDidAuth.createDid();
    spinElem.setAttribute('class','spinner-border text-success d-none');
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

window.onUIChangeTextSecretKey = async (elem) => {
  console.log('onUIChangeTextSecretKey::elem=<',elem,'>');
  const keyText = elem.textContent.trim(); 
  console.log('onUIChangeTextSecretKey::keyText=<',keyText,'>');
  if(edAuth) {
    const goodKey = edAuth.verifySecretKey(keyText);
    console.log('onUIChangeTextSecretKey::goodKey=<',goodKey,'>');
    if(goodKey) {
      enableImportKey();
    }
  }
}

const enableImportKey = ()=> {
  const importBtn = document.getElementById('evt-btn-import-gravition-secret');
  console.log('enableImportKey::importBtn=<',importBtn,'>');
  if(importBtn) {
    importBtn.removeAttribute('disabled');
  }  
}


window.onUIClickImportGravitionSecret = async (elem) => {
  console.log('onUIClickImportGravitionSecret::elem=<',elem,'>');
  const keyTextArea = elem.parentElement.parentElement.getElementsByTagName('textarea')[0];
  if(keyTextArea && edAuth) {
    console.log('onUIClickImportGravitionSecret::keyTextArea=<',keyTextArea,'>');
    const keyText = keyTextArea.textContent.trim();
    console.log('onUIClickImportGravitionSecret::keyText=<',keyText,'>');
    const isImported = edAuth.importSecretKey(keyText);
    console.log('onUIClickImportGravitionSecret::isImported=<',isImported,'>');
  }
}
