document.addEventListener('DOMContentLoaded', async (evt) => {
  console.log('DOMContentLoaded::evt=<',evt,'>');
  createDotLangGraph_(evt);
});

const createDotLangGraph_  = (evt) => {
  console.log('createDotLangGraph_::evt=<',evt,'>');
  const nodes = new vis.DataSet([
    {id: 1, label: 'Desktop Chrome'},
    {id: 2, label: 'Mobile Chrome'},
    {id: 3, label: 'C'},
    {id: 4, label: 'D'},
    {id: 5, label: 'E'},
    {id: 6, label: 'F'},
    {id: 7, label: 'G'},
    {id: 8, label: 'H'},
  ]);
  const edges = new vis.DataSet([
    {from: 1, to: 2, arrows: 'to'},
    {from: 1, to: 3, arrows: 'to'},
    {from: 3, to: 4, arrows: 'to'},
    {from: 6, to: 1, arrows: 'to'},
    {from: 7, to: 8, arrows: 'to'},
    {from: 8, to: 7, arrows: 'to'},
  ]);      
  const data = {
    nodes: nodes,
    edges: edges
  };      
  console.log('createDotLangGraph_::data=<',data,'>');
  const options = {};
  const container = document.getElementById('did-arch');
  console.log('createDotLangGraph_::container=<',container,'>');
  const didArch = new vis.Network(container, data, options);
}