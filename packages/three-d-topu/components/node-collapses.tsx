/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-21 20:01:17
 * @LastEditTime: 2021-03-01 15:27:54
 */
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Channel, InstanceLink, InstanceNode } from '../interfaces';
@Component({ depends: ['component.NodePanel'] })
export default class NodeCollapses extends Vue {
  @Prop() public readonly allData: { nodes: InstanceNode[]; links: InstanceLink[] };
  @Prop() public readonly topuMode: number;
  @Prop() public readonly viewMode: string;

  public data() {
    return {};
  }
  public render() {
    return (
      <div style='color:white;position:relative'>
        {this.allData.nodes &&
          this.allData.nodes.length &&
          this.allData.nodes.map((node: InstanceNode) => {
            return (
              <node-panel
                topuMode={this.topuMode}
                viewMode={this.viewMode}
                node={node}
                links={this.allData.links}
                nodes={this.allData.nodes}
                on-channelClick={(ins: InstanceNode, channel: Channel) => {
                  this.$emit('channelClick', ins, channel);
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
              />
            );
          })}
      </div>
    );
  }
}
