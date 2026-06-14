import React from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';

interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  title?: string;
  unit?: string;
  height?: number;
  splitNumber?: number;
  className?: string;
  thresholds?: Array<{ value: number; color: string }>;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 100,
  min = 0,
  title,
  unit = '%',
  height = 200,
  splitNumber = 5,
  className,
  thresholds,
}) => {
  const defaultThresholds = [
    { value: 30, color: '#10b981' },
    { value: 70, color: '#f59e0b' },
    { value: 100, color: '#ef4444' },
  ];

  const actualThresholds = thresholds || defaultThresholds;

  const getColor = (val: number) => {
    for (let i = 0; i < actualThresholds.length; i++) {
      if (val <= actualThresholds[i].value) {
        return actualThresholds[i].color;
      }
    }
    return actualThresholds[actualThresholds.length - 1].color;
  };

  const currentColor = getColor(value);

  const option: echarts.EChartsOption = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '60%'],
        radius: '90%',
        startAngle: 225,
        endAngle: -45,
        min,
        max,
        splitNumber,
        progress: {
          show: true,
          width: 12,
          itemStyle: {
            color: currentColor,
          },
        },
        pointer: {
          show: true,
          length: '65%',
          width: 4,
          itemStyle: {
            color: currentColor,
          },
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: [[1, 'rgba(255, 255, 255, 0.05)']],
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: true,
          distance: -20,
          length: 8,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
            width: 2,
          },
        },
        axisLabel: {
          show: true,
          distance: 25,
          color: '#64748b',
          fontSize: 10,
        },
        title: {
          show: true,
          offsetCenter: [0, '80%'],
          fontSize: 12,
          color: '#94a3b8',
        },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          fontWeight: 'bold',
          offsetCenter: [0, '30%'],
          formatter: `{value}${unit}`,
          color: currentColor,
        },
        data: [
          {
            value,
            name: title,
          },
        ],
      },
    ],
  };

  return <BaseChart option={option} height={height} className={className} />;
};
