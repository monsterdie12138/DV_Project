<template>
    <div style="width: 100%; display: flex; flex-direction: column; align-items: flex-start;">
      <button @click="toggleInstallSize" style="margin-top: 40px; margin-left: 20px;padding: 10px 20px; border: none; background-color: #3f51b5; color: white; border-radius: 20px; cursor: pointer;">
        {{ showInstallSize ? 'without install' : 'display install' }}
      </button>
      <div ref="chart" style="width: 100%; height: 500px;" />
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts';
  
  export default {
    props: {
      data: Array
    },
    data() {
      return {
        chart: null,
        showInstallSize: false
      };
    },
    mounted() {
      this.chart = echarts.init(this.$refs.chart);
      this.renderChart();
    },
    watch: {
      data: {
        handler() {
          this.renderChart();
        },
        deep: true
      },
      showInstallSize() {
        this.renderChart();
      }
    },
    methods: {
      toggleInstallSize() {
        this.showInstallSize = !this.showInstallSize;
      },
      renderChart() {
        if (!this.chart || !this.data) return;
  
        const processedData = this.data
          .filter(item => item.Rating !== 'NaN' && item.Reviews !== '0')
          .map(item => [
            parseInt(item.Reviews),
            parseFloat(item.Rating),
            item.App,
            parseInt(item.Installs?.replace(/[+,]/g, '') || '0')
          ]);
  
        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: '#222',
            borderColor: '#999',
            borderWidth: 1,
            textStyle: { color: '#fff' },
            formatter: function (params) {
              const [reviews, rating, appName, installs] = params.data;
              return `
                <strong>${appName}</strong><br/>
                 Rating: ${rating}<br/>
                 Reviews: ${Number(reviews).toLocaleString()}<br/>
                 Installs: ${Number(installs).toLocaleString()}
              `;
            }
          },
          xAxis: {
            type: 'log',
            name: 'Reviews (log)',
            nameTextStyle: { color: '#fff' },
            axisLabel: {
              color: '#fff',
              formatter: value => {
                if (value >= 1_000_000) return value / 1_000_000 + 'M';
                if (value >= 1_000) return value / 1_000 + 'K';
                return value;
              }
            },
            min: 1,
            splitLine: { lineStyle: { color: '#444' } }
          },
          yAxis: {
            type: 'value',
            name: 'Rating',
            nameTextStyle: { color: '#fff' },
            axisLabel: { color: '#fff' },
            splitLine: { lineStyle: { color: '#444' } },
            min: 0,
            max: 5
          },
          dataZoom: [
            { type: 'inside', xAxisIndex: 0 },
            {
              type: 'slider',
              xAxisIndex: 0,
              height: 20,
              bottom: 0,
              handleStyle: {
                color: '#aaa',
                shadowBlur: 6,
                shadowColor: '#000'
              }
            }
          ],
          series: [
            {
              name: 'App Scatter',
              type: 'scatter',
              data: processedData,
              symbolSize: val => {
                if (this.showInstallSize) {
                  const installs = val[3];
                  return Math.max(5, Math.log(installs + 1) * 3);
                } else {
                  return 10; // 固定大小
                }
              },
              itemStyle: {
                color: params => {
                  const rating = params.data[1];
                  if (rating >= 4.5) return '#4caf50';
                  else if (rating >= 4.0) return '#ffca28';
                  else return '#e53935';
                },
                opacity: 0.8,
                shadowBlur: 10,
                shadowColor: 'rgba(0,0,0,0.3)'
              }
            }
          ]
        };
  
        this.chart.setOption(option);
      }
    }
  };
  </script>
  