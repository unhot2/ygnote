/**
 * 디비전2 네임드 보호장구. 출처: 나무위키 "톰 클랜시의 디비전 2/네임드 장비" 보호장구 항목 (2026-10 확인)
 * 네임드는 브랜드 장비의 속성(마스크·장갑·권총집·무릎보호대) 또는 탤런트(조끼·배낭) 하나가
 * "완벽한" 고유 효과로 고정된 장비다. 같은 브랜드 세트 개수에도 포함된다.
 * - attr: 고유 속성. 부가 속성 한 칸을 대신하므로 나머지 부가 속성은 1칸
 * - talent: 고유 특수효과. 조건부 효과라 "조건부 효과 적용" 토글을 따른다
 * 단일 표적 DPS로 환산하기 어려운 효과는 note로만 보여준다.
 */
import type { Bonus, GearSlotId, StatKey } from "./division-gear";

export interface NamedItem {
  id: string;
  /** 한글판 이름 */
  name: string;
  en: string;
  slot: GearSlotId;
  /** 한글판 브랜드 이름. BRANDS에 있는 브랜드면 브랜드 세트 개수에 포함된다 */
  brand: string;
  kind: "attr" | "talent";
  /** 고유 특수효과 이름 (talent일 때) */
  effectName?: string;
  desc: string;
  bonus: Bonus;
}

const stat = (s: StatKey, value: number): Bonus => ({ stats: [{ stat: s, value }] });
const amp = (label: string, value: number): Bonus => ({ amps: [{ label, value }] });
const none: Bonus = {};

type Row = [id: string, name: string, en: string, brand: string, desc: string, bonus: Bonus, effectName?: string];

function rows(slot: GearSlotId, kind: NamedItem["kind"], list: Row[]): NamedItem[] {
  return list.map(([id, name, en, brand, desc, bonus, effectName]) => ({ id, name, en, slot, brand, kind, desc, bonus, effectName }));
}

export const NAMED_ITEMS: NamedItem[] = [
  ...rows("mask", "attr", [
    ["hollow-man", "공허한 사내", "Hollow Man", "얄 기어", "+14% 생명력 대미지", stat("dth", 14)],
    ["nightwatcher", "밤의 주시자", "Nightwatcher", "길라 가드", "+100% 스캐너 펄스 가속", none],
    ["punch-drunk", "펀치드렁크", "Punch Drunk", "더글라스 & 하딩", "+20% 헤드샷 대미지", stat("hsd", 20)],
    ["chill-out", "냉각", "Chill Out", "길라 가드", "-1 비핵심 속성 슬롯, +1 빈 보호장구 개조 슬롯", none],
    ["visionario", "선지자", "Visionario", "레가투스 S.p.A.", "+50% 적정 사거리", none],
  ]),
  ...rows("chest", "talent", [
    ["ferocious-calm", "흉포한 평정심", "Ferocious Calm", "펜리르 그룹 AB", "8초 동안 엄폐한 뒤 자신·아군 종합 무기 및 스킬 대미지 +12%", stat("wd", 12), "완벽한 경계 태세"],
    ["pristine-example", "훌륭한 귀감", "Pristine Example", "아이랄디 홀딩", "8배율 이상 조준 시 1초마다 종합 무기 대미지 +6%, 최대 60%", stat("wd", 60), "완벽한 집중"],
    ["the-sacrifice", "희생양", "The Sacrifice", "프로비던스 방위산업", "주는 모든 대미지 30% 증폭, 받는 모든 대미지 60% 증폭", amp("완벽한 유리 대포", 30), "완벽한 유리 대포"],
    ["zero-fs", "무관심의 극치", "Zero F's", "배저 터프", "방어도 소진 시 방어도 100% 회복 (재사용 55초)", none, "완벽한 파괴 불가"],
    ["vedmedytsya", "베드메디츠야 조끼", "Vedmedytsya Vest", "페트로프 방위 그룹", "엄폐 중 무기 조작력 +50%", stat("wh", 50), "완벽한 지지대"],
    ["pointman", "선두병", "Pointman", "길라 가드", "방패 사용 시 5초 무적, 아군에게 방어도 50% 보너스 방어도", none, "완벽한 선봉장"],
    ["door-kickers-knock", "돌파병의 노크 소리", "Door-Kicker's Knock", "그루포 솜브라 주식회사", "스킬로 대미지를 주면 20초 동안 종합 무기 대미지 +18%", stat("wd", 18), "완벽한 불꽃"],
    ["hunter-killer", "헌터 킬러", "Hunter-Killer", "골란 기어 유한회사", "보너스 방어도 동안 1초마다 중첩, 중첩당 10m 내 적 무기 대미지 4% 복리 증폭, 최대 10중첩 (약 48%)", amp("완벽한 위협 전술", 48), "완벽한 위협 전술"],
    ["chainkiller", "학살자", "Chainkiller", "워커 해리스", "헤드샷 처치 후 30초 안에 적중 시 이전 결정타 대미지의 150% 추가 (단일 표적 DPS 미반영)", none, "완벽한 헤드헌터"],
    ["everyday-carrier", "일상 필수품", "Everyday Carrier", "벨스톤 무기고", "방어구 키트 75% 확률로 소모하지 않음, 전문화 방어구 키트 보너스 +100%", none, "완벽한 능률"],
    ["caesars-guard", "카이사르의 근위대", "Caesar's Guard", "엠프리스 인터내셔널", "스킬 처치 시 30% 확률로 스킬 재사용 대기시간 초기화", none, "완벽한 숙련병"],
    ["closer", "밀착점", "Closer", "우지나 게티카", "펄스에 탐지된 적에 대한 종합 무기 및 스킬 대미지 +20%", amp("완벽한 감시병", 20), "완벽한 감시병"],
    ["cherished", "신성", "Cherished", "합스부르크 가드", "머리 적중 시 시력 상실, 가슴 적중 시 출혈 (재사용 20초)", none, "완벽한 트라우마"],
    ["henri", "앙리", "Henri", "전격", "아군 또는 스킬 10m 내에 있으면 종합 무기 대미지 +20%", stat("wd", 20), "완벽한 동지애"],
    ["carpenter", "목수", "Carpenter", "렝모", "수류탄 반경 +75%, 수류탄 처치 시 수류탄 반환", none, "완벽한 폭탄광"],
    ["combustor", "연소기", "Combustor", "팰리세이드 제강소", "투척형 스킬 착지 후 5초마다 폭발", none, "완벽한 폭탄 배송"],
    ["bober", "보버", "Bober", "즈비아도프카 Sp. z o.o.", "방어도 30% 미만일 때 엄폐 중 헤드샷 시 방어도 30% 회복", none, "완벽한 참호 파기"],
    ["sleight", "교묘함", "Sleight", "도시 감시병", "재장전 시 보너스 방어도 +40%", none, "완벽한 재장전 방호"],
    ["equalizer", "평등한 자", "Equalizer", "유닛 합금", "치명타 적중 시 10초 동안 종합 무기 대미지 +1%, 최대 24중첩", stat("wd", 24), "완벽한 절멸"],
    ["impetus", "임피터스", "Impetus", "와이번 웨어", "스킬이 활성화돼 있거나 재사용 대기 상태가 아니면 중첩 생성", none, "완벽한 운동 탄력"],
    ["robin", "로빈", "Robin", "로열 워크스", "무기 교체 시 5초 동안 종합 무기 대미지 +28%", stat("wd", 28), "완벽한 청부업자"],
    ["benefactor", "후견인", "Benefactor", "에델바이스 GPz", "아군 회복 시 20초 동안 아군 종합 무기 및 스킬 대미지 +3~20%", none, "완벽한 공감의 결의"],
    ["trick-shot", "트릭 샷", "Trick Shot", "이미넌스 군수산업", "적 처치 시 보조 무기에 무작위 특수 탄약 1발 추가", none, "완벽한 재배치"],
    ["rushdown", "러시다운", "Rushdown", "리히터 & 카이저 유한회사", "마지막으로 스킬 대미지를 준 적에게 징표", none, "완벽한 태그 팀"],
  ]),
  ...rows("backpack", "talent", [
    ["percussive-maintenance", "물리식 기계 수리기", "Percussive Maintenance", "알프스 정상 군수산업", "스킬 처치 시 27초 동안 종합 스킬 대미지 +25%", stat("skillDmg", 25), "완벽한 기술 지원"],
    ["strategic-alignment", "전략적 조정", "Strategic Alignment", "차이나 경공업", "상태이상 부여 시 27초 동안 종합 스킬 대미지 및 회복 +20%", { stats: [{ stat: "skillDmg", value: 20 }, { stat: "repair", value: 20 }] }, "완벽한 충격과 공포"],
    ["the-gift", "은총", "The Gift", "프로비던스 방위산업", "종합 무기 대미지 +25%, 피격 시 3초 동안 비활성화", stat("wd", 25), "완벽한 경계"],
    ["devils-due", "탐탁찮은 인정", "Devil's Due", "체코 중공업 유한회사", "방어도 20% 미만일 때 치명타 적중 시 잃은 방어도 2.5% 회복", none, "완벽한 클러치"],
    ["anarchists-cookbook", "무정부주의자의 비결", "Anarchist's Cookbook", "골란 기어 유한회사", "상태이상 부여 시 27초 동안 종합 무기 대미지 +18%", stat("wd", 18), "완벽한 사악함"],
    ["force-multiplier", "충격량 증폭기", "Force Multiplier", "하나-U 기업", "적 사격 시 3초 동안 종합 스킬 대미지 +30%", stat("skillDmg", 30), "완벽한 협공"],
    ["matador", "투우사", "Matador", "워커 해리스", "적 10m 내로 들어설 때마다 보너스 방어도 +23%, 최대 3중첩", none, "완벽한 아드레날린 촉진"],
    ["liquid-engineer", "액체 엔지니어", "Liquid Engineer", "벨스톤 무기고", "적 처치 시 10초 동안 보너스 방어도 +12%, 최대 10중첩", none, "완벽한 흡혈귀"],
    ["battery-pack", "배터리팩", "Battery Pack", "엠프리스 인터내셔널", "엄폐 중 적 처치 시 스킬 재사용 대기시간 15% 감소", none, "완벽한 용의주도"],
    ["the-setup", "철저한 준비", "The Setup", "우지나 게티카", "적중한 적이 5초 동안 받는 모든 대미지 +15%", amp("완벽한 기회주의", 15), "완벽한 기회주의"],
    ["hermano", "헤르마노", "Hermano", "브라조스 데 아쿼버스", "설치 스킬 15m 내 아군 재장전 속도 +30%, 재사용 대기시간 감소", none, "완벽한 오버클럭"],
    ["the-courier", "배달부", "The Courier", "합스부르크 가드", "상태이상 부여 시 대상 10m 내 모든 적에게도 부여", none, "완벽한 서서히 다가오는 죽음"],
    ["lavoisier", "라부아지에", "Lavoisier", "전격", "특정 상태이상 부여 시 30m 내 아군에게 방어도 50% 보너스 방어도", none, "완벽한 충격 요법"],
    ["backbone", "근본", "Backbone", "렝모", "적 처치 시 15초 동안 종합 무기 대미지 +7%, 최대 5중첩", stat("wd", 35), "완벽한 무적의 부대"],
    ["festive-delivery", "축제 배송", "Festive Delivery", "그루포 솜브라 주식회사", "고폭 수류탄이 축제 수류탄으로 변경", none, "폭죽 쇼"],
    ["proxy", "프록시", "Proxy", "팰리세이드 제강소", "하이브·터렛·원격 펄스·미끼 3m 내 적에게 충격 부여", none, "완벽한 간섭 방지"],
    ["vigil", "철야", "Vigil", "레가투스 S.p.A.", "서로 다른 주 무기와 예비 무기 교체 시 10초 동안 종합 무기 대미지 증폭 (수치 미기재)", none, "완벽한 팔방미인"],
    ["axel", "악셀", "Axel", "샤이니 멍키 보호장구", "방어구 키트 사용 시 15초 동안 스킬 등급 +1", none, "완벽한 원기 충천"],
    ["capn", "캡틴", "Cap'n", "이미넌스 군수산업", "엄폐물 간 이동 시 모든 아군에게 방어도 20% 보너스 방어도", none, "완벽한 리더십"],
    ["bulldog", "불독", "Bulldog", "로열 워크스", "엄폐 상태일 때 종합 무기 대미지 +20%", stat("wd", 20), "완벽한 태연자약"],
    ["momma-badger", "마마 배저", "Momma Badger", "에델바이스 GPz", "방어도가 최대일 때 종합 스킬 회복 +160%", none, "완벽한 안전장치"],
    ["melon-baller", "멜론 볼러", "Melon Baller", "아이랄디 홀딩", "헤드샷 적중 시 1.5초 동안 종합 무기 대미지 +20% (지정사수소총은 5초)", stat("wd", 20), "완벽한 뇌진탕"],
    ["keeper", "수호자", "Keeper", "5.11 Tactical", "방패 손상 시 보너스 방어도 +25%, 아군에게 방어도 35% 보너스 방어도", none, "완벽한 수호병"],
  ]),
  ...rows("gloves", "attr", [
    ["contractors-glove", "청부업자의 장갑", "Contractor's Glove", "페트로프 방위 그룹", "+8% 방어도 대상 대미지", stat("dta", 8)],
    ["deathgrips", "Deathgrips", "Deathgrips", "5.11 Tactical", "+10% 적 처치 시 방어도 회복", stat("armorOnKill", 10)],
    ["firm-handshake", "굳은 악수", "Firm Handshake", "소콜로프 상사", "+16% 상태이상 효과", stat("status", 16)],
    ["motherly-love", "모성애", "Motherly Love", "알프스 정상 군수산업", "+25% 스킬 생명력", none],
    ["eagles-grasp", "이글의 손아귀", "Eagle's Grasp", "즈비아도프카 Sp. z o.o.", "+15% 무기 조작력", stat("wh", 15)],
  ]),
  ...rows("holster", "attr", [
    ["claws-out", "날카로운 발톱", "Claws Out", "와이번 웨어", "+500% 근접 대미지, +11% 권총 대미지", stat("pistolDmg", 11)],
    ["forge", "용광로", "Forge", "리히터 & 카이저 유한회사", "+50% 방패 생명력", none],
    ["ammo-dump", "탄약고", "Ammo Dump", "배저 터프", "+10% 탄약 휴대량", stat("ammo", 10)],
    ["picaros-holster", "피사로의 권총집", "Picaro's Holster", "브라조스 데 아쿼버스", "+10% 무기 대미지", stat("wd", 10)],
    ["spot-on", "정확한 타격", "Spot-On", "도시 감시병", "+38% 명중률", stat("accuracy", 38)],
    ["salvo", "탄두", "Salvo", "유닛 합금", "+5% 발사 속도", stat("rof", 5)],
  ]),
  ...rows("kneepads", "attr", [
    ["emperors-guard", "황제의 근위병", "Emperor's Guard", "무라카미 산업", "+1% 방어도 재생", stat("armorRegenPct", 1)],
    ["foxs-prayer", "여우의 기도", "Fox's Prayer", "오버로드 군수산업", "+8% 비엄폐 대상 대미지", stat("dtooc", 8)],
    ["grease", "그리즈", "Grease", "샤이니 멍키 보호장구", "+16% 상태이상 효과", stat("status", 16)],
    ["cloak", "망토", "Cloak", "이미넌스 군수산업", "+50% 위협 수준 감소", none],
  ]),
  // 무릎보호대지만 속성 대신 고유 특수효과가 붙는 네임드
  ...rows("kneepads", "talent", [
    ["turmoil", "터모일", "Turmoil", "체코 중공업 유한회사", "무기 대미지의 50%를 30m 내 다른 적이 대신 받음 (단일 표적 DPS 미반영)", none, "이게 아닌데"],
    ["snow-machine", "스노우 머신", "Snow Machine", "전격", "부여한 모든 상태이상에 설경 적용", none, "눈보라"],
  ]),
];
