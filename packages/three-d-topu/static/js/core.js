import { isNumber } from "lodash";
import { Resource } from '@idg/idg';

let nowObj;
let container;
let camera, scene, renderer;
let dragControls, nodesGroup, linksGroup, sphereInter, ghostNodesGroup, ghostLinksGroup;
let orbitControls;
let linesMesh;
let showText = true;
let showLinks = true;
let axHelper;
let gridHelper;

let isFullScreen = false;
const textlabels = [];
let objects = [];
let ghostNodes = [];
let ghostLinks = [];
let line2Hide = '';
let line2HideStack = [];
let highLightNodes = [];
let posedObj = [];

let iniNodes = [];
let iniLinks = [];
let dataTree = {};

let sceneSnapshot = '';
let channel2Delete = '';

let viewMode = '';
let topuMode = '';
let isChannelMode
let animationId = null;

let channelLink2Delete = '';
let mouse = '';
let raycaster = '';
let texture = '';
let ghostTexture = '';
let THREE

let posedPanel = '';

async function getThree() {
  await Resource.import([{ type: 'script', url: '//pkg.oneitfarm.com/three/r126.1/three.js' }]);
  THREE = window.THREE
}

/**
 * 获取vue实例, 并执行渲染
*/

let vm = null;
const sendThis = async (_this, nodes, links, tree) => {
  vm = _this
  iniNodes = nodes;
  iniLinks = links;
  dataTree = tree;
  viewMode = _this.viewMode;
  topuMode = _this.topuMode;
  if (!THREE) {
    await getThree();
    vm.threeReady();
  }
  console.log('传给三维拓扑的数据是：', 'nodes:', iniNodes, 'links:', iniLinks, 'tree', tree);
  await initThreeDTopu();
  listener();
  if (viewMode === 'tree' && topuMode === 3) {
    setTimeout(formatTreePos, 50)
  }
  // sceneSnapshot = JSON.stringify(scene.toJSON());
}

function toggleShowText() {
  showText = !showText
}
function toggleShowHelper() {
  axHelper.visible = !axHelper.visible;
  gridHelper.visible = !gridHelper.visible;
}
function channelClear() {
  if (viewMode === 'tree') {
    return
  }
  // 隐藏通道节点及连接
  batchRemoveObj(ghostNodes, ghostNodesGroup);
  batchRemoveObj(ghostLinks, ghostLinksGroup);
  iniNodes.forEach(node => {
    updateLinks(node.id)
  });
  removeHightNodes();
  // 去除通道观察模式的节点及连接
  if (posedObj.length > 0) {
    posedObj.forEach(id => {
      const obj = scene.getObjectByName(id);
      if (obj) {
        scene.getObjectByName(id).visible = false;
      }
    })
    posedObj.length = 0;
  }
  isChannelMode = false;
}
function revoke() {
  if (line2HideStack && line2HideStack.length > 0) {
    const obj = scene.getObjectByName(line2HideStack[line2HideStack.length - 1]);
    obj.visible = true;
    line2HideStack.pop()
  } else {
    alert('没有可以撤销的东西')
  }
}
function listener() {
  for (let i = 0; i < 5; i++) {
    window.document.getElementById(`camera${i + 1}`).addEventListener("click", () => {
      const camera = orbitControls.object;
      const cameraPosMap = [
        [1, 8000, 0],
        [-10000, 4000, 1],
        [10000, 4000, 1],
        [3000, 6000, 8000],
        [3000, 6000, -8000],
      ]
      orbitControls.target = new THREE.Vector3(0, 0, 0);
      camera.position.x = cameraPosMap[i][0];
      camera.position.y = cameraPosMap[i][1];
      camera.position.z = cameraPosMap[i][2];
    })
  }
}
function removeHightNodes() {
  // 去除选中状态
  if (highLightNodes.length > 0) {
    highLightNodes.forEach(name => {
      const obj = scene.getObjectByName(`select-${name}`);
      scene.remove(obj)
    })
    highLightNodes.length = 0;
  }
}
async function initThreeDTopu() {
  container = document.getElementById('3d-topu-container');
  if (container) {
    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    texture = await new THREE.TextureLoader().load(require('./img/arrow.png'));
    ghostTexture = new THREE.TextureLoader().load(require('./img/firewall.png'));

    // 初始化场景
    initScene();
    nodesGroup = new THREE.Group();
    linksGroup = new THREE.Group();
    ghostNodesGroup = new THREE.Group();
    ghostLinksGroup = new THREE.Group();
    scene.add(nodesGroup);
    scene.add(linksGroup);
    scene.add(ghostNodesGroup);
    scene.add(ghostLinksGroup);
    // 初始化sphere
    initSphereInter();
    // 初始化节点(channel)
    initNodes(iniNodes);
    // 初始化线(channel)
    initLinks(iniLinks);
    if (viewMode === 'pics' && iniNodes[0].channel) {
      // 初始化通道节点
      initGhostNodes();
      // // 初始化通道节点连线
      initGhostLinks();
    }
    // 初始化相机
    initCamera();
    // 初始化坐标系
    initCoordination();
    // 初始化灯光
    initLight();

    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const module = require('./three/controls/OrbitControls');
    orbitControls = new module.OrbitControls(camera, renderer.domElement);
    orbitControls.update();

    initDrag();

    window.addEventListener("resize", onWindowResize);
    container.addEventListener("click", onNodeClick);
    container.addEventListener("mousemove", onMouseMove);

    addNodeText();
    animate();
    render();
  }
}

function initSphereInter() {
  const geometry = new THREE.SphereBufferGeometry(100, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  sphereInter = new THREE.Mesh(geometry, material);
  sphereInter.visible = false;
  scene.add(sphereInter);
}

function initCoordination() {
  axHelper = new THREE.AxesHelper(4000);
  // 红：X  绿：Y  蓝：Z
  scene.add(axHelper);
  // 网格坐标系
  gridHelper = new THREE.GridHelper(400000, 1000, 0x4D4D4D, 0x4D4D4D);
  gridHelper.position.y = 0
  gridHelper.position.x = 0;
  scene.add(gridHelper);

}
function initCamera() {
  camera = new THREE.PerspectiveCamera(
    85,
    container.offsetWidth / container.offsetHeight,
    1,
    100000
  );
  camera.position.z = 0;
  camera.position.x = 1;
  camera.position.y = 8000
}

function initLinks(links) {
  links.forEach((link, index) => {
    initLink(link, index)
  });
}
function getChannelLinks(id) {
  const channelLinks = [];
  iniLinks.forEach(link => {
    if (link.source === id) {
      if(!link.channel_link){
        return;
      }
      link.channel_link.forEach(channel => {
        const obj = {
          source: `${channel.source.channel}-${channel.source.appkey}`,
          target: `${channel.target.channel}-${channel.target.appkey}`,
          id: `${channel.source.channel}-${channel.source.appkey}~${channel.target.channel}-${channel.target.appkey}`
        }
        let index = channelLinks.findIndex((item) => {
          return item.id === obj.id
        })
        if (index === -1) {
          channelLinks.push(obj)
        }
      })
    } else if (link.target === id) {
      if(!link.channel_link){
        return;
      }
      link.channel_link.forEach(channel => {
        const obj = {
          source: `${channel.source.channel}-${channel.source.appkey}`,
          target: `${channel.target.channel}-${channel.target.appkey}`,
          id: `${channel.target.channel}-${channel.target.appkey}~${channel.source.channel}-${channel.source.appkey}`
        }
        let index = channelLinks.findIndex((item) => {
          return item.id === obj.id
        })
        if (index === -1) {
          channelLinks.push(obj)
        }
      })
    }
  });
  return channelLinks
}
function initGhostLinks(name) {
  if (name) {
    getChannelLinks(name).forEach((channelLink, idx) => {
      const id = channelLink.id;
      const oldLink = scene.getObjectByName(id);
      if (!ghostLinks.includes(id)) {
        ghostLinksGroup.remove(oldLink);
        initLink(channelLink, idx, 'ghost', true);
        ghostLinks.push(id);
      } else {
        let idx = ghostLinks.findIndex(gId => {
          return gId === id
        });
        ghostLinks.splice(idx, 1);
        const obj = scene.getObjectByName(id);
        obj.visible = false
      }
    })
    iniLinks.forEach(link => {
      const obj = scene.getObjectByName(link.id);
      obj.visible = false;
    })
  } else {
    iniNodes.forEach(node => {
      getChannelLinks(node.id).forEach((channelLink, index) => {
        initLink(channelLink, index, 'ghost')
      })
    })
  }
}

function initLink(link, index, ghost, showGhost) {
  const source = scene.getObjectByName(link.source);
  const target = scene.getObjectByName(link.target);
  if (!source || !target) {
    return
  }
  let y = index % 2 === 0 ? -800 : 800;
  if (ghost) {
    y = -y;
  }
  const mid1 = new THREE.Vector3((source.position.x + target.position.x) / 2, y, (target.position.z + source.position.z) / 2)
  var pipeSpline = new THREE.CatmullRomCurve3([
    source.position,
    mid1,
    target.position,
  ]);
  const linematerial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const geometry = new THREE.TubeBufferGeometry(
    pipeSpline,
    10,
    15,
    10,
    false
  );

  const obj = ghost ? ghostTexture : texture;
  obj.wrapS = THREE.RepeatWrapping;
  obj.wrapT = THREE.RepeatWrapping;
  obj.repeat.x = 10;
  obj.repeat.y = 1;
  linematerial.map = obj

  linesMesh = new THREE.LineSegments(geometry, linematerial);
  linesMesh.name = link.id || `${link.source}-${link.target}`;
  linesMesh.forceHide = false;

  if (ghost) {
    linesMesh.source = link.source;
    linesMesh.target = link.target;
    linesMesh.type = 'ghost';
  } else {
    linesMesh.source = source.source;
    linesMesh.target = target.target;
  }
  if (ghost) {
    if (!ghostLinks.includes(link.id)) {
      // 初始化通道连接默认隐藏
      linesMesh.visible = false;
      if (showGhost) {
        linesMesh.visible = true;
      }
      ghostLinksGroup.add(linesMesh);
    }
  } else {
    linksGroup.add(linesMesh);
  }
}

function initNodes(nodes) {
  const geometry = new THREE.BoxBufferGeometry(250, 250, 250);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const object = new THREE.Mesh(
      geometry,
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    object.position.x = node.positionX || 0;
    object.position.y = node.positionY === undefined? 2000: node.positionY; // todo
    object.position.z = node.positionZ || 0;
    object.name = node.id;
    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
    object.castShadow = true;
    object.receiveShadow = true;
    object.subName = node.name;
    // 节点上文字

    nodesGroup.add(object);
    objects.push(object); // push objects
  }
}
function initGhostNodes() {
  for (let i = 0; i < iniNodes.length; i++) {
    const node = iniNodes[i];
    const parent = scene.getObjectByName(node.id).clone();
    if(node.channel && node.channel.length >0){
      node.channel.forEach((channelNode, index) => {
        const object = new THREE.Mesh(new THREE.BoxBufferGeometry(250, 250, 250), new THREE.MeshLambertMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.8,
        }))
        const y = index % 2 === 0 ? (index + 1) * 400 : -(index + 1) * 400
        object.position.set(parent.position.x, parent.position.y + y, parent.position.z);
        object.name = `${channelNode.channel}-${channelNode.appkey}`;
        object.appkey = channelNode.appkey;
        object.channel = channelNode.channel;
        object.visible = false;
        ghostNodesGroup.add(object);
        const text = _createTextLabel(true);
        text.setHTML(`
        <div class='flex'>
          <div
            style='margin-right:8px;
            border:1px solid ${node.color};
            color:${node.color};
            width:24px;
            height:24px;
            text-align:center;
            border-radius:4px;
            font-weight:700 '>
              ${node.name[0]}
          </div>
              <span style='color:${node.color}' >Channel: ${channelNode.channel}</span>
        </div>`);
        text.setParent(object);
        if (!textlabels.includes(text)) {
          textlabels.push(text);
        }
        container.appendChild(text.element);
      });
    }

  }
}

function addNodeText() {
  if (showText) {
    iniNodes.forEach(node => {
      const object = scene.getObjectByName(node.id);
      const text = _createTextLabel();
      text.setHTML(node.name);
      text.setParent(object);
      textlabels.push(text);
      container.appendChild(text.element);
    })

  }
}
function _createTextLabel(ghost) {
  var div = document.createElement("div");
  div.className = "text-label";
  div.style.position = "absolute";
  div.style.width = 100;
  div.style.height = 100;
  div.innerHTML = "hi there!";
  div.style.top = -1000;
  div.style.left = -1000;
  div.style.color = "#ffffff";
  div.style.display = "";
  div.style['z-index'] = 0;
  div.style['pointer-events'] = 'none'
  div.style['white-space'] = 'nowrap'
  var _this = this;
  return {
    element: div,
    parent: false,
    position: new THREE.Vector3(0, 0, 0),
    setHTML: function (html) {
      this.element.innerHTML = html
    },
    setParent: function (threejsobj) {
      this.parent = threejsobj;
    },
    removeParent: function () {
      this.parent = ''
    },
    updatePosition: function () {
      if (!showText) {
        this.element.style.display = "none";
      } else {
        this.element.style.display = '';
        if (parent && this.parent.visible) {
          // 若对象在可视区外，则不可见
          this.position.copy(this.parent.position);
          this.element.style.display = judgeObjVisible(this.parent.clone().position) ? '' : 'none'
        } else {
          this.element.style.display = "none";
        }
      }
      var coords2d = this.get2DCoords(this.position, camera);
      this.element.style.left = coords2d.x -10 + "px";
      this.element.style.top = coords2d.y +10+ "px";
    },
    get2DCoords: function (position, camera) {
      var vector = position.project(camera);
      vector.x = ((vector.x + 1) / 2) * container.offsetWidth;
      vector.y = (-(vector.y - 1) / 2) * container.offsetHeight;
      return vector;
    },
  };
}

function initDrag() {
  const module = require('./three/controls/DragControls');
  dragControls = new module.DragControls(
    [...objects],
    camera,
    renderer.domElement,
  );
  dragControls.addEventListener("drag", ({ object }) => {
    if (object.visible) {
      orbitControls.enabled = false;
      updateLinks(object.name);
      if (highLightNodes.length > 0) {
        updateSelected(object.name);
      }
      // 更新选中状态位置
    }
  });
  dragControls.addEventListener("dragend", ({ object }) => {
    let idx = iniNodes.findIndex(node => {
      return node.id === object.name
    })
    vm.emitDrag(iniNodes[idx])
  })
}

function initLight() {
  scene.add(new THREE.AmbientLight(0x505050));
  const pointLightPosition = [
    { x: 0, y: 4000, z: 0 },
    { x: 0, y: -4000, z: 0 },
  ];
  var lights = [];
  for (var i = 0; i < pointLightPosition.length; i++) {
    lights[i] = new THREE.PointLight(0xffffff, 1, 0);
    lights[i].position.set(
      pointLightPosition[i].x,
      pointLightPosition[i].y,
      pointLightPosition[i].z
    );
    scene.add(lights[i]);
  }
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
}

function onWindowResize(width) {
  if (topuMode == 3) {
    const boxWidth = isNumber(width) ? container.offsetWidth - width : container.offsetWidth
    renderer.setSize(boxWidth, container.offsetHeight);
    camera.aspect = boxWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    render();
  }
}
function onMouseMove(event) {
  event.preventDefault();
  // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
  let px = renderer.domElement.getBoundingClientRect().left;
  let py = renderer.domElement.getBoundingClientRect().top;
  mouse.x = ((event.clientX - px) / (renderer.domElement.offsetWidth)) * 2 - 1;
  mouse.y = - ((event.clientY - py) / (renderer.domElement.offsetHeight)) * 2 + 1;
}
function showChannelLink(node, expand) {

  if (!expand && node.id === posedPanel && posedObj.length > 0) {
    posedObj.forEach(id => {
      const obj = scene.getObjectByName(id);
      obj.visible = false;
    })
    node.channel.forEach(c=>{
      const index = ghostNodes.findIndex(g=>{
        return g === `${c.channel}-${c.appkey}`
      })
      if(index !== -1){
        ghostNodes.splice(index,1)
      }
    })
    posedObj.length = 0;
    removeHightNodes();
  }

  if (node) {
    showChannelGhostNodes(node.id, expand);
    updateChannelNodesVisibility();
    isChannelMode = true;
  }
  // console.log(ghostNodes,posedObj,'sss')
}
function updateChannelNodesVisibility() {
  if (ghostNodes.length === 0) {
    setTimeout(() => channelClear(), 50);
  }
}
function onNodeClick(event) {
  event.preventDefault();
  if (line2Hide && line2Hide !== '') {
    if (confirm('确认要删除这条线吗？')) {
      line2Hide.visible = false;
      line2HideStack.push(line2Hide.name);
    }
  }
  if (channelLink2Delete && channelLink2Delete !== '') {
    const name = channelLink2Delete.name
    vm.$Modal.confirm({
      title: '删除通道连接',
      content: '确认删除这条通道连接吗？',
      onOk: () => {
        scene.getObjectByName(name).visible = false;
      }
    })
  }
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(nodesGroup.children);
  if (intersects.length > 0 && !document.getElementById("myDropdown").classList.contains("show")) {
    if (judgeObjVisible(intersects[0].object.clone().position)) {
      renderMenu(intersects[0].object)
      nowObj = intersects[0].object
    }
  } else {
    const dropMenu = document.getElementById("myDropdown");
    if (dropMenu && dropMenu.classList.contains("show")) {
      const itemList = document.getElementById("itemList");
      dropMenu.removeChild(itemList);
      dropMenu.classList.remove("show");
    }
  }

  if (channel2Delete && channel2Delete !== '') {
    const obj = scene.getObjectByName(channel2Delete.name);
    vm.$Modal.confirm({
      title: '删除通道节点',
      content: '确认删除这个通道节点吗',
      onOk: () => {
        obj.visible = false;
        vm.$Message.success('删除成功')
      }
    })
  }
}
function showChannelDataDrawer() {
  vm.showDrawer = true;
  let index = iniNodes.findIndex(node => {
    return node.id === nowObj.name
  });
  vm.nowInstance = iniNodes[index]
  vm.drawerMode = 'data'
}
function showChannelColorDrawer() {
  vm.showDrawer = true;
  vm.nowObj = nowObj;
  vm.drawerMode = 'color'
}
function toggleNodeLinks() {
  if (nowObj && nowObj !== '') {
    const id = nowObj.name;
    iniLinks.forEach(link => {
      if (link.source === id || link.target === id) {
        const obj = scene.getObjectByName(link.id);
        obj.forceHide = !obj.forceHide; // 强制隐藏
        if (!obj.forceHide) {
          setTimeout(() => {
            updateLinks(id)
          }, 10);
        }
      }
    });
  }
}
function renderMenu(object) {
  const itemMap = [
    { key: '2', title: '关闭/开启节点连接信息', func: toggleNodeLinks, type: viewMode === 'tree' ? false : true },
    { key: '3', title: '设置节点颜色', func: showChannelColorDrawer, type: true },
    { key: '4', title: '设置channel_data', func: '', type: viewMode === 'tree' ? true : false },
    { key: '5', title: '查看详情', func: showChannelDataDrawer, type: true },
  ]
  const dContainer = document.getElementById("myDropdown");
  const itemList = document.createElement("div");
  dContainer.appendChild(itemList);
  itemList.setAttribute('id', 'itemList');
  itemMap.forEach(item => {
    const itemEle = document.createElement("a");
    itemEle.setAttribute('href', 'javascript:void(0)')
    itemEle.onclick = item.func;
    itemEle.style.display = item.type ? '' : 'none'
    itemEle.innerHTML = item.title;
    itemEle.style.color = 'white';
    itemEle.style.background = 'rgb(30, 32, 45)';
    itemEle.onmouseover = () => {
      itemEle.style.background = '#3a3d51'
    };
    itemEle.onmouseleave = () => {
      itemEle.style.background = 'rgb(30 ,32 ,45)';
    }
    itemList.appendChild(itemEle)
  })
  const vector = object.clone().position.project(camera);
  vector.x = ((vector.x + 1) / 2) * container.offsetWidth;
  vector.y = (-(vector.y - 1) / 2) * container.offsetHeight;
  const style = dContainer.style;
  style.left = `${vector.x}px`;
  style.top = `${vector.y + 5}px`;
  document.getElementById("myDropdown").classList.toggle("show");
}
/**
 * 显示channel 幽灵节点
 * @params
 * name:点击的实例节点的unique_id
*/
function showChannelGhostNodes(pName, expand) {
  let index = iniNodes.findIndex(node => {
    return node.id === pName
  })
  const relatedInstances = [];
  relatedInstances.push(iniNodes[index].id);
  relatedInstances.forEach(id => {
    let idx = iniNodes.findIndex(node => {
      return node.id === id
    })
    iniNodes[idx].channel.forEach(channelNode => {
      const name = `${channelNode.channel}-${channelNode.appkey}`;
      const obj = scene.getObjectByName(name);
      const parent = scene.getObjectByName(iniNodes[idx].id).clone();
      if (expand) {
        ghostNodes.push(name);
        obj.position.x = parent.position.x;
        obj.position.z = parent.position.z;
        obj.visible = true;
      } else {
        let index2Delete = ghostNodes.findIndex(gName => {
          return gName === name
        })
        if (!obj.channelPosed) {
          obj.visible = false
        }
        ghostNodes.splice(index2Delete, 1);
        if (ghostNodes.includes(name)) {
          obj.visible = true
        }else{
          obj.visible = false
        }
      }
    })
  });
}

function batchRemoveObj(arr) {
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      const obj = scene.getObjectByName(arr[i]);
      obj.visible = false;
    }
  }
  arr.length = 0
  iniLinks.forEach(link => {
    const obj = scene.getObjectByName(link.id);
    obj.visible = true;
  })
}

function animate() {
  orbitControls.update();
  orbitControls.enabled = true;
  animationId = requestAnimationFrame(animate);
  for (let i = 0; i < textlabels.length; i++) {
    textlabels[i].updatePosition();
  }

  // 纹理偏移
  texture.offset.x -= 0.01;
  if (ghostNodes.length > 0) {
    ghostTexture.offset.x -= 0.01;
  }
  if (iniNodes.length > 0) {
    updateLinkVision();
  }

  render();
}
function removeLinks(links) {
  if (links && links.length > 0) {
    links.forEach((link) => {
      const obj = scene.getObjectByName(link.id);
      linksGroup.remove(obj)
    })
  }
}

function updateLinks(name) {
  if (name && name !== 'change') {
    const relatedLinks = [];
    for (let i = 0; i < iniLinks.length; i++) {
      const link = iniLinks[i];
      const obj = scene.getObjectByName(link.id);
      if (!obj.visible) {

      }
      if (link.source === name || link.target === name) {
        if (relatedLinks.includes(link)) {
          return
        }
        relatedLinks.push(link);
      }
    }
    if (relatedLinks && relatedLinks.length > 0) {
      const temp = [];
      relatedLinks.forEach(link => {
        if (scene.getObjectByName(link.id).visible) {
          temp.push(link);
          removeLinks(temp);
          temp.forEach((item, index) => {
            initLink(item, index)
          })
        }
      })

    }
  }
}

function updateNodesVisibility(id, type) {
  const modifyLinks = [];
  const nodeObj = scene.getObjectByName(id);
  nodeObj.visible = type;
  iniLinks.forEach(link => {
    if (id === link.source || id === link.target) {
      modifyLinks.push(link.id)
    }
  });
  modifyLinks.forEach(id => {
    const linkObj = scene.getObjectByName(id);
    linkObj.visible = type;
  })
}
function formatTreePos() {
  dataTree.children.forEach(child => {
    scene.getObjectByName(`${dataTree.id}-${child.id}`).visible = true
  })
}
function findLineIntersections() {
  raycaster.setFromCamera(mouse, camera);
  if (ghostLinks.length > 0) {
    const ghostLinksArr = [];
    ghostLinks.forEach(id => {
      ghostLinksArr.push(scene.getObjectByName(id));
    });
    const intersects = raycaster.intersectObjects(ghostLinksArr);
    if (intersects.length > 0) {
      if (intersects[0].object.visible) {
        sphereInter.visible = true;
        sphereInter.position.copy(intersects[0].point);
        channelLink2Delete = intersects[0].object;
      }
    } else {
      channelLink2Delete = '';
      sphereInter.visible = false;
    }
  } else {
    const intersects = raycaster.intersectObjects(linksGroup.children, true);
    if (intersects.length > 0) {
      if (intersects[0].object.visible) {
        if (judgeObjVisible(intersects[0].object.clone().position)) {
          sphereInter.visible = true;
          sphereInter.position.copy(intersects[0].point);
          line2Hide = intersects[0].object;
        }
      }
    } else {
      line2Hide = '';
      sphereInter.visible = false;
    }
  }
}
function toggleShowLinks() {
  iniLinks.forEach(link => {
    if (viewMode === 'tree') {
      showLinks = vm.showLinks
      return;
    }
    scene.getObjectByName(link.id).forceHide = !vm.showLinks
  })
}
/**
 * 切换显示节点连线(树形)
*/
function toggleShowNodes(arr, item) {
  console.log('展示的节点', arr, '点击的项', item)
  hideAllChildLinks(item)
  freshTreeLinksVisible(arr, item)
}

function hideAllChildLinks(tree) {
  if (tree.children && tree.children.length > 0) {
    tree.children.forEach(child => {
      const obj = scene.getObjectByName(`${tree.id}-${child.id}`)
      obj.visible = false;
      obj.higherLevelVisible = false;
      hideAllChildLinks(child)
    })
  }
}

function freshTreeLinksVisible(arr, item) {
  if (item.id !== iniNodes[0].id) {
    const obj = scene.getObjectByName(`${item.pid}-${item.id}`)
    obj.visible = item.checked
    obj.higherLevelVisible = item.checked;
  }
  if (arr.includes(item) && item.expand) {
    if (item.children.length > 0) {
      item.children.forEach(child => {
        const obj = scene.getObjectByName(`${item.id}-${child.id}`)
        obj.visible = true
        obj.higherLevelVisible = true;
        freshTreeLinksVisible(arr, child)
      })
    }
  }
}

/**
 * 切换显示节点连线（图形）
*/
function toggleShowNodesPic(node) {
  scene.getObjectByName(node.id).visible = node.checked;
  iniLinks.forEach(link => {
    if (node.id === link.source || node.id === link.target) {
      const obj = scene.getObjectByName(link.id);
      obj.visible = node.checked
    }
  })
}

/**
 * 摄像机缩小
*/
function narrow() {
  if (camera.fov >= 165) {
    vm.$Message.info('无法继续缩小')
    return;
  }
  camera.fov += 10;
  camera.updateProjectionMatrix();
}
/**
 * 摄像机放大
*/
function enlarge() {
  if (camera.fov <= 5) {
    vm.$Message.info('无法继续放大')
    return;
  }
  camera.fov -= 10;
  camera.updateProjectionMatrix();
}
/**
 * 全屏与退出
*/
function fullScreen() {
  if (!isFullScreen) {
    window.document.body.requestFullscreen();
    isFullScreen = true;
  } else {
    window.document.exitFullscreen();
    isFullScreen = false;
  }
}

function render() {
  renderer.render(scene, camera);
}
function updateLinkVision() {
  if (viewMode === 'tree') {
    const nowTreeVisibleLinks = [];
    scene.children[1].children.forEach(link => {
      if (link.visible) {
        nowTreeVisibleLinks.push(link)
      }
    });
    nowTreeVisibleLinks.forEach(obj => {
      obj.material.opacity = showLinks ? 1 : 0
    })
    return;
  } else {
    iniLinks.forEach(link => {
      const obj1 = scene.getObjectByName(link.source);
      const obj2 = scene.getObjectByName(link.target);
      const obj = scene.getObjectByName(link.id);
      if (obj1 && obj1.visible && obj2 && obj2.visible && !isChannelMode && obj && !obj.forceHide) {
        obj.visible = true
      } else {
        obj.visible = false
      };
    });
  }
}
/**
 * 展示隐藏子节点（树视图）
*/
function toggleShowChildIns(tree) {
  if (tree.children.length > 0) {
    tree.children.forEach(child => {
      scene.getObjectByName(child.id).visible = tree.expand
      const linkObj = scene.getObjectByName(`${tree.id}-${child.id}`)
      linkObj.visible = tree.expand
      updateChildVisibility(child, tree.expand)
      if (!tree.expand) {
        child.expand = false;
        toggleShowChildIns(child);
      }
      if (tree.expand && !child.checked) {
        linkObj.visible = false;
      }
      toggleShowChildIns(child)
    })
  }
  if (tree.id === iniNodes[0].id) {
    tree.children.forEach(child => {
      scene.getObjectByName(child.id).visible = tree.expand
    })
  }
}
function updateChildVisibility(child, fatherExpand) {
  const temp = [];
  iniLinks.forEach(link => {
    if (link.target === child.id) {
      temp.push(link.source)
    }
  });
  const obj = scene.getObjectByName(child.id);
  if (temp.length > 1) {
    obj.visible = true
  } else {
    obj.visible = false;
  }
  if (fatherExpand) {
    obj.visible = true;
  }
}
/**
 * 判断目标对象是否在可视区内
*/
function judgeObjVisible(position) {
  let tempV = position.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
  if ((Math.abs(tempV.x) > 1) || (Math.abs(tempV.y) > 1) || (Math.abs(tempV.z) > 1)) {
    return false
  } else {
    return true
  }
}
/**
 * 高亮节点
*/
function highLightNode(id) {
  const obj = scene.getObjectByName(id).clone();
  if (!highLightNodes.includes(obj.name) && obj.visible) {
    highLightNodes.push(obj.name);
    LoadSelectState(obj);
  }
}
function LoadSelectState(obj) {
  let circle = new THREE.Group;
  circle.position.set(obj.position.x, obj.position.y - 200, obj.position.z);
  circle.name = `select-${obj.name}`;
  circle.rotation.x = -0.5 * Math.PI;
  circle.visible = true;
  scene.add(circle);

  var arcShape = new THREE.Shape();
  arcShape.absarc(0, 0, 400, 0, Math.PI * 2, false);
  var holePath = new THREE.Path();
  holePath.absarc(0, 0, 300, 0, Math.PI * 2, true);
  arcShape.holes.push(holePath);
  arcShape.name = "outSide";
  var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
  addShape(arcShape, extrudeSettings, { color: 0xF6F93B, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }, 0, 0, 0, 0, 0, 0, 1, circle);

  var arcShape1 = new THREE.Shape();
  arcShape1.absarc(0, 0, 200, 0, Math.PI * 2, false);
  var holePath1 = new THREE.Path();
  holePath1.absarc(0, 0, 100, 0, Math.PI * 2, true);
  arcShape1.holes.push(holePath1);
  arcShape1.name = "midSide";
  addShape(arcShape1, extrudeSettings, { color: 0xF6F93B, side: THREE.DoubleSide, transparent: false }, 0, 0, 0, 0, 0, 0, 1, circle);
}

function addShape(shape, extrudeSettings, color, x, y, z, rx, ry, rz, s, group) {
  var geometry = new THREE.ShapeBufferGeometry(shape);
  var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(color));
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.scale.set(s, s, s);
  if (shape.name != undefined) mesh.name = shape.name;
  group.add(mesh);
}
/**
 * 高亮位置更新
*/
function updateSelected(name) {
  const parent = scene.getObjectByName(name).clone();
  const select = scene.getObjectByName(`select-${name}`);
  if (select) {
    select.position.copy(parent.position);
    select.position.y = parent.position.y - 200;
  }
}

/**
 * 摄像机定位节点
*/
function posObj(arr, item) {
  removeHightNodes();
  if (arr.includes(item)) {
    highLightNode(item.id)
  } else {
    return
  }
}

function posChannel(item) {
  if (viewMode === 'pics' && topuMode === 3) {
    isChannelMode = true;
    if (highLightNodes.length > 0) {
      removeHightNodes()
    }
    if (ghostLinks.length > 0) {
      ghostLinks.forEach(id => {
        scene.getObjectByName(id).visible = false;
      })
      ghostLinks = []
    }
    ghostNodes = [];
    posedObj = [];
    const index = iniNodes.findIndex(node => {
      return node.id === item.ins.id
    })
    if (index !== -1) {
      iniNodes[index].channel.forEach(channel => {
        ghostNodes.push(`${channel.channel}-${channel.appkey}`)
      })
    }
    iniNodes.forEach(node => {
      node.channel.forEach(channel => {
        const obj = scene.getObjectByName(`${channel.channel}-${channel.appkey}`);
        obj.visible = false;
      })
    })
    const channelObj = scene.getObjectByName(`${item.channel.channel}-${item.channel.appkey}`);
    channelObj.visible = true;
    highLightNode(channelObj.name)
    if (!posedObj.includes(channelObj.name)) {
      posedObj.push(channelObj.name)
    }
    const res = vm.getChannelLinks(item.channel);
    for (let i in res) {
      res[i].forEach(id => {
        const obj = scene.getObjectByName(id);
        if (!posedObj.includes(id)) {
          posedObj.push(id)
          obj.visible = true
          obj.channelPosed = true;
        }
      })
    }
    res.relatedLinks.forEach(id => {
      ghostLinks.push(id);
    })
    vm.posChildItem(item.ins.id);
    posedPanel = item.ins.id;
    // console.log(ghostNodes, posedObj, 'sss')
  }
}
/**
 * 清除webgl实例, 释放资源
*/
function sceneReset() {
  cancelAnimationFrame(animationId); // 暂停动画
  // 销毁三维场景相关
  // 清空渲染器缓存

  // renderer.forceContextLoss();
  // renderer.dispose();
  renderer = null;
  axHelper = null;
  gridHelper = null;
  camera = null;
  objects.forEach(async item => {
    item.geometry.dispose();
    item.material.dispose();
  })
  objects = [];
  dragControls = null;
  orbitControls = null;
  scene = null;
  // 销毁监听
  window.removeEventListener("resize", onWindowResize);
  container.removeEventListener("click", onNodeClick, false);
  container.removeEventListener("mousemove", onMouseMove, false);
}

function traverseTree(tree, root) {

  if (tree.children.length > 0) {
    tree.children.forEach(child => {
      scene.getObjectByName(child.id).visible = tree.expand
      traverseTree(child, false)
    })
  }
  if (root) {
    tree.children.forEach(child => {
      scene.getObjectByName(child.id).visible = tree.expand
    })
  }

  iniLinks.forEach(link => {
    const source = scene.getObjectByName(link.source);
    const target = scene.getObjectByName(link.target);
    const obj = scene.getObjectByName(link.id);
    if (source.visible && target.visible) {
      obj.visible = true
    } else {
      obj.visible = false
    }
  })
}
function refreshAllLinks() {
  iniNodes.forEach(node => {
    updateLinks(node.id)
  })
}

function toggleExpand(tree) {
  traverseTree(tree, true);
}

function outputScene() {
  const image = renderer.domElement.toDataURL();
  const w = window.open('about:blank');
  w.document.write("<img src='" + image + "' alt='from canvas'/>")
}

export {
  initThreeDTopu,
  sendThis,
  toggleShowText,
  toggleShowHelper,
  channelClear,
  revoke,
  listener,
  highLightNode,
  toggleShowNodes,
  posObj,
  narrow,
  enlarge,
  fullScreen,
  toggleShowNodesPic,
  onWindowResize,
  posChannel,
  toggleShowLinks,
  showChannelLink,
  toggleShowChildIns,
  sceneReset,
  removeHightNodes,
  renderer,
  toggleExpand,
  refreshAllLinks,
  THREE,
  outputScene,
}
