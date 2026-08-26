<script setup lang="ts">
import { ref, watch } from "vue";
import {
	api,
	type Character,
	type ContentType,
	type Illustration,
	type Specy,
	type TextureObject,
} from "@/engine/api";

type Content = Character | TextureObject | Illustration | Specy;

const props = defineProps<{
	type: ContentType;
	multiple?: boolean;
}>();
// 单选：v-model（Content | null）
const single = defineModel<Content | null>("modelValue", { default: null });
// 多选：v-model:selected（Content[]）
const multi = defineModel<Content[]>("selected", { default: () => [] });

const keyword = ref("");
const items = ref<Content[]>([]);
const loading = ref(false);
const error = ref("");

function label(item: Content): string {
	if (props.type === "object") return (item as TextureObject).id;
	return (item as Character | Illustration | Specy).displayName;
}
function idOf(item: Content): string {
	return String((item as { id: number | string }).id);
}

async function loadAll(): Promise<Content[]> {
	switch (props.type) {
		case "character":
			return await api.characterList();
		case "object":
			return await api.objectList();
		case "illustration":
			return await api.illustrationList();
		case "specy":
			return await api.specyList();
	}
}

async function search() {
	const kw = keyword.value.trim();
	if (!kw) {
		items.value = await loadAll();
		return;
	}
	items.value = await api.search(props.type, {
		type: "equal",
		fieldType: ["string&array"],
		filter: { key: null, "string&array": { mode: "include", value: kw } },
	});
}

async function refresh() {
	loading.value = true;
	error.value = "";
	try {
		await search();
	} catch (e) {
		error.value = String(e);
	} finally {
		loading.value = false;
	}
}

watch(
	() => props.type,
	() => {
		keyword.value = "";
		single.value = null;
		multi.value = [];
		refresh();
	},
);
refresh();

function onSelect(v: string | number) {
	const id = String(v);
	single.value = items.value.find((item) => idOf(item) === id) ?? null;
}

function isSelected(item: Content): boolean {
	return multi.value.some((x) => idOf(x) === idOf(item));
}

function toggle(item: Content) {
	const i = multi.value.findIndex((x) => idOf(x) === idOf(item));
	if (i >= 0) {
		multi.value = multi.value.filter((x) => idOf(x) !== idOf(item));
	} else {
		multi.value = [...multi.value, item];
	}
}
</script>
<template>
	<div class="content-selector">
		<div class="search">
			<n-input v-model:value="keyword" placeholder="输入关键词搜索" @keyup.enter="refresh" />
			<n-button :loading="loading" @click="refresh">搜索</n-button>
		</div>

		<n-select v-if="!multiple" clearable placeholder="请选择" :value="single ? idOf(single) : null"
			:options="items.map((x) => ({ label: label(x), value: idOf(x) }))" @update:value="onSelect" />

		<div v-else class="multi">
			<div class="multi-list">
				<label v-for="item in items" :key="idOf(item)" class="multi-item">
					<n-checkbox :checked="isSelected(item)" @update:checked="() => toggle(item)">
						{{ label(item) }}
						<template v-if="props.type !== 'object'">（#{{ idOf(item) }}）</template>
					</n-checkbox>
				</label>
				<span v-if="!items.length" class="empty">无结果</span>
			</div>
			<div v-if="multi.length" class="multi-selected">
				<n-tag v-for="item in multi" :key="idOf(item)" size="small" closable @close="toggle(item)">
					{{ label(item) }}
				</n-tag>
			</div>
		</div>

		<span v-if="error" class="error">{{ error }}</span>
	</div>
</template>
<style scoped>
.content-selector {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.search {
	display: flex;
	gap: 8px;
	align-items: center;
}

.multi {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.multi-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
	max-height: 180px;
	overflow-y: auto;
	border: 1px solid #ddd;
	border-radius: 4px;
	padding: 8px;
}

.multi-item {
	cursor: pointer;
}

.empty {
	color: #999;
}

.multi-selected {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.error {
	color: #d33;
}
</style>
