<template>
  <div class="boxplot-container">
    <div class="chart-area">
      <div ref="ratingChart" class="chart rating-chart"></div>
      <div ref="installsChart" class="chart installs-chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'BoxPlotComparison',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      ratingChart: null,
      installsChart: null,
      chartOptions: {
        rating: {
          title: {
            text: 'Rating (Paid vs Free)',
            left: 'center',
            textStyle: {
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            }
          },
          tooltip: {
            trigger: 'item',
            axisPointer: { type: 'shadow' },
            textStyle: { fontFamily: 'Times New Roman' },
          },
          grid: {
            left: '10%',
            right: '10%',
            top: '20%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['Paid', 'Free'],
            axisLabel: {
              fontSize: 12,
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            }
          },
          yAxis: {
            type: 'value',
            name: 'Rating',
            min: 0,
            max: 5,
            nameTextStyle: {
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            },
            axisLabel: { 
              formatter: '{value}',
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            }
          }
        },
        installs: {
          title: {
            text: 'Installs (Paid vs Free)',
            left: 'center',
            textStyle: {
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            }
          },
          tooltip: {
            trigger: 'item',
            axisPointer: { type: 'shadow' },
            textStyle: { fontFamily: 'Times New Roman' },
          },
          grid: {
            left: '10%',
            right: '10%',
            top: '20%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['Paid', 'Free'],
            axisLabel: {
              fontSize: 12,
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            }
          },
          yAxis: {
            type: 'log',  // 关键修改
            name: 'Installs (log scale)',
            nameTextStyle: {
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            },
            axisLabel: {
              formatter: (value) => this.formatNumber(value),
              fontFamily: 'Times New Roman',
              color: '#ffffff'
            },
            // 对数轴需要指定最小值和基数
            min: 1,    // 最小显示值（如1K）
            max: 1000000,
            logBase: 10   // 对数基数（10为常用）
          }
        }
      }
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  methods: {
    initCharts() {
      if (!this.$refs.ratingChart || !this.$refs.installsChart) {
        setTimeout(() => this.initCharts(), 50);
        return;
      }

      this.ratingChart = echarts.init(this.$refs.ratingChart);
      this.installsChart = echarts.init(this.$refs.installsChart);

      this.updateCharts();

      window.addEventListener('resize', this.handleResize);
    },

    handleResize() {
      if (this.ratingChart) {
        this.ratingChart.resize();
      }
      if (this.installsChart) {
        this.installsChart.resize();
      }
    },

    processRatingData() {
      const paidRatings = [];
      const freeRatings = [];

      this.data.forEach(item => {
        if (item.Rating && item.Rating !== 'NaN') {
          const rating = parseFloat(item.Rating);
          if (!isNaN(rating)) {
            if (item.Type === 'Paid') {
              paidRatings.push(rating);
            } else if (item.Type === 'Free') {
              freeRatings.push(rating);
            }
          }
        }
      });

      return {
        paid: this.calculateBoxPlotData(paidRatings),
        free: this.calculateBoxPlotData(freeRatings)
      };
    },

    processInstallsData() {
      const paidInstalls = [];
      const freeInstalls = [];
      
      this.data.forEach(item => {
        if (item.Installs) {
          // 处理 "50,000+" 这样的格式
          const installStr = item.Installs.replace(',', '').replace('+', '');
          const installs = parseInt(installStr);
          if (!isNaN(installs)) {
            if (item.Type === 'Paid') {
              paidInstalls.push(installs);
            } else if (item.Type === 'Free') {
              freeInstalls.push(installs);
            }
          }
        }
      });

      return {
        paid: this.calculateBoxPlotData(paidInstalls),
        free: this.calculateBoxPlotData(freeInstalls)
      };
    },

    calculateBoxPlotData(data) {
      if (!data || data.length === 0) return [0, 0, 0, 0, 0];

      // 排序数据
      const sorted = [...data].sort((a, b) => a - b);
      const q1 = this.quantile(sorted, 0.25);
      const median = this.quantile(sorted, 0.5);
      const q3 = this.quantile(sorted, 0.75);

      // 计算上下边界
      const iqr = q3 - q1;
      const lowerBound = Math.max(sorted[0], q1 - 1.5 * iqr);
      const upperBound = Math.min(sorted[sorted.length - 1], q3 + 1.5 * iqr);

      return [lowerBound, q1, median, q3, upperBound];
    },

    quantile(sorted, p) {
      const n = sorted.length;
      const index = (n - 1) * p;
      const lower = Math.floor(index);
      const upper = lower + 1;
      const weight = index - lower;

      if (upper >= n) return sorted[lower];
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    },

    updateCharts() {
      const ratingData = this.processRatingData();
      const installsData = this.processInstallsData();
      
      // Rating 箱型图
      const ratingOption = JSON.parse(JSON.stringify(this.chartOptions.rating));
      ratingOption.series = [
        {
          name: 'Boxplot',
          type: 'boxplot',
          data: [
            { 
              value: ratingData.paid, 
              itemStyle: { 
                color: '#d67573',
                borderColor: '#ffffff'
              }, 
              name: 'Paid'
            },
            { 
              value: ratingData.free, 
              itemStyle: { 
                color: '#6091ab',
                borderColor: '#ffffff'
              }, 
              name: 'Free' 
              }
          ],
          tooltip: {
            formatter: param => {
              const data = param.data.value;
              return [
                'Type: ' + param.name,
                'Min: ' + data[0].toFixed(2),
                'Q1: ' + data[1].toFixed(2),
                'Median: ' + data[2].toFixed(2),
                'Q3: ' + data[3].toFixed(2),
                'Max: ' + data[4].toFixed(2)
              ].join('<br/>');
            }
          }
        }
      ];
      
      // Installs 箱型图
      const installsOption = JSON.parse(JSON.stringify(this.chartOptions.installs));
      installsOption.series = [
        {
          name: 'Boxplot',
          type: 'boxplot',
          data: [
            { 
              value: installsData.paid, 
              itemStyle: { 
                color: '#d67573',
                borderColor: '#ffffff'
              }, 
              name: 'Paid' 
            },
            { 
              value: installsData.free, 
              itemStyle: { 
                color: '#6091ab',
                borderColor: '#ffffff'
              }, 
              name: 'Free' 
            }
          ],
          tooltip: {
            formatter: param => {
              const data = param.data.value;
              return [
                'Type: ' + param.name,
                'Min: ' + this.formatNumber(data[0]),
                'Q1: ' + this.formatNumber(data[1]),
                'Median: ' + this.formatNumber(data[2]),
                'Q3: ' + this.formatNumber(data[3]),
                'Max: ' + this.formatNumber(data[4])
              ].join('<br/>');
            }
          }
        }
      ];
      
      this.ratingChart.setOption(ratingOption);
      this.installsChart.setOption(installsOption);
    },

    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
  },
  watch: {
    data: {
      handler() {
        if (this.ratingChart && this.installsChart) {
          this.updateCharts();
        }
      },
      deep: true
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);

    if (this.ratingChart) {
      this.ratingChart.dispose();
    }
    if (this.installsChart) {
      this.installsChart.dispose();
    }
  }
};
</script>

<style scoped>
.boxplot-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.chart-area {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.chart {
  flex: 1;
  margin: 0;
  background-color: #67605f;
}
</style>