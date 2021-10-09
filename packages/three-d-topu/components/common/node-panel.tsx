/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-22 09:28:27
 * @LastEditTime: 2021-04-13 15:55:48
 */
import { Avatar, Icon } from '@idg/iview';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import style from '../../styles/node-panel.module.less';
import _ from 'lodash';
import * as core from '../../static/js/core';
import { Channel, InstanceLink, InstanceNode } from '../../interfaces';
// const TAG = 'NodePanel';
interface Custom {
  text: string;
  color: string;
}
@Component
export default class NodePanel extends Vue {
  @Prop() public readonly links: InstanceLink[];
  @Prop() public readonly node: InstanceNode;
  @Prop() public readonly nodes: InstanceNode[];
  @Prop() public readonly topuMode: number;
  @Prop() public readonly viewMode: string;
  @Prop() public readonly activeChild: string;
  @Prop() public readonly curPosedIns: string;
  public isExpand: boolean = false;
  public choosed: boolean = false;
  public isActiveTab: boolean = false;
  public data() {
    return {};
  }
  public addIconClick(e: Event) {
    e.stopPropagation();
    this.$emit('addIconClick', this.node);
  }
  public get channelLinks() {
    const temp: Array<{ source: Channel; target: Channel }> = [];
    this.links.forEach((link) => {
      if (link.channel_link) {
        link.channel_link.forEach((cLink) => {
          temp.push(cLink);
        });
      }
    });
    return temp;
  }
  public get searchIpt() {
    return this.$store.state.searchIpt;
  }
  @Watch('curPosedIns')
  public watchCurPosedIns(val: string) {
    if (val && this.node.id !== val) {
      this.isExpand = false;
    }
  }
  @Watch('searchIpt')
  public watchSearchIpt(val: string) {
    if (val === this.node.name) {
      this.choosed = true;
    } else if (val === '') {
      this.choosed = false;
    }
  }
  @Watch('topuMode')
  public watchTopuMode() {
    this.isExpand = false;
  }
  @Watch('viewMode')
  public watchViewMode() {
    this.isExpand = false;
  }
  @Watch('activeChild')
  public watchActiveChild(val: string) {
    if (this.node.channel && this.node.channel.length) {
      this.isActiveTab = false;
      this.node.channel.forEach((channel) => {
        if (val === `${channel.appkey}-${channel.channel}`) {
          this.isActiveTab = true;
        }
      });
    }
  }
  public getRelatedName(): Custom | string {
    return {
      text: this.node.name[0],
      color: this.node.color as string,
    };
  }
  public renderChannelNodes() {
    return (
      <div class={style.channelNodeContainer}>
        {(this.isExpand &&
          this.node.channel &&
          this.node.channel.length > 0 &&
          this.node.channel.map((channel) => {
            const obj = this.getRelatedName() as Custom;
            return (
              <div
                id={channel.appkey}
                class={style.channelNode}
                on-click={() => {
                  this.$emit('channelClick', this.node, channel, `${channel.appkey}-${channel.channel}`);
                  this.isActiveTab = true;
                }}
                on-mousedown={(e: MouseEvent) => {
                  if (e.button === 2) {
                    this.$emit('childRtClick', channel);
                  }
                }}
                style={`background:${this.activeChild === `${channel.appkey}-${channel.channel}` ? '#3a3d51' : ''}`}
              >
                <Avatar
                  shape='square'
                  size='small'
                  class={style.Avatar}
                  style={`color:${obj.color};border:1px solid ${obj.color}`}
                >
                  {obj.text}
                </Avatar>
                {`Channel：${channel.channel}` || '未知通道'}
              </div>
            );
          })) ||
          ''}
      </div>
    );
  }
  public handleMouseDown(e: MouseEvent) {
    if (e.button === 2) {
      this.$emit('fatherRtClick', this.node);
    }
  }
  public render() {
    return (
      <div>
        <div
          class={style.Panel}
          on-click={() => {
            this.isExpand = !this.isExpand;
            if (this.topuMode === 3 && this.viewMode === 'pics') {
              if (this.node.channel && this.node.channel.length > 0) {
                if (!this.isExpand && this.isActiveTab) {
                  this.$emit('killChild');
                }
                core.showChannelLink(this.node, this.isExpand);
              }
            } else if (this.topuMode === 2 && this.viewMode === 'tree') {
              this.$emit('expandChild', this.node.channel, this.isExpand);
            }
          }}
          on-mousedown={this.handleMouseDown}
        >
          <div>
            {(!this.isExpand && <Icon type='ios-arrow-forward' class='mr-2'></Icon>) || (
              <Icon type='ios-arrow-down' class='mr-2' />
            )}
            <span style={this.choosed ? 'color:red' : ''}>
              {this.node ? `${this.node.name} ` : '未知实例'}
              <span class='text-gray-7'>({this.node.channel ? this.node.channel.length : 0})</span>
            </span>
          </div>
          <div class={style.iconContainer} on-click={this.addIconClick}>
            <Icon type='md-add' />
          </div>
        </div>
        {this.$slots.default || (this.isExpand && this.renderChannelNodes()) || ''}
      </div>
    );
  }
}
