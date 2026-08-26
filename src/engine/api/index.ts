import { authorizableFetch } from "../util/api";
export interface ColorRGB {
    r: number;
    g: number;
    b: number;
}
export type ComposedColor = ColorRGB[];
export interface Information {
    background: string;
    sources: string[];
    personality: string;
    description: string;
}
export interface ColorDic {
    fur: ComposedColor;
    eye: ComposedColor;
    other: Record<string, ComposedColor>;
}
export interface RelationShips {
    parents: number[];
    friends: number[];
    children: number[];
    other: Record<string, number[]>;
}
export interface Character {
    id: number;
    createdBy: string;
    tags: string[];
    illustrations: number[];
    displayName: string;
    isDied: boolean;
    isFemale: boolean;
    information: Information;
    specy: number[] | number;
    height: number;
    length: number;
    color: ColorDic;
    relationShips: RelationShips;
}
export interface CharacterCreation {
    tags: string[];
    displayName: string;
    isDied: boolean;
    isFemale: boolean;
    information: Information;
    specy: number[] | number;
    height: number;
    length: number;
    color: ColorDic;
    relationShips: RelationShips;
}
export interface Specy {
    id: number;
    displayName: string;
    parents: number[];
    conflictWith: number[];
}
export interface Illustration {
    id: number;
    objectId: string;
    displayName: string;
    tags: string[];
}
export interface TextureObject {
    id: string;
    hash: string;
    uploader: string;
}
export type ContentType = "character" | "object" | "illustration" | "specy";
export type FieldType = "string&array" | "number" | "color";
export interface StringArrayFilter {
    mode: "equal" | "include";
    value: string;
}
export interface NumberFilter {
    mode: "inRange" | "closet";
    pattern?: { a: number; b: number };
}
export interface ColorFilter {
    target: string;
    allowOffset: string;
}
export interface FieldFilter {
    key: string | null;
    "string&array"?: StringArrayFilter;
    number?: NumberFilter;
    color?: ColorFilter;
}
export interface EqualCondition {
    type: "equal";
    filter: FieldFilter;
    fieldType: FieldType[];
}
export interface ComposeCondition {
    type: "compose";
    composeType: "and" | "or";
    filters: AnyCondition[];
    fieldType: FieldType[];
}
export type AnyCondition = EqualCondition | ComposeCondition;
async function read<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
}
export const api = {
    characterToday: async (seed?: string) => {
        const q = seed ? `?seed=${encodeURIComponent(seed)}` : "";
        const r = await authorizableFetch(`/api/character/today${q}`, "GET", null, false);
        return await read<Character>(r);
    },
    characterList: () =>
        authorizableFetch("/api/character/list", "GET", null, false).then((r) =>
            read<Character[]>(r),
        ),
    characterData: (id: number) =>
        authorizableFetch(`/api/character/data/${id}`, "GET", null, false).then((r) =>
            read<Character>(r),
        ),
    specyList: () =>
        authorizableFetch("/api/specy/list", "GET", null, false).then((r) => read<Specy[]>(r)),
    objectList: () =>
        authorizableFetch("/api/object/list", "GET", null, false).then((r) =>
            read<TextureObject[]>(r),
        ),
    illustrationList: () =>
        authorizableFetch("/api/illustration/list", "GET", null, false).then((r) =>
            read<Illustration[]>(r),
        ),
    objectInfo: (id: string) =>
        authorizableFetch(
            `/api/object/metadata/${encodeURIComponent(id)}`,
            "GET",
            null,
            false,
        ).then((r) => read<TextureObject>(r)),
    tryMix: async (specy: string[]) => {
        const qs = new URLSearchParams();
        specy.forEach((s) => qs.append("specy", s));
        const r = await authorizableFetch(`/api/specy/try-mix?${qs}`, "GET", null, false);
        return await read<{ a: Specy; b: Specy }[]>(r);
    },
    objectUpload: (data: string) =>
        authorizableFetch("/api/object/upload", "POST", { data }).then((r) =>
            read<TextureObject>(r),
        ),
    objectModify: (id: string, data: string) =>
        authorizableFetch(`/api/object/modify/${encodeURIComponent(id)}`, "PUT", { data }).then(
            (r) => read<TextureObject>(r),
        ),
    objectDelete: (id: string) =>
        authorizableFetch(`/api/object/delete/${encodeURIComponent(id)}`, "DELETE").then((r) =>
            read<{ success: boolean; message: string }>(r),
        ),
    characterCreate: (body: CharacterCreation) =>
        authorizableFetch("/api/character/create", "POST", body).then((r) => read<Character[]>(r)),
    characterDelete: (id: number) =>
        authorizableFetch("/api/character/delete", "DELETE", { id }).then((r) =>
            read<Character>(r),
        ),
    illustrationAdd: (
        character: number,
        illustration: { objectId: string; displayName: string; tags: string[] },
    ) =>
        authorizableFetch("/api/illustration/add", "POST", { character, illustration }).then((r) =>
            read<Illustration[]>(r),
        ),
    illustrationDelete: (id: number) =>
        authorizableFetch(`/api/illustration/delete/${id}`, "DELETE").then((r) =>
            read<Illustration>(r),
        ),
    specyCreate: (parents: number[], displayName: string, conflictWith: number[]) =>
        authorizableFetch("/api/specy/create", "POST", { parents, displayName, conflictWith }).then(
            (r) => read<Specy[]>(r),
        ),
    specyDelete: (id: number) =>
        authorizableFetch(`/api/specy/delete/${id}`, "DELETE").then((r) => read<Specy>(r)),
    specyRename: (id: number, displayName: string) =>
        authorizableFetch(`/api/specy/rename/${id}`, "PATCH", { displayName }).then((r) =>
            read<Specy>(r),
        ),
    search: (type: ContentType, condition: AnyCondition) =>
        authorizableFetch("/api/search", "POST", { type, condition }).then((r) =>
            read<(Character | TextureObject | Illustration | Specy)[]>(r),
        ),
};
