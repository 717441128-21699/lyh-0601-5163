import React from 'react';
import { BaseChart } from './BaseChart';

interface HeatMapChartProps {
  xAxisData: string[];
  yAxisData: string[];
  data: Array<[number, number, number]>;
  title?: string;
  subtitle?: string;
  height?: number;
  min?: number;
  max?: number;
  className?: string;
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({
  xAxisData,
  yAxisData,
  data,
  title,
  subtitle,
  height = 300,
  min = 0,
  max = 100,
  className,
}) => {
  const option = {
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
      position: 'top' as const,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
      },
      formatter: (params: any) => {
        return `${yAxisData[params.data[1]]} - ${xAxisData[params.data[0]]}<br/>
                <strong>${params.data[2].toFixed(2)}</strong>`;
      },
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: title ? '60px' : '10px',
    },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      splitArea: {
        show: true,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'category' as const,
      data: yAxisData,
      splitArea: {
        show: true,
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
      },
    },
    visualMap: {
      min,
      max,
      calculable: true,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: '0%',
      textStyle: {
        color: '#94a3b8',
        fontSize: 10,
      },
      inRange: {
        color: ['#1e3a5f', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#fbbf24', '#f97316', '#ef4444'],
      },
      itemWidth: 12,
      itemHeight: 120,
    },
    series: [
      {
        name: '沉降漏斗',
        type: 'heatmap' as const,
        data,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return <BaseChart option={option} height={height} className={className} />;
};
