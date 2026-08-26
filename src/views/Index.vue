<script setup lang="ts">
import router from "@/router";
import { auth } from "@/engine/app";
import { onMounted, ref } from "vue";
import { api, type Character, type Specy } from "@/engine/api";
const sessionLoading = ref(true);
const session = ref<{ user: { name: string } } | null>(null);
const today = ref<Character | null>(null);
const characters = ref<Character[]>([]);
const specys = ref<Specy[]>([]);
const notice = ref("");
async function refresh() {
    today.value = (await api.characterToday()) ?? null;
    characters.value = await api.characterList();
    specys.value = await api.specyList();
}
async function signOut() {
    await auth.signOut();
    session.value = null;
    sessionLoading.value = false;
}
async function deleteCharacter(id: number) {
    try {
        await api.characterDelete(id);
        notice.value = "已删除角色 " + id;
        characters.value = await api.characterList();
    } catch (e) {
        notice.value = String(e) + "（需要登录）";
    }
}
onMounted(async () => {
    const s = await auth.getSession();
    session.value = s.data ?? null;
    sessionLoading.value = false;
    refresh().catch((e) => (notice.value = String(e)));
});
</script>
<template>
    <div>
        <nav>
            <template v-if="sessionLoading"> 正在加载 </template>
            <template v-else-if="session">
                已登录：{{ session.user.name }}
                <button @click="router.push('/submit')">投稿</button>
                <button @click="router.push('/specy')">物种管理</button>
                <button @click="router.push('/illustration')">立绘/对象</button>
                <button @click="signOut()">退出登录</button>
            </template>
            <template v-else>
                <button @click="router.push('/register')">注册</button>
                <button @click="router.push('/login')">登录</button>
            </template>
        </nav>

        <p>{{ notice }}</p>

        <h2>今日抽卡</h2>
        <template v-if="today">
            <div>{{ today.displayName }}</div>
            <div>身高：{{ today.height }}</div>
            <div>性别：{{ today.isFemale ? "女性" : "男性" }}</div>
            <div>已故：{{ today.isDied ? "是" : "否" }}</div>
            <div>标签：{{ today.tags.join("、") }}</div>
            <div>人格：{{ today.information.personality }}</div>
        </template>
        <template v-else>暂无角色</template>

        <h2>角色列表</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>名字</th>
                    <th>身高</th>
                    <th>性别</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in characters" :key="c.id" class="row" @click="router.push(`/character/${c.id}`)">
                    <td>{{ c.id }}</td>
                    <td>{{ c.displayName }}</td>
                    <td>{{ c.height }}</td>
                    <td>{{ c.isFemale ? "女性" : "男性" }}</td>
                    <td>
                        <button @click.stop="deleteCharacter(c.id)">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <h2>物种列表</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>名字</th>
                    <th>父物种</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="s in specys" :key="s.id">
                    <td>{{ s.id }}</td>
                    <td>{{ s.displayName }}</td>
                    <td>{{ s.parents.join("、") || "根" }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
.row {
    cursor: pointer;
}
.row:hover {
    background: #f4f7ff;
}
</style>
