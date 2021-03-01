/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:52:22
 * @LastEditTime: 2021-03-01 15:40:50
 */
import { Vue, Component } from 'vue-property-decorator';
import * as data from '../static/js/data';
@Component({ depends: ['component.IdgThreeDTopu'] })
export default class ThreeDTopuPage extends Vue {
  public render() {
    return <idg-three-d-topu nodes={data.nodes} links={data.links} cNodes={data.cNodes} cLinks={data.cLinks} />;
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
 */
