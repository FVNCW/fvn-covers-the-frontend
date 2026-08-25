<script setup lang="ts">
import { ref } from 'vue';
import { auth } from "@/engine/app";

const username = ref("");
const email = ref("");
const password = ref("");

async function apply() {
	console.log(await auth.signUp.email({
		email: email.value,
		password: password.value,
		name: username.value
	}));
}
</script>
<template>
	<div>
		<input type="text" v-model="username">
		<input type="text" v-model="email">
		<input type="text" v-model="password">
		<button @click="apply">注册</button>
	</div>
</template>