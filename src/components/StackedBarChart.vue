<template>
    <div class="stacked-container">
      <div ref="chart" class="chart"></div>
      <div class="controls">
        <button @click="toggleViewMode">{{ viewMode === 'percent' ? '显示数量' : '显示百分比' }}</button>
        <select v-model="selectedCategory" @change="updateChart">
          <option value="all">所有类别</option>
          <option v-for="cat in topCategories" :value="cat">{{ cat }}</option>
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
  
        // 按出现次数排序类别，取前20个
        const sortedCategories = Object.keys(categoryCounts)
          .sort((a, b) => categoryCounts[b] - categoryCounts[a])
          .slice(0, 30);
  
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
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: params => {
              const category = params[0].axisValue;
              let html = `<b>${category}</b><br/>`;
              const total = this.processedData.totalCounts[category];
              
              params.reverse().forEach(p => {
                const value = p.value;
                const percent = ((p.value / total) * 100).toFixed(1);
                html += `
                  <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background:${p.color}"></span>
                  ${p.seriesName}: ${this.viewMode === 'percent' ? `${value}%` : value} 
                  ${this.viewMode === 'count' ? `(${percent}%)` : ''}<br/>
                `;
              });
              
              html += `<br/>总计: ${total}条`;
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
            textStyle: { color: '#fff' }
          },
          grid: {
            left: '3%',
            right: '23%',
            bottom: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: this.displayData.categories,
            axisLabel: {
              rotate: 45,
              color: '#fff',
              fontSize: 10,
              interval: 0,
              formatter: value => {
                if (value.length > 10) return value.substring(0, 8) + '...';
                return value;
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: { 
              color: '#fff',
              formatter: value => this.viewMode === 'percent' ? `${value}%` : value
            }
          },
          dataZoom: [
            {
              type: 'slider',
              show: this.displayData.categories.length > 10,
              xAxisIndex: 0,
              bottom: '10%',
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
          '#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641', '#2c7bb6'
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
        this.topCategories = this.processedData.categories.slice(0, 10);
        
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
        const star = "path://M50 15 L61 35 L85 35 L66 50 L75 72 L50 60 L25 72 L34 50 L15 35 L39 35 Z";
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
    height: 80vh;
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
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: 1px solid #666;
    border-radius: 4px;
    cursor: pointer;
  }
  
  select {
    min-width: 120px;
  }
  </style>