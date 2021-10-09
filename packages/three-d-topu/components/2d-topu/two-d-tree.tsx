/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-18 14:21:03
 * @LastEditTime: 2021-04-13 15:53:52
 */
import { Log } from '@idg/idg';
import { InstanceNode, NodeTree } from '../../interfaces';
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({ depends: ['component.TwoDTopuItem'] })
export default class TwoDGraph extends Vue {
  @Prop() public readonly treeData: NodeTree;
  @Prop({ default: () => [] }) public readonly twoDTreeHoverFields: string[];

  public data() {
    return {};
  }
  public get treeDataReal() {
    return JSON.parse(JSON.stringify(this.treeData));
  }
  public render() {
    return (
      <div class='overflow-x-auto p-12' style='height:calc(100% - 50px)'>
        <div class='flex flex-column h-full' style='width:200px'>
          <two-d-topu-item
            nodeData={this.treeDataReal}
            on={{
              nodeClick: (nodeData: InstanceNode) => {
                Log.debug('nodeClick', nodeData);
              },
            }}
            type={2}
            isOnly
            isRoot
            hoverFields={this.twoDTreeHoverFields}
          />
        </div>
      </div>
    );
  }
}
