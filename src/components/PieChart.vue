<template>
  <div class="chart-container"> <!--用css类chart-container来展示这个元素-->
    <div ref="chart"></div> <!--定义一块名叫chart的区域，具体内容由script决定-->
  </div>
</template>

<script>
import * as echarts from 'echarts'; //引入echarts
import rawData from '@/assets/data.json'; //引入data

export default {
  data() {  //data()返回组件初始状态，包含需要响应式维护的元数据
    return {
      pieChart: null,  //存储echarts图表实例
      pieData: [] //存储绘制饼图的数据
    };
  },
  mounted() { //mounted()包含一系列初始化操作
    this.dataInit(); //数据初始化
    this.chartInit(); //图表初始化
  },
  methods: {
    dataInit() {
      let categoryCounts = {}; //记录每个种类的数量
      for (let item of rawData) { //遍历每个元组，对应种类的数量+1
        if (categoryCounts[item.Category]) {
          categoryCounts[item.Category] += 1;
        }
        else {
          categoryCounts[item.Category] = 1;
        }
      };
      let categoryNames = Object.keys(categoryCounts); //获得所有种类名
      for (let item of categoryNames) { //将每组数据添加到元数据中（种类名+对应数量）
        let newData = {name: item, value: categoryCounts[item]};
        this.pieData.push(newData);
      }
    },
    chartInit() {
      let categoryNames=[]; //获得所有种类名
      for (let item of this.pieData) {
        if (!categoryNames.includes(item.name)) {
          categoryNames.push(item.name);
        }
      }
      let mid = Math.ceil(categoryNames.length / 2); //获得种类数的中间值并取整
      const option = {
        series: [{ //图表本身
          type: 'pie', //饼图
          data: this.pieData, //数据
          radius: ['30%', '60%'], //内径和外径
          center: ['30%', '50%'], //水平位置和垂直位置
          roseType: 'area', //玫瑰图
          label: { //标签
            color: '#fff'
          },
          emphasis: { //鼠标悬停或选中的高亮效果
            itemStyle: {
              shadowBlur: 15, //悬停时阴影模糊程度
              shadowOffsetX: 0, //阴影在水平方向上的偏移量
              shadowColor: 'rgba(0, 0, 0, 1)' //黑色
            }
          }
        }],
        tooltip: {  //提示框
          trigger: 'item', //提示框触发方式：悬停
          formatter: '{b}: number={c} ({d}%)' //内容，b为name，c为value，d为百分比
        },
        legend: [ //图例
          {
            orient: 'vertical', //排列方式
            right: '20%', //从右侧偏移
            top: '30%', //从上侧偏移
            data: categoryNames.slice(0, mid), //图例文本
            textStyle: {
              color: '#fff' //颜色
            }
          },
          {
            orient: 'vertical',
            right: '5%',
            top: '30%',
            data: categoryNames.slice(mid),
            textStyle: {
              color: '#fff'
            }
          }
        ]
      };
      this.pieChart = echarts.init(this.$refs.chart); //初始化
      this.pieChart.setOption(option); //应用对象到实例
    }
  }
};
</script>

<style>
.chart-container { /*容器占页面比例*/
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
.chart-container > div { /*容器内部内容占容器比例*/
  width: 100%;
  height: 100%;
}
</style>