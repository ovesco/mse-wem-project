<template>
  <div>
    <router-link :to="{ name: 'Product', params: { hash }}"
      class="block bg-white rounded overflow-hidden">
      <div class="h-48">
        <img :src="img" class="w-full h-full object-cover" />
      </div>
      <div class="p-4">
        <h1 class="text-center text-5xl font-bold">{{ count }}</h1>
        <h3 class="text-center text-xl text-gray-700">Online stores</h3>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  props: ['img', 'hash', 'count'],
};
</script>
