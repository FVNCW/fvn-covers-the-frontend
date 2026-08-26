<script setup lang="ts">
import { onMounted, ref } from "vue";
import ContentSelector from "@/components/ContentSelector.vue";
import ObjectUploader from "@/components/ObjectUploader.vue";
import { api, type Character, type Illustration, type TextureObject } from "@/engine/api";
import { apiBase } from "@/engine/util/api";

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
const obj = ref<TextureObject | null>(null);
const objInfo = ref<TextureObject | null>(null);
const notice = ref("");
const objFile = ref<File | null>(null);
const objPreviewSrc = ref("");
async function downloadInfo() {
    const id = obj.value?.id;
    if (!id) return alert("请选择对象");
    try {
        objInfo.value = await api.objectInfo(id);
        objPreviewSrc.value = apiBase(`/api/object/download/${encodeURIComponent(id)}`);
        notice.value = "";
    } catch (e) {
        objInfo.value = null;
        objPreviewSrc.value = "";
        notice.value = String(e);
    }
}
async function modifyObject() {
    const id = obj.value?.id;
    if (!objFile.value || !id) return alert("请选择文件并选择对象");
    objInfo.value = await api.objectModify(id, await readFileAsBase64(objFile.value));
    notice.value = "已修改";
}
async function deleteObject() {
    const id = obj.value?.id;
    if (!id) return alert("请选择对象");
    await api.objectDelete(id);
    objInfo.value = null;
    obj.value = null;
    notice.value = "已删除";
    objects.value = await api.objectList();
}
const character = ref<Character | null>(null);
const illObject = ref<TextureObject | null>(null);
const illName = ref("");
const illTags = ref("");
const illDelete = ref<Illustration | null>(null);
async function addIllustration() {
    const characterId = character.value?.id;
    const objectId = illObject.value?.id;
    if (!characterId || !objectId) return alert("请选择角色和对象");
    const tags = illTags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    await api.illustrationAdd(characterId, {
        objectId,
        displayName: illName.value,
        tags,
    });
    alert("已添加");
    await refreshLists();
}
async function deleteIllustration() {
    const id = illDelete.value?.id;
    if (!id) return alert("请选择立绘");
    await api.illustrationDelete(id);
    illDelete.value = null;
    alert("已删除");
    await refreshLists();
}
const objects = ref<TextureObject[]>([]);
const illustrations = ref<Illustration[]>([]);
const listNotice = ref("");
async function refreshLists() {
    try {
        [objects.value, illustrations.value] = await Promise.all([
            api.objectList(),
            api.illustrationList(),
        ]);
        listNotice.value = "";
    } catch (e) {
        listNotice.value = String(e);
    }
}
onMounted(refreshLists);
</script>
<template>
    <div>
        <h2>对象管理</h2>
        <ContentSelector v-model="obj" type="object" />
        <button @click="downloadInfo">查询信息</button>
        <ObjectUploader v-model="objFile" />
        <button @click="modifyObject">修改对象</button>
        <button @click="deleteObject">删除对象</button>
        <div v-if="objInfo">
            id={{ objInfo.id }} hash={{ objInfo.hash }} uploader={{ objInfo.uploader }}
        </div>
        <img v-if="objPreviewSrc" class="obj-preview" :src="objPreviewSrc" alt="对象图片" />
        <p>{{ notice }}</p>

        <h2>添加立绘</h2>
        <div>
            角色
            <ContentSelector v-model="character" type="character" />
        </div>
        <div>
            对象
            <ContentSelector v-model="illObject" type="object" />
        </div>
        <label>立绘名字 <input v-model="illName" /></label><br />
        <label>标签(逗号分隔) <input v-model="illTags" /></label><br />
        <button @click="addIllustration">添加</button>

        <h2>删除立绘</h2>
        <ContentSelector v-model="illDelete" type="illustration" />
        <button @click="deleteIllustration">删除</button>

        <p>{{ listNotice }}</p>

        <h2>对象列表</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>哈希</th>
                    <th>上传者</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="o in objects"
                    :key="o.id"
                    class="clickable"
                    @click="
                        obj = o;
                        illObject = o;
                    "
                >
                    <td>{{ o.id }}</td>
                    <td>{{ o.hash }}</td>
                    <td>{{ o.uploader }}</td>
                </tr>
            </tbody>
        </table>
        <p v-if="!objects.length && !listNotice">暂无对象</p>

        <h2>立绘列表</h2>
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>名字</th>
                    <th>对象ID</th>
                    <th>标签</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="i in illustrations"
                    :key="i.id"
                    class="clickable"
                    @click="obj = objects.find((o) => o.id === i.objectId) ?? null"
                >
                    <td>{{ i.id }}</td>
                    <td>{{ i.displayName }}</td>
                    <td>{{ i.objectId }}</td>
                    <td>{{ i.tags.join("、") }}</td>
                </tr>
            </tbody>
        </table>
        <p v-if="!illustrations.length && !listNotice">暂无立绘</p>
    </div>
</template>
<style scoped>
.obj-preview {
    max-width: 200px;
    max-height: 200px;
    object-fit: contain;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: block;
    margin-top: 8px;
}

.clickable {
    cursor: pointer;
}

.clickable:hover {
    background: #f0f2f8;
}
</style>
