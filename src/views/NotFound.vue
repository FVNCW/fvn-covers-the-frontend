<template>
    <div style="text-align: center; padding: 80px 20px">
        <n-text tag="h1" depth="1">404</n-text>
        <n-text>页面不存在</n-text>
        <div style="margin-top: 16px">
            <n-button type="primary" @click="$router.push('/')">回到主页</n-button>
        </div>
    </div>
</template>