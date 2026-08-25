<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
    modelValue: (string | number)[];
    type?: "string" | "number";
}>();

const emit = defineEmits<{
    (e: "update:modelValue", value: (string | number)[]): void;
}>();

const items = ref<string[]>(props.modelValue.map(String));

watch(
    () => props.modelValue,
    (v) => {
        items.value = v.map(String);
    },
);

function emitUpdate() {
    const cleaned = items.value.map((x) => x.trim()).filter(Boolean);
    emit(
        "update:modelValue",
        props.type === "number" ? cleaned.map(Number) : cleaned,
    );
}

function add() {
    items.value.push("");
    emitUpdate();
}

function changeAt(i: number, v: string) {
    items.value[i] = v;
    emitUpdate();
}

function removeAt(i: number) {
    items.value.splice(i, 1);
    emitUpdate();
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