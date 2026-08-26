<script setup lang="ts">
import { ref } from "vue";
import { auth } from "@/engine/app";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);

async function apply() {
    loading.value = true;
    try {
        const response = await auth.signUp.email({
            email: email.value,
            password: password.value,
            name: username.value,
        });
        if (response.error) {
            if (response.error.status !== 200) {
                throw response.error.message;
            }
        } else {
            window.message?.success("注册成功！");
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
    <n-card title="注册" style="max-width: 360px; margin: 40px auto">
        <n-space vertical>
            <n-input v-model:value="username" type="text" placeholder="用户名" />
            <n-input v-model:value="email" type="text" placeholder="邮箱" />
            <n-input
                v-model:value="password"
                type="password"
                placeholder="密码"
                @keyup.enter="apply"
            />
            <n-button type="primary" block :loading="loading" @click="apply">注册</n-button>
        </n-space>
    </n-card>
</template>
