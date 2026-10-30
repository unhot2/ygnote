/**
 * 디비전2 특급 보호장구. 출처: 나무위키 "톰 클랜시의 디비전 2/특급 장비" 보호장구 항목 (2026-10 확인)
 * 특급 보호장구는 대부분 핵심 속성·비핵심 속성·특수효과가 고정이다.
 * - core: 고정 코어. "any"면 직접 고른다 (메멘토·투자자 등)
 * - attrs: 비핵심 속성. MINOR_ATTRIBUTES id면 고정, "any"면 직접 고르고, "text:..."는 계산하지 않는 속성 이름
 * 브랜드 세트 개수에는 들어가지 않는다. 특수효과는 "조건부 효과 적용" 토글을 따른다.
 */
import type { Bonus, CoreId, GearSlotId, StatKey } from "./division-gear";

export interface ExoticGear {
  id: string;
  name: string;
  en: string;
  slot: GearSlotId;
  core: CoreId | "any";
  attrs: string[];
  /** 보호장구 개조 슬롯이 있는지 */
  mod: boolean;
  talentName: string;
  desc: string;
  bonus: Bonus;
}

const stat = (s: StatKey, value: number): Bonus => ({ stats: [{ stat: s, value }] });
const stats = (...list: [StatKey, number][]): Bonus => ({ stats: list.map(([s, value]) => ({ stat: s, value })) });
const amp = (label: string, value: number): Bonus => ({ amps: [{ label, value }] });
const none: Bonus = {};

type Row = [id: string, name: string, en: string, core: ExoticGear["core"], attrs: string[], mod: boolean, talentName: string, desc: string, bonus: Bonus];

function rows(slot: GearSlotId, list: Row[]): ExoticGear[] {
  return list.map(([id, name, en, core, attrs, mod, talentName, desc, bonus]) => ({ id, name, en, slot, core, attrs, mod, talentName, desc, bonus }));
}

/** 장착한 브랜드·기어세트 개수를 하나씩 늘려 주는 특급 배낭 */
export const NINJABIKE_BACKPACK_ID = "ninjabike-backpack";

export const EXOTIC_GEAR: ExoticGear[] = [
  ...rows("mask", [
    ["coyotes-mask", "코요테의 마스크", "Coyote's Mask", "red", ["chc", "chd"], true, "무리 본능", "마지막으로 적중한 적과의 거리에 따라 아군 보너스 (0~15m 치명타 대미지 +25% 가정)", stat("chd", 25)],
    ["vile", "불쾌", "Vile", "yellow", ["status", "text:상태이상 저항"], true, "독성 전파", "상태이상 효과가 10초 동안 지속 대미지 디버프를 추가로 부여", none],
    ["catharsis", "카타르시스", "Catharsis", "blue", ["text:받는 치유 효과", "armorRegen"], true, "악순환", "피격마다 무기 대미지 +1.5%, 최대 30중첩 (최대 중첩 가정)", stat("wd", 45)],
    ["the-catalyst", "카탈리스트", "The Catalyst", "red", ["text:상태이상 저항", "status"], true, "화학 요원", "상태이상을 가하거나 받으면 중첩당 무기 대미지·상태이상 효과 +2%, 최대 12중첩", stats(["wd", 24], ["status", 24])],
    ["tinkerer", "땜장이", "Tinkerer", "red", ["chc", "chd"], true, "요약", "주 무기·예비 무기가 같은 유형의 일반 무기면 예비 무기 특수효과가 주 무기에도 적용", none],
    ["investor", "투자자", "Investor", "any", ["any", "any", "any"], false, "장착됨", "비핵심 속성 색상마다 보너스 (빨강 치명타 대미지 +10%, 노랑 스킬 효율 +5%, 파랑 방어도 재생 +1%), 개조 대신 세 번째 속성", none],
  ]),
  ...rows("backpack", [
    ["acostas-go-bag", "아코스타의 비상 가방", "Acosta's Go-Bag", "yellow", ["skillHaste", "skillDmg"], true, "손에 하나...", "수류탄 투척 시 돌려받고 15초 동안 스킬 등급 +1 (6등급이면 과충전)", none],
    ["memento", "메멘토", "Memento", "any", ["any", "any"], true, "사살 확인", "처치 시 트로피 획득, 300초 동안 무기 대미지 +1%씩 최대 30중첩 (최대 중첩 가정)", stat("wd", 30)],
    [NINJABIKE_BACKPACK_ID, "닌자바이크 메신저 백팩", "Ninjabike Messenger Backpack", "any", ["any", "any"], true, "팔방미인", "장착한 브랜드·기어세트 개수를 각각 1개씩 늘려 세트 효과를 잠금 해제", none],
    ["birdies-quick-fix", "버디의 긴급 수리 팩", "Birdie's Quick Fix Pack", "yellow", ["skillHaste", "repair"], true, "전투 의무병", "소생 속도·하이브 효율 증가, 소생 성공 시 스킬 등급 +1", none],
    ["harrier-pride", "해리어 자부심", "Harrier Pride", "any", ["any", "any"], true, "재조정", "적중 3회마다 무기 대미지 +0.5% 중첩 (평균 +20% 가정)", stat("wd", 20)],
    ["sarru", "사루", "Sarru", "any", ["any", "any"], true, "미끼의 왕", "5초마다 달 형태가 바뀌며 모든 대미지 5~25% 증폭 (평균 15% 가정)", amp("미끼의 왕", 15)],
  ]),
  ...rows("chest", [
    ["tardigrade", "\"타디그레이드\" 방탄복 시스템", "\"Tardigrade\" Armor System", "blue", ["explosiveRes", "armorRegen"], true, "단열 나노 장갑판", "자신·아군 방어도 소진 시 방어도의 80% 보너스 방어도", none],
    ["ridgeways-pride", "리지웨이의 자부심", "Ridgeway's Pride", "red", ["chc", "chd"], true, "서슬 퍼런 첨단", "15m 내 적 사격 시 출혈, 출혈 적 수에 따라 방어도 회복", none],
    ["collector", "수집가", "Collector", "red", ["chc", "chd"], true, "수집병자", "수류탄 휴대량·반경·대미지 증가", none],
    ["provocator", "선동가", "Provocator", "blue", ["armorRegen", "text:상태이상 저항"], true, "도전자", "20m 내 적으로부터 대미지 저항 +25%", none],
    ["beacon", "신호기", "Beacon", "red", ["chc", "chd"], true, "유대", "아군이 10m 이내면 치명타 대미지 +30%, 스킬 효율 +15%, 방어도 재생 +2%", stat("chd", 30)],
    ["iron-will", "강철의 의지", "Iron Will", "red", ["hsd", "wh"], true, "결의", "다음 바디샷이 헤드샷으로 적용 (재사용 2초, 지정사수소총·소총·권총)", none],
  ]),
  ...rows("gloves", [
    ["btsu-data-gloves", "BTSU 데이터 장갑", "BTSU Data Gloves", "yellow", ["skillHaste", "repair"], false, "오버클럭 전이", "스킬 등급당 하이브 스킬 가속 +15%, 하이브 기폭 시 재사용 초기화·과충전", none],
    ["bloody-knuckles", "핏빛 너클", "Bloody Knuckles", "red", ["chc", "chd"], false, "상식 초월", "수류탄·근접 적중 시 20초 동안 무기 대미지 +25%", stat("wd", 25)],
    ["rugged-gauntlet", "러기드 건틀릿", "Rugged Gauntlet", "red", ["chc", "chd"], false, "강철의 손아귀", "무기 조작력 +50%", stat("wh", 50)],
    ["exodus", "엑소더스 장갑", "Exodus", "red", ["chc", "chd"], false, "연막 전술", "방어도 소진 시 연막탄으로 3초 동안 모습 감춤", none],
    ["overdogs", "오버독스", "Overdogs", "red", ["chc", "chd"], false, "가장 약한 고리", "가장 낮은 등급의 적에 대한 무기 대미지 30% 증폭", amp("가장 약한 고리", 30)],
  ]),
  ...rows("holster", [
    ["dodge-city", "닷지 시티의 총잡이 권총집", "Dodge City Gunslinger's Holster", "red", ["wh", "hsd"], false, "속사", "권총 수납 중 중첩, 교체 후 첫 탄환이 중첩당 +10% 대미지 헤드샷", none],
    ["imperial-dynasty", "제국의 왕가", "Imperial Dynasty", "yellow", ["status", "text:상태이상 저항"], false, "용의 시선", "20m 내 가장 가까운 적에게 화상 (재사용 35초)", none],
    ["waveform", "웨이브폼", "Waveform", "yellow", ["skillDmg", "skillHaste"], false, "교류", "1초마다 한 스킬의 대미지 +3%, 최대 10중첩", stat("skillDmg", 30)],
    ["shocker-punch", "쇼커 펀치", "Shocker Punch", "blue", ["explosiveRes", "text:상태이상 저항"], false, "제세동기", "충격 기절 감소, 방패 사용 시 근접 대미지 증가", none],
    ["centurions-scabbard", "백인대장의 칼집", "Centurion's Scabbard", "red", ["wh", "chc"], false, "카운터", "무기 교체 시 12초 동안 발사 속도·무기 대미지 +20% (첫 번째 보너스 가정)", stats(["rof", 20], ["wd", 20])],
    ["nimble-holster", "민첩 권총집", "Nimble Holster", "red", ["chc", "chd"], false, "회피의 달인", "엄폐물 간 이동 1m마다 방어도 5% 회복", none],
  ]),
  ...rows("kneepads", [
    ["sawyers-kneepads", "소여의 무릎 보호대", "Sawyer's Kneepads", "blue", ["explosiveRes", "text:생명력"], false, "결사 항전", "움직이지 않으면 1초마다 종합 무기 대미지 +3%, 최대 10중첩", stat("wd", 30)],
    ["ninjabike-kneepads", "닌자바이크 메신저 무릎 보호대", "Ninjabike Messenger Kneepads", "red", ["chc", "chd"], false, "파쿠르!", "엄폐물 이동·뛰어넘기 시 재장전되고 5초 동안 보너스 방어도 +25%", none],
    ["acostas-kneepads", "아코스타의 무릎 보호대", "Acosta's Kneepads", "red", ["any", "any"], false, "탈출 계획", "이동 속도 +20%", none],
    ["blacklisters", "블랙리스터", "Blacklisters", "red", ["chc", "chd"], false, "소외", "표시하지 않은 적에게 증폭 대미지 +30% (표시된 적에게 받는 대미지 600% 증폭)", amp("소외", 30)],
    ["nurses-kneepads", "간호사의 무릎 보호대", "Nurse's Kneepads", "red", ["chc", "chd"], false, "불굴", "자신과 10m 내 아군 상태이상 저항 +40%", none],
  ]),
];

export function findExoticGear(id: string): ExoticGear | undefined {
  return EXOTIC_GEAR.find((g) => g.id === id);
}

/**
 * 특급 보호장구 이미지. 나무위키 "톰 클랜시의 디비전 2/특급 장비" 문서에 올라온 이미지를 그대로 링크한다 (2026-10 확인).
 * 값은 https://i.namu.wiki/i/ 뒤의 파일 키(.webp 제외)이고, "/"로 시작하면 public/의 로컬 이미지다.
 * 이미지가 없는 장비는 부위 실루엣으로 대신한다.
 */
export const EXOTIC_GEAR_IMAGES: Record<string, string> = {
  "coyotes-mask": "C8JGOp94DxCiIrW0fjki-fmhpFhKmJS2Cs8EWnpC_PUwqYaC2S_izThIzkFbQMsnR1HhKAOXBQ734dzrotK17Fq259RsQnUplGh7Tzarl9oss40p0jsOC2veXnXlnRr0egCvvIa_10P0Wru8RFgyaA",
  "vile": "_hOMS9zplhaR_DLHeaL_OTJqYTMwuQdhU1ajW-s38-WNOXdFFNc2IDODeBDvu4QBDNANW9W3bs5jAa1W31avXH-AalIbcZZdLq7hllktucS1_Axm858jaLZXBeFGf3xCMYgPRxBpcWR7WtfdeuTy9Q",
  "catharsis": "ceiKXcLpkJVDBvy-FfWRqDum0NnCGWoJeR09m8gFo39HLqbf0D_VgNKl_MCT_Y9vOKMD6Q1yajzZm7nehwD_pt1eXm15el8Lbsrz6PA2jSxY_46SSX-9lINyddIlJUXqeVV9jHKX1BwZNliVOgGZIA",
  "the-catalyst": "z4pukbjVLJa2hHBDYTY2kFJZ1a7m6TV8-nKmD85VUi9dswP4MSAIcO1E7OYSIiqvS63T1_DfuaE0c_Ee_O4TOAV7GWBtdjhG9EVEQqLJnuat6AjATCO8M-k_tdoH-185NNQfPcoM5Y7yubqzbAm0nA",
  "tinkerer": "zEur0xKOivBS-uPsMejbf1LQ1CwizlRfdnCPt8pJiBam_gkAwD8RzvlV_jSejwd6HmbMwV_ypOWphaGIY40PCAy3AV7w739RS-v2V29EqoLP3KIbMd_ggxVSqhZskRE4nCRMC93AzWbTJpbktP2kQA",
  "acostas-go-bag": "PLujKC4Jp2k-2mwJ8VisFofmZLf9SD0lvi-Hg6qcETFracGl6ks6syvs9EVJyV2tB73h9osocRcaXC0PKFFcIzd6YzoXltlQzkyxlAVxaRTH-ZztzjiL99BDxzMQk-tmzs-iV7_MQkOCOpJ0x6KxyQ",
  "memento": "sfvN6SNoMLmmIU5MDYkxR3XFLzYTm8kaLjjhejXxCBT6G-5mfsRYr0RGFvu-bZWiRZOGOClH4_b6BEkzRaFBKtYcmE9ODB7KxIDq__wh1rPBvvzuH8M_sDsVdVxsCpI8ITEl4FDBKEdxo4YDs3UecQ",
  "birdies-quick-fix": "fDJH2K5aNt9N3OzlfXt2_U5a6J2bWebuhhaoS4a_30W5WwN-TmlbW2XEMM2ynp0kxWKmjNJ2uAwabvH-HuHcSzuvtzzfToinawmImALIhWZAOg5fngJrRnowwWCWbBtUUXB3EIqZisqEYTiaRXPjbQ",
  "sarru": "gsE2PVDbpg2Wl-IabStoEIb4eLr2d9jrvwNCwVJOm20xDSjYNAtmj4KuOiHT3wlOSx4fz41FCOGE4Z0PZA25ZgiAm2_6SiZk87jCx7Xsrf53GliY45-lnStQUr3AkaEWF6C0UoRqVTRvLlUqbm3egQ",
  "tardigrade": "lfgqj29v1ApZeu0ItfedDRhzDZcDJSc_YtSS9FHMcvuxYhmP_ayJz_wvyeAh_nMd9eLzjwhYpb4FpGIMqVgOPaD2I2UlHCdRvnxzQaAl78KfW38oJvEeK2Sb7E-i9cTCi3LR-_9bBCodjO6Dq2dW_Q",
  "ridgeways-pride": "FMzaJ4t-IaMwQEzGbSohEiyFEKTTFsZZsD-IvSDfnR1tmCVTxY7hTLXwAWmCHKWoLKBlUQtbiBwYOzfqOVyc1p16qNieYurf0COox0aKN08vqy0GkBMV1Xbi1cNAsxyva2dmRWwaQMtYO4A13fFsxw",
  "collector": "80c8zsXG2FqTTzIOBLaYWvn3s-RzCfcAdauUrSnsGZgCAhP9_JRH8qXaJnzXaVqr3u4Ms1D6DDFB0uKyjMwWUds9pVVAfSWEqseXEh2MRFXWHHcot36sPpbrW_PswSLq7ldR3CZErN0vq_Dd0VRNag",
  "provocator": "TDQFrd0HIUQM8p6oh-nWw-IX-qnaFRE9TAoSTfwpOHbIetkHs2U8pZ3Z___oHLAUT0lFFzjw3KuBPYoMtDwfAau2RW9tZvg1EaTPYDpALc-r3Rq_T0-N2dqPQWpOhwf0hAUqhai8fMA0w2x4h2lEPQ",
  "beacon": "UUiiYVY-1-xgoS7PtD3wXAa6t_1_VOAiBEH6Dx4kORVj31BacpGsLUQ6vJwc1XcjQ6QJrVni6l2NrLh58EFtj4-ByF8yeGwkgMCTKpk67uLCwxot-Y3yziiDPn7LE8I4f4mEv3LHpmjzea6UqMfPdw",
  "iron-will": "kS5pGaexkznSLPM9jlsZv4HO2hrvFd5lsmcKm3QWywDf9N8fFE7CSASRt41vcU5fhIpJF-MOrq26Y6doX9KYiQjZBGbnR42g1F0vpMb6kD1dVH1McL_zjbSP-TJj4WR7On12p-tQ_ZEclqlDF7eYFQ",
  "btsu-data-gloves": "g7OJgKZ_LPnWkjets7dxdXjYnwPNGaLTlA6N8hMvMqV6wgKmOKAAo0VQIQa-mYf_mL56cqZo8e1L4AQt3UT8WJrqwgskD7IdJRui3ncrhmxNR-Is8lTsfWmQtO_7Y_NpVyRoc6cJFwdAl8QDJhE2vg",
  "exodus": "b5c1MHQGYKIXuJC8vNq_S-OKBv-e8EMpC0d5NggLDKgIsBSO87x2xZ7Jx8ld4YVywKMjloq_i-LOrLbG6GuAxpBj026oSQWxie7e4mbT_HXNGw7U4OP_OoypDPNzRx1x7qcLt7CkW5vjCYL7oKTGNQ",
  "overdogs": "N_TBe5gbBLl-mBfTYg1NBFW547QzPYLQJHmFD4WiQF1OqEYR-9_3Hiy_mOhrWcwkyqvBg4Q_jJAbrBpe1QF7BT_NY4Xl61-uLEOw2_m59gg5Ds6bCuQOzH63gcwo8kOodwK3FT3Qkh6ZLAcLgn84rw",
  "dodge-city": "9ArypkBITFNvvnsodqzHgzVJ8PD15JkDV027X2wSkKHVvDHQbxbmSTJhKPK51_nV_wLzCfC8BBSnhvF3mbod08ZkgM6GZFM9-LE-8j9xBdSvAfTTVHqD0Dm0MDCWpqnF2AwFd9qcCrOZlI2CU0G6Hw",
  "imperial-dynasty": "mqNL93aPU41Vk_HyQfpniNSC8t7A__6qm3eY8NXdQuGp6UefDwID5v10oiZU7_407byC3ViCOZ5Y4ee4KxLF-JtekLwVVMk9mPYBgpENy_2PoF2ejqcIkAalvaLzWSg4oWivlJFqELnSlHps9iCx5A",
  "sawyers-kneepads": "TfcmMfd7p081VzPnJc5SRdIIUHdodrKhP3xp7TOknPMrUl-0jLhVxcsIhnK_6E0LJU6-17rn2lA9ZHIs_IRO-JN02eCBDgAUgGuXJcoerQC0HjVJU11lZrM4Z8EgF-j3ipI4KUwJbjNsf5B6GFZ2UQ",
  "ninjabike-kneepads": "yLB1PHS7fF5hhxH58yZ9yrlSZzCzTBJsSbbh0HwOsiJDvZPci66kul4LzT-zNEbx89btbtSrwVMbVT7YIlXcJxZ7qdBjWYZz0xd0d9SjSgD5Igso7iqL3w6Kfe4UZ-bw5eNCWgcYC86IXhKrRZlKZA",
  // 나무위키에 없는 장비는 팬덤 위키·KeenGamer 홍보 이미지에서 장비 부분만 정사각형으로 잘라 public/에 뒀다
  "investor": "/division/gear/investor.webp",
  "ninjabike-backpack": "/division/gear/ninjabike-backpack.webp",
  "bloody-knuckles": "/division/gear/bloody-knuckles.webp",
  "rugged-gauntlet": "/division/gear/rugged-gauntlet.webp",
  "waveform": "/division/gear/waveform.webp",
  "shocker-punch": "/division/gear/shocker-punch.webp",
  "centurions-scabbard": "/division/gear/centurions-scabbard.webp",
  "nimble-holster": "/division/gear/nimble-holster.webp",
  "blacklisters": "/division/gear/blacklisters.webp",
  "nurses-kneepads": "/division/gear/nurses-kneepads.webp",
};

export function exoticGearImage(id: string): string | undefined {
  const key = EXOTIC_GEAR_IMAGES[id];
  if (!key) return undefined;
  return key.startsWith("/") ? key : `https://i.namu.wiki/i/${key}.webp`;
}
