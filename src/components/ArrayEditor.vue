<script setup lang="ts">
import { ref, watch } from "vue";

const model = defineModel<(string | number)[]>({ required: true });
const props = defineProps<{
    type?: "string" | "number";
}>();

const items = ref<string[]>(model.value.map(String));

watch(model, (v) => {
    items.value = v.map(String);
});

function commit() {
    const cleaned = items.value.map((x) => x.trim()).filter(Boolean);
    model.value = props.type === "number" ? cleaned.map(Number) : cleaned;
}

function add() {
    items.value.push("0");
    commit();
}

function changeAt(i: number, v: string) {
    items.value[i] = v;
    commit();
}

function removeAt(i: number) {
    items.value.splice(i, 1);
    commit();
}
</script>
<template>
    <div style="display: flex; flex-direction: column; gap: 8px">
        <div v-for="(item, i) in items" :key="i" style="display: flex; gap: 8px; align-items: center">
            <n-input
                :type="type === 'number' ? 'number' : 'text'"
                :value="item"
                style="width: 200px"
                @update:value="changeAt(i, String($event))"
            />
            <n-button size="small" type="error" quaternary @click="removeAt(i)">删除</n-button>
        </div>
        <n-button size="small" @click="add">添加</n-button>
    </div>
</template>