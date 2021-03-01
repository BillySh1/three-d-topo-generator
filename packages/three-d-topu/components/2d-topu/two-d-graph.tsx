/*
 * @Author: Billy-S
 * @Description:
 * @Date: 2021-02-18 14:21:03
 * @LastEditTime: 2021-02-28 17:59:48
 */
import G6 from '@antv/g6';
import { InstanceLink, InstanceNode } from '../../interfaces';
import { Vue, Component, Prop } from 'vue-property-decorator';
import style from '../../styles/two-d-graph.module.less';
@Component
export default class TwoDGraph extends Vue {
  @Prop() public readonly picData: { nodes: InstanceNode[]; edges: InstanceLink[] };
  public data() {
    return {};
  }
  public mounted() {
    const graphData = {
      nodes: JSON.parse(JSON.stringify(this.picData.nodes)),
      edges: JSON.parse(JSON.stringify(this.picData.edges)),
    };

    if (graphData.nodes.length > 0 && graphData.edges.length > 0) {
      graphData.nodes.forEach((node: InstanceNode) => {
        this.$set(node, 'label', node.name);
        this.$set(node, 'type', '');
        this.$set(node, 'color', '');
        // node.type = ''; // 防止字段冲突
        // node.color = ''; // 取消默认颜色
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
        outDiv.innerHTML = `${e.item.getModel().name}`;
        return outDiv;
      },
    });

    const graph = new G6.Graph({
      container: 'graphContainer',
      width: (this.$refs.body as HTMLElement).offsetWidth,
      height: (this.$refs.body as HTMLElement).offsetHeight,
      linkCenter: true,
      plugins: [tooltip],
      // fitView: true,
      fitCenter: true,
      autoPaint: true,
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
        size: [80, 40],
        type: 'rect',
        shape: 'rect',
        style: {
          lineWidth: 2,
          fill: '#fff',
          cursor: 'pointer',
          radius: 5,
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
          opacity: 1,
        },
        inactive: {
          opacity: 0.2,
        },
      },
      edgeStateStyles: {
        active: {
          stroke: '#5BB0FF',
        },
      },
    });
    // @ts-ignore
    graph.data(graphData);
    graph.render();
    graph.fitView();
  }
  public render() {
    return <div id='graphContainer' ref='body' class='w-full h-full'></div>;
  }
}
