<script setup lang="ts">
import { ref } from "vue";
import { api, type TextureObject } from "@/engine/api";

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
const objId = ref("");
const objInfo = ref<TextureObject | null>(null);
const notice = ref("");
const objFile = ref<File | null>(null);
async function downloadInfo() {
    try {
        objInfo.value = await api.objectInfo(objId.value);
        notice.value = "";
    } catch (e) {
        objInfo.value = null;
        notice.value = String(e);
    }
}
async function modifyObject() {
    if (!objFile.value || !objId.value) return alert("请选择文件并填写对象ID");
    objInfo.value = await api.objectModify(objId.value, await readFileAsBase64(objFile.value));
    notice.value = "已修改";
}
async function deleteObject() {
    if (!objId.value) return alert("请填写对象ID");
    await api.objectDelete(objId.value);
    objInfo.value = null;
    notice.value = "已删除";
}
const characterId = ref<number>(0);
const illObjectId = ref("");
const illName = ref("");
const illTags = ref("");
const illDeleteId = ref<number>(0);
async function addIllustration() {
    const tags = illTags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    await api.illustrationAdd(characterId.value, {
        objectId: illObjectId.value,
        displayName: illName.value,
        tags,
    });
    alert("已添加");
}
async function deleteIllustration() {
    await api.illustrationDelete(illDeleteId.value);
    alert("已删除");
}
</script>
<template>
    <div>
        <h2>对象管理</h2>
        <label>对象ID <input v-model="objId" /></label>
        <button @click="downloadInfo">查询信息</button>
        <input type="file" @change="objFile = (($event.target as HTMLInputElement).files?.[0]) ?? null" />
        <button @click="modifyObject">修改对象</button>
        <button @click="deleteObject">删除对象</button>
        <div v-if="objInfo">id={{ objInfo.id }} hash={{ objInfo.hash }} uploader={{ objInfo.uploader }}</div>
        <p>{{ notice }}</p>

        <h2>添加立绘</h2>
        <label>角色ID <input v-model.number="characterId" type="number" /></label><br />
        <label>对象ID <input v-model="illObjectId" /></label><br />
        <label>立绘名字 <input v-model="illName" /></label><br />
        <label>标签(逗号分隔) <input v-model="illTags" /></label><br />
        <button @click="addIllustration">添加</button>

        <h2>删除立绘</h2>
        <label>立绘ID <input v-model.number="illDeleteId" type="number" /></label>
        <button @click="deleteIllustration">删除</button>
    </div>
</template>