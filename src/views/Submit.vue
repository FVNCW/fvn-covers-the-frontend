<script setup lang="ts">
import { authorizableFetch } from '@/engine/util/api';
import { ref } from 'vue';

const displayName = ref("");
const persona = ref("");

async function submit() {
	const response = await authorizableFetch("/api/submit", "post", {
		display_name: displayName.value,
		personality: persona.value
	});
	const data = await response.text();
	console.log(data);
}
</script>
<template>
	<input type="text" v-model="displayName">
	<textarea v-model="persona"></textarea>
	<button @click="submit">提交</button>
</template>