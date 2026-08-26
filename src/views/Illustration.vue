<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { DataTableColumns } from "naive-ui";
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

const objectColumns: DataTableColumns<TextureObject> = [
    { title: "ID", key: "id" },
    { title: "哈希", key: "hash" },
    { title: "上传者", key: "uploader" },
];
const illustrationColumns: DataTableColumns<Illustration> = [
    { title: "ID", key: "id" },
    { title: "名字", key: "displayName" },
    { title: "对象ID", key: "objectId" },
    {
        title: "标签",
        key: "tags",
        render: (row) => row.tags.join("、"),
    },
];
function objectRowProps(row: TextureObject) {
    return {
        style: "cursor: pointer",
        onClick: () => {
            obj.value = row;
            illObject.value = row;
        },
    };
}
function illustrationRowProps(row: Illustration) {
    return {
        style: "cursor: pointer",
        onClick: () => {
            obj.value = objects.value.find((o) => o.id === row.objectId) ?? null;
        },
    };
}
</script>
<template>
    <n-space vertical size="large" justify="center" align="center">
        <n-card title="对象管理" size="small" style="width: 100%">
            <n-space vertical>
                <ContentSelector v-model="obj" type="object" />
                <n-space>
                    <n-button @click="downloadInfo">查询信息</n-button>
                    <ObjectUploader v-model="objFile" />
                    <n-button @click="modifyObject">修改对象</n-button>
                    <n-button type="error" @click="deleteObject">删除对象</n-button>
                </n-space>
                <n-text v-if="objInfo">
                    id={{ objInfo.id }} hash={{ objInfo.hash }} uploader={{ objInfo.uploader }}
                </n-text>
                <img v-if="objPreviewSrc" class="obj-preview" :src="objPreviewSrc" alt="对象图片" />
                <n-text type="error">{{ notice }}</n-text>
            </n-space>
        </n-card>

        <n-card title="添加立绘" size="small" style="width: 100%">
            <n-space vertical>
                <n-form-item label="角色">
                    <ContentSelector v-model="character" type="character" />
                </n-form-item>
                <n-form-item label="对象">
                    <ContentSelector v-model="illObject" type="object" />
                </n-form-item>
                <n-form-item label="立绘名字">
                    <n-input v-model:value="illName" placeholder="输入立绘名字" />
                </n-form-item>
                <n-form-item label="标签（逗号分隔）">
                    <n-input v-model:value="illTags" placeholder="如：正装,冬天" />
                </n-form-item>
                <n-button type="primary" @click="addIllustration">添加</n-button>
            </n-space>
        </n-card>

        <n-card title="删除立绘" size="small" style="width: 100%">
            <n-space>
                <ContentSelector v-model="illDelete" type="illustration" />
                <n-button type="error" @click="deleteIllustration">删除</n-button>
            </n-space>
        </n-card>

        <n-card title="对象列表" size="small" style="width: 100%">
            <n-data-table
                :columns="objectColumns"
                :data="objects"
                :row-props="objectRowProps"
                :bordered="false"
            />
            <n-text v-if="!objects.length && !listNotice">暂无对象</n-text>
        </n-card>

        <n-card title="立绘列表" size="small" style="width: 100%">
            <n-data-table
                :columns="illustrationColumns"
                :data="illustrations"
                :row-props="illustrationRowProps"
                :bordered="false"
            />
            <n-text v-if="!illustrations.length && !listNotice">暂无立绘</n-text>
        </n-card>

        <n-text type="error">{{ listNotice }}</n-text>
    </n-space>
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
