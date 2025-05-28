<template>
  <div class="dashboard-container">
    <div class="chart-wrapper">
      <div ref="pieChart" class="chart"></div>
    </div>
    <div class="chart-wrapper">
      <h class="main-title">2024 Google App Analysis</h>
      <StackedBarChart ref="stackChartRef" class="chart"/>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'; 
import rawData from '@/assets/data.json'; 
import StackedBarChart from '@/components/StackedBarChart.vue';


export default {
  name: 'PieChart',
  components: {
    StackedBarChart
  },
  data() {  
    return {
      pieChart: null,  //存储echarts图表实例
      pieData: [] //存储绘制饼图的数据
    };
  },
  mounted() {
    // console.log('PieChart mounted, StackChart should be:', this.$refs.stackChart);
  console.log('PieChart mounted, StackChart ref:', this.$refs.stackChartRef);
  this.$nextTick(() => {
    this.dataInit();
    this.chartInit();
    });
  } ,
  methods: {
    dataInit() {
      let categoryCounts = {}; 
      for (let item of rawData) {
        if (categoryCounts[item.Category]) {
          categoryCounts[item.Category] += 1;
        }
        else {
          categoryCounts[item.Category] = 1;
        }
      };
      let categoryNames = Object.keys(categoryCounts); 
      for (let item of categoryNames) {
        let newData = {name: item, value: categoryCounts[item]};
        this.pieData.push(newData);
      };
    },
    chartInit() {
      let categoryNames=[]; 
      for (let item of this.pieData) {
        if (!categoryNames.includes(item.name)) {
          categoryNames.push(item.name);
        }
      }
      let mid = Math.ceil(categoryNames.length / 2); 
      const logAdjustedData = this.pieData.map(item => ({
        name: item.name,
        value: Math.log10(item.value + 1) 
      }));
      const option = {
        series: [{ 
          type: 'pie', //饼图
          data: logAdjustedData, //数据
          radius: ['10%', '60%'], //内径和外径
          center: ['50%', '50%'], //水平位置和垂直位置
          roseType: 'area', //玫瑰图
          emphasis: {
            itemStyle: {
              shadowBlur: 20,          // 阴影模糊程度（增大更柔和）
              shadowOffsetX: 20,         // 水平偏移归零（避免分离感）
              shadowColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色阴影
              borderWidth: 3,           // 添加白色边框强化视觉
              borderColor: '#fff'
            },
            //缩放配置
            scale: true,               
            scaleSize: 30,      
          },
          label: {
            color: '#fff',
            formatter: params => { 
              const originalValue = this.pieData.find(d => d.name === params.name).value;
            },
          }
        }],
        tooltip: {
          formatter: params => {
            console.log("The name is :", params.name);
            const imageUrl = new URL(`../assets/img/${params.name}.jpg`, import.meta.url).href;
            console.log("the url = ", imageUrl);
            const originalValue = this.pieData.find(d => d.name === params.name).value;
            return `
            <div style="text-align: center; padding: 10px; height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <p style="color: #000; font-size: 16px; margin: 5px 0;">${params.name}</p>
              <p style="color: #000; font-size: 14px; margin: 5px 0;">Number: ${originalValue}</p>
              <p style="color: #fff; font-size: 14px; margin: 5px 0;">(${params.percent}%)</p>
              <img src="${imageUrl}" alt="${params.name}" style="width: 100px; height: 100px; border-radius: 10px; margin-top: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);" />
            </div>
              `;
          }
        }
      };
      this.pieChart = echarts.init(this.$refs.pieChart); 
      this.pieChart.setOption(option); 
      this.pieChart.on('click', (params) => {
        const clickedCategory = this.pieData.find(item => item.name === params.name);
        this.$router.push({
          name: 'Category',
          params: { categoryName: clickedCategory.name } 
        });
      });
    }
  }
};
</script>


<style>
.dashboard-container {
  display: flex;
  width: 100%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.chart-wrapper {
  flex: 1;
  min-width: 0; /* 防止 flex 项目溢出 */
  height: 100%;
  padding: 10px;
  background-color: rgba(5, 6, 33, 0.8);
  color: #ffffff;
}

.chart {
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.1); /* 添加背景便于调试 */
}
.main-title {
  font-size: 3rem;
  color: #ffffff;
  font-family: 'Roboto', sans-serif;
  margin-bottom: 20px;
  letter-spacing: 2px; /* 字间距 */
  text-transform: uppercase;
}
</style>