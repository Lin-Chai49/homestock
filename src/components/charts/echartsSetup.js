import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
  PieChart,
  CustomChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout, UniversalTransition } from 'echarts/features';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  CustomChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

export default echarts;
