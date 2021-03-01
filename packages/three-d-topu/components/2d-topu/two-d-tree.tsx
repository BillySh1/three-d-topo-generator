/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-18 14:21:03
 * @LastEditTime: 2021-02-25 02:37:48
 */
import { Log } from '@idg/idg';
import { InstanceNode } from '../../interfaces';
import { Vue, Component, Prop } from 'vue-property-decorator';
import InstanceTree from '../father-side-bar';
@Component({ depends: ['component.TwoDTopuItem'] })
export default class TwoDGraph extends Vue {
  @Prop() public readonly treeData: InstanceTree;

  public data() {
    return {};
  }
  public get treeDataReal() {
    return this.$store.state.twoDTree || this.treeData;
  }
  public render() {
    return (
      <div class='overflow-x-auto p-12' style='height:calc(100% - 50px)'>
        <div class='flex flex-column h-full' style='width:200px'>
          <two-d-topu-item
            nodeData={this.treeData}
            on={{
              nodeClick: (nodeData: InstanceNode) => {
                Log.debug('nodeClick', nodeData);
              },
            }}
            type={2}
            isOnly
            isRoot
          />
        </div>

        {/* <topu-node topologyNode={this.treeData} /> */}
      </div>
    );
  }
}
