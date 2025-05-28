<template>
    <div style="width: 100%;margin-top: 50px;">
      <div ref="chart" style="width: 100%; height: 500px;" />
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts';
  
  export default {
    props: {
      data: Array
    },
    mounted() {
      this.chart = echarts.init(this.$refs.chart);
      this.renderChart();
    },
    watch: {
      data: {
        deep: true,
        handler() {
          this.renderChart();
        }
      }
    },
    methods: {
      renderChart() {
        const paid = this.data.filter(app => app.Type === 'Paid' && app.Rating !== 'NaN');
        const free = this.data.filter(app => app.Type === 'Free' && app.Rating !== 'NaN');
  
        const avg = (arr, key) =>
          arr.length
            ? arr.reduce((sum, a) => sum + parseFloat(a[key] || 0), 0) / arr.length
            : 0;
  
        const avgRatingPaid = avg(paid, 'Rating').toFixed(2);
        const avgRatingFree = avg(free, 'Rating').toFixed(2);
  
        const avgInstallsPaid = avg(
          paid,
          'Installs'
        );
        const avgInstallsFree = avg(
          free,
          'Installs'
        );
  
        // Installs parse
        const parseInstall = str => parseInt((str || '0').replace(/[+,]/g, '')) || 0;
        const paidInstalls = paid.map(app => parseInstall(app.Installs));
        const freeInstalls = free.map(app => parseInstall(app.Installs));
  
        const avgInstallsPaidParsed = Math.round(paidInstalls.reduce((a, b) => a + b, 0) / paidInstalls.length);
        const avgInstallsFreeParsed = Math.round(freeInstalls.reduce((a, b) => a + b, 0) / freeInstalls.length);
  
        this.chart.setOption({
          backgroundColor: 'transparent',
          title: {
            text: 'Paid vs Free App：Average Rating & Installs',
            left: 'center',
            textStyle: { color: '#fff', fontSize: 18 }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
          },
          legend: {
            top: 40,
            textStyle: { color: '#fff' }
          },
          xAxis: {
            type: 'category',
            data: ['Free', 'Paid'],
            axisLabel: { color: '#fff' }
          },
          yAxis: [
            {
              type: 'value',
              name: 'Average Rating',
              min: 0,
              max: 5,
              position: 'left',
              axisLabel: { color: '#fff' }
            },
            {
              type: 'value',
              name: 'Average Installs',
              position: 'right',
              axisLabel: {
                color: '#fff',
                formatter: value => value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : `${Math.round(value / 1000)}K`
              }
            }
          ],
          series: [
            {
              name: 'Average Rating',
              type: 'bar',
              data: [avgRatingFree, avgRatingPaid],
              yAxisIndex: 0,
              itemStyle: { color: '#4caf50' },
              barWidth: '40%'
            },
            {
              name: 'Average Installs',
              type: 'bar',
              data: [avgInstallsFreeParsed, avgInstallsPaidParsed],
              yAxisIndex: 1,
              itemStyle: { color: '#2196f3' },
              barWidth: '40%'
            }
          ]
        });
      }
    }
  };
  </script>
  