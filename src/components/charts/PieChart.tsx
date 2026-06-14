import React from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';

interface PieChartData {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLabel?: boolean;
  color?: string[];
  className?: string;
}

const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  innerRadius = 0,
  outerRadius = '70%',
  showLabel = true,
  color = defaultColors,
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
      trigger: 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#94a3b8',
        fontSize: 11,
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 8,
    },
    color,
    series: [
      {
        name: '数据',
        type: 'pie',
        radius: [innerRadius, outerRadius],
        center: ['40%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'rgba(15, 23, 42, 0.8)',
          borderWidth: 2,
        },
        label: {
          show: showLabel,
          color: '#94a3b8',
          fontSize: 11,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          show: showLabel,
          length: 10,
          length2: 10,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
          scale: true,
          scaleSize: 8,
        },
        data,
      },
    ],
  };

  return <BaseChart option={option} height={height} className={className} />;
};
