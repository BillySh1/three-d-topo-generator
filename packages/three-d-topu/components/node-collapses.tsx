/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-21 20:01:17
 * @LastEditTime: 2021-04-13 15:56:02
 */
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Channel, InstanceLink, InstanceNode } from '../interfaces';
@Component({ depends: ['component.NodePanel'] })
export default class NodeCollapses extends Vue {
  @Prop() public readonly allData: { nodes: InstanceNode[]; links: InstanceLink[] };
  @Prop() public readonly topuMode: number;
  @Prop() public readonly viewMode: string;
  @Prop() public readonly activeChild: string;
  @Prop() public readonly curPosedIns: string;

  public data() {
    return {};
  }
  public render() {
    return (
      <div style='color:white;position:relative'>
        {(this.allData.nodes &&
          this.allData.nodes.length &&
          this.allData.nodes.map((node: InstanceNode) => {
            return (
              <node-panel
                curPosedIns={this.curPosedIns}
                activeChild={this.activeChild}
                topuMode={this.topuMode}
                viewMode={this.viewMode}
                node={node}
                links={this.allData.links}
                nodes={this.allData.nodes}
                on-channelClick={(ins: InstanceNode, channel: Channel, id: string) => {
                  this.$emit('channelClick', ins, channel, id);
                }}
                on-fatherRtClick={(item: InstanceNode) => {
                  this.$emit('fatherRtClick', item);
                }}
                on-childRtClick={(item: Channel) => {
                  this.$emit('childRtClick', item);
                }}
                on-addIconClick={(item: InstanceNode) => {
                  this.$emit('addIconClick', item);
                }}
                on-killChild={() => this.$emit('killChild')}
                on-expandChild={(val: Channel[], type: boolean) => this.$emit('expandChild', val, type)}
              />
            );
          })) ||
          '暂无数据'}
      </div>
    );
  }
}
