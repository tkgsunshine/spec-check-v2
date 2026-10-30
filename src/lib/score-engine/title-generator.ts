import {
  CharacterTypeAxis,
  CharacterTypeRef,
  DiagnosisInputV3,
  EpithetResult,
  OverallDiagnosisResultV3,
} from '@/types/spec-check';

/**
 * MBTI風「16キャラタイプ」判定エンジン
 *
 * 総合モード・恋愛モードそれぞれ 4軸 × 2択 = 16タイプ。
 * ティア（SS〜C）はスコアで決まり、タイプはスコアの「バランス・傾向」で決まる。
 * 各軸の基準値は、カテゴリスコアの中央値付近に置いて、どちらかに偏りすぎないようにしている。
 */

export interface CharacterTypeDef {
  code: string;
  name: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
}

type CategoryScores = OverallDiagnosisResultV3['categoryScores'];
type LoveCategoryScores = OverallDiagnosisResultV3['loveCategoryScores'];

// ───────────────────────── 総合モード ─────────────────────────
// 軸1 M 財力 / B 知力、軸2 C 組織 / G 越境、軸3 L 発信 / Q 潜伏、軸4 F 見た目 / D 中身

export const OVERALL_TYPES: Record<string, CharacterTypeDef> = {
  MCLF: { code: 'MCLF', name: '覇王', emoji: '👑', title: '会社の顔になる王道エース', subtitle: '稼ぐ力・存在感・見た目がそろった組織のど真ん中。どこにいても自然と中心に立つ王道タイプ', color: 'from-amber-300 via-yellow-200 to-amber-500' },
  MCLD: { code: 'MCLD', name: '人たらし', emoji: '🥂', title: '会う人みんな味方にする天性の人たらし', subtitle: '一度話せば誰とでも打ち解ける。組織の看板と人脈を武器に、会話ひとつで仕事とお金を引き寄せる', color: 'from-orange-300 via-amber-200 to-rose-400' },
  MCQF: { code: 'MCQF', name: 'ガーディアン', emoji: '🛡️', title: '黙々と稼ぐ鉄壁の守護者', subtitle: '目立たずとも結果は確実。自己管理と安定収入で、周りを静かに守り抜く頼れる存在', color: 'from-slate-300 via-sky-200 to-blue-400' },
  MCQD: { code: 'MCQD', name: '金庫番', emoji: '🏦', title: '静かに資産を積み上げる堅実派', subtitle: '派手さより確実さ。組織の安定基盤の上で、着実にお金と信頼を貯めていくタイプ', color: 'from-emerald-300 via-teal-200 to-cyan-400' },
  MGLF: { code: 'MGLF', name: '成り上がり', emoji: '👊', title: '実力ひとつでのし上がる成り上がり', subtitle: '組織に頼らず、腕っぷしと存在感で市場を切り開く。欲しいものは自分の手でつかみ取る野心家', color: 'from-amber-400 via-orange-300 to-red-400' },
  MGLD: { code: 'MGLD', name: '革命児', emoji: '🔥', title: '常識をひっくり返す令和の革命児', subtitle: '語る夢に人とお金が集まる。発信力と行動力で業界の当たり前を壊し、ゼロから稼ぐ仕組みを作る', color: 'from-fuchsia-400 via-pink-300 to-orange-300' },
  MGQF: { code: 'MGQF', name: '一匹狼', emoji: '🐺', title: '群れずに稼ぐ孤高のハンター', subtitle: '馴れ合いは不要。鍛えた体と実力だけで獲物を仕留める、寡黙で自由なハンター', color: 'from-slate-400 via-indigo-300 to-slate-200' },
  MGQD: { code: 'MGQD', name: 'フィクサー', emoji: '🦉', title: '裏で富を動かす影の投資家', subtitle: '表には出ないが、気づけば一番稼いでいる。冷静な判断で資産を動かす影の実力者', color: 'from-violet-400 via-purple-300 to-emerald-300' },
  BCLF: { code: 'BCLF', name: '生徒会長', emoji: '⭐', title: '文武両道のみんなのリーダー', subtitle: '頭脳も見た目も発信力も高水準。組織の中で自然と推される、優等生型のリーダー', color: 'from-sky-300 via-indigo-300 to-violet-400' },
  BCLD: { code: 'BCLD', name: '伝道師', emoji: '📣', title: '知識を広める令和の伝道師', subtitle: '学んだことを人に伝えずにはいられない。組織の中で「あの人に聞けば大丈夫」と頼られる知の発信源', color: 'from-blue-400 via-indigo-300 to-violet-500' },
  BCQF: { code: 'BCQF', name: '参謀', emoji: '♟️', title: '冷静沈着な組織の参謀', subtitle: '表に立たずとも戦略はこの人から。自己管理も完璧な、組織に欠かせない頭脳派ナンバー2', color: 'from-cyan-300 via-blue-300 to-indigo-500' },
  BCQD: { code: 'BCQD', name: '生き字引', emoji: '📜', title: '組織のすべてを知る生き字引', subtitle: '深い知識と落ち着いた判断で、組織を内側から支える。困ったときに最後に頼られる静かな実力者', color: 'from-teal-300 via-cyan-200 to-blue-400' },
  BGLF: { code: 'BGLF', name: '越境者', emoji: '🌐', title: 'どの国でも主役になれる越境者', subtitle: '国境も業界も軽々と越える。知性と行動力と華やかさで、どこへ行っても主役になれるタイプ', color: 'from-sky-400 via-emerald-300 to-yellow-300' },
  BGLD: { code: 'BGLD', name: 'マッドサイエンティスト', emoji: '🧪', title: 'ひらめきで世界を変える狂気の天才', subtitle: '常識にとらわれない発想を、言葉にして世に出す。周りを巻き込み、誰も思いつかないものを生み出すタイプ', color: 'from-yellow-300 via-lime-300 to-cyan-400' },
  BGQF: { code: 'BGQF', name: '忍者', emoji: '🥷', title: '静かに牙を研ぐ知性派ニンジャ', subtitle: '目立たず、群れず、でも実はハイスペ。知性と鍛えた体で、いざという時に一番強い', color: 'from-slate-300 via-violet-300 to-indigo-500' },
  BGQD: { code: 'BGQD', name: '仙人', emoji: '🐉', title: '俗世を離れて道を極める仙人', subtitle: '他人の評価より自分の探究心。好きなことをとことん突き詰め、独自の世界を築く孤高の存在', color: 'from-indigo-400 via-blue-300 to-teal-300' },
};

// ───────────────────────── 恋愛モード ─────────────────────────
// 軸1 V ビジュアル / S ステータス、軸2 H 肉食 / P 草食、軸3 Y フレッシュ / M 大人、軸4 R ロマン / K 結婚

export const LOVE_TYPES: Record<string, CharacterTypeDef> = {
  VHYR: { code: 'VHYR', name: '小悪魔', emoji: '😈', title: '恋を量産する天性の小悪魔', subtitle: '見た目の華と積極性で、気づけば相手を夢中にさせている。恋愛を全力で楽しむ天性のモテ体質', color: 'from-fuchsia-400 via-pink-300 to-rose-400' },
  VHYK: { code: 'VHYK', name: 'モテエース', emoji: '🔥', title: '若くして本命を射抜くモテエース', subtitle: 'ルックスと行動力で出会いを逃さず、遊びより本命狙い。早めのゴールインも狙える即戦力', color: 'from-rose-400 via-orange-300 to-amber-300' },
  VHMR: { code: 'VHMR', name: '罪な人', emoji: '🌹', title: '恋の駆け引きを知り尽くした罪な人', subtitle: '余裕のある振る舞いと色気で、会った人を虜にする。本人にその気がなくても相手を本気にさせてしまう', color: 'from-rose-500 via-red-300 to-purple-400' },
  VHMK: { code: 'VHMK', name: '選ばれし本命', emoji: '🌹', title: '誰もが狙う大人の本命', subtitle: '洗練された見た目と自分から動ける積極性。結婚相手として真っ先に名前が挙がる大人の本命', color: 'from-rose-400 via-pink-200 to-amber-300' },
  VPYR: { code: 'VPYR', name: '妖精', emoji: '🧚', title: '触れたら消えそうな透明感の妖精', subtitle: '自分からガツガツいかないのに好かれる。透明感と素直さで、周りが放っておかないタイプ', color: 'from-pink-300 via-rose-200 to-sky-300' },
  VPYK: { code: 'VPYK', name: '一途の化身', emoji: '💌', title: '決めたら一生、一途の化身', subtitle: '見た目の良さに反して恋は一途。決めた相手をまっすぐ大切にする、裏切らない愛されキャラ', color: 'from-amber-300 via-pink-200 to-rose-300' },
  VPMR: { code: 'VPMR', name: '高嶺の花', emoji: '🌙', title: 'ミステリアスな高嶺の花', subtitle: '近寄りがたいほどの雰囲気で、追われる側の恋が基本。簡単には手に入らない謎めいた魅力', color: 'from-indigo-300 via-violet-300 to-pink-300' },
  VPMK: { code: 'VPMK', name: 'マイナスイオン', emoji: '🌿', title: 'そばにいるだけで癒やすマイナスイオン', subtitle: '整った見た目と落ち着いた空気感。一緒にいるだけでほっとする、長く続く関係を作るタイプ', color: 'from-sky-300 via-teal-200 to-pink-200' },
  SHYR: { code: 'SHYR', name: '肉食ハイスペ', emoji: '⚡', title: 'ノリと勢いのハイスペ肉食系', subtitle: '若さとステータスを武器に、出会いの場で全力アタック。恋も仕事も攻めの姿勢を崩さない', color: 'from-yellow-300 via-orange-300 to-rose-400' },
  SHYK: { code: 'SHYK', name: '婚活エリート', emoji: '💍', title: '最短でゴールインする婚活エリート', subtitle: '若くして安定した基盤と行動力。結婚までの最短ルートを知っている、婚活市場の優等生', color: 'from-amber-300 via-yellow-200 to-pink-300' },
  SHMR: { code: 'SHMR', name: '港区の住人', emoji: '🥂', title: '港区を庭にするエスコート巧者', subtitle: 'お店選びも会話も完璧。ステータスと経験に裏打ちされたスマートなエスコートで魅せる大人', color: 'from-violet-400 via-purple-300 to-amber-300' },
  SHMK: { code: 'SHMK', name: '大黒柱', emoji: '🏰', title: '包容力MAXの頼れる大黒柱', subtitle: '経済力と決断力で、パートナーと家庭をまるごと支える。安心感なら誰にも負けないタイプ', color: 'from-emerald-300 via-teal-200 to-amber-300' },
  SPYR: { code: 'SPYR', name: '文学青年', emoji: '📖', title: '隠れハイスペの文学系ロマンチスト', subtitle: '控えめだけど中身はハイスペ。好きな人のことを静かに想い続ける、知る人ぞ知るロマンチスト', color: 'from-indigo-300 via-sky-200 to-pink-300' },
  SPYK: { code: 'SPYK', name: '安定株', emoji: '🌱', title: '堅実に育つ将来有望の安定株', subtitle: '派手さはないけど将来性はピカイチ。付き合うほど良さがわかる、結婚向きの堅実派', color: 'from-emerald-300 via-lime-200 to-teal-300' },
  SPMR: { code: 'SPMR', name: '沼系インテリ', emoji: '🎻', title: '知性で落とす沼系インテリ', subtitle: '会話の深さと大人の余裕で、気づいたら抜け出せない。じわじわハマらせる沼系タイプ', color: 'from-purple-400 via-indigo-300 to-teal-300' },
  SPMK: { code: 'SPMK', name: '不動の本命', emoji: '🗿', title: '何があっても揺るがない不動の本命', subtitle: '誠実さと生活力は折り紙付き。浮気も心変わりもなく、穏やかで安定した家庭を築ける最も信頼できるパートナー', color: 'from-teal-300 via-emerald-200 to-sky-300' },
};

// ───────────────────────── 共通 ─────────────────────────

function toRef(def: CharacterTypeDef): CharacterTypeRef {
  return { code: def.code, name: def.name, emoji: def.emoji };
}

/** 指定した位置の文字を反転させたコードを返す（相性タイプ用） */
function flipLetters(code: string, positions: number[], pairs: [string, string][]): string {
  return code
    .split('')
    .map((ch, i) => {
      if (!positions.includes(i)) return ch;
      const [a, b] = pairs[i];
      return ch === a ? b : a;
    })
    .join('');
}

function tierBadge(score: number): string {
  if (score >= 85) return `SS TIER`;
  if (score >= 75) return `S TIER`;
  if (score >= 65) return `A TIER`;
  if (score >= 50) return `B TIER`;
  return `C TIER`;
}

function mbtiLetter(input: DiagnosisInputV3, index: number): string | null {
  const mbti = (input.mbti || '').trim().toUpperCase();
  return /^[EI][SN][TF][JP]/.test(mbti) ? mbti[index] : null;
}

function buildResult(def: CharacterTypeDef, axes: CharacterTypeAxis[], match: CharacterTypeDef, badge: string): EpithetResult {
  return {
    title: def.title,
    subtitle: def.subtitle,
    rarityBadge: badge,
    rarityColor: def.color,
    typeCode: def.code,
    typeName: def.name,
    typeEmoji: def.emoji,
    typeAxes: axes,
    bestMatch: toRef(match),
  };
}

const INDEPENDENT_EMPLOYMENT = ['FREELANCE', 'EXECUTIVE', 'SELF_EMPLOYED'];
const OVERALL_PAIRS: [string, string][] = [['M', 'B'], ['C', 'G'], ['L', 'Q'], ['F', 'D']];
const LOVE_PAIRS: [string, string][] = [['V', 'S'], ['H', 'P'], ['Y', 'M'], ['R', 'K']];

/**
 * 総合スペックのキャラタイプを判定する
 */
export function generateEpithetTitle(
  overallScore: number,
  input: DiagnosisInputV3,
  scores: CategoryScores
): EpithetResult {
  // 軸1: 財力 vs 知力（中央値からの伸びで比べる）
  const money = scores.economic - 80 >= scores.academic - 65;
  // 軸2: 組織 vs 越境（独立した働き方、または語学・海外経験が豊富なら越境）
  const go = INDEPENDENT_EMPLOYMENT.includes(input.employmentType) || scores.ability >= 60;
  // 軸3: 発信 vs 潜伏（MBTI があれば E/I、なければ SNS の影響力）
  const e = mbtiLetter(input, 0);
  const loud = e ? e === 'E' : scores.social >= 52;
  // 軸4: 見た目 vs 中身（身体スコア）
  const fit = scores.body >= 65;

  const code = `${money ? 'M' : 'B'}${go ? 'G' : 'C'}${loud ? 'L' : 'Q'}${fit ? 'F' : 'D'}`;
  const axes: CharacterTypeAxis[] = [
    { label: '財力 vs 知力', result: money ? '財力' : '知力', letter: code[0] },
    { label: '組織 vs 越境', result: go ? '越境' : '組織', letter: code[1] },
    { label: '発信 vs 潜伏', result: loud ? '発信' : '潜伏', letter: code[2] },
    { label: '見た目 vs 中身', result: fit ? '見た目' : '中身', letter: code[3] },
  ];
  // 相性: 財力/知力 と 発信/潜伏 が逆のタイプ（足りないものを補い合う）
  const matchCode = flipLetters(code, [0, 2], OVERALL_PAIRS);

  return buildResult(OVERALL_TYPES[code], axes, OVERALL_TYPES[matchCode], tierBadge(overallScore));
}

/**
 * 恋愛スペックのキャラタイプを判定する
 */
export function generateLoveEpithetTitle(
  loveScore: number,
  input: DiagnosisInputV3,
  scores: LoveCategoryScores,
  socialScore: number
): EpithetResult {
  // 軸1: ビジュアル vs ステータス
  const looks = (scores.face + scores.body) / 2;
  const status = (scores.income + scores.career) / 2;
  const visual = looks - 69 >= status - 76;

  // 軸2: 肉食 vs 草食（交際人数 → 経験人数 → MBTI E/I → SNS の順に判断）
  let hunter: boolean;
  const e = mbtiLetter(input, 0);
  if (input.datingPartnerCount !== null && input.datingPartnerCount !== undefined) {
    hunter = input.datingPartnerCount >= 4;
  } else if (input.partnerCount !== null && input.partnerCount !== undefined) {
    hunter = input.partnerCount >= 5;
  } else if (e) {
    hunter = e === 'E';
  } else {
    hunter = socialScore >= 52;
  }

  // 軸3: フレッシュ vs 大人
  const young = input.age <= 29;

  // 軸4: ロマン vs 結婚（既婚・婚約 → MBTI T/F → 経済基盤の順に判断）
  let marriage: boolean;
  const tf = mbtiLetter(input, 2);
  if (input.maritalStatus === 'MARRIED' || input.maritalStatus === 'ENGAGED_COHABITING' || (input.childrenCount || 0) > 0) {
    marriage = true;
  } else if (tf) {
    marriage = tf === 'T';
  } else {
    marriage = status >= 76;
  }

  const code = `${visual ? 'V' : 'S'}${hunter ? 'H' : 'P'}${young ? 'Y' : 'M'}${marriage ? 'K' : 'R'}`;
  const axes: CharacterTypeAxis[] = [
    { label: 'ビジュアル vs ステータス', result: visual ? 'ビジュアル' : 'ステータス', letter: code[0] },
    { label: '肉食 vs 草食', result: hunter ? '肉食' : '草食', letter: code[1] },
    { label: 'フレッシュ vs 大人', result: young ? 'フレッシュ' : '大人', letter: code[2] },
    { label: 'ロマン vs 結婚', result: marriage ? '結婚' : 'ロマン', letter: code[3] },
  ];
  // 相性: ビジュアル/ステータス と 肉食/草食 が逆のタイプ
  const matchCode = flipLetters(code, [0, 1], LOVE_PAIRS);

  return buildResult(LOVE_TYPES[code], axes, LOVE_TYPES[matchCode], tierBadge(loveScore));
}
