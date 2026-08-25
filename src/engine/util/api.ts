export function apiBase(path: string = "/"): string {
	return new URL(path, import.meta.env.VITE_API_URL).toString();
}
export function authorizableFetch(url: string, method: string, body: object | null = null, authorize: boolean = true) {
	return fetch(apiBase(url), {
		method,
		body: JSON.stringify(body),
		credentials: authorize ? "include" : "omit",
		headers: {
			"Content-Type": "application/json"
		}
	});
}
