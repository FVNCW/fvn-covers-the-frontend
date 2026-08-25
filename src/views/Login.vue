<script setup lang="ts">
import { ref } from "vue";
import { auth } from "@/engine/app";

const email = ref("");
const password = ref("");

async function apply() {
	try {
		const response = await auth.signIn.email({
			email: email.value,
			password: password.value,
		});
		if (response.error) {
			if (response.error.status !== 200) {
				throw response.error.message;
			}
		} else {
			alert("登录成功");
		}
	} catch (e) {
		alert(e);
	}
}
</script>
<template>
	<div>
		<input type="text" v-model="email" />
		<input type="text" v-model="password" />
		<button @click="apply">登录</button>
	</div>
</template>
