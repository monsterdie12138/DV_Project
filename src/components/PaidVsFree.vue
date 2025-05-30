<template>
    <div style="width: 100%">
      <div ref="chart" class="chart-container" style="width: 100%; height: 500px;" />
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
            textStyle: { 
              color: '#fff', 
              fontSize: 18, 
              fontFamily: 'Times New Roman' 
            },
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            textStyle: { fontFamily: 'Times New Roman' }
          },
          legend: {
            top: 40,
            textStyle: { 
              color: '#fff', 
              fontFamily: 'Times New Roman' 
            },
          },
          grid: {
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['Free', 'Paid'],
            axisLabel: { 
              color: '#fff', 
              fontFamily: 'Times New Roman', 
              fontSize: 12 
            }
          },
          yAxis: [
            {
              type: 'value',
              name: 'Average Rating',
              min: 0,
              max: 5,
              position: 'left',
              axisLabel: { color: '#fff', fontFamily: 'Times New Roman' },
              nameTextStyle: { 
                fontFamily: 'Times New Roman', 
                color: '#fff' 
              }
            },
            {
              type: 'value',
              name: 'Average Installs',
              position: 'right',
              axisLabel: {
                color: '#fff',
                fontFamily: 'Times New Roman',
                formatter: value => value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : `${Math.round(value / 1000)}K`
              },
              nameTextStyle: { 
                fontFamily: 'Times New Roman', 
                color: '#fff' 
              }
            }
          ],
          series: [
            {
              name: 'Average Rating',
              type: 'bar',
              data: [avgRatingFree, avgRatingPaid],
              yAxisIndex: 0,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#d67573' },
                  { offset: 1, color: '#dbc7b5' }
                ])
              },
              barWidth: '20%'
            },
            {
              name: 'Average Installs',
              type: 'bar',
              data: [avgInstallsFreeParsed, avgInstallsPaidParsed],
              yAxisIndex: 1,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#6091ab' },
                  { offset: 1, color: '#dbc7b5' }
                ])
              },
              barWidth: '20%'
            }
          ]
        });
      }
    }
  };
  </script>

<style scoped>
.chart-container {
  background-color: #67605f;
}
</style>