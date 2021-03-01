import { Vue, Component, Model, Watch, Emit } from 'vue-property-decorator';
import { Modal } from '@idg/iview';

// 注意事项：继承BaseModal的组件请勿使用与iview/Modal同名的prop
// (to-do: 也可以通过配置带上footer slot)
@Component({
  inheritAttrs: false,
})
export default class BaseModal extends Vue {
  @Model('change', { type: Boolean }) public value: boolean;
  public showModal: boolean = false;
  public renderContent(): JSX.Element | JSX.Element[] {
    return <div>
      <p>通过复写renderContent函数来决定modal的内容，</p>
      <p>renderContent函数的返回是一个VNode或者一个VNode数组</p>
    </div>;
  }
  public render() {
    return <Modal
      v-model={this.showModal}
      props={this.$attrs}
      onon-visible-change={this.handleChange}
      onon-ok={this.onModalOk}>
      {this.renderContent()}
    </Modal>;
  }
  @Watch('value', { immediate: true })
  public handleValueChange(val: boolean) {
    this.showModal = val;
  }
  @Emit('change')
  public handleChange(val: boolean) {
    if (!val) {
      return val;
    }
  }
  @Emit('on-ok')
  public onModalOk() {
    return;
  }
}
