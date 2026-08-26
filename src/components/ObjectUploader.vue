<script setup lang="ts">
import { ref, watch } from "vue";
import type { UploadFileInfo } from "naive-ui";
import { useMessage } from "naive-ui";

const message = useMessage();
const model = defineModel<File | null>({ default: null });
const previewUrl = ref("");
const fileList = ref<UploadFileInfo[]>([]);

watch(model, (file) => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = file ? URL.createObjectURL(file) : "";
});

function onUpdate(fileListRaw: UploadFileInfo[]) {
    model.value = fileListRaw[0]?.file ?? null;
}

function onPreviewError() {
    message.error("上传的图片无效");
}
</script>
<template>
    <div>
        <n-upload
            :default-upload="false"
            :max="1"
            accept="image/*"
            v-model:file-list="fileList"
            @update:file-list="onUpdate"
        >
            <n-button>选择图片</n-button>
        </n-upload>
        <img
            v-if="previewUrl"
            class="preview"
            :src="previewUrl"
            alt="预览"
            @error="onPreviewError"
        />
    </div>
</template>
<style scoped>
.preview {
    max-width: 200px;
    max-height: 200px;
    object-fit: contain;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 8px;
}
</style>