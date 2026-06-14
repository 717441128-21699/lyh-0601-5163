import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { cn } from '../../lib/utils';

interface BaseChartProps {
  option: echarts.EChartsOption;
  className?: string;
  height?: number | string;
  onChartReady?: (chart: echarts.ECharts) => void;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  option,
  className,
  height = 300,
  onChartReady,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, 'dark');

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    if (onChartReady && chartInstance.current) {
      onChartReady(chartInstance.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [onChartReady]);

  useEffect(() => {
    if (chartInstance.current && option) {
      chartInstance.current.setOption(option, true);
    }
  }, [option]);

  return (
    <div
      ref={chartRef}
      className={cn('w-full', className)}
      style={{ height }}
    />
  );
};
