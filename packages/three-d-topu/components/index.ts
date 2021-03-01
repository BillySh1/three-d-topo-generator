/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:51:26
 * @LastEditTime: 2021-02-25 09:09:48
 */
import { Components } from '@idg/idg';
import TopuBodyTree from './topu-body-tree';
import TopuBodyPics from './topu-body-pics';
import FatherSideBar from './father-side-bar';
import IdgThreeDTopu from './idg-three-d-topu';
import NodeCollapses from './node-collapses';
import NodePanel from './common/node-panel';
import DetailDrawer from './detail-drawer.vue';
import PopModal from './common/pop-modal';
import FatherPanel from './common/father-panel';
import ContentTopbar from './content-topbar';
import TwoDTopu from './2d-topu/two-d-topu';
import TwoDGraph from './2d-topu/two-d-graph';
import TwoDTree from './2d-topu/two-d-tree';
import TwoDTopuItem from './2d-topu/two-d-topu-item';
import ChildSideBar from './child-side-bar';

const components: Components = {
  FatherSideBar,
  IdgThreeDTopu,
  NodeCollapses,
  NodePanel,
  TopuBodyTree,
  TopuBodyPics,
  DetailDrawer,
  PopModal,
  FatherPanel,
  ContentTopbar,
  TwoDTopu,
  TwoDGraph,
  TwoDTree,
  TwoDTopuItem,
  ChildSideBar,
};

export default components;
