<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ContentSelector from "@/components/ContentSelector.vue";
import { api, type Specy } from "@/engine/api";

const displayName = ref("");
const parents = ref<Specy[]>([]);
const specys = ref<Specy[]>([]);
const notice = ref("");

const mixInput = ref<Specy[]>([]);
const mixResult = ref<{ a: number; b: number }[] | null>(null);

const selected = ref<Specy[]>([]);
const editName = ref("");

const NODE_WIDTH = 140;
const NODE_HEIGHT = 44;
const COL_SPACING = 170;
const ROW_SPACING = 130;
const PAD_X = NODE_WIDTH / 2 + 20;
const PAD_Y = NODE_HEIGHT / 2 + 30;

interface GraphNode {
	specy: Specy;
	left: number;
	top: number;
}
interface GraphEdge {
	path: string;
}

const graph = computed<{ nodes: GraphNode[]; edges: GraphEdge[]; width: number; height: number }>(
	() => {
		const specyMap = new Map<number, Specy>();
		specys.value.forEach((s) => specyMap.set(s.id, s));

		// 建立子节点关系，并统计入度
		const children = new Map<number, number[]>();
		const inDegree = new Map<number, number>();
		specys.value.forEach((s) => {
			children.set(s.id, []);
			inDegree.set(s.id, 0);
		});
		specys.value.forEach((s) => {
			s.parents.forEach((p) => {
				if (!specyMap.has(p)) return;
				children.get(p)!.push(s.id);
				inDegree.set(s.id, (inDegree.get(s.id) ?? 0) + 1);
			});
		});

		// 拓扑排序（Kahn）计算每个节点的层级深度
		const depth = new Map<number, number>();
		const queue: number[] = [];
		specys.value.forEach((s) => {
			if ((inDegree.get(s.id) ?? 0) === 0) {
				depth.set(s.id, 0);
				queue.push(s.id);
			}
		});
		while (queue.length) {
			const id = queue.shift()!;
			const d = depth.get(id) ?? 0;
			(children.get(id) ?? []).forEach((c) => {
				depth.set(c, Math.max(depth.get(c) ?? 0, d + 1));
				inDegree.set(c, (inDegree.get(c) ?? 0) - 1);
				if (inDegree.get(c) === 0) queue.push(c);
			});
		}

		// 按深度分列（每列内的节点按 id 排序，保证稳定布局）
		const levels = new Map<number, number[]>();
		specys.value.forEach((s) => {
			const d = depth.get(s.id) ?? 0;
			if (!levels.has(d)) levels.set(d, []);
			levels.get(d)!.push(s.id);
		});
		levels.forEach((ids) => ids.sort((a, b) => a - b));

		const maxDepth = specys.value.length ? Math.max(...depth.values()) : 0;
		const maxLevelCount = Math.max(1, ...Array.from(levels.values(), (l) => l.length));
		const width = (maxLevelCount - 1) * COL_SPACING + PAD_X * 2;
		const height = maxDepth * ROW_SPACING + PAD_Y * 2;

		// 计算每个节点中心坐标（每行整体居中）
		const positions = new Map<number, { x: number; y: number }>();
		levels.forEach((ids, d) => {
			const span = (ids.length - 1) * COL_SPACING;
			const startX = (width - span) / 2;
			ids.forEach((id, i) => {
				positions.set(id, { x: startX + i * COL_SPACING, y: PAD_Y + d * ROW_SPACING });
			});
		});

		const nodes: GraphNode[] = specys.value.map((s) => {
			const p = positions.get(s.id) ?? { x: PAD_X, y: PAD_Y };
			return { specy: s, left: p.x - NODE_WIDTH / 2, top: p.y - NODE_HEIGHT / 2 };
		});

		// 父节点底部中心 -> 子节点顶部中心 的三次贝塞尔曲线
		const edges: GraphEdge[] = [];
		specys.value.forEach((s) => {
			const to = positions.get(s.id);
			if (!to) return;
			s.parents.forEach((p) => {
				const from = positions.get(p);
				if (!from) return;
				const x1 = from.x;
				const y1 = from.y + NODE_HEIGHT / 2;
				const x2 = to.x;
				const y2 = to.y - NODE_HEIGHT / 2 - 8;
				const dy = y2 - y1;
				edges.push({
					path:
						`M ${x1} ${y1} C ${x1} ${y1 + dy * 0.5}, ` +
						`${x2} ${y2 - dy * 0.5}, ${x2} ${y2}`,
				});
			});
		});

		return { nodes, edges, width, height };
	},
);

const graphStyle = computed(() => ({
	width: `${graph.value.width}px`,
	height: `${graph.value.height}px`,
}));

const viewBox = computed(() => `0 0 ${graph.value.width} ${graph.value.height}`);

async function create() {
	try {
		await api.specyCreate(parents.value.map((s) => s.id), displayName.value);
		notice.value = "已创建";
		displayName.value = "";
		parents.value = [];
		specys.value = await api.specyList();
	} catch (e) {
		notice.value = String(e);
	}
}
function selectNode(n: GraphNode, e: MouseEvent) {
	const i = selected.value.findIndex((x) => x.id === n.specy.id);
	if (e.shiftKey) {
		if (i >= 0) selected.value.splice(i, 1);
		else selected.value.push(n.specy);
	} else {
		selected.value = [n.specy];
	}
	editName.value = selected.value[0]?.displayName ?? "";
}
async function rename() {
	const target = selected.value.length === 1 ? selected.value[0] : null;
	if (!target) {
		notice.value = "多选时禁止重命名";
		return;
	}
	if (!editName.value.trim()) {
		notice.value = "请输入新名字";
		return;
	}
	try {
		await api.specyRename(target.id, editName.value.trim());
		notice.value = "已重命名";
		specys.value = await api.specyList();
		const fresh = specys.value.find((s) => s.id === target.id);
		if (fresh) {
			selected.value = [fresh];
			editName.value = fresh.displayName;
		} else {
			selected.value = [];
		}
	} catch (e) {
		notice.value = String(e);
	}
}
async function remove() {
	if (!selected.value.length) return;
	const names = selected.value.map((s) => `#${s.id}（${s.displayName}）`).join("、");
	if (!confirm(`确定删除节点 ${names} 吗？`)) return;
	try {
		for (const s of selected.value) await api.specyDelete(s.id);
		notice.value = "已删除";
		selected.value = [];
		specys.value = await api.specyList();
	} catch (e) {
		notice.value = String(e);
	}
}
function setAsParent() {
	if (!selected.value.length) return;
	parents.value = [...selected.value];
	notice.value = "已将选中的节点设为父节点";
}
function sendToMix() {
	if (selected.value.length < 2) return;
	mixInput.value = [...selected.value];
	notice.value = "已将选中的节点填入混血检测";
}
async function checkMix() {
	mixResult.value = await api.tryMix(mixInput.value.map((s) => String(s.id)));
}

onMounted(async () => {
	specys.value = await api.specyList();
});
</script>
<template>
	<n-space vertical size="large">
		<n-card title="创建物种" size="small">
			<n-space vertical>
				<n-form-item label="名字">
					<n-input v-model:value="displayName" placeholder="输入物种名字" />
				</n-form-item>
				<n-form-item label="父物种（空为根）">
					<ContentSelector v-model:selected="parents" type="specy" multiple />
				</n-form-item>
				<n-button type="primary" @click="create">创建</n-button>
			</n-space>
		</n-card>

		<n-card title="物种图谱" size="small">
			<div v-if="graph.nodes.length" class="graph-scroll">
				<div class="graph" :style="graphStyle">
					<svg class="edges" :viewBox="viewBox">
						<defs>
							<marker id="specy-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7"
								markerHeight="7" orient="auto-start-reverse">
								<path d="M 0 0 L 10 5 L 0 10 z" fill="#aab3c5" />
							</marker>
						</defs>
						<path v-for="(e, i) in graph.edges" :key="i" :d="e.path" fill="none" stroke="#aab3c5"
							stroke-width="1.5" marker-end="url(#specy-arrow)" />
					</svg>
					<div class="nodes">
						<div v-for="n in graph.nodes" :key="n.specy.id" class="node"
							:class="{ active: selected.some((x) => x.id === n.specy.id) }"
							:style="{ left: n.left + 'px', top: n.top + 'px' }"
							:title="`ID ${n.specy.id} · 父物种 ${n.specy.parents.join('、') || '无'}`"
							@click="selectNode(n, $event)">
							<span class="node-id">#{{ n.specy.id }}</span>
							<span class="node-name">{{ n.specy.displayName }}</span>
						</div>
					</div>
				</div>
			</div>
			<n-text v-else>暂无物种</n-text>
		</n-card>

		<n-card title="节点操作" size="small">
			<template v-if="selected.length">
				<n-text style="display: block; margin-bottom: 8px">
					已选中 {{ selected.length }} 个节点：
					<span v-for="(s, i) in selected" :key="s.id">
						#{{ s.id }}（{{ s.displayName }}）{{ i < selected.length - 1 ? "、" : "" }} </span>
				</n-text>
				<n-space v-if="selected.length === 1" align="center">
					<n-input v-model:value="editName" placeholder="新名字" style="width: 200px"
						@keyup.enter="rename" />
					<n-button @click="rename">重命名</n-button>
				</n-space>
				<n-space style="margin-top: 8px">
					<n-button type="error" @click="remove">
						删除节点{{ selected.length > 1 ? `（${selected.length}）` : "" }}
					</n-button>
					<n-button @click="setAsParent">设为父节点</n-button>
					<n-button v-if="selected.length >= 2" type="primary" @click="sendToMix">
						混血可行性检测
					</n-button>
				</n-space>
			</template>
			<n-text v-else>点击图谱中的节点以编辑或删除（按住 Shift 可多选）</n-text>
		</n-card>

		<n-card title="检测混血" size="small">
			<n-space vertical>
				<n-form-item label="物种">
					<ContentSelector v-model:selected="mixInput" type="specy" multiple />
				</n-form-item>
				<n-button type="primary" @click="checkMix">检测</n-button>
				<n-text v-if="mixResult">
					可混血配对：
					<span v-for="(p, i) in mixResult" :key="i"> [{{ p.a }}, {{ p.b }}] </span>
				</n-text>
			</n-space>
		</n-card>
		<n-text>{{ notice }}</n-text>
	</n-space>
</template>
<style scoped>
.graph-scroll {
	overflow: auto;
	max-height: 70vh;
	border: 1px solid #e3e6ec;
	border-radius: 8px;
	background: #fafbfc;
}

.graph {
	position: relative;
}

.edges {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}

.nodes {
	position: absolute;
	inset: 0;
	z-index: 1;
}

.node {
	position: absolute;
	width: 140px;
	height: 44px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 2px;
	background: #fff;
	border: 1.5px solid #7c8db5;
	border-radius: 8px;
	box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
	cursor: pointer;
}

.node:hover {
	border-color: #4c6ef5;
}

.node.active {
	border-color: #4c6ef5;
	background: #eef1ff;
	box-shadow: 0 0 0 2px rgba(76, 110, 245, 0.25);
}

.node-id {
	font-size: 11px;
	color: #8a93a6;
}

.node-name {
	font-size: 13px;
	color: #333;
	max-width: 130px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
