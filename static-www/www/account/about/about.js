document.addEventListener('DOMContentLoaded', async (evt) => {
  console.log('DOMContentLoaded::evt=<',evt,'>');
  //createVisNetworkGraph_(evt);
  createD3Graphviz_(evt);
});


const gDidMaapDOTstring = `
digraph G {
  label = "种子设备创建DID，追加设备都共同使用种子设备DID，每追加设备都对DID文档加上自己的签名";
  rankdir = "LR";  
  subgraph cluster_A {
    A[shape=box,label="种子设备",fontname="bold",color="red"];
    A001[shape=folder,label="种子设备 DID",color="red"];
    A003[shape=note,label="种子设备 公钥哈希",color="red"];
    A002[shape=note,label="种子设备 DID文档",color="red"];
    A004[shape=note,label="种子设备 密钥签名",color="red"];    

    A -> A001[arrowhead=dot];
    A001 -> A002[arrowhead=dot];
    A001 -> A003[arrowhead=dot]
    A002 -> A004[arrowhead=dot]
    label = "种子设备";
    color="red"
  }

  subgraph cluster_B {
    B[shape=box,label="追加设备1",fontname="bold",color="#008080"];
    B001[shape=folder,label="种子设备 DID",color="red"];
    B003[shape=note,label="种子设备 公钥哈希",color="red"];
    B002[shape=note,label="追加设备1 DID文档",color="#008080"];
    B004[shape=note,label="种子设备 密钥签名",color="red"];    
    B005[shape=note,label="追加设备1 密钥签名",color="#008080"];
    B -> B001[arrowhead=dot];
    B001 -> B002[arrowhead=dot];
    B001 -> B003[arrowhead=dot]
    B002 -> B004[arrowhead=dot]
    label = "追加设备1";
    color="#008080"
  }

  subgraph cluster_C {
    C[shape=box,label="追加设备2",fontname="bold",color="#191970"];
    C001[shape=folder,label="种子设备 DID",color="red"];
    C003[shape=note,label="种子设备 公钥哈希",color="red"];
    C002[shape=note,label="追加设备2 DID文档",color="#191970"];
    C004[shape=note,label="种子设备 密钥签名",color="red"];    
    C005[shape=note,label="追加设备1 密钥签名",color="#008080"];
    C006[shape=note,label="追加设备2 密钥签名",color="#191970"];
    C -> C001[arrowhead=dot];
    C001 -> C002[arrowhead=dot];
    C001 -> C003[arrowhead=dot]
    C002 -> C004[arrowhead=dot]
    label = "追加设备2";
    color="#191970"
  }

  subgraph cluster_D {
    D[shape=box,label="追加设备...",fontname="bold",color="#663399"];
    D001[shape=folder,label="种子设备 DID",color="red"];
    D003[shape=note,label="种子设备 公钥哈希",color="red"];
    D002[shape=note,label="追加设备... DID文档",color="#663399"];
    D004[shape=note,label="种子设备 密钥签名",color="red"];    
    D005[shape=note,label="追加设备1 密钥签名",color="#008080"];
    D006[shape=note,label="追加设备2 密钥签名",color="#191970"];
    D007[shape=note,label="追加设备... 密钥签名",color="#663399"];
    D -> D001[arrowhead=dot];
    D001 -> D002[arrowhead=dot];
    D001 -> D003[arrowhead=dot]
    D002 -> D004[arrowhead=dot]
    label = "追加设备...";
    color="#663399"
  }
  A -> B[];
  B -> C[];
  C -> D[]

  
  { rank=same; A A001 A002 }
  { rank=same; B B001 B002 }
  { rank=same; C C001 C002 }
  { rank=same; D D001 D002 }

}`;

const createD3Graphviz_ = () => {
  d3.select('#did-arch')
  .graphviz()
  .renderDot(gDidMaapDOTstring);
}


const createVisNetworkGraph_  = (evt) => {
  //console.log('createVisNetworkGraph_::evt=<',evt,'>');
  /*
  const nodes = new vis.DataSet([
    {id: 1, label: '种子设备1'},
    {id: 1000, label: '种子设备 DID'},
    {id: 1001, label: '种子设备 DID文档'},

    {id: 2, label: '追加设备2'},
    {id: 2000, label: '种子设备 DID'},
    {id: 2001, label: '追加设备2 DID文档'},

    {id: 3, label: '追加设备3'},
    {id: 3000, label: '种子设备 DID'},
    {id: 3001, label: '追加设备3 DID文档'},
    
    {id: 4, label: '追加设备...'},
    {id: 4000, label: '种子设备... DID'},
    {id: 4001, label: '追加设备... DID文档'},
    
    {id: 5, label: '追加设备n'},
    {id: 5000, label: '种子设备 DID'},
    {id: 5001, label: '追加设备n DID文档'},

  ]);
  const edges = new vis.DataSet([
    {from: 1, to: 2, arrows: 'to'},
    {from: 1000, to: 1, arrows: 'to'},
    {from: 1001, to: 1, arrows: 'to'},

    {from: 2, to: 3, arrows: 'to'},
    {from: 2000, to: 2, arrows: 'to'},
    {from: 2001, to: 2, arrows: 'to'},

    {from: 3, to: 4, arrows: 'to'},
    {from: 3000, to: 3, arrows: 'to'},
    {from: 3001, to: 3, arrows: 'to'},

    {from: 4, to: 5, arrows: 'to'},
    {from: 4000, to: 4, arrows: 'to'},
    {from: 4001, to: 4, arrows: 'to'},

    {from: 5000, to: 5, arrows: 'to'},
    {from: 5001, to: 5, arrows: 'to'},

  ]);
  const data = {
    nodes: nodes,
    edges: edges
  };      
  */
  console.log('createVisNetworkGraph_::vis=<',vis,'>');
  const parsedData = vis.parseDOTNetwork(gDidMaapDOTstring);
  const data = {
    nodes: parsedData.nodes,
    edges: parsedData.edges
  };      
  console.log('createVisNetworkGraph_::data=<',data,'>');
  const options = {};
  const container = document.getElementById('did-arch');
  console.log('createVisNetworkGraph_::container=<',container,'>');
  const didArch = new vis.Network(container, data, options);
  console.log('createVisNetworkGraph_::didArch=<',didArch,'>');
}