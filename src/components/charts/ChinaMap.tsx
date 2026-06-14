import React, { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';
import { mockApi } from '../../services/mock';

interface HeatMapData {
  name: string;
  value: number;
}

interface ChinaMapProps {
  data: HeatMapData[];
  title?: string;
  subtitle?: string;
  height?: number;
  min?: number;
  max?: number;
  onRegionClick?: (region: string) => void;
  className?: string;
  visualMapText?: string[];
  colorRange?: string[];
}

const defaultColors = [
  '#1e3a5f',
  '#1e40af',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
];

export const ChinaMap: React.FC<ChinaMapProps> = ({
  data,
  title,
  subtitle,
  height = 500,
  min = 0,
  max = 100,
  onRegionClick,
  className,
  visualMapText = ['高', '低'],
  colorRange = defaultColors,
}) => {
  const [mapData, setMapData] = useState<HeatMapData[]>([]);
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        if (!echarts.getMap('china')) {
          const geoJson = await mockApi.region.getChinaGeoJson();
          echarts.registerMap('china', geoJson as any);
        }
        setMapData(data);
        setChartReady(true);
      } catch (error) {
        console.error('加载地图数据失败:', error);
      }
    };
    loadMapData();
  }, [data]);

  if (!chartReady) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const option: echarts.EChartsOption = {
    title: title
      ? {
          text: title,
          subtext: subtitle,
          textStyle: {
            color: '#f1f5f9',
            fontSize: 16,
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
      formatter: (params: any) => {
        const value = params.value || 0;
        return `<div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
                <div>超采率: <span style="color: ${colorRange[colorRange.length - 1]}; font-weight: 600;">${value.toFixed(1)}%</span></div>`;
      },
    },
    visualMap: {
      min,
      max,
      left: 'left',
      top: 'bottom',
      text: visualMapText,
      textStyle: {
        color: '#94a3b8',
        fontSize: 11,
      },
      calculable: true,
      inRange: {
        color: colorRange,
      },
      itemWidth: 15,
      itemHeight: 120,
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      center: [104, 35],
      label: {
        show: true,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 10,
      },
      emphasis: {
        label: {
          show: true,
          color: '#fff',
          fontSize: 12,
        },
        itemStyle: {
          areaColor: '#60a5fa',
          shadowBlur: 20,
          shadowColor: 'rgba(59, 130, 246, 0.5)',
        },
      },
      itemStyle: {
        areaColor: 'rgba(30, 58, 95, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
      select: {
        itemStyle: {
          areaColor: '#3b82f6',
        },
        label: {
          color: '#fff',
        },
      },
    },
    series: [
      {
        name: '超采率',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        data: mapData,
      },
    ],
  };

  const handleChartReady = (chart: echarts.ECharts) => {
    chart.on('click', (params: any) => {
      if (onRegionClick && params.componentType === 'geo') {
        onRegionClick(params.name);
      }
    });
  };

  return (
    <BaseChart
      option={option}
      height={height}
      className={className}
      onChartReady={handleChartReady}
    />
  );
};
