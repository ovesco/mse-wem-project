import { useMemo } from 'react';
import { StarsDistribution } from '../../types';
import Chart from 'react-apexcharts';

function StarsDistributionChart(props: { data: StarsDistribution, height?: number }) {

  const categories = [...Array(41).keys()].map(i => (i+10) / 10);
  const series = useMemo(() => {
    return [
      { name: 'User reviews', data: [[0, 0], ...props.data.stars.map(it => [it.stars, it.count]).sort((a, b) => a[0] > b[0] ? 1 : -1), [6, 0]] },
      { name: 'Sentiment Analysis', data: [[0, 0], ...props.data.computed_stars.map(it => [it.stars, it.count]).sort((a, b) => a[0] > b[0] ? 1 : -1), [6, 0]] },
    ];
  }, [props.data]);

  const chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      }
    },
    tooltip: {
      x: {
        formatter: (a: any, b: any) => `${a} Star${a !== 1 ? 's' : ''}`,
      }
    },
    xaxis: {
      categories,
      labels: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false
    },
  };

  return (
    <div>
      <Chart series={series} options={chartOptions} type="area" height={props.height || 300} />
    </div>
  );
}

export default StarsDistributionChart;