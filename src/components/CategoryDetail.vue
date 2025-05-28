<template>
  <div class="category-detail">
    <div style="display: flex; align-items: flex-start; gap: 40px;">
      <!-- 左侧：分类信息和表格 -->
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <img 
            :src="urlFind(categoryName)" 
            :alt="categoryName" 
            style="width: 100px; height: 100px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);" 
          />
          <h1 style="margin: 0;">{{ categoryName }} - Details</h1>
        </div>

        <div class="table-container" v-if="categoryInfo.length > 0" @mouseover="pauseScroll" @mouseout="resumeScroll">
          <table class="category-table">
            <thead>
              <tr>
                <th>App</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Size</th>
                <!-- <th>Installs</th> -->
                <th>Type</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody ref="scrollContent">
              <tr v-for="(item, index) in categoryInfo" :key="index">
                <td>{{ item.App }}</td>
                <td>{{ item.Rating }}</td>
                <td>{{ item.Reviews }}</td>
                <td>{{ item.Size }}</td>
                <!-- <td>{{ item.Installs }}</td> -->
                <td>{{ item.Type }}</td>
                <td>{{ item.Price }}</td>
              </tr>
              <tr v-for="(item, index) in categoryInfo" :key="'copy-'+index">
                <td>{{ item.App }}</td>
                <td>{{ item.Rating }}</td>
                <td>{{ item.Reviews }}</td>
                <td>{{ item.Size }}</td>
                <!-- <td>{{ item.Installs }}</td> -->
                <td>{{ item.Type }}</td>
                <td>{{ item.Price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 20px; margin-top: 20px;">
          <button @click="changeChart('ScatterChart')" style="margin-top: 40px; margin-left: 20px;padding: 10px 20px; border: none; background-color: #3f51b5; color: white; border-radius: 20px; cursor: pointer;">Scatter Chart</button>
          <button @click="changeChart('PaidVsFree')" style="margin-top: 40px; margin-left: 20px;padding: 10px 20px; border: none; background-color: #3f51b5; color: white; border-radius: 20px; cursor: pointer;">Paid Vs Free</button>
          <button @click="changeChart('BoxChart')" style="margin-top: 40px; margin-left: 20px;padding: 10px 20px; border: none; background-color: #3f51b5; color: white; border-radius: 20px; cursor: pointer;">Box Chart</button>
        </div>
        <div class="rightchart-container" >
          <component :is="currentChart" :data="categoryInfo" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import rawData from '@/assets/data.json';
import ScatterChart from './ScatterChart.vue';
import PaidVsFree from './PaidVsFree.vue';
import BoxChart from './BoxChart.vue';

export default {
  components: {
    ScatterChart,
    PaidVsFree,
    BoxChart
  },
  props: ['categoryName'],
  data() {
    return {
      categoryInfo: [],
      scrollSpeed: 40,
      scrollInterval: null,
      isScrolling: true,
      currentChart: 'ScatterChart'
    };
  },
  created() {
    this.filterCategoryData();
  },
  mounted() {
    if (this.categoryInfo.length > 0) {
      this.startAutoScroll();
    }
  },
  beforeDestroy() {
    this.stopAutoScroll();
  },
  methods: {
    filterCategoryData() {
      this.categoryInfo = rawData.filter(item => item.Category === this.categoryName);
      if (this.categoryInfo.length === 0) {
        console.log('没有找到该类别的数据');
      }
    },
    changeChart(chartType) {
      this.currentChart = chartType;  
    },
    urlFind(category) {
      try {
        return new URL(`/src/assets/img/${category}.jpg`, import.meta.url).href;
      } catch (error) {
        console.error('加载图片失败:', error);
        return new URL('/src/assets/img/background.jpg', import.meta.url).href;
      }
    },
    startAutoScroll() {
      const container = this.$el.querySelector('.table-container');
      const content = this.$refs.scrollContent;

      container.scrollTop = 0;

      if (content.scrollHeight <= container.clientHeight) {
        return;
      }

      this.scrollInterval = setInterval(() => {
        if (!this.isScrolling) return;

        container.scrollTop += 1;

        if (container.scrollTop >= content.scrollHeight / 2) {
          container.scrollTop = 0;
        }
      }, 1000 / this.scrollSpeed);
    },
    stopAutoScroll() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    },
    pauseScroll() {
      this.isScrolling = false;
    },
    resumeScroll() {
      this.isScrolling = true;
    }
  },
  watch: {
    categoryInfo(newVal) {
      if (newVal.length > 0) {
        this.$nextTick(() => {
          this.stopAutoScroll();
          this.startAutoScroll();
        });
      }
    }
  }
};
</script>

<style scoped>
.category-detail {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: transparent;
}

h1 {
  color: #ffffff;
  margin-bottom: 20px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.table-container {
  width: 100%;
  height: 600px;
  overflow-y: scroll; 
  scrollbar-width: thin; 
  scrollbar-color: rgba(255,255,255,0.3) transparent;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 20px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}
.rightchart-container {
  width: 100%;
  height: 600px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-top: 25px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.category-table {
  width: 100%;
  border-collapse: collapse;
}

.category-table th,
.category-table td {
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.category-table th {
  background-color: rgba(8, 10, 111, 0.8);
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  font-weight: bold;
}

.category-table tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05);
}

.category-table tr:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.2);
}

.category-table tr:hover {
  background-color: rgba(8, 10, 111, 0.4);
  transition: all 0.3s ease;
}

.category-table td {
  color: #ffffff;
  font-weight: 500;
}
</style>
