<!--
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-19 11:51:50
 * @LastEditTime: 2021-03-01 14:05:22
-->
<template>
  <Drawer v-model="showDrawer" :inner="true" :transfer="false" :width="40" :styles="styles">
    <div v-if="drawerMode === 'data'">
      <h3 style="color: white">通道信息</h3>
      <div style="color: white">
        {{ this.instance ? this.instance : '暂无数据' }}
      </div>
    </div>

    <div v-else-if="drawerMode === 'color'">
      <h3 style="color: whitesmoke">设置节点颜色</h3>
      <Divider class="my-4" />
      <div class="flex items-center">
        <h3 style="color: whitesmoke">{{ name }}:</h3>
        <ColorPicker v-model="nodeColor" transfer @on-change="changeColor" recommend class="ml-4" />
      </div>
    </div>

    <div v-else class="mt-8">
      <Form :label-width="80" v-model="formData" ref="form" class="form">
        <FormItem label="实例名称：" prop="name" style="color: white">
          <Input v-model="formData.name" placeholder="请输入名称" />
        </FormItem>
        <FormItem label="所属机构：" prop="organization">
          <Input v-model="formData.organization" placeholder="请输入机构名称" />
        </FormItem>
        <FormItem label="APPID：" prop="appkId">
          <Input v-model="formData.appkId" placeholder="请输入appid" />
        </FormItem>
        <FormItem label="Appkey：" prop="appkey">
          <Input v-model="formData.appkey" placeholder="请输入appkey" />
        </FormItem>
        <FormItem label="Channel：" prop="channel">
          <Input v-model="formData.channel" placeholder="请输入channel" />
        </FormItem>
        <FormItem label="Version：" prop="version">
          <Input v-model="formData.version" placeholder="请输入version" />
        </FormItem>
        <FormItem label=" ">
          <Button type="primary" class="mr-2" @click="search">查 询</Button>
          <Button @click="resetSearchForm">重 置</Button>
        </FormItem>
      </Form>
    </div>
  </Drawer>
</template>

<style lang='less'>
.form {
  .ivu-form-item label {
    color: whitesmoke;
  }
}
</style>

<script>
import { Log } from '@idg/idg';
import * as data from '../static/js/data';
import * as core from '../static/js/core';
export default {
  props: {
    value: Boolean,
    drawerMode: String,
    instance: [String, Object],
    nowObj: Object,
  },
  data() {
    return {
      nodeColor: '',
      showDrawer: false,
      name: '暂无数据',
      formData: {
        name: '',
        appkey: '',
        channel: '',
        version: '',
        appId: '',
        organization: '',
      },
      styles: {
        background: 'rgb(30, 32, 45)',
      },
    };
  },
  watch: {
    value(v) {
      if (v) {
        this.showDrawer = true;
        if (this.drawerMode === 'color') {
          Log.debug('nowObj', this.nowObj, 'color', this.nowObj.material.color);
          this.nodeColor = this.nowObj.material.color.getHexString();
          this.name = this.nowObj.subName || '未知';
        }
      }
    },
    showDrawer(v) {
      if (!v) {
        this.$emit('close');
      }
    },
  },

  methods: {
    changeColor(v) {
      this.nowObj.material.color.set(v);
    },
    resetSearchForm() {
      this.$refs.form.resetFields();
    },
    search() {
      const temp = [];
      data.nodes.forEach((node) => {
        if (this.formData.name === node.name || this.formData.name === node.name.split('-')[0].replace('服务', '')) {
          temp.push(node.id);
        }
      });
      if (temp.length === 0) {
        this.$Message.error(`未找到名字为"${this.formData.name}"的实例节点`);
        return;
      } else {
        temp.forEach((id) => {
          core.highLightNode(id);
        });
        this.showDrawer = false;
        temp.length = 0;
      }
    },
  },
};
</script>
