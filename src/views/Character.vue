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
const currentPortrait = computed<Illustration | null>(
	() => portraits.value[carouselIndex.value] ?? null,
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
		<n-text type="error">{{ error }}</n-text>
		<template v-if="character">
			<n-card title="角色详情" size="small" style="max-width: 720px; margin: 0 auto">
				<n-descriptions label-placement="left" :column="1" bordered>
					<n-descriptions-item label="ID">#{{ character.id }}</n-descriptions-item>
					<n-descriptions-item label="名字">{{ character.displayName }}</n-descriptions-item>
					<n-descriptions-item label="种类">
						{{ Array.isArray(character.specy) ? "混血种" : "纯血种" }}（{{ specyNames }}）
					</n-descriptions-item>
					<n-descriptions-item label="性别">
						{{ character.isFemale ? "雌性" : "雄性" }}
					</n-descriptions-item>
					<n-descriptions-item label="状态">
						{{ character.isDied ? "已故" : "在世" }}
					</n-descriptions-item>
					<n-descriptions-item label="身高">{{ character.height }}</n-descriptions-item>
					<n-descriptions-item label="长度">{{ character.length }}</n-descriptions-item>
					<n-descriptions-item label="创建者">{{ character.createdBy }}</n-descriptions-item>
					<n-descriptions-item label="标签">
						<template v-if="character.tags.length">
							<n-tag v-for="t in character.tags" :key="t" size="small" style="margin-right: 6px">
								{{ t }}
							</n-tag>
						</template>
						<span v-else>无</span>
					</n-descriptions-item>
					<n-descriptions-item label="来源作品">
						<template v-if="character.information.sources.length">
							<n-tag v-for="s in character.information.sources" :key="s" size="small"
								style="margin-right: 6px">
								{{ s }}
							</n-tag>
						</template>
						<span v-else>无</span>
					</n-descriptions-item>
					<n-descriptions-item label="背景故事">
						{{ character.information.background || "无" }}
					</n-descriptions-item>
					<n-descriptions-item label="人格">
						{{ character.information.personality || "无" }}
					</n-descriptions-item>
					<n-descriptions-item label="综合介绍">
						{{ character.information.description || "无" }}
					</n-descriptions-item>
					<n-descriptions-item label="毛发颜色">
						<template v-if="character.color.fur.length">
							<span v-for="(c, i) in character.color.fur" :key="i" class="swatch"
								:style="{ background: rgb(c) }"></span>
						</template>
						<span v-else>无</span>
					</n-descriptions-item>
					<n-descriptions-item label="瞳孔颜色">
						<template v-if="character.color.eye.length">
							<span v-for="(c, i) in character.color.eye" :key="i" class="swatch"
								:style="{ background: rgb(c) }"></span>
						</template>
						<span v-else>无</span>
					</n-descriptions-item>
					<n-descriptions-item v-for="(composed, key) in character.color.other" :key="'c-' + key"
						:label="`其他颜色（${key}）`">
						<template v-if="composed.length">
							<span v-for="(c, i) in composed" :key="i" class="swatch"
								:style="{ background: rgb(c) }"></span>
						</template>
						<span v-else>无</span>
					</n-descriptions-item>
					<n-descriptions-item label="父母">
						{{ relationNames(character.relationShips.parents) || "无" }}
					</n-descriptions-item>
					<n-descriptions-item label="朋友">
						{{ relationNames(character.relationShips.friends) || "无" }}
					</n-descriptions-item>
					<n-descriptions-item label="孩子">
						{{ relationNames(character.relationShips.children) || "无" }}
					</n-descriptions-item>
					<n-descriptions-item v-for="(ids, key) in character.relationShips.other" :key="'r-' + key"
						:label="`关系（${key}）`">
						{{ relationNames(ids) || "无" }}
					</n-descriptions-item>
					<n-descriptions-item label="立绘">
						<template v-if="currentPortrait">
							<div class="carousel">
								<n-button quaternary circle size="small" @click="prev">‹</n-button>
								<div class="stage">
									<img :src="imgUrl(currentPortrait.objectId)" :alt="currentPortrait.displayName" />
									<div class="caption">
										{{ currentPortrait.displayName }}
										<n-tag v-for="t in currentPortrait.tags" :key="t" size="tiny"
											style="margin-left: 4px">
											{{ t }}
										</n-tag>
									</div>
									<div class="dots">
										<span v-for="(p, i) in portraits" :key="p.id" class="dot"
											:class="{ active: i === carouselIndex }" @click="carouselIndex = i"></span>
									</div>
								</div>
								<n-button quaternary circle size="small" @click="next">›</n-button>
							</div>
						</template>
						<span v-else>无</span>
					</n-descriptions-item>
				</n-descriptions>
			</n-card>
		</template>
		<n-text v-else>{{ error ? "" : "加载中…" }}</n-text>
	</div>
</template>
<style scoped>
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