<script setup lang="ts">
const model = defineModel<string[]>({ default: () => [] });
function add() {
    model.value = [...model.value, "#808080"];
}
function remove(i: number) {
    model.value = model.value.filter((_, x) => x !== i);
}
function set(i: number, v: string) {
    const arr = [...model.value];
    arr[i] = v;
    model.value = arr;
}
</script>
<template>
    <div class="color-list">
        <n-text depth="3" style="font-size: 12px">多个颜色表示相间分布，按顺序依次出现</n-text>
        <div v-for="(c, i) in model" :key="i" class="color-row">
            <n-color-picker
                :value="c"
                :show-alpha="false"
                @update:value="(v: string) => set(i, v)"
            />
            <n-button quaternary size="small" @click="remove(i)">删除</n-button>
        </div>
        <n-button size="small" @click="add">添加颜色</n-button>
    </div>
</template>
<style scoped>
.color-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.color-row {
    display: flex;
    align-items: center;
    gap: 8px;
}
</style>
