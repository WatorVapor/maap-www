document.addEventListener('DOMContentLoaded', async (evt) => {
  console.log('DOMContentLoaded::evt=<',evt,'>');
  createD3Graphviz_(evt);
});

const createD3Graphviz_ = () => {
  const didArch =  d3.select('#did-arch');
  const archElem = didArch._groups[0][0];
  console.log('createD3Graphviz_::archElem=<',archElem,'>');
  didArch.graphviz()
  .zoom(false)
  .width(archElem.clientWidth)
  .height(archElem.clientHeight)
  .fit(true)
  .renderDot(gDidArchDOTString);
  
  const didDoc = d3.select('#did-document')
  const docElem = didDoc._groups[0][0];
  console.log('createD3Graphviz_::docElem=<',docElem,'>');
  didDoc.graphviz()
  .zoom(false)
  .width(docElem.clientWidth)
  .height(docElem.clientHeight)
  .fit(true)
  .renderDot(gDidDocumentDOTString);
}

const gDidArchDOTString = `
digraph G {
  label = "种子设备创建DID标识符和DID文档，
  新追加设备都共同使用种子设备DID标识符，
  每新追加设备都对DID文档加上自己的签名和已经追加设备的数字签名";
  rankdir = "LR";  
  subgraph cluster_A {
    A[shape=box,label="种子设备",fontname="bold",color="red"];
    A001[shape=folder,label="种子设备 DID标识符",color="red"];
    A003[shape=note,label="种子设备 公钥哈希",color="red"];
    A002[shape=note,label="种子设备 DID文档",color="red"];
    A004[shape=note,label="种子设备 密钥签名",color="red"];    
    #A005[shape=note,label="种子设备 密钥 Web存储 | 本地存储",color="red"];    

    A -> A001[arrowhead=dot];
    A001 -> A002[arrowhead=dot];
    A001 -> A003[arrowhead=dot]
    A002 -> A004[arrowhead=dot]
    #A004 -> A005[arrowhead=dot]
    label = "种子设备";
    color="red"
  }

  subgraph cluster_B {
    B[shape=box,label="追加设备1",fontname="bold",color="#008080"];
    B001[shape=folder,label="种子设备 DID标识符",color="red"];
    B003[shape=note,label="种子设备 公钥哈希",color="red"];
    B002[shape=note,label="追加设备1后 DID文档",color="#008080"];
    B004[shape=note,label="种子设备 密钥签名",color="red"];    
    B005[shape=note,label="追加设备1 密钥签名",color="#008080"];
    
    #B006[shape=note,label="追加设备1 密钥 Web存储 | 本地存储",color="#008080"];
    B -> B001[arrowhead=dot];
    B001 -> B002[arrowhead=dot];
    B001 -> B003[arrowhead=dot]
    B002 -> B004[arrowhead=dot]
    B002 -> B005[arrowhead=dot]
    #B005 -> B006[arrowhead=dot]
    label = "追加设备1";
    color="#008080"
  }

  subgraph cluster_C {
    C[shape=box,label="追加设备2",fontname="bold",color="#191970"];
    C001[shape=folder,label="种子设备 DID标识符",color="red"];
    C003[shape=note,label="种子设备 公钥哈希",color="red"];
    C002[shape=note,label="追加设备2后 DID文档",color="#191970"];
    C004[shape=note,label="种子设备 密钥签名",color="red"];    
    C005[shape=note,label="追加设备1 密钥签名",color="#008080"];
    C006[shape=note,label="追加设备2 密钥签名",color="#191970"];
    #C007[shape=note,label="追加设备2 密钥 Web存储 | 本地存储",color="#008080"];
    
    C -> C001[arrowhead=dot];
    C001 -> C002[arrowhead=dot];
    C001 -> C003[arrowhead=dot]
    C002 -> C004[arrowhead=dot]
    C002 -> C005[arrowhead=dot]
    C002 -> C006[arrowhead=dot]
    #C006 -> C007[arrowhead=dot]
    
    label = "追加设备2";
    color="#191970"
  }

  subgraph cluster_D {
    D[shape=box,label="追加设备...",fontname="bold",color="#663399"];
    D001[shape=folder,label="种子设备 DID标识符",color="red"];
    D003[shape=note,label="种子设备 公钥哈希",color="red"];
    D002[shape=note,label="追加设备...后 DID文档",color="#663399"];
    D004[shape=note,label="种子设备 密钥签名",color="red"];    
    D005[shape=note,label="追加设备1 密钥签名",color="#008080"];
    D006[shape=note,label="追加设备2 密钥签名",color="#191970"];
    D007[shape=note,label="追加设备... 密钥签名",color="#663399"];
    
    #D008[shape=note,label="追加设备... 密钥 Web存储 | 本地存储",color="#663399"];
    
    D -> D001[arrowhead=dot];
    D001 -> D002[arrowhead=dot];
    D001 -> D003[arrowhead=dot]
    D002 -> D004[arrowhead=dot]
    D002 -> D005[arrowhead=dot]
    D002 -> D006[arrowhead=dot]
    D002 -> D007[arrowhead=dot]
    
    #D007 -> D008[arrowhead=dot]

    label = "追加设备...";
    color="#663399"
  }
  A -> B[];
  B -> C[];
  C -> D[]
  
  A002 -> B002[];
  B002 -> C002[];
  C002 -> D002[]

  
  { rank=same; A A001 A002 A003 A004 }
  { rank=same; B B001 B002 B003 B004 B005 }
  { rank=same; C C001 C002 C003 C004 C005 C006 }
  { rank=same; D D001 D002 D003 D004 D005 D006 D007}

}`;


const gDidDocumentDOTString = `
digraph G {
  label = "新设备加入已经存在的DID组织";
  rankdir = "LR";  
  subgraph cluster_A {
    A[shape=box,label="要加入组织设备(起始状态)",fontname="bold",color="red"];
    A001[shape=folder,label="种子设备 DID标识符",color="red"];
    A003[shape=note,label="种子设备 公钥哈希",color="red"];

    A -> A001[arrowhead=dot];
    A001 -> A003[arrowhead=dot]
    color="red"
  }

  subgraph cluster_B {
    B[shape=box,label="要加入组织设备（游客身份）",fontname="bold",color="#008080"];
    B001[shape=folder,label="种子设备 DID标识符",color="red"];
    B003[shape=note,label="种子设备 公钥哈希",color="red"];
    B002[shape=note,label="要加入组织设备 游客身份DID文档",color="#008080"];
    B004[shape=note,label="要加入组织设备 密钥签名",color="#008080"];
    B005[shape=note,label="要加入组织设备 成员身份DID文档",color="#008080"];
    B -> B001[arrowhead=dot];
    B001 -> B002[arrowhead=dot];
    B001 -> B003[arrowhead=dot]
    B002 -> B004[arrowhead=dot];
    B002 -> C005[label="登入"];
    B002 -> C002[label="发布"];
    B002 -> B005[arrowhead=dot];
    B005 -> B004[arrowhead=dot];

    label = "要加入组织设备（游客身份）";
    color="#008080"
  }

  subgraph cluster_C {
    C[shape=box,label="MQTT Broker",fontname="bold",color="#191970"];
    C001[shape=folder,label="成员主题(<DID标识符>/#)",color="#191970"];
    C002[shape=folder,label="游客主题(<DID标识符>/guest/did/join/document)",color="#191970"];
    C003[shape=folder,label="游客主题(<DID标识符>/guest/did/authed/document)",color="#191970"];
    C004[shape=folder,label="JWT认证 成员DID文档",color="#191970"];
    C005[shape=folder,label="JWT认证 游客DID文档",color="#191970"];
    C -> C001[arrowhead=dot];
    C -> C002[arrowhead=dot];
    C -> C003[arrowhead=dot];
    C -> C004[arrowhead=dot];
    C -> C005[arrowhead=dot];
    C002 -> D006[label="订阅"];
    C003 -> B005[label="订阅"];
    label = "MQTT Broker";
    color="#191970"
  }



  subgraph cluster_D {
    D[shape=box,label="组成员设备",fontname="bold",color="#663399"];
    D001[shape=folder,label="种子设备 DID标识符",color="red"];
    D003[shape=note,label="种子设备 公钥哈希",color="red"];
    D002[shape=note,label="组成员设备 DID文档",color="#663399"];
    D004[shape=note,label="种子设备 密钥签名",color="red"];    
    D005[shape=note,label="组成员设备 密钥签名",color="#663399"];
    D006[shape=note,label="组成员设备 加入新设备后DID文档",color="#663399"];
    
    D -> D001[arrowhead=dot];
    D001 -> D002[arrowhead=dot];
    D001 -> D003[arrowhead=dot]
    D002 -> D004[arrowhead=dot]
    D002 -> D005[arrowhead=dot]
    D002 -> D006[arrowhead=dot,label="追加新设备公钥"]
    D002 -> C004[label="登入"]
    D006 -> D005[arrowhead=dot]
    D006 -> C003[label="发布"];
    label = "组成员设备";
    color="#663399"
  }

  
  A -> B[];
  B -> C[];
  C -> D[];
  A001-> B001[label="手动复制粘贴"];

  
  { rank=same; A A001 A003 }
  { rank=same; B B001 B002 B003 B004 B005 }
  { rank=same; C C001 C002 C003 C004 C005 }
  { rank=same; D D001 D002 D003 D004 D005 D006}

}`;

