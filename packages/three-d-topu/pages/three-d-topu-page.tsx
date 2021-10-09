/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:52:22
 * @LastEditTime: 2021-04-01 17:17:44
 */
import { Log } from '@idg/idg';
import { Vue, Component } from 'vue-property-decorator';
import * as data from '../static/js/data';
@Component({ depends: ['component.IdgThreeDTopu'] })
export default class ThreeDTopuPage extends Vue {
  public get allData() {
    return {
      nodes: data.nodes,
      links: data.links,
      cNodes: data.cNodes,
      cLinks: data.cLinks,
    };
  }
  public get initData() {
    return [
      {
        id: this.allData.nodes[0].id, // 顶节点 id
        name: this.allData.nodes[0].name, // 顶节点 name
        nodes: this.allData.nodes, // 图视图节点数据
        links: this.allData.links, // 图视图连线数据
        cNodes: this.allData.cNodes, // 树视图节点数据
        cLinks: this.allData.cLinks, // 树视图连线数据
      },
    ];
  }
  public render() {
    return (
      <idg-three-d-topu
        initData={this.initData}
        twoDTreeHoverFields={['name', 'appid', 'version', 'appkey', 'channel', 'channel_data', 'channel_mode']}
        twoDPicsHoverFields={['name', 'unique_id', 'appid', 'version', 'host']}
        // defaultViewMode='tree'
        on-back={() => Log.debug('backIcon click')}
        curExpand={this.allData.nodes[0].id}
        title='查看拓扑'
      />
    );
  }
}

// 属性
/**
 * Prop:
 * 1、cNodes 通道节点数组 必传
 * 2、cLinks 通道连接数组 必传
 * 3、nodes 实例节点数组 必传
 * 4、links 实例连接数组 必传
 * 5、defaultViewMode 可填值（'tree','pics'):string
 * 6、defaultTopuMode 可填值（2，3）:number
 * 7、fatherSiderContent，父级sider插槽内容，不填渲染默认父级sider结构
 * 8、childSiderContent，子级sider插槽内容，不填渲染默认子级sider结构
 * 9、twoDTreeHoverFields， 二维树视图节点悬浮展示字段数组，注：需要与后端返回字段一致
 * 10、showBackIcon， 是否显示面板返回icon
 */

// 事件
/**
 * on:
 * 1、dragEnd: 拖拽结束事件，param：node(节点数据)
 * 2、channelClick: 二级菜单，通道（子）节点点击事件， param: node, channel
 * 3、childSidePanelRtClick: 二级菜单，panel右击事件，params: node
 * 4、childSideChannelRtClick：二级菜单，channel右击事件， params:channel
 * 5、childSideAddIconClick: 二级菜单，panel add icon 点击事件， params: node
 * 6、submit：topbar提交事件，具体逻辑需根据业务确定，现暂时抛出提交事件
 * 7、treeNodeClick: 树节点点击事件， params: item
 * 8、back: 面板返回点击事件
 */
