<template>
  <div class="chart-container"> 
    <div ref="chart"></div>   
  </div>
</template>

<script>
import * as echarts from 'echarts'; 
import rawData from '@/assets/data.json'; 

export default {
  data() {  
    return {
      pieChart: null,  //存储echarts图表实例
      pieData: [] //存储绘制饼图的数据
    };
  },
  mounted() { 
    this.dataInit();
    this.chartInit(); 
  },   
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
          center: ['30%', '50%'], //水平位置和垂直位置
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
            const originalValue = this.pieData.find(d => d.name === params.name).value;
            return `${params.name}: number: ${originalValue} (${params.percent}%)`;
          }
        }
      };
      this.pieChart = echarts.init(this.$refs.chart); 
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
.chart-container { /*容器占页面比例*/
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120vh;
  width: 120vw;
}
.chart-container > div { /*容器内部内容占容器比例*/
  width: 100%;
  height: 100%;
}
</style>