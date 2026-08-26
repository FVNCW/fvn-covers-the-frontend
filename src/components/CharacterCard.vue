<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api, type Character, type Specy } from "@/engine/api";

const props = defineProps<{ id: number; age?: number }>();

const character = ref<Character | null>(null);
const specyName = ref<string>("");
const illustrations = ref<number[]>([]);
const relationNames = ref<Record<number, string>>({});
const loading = ref(true);

const char = computed(() => character.value!);

// 获取第一张插图作为背景
const coverIllustrationId = computed(() =>
    illustrations.value.length > 0 ? illustrations.value[0] : null,
);

// 关系角色列表（含名字）
const relationCharacters = computed(() => {
    if (!character.value) return [];
    const allIds = [
        ...(character.value.relationShips.parents || []),
        ...(character.value.relationShips.friends || []),
        ...(character.value.relationShips.children || []),
    ];
    return allIds.map((id) => ({
        id,
        name: relationNames.value[id] || `#${id}`,
    }));
});

// 显示前3个，多余的用 +N 表示
const displayedRelations = computed(() => relationCharacters.value.slice(0, 3));
const extraRelationCount = computed(() => Math.max(0, relationCharacters.value.length - 3));

// RGB → hex
function rgbToHex(r: number, g: number, b: number): string {
    return (
        "#" +
        [r, g, b].map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0")).join("")
    );
}

// 颜色标签
function colorLabel(key: string): string {
    const map: Record<string, string> = { fur: "毛发", eye: "瞳孔" };
    return map[key] || key;
}

onMounted(async () => {
    try {
        // 获取角色数据
        character.value = await api.characterData(props.id);
        illustrations.value = character.value.illustrations || [];

        // 获取物种名
        const specys = await api.specyList();
        const specyId = Array.isArray(character.value.specy)
            ? character.value.specy[0]
            : character.value.specy;
        const found = specys.find((s) => s.id === specyId);
        specyName.value = found?.displayName || "";

        // 获取所有角色以解析关系名
        const chars = await api.characterList();
        const nameMap: Record<number, string> = {};
        chars.forEach((c) => {
            nameMap[c.id] = c.displayName;
        });
        relationNames.value = nameMap;
    } catch (e) {
        console.error("加载角色失败:", e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="card" v-if="character && !loading">
        <!-- 顶部插图区域 -->
        <div
            class="cover"
            :style="{
                backgroundImage: coverIllustrationId
                    ? `url(/api/illustration/download/${coverIllustrationId})`
                    : 'none',
            }"
        >
            <div class="cover-overlay">
                <!-- 性别图标 -->
                <div class="gender-icon">
                    {{ char.isFemale ? "♀" : "♂" }}
                </div>
                <!-- 主角标签 -->
                <div class="role-badge">主角</div>
            </div>
            <!-- 角色名和物种 -->
            <div class="cover-info">
                <h2 class="name">{{ char.displayName }}</h2>
                <p class="species">{{ specyName }}</p>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="content">
            <!-- 标签 -->
            <div class="tags" v-if="char.tags && char.tags.length">
                <span class="tag" v-for="tag in char.tags" :key="tag">{{ tag }}</span>
            </div>

            <!-- 身高和年龄 -->
            <div class="stats">
                <div class="stat">
                    <span class="stat-value">{{ char.height }}</span>
                    <span class="stat-label">身高 CM</span>
                </div>
                <div class="stat">
                    <span class="stat-value">{{ age ?? "?" }}</span>
                    <span class="stat-label">年龄</span>
                </div>
            </div>

            <!-- 性格 -->
            <div class="section" v-if="char.information?.personality">
                <h3 class="section-title">性格</h3>
                <p class="section-text">{{ char.information.personality }}</p>
            </div>

            <!-- 颜色设定 -->
            <div class="section" v-if="char.color">
                <h3 class="section-title">颜色设定</h3>
                <div class="colors">
                    <div class="color-item" v-if="char.color.fur.length">
                        <div
                            class="color-swatch"
                            :style="{
                                backgroundColor: rgbToHex(
                                    char.color.fur[0]!.r,
                                    char.color.fur[0]!.g,
                                    char.color.fur[0]!.b,
                                ),
                            }"
                        ></div>
                        <span>{{ colorLabel("fur") }}</span>
                    </div>
                    <div class="color-item" v-if="char.color.eye.length">
                        <div
                            class="color-swatch"
                            :style="{
                                backgroundColor: rgbToHex(
                                    char.color.eye[0]!.r,
                                    char.color.eye[0]!.g,
                                    char.color.eye[0]!.b,
                                ),
                            }"
                        ></div>
                        <span>{{ colorLabel("eye") }}</span>
                    </div>
                </div>
            </div>

            <!-- 关系 -->
            <div class="section" v-if="relationCharacters.length">
                <h3 class="section-title">关系</h3>
                <div class="relations">
                    <div class="relation-chip" v-for="rel in displayedRelations" :key="rel.id">
                        <span class="relation-avatar">{{ rel.name.charAt(0) }}</span>
                        <span>{{ rel.name }}</span>
                    </div>
                    <div class="relation-chip more" v-if="extraRelationCount > 0">
                        +{{ extraRelationCount }}
                    </div>
                </div>
            </div>

            <!-- 出处 -->
            <div
                class="section"
                v-if="char.information?.sources && char.information.sources.length"
            >
                <h3 class="section-title">出处</h3>
                <div class="source">《{{ char.information.sources[0] }}》</div>
            </div>
        </div>

        <!-- 底部信息 -->
        <div class="footer">
            <span>ID: #{{ char.id }}</span>
            <span>by {{ char.createdBy }}</span>
        </div>
    </div>
    <div class="card loading" v-else>加载中...</div>
</template>

<style scoped>
.card {
    background: #1a1f35;
    border-radius: 16px;
    overflow: hidden;
    width: 320px;
    color: #fff;
    font-family: inherit;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #888;
}

/* 顶部插图 */
.cover {
    position: relative;
    height: 200px;
    background-size: cover;
    background-position: center;
    background-color: #2a3050;
}

.cover-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px;
}

.gender-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #ff69b4;
    background: rgba(0, 0, 0, 0.3);
}

.role-badge {
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    padding: 4px 12px;
    font-size: 12px;
}

.cover-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.name {
    margin: 0;
    font-size: 22px;
    font-weight: bold;
}

.species {
    margin: 4px 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
}

/* 内容区 */
.content {
    padding: 16px;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.tag {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 4px 12px;
    font-size: 12px;
}

.stats {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
}

.stat {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
}

.stat-label {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
}

.section {
    margin-bottom: 16px;
}

.section-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.6);
}

.section-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
}

.colors {
    display: flex;
    gap: 16px;
}

.color-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
}

.color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.relations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.relation-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 4px 12px 4px 4px;
    font-size: 12px;
}

.relation-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ff69b4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
}

.relation-chip.more {
    background: rgba(255, 105, 180, 0.2);
    padding: 4px 12px;
}

.source {
    display: inline-block;
    border: 1px solid rgba(255, 165, 0, 0.4);
    border-radius: 16px;
    padding: 4px 12px;
    font-size: 12px;
    color: #ffa500;
}

/* 底部 */
.footer {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 11px;
    color: #666;
}
</style>
