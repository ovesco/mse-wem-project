<template>
  <div class="home">
    <div class="container mx-auto mt-4">
      <div class="grid grid-cols-5 gap-4">
        <product-card v-for="product in products" :key="product.encoded" :img="product.picture"
          :count="product.count" :hash="product.encoded" />
      </div>
      <div class="flex justify-end mt-4">
        <button :disabled="page === 0" @click="page = page - 1"
          class="px-4 py-2 bg-blue-400 rounded text-white mr-4">Previous</button>
        <button @click="page = page + 1"
          class="px-4 py-2 bg-blue-400 rounded text-white">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from '../components/ProductCard.vue';

export default {
  components: {
    ProductCard,
  },
  async mounted() {
    await this.refreshProducts();
  },
  data() {
    return {
      products: [],
      page: 0,
      totalCount: 0,
    };
  },
  watch: {
    async page() {
      await this.refreshProducts();
    },
  },
  methods: {
    async refreshProducts() {
      fetch(`${process.env.VUE_APP_SERVER_URL}/products?page=${this.page}&limit=10`).then((res) => res.json()).then(({ products, totalCount }) => {
        this.products = products;
        this.totalCount = totalCount;
      });
    },
  },
};
</script>
