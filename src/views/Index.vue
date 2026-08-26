<script setup lang="ts">
import router from "@/router";
import { auth } from "@/engine/app";
import { onMounted, ref } from "vue";
import type { DataTableColumns } from "naive-ui";
import { h } from "vue";
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

const characterColumns: DataTableColumns<Character> = [
    { title: "ID", key: "id" },
    { title: "名字", key: "displayName" },
    { title: "身高", key: "height" },
    {
        title: "性别",
        key: "isFemale",
        render: (row) => (row.isFemale ? "女性" : "男性"),
    },
    {
        title: "操作",
        key: "actions",
        render: (row) =>
            h(
                "div",
                { style: "cursor: pointer" },
                [
                    h(
                        "span",
                        {
                            style: "color:#18a058;cursor:pointer",
                            onClick: () => router.push(`/character/${row.id}`),
                        },
                        "详情",
                    ),
                    h(
                        "span",
                        {
                            style: "margin-left:12px;color:#d03050;cursor:pointer",
                            onClick: (e: { stopPropagation: () => void }) => {
                                e.stopPropagation();
                                deleteCharacter(row.id);
                            },
                        },
                        "删除",
                    ),
                ],
            ),
    },
];

const specyColumns: DataTableColumns<Specy> = [
    { title: "ID", key: "id" },
    { title: "名字", key: "displayName" },
    {
        title: "父物种",
        key: "parents",
        render: (row) => row.parents.join("、") || "根",
    },
];
</script>
<template>
    <div>
        <nav>
            <template v-if="sessionLoading"> 正在加载 </template>
            <template v-else-if="session">
                已登录：{{ session.user.name }}
                <n-button size="small" @click="router.push('/submit')">投稿</n-button>
                <n-button size="small" @click="router.push('/specy')">物种管理</n-button>
                <n-button size="small" @click="router.push('/illustration')">立绘/对象</n-button>
                <n-button size="small" type="error" @click="signOut()">退出登录</n-button>
            </template>
            <template v-else>
                <n-button size="small" @click="router.push('/register')">注册</n-button>
                <n-button size="small" type="primary" @click="router.push('/login')">登录</n-button>
            </template>
        </nav>

        <n-text type="error">{{ notice }}</n-text>

        <n-card title="今日抽卡" size="small" style="margin-top: 12px">
            <template v-if="today">
                <n-space vertical>
                    <n-text>{{ today.displayName }}</n-text>
                    <n-text>身高：{{ today.height }}</n-text>
                    <n-text>性别：{{ today.isFemale ? "女性" : "男性" }}</n-text>
                    <n-text>已故：{{ today.isDied ? "是" : "否" }}</n-text>
                    <n-text>标签：{{ today.tags.join("、") }}</n-text>
                    <n-text>人格：{{ today.information.personality }}</n-text>
                    <n-button size="small" type="primary" @click="router.push(`/character/${today.id}`)">
                        查看详情
                    </n-button>
                </n-space>
            </template>
            <n-text v-else>暂无角色</n-text>
        </n-card>

        <n-card title="角色列表" size="small" style="margin-top: 12px">
            <n-data-table :columns="characterColumns" :data="characters" :bordered="false" />
        </n-card>

        <n-card title="物种列表" size="small" style="margin-top: 12px">
            <n-data-table :columns="specyColumns" :data="specys" :bordered="false" />
        </n-card>
    </div>
</template>
<style scoped>
nav {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    padding: 8px 0;
}
</style>
