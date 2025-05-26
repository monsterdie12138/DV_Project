<template>
    <div class="chart-container">
        <div ref="chart"></div>
    </div>
</template>

<script>

import * as echarts from "echarts";
import rawData from "@/assets/data.json";

export default {

name:"StackChart",

data() {
    return {
        ratingIntervals: [],  //对象数组：评分区间
        categoryNames: [],    //字符串数组：类别名
        stackedBarData: {},   //保存各评分区间在各类别下的计数数据
        finalData: [],        //堆叠柱状图数据
        averageRatings: [],   //浮点数数组：每个类型平均评分
        chart: null
    };
},

methods: {

    //产生评分区间
    generateIntervals() {
        let intervals = [];
        let min, max;
        for (let i = 1.0; i < 4.0; i += 0.5) {
            min = parseFloat(i.toFixed(1));
            max = parseFloat((i + 0.5).toFixed(1));
            intervals.push({label: `${min}-${max}`, min: min, max: max});
        }
        for (let i = 4.0; i < 5.0; i += 0.2) {
            min = parseFloat(i.toFixed(1));
            max = parseFloat((i + 0.2).toFixed(1));
            intervals.push({label: `${min}-${max}`, min: min, max: max});
        }
        return intervals;
    },

    //根据评分得到对应区间
    findInterval(rating) {
        let min;
        let max;
        if (rating < 4.0) {
            min = parseFloat((Math.floor(rating / 0.5) * 0.5).toFixed(1));
            max = parseFloat((min + 0.5).toFixed(1));
        }
        else if (rating < 5.0) {
            min = parseFloat((Math.floor(rating / 0.2) * 0.2).toFixed(1));
            max = parseFloat((min + 0.2).toFixed(1));
        }
        else {
            min = 4.8;
            max = 5.0;
        }
        return `${min}-${max}`;
    },

    //根据区间最小值得到对应颜色
    getIntervalColor(min) {
        let ratio, R, G, B;
        if (min < 4.0) {
            ratio = (min - 1) / 3.0;
            R = Math.round(217 * (1 - ratio));
            G = Math.round(179 * (1 - ratio));
            B = Math.round(179 * (1 - ratio));
            return "#" + R.toString(16).padStart(2, "0") + G.toString(16).padStart(2, "0") + B.toString(16).padStart(2, "0");
        } else if (min == 4.0) {
            return "#000000";
        } else {
            ratio = (min - 4.1) / 0.6;
            R = Math.round(149 * ratio);
            G = Math.round(202 * ratio);
            B = Math.round(202 * ratio);
            return "#" + R.toString(16).padStart(2, "0") + G.toString(16).padStart(2, "0") + B.toString(16).padStart(2, "0");
        }
    }
},

created() {
    //生成评分区间
    this.ratingIntervals = this.generateIntervals();

    //为每个评分区间初始化计数对象
    for (const interval of this.ratingIntervals) {
        this.$set(this.stackedBarData, interval.label, {});
    }

    let categoryCnt = {}; //每个类别的计数
    let categorySum = {}; //每个类别的评分总和
    let categoryAvg = {}; //每个类别的平均评分

    //遍历原始数据，根据 Category 与 Rating 统计数据
    for (const tuple of rawData) {
        let category = tuple.Category;
        let rating = parseFloat(tuple.Rating);
        let label = this.findInterval(rating);
        if (isNaN(rating)) continue;

        //新类别初始化
        if (!this.categoryNames.includes(category)) {
            this.categoryNames.push(category);
            for (const interval of this.ratingIntervals) {
                this.$set(this.stackedBarData[interval.label], category, 0);
            }
            categoryCnt[category] = 0;
            categorySum[category] = 0;
        }

        //更新相关计数
        this.stackedBarData[label][category]++;
        categoryCnt[category]++;
        categorySum[category] += rating;
    }

    //计算平均评分
    for (const category of this.categoryNames) {
        categoryAvg[category] = parseFloat((categorySum[category] / categoryCnt[category]).toFixed(2));
    }

    //按平均评分降序排列
    this.categoryNames.sort((a, b) => categoryAvg[b] - categoryAvg[a]);
    this.averageRatings = this.categoryNames.map((category) => categoryAvg[category]);

    //构造堆叠柱状图数据
    let finalData = this.ratingIntervals.map((interval) => {
        return {
            name: interval.label,
            type: "bar",          //柱状图
            stack: "total",       //堆叠
            barWidth: "50%",
            itemStyle: {color: this.getIntervalColor(interval.min)},
            data: this.categoryNames.map((category) => parseFloat((((this.stackedBarData[interval.label][category]) / categoryCnt[category]) * 100).toFixed(1))), //对于每个区间，计算每个类别的比例
        };
    });

    //反转区间顺序，使得高分区间显示在下方
    this.finalData = finalData.reverse();
},

mounted() {

    //初始化图表
    this.chart = echarts.init(this.$refs.chart);

    //画一颗五角星
    const star = "path://M50 15 L61 35 L85 35 L66 50 L75 72 L50 60 L25 72 L34 50 L15 35 L39 35 Z";

    //图表相关设置
    const option = {

        tooltip: { //提示框
            trigger: "axis", //鼠标移动到对应位置触发
            axisPointer: {type: "shadow"}, //阴影
            formatter: function (params) {  //文本内容：分上下讨论，类别名加粗
                let text;
                text = `<b>${params[0].axisValue}</b><br/>`;
                if (params[0].seriesType === "pictorialBar") {
                    for (const item of params) {
                        if (item.seriesName == "Average Rating") {
                            text += `${item.seriesName}: ${item.value}<br/>`;
                        }
                    }
                }
                else {
                    for (const item of params) {
                        text += `${item.seriesName}: ${item.value}%<br/>`;
                    }
                }
                return text;
            },
        },

        legend: { //图例
            orient: 'vertical', //垂直排列
            right: '5%',
            top: 'center',
            data: this.ratingIntervals.map((interval) => interval.label).concat(["Average Rating"]), //文本内容
            textStyle: {color: '#ffffff'}, //白色
        },

      grid: [ //网格布局
        {
          //上部：显示星级平均评分
          top: "30%",
          left: "5%",
          right: "20%",
          height: "15%",
        },
        {
          //下部：显示堆叠柱状图
          top: "45%",
          left: "5%",
          right: "20%",
          bottom: "35%",
        },
      ],

      xAxis: [ //横轴
        {
          //上部：
          type: "category", //类别轴
          gridIndex: 0, //对应0号网格
          data: this.categoryNames,
          axisTick: {alignWithLabel: true}, //刻度线与横轴标签对齐
          axisLabel: {show: false}, //不显示标签
        },
        {
          //下部：
          type: "category",
          gridIndex: 1,
          data: this.categoryNames,
          axisTick: {alignWithLabel: true},
          axisLabel: {
              rotate: 45,       //旋转45°
              color: "#ffffff"  //白色
          },
        },
      ],

      yAxis: [
        {
          //上部：
          type: "value", //数值轴
          gridIndex: 0,
          max: 5,
          axisLine: {show: false},
          axisTick: {show: false},
          axisLabel: {show: false},
          splitLine: {show: false},
        },
        {
          //下部：
          type: "value",
          gridIndex: 1,
          max: 100,
          axisLabel: {
              formatter: "{value}%",
              color: "#ffffff"
          },
        },
      ],

      series: [
        // 上部星级背景
        {
          name: "Star Background",
          type: "pictorialBar", //图形替换传统柱状图
          xAxisIndex: 0,
          yAxisIndex: 0,
          gridIndex: 0,
          symbol: star, //用星形符号
          symbolRepeat: "fixed",
          symbolMargin: 2, //星星之间的间隔
          symbolSize: [20, 20], //星星的大小
          data: this.categoryNames.map(() => 5), 
          itemStyle: {color: "#333333"}, //颜色
          z: 3, //底层
        },
        // 上部星级前景
        {
          name: "Average Rating",
          type: "pictorialBar",
          xAxisIndex: 0,
          yAxisIndex: 0,
          gridIndex: 0,
          symbol: star,
          symbolRepeat: "fixed",
          symbolMargin: 2,
          symbolSize: [20, 20],
          symbolClip: true, //对数据进行裁剪
          data: this.categoryNames.map((category, index) => this.averageRatings[index]),
          itemStyle: {color: "#ffffff"},
          z: 4,
        },
        // 下部堆叠柱状图
        ...this.finalData.map((s) => Object.assign({}, s, {xAxisIndex: 1, yAxisIndex: 1, gridIndex: 1})),
      ],
    };

    //应用
    this.chart.setOption(option);
  },
};
</script>

<style scoped>
.chart-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
}
.chart-container > div {
    width: 100%;
    height: 100%;
}
</style>