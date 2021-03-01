/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:44:21
 * @LastEditTime: 2021-02-28 17:55:49
 */
import { Service, ChannelOptions } from '@idg/idg';
import packages from './packages';
/* import UcenterService from '@idg/ucenter'; */

export default class ThreeDTopuService extends Service {
  constructor(channelOptions: ChannelOptions) {
    const children: Service[] = [
      /* new UcenterService({
        channelAlias: 'default',
      }), */
    ];
    super({
      appid: 'cac9ffb424e44a0f924a2536f304cc93',
      packages,
      channelOptions,
      children,
    });
  }
}

export { default as IdgThreeDTopu } from './three-d-topu/components/idg-three-d-topu';
export { default as TopuBodyTree } from './three-d-topu/components/topu-body-tree';
export { default as TopuBodyPics } from './three-d-topu/components/topu-body-pics';
export { default as FatherSideBar } from './three-d-topu/components/father-side-bar';
export { default as NodeCollapses } from './three-d-topu/components/node-collapses';
export { default as NodePanel } from './three-d-topu/components/common/node-panel';
export { default as DetailDrawer } from './three-d-topu/components/detail-drawer.vue';
export { default as PopModal } from './three-d-topu/components/common/pop-modal';
export { default as FahterPanel } from './three-d-topu/components/common/father-panel';
export { default as ContentTopbar } from './three-d-topu/components/content-topbar';
export { default as TwoDTopu } from './three-d-topu/components/2d-topu/two-d-topu';
export { default as TwoDGraph } from './three-d-topu/components/2d-topu/two-d-graph';
export { default as TwoDTree } from './three-d-topu/components/2d-topu/two-d-tree';
export { default as TwoDTopuItem } from './three-d-topu/components/2d-topu/two-d-topu-item';
export { default as ChildSideBar } from './three-d-topu/components/child-side-bar';
