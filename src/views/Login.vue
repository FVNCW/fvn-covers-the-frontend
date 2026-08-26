<script setup lang="ts">
import { ref } from "vue";
import { auth } from "@/engine/app";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const password = ref("");
const loading = ref(false);

async function apply() {
    loading.value = true;
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
            window.message?.success("登录成功");
            router.push("/");
        }
    } catch (e) {
        window.message?.error(String(e));
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <n-card title="登录" style="max-width: 360px; margin: 40px auto">
        <n-space vertical>
            <n-input v-model:value="email" type="text" placeholder="邮箱" @keyup.enter="apply" />
            <n-input
                v-model:value="password"
                type="password"
                placeholder="密码"
                @keyup.enter="apply"
            />
            <n-button type="primary" block :loading="loading" @click="apply">登录</n-button>
        </n-space>
    </n-card>
</template>
