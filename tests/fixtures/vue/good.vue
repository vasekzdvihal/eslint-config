<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();
defineEmits<{ change: [value: string] }>();
</script>

<template>
  <h1>{{ title }}</h1>
</template>

<style scoped>
h1 {
  color: black;
}
</style>
