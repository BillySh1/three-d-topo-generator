/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-18 14:21:03
 * @LastEditTime: 2021-04-14 14:16:42
 */
import { InstanceLink, InstanceNode } from '../../interfaces';
import { Vue, Component, Prop } from 'vue-property-decorator';
import style from '../../styles/two-d-graph.module.less';
import { Resource } from '@idg/idg';
import { Spin } from '@idg/iview';
@Component
export default class TwoDGraph extends Vue {
  @Prop() public readonly picData: { nodes: InstanceNode[]; edges: InstanceLink[] };
  @Prop() public readonly hoverFields: string[];
  public resourceLoading: boolean = false;
  public data() {
    return {
      graph: '',
    };
  }
  public renderHoverContent(obj: { info?: { [index: string]: string } }) {
    let str = '';
    this.hoverFields.map((item) => {
      if (obj.info) {
        return (str += `${item}: ${obj.info[item]}<br/>`);
      } else {
        return (str += `${item}: undefined <br/>`);
      }
    });
    return str;
  }
  public mounted() {
    this.genGraph();
  }
  public async genGraph() {
    let G6;
    if (!window.G6) {
      this.resourceLoading = true;
      await Resource.import([{ type: 'script', url: '//pkg.oneitfarm.com/@antv/g6/3.5.12/g6.min.js' }]);
      this.resourceLoading = false;
      G6 = window.G6;
    }
    G6 = window.G6;
    if (!G6) {
      this.$Message.error('资源加载错误');
    }
    const graphData = {
      nodes: JSON.parse(JSON.stringify(this.picData.nodes)),
      edges: JSON.parse(JSON.stringify(this.picData.edges)),
    };

    if (graphData.nodes.length > 0) {
      graphData.nodes.forEach((node: InstanceNode) => {
        this.$set(node, 'label', node.name);
        this.$set(node, 'type', '');
        this.$set(node, 'color', '#000');
      });
    } else {
      return;
    }
    const tooltip = new G6.Tooltip({
      itemTypes: ['node'],
      className: style['g6-tooltip'],
      // @ts-ignore
      getContent: (e) => {
        const outDiv = document.createElement('div');
        outDiv.style.width = 'fit-content';
        outDiv.innerHTML = this.renderHoverContent(e.item.getModel());
        return outDiv;
      },
    });

    const graph = new G6.Graph({
      container: 'graphContainer',
      width: (this.$refs.body as HTMLElement).offsetWidth,
      height: (this.$refs.body as HTMLElement).offsetHeight,
      linkCenter: true,
      plugins: [tooltip],
      fitView: true,
      fitCenter: true,
      modes: {
        default: ['drag-canvas', 'drag-node', 'zoom-canvas', 'activate-relations'],
      },
      layout: {
        type: 'dagre',
        rankdir: 'TB',
        controlPoints: true,
        nodesepFunc: () => 8,
        ranksepFunc: () => 50,
      },
      defaultNode: {
        size: 45,
        // type: 'rect',
        // shape: 'rect',
        style: {
          stroke: 'black',
          radius: 4,
          fill: '#fff',
          cursor: 'pointer',
        },
        labelCfg: {
          position: 'bottom',
          style: {
            fontSize: 16,
          },
          offset: 10,
        },
      },
      defaultEdge: {
        type: 'cubic-vertical',
        size: 1,
        style: {
          stroke: '#999',
        },
        radius: 20,
      },
      nodeStateStyles: {
        active: {
          fill: '#85DCFF',
          opacity: 1,
          stroke: '#E5E7EB',
        },
        inactive: {
          fill: '#fff',
          stroke: '#D1D5DB',
          opacity: 0.8,
        },
      },
      edgeStateStyles: {
        active: {
          stroke: '#5BB0FF',
        },
        inactive: {
          opacity: 0.1,
        },
      },
    });
    // @ts-ignore
    graph.data(graphData);
    graph.render();
    graph.fitView();
  }
  public calcStrLen(str: string) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
        len++;
      } else {
        len += 1;
      }
    }
    return len;
  }

  public formatStr(str: string, maxWidth: number, fontSize: number) {
    const fontWidth = fontSize * 1.3;
    const width = this.calcStrLen(str) * fontWidth;
    const ellipsis = '\n';
    if (width > maxWidth) {
      const actualLen = Math.floor((maxWidth - 1) / fontWidth);

      const remain = str.substring(actualLen, str.length);

      const result = str.substring(0, actualLen) + ellipsis + remain;

      return result;
    }
    return str;
  }
  public render() {
    return (
      <div id='graphContainer' ref='body' class='w-full h-full relative'>
        {this.resourceLoading && <Spin large fix />}
      </div>
    );
  }
}
