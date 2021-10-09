/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-03-17 14:25:02
 * @LastEditTime: 2021-03-17 14:45:03
 */
import { Vue, Component } from 'vue-property-decorator';
@Component({ depends: ['component.FatherSideBar'] })
export default class TestPage extends Vue {
  public fatherShow: boolean = true;
  public render() {
    return (
      <div style='width:1000px;height:600px'>
        <father-side-bar show={this.fatherShow} on-expand={(val: boolean) => (this.fatherShow = val)}></father-side-bar>
      </div>
    );
  }
}
