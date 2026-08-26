<script setup lang="ts">
import { ref } from "vue";
import ArrayEditor from "@/components/ArrayEditor.vue";
import ObjectUploader from "@/components/ObjectUploader.vue";
import { api, type TextureObject } from "@/engine/api";

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
    if (!file.value) return alert("请选择文件");
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
const specyPure = ref<number>(0);
const specyMixed = ref<number[]>([]);
const height = ref<number>(0);
const length = ref<number>(0);
const furR = ref<number>(0);
const furG = ref<number>(0);
const furB = ref<number>(0);
const eyeR = ref<number>(0);
const eyeG = ref<number>(0);
const eyeB = ref<number>(0);
const relParents = ref<number[]>([]);
const relFriends = ref<number[]>([]);
const relChildren = ref<number[]>([]);

async function createCharacter() {
    const specy = specyMode.value === "mixed" ? specyMixed.value : specyPure.value;
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
            fur: [{ r: furR.value, g: furG.value, b: furB.value }],
            eye: [{ r: eyeR.value, g: eyeG.value, b: eyeB.value }],
            other: {},
        },
        relationShips: {
            parents: relParents.value,
            friends: relFriends.value,
            children: relChildren.value,
            other: {},
        },
    });
    alert("创建成功");
}
</script>
<template>
    <div>
        <h2>上传对象</h2>
        <ObjectUploader v-model="file" />
        <button @click="uploadObject">上传</button>
        <div v-if="uploaded">已上传：id={{ uploaded.id }} hash={{ uploaded.hash }}</div>

        <h2>创建角色</h2>
        <label>名字 <input v-model="displayName" /></label><br />
        <div>
            标签
            <ArrayEditor v-model="tags" />
        </div>
        <label><input type="checkbox" v-model="isDied" /> 已故</label><br />
        <label><input type="checkbox" v-model="isFemale" /> 女性</label><br />
        <label
            >背景故事
            <textarea v-model="background"></textarea></label
        ><br />
        <div>
            来源作品
            <ArrayEditor v-model="sources" />
        </div>
        <label
            >人格
            <textarea v-model="personality"></textarea></label
        ><br />
        <label
            >综合介绍
            <textarea v-model="description"></textarea></label
        ><br />
        <div>
            <label> <input type="radio" value="pure" v-model="specyMode" /> 纯血种 </label>
            <label> <input type="radio" value="mixed" v-model="specyMode" /> 混血种 </label>
        </div>
        <template v-if="specyMode === 'pure'">
            <label>纯血种物种ID <input v-model.number="specyPure" type="number" /></label><br />
        </template>
        <template v-else>
            <div>
                混血种物种ID
                <ArrayEditor v-model="specyMixed" type="number" />
            </div>
        </template>
        <label>身高 <input v-model.number="height" type="number" /></label><br />
        <label>长度 <input v-model.number="length" type="number" /></label><br />
        <fieldset>
            <legend>毛发颜色 RGB</legend>
            <input v-model.number="furR" type="number" />
            <input v-model.number="furG" type="number" />
            <input v-model.number="furB" type="number" />
        </fieldset>
        <fieldset>
            <legend>瞳孔颜色 RGB</legend>
            <input v-model.number="eyeR" type="number" />
            <input v-model.number="eyeG" type="number" />
            <input v-model.number="eyeB" type="number" />
        </fieldset>
        <div>
            父母ID
            <ArrayEditor v-model="relParents" type="number" />
        </div>
        <div>
            朋友ID
            <ArrayEditor v-model="relFriends" type="number" />
        </div>
        <div>
            孩子ID
            <ArrayEditor v-model="relChildren" type="number" />
        </div>
        <button @click="createCharacter">创建角色</button>
    </div>
</template>
