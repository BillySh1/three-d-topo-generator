/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-26 10:55:05
 * @LastEditTime: 2021-03-31 14:33:13
 */
import { Log } from '@idg/idg';
import { Dropdown, DropdownItem, DropdownMenu, Icon, Spin, Tooltip } from '@idg/iview';
import _ from 'lodash';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import style from '../styles/topu-body.module.less';
import * as core from '../static/js/core';
import { Channel, InstanceLink, InstanceNode, NodeTree } from '../interfaces';
interface AllData {
  nodes: InstanceNode[];
  links: InstanceLink[];
  tree: NodeTree;
}
@Component({ depends: ['component.DetailDrawer'] })
export default class TopuBody extends Vue {
  @Prop() public readonly allData: AllData;
  @Prop() public readonly viewMode: string;
  @Prop() public readonly topuMode: number;
  @Prop() public readonly detailFields: string[];
  @Prop() public readonly nowTree: NodeTree;
  public curData: AllData;
  public resourceLoading: boolean = false;
  public showText: boolean = true;
  public showGrid: boolean = true;
  public showLinks: boolean = true;
  public isFullScreen: boolean = false;
  public showDrawer: boolean;
  public nowInstance: InstanceNode;
  public drawerMode: string;
  public menuExpand: boolean;
  public editMode: boolean;
  // tslint:disable-next-line: no-any
  public nowObj: any = {};
  public data() {
    return {
      showDrawer: false,
      nowInstance: null,
      drawerMode: 'data',
      menuExpand: true,
      editMode: false,
      curData: {},
    };
  }
  @Watch('editMode')
  public watchEidtMode(val: boolean) {
    if (!val) {
      core.channelClear();
    }
  }

  @Watch('viewMode')
  public watchViewMode() {
    this.clearThreeDScene();
  }
  @Watch('topuMode')
  public watchTopuMode() {
    this.clearThreeDScene();
  }
  @Watch('allData', { deep: true, immediate: true })
  public watchAllData() {
    this.curData = JSON.parse(JSON.stringify(this.allData));
  }
  public posChildItem(id: string) {
    this.$emit('posChannel', id);
  }
  public mounted() {
    if (!window.THREE) {
      this.resourceLoading = true;
    }
    Log.debug('current TopuMode:', this.topuMode, 'D', 'current ViewMode:', this.viewMode);
    this.$nextTick(async () => {
      this.curData = JSON.parse(JSON.stringify(this.allData));
      if (!this.curData.nodes || !this.curData.nodes.length) {
        this.resourceLoading = false;
        return;
      }
      await core.sendThis(this, this.curData.nodes, this.curData.links, this.curData.tree);
      if (this.curData.tree && this.curData.tree.id && this.viewMode === 'tree') {
        core.toggleShowChildIns(JSON.parse(JSON.stringify(this.curData.tree)));
        // core.refreshAllLinks();
      }
    });
    if (window.THREE) {
      this.resourceLoading = false;
    }
  }
  public beforeDestroy() {
    this.clearThreeDScene();
  }
  public clearThreeDScene() {
    core.sceneReset();
  }
  public emitDrag(node: InstanceNode) {
    this.$emit('dragEnd', node);
  }
  public showFilterDrawer() {
    this.drawerMode = 'search';
    this.showDrawer = true;
  }
  public renderCameras() {
    const map = [2, 3, 4, 5];
    return (
      <Dropdown trigger='hover'>
        <span id='camera1'>
          <img src={require('../static/img/icon/camera1.svg')} class='cursor-pointer' style='margin:0px 6px' />
        </span>
        <DropdownMenu slot='list' style='background:#2c2f4b'>
          {map.map((i) => {
            return (
              <span id={`camera${i}`}>
                <DropdownItem name={`camera${i}`}>
                  <img src={require(`../static/img/icon/camera${i}.svg`)} />
                </DropdownItem>
              </span>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }
  public toggleShowText() {
    this.showText = !this.showText;
    core.toggleShowText();
  }
  public toggleShowGrid() {
    this.showGrid = !this.showGrid;
    core.toggleShowHelper();
  }
  public toggleShowLinks() {
    this.showLinks = !this.showLinks;
    core.toggleShowLinks();
  }
  public toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    core.fullScreen();
  }
  public renderButtons() {
    const iconMap = [
      {
        key: 'text',
        src: this.showText
          ? require('../static/img/icon/showText.svg')
          : require('../static/img/icon/hideNodeName.svg'),
        text: this.showText ? '隐藏节点文字' : '显示节点文字',
        func: this.toggleShowText,
      },
      {
        key: 'helper',
        src: this.showGrid ? require('../static/img/icon/showGrid.svg') : require('../static/img/icon/hideGrid.svg'),
        text: this.showGrid ? '隐藏坐标系' : '显示坐标系',
        func: this.toggleShowGrid,
      },
      {
        key: 'links',
        src: this.showLinks
          ? require('../static/img/icon/showLink.svg')
          : require('../static/img/icon/notShowLink.svg'),
        text: this.showLinks ? '隐藏实例连接' : '显示实例连接',
        func: this.toggleShowLinks,
      },
      // { key: 'refresh', src: require('../static/img/icon/shuaxin.svg'), text: '重 置', func: core.channelClear },
      { key: 'revoke', src: require('../static/img/icon/chongzhi.svg'), text: '撤 销', func: core.revoke },
      {
        key: 'fullScreen',
        src: this.isFullScreen
          ? require('../static/img/icon/exitFullScreen.svg')
          : require('../static/img/icon/fullScreen.svg'),
        text: this.isFullScreen ? '退出全屏' : '全屏',
        func: this.toggleFullScreen,
      },
      { key: 'enlarge', src: require('../static/img/icon/fangda.svg'), text: '放 大', func: core.enlarge },
      { key: 'narrow', src: require('../static/img/icon/suoxiao 1.svg'), text: '缩 小', func: core.narrow },
      { key: 'md-menu', src: require('../static/img/icon/filter.svg'), text: '筛 选', func: this.showFilterDrawer },
      // { key: 'output', src: require('../static/img/icon/qianwangyunwei.svg'), text: '导 出', func: core.outputScene },
    ];
    return (
      <div class={style.btnContainer}>
        <a on-click={this.toggleShowTopMenu} v-show={this.menuExpand}>
          <Icon type='ios-arrow-forward' size='16' color='white' />
        </a>
        <div v-show={this.menuExpand}>
          {iconMap.map((item) => {
            return (
              <Tooltip content={item.text} placement='top' transfer>
                <a on-click={item.func}>
                  <img src={item.src} />
                </a>
              </Tooltip>
            );
          })}
          {this.renderCameras()}
        </div>
        <a v-show={!this.menuExpand} on-click={this.toggleShowTopMenu}>
          <Icon type='ios-arrow-back' size='16' color='white' />
        </a>
      </div>
    );
  }
  public toggleShowTopMenu() {
    this.menuExpand = !this.menuExpand;
  }
  public getChannelLinks(channel: Channel) {
    const temp: Array<{ source: Channel; target: Channel }> = [];
    const relatedChannelNodes: string[] = [];
    const relatedLinks: string[] = [];
    this.curData.links.forEach((link) => {
      if (link.channel_link) {
        link.channel_link.forEach((cLink) => {
          temp.push(cLink);
        });
      }
    });
    temp.forEach((item) => {
      if (_.isEqual(channel, item.source)) {
        relatedChannelNodes.push(`${item.target.channel}-${item.target.appkey}`);
        relatedLinks.push(`${channel.channel}-${channel.appkey}~${item.target.channel}-${item.target.appkey}`);
      } else if (_.isEqual(channel, item.target)) {
        relatedChannelNodes.push(`${item.source.channel}-${item.source.appkey}`);
        relatedLinks.push(`${channel.channel}-${channel.appkey}~${item.source.channel}-${item.source.appkey}`);
      }
    });
    return { relatedChannelNodes, relatedLinks };
  }
  public editModeOn() {
    this.$Message.info('编辑模式开启');
    this.editMode = true;
  }
  public threeReady() {
    this.resourceLoading = false;
  }

  public render() {
    return (
      <div
        id='3d-topu-container'
        class={style.topuContainer}
        style={this.editMode ? 'border:2px dashed red' : ''}
        ref='threeBody'
      >
        {this.resourceLoading && <Spin fix large />}
        {this.renderButtons()}

        <div class={style.dropdown}>
          <div class={style['dropdown-content']} id='myDropdown'></div>
        </div>

        <detail-drawer
          value={this.showDrawer}
          drawerMode={this.drawerMode}
          instance={this.nowInstance}
          nowObj={this.nowObj}
          on-close={() => (this.showDrawer = false)}
          nodes={this.curData.nodes}
          detailFields={this.detailFields}
        />
      </div>
    );
  }
}
