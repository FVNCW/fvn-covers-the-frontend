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
    <div>
        <template v-for="(item, i) in items" :key="i">
            <input
                :type="type === 'number' ? 'number' : 'text'"
                :value="item"
                @input="changeAt(i, ($event.target as HTMLInputElement).value)"
                size="16"
            />
            <button @click="removeAt(i)">删除</button>
            <br />
        </template>
        <button @click="add">添加</button>
    </div>
</template>
