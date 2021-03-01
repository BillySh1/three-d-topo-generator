/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2020-09-08 17:39:10
 * @LastEditTime: 2021-02-25 02:32:54
 */
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Tooltip } from '@idg/iview';
import { InstanceNode } from '../../interfaces';
const BORDERSTYLE = '#3a3d51 2px solid';
@Component
export default class TwoDTopuItem extends Vue {
  @Prop() public readonly nodeData: InstanceNode;
  @Prop() public readonly isRoot: boolean;
  @Prop() public readonly type: number;
  @Prop() public readonly isOnly: boolean;

  public overflowText(str: string) {
    if (str.replace(/[\u0391-\uFFE5]/g, 'xx').length > 10) {
      return str.substring(0, 8) + '...';
    } else {
      return str;
    }
  }
  public render() {
    return (
      <div>
        {/*节点头上的两个div 如果是根节点，隐藏本div*/}
        <div
          class='flex'
          style={{
            display: this.isRoot ? 'none' : '',
            height: '30px',
          }}
        >
          {/*如果是最左边的节点，左上div无上边框，右边同理， 如果是唯一子节点，左上右上div都没有上边框*/}
          <div
            class='h-full flex-1'
            style={{
              borderRight: BORDERSTYLE,
              borderTop: this.type === 1 || this.isOnly ? 'none' : BORDERSTYLE,
            }}
          ></div>
          <div
            class='h-full flex-1'
            style={{
              borderLeft: BORDERSTYLE,
              borderTop: this.type === 3 || this.isOnly ? 'none' : BORDERSTYLE,
            }}
          ></div>
        </div>
        {/* 结点div容器 */}
        <div class='flex px-2'>
          <Tooltip style='margin:auto' max-width='360' transfer>
            <div
              on={{
                click: () => {
                  this.$emit('nodeClick', this.nodeData);
                },
              }}
              class='rounded p-2 cursor-pointer'
              style='border: white solid 1px'
            >
              {this.nodeData.name}
            </div>
            <div slot='content'>
              Appkey: {this.nodeData.id.split('_')[0]} <br />
              Channel: {this.nodeData.id.split('_')[1]}
            </div>
          </Tooltip>
        </div>
        {/* 若有子结点，则两个底部div具有左右边框（重合）*/}
        <div
          style={{
            display: this.nodeData.children && this.nodeData.children.length !== 0 ? '' : 'none',
          }}
        >
          {/* 提供竖线的两个div */}
          <div class='flex' style='height:30px'>
            <div
              class='h-full flex-1'
              style={{
                borderRight: BORDERSTYLE,
              }}
            ></div>
            <div
              class='h-full flex-1'
              style={{
                borderLeft: BORDERSTYLE,
              }}
            ></div>
          </div>
          <div class='flex justify-center'>
            {/*唯一子节点（非根节点）*/}
            {this.nodeData.children && this.nodeData.children.length === 1 ? (
              <two-d-topu-item
                nodeData={this.nodeData.children[0]}
                isOnly={true}
                on={{
                  nodeClick: (data: InstanceNode) => {
                    this.$emit('nodeClick', data);
                  },
                }}
              ></two-d-topu-item>
            ) : (
              this.nodeData.children &&
              this.nodeData.children.map((item, index) => {
                if (index === 0) {
                  return (
                    <two-d-topu-item
                      nodeData={item}
                      type={1}
                      on={{
                        nodeClick: (data: InstanceNode) => {
                          this.$emit('nodeClick', data);
                        },
                      }}
                    ></two-d-topu-item>
                  );
                } else if (index === (this.nodeData.children as InstanceNode[]).length - 1) {
                  return (
                    <two-d-topu-item
                      nodeData={item}
                      type={3}
                      on={{
                        nodeClick: (data: InstanceNode) => {
                          this.$emit('nodeClick', data);
                        },
                      }}
                    ></two-d-topu-item>
                  );
                } else {
                  return (
                    <two-d-topu-item
                      nodeData={item}
                      on={{
                        nodeClick: (data: InstanceNode) => {
                          this.$emit('nodeClick', data);
                        },
                      }}
                    ></two-d-topu-item>
                  );
                }
              })
            )}
          </div>
        </div>
      </div>
    );
  }
}
