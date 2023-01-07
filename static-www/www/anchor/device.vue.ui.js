import * as Vue from 'https://cdn.jsdelivr.net/npm/vue@3.2.37/dist/vue.esm-browser.prod.js';
window.onDeviceInfo = (info) => {
  if(info.node) {
    deviceApp.vm.node = info.node;
  }
  if(info.mesh_wifi) {
    deviceApp.vm.wifi = info.mesh_wifi;
  }
  if(info.uwb) {
    deviceApp.vm.uwb = info.uwb;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(()=>{
    createVueConnectionApp();
  },1000);
})
const deviceApp = {};
const setting_connection_data = {
  node:'',
  wifi:{
    ssid: '',
    password: '',
    port: 0,
  },
  uwb:{
    mode:0,
    id:0,
  },
}
const createVueConnectionApp = ()=> {  
  const setting_option = {
    data() {
      return setting_connection_data;
    },
    methods: {
      onClickChangeDeviceInfo(evt) {
        //console.log('onClickChangeDeviceInfo::evt=<',evt,'>');
        const setting = {
          setting:{
            mesh_wifi:{
              ssid:this.wifi.ssid,
              password:this.wifi.password,
              port:parseInt(this.wifi.port),
            },
            uwb:{
              mode:parseInt(this.uwb.mode),
              id:parseInt(this.uwb.id),
            }
          }
        }
        writeJsonCmd(setting);
      },
    }
  };
  const settingApp = Vue.createApp(setting_option);
  deviceApp.vm = settingApp.mount('#vue-ui-device-of-anchor');  
}
