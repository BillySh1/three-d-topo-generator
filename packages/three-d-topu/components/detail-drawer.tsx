/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-03-04 19:43:38
 * @LastEditTime: 2021-03-30 10:21:11
 */
import { Log } from '@idg/idg';
import { Button, ColorPicker, Divider, Drawer, Form, FormItem, Input } from '@idg/iview';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { InstanceNode } from '../interfaces';
import * as core from '../static/js/core';
import style from '../styles/topu-body.module.less';
interface FormData {
  name: string;
  appkey: string;
  channel: string;
  version: string;
  appId: string;
  organization: string;
}
@Component
export default class DetailDrawer extends Vue {
  @Prop() public readonly value: boolean;
  @Prop() public readonly drawerMode: string;
  @Prop() public readonly instance: InstanceNode;
  // tslint:disable-next-line: no-any
  @Prop() public readonly nowObj: any;
  @Prop() public readonly nodes: InstanceNode[];
  @Prop({ default: () => [] }) public readonly detailFields: string[];
  public showDrawer: boolean = false;
  public styles = { color: 'rgb(30, 32, 45)' };
  public nodeColor: string = '';
  public name: string = '暂无数据';
  public formData: FormData;
  public data() {
    return {
      formData: {
        name: '',
        appkey: '',
        channel: '',
        version: '',
        appId: '',
        organization: '',
      },
    };
  }
  @Watch('value')
  public watchValue(val: boolean) {
    if (val) {
      this.showDrawer = val;
      if (this.drawerMode === 'color') {
        Log.debug('nowObj', this.nowObj, 'color', this.nowObj.material.color);
        this.nodeColor = this.nowObj.material.color.getHexString();
        this.name = this.nowObj.subName || '未知';
      }
    }
  }
  @Watch('showDrawer')
  public watchShowDrawer(val: boolean) {
    if (!val) {
      this.$emit('close');
    }
  }
  public changeColor(v: string) {
    this.nowObj.material.color.set(v);
  }
  public renderData() {
    Log.debug('detail instance', this.instance);
    if (this.instance && this.instance.info) {
      return this.detailFields.map((key) => {
        return (
          <div class='mb-6' style='font-size:initial'>{`${key} : ${
            (this.instance as { info: { [index: string]: string } }).info[key]
          }`}</div>
        );
      });
    } else {
      return <div>缺少info字段</div>;
    }
  }
  public search() {
    const temp: string[] = [];
    this.nodes.forEach((node) => {
      if (this.formData.name === node.name) {
        temp.push(node.id);
      }
    });
    if (temp.length === 0) {
      this.$Message.error(`未找到名字为"${this.formData.name}"的实例节点`);
    } else {
      temp.forEach((id) => {
        core.highLightNode(id);
      });
      this.showDrawer = false;
      temp.length = 0;
    }
  }
  public resetSearchForm() {
    (this.$refs.form as Form).resetFields();
  }
  public renderForm() {
    return (
      <Form label-width={80} v-model={this.formData} ref='form' class={style.darkForm}>
        <FormItem label='实例名称：' prop='name' style='color: white'>
          <Input v-model={this.formData.name} placeholder='请输入名称' />
        </FormItem>
        <FormItem label='所属机构：' prop='organization'>
          <Input v-model={this.formData.organization} placeholder='请输入机构名称' />
        </FormItem>
        <FormItem label='APPID：' prop='appId'>
          <Input v-model={this.formData.appId} placeholder='请输入appid' />
        </FormItem>
        <FormItem label='Appkey：' prop='appkey'>
          <Input v-model={this.formData.appkey} placeholder='请输入appkey' />
        </FormItem>
        <FormItem label='Channel：' prop='channel'>
          <Input v-model={this.formData.channel} placeholder='请输入channel' />
        </FormItem>
        <FormItem label='Version：' prop='version'>
          <Input v-model={this.formData.version} placeholder='请输入version' />
        </FormItem>
        <FormItem label=' '>
          <Button type='primary' class='mr-2' on-click={this.search}>
            查 询
          </Button>
          <Button on-click={this.resetSearchForm}>重 置</Button>
        </FormItem>
      </Form>
    );
  }
  public render() {
    return (
      <Drawer
        v-model={this.showDrawer}
        inner={true}
        transfer={false}
        width={40}
        styles={{ background: 'rgb(30, 32, 45)' }}
      >
        {this.drawerMode === 'data' ? (
          <div style='color:white'>
            <h2 style='color:white'>详情信息</h2>
            <Divider class='my-4 opacity-50' />
            {this.renderData()}
          </div>
        ) : this.drawerMode === 'color' ? (
          <div>
            <h3 style='color:whitesmoke'>设置节点颜色</h3>
            <Divider class='my-4' />
            <div class='flex items-center'>
              <h3 style='color: whitesmoke'>{this.name}:</h3>
              <ColorPicker v-model={this.nodeColor} transfer on-on-change={this.changeColor} recommend class='ml-4' />
            </div>
          </div>
        ) : (
          <div class='mt-8'>{this.renderForm()}</div>
        )}
      </Drawer>
    );
  }
}
