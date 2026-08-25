<script setup lang="ts">
import { ref, watch } from "vue";

const model = defineModel<File | null>({ default: null });
const previewUrl = ref("");

watch(model, (file) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = file ? URL.createObjectURL(file) : "";
});

function onChange(e: Event) {
    model.value = (e.target as HTMLInputElement).files?.[0] ?? null;
}

function onPreviewError() {
    alert("上传的图片无效");
}
</script>
<template>
    <div class="uploader">
        <input type="file" @change="onChange" accept="image/*" />
        <img v-if="previewUrl" class="preview" :src="previewUrl" alt="预览" @error="onPreviewError" />
    </div>
</template>
<style scoped>
.uploader {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.preview {
    max-width: 200px;
    max-height: 200px;
    object-fit: contain;
    border: 1px solid #ddd;
    border-radius: 4px;
}
</style>