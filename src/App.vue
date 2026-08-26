<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { auth } from "@/engine/app";

const router = useRouter();
const authState = auth.useSession();
const session = computed(() => authState.value?.data ?? null);
const sessionLoading = computed(() => authState.value?.isPending ?? true);

async function signOut() {
    await auth.signOut();
}
</script>
<template>
    <n-message-provider>
        <n-layout position="static">
            <n-layout-header bordered style="padding: 12px 16px">
                <div
                    style="
                        max-width: 960px;
                        margin: 0 auto;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    "
                >
                    <n-button size="small" @click="router.push('/')">回到主页</n-button>
                    <template v-if="sessionLoading">
                        <n-text>正在加载</n-text>
                    </template>
                    <template v-else-if="session">
                        <n-text>已登录：{{ session.user.name }}</n-text>
                        <n-button size="small" @click="router.push('/submit')">投稿</n-button>
                        <n-button size="small" @click="router.push('/specy')">物种管理</n-button>
                        <n-button size="small" @click="router.push('/illustration')"
                            >立绘/对象</n-button
                        >
                        <n-button size="small" type="error" @click="signOut()">退出登录</n-button>
                    </template>
                    <template v-else>
                        <n-button size="small" @click="router.push('/register')">注册</n-button>
                        <n-button size="small" type="primary" @click="router.push('/login')"
                            >登录</n-button
                        >
                    </template>
                </div>
            </n-layout-header>
            <n-layout-content style="padding: 16px">
                <div style="max-width: 960px; margin: 0 auto; text-align: center">
                    <RouterView />
                </div>
            </n-layout-content>
        </n-layout>
    </n-message-provider>
</template>
