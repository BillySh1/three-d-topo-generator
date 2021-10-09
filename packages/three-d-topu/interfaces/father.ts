import { InstanceLink, InstanceNode, NodeTree } from './index';

/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-03-17 14:46:22
 * @LastEditTime: 2021-03-23 17:24:46
 */
export interface FatherConfig {
  title: string;
  viewMode: string;
  topuMode: number;
  data: FatherData[];
  treeData: NodeTree;
  showBackIcon: boolean;
  width: number;
}
export interface FatherData {
  name: string;
  id: string;
  nodes: InstanceNode[];
  links: InstanceLink[];
  cNodes: InstanceNode[];
  cLinks: InstanceLink[];
}
