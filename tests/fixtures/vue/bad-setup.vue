<template>
  <img src="/logo.png">
  <div @click="$emit('save')">
    {{ label }}
  </div>
  <span ref="unusedBox">static</span>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [] }>();
const props = defineProps<{ label: string }>();
</script>
