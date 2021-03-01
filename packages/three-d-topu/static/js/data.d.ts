import { InstanceLink, InstanceNode, NodeTree } from '../../interfaces/index';

/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-29 09:57:25
 * @LastEditTime: 2021-02-23 15:09:30
 */
declare var nodes: InstanceNode[];
declare var links: InstanceLink[];
declare var dataTree: any;
declare var cNodes: any[];
declare var cLinks: any[];
declare var channelTree: NodeTree;
declare function initLayOut(nodes: any[], links: any[], id: string, tree: any): void;
export { nodes, links, dataTree, cNodes, cLinks, channelTree, initLayOut };
