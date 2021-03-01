import * as THREE from "./build/three.module.js";
import { DragControls } from "./jsm/controls/DragControls.js";
import { OrbitControls } from "./jsm/controls/OrbitControls.js";

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
let editMode = false;
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

let channels2Delete = [];
let channel2Delete = '';
let lastChannel2DeleteId;

let viewMode = '';
let topuMode = '';
let isChannelMode
let animationId = null;

let channelLink2Delete = '';
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const texture = new THREE.TextureLoader().load(require('./img/arrow.png'));
const ghostTexture = new THREE.TextureLoader().load(require('./img/firewall.png'));

/**
 * 获取vue实例, 并执行渲染
*/

let vm = null;
const sendThis = (_this, nodes, links, tree) => {
  vm = _this
  iniNodes = nodes;
  iniLinks = links;
  dataTree = tree;
  viewMode = _this.viewMode;
  topuMode = _this.topuMode;
  console.log('传给三维拓扑的数据是：', 'nodes:', nodes, 'links:', links)
  initThreeDTopu();
  listener();
  if (viewMode === 'tree' && topuMode === 3) {
    formatTreePos()
  }
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
      scene.getObjectByName(id).visible = false;
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
      if (ghostNodes.length === 0) {
        const cameraPosMap = [
          [1, 8000, 0],
          [-9000, 3000, 0],
          [8217, 1839, 0],
          [1576, 3760, 6088],
          [1576, 3760, -6088],
        ]
        orbitControls.target = new THREE.Vector3(0, 0, 0);
        camera.position.x = cameraPosMap[i][0];
        camera.position.y = cameraPosMap[i][1];
        camera.position.z = cameraPosMap[i][2];
      } else {
        const offsetMap = [
          [-4000, 2000, 0],
          [-4000, 1000, 2000],
          [2000, 2000, 0],
          [0, 4000, 2000],
          [-2000, 2000, 2000],
        ]
        const obj = nowObj.clone();
        orbitControls.target = obj.position;
        camera.position.set(obj.position.x + offsetMap[i][0], obj.position.y + offsetMap[i][1], obj.position.z + offsetMap[i][2])
      }
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
function initThreeDTopu() {
  container = document.getElementById('3d-topu-container');
  if (container) {
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
    if (viewMode === 'pics') {
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

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    // 初始化 orbitControls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.update();
    initDrag();

    window.addEventListener("resize", () => onWindowResize());
    container.addEventListener("click", onNodeClick);
    container.addEventListener("mousemove", onMouseMove);
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
function initAsdfjklzxcn(){
  try{
    const res = raycaster.findLineIntersections().target[0];
    console.log(res,'ss')
  }catch(e){
    console.log(e)
  }
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
  let y = index % 2 === 0 ? -600 : 600;
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

  //将贴图贴到管道上
  if (!ghost) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = 10;
    texture.repeat.y = 1;
    linematerial.map = texture;
  } else {
    ghostTexture.wrapS = THREE.RepeatWrapping;
    ghostTexture.wrapT = THREE.RepeatWrapping;
    ghostTexture.repeat.x = 10;
    ghostTexture.repeat.y = 1;
    linematerial.map = ghostTexture;
  }

  linesMesh = new THREE.LineSegments(geometry, linematerial);
  linesMesh.name = link.id;
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
    object.position.x = node.positionX;
    object.position.y = node.positionY; // todo
    object.position.z = node.positionZ;
    object.name = node.id;
    object.scale.x = 1;
    object.scale.y = 1;
    object.scale.z = 1;
    object.castShadow = true;
    object.receiveShadow = true;
    // 节点上文字
    if (showText) {
      const text = _createTextLabel();
      text.setHTML(node.name.length > 4 ? node.name.slice(0,3) : node.name);
      text.setParent(object);
      textlabels.push(text);
      container.appendChild(text.element);
    }
    nodesGroup.add(object);
    objects.push(object); // push objects
  }
}
function initGhostNodes() {
  for (let i = 0; i < iniNodes.length; i++) {
    const node = iniNodes[i];
    const parent = scene.getObjectByName(node.id).clone();

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
  var _this = this;
  return {
    element: div,
    parent: false,
    position: new THREE.Vector3(0, 0, 0),
    setHTML: function (html) {
      this.element.innerHTML = html.replace('服务', '');
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
      this.element.style.left = coords2d.x + "px";
      this.element.style.top = coords2d.y + "px";
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
  dragControls = new DragControls(
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
  // dragControls.addEventListener("dragstart", ({ object }) => {
  //   nowObj = object
  // })
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
    const boxWidth = width ? container.offsetWidth - width : container.offsetWidth
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
function showChannelLink(node, expand, vm) {
  if (viewMode === 'tree') {
    return;
  }
  if (!isChannelMode && !expand) {
    return
  }
  if (node) {
    showChannelGhostNodes(node.id, expand);
    initGhostLinks(node.id);
    updateChannelNodesVisibility(node);
    isChannelMode = true;
  }
}
function updateChannelNodesVisibility(node) {
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
function createChannelLink() {
  editModeOn();
  showChannelLink();
}
/**
 * 删除通道节点
 */
function deleteChannelNode() {
  editModeOn();
  posObj(nowObj);
  if (nowObj) {
    const id = nowObj.name;
    let index = iniNodes.findIndex(node => {
      return id === node.id
    })
    iniNodes[index].channel.forEach(channel => {
      const id = `${channel.channel}-${channel.appkey}`;
      const obj = scene.getObjectByName(id);
      const parent = scene.getObjectByName(iniNodes[index].id).clone();
      obj.position.x = parent.position.x;
      obj.position.z = parent.position.z;
      obj.visible = true;
      channels2Delete.push(obj);
    });
  }
}
function deleteChannelLink() {
  editModeOn();
  showChannelLink();
}
function renderMenu(object) {
  // console.log(object.position)
  const itemMap = [
    // { key: '1', title: '展示通道连接', func: showChannelLink },
    { key: '2', title: '关闭/开启节点连接信息', func: toggleNodeLinks },
    { key: '3', title: '设置节点颜色', func: showChannelColorDrawer },
    { key: '4', title: '设置channel_data', func: showChannelDataDrawer },
    { key: '5', title: '查看详情', func: '' },
    { key: '6', title: '删除节点', func: deleteChannelNode },
    { key: '7', title: '建立连接', func: createChannelLink },
    { key: '8', title: '删除连接', func: deleteChannelLink },
  ]
  const dContainer = document.getElementById("myDropdown");
  const itemList = document.createElement("div");
  dContainer.appendChild(itemList);
  itemList.setAttribute('id', 'itemList');
  itemMap.forEach(item => {
    const itemEle = document.createElement("a");
    itemEle.setAttribute('href', 'javascript:void(0)')
    itemEle.onclick = item.func
    itemEle.innerHTML = item.title
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
  iniLinks.forEach(link => {
    if (link.source === iniNodes[index].id) {
      relatedInstances.push(link.target)
    } else if (link.target === iniNodes[index].id) {
      relatedInstances.push(link.source)
    }
  })
  relatedInstances.forEach(id => {
    let idx = iniNodes.findIndex(node => {
      return node.id === id
    })
    iniNodes[idx].channel.forEach(channelNode => {
      const name = `${channelNode.channel}-${channelNode.appkey}`;
      const obj = scene.getObjectByName(name);
      const parent = scene.getObjectByName(iniNodes[idx].id);
      if (expand) {
        ghostNodes.push(name);
        obj.position.x = parent.position.x;
        obj.position.z = parent.position.z;
        obj.visible = true;
      } else {
        let index2Delete = ghostNodes.findIndex(gName => {
          return gName === name
        })
        obj.visible = false
        ghostNodes.splice(index2Delete, 1);
        if (ghostNodes.includes(name)) {
          obj.visible = true
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
  ghostTexture.offset.x -= 0.01;
  if (iniNodes.length > 0) {
    if (viewMode === 'tree') {
      findLineIntersections();
    }
    // findChannel2Delete();
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
  console.log('展示的通道节点', arr, '当前点击项', item)
  if (item.id === dataTree.id) {
    return;
  }
  scene.getObjectByName(`${item.pid}-${item.id}`).visible = item.checked;
  if (item.children.length > 0) {
    item.children.forEach(child => {
      scene.getObjectByName(`${item.id}-${child.id}`).visible = item.checked;
    })
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
    document.body.requestFullscreen();
    isFullScreen = true;
  } else {
    document.exitFullscreen();
    isFullScreen = false;
  }
}

// function findChannel2Delete() {
//   if (channels2Delete.length > 0) {
//     const intersects = raycaster.intersectObjects(channels2Delete, false);
//     if (intersects.length > 0) {
//       channel2Delete = intersects[0].object;
//       lastChannel2DeleteId = channel2Delete.name;
//       channel2Delete.material.color.set('red')
//     } else {
//       if (lastChannel2DeleteId) {
//         scene.getObjectByName(lastChannel2DeleteId).material.color.set(0x00ff00)
//         lastChannel2DeleteId = ''
//       }
//       channel2Delete = '';
//     }
//   }
// }
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
      if (obj1.visible && obj2.visible && !isChannelMode && !obj.forceHide) {
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
function toggleShowChildIns(node) {
  if (viewMode === 'tree') {
    if (node.id === dataTree.id) {
      return;
    }
    if (node.children.length > 0) {
      node.children.forEach(child => {
        scene.getObjectByName(child.id).visible = node.expand
        updateChildVisibility(child, node.expand)
        scene.getObjectByName(`${node.id}-${child.id}`).visible = node.expand
      })
    }
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

function editModeOn() {
  iniLinks.forEach(link => {
    const linkObj = scene.getObjectByName(link.id);
    linkObj.visible = false;
  })
  editMode = true;
  vm.editModeOn();
}
function posChannel(item) {
  if (viewMode === 'pics' && topuMode === 3) {
    channelClear();
    isChannelMode = true;
    iniLinks.forEach(link => {
      const linkObj = scene.getObjectByName(link.id);
      linkObj.visible = false;
    })
    const channelObj = scene.getObjectByName(`${item.channel.channel}-${item.channel.appkey}`);
    channelObj.visible = true;
    highLightNode(channelObj.name)
    posedObj.push(channelObj.name)
    const res = vm.getChannelLinks(item.channel);
    for (let i in res) {
      res[i].forEach(id => {
        const obj = scene.getObjectByName(id);
        obj.visible = true
        posedObj.push(obj.name)
      })
    }
  }
}
/**
 * 清除webgl 实例
*/
function sceneReset() {
  cancelAnimationFrame(animationId); // 暂停动画
  // 销毁三维场景相关
  renderer.forceContextLoss();
  renderer.dispose();
  renderer = null;
  axHelper = null;
  gridHelper = null;
  camera = null;
  objects = [];
  dragControls.dispose();
  dragControls = null;
  orbitControls = null;
  scene = null;
  // 销毁监听
  window.removeEventListener("resize", onWindowResize, false);
  container.removeEventListener("click", onNodeClick, false);
  container.removeEventListener("mousemove", onMouseMove, false);
}

function formatTreePos() {
  iniNodes.forEach(node => {
    scene.getObjectByName(node.id).visible = false
  })
  iniLinks.forEach(link => {
    scene.getObjectByName(link.id).visible = false;
  })
  scene.getObjectByName(dataTree.id).visible = true;

  dataTree.children.forEach(child => {
    scene.getObjectByName(child.id).visible = true;
    scene.getObjectByName(`${dataTree.id}-${child.id}`).visible = true
  })
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
}
