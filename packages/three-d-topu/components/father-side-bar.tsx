/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-21 10:12:25
 * @LastEditTime: 2021-04-13 16:12:19
 */
import { Button, Divider, Form, FormItem, Icon, Input, Spin, Tree } from '@idg/iview';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import style from '../styles/tree.module.less';
import * as core from '../static/js/core';
import { InstanceLink, InstanceNode, NodeTree } from '../interfaces';
import { FatherConfig, FatherData } from '../interfaces/father';
import * as data from '../static/js/data';
interface FormData {
  name: string;
  appkey: string;
  channel: string;
}
@Component({ depends: ['component.PopModal', 'component.FatherPanel'] })
export default class FatherSideBar extends Vue {
  // tslint:disable: no-any
  @Prop() public readonly config: FatherConfig;
  @Prop() public readonly viewMode: string;
  @Prop() public readonly topuMode: number;
  @Prop() public readonly initData: FatherData[];
  @Prop({ default: true }) public readonly showBackIcon: boolean;
  @Prop({ default: 'Title' }) public readonly title: string;
  @Prop({ default: true }) public readonly show: boolean;
  @Prop({ default: 225 }) public readonly width: number;
  @Prop({ default: '' }) public readonly activeTab: string;
  // tslint:disable-next-line: no-empty
  @Prop({ default: () => {} }) public readonly treeData: any;
  public formData: FormData;
  public showFilterPop: boolean = false;
  public nameIpt: string = '';
  public isLoading: boolean = false;
  public picTreeNodes: InstanceNode[];
  public expandId: string = '';
  public curExpandData: any;
  public curDataTree: NodeTree;
  private count: number = 0;
  public data() {
    return {
      formData: {
        name: '',
        appkey: '',
        channel: '',
      },
      picTreeNodes: [],
      curExpandData: {},
      curDataTree: {},
    };
  }
  public get searchIpt() {
    return this.$store.state.searchIpt;
  }
  @Watch('topuMode')
  public watchTopuMode() {
    if (this.viewMode === 'tree') {
      this.$emit('treeTopuModeChange', JSON.parse(JSON.stringify(this.treeData)));
    }
  }
  @Watch('viewMode')
  public watchViewMode() {
    this.tabExpand(this.activeTab);
    this.clearExpandStatus(this.treeData);
  }
  @Watch('searchIpt')
  public watchSearchIpt(val: string) {
    if (this.topuMode === 3) {
      if (this.viewMode === 'pics') {
        this.picTreeNodes.forEach((node) => {
          if (node.name === val) {
            this.$set(node, 'selected', true);
            core.posObj(this.picTreeNodes, node);
          } else if (val === '') {
            this.clearSearch(node);
          }
        });
      } else {
        this.iterTreeName(this.treeData, val);
      }
    }
  }
  @Watch('activeTab', { immediate: true })
  public watchActiveTab() {
    this.expandId = this.activeTab;
    this.tabExpand(this.activeTab);
  }

  public clearExpandStatus(tree: NodeTree) {
    if (tree.id === this.treeData.id) {
      tree.expand = true;
    } else {
      tree.expand = false;
    }
    tree.checked = true;
    if (tree.children.length > 0) {
      tree.children.forEach((child) => {
        this.clearExpandStatus(child);
      });
    }
  }
  public iterTreeName(tree: NodeTree, val: string) {
    if (tree.name === val) {
      this.$set(tree, 'selected', true);
      core.highLightNode(tree.id);
      return;
    }
    if (val === '') {
      this.clearSearch(tree);
    }
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child) => {
        this.iterTreeName(child, val);
      });
    }
  }

  public clearSearch(node: NodeTree | InstanceNode) {
    this.$set(node, 'selected', false);
    core.removeHightNodes();
  }
  public findLinkNodes(node: InstanceNode) {
    const arr: string[] = [];
    const res: InstanceNode[] = [];
    this.curExpandData.links.forEach((link: { target: string; source: string }) => {
      if (link.target === node.id) {
        arr.push(link.source);
      } else if (link.source === node.id) {
        arr.push(link.target);
      }
    });
    arr.forEach((id) => {
      const index = this.curExpandData.nodes.findIndex((item: { id: string }) => {
        return item.id === id;
      });
      if (index !== -1) {
        res.push(this.curExpandData.nodes[index]);
      }
    });
    return res;
  }
  public handleSearch() {
    this.$emit('search', this.nameIpt);
  }

  public iterTree(tree: NodeTree) {
    tree.title = tree.name;
    tree.originId = tree.id;
    if (tree.children.length) {
      tree.children.forEach((child) => {
        this.iterTree(child);
      });
    }
  }
  public toggleExpand(tree: NodeTree, type: boolean, root: boolean) {
    if (this.viewMode === 'tree') {
      this.$set(tree, 'expand', type);
      if (root) {
        tree.expand = true;
      }
      if (tree.children && tree.children.length > 0) {
        tree.children.forEach((child) => {
          this.toggleExpand(child, type, false);
        });
      }
    } else {
      return;
    }
  }
  public renderFilterForm() {
    return (
      <Form label-width={80} v-model={this.formData} ref='form'>
        <FormItem label='实例名称: ' prop='name'>
          <Input size='small' v-model={this.formData.name} placeholder='请输入实例名称' />
        </FormItem>
        <FormItem label='AppId: ' prop='appId'>
          <Input size='small' v-model={this.formData.appkey} placeholder='请输入AppId' />
        </FormItem>
        <FormItem label='Version: ' prop='version'>
          <Input size='small' v-model={this.formData.channel} placeholder='请输入Version' />
        </FormItem>
        <FormItem label=' '>
          <Button type='primary' size='small' class='mr-2'>
            确 认
          </Button>
          <Button
            size='small'
            on-click={() => {
              (this.$refs.form as Form).resetFields();
            }}
          >
            重 置
          </Button>
        </FormItem>
      </Form>
    );
  }
  public handleTreeClick(e: MouseEvent, node: InstanceNode) {
    if (e.button === 0) {
      this.$emit('treeItemLtClick', node);
    } else if (e.button === 2) {
      this.$emit('treeItemRtClick', node);
    }
  }
  public renderTree() {
    return (
      <Tree
        data={[this.treeData]}
        show-checkbox
        class={style.tree}
        on-on-check-change={(arr: NodeTree[], item: NodeTree) => {
          if (this.topuMode === 2) {
            // TODO
            this.$store.commit('change', { item, arr });
          } else {
            core.toggleShowNodes(arr, item);
          }
        }}
        on-on-select-change={(arr: InstanceNode[], item: InstanceNode) => {
          if (this.topuMode === 3) {
            core.posObj(arr, item);
          }
          this.$emit('treeNodeClick', item);
        }}
        on-on-toggle-expand={(tree: NodeTree) => {
          if (this.topuMode === 3) {
            core.toggleShowChildIns(JSON.parse(JSON.stringify(tree)));
            core.refreshAllLinks();
          } else {
            this.$emit('2dTreeExpand', this.treeData);
          }
        }}
      ></Tree>
    );
  }
  public renderPics(nodes: InstanceNode[]) {
    const picTreeNodes: InstanceNode[] = [];
    JSON.parse(JSON.stringify(nodes)).forEach((node: InstanceNode) => {
      picTreeNodes.push(node);
    });
    picTreeNodes.forEach((node) => {
      this.$set(node, 'children', []);
      this.$set(node, 'title', node.name);
      this.$set(node, 'checked', true);
    });
    return (
      <Tree
        data={picTreeNodes}
        show-checkbox
        class={style.tree}
        on-on-check-change={({}, item: NodeTree) => {
          if (this.topuMode === 3 && this.viewMode === 'pics') {
            core.toggleShowNodesPic(item);
          }
        }}
        on-on-select-change={(arr: InstanceNode[], item: InstanceNode) => {
          if (this.topuMode === 3) {
            core.posObj(arr, item);
          }
          this.$emit('treeNodeClick', item);
        }}
      />
    );
  }

  public genTreeModeData(tree: NodeTree, nodes: InstanceNode[], links: InstanceLink[]) {
    this.count++;
    const nodeObj = {
      name: tree.name,
      id: tree.id,
      depth: tree.depth,
      info: (tree as any).info,
    };
    const index = nodes.findIndex((node) => {
      return tree.id === node.id;
    });
    if (index !== -1) {
      tree.id = tree.id + `(${this.count})`;
      nodeObj.id = tree.id;
    }
    nodes.push(nodeObj);
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child) => {
        this.genTreeModeData(child, nodes, links);
      });
    }
  }
  public genTreeLinks(tree: NodeTree, links: InstanceLink[]) {
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child) => {
        const obj = {
          source: tree.id,
          target: child.id,
          id: `${tree.id}-${child.id}`,
        };
        links.push(obj);
        this.genTreeLinks(child, links);
      });
    }
  }

  public tabExpand(id?: string, force?: boolean) {
    const curTree = {} as NodeTree;
    if (id && this.initData && this.initData.length) {
      const index = this.initData.findIndex((item) => {
        return item.id === id;
      });
      if (index !== -1) {
        const tmp = this.initData[index];
        let curNodes = this.viewMode === 'tree' ? tmp.cNodes : tmp.nodes;
        let curLinks = this.viewMode === 'tree' ? tmp.cLinks : tmp.links;
        data.initLayOut(curNodes, curLinks, curNodes[0].id, curTree); // 图视图座标以及 NodeTree生成
        this.iterTree(curTree as NodeTree);
        // this.setColor(curNodes);
        if (this.viewMode === 'tree') {
          curNodes = [];
          curLinks = [];
          this.genTreeModeData(curTree, curNodes, curLinks);
          this.genTreeLinks(curTree, curLinks);
          data.initTreeLayout(curNodes, curTree);
        }
        this.curExpandData = {
          nodes: curNodes,
          links: curLinks,
          tree: curTree,
        };
      }
    } else {
      this.curExpandData = {
        nodes: [],
        links: [],
        tree: {},
      };
    }
    this.$emit('tabExpand', id, this.curExpandData, force);
  }

  public renderDefault() {
    return (
      <div class='w-full h-full'>
        <div class='px-2 mb-2'>
          <div class='flex justify-between'>
            <div class='font-bold my-2 flex items-center' style='color:white'>
              <Icon
                type='md-arrow-back'
                class='cursor-pointer'
                on-click={() => this.$emit('back')}
                v-show={this.showBackIcon}
              />
              <Divider type='vertical' v-show={this.showBackIcon} />
              {this.title}
            </div>
          </div>
          <div class='flex items-center'>
            <Input
              v-model={this.nameIpt}
              placeholder='请输入名称'
              prefix='ios-search'
              size='small'
              class='mr-4'
              on-on-enter={this.handleSearch}
            ></Input>
            <pop-modal offset={[230, -24]} styles='background:rgb(30, 32, 45);color:white' title='筛选条件'>
              <img
                src={require('../static/img/icon/filter.svg')}
                on-click={() => {
                  this.showFilterPop = true;
                }}
                class='cursor-pointer'
              />
              <div slot='body' class={style.darkForm}>
                {this.renderFilterForm()}
              </div>
            </pop-modal>
          </div>
        </div>
        <div style={`height:calc(100% - 61px);overflow-y:auto`}>
          {this.initData &&
            this.initData.length > 0 &&
            this.initData.map((item) => {
              return (
                <father-panel
                  on-viewChange={(name: string) => {
                    this.$emit('toggleViewMode', name);
                    this.isLoading = true;
                    setTimeout(() => {
                      this.isLoading = false;
                    }, 500);
                  }}
                  viewMode={this.viewMode}
                  on-toggleExpand={(type: boolean) => {
                    this.toggleExpand(this.treeData, type, true);
                    if (this.topuMode === 3 && this.viewMode === 'tree') {
                      const tmp = JSON.parse(JSON.stringify(this.treeData));
                      core.toggleShowChildIns(tmp);
                      core.refreshAllLinks();
                    }
                  }}
                  subName={item.name}
                  width={this.width}
                  isExpand={item.id === this.expandId ? true : false}
                  on-expand={(val: string) => {
                    this.tabExpand(val, true);
                  }}
                  id={item.id}
                >
                  {this.isLoading ? (
                    <Spin>
                      <Icon type='ios-loading' size={18} class={style['demo-spin-icon-load']}></Icon>
                      <div>Loading</div>
                    </Spin>
                  ) : this.viewMode === 'tree' ? (
                    <div class='p-4 overflow-x-auto'>{this.renderTree()}</div>
                  ) : (
                    <div class='p-4 overflow-x-auto'>{this.renderPics(item.nodes)}</div>
                  )}
                </father-panel>
              );
            })}
        </div>
      </div>
    );
  }
  public render() {
    return (
      <div style={`position:relative;height:100%;color:whitesmoke`} ref='container'>
        <div style={`background:#1e202d;width:${this.width}px`} class='h-full mx-1' v-show={this.show}>
          <div class='h-full'>{this.$slots.default || this.renderDefault()}</div>
        </div>
        <div class={style.collapsesIcon} on-click={() => this.$emit('expand', false)} v-show={this.show}>
          <Icon type='ios-arrow-back' />
        </div>
        <div class={style.collapsesIconClosed} on-click={() => this.$emit('expand', true)} v-show={!this.show}>
          <Icon type='ios-arrow-forward' />
        </div>
      </div>
    );
  }
}
