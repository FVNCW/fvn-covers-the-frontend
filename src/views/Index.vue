<script setup lang="ts">
import router from "@/router";
import { auth } from "@/engine/app";
import { onMounted } from "vue";
import { useAsyncData } from "@/composables/useAsyncData";

let {
    loading: sessionLoading,
    data: session,
    push: sessionPush,
} = useAsyncData<typeof auth.$Infer.Session | null>();

onMounted(async () => {
    sessionPush(auth.getSession(), (e) => e.data);
});
</script>
<template>
    <template v-if="sessionLoading"> 正在加载 </template>
    <template v-else>
        <template v-if="session">
            已登录：{{ session.user.name }}
            <button @click="router.push('/submit')">投稿</button>
            <button @click="auth.signOut()">退出登录</button>
        </template>
        <template v-else>
            <button @click="router.push('/register')">注册</button>
            <button @click="router.push('/login')">登录</button>
        </template>
    </template>
</template>
