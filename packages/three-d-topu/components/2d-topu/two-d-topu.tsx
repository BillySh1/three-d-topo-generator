/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-09 11:20:36
 * @LastEditTime: 2021-02-25 01:52:05
 */
import { InstanceLink, InstanceNode } from '../../interfaces';
import { Vue, Component, Prop } from 'vue-property-decorator';
import InstanceTree from '../father-side-bar';
@Component({ depends: ['component.TwoDGraph', 'component.TwoDTree'] })
export default class TwoDTopu extends Vue {
  @Prop() public readonly topoData: { nodes: InstanceNode[]; links: InstanceLink[] };
  @Prop() public readonly viewMode: string;
  @Prop() public readonly tree: InstanceTree;
  public data() {
    return {};
  }
  public render() {
    return (
      <div class='w-full h-full'>
        {this.viewMode === 'tree' ? (
          <two-d-tree treeData={this.tree} />
        ) : this.viewMode === 'pics' ? (
          <two-d-graph picData={{ nodes: this.topoData.nodes, edges: this.topoData.links }} />
        ) : (
          <div class='text-gray-200'>error</div>
        )}
      </div>
    );
  }
}
