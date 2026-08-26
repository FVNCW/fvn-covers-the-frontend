<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api, type Character, type Illustration, type Specy } from "@/engine/api";
import { apiBase } from "@/engine/util/api";

const route = useRoute();
const character = ref<Character | null>(null);
const error = ref("");
const specys = ref<Specy[]>([]);
const charMap = ref<Map<number, string>>(new Map());
const illMap = ref<Map<number, Illustration>>(new Map());
const carouselIndex = ref(0);

function rgb(c: { r: number; g: number; b: number }) {
    return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

const portraits = computed<Illustration[]>(() =>
    (character.value?.illustrations ?? [])
        .map((id) => illMap.value.get(id))
        .filter((x): x is Illustration => !!x),
);

function imgUrl(objectId: string) {
    return apiBase(`/api/object/download/${encodeURIComponent(objectId)}`);
}

function prev() {
    if (portraits.value.length) {
        carouselIndex.value =
            (carouselIndex.value - 1 + portraits.value.length) % portraits.value.length;
    }
}
function next() {
    if (portraits.value.length) {
        carouselIndex.value = (carouselIndex.value + 1) % portraits.value.length;
    }
}

const specyNames = computed(() => {
    const c = character.value;
    if (!c) return "";
    const ids = Array.isArray(c.specy) ? c.specy : [c.specy];
    return ids
        .map((id) => specys.value.find((s) => s.id === id)?.displayName ?? `#${id}`)
        .join("、");
});

function relationNames(ids: number[]) {
    return ids.map((id) => charMap.value.get(id) ?? `#${id}`).join("、");
}

onMounted(async () => {
    const id = Number(route.params.id);
    if (!Number.isInteger(id)) {
        error.value = "无效的角色 ID";
        return;
    }
    try {
        [character.value, specys.value] = await Promise.all([
            api.characterData(id),
            api.specyList(),
        ]);
        const [chars, ills] = await Promise.all([api.characterList(), api.illustrationList()]);
        charMap.value = new Map(chars.map((c) => [c.id, c.displayName]));
        illMap.value = new Map(ills.map((i) => [i.id, i]));
    } catch (e) {
        error.value = String(e);
    }
});
</script>
<template>
    <div>
        <h2>角色详情</h2>
        <p v-if="error">{{ error }}</p>
        <div v-else-if="character" class="detail">
            <dl>
                <dt>ID</dt>
                <dd>#{{ character.id }}</dd>
                <dt>名字</dt>
                <dd>{{ character.displayName }}</dd>
                <dt>种类</dt>
                <dd>{{ Array.isArray(character.specy) ? "混血种" : "纯血种" }}（{{ specyNames }}）</dd>
                <dt>性别</dt>
                <dd>{{ character.isFemale ? "雌性" : "雄性" }}</dd>
                <dt>状态</dt>
                <dd>{{ character.isDied ? "已故" : "在世" }}</dd>
                <dt>身高</dt>
                <dd>{{ character.height }}</dd>
                <dt>长度</dt>
                <dd>{{ character.length }}</dd>
                <dt>创建者</dt>
                <dd>{{ character.createdBy }}</dd>
                <dt>标签</dt>
                <dd>
                    <span v-for="t in character.tags" :key="t" class="chip">{{ t }}</span>
                    <span v-if="!character.tags.length">无</span>
                </dd>
                <dt>来源作品</dt>
                <dd>
                    <span v-for="s in character.information.sources" :key="s" class="chip">{{ s }}</span>
                    <span v-if="!character.information.sources.length">无</span>
                </dd>
                <dt>背景故事</dt>
                <dd>{{ character.information.background || "无" }}</dd>
                <dt>人格</dt>
                <dd>{{ character.information.personality || "无" }}</dd>
                <dt>综合介绍</dt>
                <dd>{{ character.information.description || "无" }}</dd>
                <dt>毛发颜色</dt>
                <dd>
                    <span
                        v-for="(c, i) in character.color.fur"
                        :key="i"
                        class="swatch"
                        :style="{ background: rgb(c) }"
                    ></span>
                    <span v-if="!character.color.fur.length">无</span>
                </dd>
                <dt>瞳孔颜色</dt>
                <dd>
                    <span
                        v-for="(c, i) in character.color.eye"
                        :key="i"
                        class="swatch"
                        :style="{ background: rgb(c) }"
                    ></span>
                    <span v-if="!character.color.eye.length">无</span>
                </dd>
                <template v-for="(composed, key) in character.color.other" :key="key">
                    <dt>其他颜色（{{ key }}）</dt>
                    <dd>
                        <span
                            v-for="(c, i) in composed"
                            :key="i"
                            class="swatch"
                            :style="{ background: rgb(c) }"
                        ></span>
                        <span v-if="!composed.length">无</span>
                    </dd>
                </template>
                <dt>父母</dt>
                <dd>{{ relationNames(character.relationShips.parents) || "无" }}</dd>
                <dt>朋友</dt>
                <dd>{{ relationNames(character.relationShips.friends) || "无" }}</dd>
                <dt>孩子</dt>
                <dd>{{ relationNames(character.relationShips.children) || "无" }}</dd>
                <template v-for="(ids, key) in character.relationShips.other" :key="key">
                    <dt>关系（{{ key }}）</dt>
                    <dd>{{ relationNames(ids) || "无" }}</dd>
                </template>
                <dt>立绘</dt>
                <dd>
                    <div v-if="portraits.length" class="carousel">
                        <button class="arrow" @click="prev">‹</button>
                        <div class="stage">
                            <img
                                :src="imgUrl(portraits[carouselIndex].objectId)"
                                :alt="portraits[carouselIndex].displayName"
                            />
                            <div class="caption">
                                {{ portraits[carouselIndex].displayName }}
                                <span v-for="t in portraits[carouselIndex].tags" :key="t" class="chip">{{
                                    t
                                }}</span>
                            </div>
                            <div class="dots">
                                <span
                                    v-for="(p, i) in portraits"
                                    :key="p.id"
                                    class="dot"
                                    :class="{ active: i === carouselIndex }"
                                    @click="carouselIndex = i"
                                ></span>
                            </div>
                        </div>
                        <button class="arrow" @click="next">›</button>
                    </div>
                    <span v-else>无</span>
                </dd>
            </dl>
        </div>
        <p v-else>加载中…</p>
    </div>
</template>
<style scoped>
.detail {
    max-width: 640px;
}
dl {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 8px 12px;
    margin: 0;
}
dt {
    font-weight: 600;
    color: #555;
}
dd {
    margin: 0;
}
.chip {
    display: inline-block;
    background: #eef1ff;
    color: #4c6ef5;
    border-radius: 12px;
    padding: 1px 10px;
    margin-right: 6px;
    font-size: 13px;
    text-decoration: none;
}
.swatch {
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-right: 6px;
    vertical-align: middle;
}
.carousel {
    display: flex;
    align-items: center;
    gap: 8px;
}
.stage {
    position: relative;
    max-width: 320px;
    text-align: center;
}
.stage img {
    max-width: 100%;
    max-height: 360px;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fff;
}
.caption {
    margin-top: 4px;
    font-size: 13px;
    color: #333;
}
.arrow {
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
}
.arrow:hover {
    background: #f0f2f8;
}
.dots {
    margin-top: 6px;
    text-align: center;
}
.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cfd6e4;
    margin: 0 3px;
    cursor: pointer;
}
.dot.active {
    background: #4c6ef5;
}
</style>