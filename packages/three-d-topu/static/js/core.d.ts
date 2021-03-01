import { Channel, InstanceNode, NodeTree } from 'packages/three-d-topu/interfaces';

/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-29 09:57:20
 * @LastEditTime: 2021-02-25 08:30:50
 */
declare function initThreeDTopu(): void;
declare function sendThis(_this: any, nodes: any, links: any, tree: any): void;
declare function toggleShowText(): void;
declare function toggleShowHelper(): void;
declare function channelClear(): void;
declare function revoke(): void;
declare function listener(): void;
declare function highLightNode(obj: any): void;
declare var renderer: any;
declare function toggleShowNodes(arr: any[], item: any): void;
declare function posObj(arr?: InstanceNode[], node?: InstanceNode): void;
declare function narrow(): void;
declare function enlarge(): void;
declare function fullScreen(): void;
declare function toggleShowNodesPic(node?: NodeTree): void;
declare function onWindowResize(width: number): void;
declare function posChannel(item: { ins: InstanceNode; channel: Channel }): void;
declare function toggleShowLinks(): void;
declare function showChannelLink(node?: InstanceNode, isExpand?: boolean): void;
declare function toggleShowChildIns(node: InstanceNode): void;
declare function sceneReset(): void;
declare function toggleExpand(type: boolean): void;
declare function removeHightNodes(): void;
export {
  initThreeDTopu,
  sendThis,
  toggleShowText,
  toggleShowHelper,
  channelClear,
  revoke,
  listener,
  highLightNode,
  renderer,
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
  toggleExpand,
  removeHightNodes,
};
