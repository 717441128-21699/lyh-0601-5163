import React from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';

interface LineChartProps {
  data: Array<{ name: string; value: number | string }>;
  xAxisData: string[];
  title?: string;
  subtitle?: string;
  yAxisName?: string;
  seriesName?: string;
  height?: number;
  smooth?: boolean;
  areaStyle?: boolean;
  color?: string;
  showLegend?: boolean;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisData,
  title,
  subtitle,
  yAxisName,
  seriesName = '数据',
  height = 300,
  smooth = true,
  areaStyle = true,
  color = '#3b82f6',
  showLegend = false,
  className,
}) => {
  const option: echarts.EChartsOption = {
    title: title
      ? {
          text: title,
          subtext: subtitle,
          textStyle: {
            color: '#f1f5f9',
            fontSize: 14,
            fontWeight: 600,
          },
          subtextStyle: {
            color: '#64748b',
            fontSize: 12,
          },
          left: 'center',
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
      },
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.5)',
        },
      },
    },
    legend: showLegend
      ? {
          data: [seriesName],
          textStyle: {
            color: '#94a3b8',
          },
          top: 0,
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: title ? '60px' : '10px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: {
        color: '#64748b',
        fontSize: 11,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    series: [
      {
        name: seriesName,
        type: 'line',
        smooth,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        itemStyle: {
          color,
        },
        lineStyle: {
          width: 2,
          color,
        },
        areaStyle: areaStyle
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${color}40` },
                { offset: 1, color: `${color}05` },
              ]),
            }
          : undefined,
        data: data.map((d) => d.value),
        emphasis: {
          focus: 'series',
          itemStyle: {
            color,
            borderWidth: 2,
            borderColor: '#fff',
          },
        },
      },
    ],
  };

  return <BaseChart option={option} height={height} className={className} />;
};
