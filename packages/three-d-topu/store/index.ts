/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-22 13:58:24
 * @LastEditTime: 2021-02-22 19:13:30
 */
export interface State {
  twoDTree: object;
  searchIpt: string;
}
export default {
  state: {
    twoDTree: {},
    searchIpt: '',
  },
  mutations: {
    change: (state: State, params: object) => {
      state.twoDTree = params;
    },
    search: (state: State, params: string) => {
      state.searchIpt = params;
    },
  },
};
