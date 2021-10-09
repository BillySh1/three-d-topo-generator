import { InstanceLink, InstanceNode, NodeTree } from '../../interfaces/index';

/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-29 09:57:25
 * @LastEditTime: 2021-03-30 11:50:20
 */
declare var nodes: InstanceNode[];
declare var links: InstanceLink[];
declare var dataTree: any;
declare var cNodes: any[];
declare var cLinks: any[];
declare var channelTree: NodeTree;
declare function initLayOut(nodes: any[], links: any[], id: string, tree: any): void;
declare function genTree(nodes: any[], links: any[], rootId: string, tree: any): void;
declare function initTreeLayout(nodes: any[], tree: any): void;
export { nodes, links, dataTree, cNodes, cLinks, channelTree, initLayOut, genTree, initTreeLayout };
