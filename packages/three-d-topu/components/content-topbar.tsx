/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-09 11:12:33
 * @LastEditTime: 2021-10-09 16:48:12
 */
import { Radio, RadioGroup, Tooltip } from '@idg/iview';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import style from '../styles/three-d-topu.module.less';
// import TopuBody from './topu-body-pics';
interface Icons {
  key: string;
  src: string;
  text: string;
}
@Component
export default class ContentTopbar extends Vue {
  @Prop() public readonly mode: number;
  public icons: Icons[];
  public topuMode: number;
  public data() {
    return {
      icons: [
        { key: 'submit', src: require('../static/img/icon/Group 30.svg'), text: '提交' },
        { key: 'cancel', src: require('../static/img/icon/Cancel.svg'), text: '取消' },
      ],
      topuMode: '',
    };
  }
  @Watch('mode', { immediate: true })
  public watchMode(val: number) {
    this.topuMode = val;
  }
  @Watch('topuMode')
  public watchModeChange(val: number) {
    this.$emit('modeChange', val);
  }
  public handleOperateClick(key: string) {
    if (key === 'cancel') {
      // (this.$refs.topuBody as TopuBody).editMode = false;
      this.$Message.info('取消');
    } else if (key === 'submit') {
      // this.$emit('submitIconClick');
      this.$Message.success('提交');
    }
  }
  public render() {
    return (
      <div class={style.contentHeader}>
        {this.icons.map((item) => {
          return (
            <div style='padding:6px 12px 7px' class='cursor-pointer' on-click={() => this.handleOperateClick(item.key)}>
              <Tooltip content={item.text}>
                <img key={item.key} src={item.src} />
              </Tooltip>
            </div>
          );
        })}
        <RadioGroup v-model={this.topuMode} type='button' size='small' style={`margin-left:calc(50% - 90px)`}>
          <Radio label={2}>二维拓扑</Radio>
          <Radio label={3}>三维拓扑</Radio>
        </RadioGroup>
      </div>
    );
  }
}
