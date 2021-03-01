/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-21 11:35:25
 * @LastEditTime: 2021-03-01 15:41:36
 */
import { Log } from '@idg/idg';
import { Icon } from '@idg/iview';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import style from '../styles/three-d-topu.module.less';
import * as core from '../static/js/core';
import * as data from '../static/js/data';
import { Channel, InstanceLink, InstanceNode, NodeTree } from '../interfaces';
import InstanceTree from './father-side-bar';

@Component({
  depends: [
    'component.FatherSideBar',
    'component.ChildSideBar',
    'component.TopuBodyTree',
    'component.TopuBodyPics',
    'component.ContentTopbar',
    'component.TwoDTopu',
  ],
})
export default class IdgThreeDTopu extends Vue {
  @Prop({ default: () => [] }) public readonly nodes: InstanceNode[];
  @Prop({ default: () => [] }) public readonly links: InstanceLink[];
  @Prop({ default: () => [] }) public readonly cLinks: InstanceLink[];
  @Prop({ default: () => [] }) public readonly cNodes: InstanceNode[];
  @Prop({ default: 3 }) public readonly defaultTopuMode: number;
  @Prop({ default: 'pics' }) public readonly defaultViewMode: string;
  @Prop() public readonly fatherSiderContent: HTMLElement;
  @Prop() public readonly childSiderContent: HTMLElement;
  public showFatherSider: boolean = true;
  public showChildSider: boolean = true;
  public showNodes: NodeTree[];
  public topuMode: number;
  public viewMode: string;
  public allData: {
    nodes: InstanceNode[];
    links: InstanceLink[];
    cNodes: InstanceNode[];
    cLinks: InstanceLink[];
    tree: InstanceTree;
  };
  public curItem: {
    ins: InstanceNode;
    channel: Channel;
    color: string;
  };
  public threeData: { nodes: InstanceNode[]; links: InstanceLink[]; tree?: object };
  public dataTreeReal: object = {};
  public dataTreeFake: object = {};
  public data() {
    return {
      showNodes: [],
      curItem: {},
      threeData: {},
      allData: {},
      topuMode: '',
      viewMode: '',
    };
  }
  @Watch('showFatherSider')
  public watchFatherSider() {
    if (this.topuMode === 3) {
      this.$nextTick(() => core.onWindowResize((this.$refs.father as HTMLElement).offsetWidth));
    }
    // this.$nextTick(core.onWindowResize);
  }
  @Watch('showChildSider')
  public watchChildSider() {
    if (this.topuMode === 3) {
      this.$nextTick(() => core.onWindowResize((this.$refs.child as HTMLElement).offsetWidth));
    }
    // this.$nextTick(core.onWindowResize);
  }
  @Watch('topuMode', { immediate: true })
  public watchTopoMode() {
    if (this.topuMode === 3) {
      this.viewMode === 'tree'
        ? (this.threeData = {
            nodes: this.allData.cNodes,
            links: this.allData.cLinks,
            tree: this.dataTreeReal,
          })
        : (this.threeData = {
            nodes: this.allData.nodes,
            links: this.allData.links,
          });
    }
  }
  public created() {
    this.topuMode = this.defaultTopuMode;
    this.viewMode = this.defaultViewMode;
    document.oncontextmenu = () => false;

    this.allData = {
      nodes: this.nodes,
      links: this.links,
      cNodes: this.cNodes,
      cLinks: this.cLinks,
      tree: this.dataTreeReal as InstanceTree,
    };
    if (!this.nodes.length || !this.links.length || !this.cNodes.length || !this.cLinks.length) {
      Log.error('数据格式不正确');
    }
    data.initLayOut(this.allData.nodes, this.allData.links, this.allData.nodes[0].id, this.dataTreeFake);
    data.initLayOut(this.allData.cNodes, this.allData.cLinks, this.allData.cNodes[0].id, this.dataTreeReal);

    this.viewMode === 'tree'
      ? (this.threeData = {
          nodes: this.allData.cNodes,
          links: this.allData.cLinks,
          tree: this.dataTreeReal,
        })
      : (this.threeData = {
          nodes: this.allData.nodes,
          links: this.allData.links,
        });
    const colorMap = ['#5bbf3f', '#EE415b', '#ffb630', '#c860d1', '#11bea4'];
    this.allData.nodes.forEach((node) => {
      const color = colorMap[Math.ceil(Math.random() * 4)];
      this.$set(node, 'color', color);
    });
  }
  public checkDataProperty() {
    this.nodes.forEach((node) => {
      if (!node.id || !node.children || !node.name) {
        return false;
      }
    });
    return true;
  }
  public renderBody() {
    if (this.topuMode === 2) {
      return (
        <two-d-topu
          topoData={{ nodes: this.allData.nodes, links: this.allData.links }}
          tree={this.dataTreeReal}
          viewMode={this.viewMode}
        />
      );
    } else {
      const componentName = this.viewMode === 'tree' ? 'topu-body-tree' : 'topu-body-pics';
      Log.debug('current-render', componentName);
      return (
        <componentName
          viewMode={this.viewMode}
          topuMode={this.topuMode}
          showNodes={this.showNodes}
          curItem={this.curItem}
          allData={
            this.viewMode === 'tree'
              ? { nodes: this.allData.cNodes, links: this.allData.cLinks, tree: this.dataTreeReal }
              : { nodes: this.allData.nodes, links: this.allData.links }
          }
          ref='topuBody'
          on-dragEnd={(node: InstanceNode) => this.$emit('dragEnd', node)}
        />
      );
    }
  }
  public render() {
    return (
      <div class={style.Main}>
        {/* 左边内容 一级sidebar */}
        <div style='position:relative;height:100%' id='fatherSider' ref='father'>
          <div style='background:#1e202d' class='overflow-y-auto mx-1 p-2 h-full' v-show={this.showFatherSider}>
            <father-side-bar
              nodes={this.allData.nodes}
              links={this.allData.links}
              treeData={this.dataTreeReal}
              viewMode={this.viewMode}
              topuMode={this.topuMode}
              on-toggleViewMode={(val: string) => (this.viewMode = val)}
              on-search={(ipt: string) => {
                this.$store.commit('search', ipt);
              }}
              on-treeNodeClick={(item: InstanceTree) => {
                this.$emit('treeNodeClick', item);
              }}
            >
              {this.fatherSiderContent}
            </father-side-bar>
          </div>
          <div
            class={style.collapsesIcon}
            on-click={() => (this.showFatherSider = false)}
            v-show={this.showFatherSider}
          >
            <Icon type='ios-arrow-back' />
          </div>
          <div
            v-show={!this.showFatherSider}
            class={style.collapsesIconClosed}
            on-click={() => (this.showFatherSider = true)}
          >
            <Icon type='ios-arrow-forward' />
          </div>
        </div>
        {/*右边内容*/}
        <div class='my-1 w-full'>
          <content-topbar
            mode={this.topuMode}
            on-modeChange={(mode: number) => (this.topuMode = mode)}
            on-submitIconClick={() => this.$emit('submit')}
          />
          <div class='flex w-full my-1' style='height:calc(100% - 42px)'>
            <div style='position:relative' id='childSider' ref='child'>
              <div style='width:180px;background:#1e202d' class='overflow-y-auto h-full' v-show={this.showChildSider}>
                <child-side-bar
                  topuMode={this.topuMode}
                  viewMode={this.viewMode}
                  allData={{ nodes: this.allData.nodes, links: this.allData.links }}
                  on-channelClick={(Ins: InstanceNode, ChannelR: Channel) => {
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
                >
                  {this.childSiderContent}
                </child-side-bar>
              </div>
              <div class={style.childOpen} v-show={!this.showChildSider} on-click={() => (this.showChildSider = true)}>
                <Icon type='ios-arrow-forward' size='16' />
              </div>
              <div class={style.childClose} v-show={this.showChildSider} on-click={() => (this.showChildSider = false)}>
                <Icon type='ios-arrow-back' size='16' />
              </div>
            </div>

            <div style='color:white' class='w-full'>
              {this.renderBody()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
