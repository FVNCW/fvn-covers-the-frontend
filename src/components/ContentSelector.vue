<script setup lang="ts">
import { ref, watch } from "vue";
import {
    api,
    type Character,
    type ContentType,
    type Illustration,
    type Specy,
    type TextureObject,
} from "@/engine/api";

type Content = Character | TextureObject | Illustration | Specy;

const props = defineProps<{
    type: ContentType;
}>();
const model = defineModel<Content | null>({ default: null });

const keyword = ref("");
const items = ref<Content[]>([]);
const loading = ref(false);
const error = ref("");

function label(item: Content): string {
    if (props.type === "object") return (item as TextureObject).id;
    return (item as Character | Illustration | Specy).displayName;
}
function idOf(item: Content): string {
    return String((item as { id: number | string }).id);
}

async function loadAll(): Promise<Content[]> {
    switch (props.type) {
        case "character":
            return await api.characterList();
        case "object":
            return await api.objectList();
        case "illustration":
            return await api.illustrationList();
        case "specy":
            return await api.specyList();
    }
}

async function search() {
    const kw = keyword.value.trim();
    if (!kw) {
        items.value = await loadAll();
        return;
    }
    items.value = await api.search(props.type, {
        type: "equal",
        fieldType: ["string&array"],
        filter: { key: null, "string&array": { mode: "include", value: kw } },
    });
}

async function refresh() {
    loading.value = true;
    error.value = "";
    try {
        await search();
    } catch (e) {
        error.value = String(e);
    } finally {
        loading.value = false;
    }
}

watch(
    () => props.type,
    () => {
        keyword.value = "";
        model.value = null;
        refresh();
    },
);
refresh();

function onSelect(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    model.value = items.value.find((item) => idOf(item) === id) ?? null;
}
</script>
<template>
    <div class="content-selector">
        <input v-model="keyword" placeholder="输入关键词搜索" @keyup.enter="refresh" />
        <button :disabled="loading" @click="refresh">搜索</button>
        <select :value="model ? idOf(model) : ''" @change="onSelect">
            <option value="" disabled>请选择</option>
            <option v-for="item in items" :key="idOf(item)" :value="idOf(item)">
                {{ label(item) }}
            </option>
        </select>
        <span v-if="error" class="error">{{ error }}</span>
    </div>
</template>
<style scoped>
.content-selector {
    display: flex;
    gap: 8px;
    align-items: center;
}

.error {
    color: #d33;
}
</style>
