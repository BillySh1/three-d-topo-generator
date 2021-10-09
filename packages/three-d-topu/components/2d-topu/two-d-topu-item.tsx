/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2020-09-08 17:39:10
 * @LastEditTime: 2021-04-14 14:17:30
 */
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Tooltip } from '@idg/iview';
import { InstanceNode } from '../../interfaces';
import { MyVueConstructor } from '@idg/idg';

const BORDERSTYLE = 'black 1px solid';
@Component
export default class TwoDTopuItem extends Vue {
  @Prop() public readonly nodeData: InstanceNode;
  @Prop() public readonly isRoot: boolean;
  @Prop() public readonly type: number;
  @Prop() public readonly isOnly: boolean;
  @Prop() public readonly hoverFields: string[];

  public render() {
    const Comp = this.getComponent('cac9ffb424e44a0f924a2536f304cc93.three-d-topu.TwoDTopuItem') as MyVueConstructor;
    return (
      <div>
        <div
          class='flex'
          style={{
            display: this.isRoot ? 'none' : '',
            height: '30px',
          }}
        >
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
              style={`border: black solid 1px;background-color:${this.nodeData.highLight ? 'yellow' : ''}`}
              class='rounded p-2 cursor-pointer hover:bg-gray-5'
            >
              {this.nodeData.name}
            </div>
            <div slot='content'>
              {this.hoverFields &&
                this.hoverFields.length > 0 &&
                this.hoverFields.map((item) => {
                  if (this.nodeData && this.nodeData.info) {
                    return <div>{`${item}: ${this.nodeData.info[item]}`}</div>;
                  } else {
                    return <div>缺少info字段</div>;
                  }
                })}
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
              <Comp
                nodeData={this.nodeData.children[0]}
                isOnly={true}
                on={{
                  nodeClick: (data: InstanceNode) => {
                    this.$emit('nodeClick', data);
                  },
                }}
                hoverFields={this.hoverFields}
              ></Comp>
            ) : (
              this.nodeData.children &&
              this.nodeData.children.map((item, index) => {
                if (index === 0) {
                  return (
                    <Comp
                      nodeData={item}
                      type={1}
                      on={{
                        nodeClick: (data: InstanceNode) => {
                          this.$emit('nodeClick', data);
                        },
                      }}
                      hoverFields={this.hoverFields}
                    ></Comp>
                  );
                } else if (index === (this.nodeData.children as InstanceNode[]).length - 1) {
                  return (
                    <Comp
                      nodeData={item}
                      type={3}
                      on={{
                        nodeClick: (data: InstanceNode) => {
                          this.$emit('nodeClick', data);
                        },
                      }}
                      hoverFields={this.hoverFields}
                    ></Comp>
                  );
                } else {
                  return (
                    <Comp
                      nodeData={item}
                      on={{
                        nodeClick: (data: InstanceNode) => {
                          this.$emit('nodeClick', data);
                        },
                      }}
                      hoverFields={this.hoverFields}
                    ></Comp>
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
