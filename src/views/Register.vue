<script setup lang="ts">
import { ref } from "vue";
import { auth } from "@/engine/app";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const email = ref("");
const password = ref("");

async function apply() {
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
            alert("注册成功！");
            router.push("/");
        }
    } catch (e) {
        alert(e);
    }
}
</script>
<template>
    <div>
        <input type="text" v-model="username" />
        <input type="text" v-model="email" />
        <input type="text" v-model="password" />
        <button @click="apply">注册</button>
    </div>
</template>
