/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:51:26
 * @LastEditTime: 2021-04-13 16:09:34
 */
export interface InstanceNode {
  [index: string]: unknown;
  channel?: Array<{ appkey: string; channel: number }>;
  cpm?: number;
  depth?: number;
  id: string;
  isGroupActive?: boolean;
  isReal?: boolean;
  latency?: number;
  linksNum?: number;
  name: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  settedDepth?: boolean;
  settedPos?: boolean;
  sla?: number;
  type?: string;
  children?: InstanceNode[];
  checked?: boolean;
  color?: string;
  appkey?: string;
  unique_id?: string;
  info?: Info;
  originId?: string;
}
export interface Info {
  [index: string]: string;
}
export interface NodeTree {
  depth: number;
  depthSetted: boolean;
  expand: boolean;
  id: string;
  name: string;
  nodeKey: number;
  pid: string;
  settedPos: boolean;
  title: string;
  checked?: boolean;
  children: NodeTree[];
  originId?: string;
}
export interface InstanceLink {
  id: string;
  source: string;
  target: string;
  channel_link?: Array<{ source: Channel; target: Channel }>;
  cpm?: number;
  latency?: number;
}
export interface Channel {
  appkey: string;
  channel: number;
}
