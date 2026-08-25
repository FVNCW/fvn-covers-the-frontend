<script setup lang="ts">
import router from "@/router";
import { auth } from "@/engine/app";
import { onMounted } from "vue";

let session: typeof auth.$Infer.Session;

onMounted(async () => {
	session = (await auth.getSession()).data!;
	console.log(session);
});
</script>
<template>
	<template v-if="session">
		已登录：{{ session.user }}
	</template>
	<template v-else>
		<button @click="router.push('/register')">注册</button>
		<button @click="router.push('/login')">登录</button>
	</template>
</template>
