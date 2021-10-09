/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-09 11:20:36
 * @LastEditTime: 2021-04-15 13:32:00
 */
import { InstanceLink, InstanceNode, NodeTree } from '../../interfaces';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Spin } from '@idg/iview';
import Style from '../../styles/two-d-graph.module.less';
interface TopoData {
  nodes: InstanceNode[];
  links: InstanceLink[];
}
@Component({ depends: ['component.TwoDGraph', 'component.TwoDTree'] })
export default class TwoDTopu extends Vue {
  @Prop() public readonly topoData: TopoData;
  @Prop() public readonly viewMode: string;
  @Prop() public readonly tree: NodeTree;
  @Prop() public readonly twoDTreeHoverFields: string[];
  @Prop() public readonly twoDPicsHoverFields: string[];
  public treeData: NodeTree;
  public refresh: boolean = true;
  public data() {
    return {
      treeData: {},
    };
  }
  @Watch('topoData', { immediate: false })
  public watchTopoData(val: TopoData) {
    if (val.nodes.length && val.links.length) {
      this.refresh = false;
      this.$nextTick(() => {
        this.refresh = true;
      });
    }
  }
  @Watch('tree', { immediate: true, deep: true })
  public watchTree() {
    this.treeData = JSON.parse(JSON.stringify(this.tree));
    this.formatTreeVisibility(this.treeData);

    this.refresh = false;
    this.$nextTick(() => {
      this.refresh = true;
    });
  }
  public formatTreeVisibility(tree: NodeTree) {
    if (!tree.expand) {
      tree.children = [];
    }
    if (tree.children.length > 0) {
      tree.children.forEach((child) => {
        this.formatTreeVisibility(child);
      });
    }
  }
  public render() {
    return (
      <div class={Style.twoDContainer}>
        {this.viewMode === 'tree' && this.refresh ? (
          <two-d-tree treeData={this.treeData} twoDTreeHoverFields={this.twoDTreeHoverFields} />
        ) : this.viewMode === 'pics' && this.refresh ? (
          <two-d-graph
            hoverFields={this.twoDPicsHoverFields}
            picData={{ nodes: this.topoData.nodes, edges: this.topoData.links }}
          />
        ) : (
          <div class='w-full h-full relative'>
            <Spin large fix />
          </div>
        )}
      </div>
    );
  }
}
