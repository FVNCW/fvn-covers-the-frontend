import { ref } from "vue";
import "@vue/shared";

export function useAsyncData<T>() {
	const data = ref<T | null>(null);
	const error = ref<unknown>(null);
	const loading = ref(false);
	async function push<R>(promise: Promise<R>, afterResolve: (data: R) => T): Promise<T | null> {
		loading.value = true;
		try {
			const result = afterResolve(await promise);
			data.value = result;
			loading.value = false;
			return result;
		} catch (e) {
			data.value = null;
			error.value = e;
			loading.value = false;
			return null;
		}
	}
	return { data, loading, error, push };
}
