<template>
  <div class="category-detail">
    <h1>{{ categoryName }} - 详细信息</h1>
    
    <div class="table-container" v-if="categoryInfo.length > 0" @mouseover="pauseScroll" @mouseout="resumeScroll">
      <table class="category-table">
        <thead>
          <tr>
            <th>App</th>
            <th>Rating</th>
            <th>Reviews</th>
            <th>Size</th>
            <th>Installs</th>
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
            <td>{{ item.Installs }}</td>
            <td>{{ item.Type }}</td>
            <td>{{ item.Price }}</td>
          </tr>
          <tr v-for="(item, index) in categoryInfo" :key="'copy-'+index">
            <td>{{ item.App }}</td>
            <td>{{ item.Rating }}</td>
            <td>{{ item.Reviews }}</td>
            <td>{{ item.Size }}</td>
            <td>{{ item.Installs }}</td>
            <td>{{ item.Type }}</td>
            <td>{{ item.Price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import rawData from '@/assets/data.json';

export default {
  props: ['categoryName'],
  data() {
    return {
      categoryInfo: [],
      scrollSpeed: 40,
      scrollInterval: null,
      isScrolling: true
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
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

h1 {
  color: #ffffff; 
  margin-bottom: 20px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.table-container {
  width: 50%;
  height: 600px;
  overflow-y: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1); /* 半透明白色边框 */
  border-radius: 8px;
  margin-top: 20px;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
  backdrop-filter: blur(5px); /* 毛玻璃效果 */
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
  background-color: rgba(8, 10, 111, 0.8); /* 与背景渐变协调的蓝色 */
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  font-weight: bold;
}

.category-table tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05); /* 极浅的透明白色 */
}

.category-table tr:nth-child(odd) {
  background-color: rgba(0, 0, 0, 0.2); /* 透明黑色 */
}

.category-table tr:hover {
  background-color: rgba(8, 10, 111, 0.4); /* 悬停时的蓝色 */
  transition: all 0.3s ease;
}

.category-table td {
  color: #ffffff; /* 白色文字 */
  font-weight: 500;
}
</style>