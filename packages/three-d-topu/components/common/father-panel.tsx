/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-28 10:38:47
 * @LastEditTime: 2021-02-23 10:39:15
 */
import { Divider, Dropdown, DropdownItem, DropdownMenu, Icon } from '@idg/iview';
import { Vue, Component, Prop } from 'vue-property-decorator';
import style from '../../styles/node-panel.module.less';
@Component
export default class FatherPanel extends Vue {
  @Prop({ default: 'tree' }) public readonly viewMode: string;
  public allExpand: boolean = false;
  public isExpand: boolean = true;
  public isLoading: boolean = false;
  public handleDropClick(name: string) {
    switch (name) {
      case 'tree':
        this.$emit('viewChange', 'tree');
        break;
      case 'pics':
        this.$emit('viewChange', 'pics');
        break;
      case 'allExpand':
        this.allExpand = true;
        this.$emit('toggleExpand', true);
        break;
      case 'allClose':
        this.allExpand = false;
        this.$emit('toggleExpand', false);
    }
  }
  public render() {
    return (
      <div style='color:white;user-select:none'>
        <div class={style.fatherPanel} on-click={() => (this.isExpand = !this.isExpand)}>
          <div>
            <Icon type='ios-arrow-forward' v-show={!this.isExpand} />
            <Icon type='ios-arrow-down' v-show={this.isExpand} />
            <span class='ml-2'>解决方案</span>
          </div>
          <Icon type='md-add' />
        </div>
        <div v-show={this.isExpand}>
          <div style='padding-left:210px;margin-bottom:-28px;padding-top:8px'>
            <Dropdown transfer on-on-click={(name: string) => this.handleDropClick(name)}>
              <img src={require('../../static/img/icon/operation.svg')} class='cursor-pointer' />
              <DropdownMenu slot='list' style='background:#3a3d51'>
                <DropdownItem class='flex items-center' style='color:#C3C6C9' name='tree'>
                  <div>
                    <img src={require('../../static/img/list.svg')} class='mr-1' />
                    树视图
                  </div>
                  <Icon type='md-checkmark' size='16' class='ml-2' v-show={this.viewMode === 'tree'} />
                </DropdownItem>
                <DropdownItem class='flex items-center' style='color:#C3C6C9' name='pics'>
                  <img src={require('../../static/img/org-apps.svg')} class='mr-1' />
                  图视图
                  <Icon type='md-checkmark' size='16' class='ml-2' v-show={this.viewMode === 'pics'} />
                </DropdownItem>
                <Divider style='background:#2c2e3d; margin:4px 0px' />
                <DropdownItem class='flex items-center' style='color:#C3C6C9' name='allExpand'>
                  <img src={require('../../static/img/icon/allExpand.svg')} class='mr-1' />
                  全部展开
                </DropdownItem>
                <DropdownItem class='flex items-center' style='color:#C3C6C9' name='allClose'>
                  <img src={require('../../static/img/icon/allClose.svg')} class='mr-1' />
                  全部收起
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          {this.$slots.default}
        </div>
      </div>
    );
  }
}
