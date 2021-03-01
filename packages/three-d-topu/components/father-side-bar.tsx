/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-21 10:12:25
 * @LastEditTime: 2021-03-01 15:41:14
 */
import { Button, Form, FormItem, Icon, Input, Spin, Tree } from '@idg/iview';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import style from '../styles/tree.module.less';
import * as core from '../static/js/core';
import { InstanceLink, InstanceNode, NodeTree } from '../interfaces';
interface FormData {
  name: string;
  appkey: string;
  channel: string;
}
@Component({ depends: ['component.PopModal', 'component.FatherPanel'] })
export default class InstanceTree extends Vue {
  @Prop() public readonly viewMode: string;
  @Prop() public readonly treeData: NodeTree;
  @Prop() public readonly topuMode: number;
  @Prop({ default: [] }) public readonly nodes: InstanceNode[];
  @Prop({ default: [] }) public readonly links: InstanceLink[];
  public formData: FormData;
  public showFilterPop: boolean = false;
  public nameIpt: string = '';
  public isLoading: boolean = false;
  public picTreeNodes: InstanceNode[];
  public treeModeData: NodeTree;
  public data() {
    return {
      formData: {
        name: '',
        appkey: '',
        channel: '',
      },
      picTreeNodes: [],
      treeModeData: {},
    };
  }
  public get searchIpt() {
    return this.$store.state.searchIpt;
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
        this.iterTreeName(this.treeModeData, val);
      }
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
    if (tree.children.length > 0) {
      tree.children.forEach((child) => {
        this.iterTreeName(child, val);
      });
    }
  }

  // tslint:disable-next-line: no-any
  public clearSearch(node: any) {
    this.$set(node, 'selected', false);
    core.removeHightNodes();
  }
  public mounted() {
    const tempNodes = JSON.parse(JSON.stringify(this.nodes));
    this.treeModeData = JSON.parse(JSON.stringify(this.treeData));
    this.iterTree(this.treeModeData);

    tempNodes.forEach((node: InstanceNode) => {
      this.picTreeNodes.push(node);
    });
    this.picTreeNodes.map((node) => {
      this.$set(node, 'children', []);
      this.$set(node, 'title', node.name);
      this.$set(node, 'checked', true);
    });
  }
  public findLinkNodes(node: InstanceNode) {
    const arr: string[] = [];
    const res: InstanceNode[] = [];
    this.links.forEach((link) => {
      if (link.target === node.id) {
        arr.push(link.source);
      } else if (link.source === node.id) {
        arr.push(link.target);
      }
    });
    arr.forEach((id) => {
      const index = this.nodes.findIndex((item) => {
        return item.id === id;
      });
      if (index !== -1) {
        res.push(this.nodes[index]);
      }
    });
    return res;
  }
  public handleSearch() {
    this.$emit('search', this.nameIpt);
  }

  public iterTree(tree: NodeTree) {
    tree.title = tree.name;
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
        data={[this.treeModeData]}
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
        on-on-toggle-expand={(node: InstanceNode) => {
          if (this.topuMode === 3) {
            core.toggleShowChildIns(node);
          }
        }}
      ></Tree>
    );
  }
  public renderPics() {
    return (
      <Tree
        data={this.picTreeNodes}
        show-checkbox
        class={style.tree}
        on-on-check-change={({}, item: NodeTree) => {
          if (this.topuMode === 3) {
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
  public treeRenderModel({}, obj: { node: { node: InstanceNode } }) {
    const nodeReal = obj.node.node;
    return (
      <div class='inline hover:bg-gray-3 ' on-mousedown={(e: MouseEvent) => this.handleTreeClick(e, obj.node.node)}>
        {nodeReal.name}
      </div>
    );
  }
  public renderDefault() {
    return (
      <div class='w-full h-full'>
        <div class='px-2 mb-2'>
          <div class='flex justify-between'>
            <div class='font-bold mb-2' style='color:white'>
              数据开发
            </div>
          </div>
          <div class='flex items-center'>
            <Input
              v-model={this.nameIpt}
              placeholder='请输入实例名称'
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
            this.toggleExpand(this.treeModeData, type, true);
            // core.toggleExpand(type);
          }}
        >
          {this.isLoading ? (
            <Spin>
              <Icon type='ios-loading' size={18} class={style['demo-spin-icon-load']}></Icon>
              <div>Loading</div>
            </Spin>
          ) : this.viewMode === 'tree' ? (
            <div class='px-1'>{this.renderTree()}</div>
          ) : (
            <div class='px-1'>{this.renderPics()}</div>
          )}
        </father-panel>
      </div>
    );
  }
  public render() {
    return <div class='w-full h-full'>{this.$slots.default || this.renderDefault()}</div>;
  }
}
