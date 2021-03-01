/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-01-18 17:51:26
 * @LastEditTime: 2021-02-22 14:02:08
 */
import { Package } from '@idg/idg';
import components from './components';
import apis from './apis';
import locales from './locales';
import controllers from './controllers';
import pages from './pages';
import store from './store';
import { routes } from './router';

const pkg: Package = {
  name: 'three-d-topu',
  components,
  locales,
  routes,
  apis,
  pages,
  controllers,
  store,
};

export default pkg;
