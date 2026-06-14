import React from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';

interface BarChartData {
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
  };
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  subtitle?: string;
  xAxisName?: string;
  yAxisName?: string;
  seriesName?: string;
  height?: number;
  horizontal?: boolean;
  color?: string;
  showGradient?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  subtitle,
  xAxisName,
  yAxisName,
  seriesName = '数据',
  height = 300,
  horizontal = false,
  color = '#3b82f6',
  showGradient = true,
  className,
}) => {
  const xAxisData = data.map((d) => d.name);
  const values = data.map((d) => ({
    value: d.value,
    itemStyle: d.itemStyle || {
      color: showGradient
        ? new echarts.graphic.LinearGradient(
            horizontal ? 0 : 0,
            horizontal ? 0 : 0,
            horizontal ? 1 : 0,
            horizontal ? 0 : 1,
            [
              { offset: 0, color: color },
              { offset: 1, color: `${color}60` },
            ]
          )
        : color,
      borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
    },
  }));

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
      trigger: horizontal ? 'axis' : 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
      },
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(59, 130, 246, 0.1)',
        },
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: title ? '60px' : '10px',
      containLabel: true,
    },
    xAxis: horizontal
      ? {
          type: 'value',
          name: xAxisName,
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
        }
      : {
          type: 'category',
          data: xAxisData,
          name: xAxisName,
          nameTextStyle: {
            color: '#64748b',
            fontSize: 11,
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          axisLabel: {
            color: '#64748b',
            fontSize: 11,
            rotate: xAxisData.length > 8 ? 30 : 0,
          },
          axisTick: {
            show: false,
          },
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: xAxisData,
          name: yAxisName,
          nameTextStyle: {
            color: '#64748b',
            fontSize: 11,
          },
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
        }
      : {
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
        type: 'bar',
        barWidth: horizontal ? '50%' : '40%',
        data: values,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: `${color}80`,
          },
        },
      },
    ],
  };

  return <BaseChart option={option} height={height} className={className} />;
};
