<script setup lang="ts">
import { computed, ref } from "vue";
import ArrayEditor from "@/components/ArrayEditor.vue";
import ColorListEditor from "@/components/ColorListEditor.vue";
import ContentSelector from "@/components/ContentSelector.vue";
import ObjectUploader from "@/components/ObjectUploader.vue";
import { api, type Character, type Specy, type TextureObject } from "@/engine/api";

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 对象上传
const file = ref<File | null>(null);
const uploaded = ref<TextureObject | null>(null);

async function uploadObject() {
    if (!file.value) return window.message?.error("请选择文件");
    const data = await readFileAsBase64(file.value);
    uploaded.value = await api.objectUpload(data);
}

// 角色创建
const displayName = ref("");
const tags = ref<string[]>([]);
const isDied = ref(false);
const isFemale = ref(false);
const background = ref("");
const sources = ref<string[]>([]);
const personality = ref("");
const description = ref("");
const specyMode = ref<"pure" | "mixed">("pure");
const specyPure = ref<Specy | null>(null);
const specyMixed = ref<Specy[]>([]);
const height = ref<number>(0);
const length = ref<number>(0);

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = hex.replace("#", "");
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    } as { r: number; g: number; b: number };
}
const furColors = ref<string[]>(["#66ccff"]);
const eyeColors = ref<string[]>(["#cc2222"]);
const relParents = ref<Character[]>([]);
const relFriends = ref<Character[]>([]);
const relChildren = ref<Character[]>([]);

const canCreate = computed(() => {
    if (!displayName.value.trim()) return false;
    if (specyMode.value === "pure") return !!specyPure.value?.id;
    return specyMixed.value.length > 0;
});

async function createCharacter() {
    const specy = specyMode.value === "mixed"
        ? specyMixed.value.map((s) => s.id)
        : (specyPure.value?.id ?? 0);
    const fur = furColors.value.map(hexToRgb);
    const eye = eyeColors.value.map(hexToRgb);
    await api.characterCreate({
        tags: tags.value,
        displayName: displayName.value,
        isDied: isDied.value,
        isFemale: isFemale.value,
        information: {
            background: background.value,
            sources: sources.value,
            personality: personality.value,
            description: description.value,
        },
        specy,
        height: height.value,
        length: length.value,
        color: {
            fur,
            eye,
            other: {},
        },
        relationShips: {
            parents: relParents.value.map((c) => c.id),
            friends: relFriends.value.map((c) => c.id),
            children: relChildren.value.map((c) => c.id),
            other: {},
        },
    });
    window.message?.success("创建成功");
    resetForm();
}

function resetForm() {
    displayName.value = "";
    tags.value = [];
    isDied.value = false;
    isFemale.value = false;
    background.value = "";
    sources.value = [];
    personality.value = "";
    description.value = "";
    specyMode.value = "pure";
    specyPure.value = null;
    specyMixed.value = [];
    height.value = 0;
    length.value = 0;
    furColors.value = ["#66ccff"];
    eyeColors.value = ["#cc2222"];
    relParents.value = [];
    relFriends.value = [];
    relChildren.value = [];
}
</script>
<template>
    <n-space vertical size="large" justify="center" align="center" style="max-width: 720px; margin: 0 auto"><n-card title="上传对象" size="small" style="width: 100%">
            <n-space vertical>
                <ObjectUploader v-model="file" />
                <n-button type="primary" @click="uploadObject">上传</n-button>
                <n-text v-if="uploaded">已上传：id={{ uploaded.id }} hash={{ uploaded.hash }}</n-text>
            </n-space>
        </n-card>

        <n-card title="创建角色" size="small" style="width: 100%">
            <n-space vertical>
                <n-form-item label="名字">
                    <n-input v-model:value="displayName" placeholder="输入角色名字" />
                </n-form-item>
                <n-form-item label="标签">
                    <ArrayEditor v-model="tags" />
                </n-form-item>
                <n-space>
                    <n-checkbox v-model:checked="isDied">已故</n-checkbox>
                    <n-checkbox v-model:checked="isFemale">女性</n-checkbox>
                </n-space>
                <n-form-item label="背景故事">
                    <n-input v-model:value="background" type="textarea" placeholder="输入背景故事" />
                </n-form-item>
                <n-form-item label="来源作品">
                    <ArrayEditor v-model="sources" />
                </n-form-item>
                <n-form-item label="人格">
                    <n-input v-model:value="personality" type="textarea" placeholder="输入人格" />
                </n-form-item>
                <n-form-item label="综合介绍">
                    <n-input v-model:value="description" type="textarea" placeholder="输入综合介绍" />
                </n-form-item>
                <n-form-item label="物种类型">
                    <n-radio-group v-model:value="specyMode">
                        <n-radio value="pure">纯血种</n-radio>
                        <n-radio value="mixed">混血种</n-radio>
                    </n-radio-group>
                </n-form-item>
                <template v-if="specyMode === 'pure'">
                    <n-form-item label="纯血种物种">
                        <ContentSelector v-model="specyPure" type="specy" />
                    </n-form-item>
                </template>
                <template v-else>
                    <n-form-item label="混血种物种">
                        <ContentSelector v-model:selected="specyMixed" type="specy" multiple />
                    </n-form-item>
                </template>
                <n-space>
                    <n-form-item label="身高">
                        <n-input-number v-model:value="height" :min="0" />
                    </n-form-item>
                    <n-form-item label="长度">
                        <n-input-number v-model:value="length" :min="0" />
                    </n-form-item>
                </n-space>
                <n-form-item label="毛发颜色">
                    <ColorListEditor v-model="furColors" />
                </n-form-item>
                <n-form-item label="瞳孔颜色">
                    <ColorListEditor v-model="eyeColors" />
                </n-form-item>
                <n-form-item label="父母">
                    <ContentSelector v-model:selected="relParents" type="character" multiple />
                </n-form-item>
                <n-form-item label="朋友">
                    <ContentSelector v-model:selected="relFriends" type="character" multiple />
                </n-form-item>
                <n-form-item label="孩子">
                    <ContentSelector v-model:selected="relChildren" type="character" multiple />
                </n-form-item>
                <n-button type="primary" :disabled="!canCreate" @click="createCharacter">
                    创建角色
                </n-button>
            </n-space>
        </n-card>
    </n-space>
</template>