<template>
  <div class="product mt-4">
    <div class="container mx-auto">
      <div class="grid grid-cols-7 gap-8">
        <div class="col-span-2">
          <img :src="img"
            class="w-full h-64 object-cover rounded-lg" />
        </div>
        <div class="col-span-5">
          <h2 class="text-4xl font-bold mb-4">Online stores</h2>
          <div class="bg-white rounded p-4">
            <table class="table-auto w-full">
              <thead>
                <tr>
                  <th class="text-left">Origin</th>
                  <th class="text-left">Original price</th>
                  <th class="text-left">Price (in CHF)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="seller in sellers" :key="seller._id">
                  <td>{{ seller.origin }}</td>
                  <td>{{ seller.price }} {{ seller.currency }}</td>
                  <td>{{ chfPrice(seller) }} CHF</td>
                  <td class="text-right">
                    <a :href="seller.href" target="_blank" class="text-blue-700">View product</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import currencies from '../assets/currencies.json';

export default {
  async mounted() {
    fetch(`${process.env.VUE_APP_SERVER_URL}/product?picture=${this.$route.params.hash}`).then((res) => res.json()).then((res) => {
      this.sellers = res;
    });
  },
  data() {
    return {
      sellers: [],
    };
  },
  methods: {
    chfPrice(seller) {
      if (!(seller.currency in currencies.rates)) return '-';
      const dollars = parseFloat(seller.price) / currencies.rates[seller.currency];
      return Math.round((dollars * currencies.rates.CHF) * 100) / 100;
    },
  },
  computed: {
    img() {
      return atob(this.$route.params.hash);
    },
  },
};
</script>
