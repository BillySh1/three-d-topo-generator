/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-24 14:05:03
 * @LastEditTime: 2021-04-14 13:09:48
 */
import { Icon } from '@idg/iview';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Channel, InstanceLink, InstanceNode } from '../interfaces';
import style from '../styles/three-d-topu.module.less';
import * as core from '../static/js/core';
@Component({ depends: ['component.NodeCollapses'] })
export default class ChildSideBar extends Vue {
  @Prop() public readonly allData: { nodes: InstanceNode[]; links: InstanceLink[] };
  @Prop() public readonly topuMode: number;
  @Prop() public readonly viewMode: string;
  @Prop() public readonly show: boolean;
  @Prop() public readonly curPosedIns: string;
  public activeChild: string = '';
  public render() {
    return (
      <div style='position:relative' id='childSider' ref='child'>
        <div style='width:180px;background:#1e202d' class='overflow-y-auto h-full' v-show={this.show}>
          {this.$slots.default || (
            <node-collapses
              curPosedIns={this.curPosedIns}
              activeChild={this.activeChild}
              topuMode={this.topuMode}
              viewMode={this.viewMode}
              allData={{ nodes: this.allData.nodes, links: this.allData.links }}
              on-channelClick={(Ins: InstanceNode, ChannelR: Channel, id: string) => {
                const temp = {
                  ins: Ins,
                  channel: ChannelR,
                };
                if (this.topuMode === 3 && this.viewMode === 'pics') {
                  this.activeChild = id;
                  core.posChannel(temp);
                }
                this.$emit('channelClick', Ins, ChannelR);
              }}
              on-killChild={() => (this.activeChild = '')}
              on-fatherRtClick={(item: InstanceNode) => {
                this.$emit('childSidePanelRtClick', item);
              }}
              on-childRtClick={(item: Channel) => {
                this.$emit('childSideChannelRtClick', item);
              }}
              on-addIconClick={(node: InstanceNode) => {
                this.$emit('childSideAddIconClick', node);
              }}
              on-expandChild={(val: Channel[], type: boolean) => this.$emit('expandChild', val, type)}
            />
          )}
        </div>
        <div class={style.childOpen} v-show={!this.show} on-click={() => this.$emit('expand', true)}>
          <Icon type='ios-arrow-forward' size='16' />
        </div>
        <div class={style.childClose} v-show={this.show} on-click={() => this.$emit('expand', false)}>
          <Icon type='ios-arrow-back' size='16' />
        </div>
      </div>
    );
  }
}
