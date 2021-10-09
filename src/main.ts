/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:44:21
 * @LastEditTime: 2021-03-02 10:29:21
 */
import './init';
import { App, Service } from '@idg/idg';
import iview from '@idg/iview';
import Vue from 'vue';
import '@idg/iview/dist/styles/ant.css';
import './init.less';
import packages from '../packages/packages';

// 开发应用打开注释 引入账号服务
// import AccountService from '@idg/account'

const appid = 'cac9ffb424e44a0f924a2536f304cc93';

Vue.use(iview);

class MyApp extends App {
  constructor() {
    const children: Service[] = [
      // 开发应用打开注释 引入账号服务
      // new AccountService({
      //   channelAlias: 'default',
      // }),
    ];
    super({
      appid,
      children,
      packages: [...packages],
    });
  }

  // 开发服务打开注释，设置用户token
  // public getBaseURL() {
  //   if (window.USE_MOCK) {
  //       return '';
  //   } else {
  //       return this.getServerHost();
  //   }
  // }

  // 开发应用打开注释，设置用户token
  // public getProxyURL() {
  //   return this.getServerHost() + 'main.php/json/proxy/call?url='
  // }
}

const app = new MyApp();
app.startup();
window.IDG_APP = app;
// 开发服务打开注释，设置用户token
// app.auth.setToken('sdfsdfsdf')
