/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-21 11:35:25
 * @LastEditTime: 2021-08-13 17:33:34
 */
import { Log } from '@idg/idg';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import style from '../styles/three-d-topu.module.less';
import * as core from '../static/js/core';
import { Channel, InstanceLink, InstanceNode, NodeTree } from '../interfaces';
import InstanceTree from './father-side-bar';
import { FatherData } from '../interfaces/father';

interface CurExpandData {
  nodes: InstanceNode[];
  links: InstanceLink[];
  tree: NodeTree;
}
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
  @Prop() public readonly initData: FatherData[];
  @Prop({ default: 2 }) public readonly defaultTopuMode: number;
  @Prop({ default: 'pics' }) public readonly defaultViewMode: string;
  @Prop() public readonly twoDTreeHoverFields: string[];
  @Prop() public readonly twoDPicsHoverFields: string[];
  @Prop() public readonly showBackIcon: boolean;
  @Prop() public readonly title: string;
  @Prop() public readonly curExpand: string;
  public activeTab: string = 'dataList';
  public showFatherSider: boolean = true;
  public showChildSider: boolean = true;
  public showNodes: NodeTree[];
  public topuMode: number;
  public viewMode: string;
  public isDataChange: number = 0;
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
  public insModeTreeData: object = {};
  public nowTree: NodeTree;
  public curExpandData: CurExpandData;
  public refresh: boolean = true;
  public curPosedIns: string = '';
  public data() {
    return {
      showNodes: [],
      curItem: {},
      allData: {},
      topuMode: '',
      viewMode: '',
      nowTree: {},
      curExpandData: {
        nodes: [],
        links: [],
        tree: {},
      },
    };
  }

  @Watch('showFatherSider')
  public watchFatherSider() {
    if (this.topuMode === 3) {
      this.$nextTick(() =>
        core.onWindowResize(((this.$refs.father as this).$refs.container as HTMLElement).offsetWidth),
      );
    }
  }
  @Watch('showChildSider')
  public watchChildSider() {
    if (this.topuMode === 3) {
      this.$nextTick(() => core.onWindowResize(((this.$refs.child as this).$refs.child as HTMLElement).offsetWidth));
    }
  }
  @Watch('defaultViewMode', { immediate: true })
  public watchDefaultViewMode(val: string) {
    this.viewMode = val;
  }
  @Watch('curExpand', { immediate: true })
  public watchCurExpand(val: string) {
    this.activeTab = val;
  }
  @Watch('defaultTopuMode', { immediate: true })
  public watchDefaultTopoMode(val: number) {
    this.topuMode = val;
  }

  public created() {
    document.oncontextmenu = () => false;
  }

  public refreshBody() {
    this.refresh = false;
    this.$nextTick(() => {
      this.refresh = true;
    });
  }
  public renderBody() {
    if (this.topuMode === 2) {
      return (
        this.refresh && (
          <two-d-topu
            topoData={{ nodes: this.curExpandData.nodes, links: this.curExpandData.links }}
            tree={this.curExpandData.tree}
            viewMode={this.viewMode}
            twoDTreeHoverFields={this.twoDTreeHoverFields}
            twoDPicsHoverFields={this.twoDPicsHoverFields}
          />
        )
      );
    } else {
      const componentName = this.viewMode === 'tree' ? 'topu-body-tree' : 'topu-body-pics';
      Log.debug('current-render', componentName);
      return (
        this.refresh && (
          <componentName
            nowTree={this.nowTree}
            viewMode={this.viewMode}
            detailFields={this.viewMode === 'tree' ? this.twoDTreeHoverFields : this.twoDPicsHoverFields}
            topuMode={this.topuMode}
            showNodes={this.showNodes}
            curItem={this.curItem}
            allData={{
              nodes: this.curExpandData.nodes,
              links: this.curExpandData.links,
              tree: this.curExpandData.tree,
            }}
            ref='topuBody'
            on-dragEnd={(node: InstanceNode) => this.$emit('dragEnd', node)}
            on-posChannel={(id: string) => (this.curPosedIns = id)}
          />
        )
      );
    }
  }
  public findTreeNodeAndHighLight(tree: NodeTree, id: string, isExpand: boolean) {
    if (tree.originId && tree.originId === id) {
      this.$set(tree, 'highLight', isExpand ? true : false);
    }
    if (tree.children.length > 0) {
      tree.children.forEach((child) => {
        this.findTreeNodeAndHighLight(child, id, isExpand);
      });
    }
  }
  public submenuExpandChild(arr: Channel[], isExpand: boolean) {
    arr.forEach(async (item) => {
      const id = `${item.appkey}_${item.channel}`;
      await this.findTreeNodeAndHighLight(this.curExpandData.tree, id, isExpand);
    });
  }
  public setColor(nodes: InstanceNode[]) {
    const colorMap = ['#5bbf3f', '#EE415b', '#ffb630', '#c860d1', '#11bea4'];
    nodes.forEach((node) => {
      const color = colorMap[Math.ceil(Math.random() * 4)];
      this.$set(node, 'color', color);
    });
  }
  public render() {
    let curChildData;
    const index = this.initData.findIndex((item) => {
      return this.curExpand === item.id;
    });
    if (index !== -1) {
      curChildData = {
        nodes: this.initData[index].nodes,
        links: this.initData[index].links,
        tree: this.curExpandData.tree,
      };
      this.setColor(curChildData.nodes);
    }
    return (
      <div class={style.Main}>
        (
        <father-side-bar
          ref='father'
          initData={this.initData}
          viewMode={this.viewMode}
          topuMode={this.topuMode}
          treeData={this.curExpandData.tree}
          show={this.showFatherSider}
          on-expand={(val: boolean) => (this.showFatherSider = val)}
          on-toggleViewMode={(val: string) => (this.viewMode = val)}
          on-search={(ipt: string) => {
            this.$store.commit('search', ipt);
          }}
          on-treeTopuModeChange={(tree: NodeTree) => (this.nowTree = tree)}
          on-treeNodeClick={(item: NodeTree) => {
            this.$emit('treeNodeClick', item);
          }}
          showBackIcon={this.showBackIcon}
          on-back={() => {
            this.$router.go(-1);
            this.$emit('back');
          }}
          on-2dTreeExpand={(tree: NodeTree) => (this.curExpandData.tree = tree)}
          title={this.title}
          activeTab={this.activeTab}
          on-tabExpand={(
            val: string,
            tmpData: { nodes: InstanceNode[]; links: InstanceLink[]; tree: NodeTree },
            force: boolean,
          ) => {
            this.activeTab = val;
            this.curExpandData = tmpData;
            Log.debug('curTab', val, 'curData', this.curExpandData);
            if (force) {
              this.refreshBody();
            }
          }}
        ></father-side-bar>
        ){/*右边内容*/}
        <div class='my-1 w-full'>
          <content-topbar
            mode={Number(this.topuMode)}
            on-modeChange={(mode: number) => (this.topuMode = mode)}
            on-submitIconClick={() => this.$emit('submit')}
          />
          <div class='flex w-full my-1' style='height:calc(100% - 36px)'>
            <child-side-bar
              ref='child'
              topuMode={this.topuMode}
              viewMode={this.viewMode}
              allData={curChildData}
              show={this.showChildSider}
              curPosedIns={this.curPosedIns}
              on-channelClick={(Ins: InstanceNode, ChannelR: Channel) => {
                this.$emit('childPanelClick', Ins, ChannelR);
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
              on-expand={(val: boolean) => {
                this.showChildSider = val;
              }}
              on-expandChild={(val: Channel[], isExpand: boolean) => this.submenuExpandChild(val, isExpand)}
            ></child-side-bar>

            <div class='w-full h-full relative'>{this.renderBody()}</div>
          </div>
        </div>
      </div>
    );
  }
}
