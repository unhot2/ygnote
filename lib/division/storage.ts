import { normalizeBuild, type Build } from "./build";

/**
 * /division 빌드 저장·공유. 모두 이 브라우저(localStorage)와 링크 안에서만 오가고 서버로는 보내지 않는다.
 * localStorage는 사생활 보호 모드 등에서 막힐 수 있어 모든 접근을 try/catch로 감싼다.
 */

const CURRENT_KEY = "ygnote:division-build:v1";
const NAME_KEY = "ygnote:division-build-name:v1";
const SAVED_KEY = "ygnote:division-saved:v1";
const COMPARE_KEY = "ygnote:division-compare:v1";

export interface SavedBuild {
  id: string;
  name: string;
  build: Build;
  savedAt: number;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 막혀도 시뮬레이터는 그대로 동작한다
  }
}

export const loadCurrentBuild = () => normalizeBuild(read(CURRENT_KEY));
export const saveCurrentBuild = (build: Build) => write(CURRENT_KEY, build);

export const loadBuildName = () => read<string>(NAME_KEY) ?? "내 빌드";
export const saveBuildName = (name: string) => write(NAME_KEY, name);

/** A/B 비교용으로 고정해 둔 빌드(B) */
export const loadCompareBuild = () => normalizeBuild(read(COMPARE_KEY));
export const saveCompareBuild = (build: Build | null) => write(COMPARE_KEY, build);

export function loadSavedBuilds(): SavedBuild[] {
  const list = read<SavedBuild[]>(SAVED_KEY) ?? [];
  return list.flatMap((item) => {
    const build = normalizeBuild(item.build);
    return build ? [{ ...item, build }] : [];
  });
}

export const writeSavedBuilds = (list: SavedBuild[]) => write(SAVED_KEY, list);

/** 빌드를 링크에 넣을 수 있게 UTF-8 JSON → base64url로 바꾼다 */
export function encodeBuild(build: Build, name: string): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ name, build }));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBuild(encoded: string): { name: string; build: Build } | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes)) as { name?: string; build?: unknown };
    const build = normalizeBuild(data.build);
    return build ? { name: data.name ?? "공유받은 빌드", build } : null;
  } catch {
    return null;
  }
}

/** 공유 링크는 주소의 #b= 뒤에 빌드를 담는다 (해시는 서버로 전송되지 않는다) */
export const SHARE_HASH_PREFIX = "#b=";
