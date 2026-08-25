<script setup lang="ts">
import { onMounted, ref } from "vue";
import ArrayEditor from "@/components/ArrayEditor.vue";
import { api, type Specy } from "@/engine/api";

const displayName = ref("");
const parents = ref<number[]>([]);
const specys = ref<Specy[]>([]);
const notice = ref("");

const mixInput = ref<number[]>([]);
const mixResult = ref<{ a: number; b: number }[] | null>(null);

async function create() {
    try {
        await api.specyCreate(parents.value, displayName.value);
        notice.value = "已创建";
        displayName.value = "";
        parents.value = [];
        specys.value = await api.specyList();
    } catch (e) {
        notice.value = String(e);
    }
}
async function remove(id: number) {
    try {
        await api.specyDelete(id);
        specys.value = await api.specyList();
    } catch (e) {
        notice.value = String(e);
    }
}
async function checkMix() {
    mixResult.value = await api.tryMix(mixInput.value.map(String));
}

onMounted(async () => {
    specys.value = await api.specyList();
});
</script>
<template>
    <div>
        <h2>创建物种</h2>
        <label>名字 <input v-model="displayName" /></label><br />
        <div>父物种ID(空为根)
            <ArrayEditor v-model="parents" type="number" />
        </div>
        <button @click="create">创建</button>

        <h2>物种列表</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>名字</th>
                    <th>父物种</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="s in specys" :key="s.id">
                    <td>{{ s.id }}</td>
                    <td>{{ s.displayName }}</td>
                    <td>{{ s.parents.join("、") || "根" }}</td>
                    <td><button @click="remove(s.id)">删除</button></td>
                </tr>
            </tbody>
        </table>

        <h2>检测混血</h2>
        <div>物种ID
            <ArrayEditor v-model="mixInput" type="number" />
        </div>
        <button @click="checkMix">检测</button>
        <div v-if="mixResult">
            可混血配对：
            <span v-for="(p, i) in mixResult" :key="i">
                [{{ p.a }}, {{ p.b }}]
            </span>
        </div>
        <p>{{ notice }}</p>
    </div>
</template>