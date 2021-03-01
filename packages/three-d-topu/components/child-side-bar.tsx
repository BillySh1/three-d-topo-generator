/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-24 14:05:03
 * @LastEditTime: 2021-02-24 14:06:54
 */
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Channel, InstanceLink, InstanceNode } from '../interfaces';
import * as core from '../static/js/core';
@Component({ depends: ['component.NodeCollapses'] })
export default class ChildSideBar extends Vue {
  @Prop() public readonly allData: { nodes: InstanceNode[]; links: InstanceLink[] };
  @Prop() public readonly topuMode: number;
  @Prop() public readonly viewMode: string;
  public render() {
    return (
      <div>
        {this.$slots.default || (
          <node-collapses
            topuMode={this.topuMode}
            viewMode={this.viewMode}
            allData={{ nodes: this.allData.nodes, links: this.allData.links }}
            on-channelClick={(Ins: InstanceNode, ChannelR: Channel) => {
              const temp = {
                ins: Ins,
                channel: ChannelR,
              };
              if (this.topuMode === 3 && this.viewMode === 'pics') {
                core.posChannel(temp);
              }
              this.$emit('channelClick', Ins, ChannelR);
            }}
            on-fatherRtClick={(item: InstanceNode) => {
              this.$emit('childSidePanelRtClick', item);
            }}
            on-childRtClick={(item: Channel) => {
              this.$emit('childSideChannelRtClick', item);
            }}
            on-addIconClick={(node: InstanceNode) => {
              this.$emit('childSideAddIconClick', node);
            }}
          />
        )}
      </div>
    );
  }
}
