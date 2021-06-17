import { StoreDistribution } from '../../types';
import Chart from 'react-apexcharts';

function StoreDistributionChart(props: { data: StoreDistribution, height?: number }) {

  const categories = props.data.map(it => it.storename);

  const chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
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
      <Chart series={[{
        name: 'Reviews',
        data: props.data.map(it => it.count),
      }]} options={chartOptions} type="bar" height={props.height || 300} />
    </div>
  );
}

export default StoreDistributionChart;