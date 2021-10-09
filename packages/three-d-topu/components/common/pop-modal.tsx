import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { VNode } from 'vue';
import { Icon } from '@idg/iview';
import { Log } from '@idg/idg';
import Trigger from '@idg/vc-trigger';
import '@idg/vc-trigger/assets/index.less';

type FuncRender = () => VNode | JSX.Element[];

export interface BodyView {
  name: string;
  title: string;
  level: number;
  content: VNode | FuncRender | string;
  parent?: string;
}

const TAG = 'pro-man-backstage/PopModal';

const PlacementValues = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right',
  'left',
  'left-top',
  'left-bottom',
  'right',
  'right-top',
  'right-bottom',
];

@Component({
  depends: [],
})
export default class PopModal extends Vue {
  @Prop({ default: false }) public readonly value: boolean;
  @Prop({ default: 'title' }) public readonly title: string;
  @Prop({ default: true }) public readonly showHeader: boolean;
  @Prop({
    default() {
      return [];
    },
  })
  public readonly offset: number[];
  @Prop({ default: 1000 }) public readonly zIndex: number;
  @Prop({ default: true }) public readonly outerClosable: boolean;
  @Prop({
    default: 'click',
    validator(value) {
      return ['hover', 'click', 'focus', 'contextmenu'].includes(value);
    },
  })
  public readonly trigger: string;
  @Prop({
    default: 'bottom',
    validator(value) {
      return PlacementValues.includes(value);
    },
  })
  public readonly placement: string;
  @Prop({ default: '' }) public readonly viewName: string;
  @Prop({
    default() {
      return [];
    },
  })
  public readonly bodyViews: BodyView[];
  @Prop({ default: '' }) public readonly styles: string;

  public pointsPlacementMap: { [index: string]: string[] };
  public popupShow: boolean;
  public curViewName: string;

  public data() {
    return {
      pointsPlacementMap: {
        top: ['bc', 'tc'],
        'top-left': ['bl', 'tl'],
        'top-right': ['br', 'tr'],
        bottom: ['tc', 'bc'],
        'bottom-left': ['tl', 'bl'],
        'bottom-right': ['tr', 'br'],
        left: ['cr', 'cl'],
        'left-top': ['tr', 'tl'],
        'left-bottom': ['br', 'bl'],
        right: ['cl', 'cr'],
        'right-top': ['tl', 'tr'],
        'right-bottom': ['bl', 'br'],
      },
      popupShow: this.value,
      curViewName: this.viewName,
    };
  }

  public render() {
    const slotDefault = this.$slots.default;
    Log.debug(TAG, 'render slots ', this.$slots);

    return (
      <Trigger
        ref={'trigger'}
        zIndex={this.zIndex}
        action={[this.trigger]}
        popupAlign={this.popupAlign}
        popupVisible={this.popupShow}
        on={{
          popupVisibleChange: this.popupVisibleChange,
        }}
      >
        <div
          class={'flex flex-col bg-gray-1 rounded'}
          style={`
            box-shadow: 0 4px 12px rgba(0,0,0,.2);
            width: 400px; ${this.styles}
          `}
          slot='popup'
        >
          {this.renderHeader()}
          {this.$slots.content ? (
            <div class={'overflow-y-auto'} style={'max-height: 290px;'}>
              {this.$slots.content}
            </div>
          ) : (
            <div class={'p-4 overflow-y-auto'} style={'max-height: 290px;'}>
              {this.renderBody()}
            </div>
          )}
          {this.$slots.foot ? (
            <div
              class={`
                  w-full p-4 relative
                  border-0 border-t border-solid border-gray-4
                `}
            >
              {this.$slots.foot}
            </div>
          ) : (
            ''
          )}
        </div>
        <span>{slotDefault || <a href='jacascript:void(0)'>SlotDefault</a>}</span>
      </Trigger>
    );
  }

  public renderHeader() {
    return (
      this.showHeader && (
        <div
          class={`
      w-full px-4 py-2 relative
      text-gray-3
    `}
        >
          {this.renderIconBack()}
          {this.title}
          {this.renderIconClose()}
        </div>
      )
    );
  }

  public renderIconBack() {
    return (
      this.curView &&
      this.curView.level > 1 && (
        <div
          class={`${this.classHeadIcon} left-0`}
          style={'width: 56px;'}
          on={{
            click: this.back,
          }}
        >
          <Icon size={20} type='ios-arrow-back' />
        </div>
      )
    );
  }

  public renderIconClose() {
    return (
      <div
        class={`${this.classHeadIcon} right-0`}
        style={'width: 56px;color:white'}
        on={{
          click: this.close,
        }}
      >
        <Icon size={20} type='md-close' />
      </div>
    );
  }

  public renderBody() {
    if (this.bodyViews.length === 1 || !this.curView) {
      return this.$slots.body;
    }
    if (typeof this.curView.content === 'function') {
      return this.curView.content();
    } else {
      return this.curView.content;
    }
  }

  public get curView() {
    const view = this.bodyViews.find((bodyView) => {
      return bodyView.name === this.curViewName;
    });
    return view;
  }

  public get classHeadIcon() {
    return `flex items-center justify-center absolute top-0 h-full
    text-black-45 text-center cursor-pointer hover:text-black-85`;
  }

  public get popupAlign() {
    return {
      points: this.pointsPlacementMap[this.placement],
      offset: this.offset,
      overflow: {
        adjustX: true,
        adjustY: true,
      },
    };
  }

  @Watch('value')
  public valueChange(value: boolean) {
    Log.debug(TAG, 'valueChange', value);
    this.popupShow = value;
  }

  @Watch('popupShow')
  public popupShowChange(value: boolean) {
    Log.debug(TAG, 'popupShow', value);
    this.$emit('input', value);
  }

  @Watch('viewName')
  public viewNameChange(value: string) {
    Log.debug(TAG, 'viewNameChange', value);
    this.curViewName = value;
  }

  public mounted() {
    Log.debug(TAG, 'mounted');
  }

  public close() {
    Log.debug(TAG, 'close');
    this.popupShow = false;
  }

  public back() {
    Log.debug(TAG, 'back', this.curView);
    if (this.curView && this.curView.parent) {
      this.curViewName = this.curView.parent;
    }
    this.$emit('back', this.curViewName, this.curView);
  }

  public popupVisibleChange(value: boolean) {
    Log.debug(TAG, 'popupVisibleChange', value);
    if (this.outerClosable) {
      this.popupShow = value;
    } else {
      if (value) {
        this.popupShow = value;
      }
    }
  }
}
