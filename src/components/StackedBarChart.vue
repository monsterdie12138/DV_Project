<template>
    <div class="stacked-container">
      <div ref="chart" class="chart"></div>
      <div class="controls">
        <button @click="toggleViewMode">{{ viewMode === 'percent' ? 'Amount' : 'Percentage' }}</button>
        <select v-model="selectedCategory" @change="updateChart">
          <option value="all">All categories</option>
          <option v-for="cat in topCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>
</template>
  
  <script>
  import * as echarts from 'echarts';
  import rawData from '@/assets/data.json';
  
  export default {
    name: 'StackedBarChart',
    data() {
      return {
        chart: null,
        viewMode: 'percent', // 'count' or 'percent'
        selectedCategory: 'all',
        processedData: null,
        topCategories: []
      };
    },
    computed: {
      displayData() {
        if (!this.processedData) return null;
        
        if (this.selectedCategory !== 'all') {
          return {
            ...this.processedData,
            categories: [this.selectedCategory],
            ratingData: Object.fromEntries(
              Object.entries(this.processedData.ratingData).map(([interval, data]) => [
                interval,
                { [this.selectedCategory]: data[this.selectedCategory] || 0 }
              ])
            )
          };
        }
        return this.processedData;
      }
    },
    methods: {
      // 数据处理核心方法
      processData() {
        const categoryCounts = {};
        const ratingData = {};
        
        // 定义评分区间（从2.0开始）
        const ratingIntervals = [
          { min: 2.0, max: 2.5, label: "2.0-2.5" },
          { min: 2.5, max: 3.0, label: "2.5-3.0" },
          { min: 3.0, max: 3.5, label: "3.0-3.5" },
          { min: 3.5, max: 4.0, label: "3.5-4.0" },
          { min: 4.0, max: 4.5, label: "4.0-4.5" },
          { min: 4.5, max: 5.0, label: "4.5-5.0" },
          { min: NaN, max: NaN, label: "无评分" }
        ];
  
        // 初始化数据结构
        ratingIntervals.forEach(interval => {
          ratingData[interval.label] = {};
        });
  
        // 处理原始数据
        rawData.forEach(item => {
          const category = item.Category;
          const rating = parseFloat(item.Rating);
          
          // 统计类别出现次数
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          
          // 确定评分区间
          let intervalKey = "无评分";
          if (!isNaN(rating)) {
            const found = ratingIntervals.find(int => 
              !isNaN(int.min) && rating >= int.min && rating < int.max
            );
            intervalKey = found ? found.label : "无评分";
          }
          
          // 计数
          ratingData[intervalKey][category] = (ratingData[intervalKey][category] || 0) + 1;
        });
  
        // 按出现次数排序类别
        const sortedCategories = Object.keys(categoryCounts)
          .sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  
        return {
          categories: sortedCategories,
          ratingIntervals,
          ratingData,
          totalCounts: categoryCounts
        };
      },
  
      // 获取图表配置
      getChartOption() {
        if (!this.displayData) return null;
        
        const series = this.displayData.ratingIntervals.map(interval => {
          const data = this.displayData.categories.map(cat => {
            const value = this.displayData.ratingData[interval.label][cat] || 0;
            return this.viewMode === 'percent' 
              ? (value / this.processedData.totalCounts[cat] * 100).toFixed(1)
              : value;
          });
          
          return {
            name: interval.label,
            type: 'bar',
            stack: 'total',
            emphasis: { focus: 'series' },
            data: data,
            itemStyle: {
              color: this.getIntervalColor(interval.min)
            },
            label: {
              show: this.displayData.categories.length <= 15,
              position: 'inside',
              formatter: params => {
                if (this.viewMode === 'percent') return `${params.value}%`;
                return params.value > 10 ? params.value : '';
              }
            }
          };
        });
  
        return {
          tooltip: {
            axisPointer: { type: 'shadow' },
            formatter: params => {
              const category = params.name;
              const total = this.processedData.totalCounts[category];
              let html = `<b>${category}</b><br/>`;
              [params].forEach(p => {
                const value = Number(p.value);
                const percent = total ? ((value / total) * 100).toFixed(1) : '0.0';
                html += `
                  <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background:${p.color}"></span>
                  ${p.seriesName}: ${this.viewMode == 'percent' ? `${value}%` : value} 
                  ${this.viewMode == 'count' ? `(${percent}%)` : ''}<br/>
                `;
              });
              html += `总计: ${total}条`;
              return html;
            }
          },
          legend: {
            data: this.displayData.ratingIntervals.map(i => i.label),
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            itemWidth: 10,
            textStyle: { 
              color: '#fff',
              fontFamily: 'Times New Roman',
            }
          },
          grid: {
            left: '2%',
            right: '18%',
            bottom: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: this.displayData.categories,
            axisLabel: {
              fontFamily: 'Times New Roman',
              rotate: 45,
              color: '#fff',
              fontSize: 9,
              interval: 0,
              formatter: value => {
                if (value.length > 10) return value.substring(0, 8) + '...';
                return value;
              }
            }
          },
          yAxis: {
            type: 'value',
            max: this.viewMode === 'percent' ? 100 : null,
            axisLabel: { 
              fontFamily: 'Times New Roman',
              color: '#fff',
              formatter: value => this.viewMode === 'percent' ? `${value}%` : value
            }
          },
          dataZoom: [
            {
              type: 'slider',
              show: this.displayData.categories.length > 10,
              xAxisIndex: 0,
              bottom: '5%',
              height: 20,
              handleStyle: {
                color: '#fff'
              }
            }
          ],
          series
        };
      },
  
      // 颜色生成
      getIntervalColor(minValue) {
        if (isNaN(minValue)) return '#999';
        
        const colors = [
          '#6091ab', '#89a3ae', '#b2b5b2', '#dbc7b5', '#d3a89c', '#ca8882'
        ];
        const index = Math.floor((minValue - 2.0) / 0.5);
        return colors[index] || '#6a3d9a';
      },
  
      // 视图切换
      toggleViewMode() {
        this.viewMode = this.viewMode === 'percent' ? 'count' : 'percent';
        this.updateChart();
      },
  
      // 更新图表
      updateChart() {
        if (this.chart) {
          this.chart.setOption(this.getChartOption());
        }
      },
  
      // 初始化图表
      initChart() {
        this.processedData = this.processData();
        this.topCategories = this.processedData.categories;
        
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();
        
        window.addEventListener('resize', this.handleResize);
      },
  
      // 处理窗口大小变化
      handleResize() {
        this.chart?.resize();
      }
    },
    mounted() {
        this.initChart();
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
      this.chart?.dispose();
    }
  };
  </script>
  
  <style scoped>
  .stacked-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .chart {
    width: 100%;
    height: 100%;
  }
  
  .controls {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    display: flex;
    gap: 10px;
  }
  
  button, select {
    padding: 5px 10px;
    background: #393636;
    color: white;
    border: 1px solid;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Times New Roman', serif;
  }
  
  select {
    min-width: 120px;
  }
  </style>