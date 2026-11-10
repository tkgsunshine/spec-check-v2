'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OverallDiagnosisResultV3 } from '@/types/spec-check';
import { scoreToTopPercent } from '@/lib/score-engine/math-utils';
import {
  Lock,
  Unlock,
  Sparkles,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Activity,
  Coins,
  Briefcase,
  GraduationCap,
  Share2,
  Globe,
} from 'lucide-react';
import { BoltIcon, LockIcon, MedalIcon, SparkleIcon, WarningIcon } from '@/components/icons/SpecIcons';

interface PremiumReportSectionProps {
  result: OverallDiagnosisResultV3;
  diagnosisId: string;
  isLoveMode?: boolean;
  children?: React.ReactNode | ((props: { isUnlocked: boolean }) => React.ReactNode);
}

export default function PremiumReportSection({
  result,
  diagnosisId,
  isLoveMode = false,
  children,
}: PremiumReportSectionProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedMarriage, setCopiedMarriage] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`spec_check_unlocked_${diagnosisId}`);
      const params = new URLSearchParams(window.location.search);
      const queryUnlocked = params.get('unlocked') === 'true';

      if (stored === 'true' || queryUnlocked || result.isPremiumUnlocked) {
        setIsUnlocked(true);
        try {
          localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, 'true');
        } catch {}
      }
    }
  }, [diagnosisId, result.isPremiumUnlocked]);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId,
          returnUrl: typeof window !== 'undefined' ? window.location.origin : '',
        }),
      });

      const data = await res.json();
      if (data.mode === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }

      // シミュレーション決済モード（即時アンロック）
      setTimeout(() => {
        setIsUnlocked(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, 'true');
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsUnlocked(true);
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const { loveOverallScore, gender, age, nickname, prefectureName, mbti } = {
    loveOverallScore: result.loveOverallScore || 70,
    gender: result.inputSummary?.gender || 'MALE',
    age: result.inputSummary?.age || 26,
    nickname: result.inputSummary?.nickname || 'あなた',
    prefectureName: result.inputSummary?.prefectureName || '東京都',
    mbti: result.inputSummary?.mbti || 'INFP',
  };

  const estimatedMatchCount = Math.min(
    985,
    Math.max(120, Math.round(1000 * Math.pow(loveOverallScore / 100, 1.25) * 0.95))
  );
  const matchRate = (estimatedMatchCount / 10).toFixed(1);

  const targetPartnerAgeRange =
    gender === 'MALE'
      ? `${Math.max(20, age - 5)}歳 〜 ${age + 1}歳`
      : `${age - 1}歳 〜 ${age + 6}歳`;

  // 自己紹介文の生成（2倍の分量・構成化）
  const profileAppText = `はじめまして！プロフィールをご覧いただきありがとうございます。
${prefectureName}で働いている${age}歳の${nickname}です。

【仕事について】
現在は専門職として日々の仕事にやりがいを持って誠実に取り組んでいます。オンとオフのメリハリを大切にしており、休日はしっかりとプライベートの時間でリフレッシュしています。

【性格・周りからの印象】
周りの友人や同僚からは「落ち着いていて聞き上手」「穏やかで一緒にいて安心する」と言われることが多いです（MBTI: ${mbti}）。人の話をじっくり聞くのが好きなので、どんな話題でも気軽に話してもらえると嬉しいです。

【休日の過ごし方・好きなこと】
・美味しいご飯屋さんや隠れ家カフェの開拓（お肉やお寿司、珈琲が好きです）
・旅行やドライブ、温泉巡りで非日常を楽しむこと
・映画鑑賞、読書、たまにジムで軽く身体を動かすこと

【理想の関係】
お互いの仕事や一人の時間も尊重しつつ、美味しいものを一緒に食べたり、他愛もないことで笑い合える自然体な関係が理想です。

まずはメッセージで気軽に色々お話しできたら嬉しいです！どうぞよろしくお願いします。`;

  const profileMarriageText = `はじめまして。プロフィールをご覧いただき誠にありがとうございます。
${nickname}と申します。${prefectureName}在住の${age}歳です。

将来を見据えて、お互いを深く信頼し支え合える誠実なパートナーと出会いたいと思い登録いたしました。

【仕事と生活基盤】
仕事には誇りと責任感を持って誠実に取り組んでおり、日々の生活リズムや健康管理も大切にしています。お互いに自立しつつ、何かあったときには何でも相談し合って助け合える関係を築いていきたいと考えております。

【性格と価値観】
性格は穏やかで思いやりを大切にするタイプです。相手の意見やペースを尊重し、感情的にならず落ち着いて対話することを常に心がけています。

【休日の過ごし方】
休日は料理や家事をこなしたり、映画鑑賞、散歩、ドライブなどを楽しんでいます。季節のイベントや美味しいものを一緒に共有できると嬉しいです。

【結婚観・理想の家庭像】
些細なことでも「ありがとう」と「ごめんね」を素直に伝え合える、温かく笑顔の絶えない家庭が理想です。お互いの価値観や個性を尊重しながら、一緒に人生を歩んでいけたら幸いです。

最後までお読みいただきありがとうございました。素敵なご縁があれば嬉しく思います。どうぞよろしくお願いいたします。`;

  const copyAppBio = () => {
    navigator.clipboard.writeText(profileAppText);
    setCopiedApp(true);
    setTimeout(() => setCopiedApp(false), 2000);
  };

  const copyMarriageBio = () => {
    navigator.clipboard.writeText(profileMarriageText);
    setCopiedMarriage(true);
    setTimeout(() => setCopiedMarriage(false), 2000);
  };

  // ユーザーの属性（年齢、経済/キャリアスコア、MBTI、総合スコア）に応じたマッチングアプリ・結婚相談所ランキング（1位〜4位）
  const getBattlefieldRanking = () => {
    const ecoScore = result.categoryScores?.economic || 60;
    const carScore = result.categoryScores?.career || 60;
    const isHighSpec = ecoScore >= 72 || carScore >= 72 || loveOverallScore >= 78;
    const cleanMbti = (mbti || '').toUpperCase();
    const isIntrovert = cleanMbti.includes('I');
    const isFeeling = cleanMbti.includes('F');
    const isOver32 = age >= 32;
    const isUnder26 = age <= 25;

    // 各サービスの適合度スコア算出
    const allServices = [
      {
        id: 'bachelor',
        name: 'バチェラーデート',
        category: '審査制ハイスペ特化アプリ',
        url: 'https://www.bachelorapp.net/',
        linkText: 'おすすめ：バチェラーデート公式を見る',
        baseFit: isHighSpec ? 95 : isUnder26 ? 81 : 86,
        description: isHighSpec
          ? '知性・ステータスが直接評価される完全審査制。週1回のデートが自動セッティングされるため、忙しい高スペック層に最適です。'
          : 'いいねやメッセージのやり取り不要で即カフェデート。スペックと第一印象の魅力を初回から発揮できる効率特化市場です。',
        color: 'border-amber-500/40 text-amber-300 bg-amber-500/20',
      },
      {
        id: 'ibj',
        name: 'IBJ系列 優良結婚相談所',
        category: '業界最大手・成婚特化相談所',
        url: 'https://www.ibjapan.com/',
        linkText: 'おすすめ：IBJ系列・優良結婚相談所を比較する',
        baseFit: isOver32 ? (isHighSpec ? 96 : 92) : isHighSpec ? 90 : 84,
        description:
          '東証プライム上場グループの業界最大手。独身証明・身元確実な真剣層が集まるため、安定した生活基盤と誠実さが圧倒的な成婚アドバンテージを生みます。',
        color: 'border-purple-500/40 text-purple-300 bg-purple-500/20',
      },
      {
        id: 'with',
        name: 'with（ウィズ）',
        category: '心理学・MBTI相性特化アプリ',
        url: 'https://with.is/',
        linkText: 'おすすめ：with（ウィズ）公式を見る',
        baseFit: isIntrovert || isFeeling || isUnder26 ? 94 : age <= 29 ? 89 : 81,
        description:
          '心理テストやMBTI性格診断に基づき、内面・価値観が本当に一致する異性とマッチング。誠実さや共感力を武器に深い関係を構築できます。',
        color: 'border-pink-500/40 text-pink-300 bg-pink-500/20',
      },
      {
        id: 'pairs',
        name: 'Pairs（ペアーズ）',
        category: '国内会員数No.1王道アプリ',
        url: 'https://pairs.lv/',
        linkText: 'おすすめ：Pairs（ペアーズ）公式を見る',
        baseFit: isUnder26 ? 91 : age <= 33 ? 88 : 83,
        description:
          '累計会員数2,000万人突破の国内最大級母集団。豊富なコミュニティ機能により、あなたの趣味やライフスタイルに合致する層を網羅的に開拓可能。',
        color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/20',
      },
      {
        id: 'zexy',
        name: 'ゼクシィ縁結び',
        category: 'リクルート運営・真剣婚活アプリ',
        url: 'https://zexy-enmusubi.net/',
        linkText: 'おすすめ：ゼクシィ縁結び公式を見る',
        baseFit: isOver32 ? 90 : age >= 27 ? 86 : 78,
        description:
          'リクルート運営で男女同額の真剣婚活アプリ。結婚を具体的に見据えた誠実な異性が多く、生活力や信頼性を重視する層から熱い支持を集めます。',
        color: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/20',
      },
      {
        id: 'marrish',
        name: 'marrish（マリッシュ）',
        category: '大人の真剣婚活・再婚特化',
        url: 'https://marrish.com/',
        linkText: 'おすすめ：marrish（マリッシュ）公式を見る',
        baseFit: age >= 38 ? 93 : age >= 33 ? 85 : 72,
        description:
          '30代〜40代以降の落ち着いた大人の真剣婚活。再婚やシングル理解者も多く、人柄と包容力で勝負できる安心市場です。',
        color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/20',
      },
    ];

    // 適合度スコア順に降順ソートし、上位4件を抽出
    const sorted = [...allServices].sort((a, b) => b.baseFit - a.baseFit).slice(0, 4);

    const medals = ['1位', '2位', '3位', '4位'];
    const borderColors = [
      'border-amber-500/50 bg-amber-500/5',
      'border-purple-500/40 bg-purple-500/5',
      'border-pink-500/30 bg-pink-500/5',
      'border-slate-800 bg-slate-950/70',
    ];

    return sorted.map((item, index) => ({
      ...item,
      medal: medals[index],
      fitScore: Math.min(97, Math.max(75, item.baseFit - index * 2 + Math.round((loveOverallScore % 5) - 2))),
      cardClass: borderColors[index],
    }));
  };

  // 1. あなたに最も惹かれやすい異性の特徴（全7項目）の完全動的パーソナライズ生成
  const getPersonalizedCompatibilityData = () => {
    const cleanMbti = (mbti || '').toUpperCase().trim();
    const ecoScore = result.categoryScores?.economic || 60;
    const carScore = result.categoryScores?.career || 60;
    const acadScore = result.categoryScores?.academic || 60;
    const bodyScore = result.categoryScores?.body || 60;
    const socialScore = result.categoryScores?.social || 60;
    const abilityScore = result.categoryScores?.ability || 60;

    // ① 年齢層
    const partnerAge =
      gender === 'MALE'
        ? `${Math.max(20, age - 5)}歳 〜 ${age + 1}歳`
        : `${Math.max(20, age - 1)}歳 〜 ${age + 6}歳`;
    const partnerAgeSubtext =
      gender === 'MALE'
        ? (age <= 27 ? '同世代〜2歳下からの共感需要が最多' : '3〜5歳下を含む安定・安心志向層から支持')
        : (age <= 27 ? '同世代〜3歳上の頼もしさ重視層と高適合' : '同世代〜5歳上の成熟したパートナー層と高適合');

    // ② 年収層
    let partnerIncome = '年収 500万〜900万円';
    let partnerIncomeSubtext = '価値観・生活水準の均衡ゾーン';
    if (gender === 'FEMALE') {
      if (ecoScore >= 70 || carScore >= 70) {
        partnerIncome = '年収 800万〜1,800万円';
        partnerIncomeSubtext = '自立した高水準キャリア層と対等に共鳴';
      } else if (ecoScore >= 55) {
        partnerIncome = '年収 600万〜1,200万円';
        partnerIncomeSubtext = '世帯収入の安定と自己投資を両立できる層';
      } else {
        partnerIncome = '年収 500万〜900万円';
        partnerIncomeSubtext = '堅実な家計形成とワークライフバランス重視層';
      }
    } else {
      if (ecoScore >= 70) {
        partnerIncome = '年収 400万〜800万円';
        partnerIncomeSubtext = '自立したキャリア・専門性を持ち対等に語れる層';
      } else if (ecoScore >= 55) {
        partnerIncome = '年収 350万〜600万円';
        partnerIncomeSubtext = '共働き志向で互いを支え合える堅実層';
      } else {
        partnerIncome = '年収 300万〜500万円';
        partnerIncomeSubtext = '身の丈に合った温かい暮らしを大切にする層';
      }
    }

    // ③ MBTI特性（心理学的補完マッピング）
    const mbtiCompatibilityMap: Record<string, { best: string; sub: string }> = {
      INFP: { best: 'ENFJ / INFJ / INTJ / ENTJ', sub: '深い価値観の共鳴と成長を促す関係' },
      ENFP: { best: 'INTJ / INFJ / ENTP / INTP', sub: '知的好奇心と自由な発想を広げ合える関係' },
      INFJ: { best: 'ENTP / ENFP / INFP / INTJ', sub: '精神的な深さと相互理解が極めて高い関係' },
      ENFJ: { best: 'INFP / ISFP / ENFP / INFJ', sub: '感情の受容と温かい信頼で結ばれる関係' },
      INTJ: { best: 'ENFP / ENTP / ENTJ / INFP', sub: '知性と思考の深さを尊重し合える関係' },
      ENTJ: { best: 'INTP / INFP / INTJ / ENTP', sub: '高みを目指す目標意識と相互補完関係' },
      INTP: { best: 'ENTJ / ENFJ / INTJ / ENTP', sub: '知的な議論と精神的自立を両立する関係' },
      ENTP: { best: 'INFJ / INTJ / ENFP / INTP', sub: '飽くなき探求心と刺激的な対話を生む関係' },
      ISFP: { best: 'ESFJ / ESTJ / ENFJ / ISFJ', sub: '感性の豊かさと安心感で満たされる関係' },
      ESFP: { best: 'ISFJ / ISTJ / ESFJ / ESTP', sub: '明るいエネルギーと日常の楽しさを共有する関係' },
      ISTP: { best: 'ESTJ / ESFJ / ESTP / ISTJ', sub: '実直な行動力と適度な距離感を保てる関係' },
      ESTP: { best: 'ISFJ / ISTJ / ESFP / ISTP', sub: 'エネルギッシュな推進力と現実的サポート' },
      ISFJ: { best: 'ESFP / ESTP / ISFP / ISTJ', sub: '誠実な献身と温かい家族観を育む関係' },
      ESFJ: { best: 'ISFP / ISTP / ESFP / ISFJ', sub: '調和と気遣いが行き届いた居心地の良い関係' },
      ISTJ: { best: 'ESTP / ESFP / ISTP / ISFJ', sub: '揺るぎない信頼感と堅実な将来設計の関係' },
      ESTJ: { best: 'ISTP / ISFP / ESTJ / ENTJ', sub: '責任感と実行力で家庭・未来を築く関係' },
    };
    const matchedMbti = mbtiCompatibilityMap[cleanMbti] || {
      best: 'ENFJ / INFJ / INTJ / ISFJ',
      sub: '心理的補完関係・共感度最大化',
    };

    // ④ 職業・業界
    let partnerOccupation = '大手総合職・専門職・教育/士業・クリエイター';
    let partnerOccupationSub = '知的好奇心と生活リズムが合致';
    if (gender === 'FEMALE') {
      if (ecoScore >= 68 || acadScore >= 68) {
        partnerOccupation = '総合商社・外資系・医師/士業・IT大手戦略職';
        partnerOccupationSub = '高度な知性と自立したキャリア観が共鳴';
      } else {
        partnerOccupation = '大手メーカー・公務員・IT/WEB・企画職';
        partnerOccupationSub = '安定した生活基盤と家族時間を大切にする層';
      }
    } else {
      if (carScore >= 68 || acadScore >= 68) {
        partnerOccupation = '大手総合職・専門職/士業・IT/WEB企画・教育職';
        partnerOccupationSub = '自立心と知的好奇心を備えた自走型パートナー';
      } else {
        partnerOccupation = '医療/看護・公務員・事務/専門職・クリエイター';
        partnerOccupationSub = '生活リズムが整い、思いやりに溢れる堅実層';
      }
    }

    // ⑤ 相手の学歴・知性水準
    let partnerEducation = '大学卒以上（難関大・国公立・MARCH等）';
    let partnerEducationSub = '会話のテンポ・論理感が噛み合う層';
    if (acadScore >= 72) {
      partnerEducation = '大学卒以上（難関国公立・早慶・MARCH・上位院卒）';
      partnerEducationSub = '知的な議論や深い洞察を自然に楽しめる層';
    } else if (acadScore >= 55) {
      partnerEducation = '大学卒・大学院卒以上（幅広い教養と柔軟な知性）';
      partnerEducationSub = '日常の会話のテンポや論理感が心地よく一致する層';
    } else {
      partnerEducation = '大卒・専門卒以上（共感力と実践的な生活知恵）';
      partnerEducationSub = '知識量よりも人柄と柔軟なコミュニケーションを重んじる層';
    }

    // ⑥ 恋愛観タイプ
    let loveStyle = '相互自立型 ＆ 心を開くと甘え上手';
    let loveStyleSub = '過度な束縛を嫌い、尊敬で結ばれる';
    if (cleanMbti.includes('I') && cleanMbti.includes('T')) {
      loveStyle = '相互自立型 ＆ 程よい距離感と知的好奇心を尊重し合える関係';
      loveStyleSub = 'お互いの1人時間と目標を応援し合える成熟パートナー';
    } else if (cleanMbti.includes('I') && cleanMbti.includes('F')) {
      loveStyle = '心理的安全性重視 ＆ 一対一の対話を深く楽しめる誠実タイプ';
      loveStyleSub = '嘘や駆け引きのない安心感と穏やかな時間を共有';
    } else if (cleanMbti.includes('E') && cleanMbti.includes('T')) {
      loveStyle = '目標共闘型 ＆ 刺激的な挑戦と成長を応援し合えるパートナー';
      loveStyleSub = '建設的な対話で高め合えるエネルギッシュな関係';
    } else if (cleanMbti.includes('E') && cleanMbti.includes('F')) {
      loveStyle = '温かい感情共有型 ＆ 一緒に楽しむイベントや日常を大切にするタイプ';
      loveStyleSub = '笑顔とポジティブな会話で日常を満たす関係';
    }

    // ⑦ あなたの一番刺さる武器・魅力（最高スコアカテゴリに基づくギャップ抽出）
    const scores = [
      { name: 'body', score: bodyScore, label: '洗練された第一印象・清潔感' },
      { name: 'economic', score: ecoScore, label: '確固たる生活基盤・経済的余裕' },
      { name: 'career', score: carScore, label: '社会的信用・責任感ある仕事ぶり' },
      { name: 'academic', score: acadScore, label: '論理的な知性・スマートな会話力' },
      { name: 'social', score: socialScore, label: '華やかな社交性・コミュニケーション力' },
      { name: 'ability', score: abilityScore, label: 'グローバルな視野・柔軟な適応力' },
    ];
    scores.sort((a, b) => b.score - a.score);
    const topStrength = scores[0];

    let decisiveWeapon = '';
    if (topStrength.name === 'body') {
      decisiveWeapon = `「${topStrength.label}」と「二人きりになった際に見せる丁寧で落ち着いた気遣い」のギャップ。見た目の魅力で惹きつけ、内面の誠実さで相手を安心させる決定打となります。`;
    } else if (topStrength.name === 'economic' || topStrength.name === 'career') {
      decisiveWeapon = `「${topStrength.label}」と「プライベートで相手を最優先にする包容力・傾聴姿勢」のギャップ。頼もしさに加え、相手が自然体で甘えられる居心地の良さが最大の武器となります。`;
    } else if (topStrength.name === 'academic' || topStrength.name === 'ability') {
      decisiveWeapon = `「${topStrength.label}」と「相手の話を面白がって広げるユーモア・柔軟性」のギャップ。知的な安心感を与えつつ、一緒にいて会話が尽きない楽しさが決定打となります。`;
    } else {
      decisiveWeapon = `「${topStrength.label}」と「ふとした時に見せる真剣なまなざしや誠実さ」のギャップ。初対面の親しみやすさから、深い信頼関係へと一気に引き込む武器となります。`;
    }

    return {
      partnerAge,
      partnerAgeSubtext,
      partnerIncome,
      partnerIncomeSubtext,
      matchedMbti,
      partnerOccupation,
      partnerOccupationSub,
      partnerEducation,
      partnerEducationSub,
      loveStyle,
      loveStyleSub,
      decisiveWeapon,
    };
  };

  // 2. あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」の完全動的パーソナライズ選定
  const getPersonalizedLandmineTypes = (): {
    id: string;
    title: string;
    category: string;
    desc: string;
    blurPreview: string;
  }[] => {
    const cleanMbti = (mbti || '').toUpperCase().trim();
    const ecoScore = result.categoryScores?.economic || 60;
    const carScore = result.categoryScores?.career || 60;
    const acadScore = result.categoryScores?.academic || 60;
    const isThinking = cleanMbti.includes('T');
    const isFeeling = cleanMbti.includes('F');
    const isJudging = cleanMbti.includes('J');
    const isHighSpec = ecoScore >= 70 || carScore >= 70 || acadScore >= 70;

    // 地雷タイプ候補プール
    const pool = [
      {
        id: 'emotional_taker',
        title: '自己肯定感搾取・情緒不安定タイプ',
        category: 'テイカー気質',
        desc: 'あなたの気遣いやスペックを当然と受け止め、感情の起伏でエネルギーを消耗させる相手。感謝の言葉が極端に少なく愚痴が多い場合は即座に距離を置くべきです。',
        blurPreview: 'あなたの気遣いを当然と受け止め、感情の起伏でエネルギーを消耗させる相手。',
        score: (isThinking ? 3 : 2) + (isHighSpec ? 2 : 1),
      },
      {
        id: 'money_mismatch',
        title: '見栄消費・金銭感覚乖離タイプ',
        category: '経済観不一致',
        desc: '実力や収入に見合わない生活水準を誇示し、中長期の資産形成や自己投資に理解がない相手。初回デートでの過剰な高級志向や他責思考が見極めサインです。',
        blurPreview: '実力に見合わない生活水準を誇示し、資産形成や自己投資に理解がない相手。',
        score: (isHighSpec ? 3 : 1) + (isJudging ? 2 : 1),
      },
      {
        id: 'control_anti_intellect',
        title: '過度な束縛・知性軽視タイプ',
        category: '成長阻害',
        desc: '仕事や自己成長への熱意に理解を示さず、連絡頻度や交友関係を過度に制限しようとする相手。深い議論や相談を茶化す傾向があります。',
        blurPreview: '仕事や自己成長への熱意を理解せず、連絡頻度や行動を過度に制限する相手。',
        score: (isThinking ? 3 : 1) + (acadScore >= 65 ? 2 : 1),
      },
      {
        id: 'passive_dependent',
        title: '完全他力本願・受動的依存タイプ',
        category: '自立心欠如',
        desc: '自分から何も決めず全てを相手任せにし、不満だけは口にする相手。パートナーシップではなく「お世話役」を求めているため、対等な関係が築けません。',
        blurPreview: '全てを相手任せにし、感謝なく不満だけを口にする完全依存タイプ。',
        score: (isHighSpec ? 3 : 2) + (carScore >= 65 ? 2 : 1),
      },
      {
        id: 'morahara_toxic',
        title: 'マウンティング・共感欠如モラハラタイプ',
        category: '精神的優位固執',
        desc: '常に相手の欠点や弱点を指摘して優位に立とうとし、あなたの成果や努力を素直に喜べない相手。自尊心を削られる前に早期撤退が必須です。',
        blurPreview: '常に欠点を指摘して優位に立とうとし、努力や成果を認めないモラハラタイプ。',
        score: (isFeeling ? 4 : 2) + 1,
      },
      {
        id: 'loose_unreliable',
        title: '無計画ルーズ・約束軽視タイプ',
        category: '誠実性欠如',
        desc: '時間や約束、連絡の返信が極めてルーズで、相手の時間を尊重できない相手。「悪気はなかった」と言い訳を繰り返し、信頼関係を維持できません。',
        blurPreview: '時間や約束が極端にルーズで、相手の時間を平気で奪う不誠実タイプ。',
        score: (isJudging ? 4 : 1) + 2,
      },
    ];

    // スコア順にソートして上位3件を抽出
    pool.sort((a, b) => b.score - a.score);
    return pool.slice(0, 3);
  };

  const battlefieldRanking = getBattlefieldRanking();

  return (
    <div className="relative mt-8 rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-950/70 backdrop-blur-xl shadow-2xl transition-all duration-500">
      {/* プレミアムヘッダー */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/60 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            {isUnlocked ? (
              <Unlock className="w-4 h-4 text-white" />
            ) : (
              <Lock className="w-4 h-4 text-white animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                Deep Analytics Report
              </span>
              {!isUnlocked && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                  <SparkleIcon className="w-2.5 h-2.5 mr-0.5" />プレミアム限定データ
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>プレミアム深層レポート & 詳細分析</span>
              {isUnlocked && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  アンロック完了
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 未アンロック時のヘッダー直通CTAボタン */}
          {!isUnlocked && (
            <button
              onClick={handleUnlock}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>¥500 で詳細データを完全アンロック</span>
            </button>
          )}

          {/* 開発・テスト用クイックトグル */}
          <button
            onClick={() => {
              const next = !isUnlocked;
              setIsUnlocked(next);
              if (typeof window !== 'undefined') {
                localStorage.setItem(`spec_check_unlocked_${diagnosisId}`, String(next));
              }
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isUnlocked ? <><LockIcon className="w-3 h-3 mr-1" />ロック状態をプレビュー</> : <><BoltIcon className="w-3 h-3 mr-1" />テスト即時アンロック</>}
          </button>
        </div>
      </div>

      {/* レポートコンテンツエリア */}
      <div className="px-2 py-4 sm:p-6 md:p-8 space-y-8">
        {/* 1. 内包された詳細コンポーネント（カテゴリ別カード、総評、強みTOP5・伸びしろ） */}
        {typeof children === 'function' ? children({ isUnlocked }) : children}

        {/* 2. プレミアム専用①: 1,000人シミュレーション ＆ スペック無双 主戦場ランキング */}
        {(() => {
          const simTextColor = loveOverallScore >= 85
            ? 'text-emerald-300'
            : loveOverallScore >= 60
            ? 'text-sky-300'
            : loveOverallScore >= 45
            ? 'text-indigo-300'
            : 'text-rose-300';

          const simContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 relative overflow-hidden transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              {/* 1,000人マッチング受容シミュレーション */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                      <span>同世代異性 1,000人マッチング受容シミュレーション</span>
                      {!isUnlocked && (
                        <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <LockIcon className="w-3 h-3 mr-0.5" />プレミアム
                        </span>
                      )}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    母集団 1,000名
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                  {/* 推定マッチング可能人数 */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">推定マッチング可能人数</span>
                    {isUnlocked ? (
                      <span className={`text-2xl sm:text-3xl font-black ${simTextColor} font-mono`}>
                        {estimatedMatchCount} <span className="text-sm font-bold text-slate-400">/ 1,000人</span>
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-slate-300 filter blur-[8px] select-none font-mono">
                          888
                        </span>
                        <span className="text-sm font-bold text-slate-400">/ 1,000人</span>
                        <LockIcon className="w-3 h-3 text-amber-400 ml-1" />
                      </div>
                    )}
                  </div>

                  {/* 市場受容率（モテ許容度） */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">市場受容率（モテ許容度）</span>
                    {isUnlocked ? (
                      <span className={`text-2xl sm:text-3xl font-black ${simTextColor} font-mono`}>
                        {matchRate}%
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-2xl sm:text-3xl font-black text-slate-300 filter blur-[8px] select-none font-mono">
                          88.8%
                        </span>
                        <LockIcon className="w-3 h-3 text-amber-400 ml-1" />
                      </div>
                    )}
                  </div>

                  {/* マッチング優位性ランク */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-200 block mb-1.5">マッチング優位性ランク</span>
                    {isUnlocked ? (
                      <span className={`text-2xl sm:text-3xl font-black ${simTextColor} font-mono`}>
                        {loveOverallScore >= 90 ? 'S (超引く手あまた)' : loveOverallScore >= 80 ? 'A (強者ポジション)' : loveOverallScore >= 70 ? 'B+ (優勢)' : 'B (標準)'}
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 my-0.5">
                        <span className="text-xl sm:text-2xl font-black text-slate-300 filter blur-[8px] select-none font-mono">
                          S+ (最高位クラス)
                        </span>
                        <LockIcon className="w-3 h-3 text-amber-400 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* スペック無双 主戦場ランキング（市場別適合度 S/A/B & アフィリエイト直結） */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs sm:text-sm font-extrabold text-white">
                      あなたのスペックが最も無双できる「主戦場ランキング（市場別適合度）」
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">市場適合度分析</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {battlefieldRanking.map((service, index) => (
                    <div
                      key={service.id}
                      className={`p-3.5 rounded-xl border space-y-2 relative overflow-hidden transition-all duration-300 ${service.cardClass}`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${service.color}`}>
                          <MedalIcon rank={index + 1} className="w-4 h-4" />{service.medal}：{service.name}
                        </span>
                        <span className="text-xs font-black text-amber-300 font-mono">
                          適合度 {service.fitScore}%
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        【{service.category}】
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {service.description}
                      </p>
                      <div className="pt-1">
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-300 hover:text-amber-200 underline decoration-amber-400/60 underline-offset-2"
                        >
                          <span>{service.linkText}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして主戦場ランキングをアンロック">
                {simContent}
              </Link>
            );
          }
          return simContent;
        })()}

        {/* 3. プレミアム専用②: あなたに最も惹かれやすい異性の特徴・相性データ（全7項目） */}
        {(() => {
          const compData = getPersonalizedCompatibilityData();
          const matchContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-pink-500/30 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-pink-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-pink-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>あなたに最も惹かれやすい異性の特徴・相性データ（全7項目）</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        <LockIcon className="w-3 h-3 mr-0.5" />プレミアム
                      </span>
                    )}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {/* 1. 年齢層 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      1
                    </span>
                    <span>支持率の高い年齢層</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-base sm:text-lg font-black text-white tracking-tight font-mono">{compData.partnerAge}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-base sm:text-lg font-black text-slate-300 filter blur-[8px] select-none font-mono">24歳 〜 29歳</p>
                        <LockIcon className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">{compData.partnerAgeSubtext}</p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug filter blur-[8px] select-none">同世代〜2歳下からの共感需要が最多</p>
                  )}
                </div>

                {/* 2. 年収層 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      2
                    </span>
                    <span>相性の良い相手の年収層</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
                        {compData.partnerIncome}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-base sm:text-lg font-black text-slate-300 filter blur-[8px] select-none font-mono">年収 600万〜1,200万円</p>
                        <LockIcon className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">{compData.partnerIncomeSubtext}</p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug filter blur-[8px] select-none">自立したキャリア・専門性を持ち対等に語れる層</p>
                  )}
                </div>

                {/* 3. MBTI */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      3
                    </span>
                    <span>惹かれやすいMBTI特性</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-sm sm:text-base font-black text-white tracking-tight font-mono">
                        {compData.matchedMbti.best}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-black text-slate-300 filter blur-[8px] select-none font-mono">ENFJ / INFJ / INTJ</p>
                        <LockIcon className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">{compData.matchedMbti.sub}</p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug filter blur-[8px] select-none">深い価値観の共鳴と成長を促す関係</p>
                  )}
                </div>

                {/* 4. 職業・業界 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      4
                    </span>
                    <span>相性の良い職業・業界</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-xs sm:text-sm font-black text-white leading-snug">
                        {compData.partnerOccupation}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-300 filter blur-[8px] select-none">大手総合職・専門職/士業</p>
                        <LockIcon className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">{compData.partnerOccupationSub}</p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug filter blur-[8px] select-none">自立心と知的好奇心を備えた自走型パートナー</p>
                  )}
                </div>

                {/* 5. 学歴・知性水準 */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      5
                    </span>
                    <span>相手の学歴・知性水準</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-xs sm:text-sm font-black text-white leading-snug">
                        {compData.partnerEducation}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-300 filter blur-[8px] select-none">大学卒以上（知的好奇心を共有）</p>
                        <LockIcon className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">{compData.partnerEducationSub}</p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug filter blur-[8px] select-none">知的な議論や深い洞察を自然に楽しめる層</p>
                  )}
                </div>

                {/* 6. 恋愛観・タイプ */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-pink-500/30 transition-colors">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-[10px] font-black shrink-0">
                      6
                    </span>
                    <span>惹かれやすい恋愛観タイプ</span>
                  </div>
                  <div className="py-0.5">
                    {isUnlocked ? (
                      <p className="text-xs sm:text-sm font-black text-white leading-snug">
                        {compData.loveStyle}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-300 filter blur-[8px] select-none">相互自立型 ＆ 心を開くと甘え上手</p>
                        <LockIcon className="w-3 h-3 text-amber-400" />
                      </div>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug">{compData.loveStyleSub}</p>
                  ) : (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80 leading-snug filter blur-[8px] select-none">嘘や駆け引きのない安心感と穏やかな時間を共有</p>
                  )}
                </div>

                {/* 7. 一番刺さる武器 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-950/80 border border-pink-500/40 sm:col-span-2 md:col-span-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-pink-300">
                    <span className="w-4 h-4 rounded-full bg-pink-500/30 text-pink-200 flex items-center justify-center text-[10px] font-black shrink-0">
                      7
                    </span>
                    <span>あなたの一番刺さる武器・魅力（決定打）</span>
                  </div>
                  {isUnlocked ? (
                    <p className="text-xs sm:text-sm text-white font-bold leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-pink-500/20">
                      {compData.decisiveWeapon}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <p className="text-xs sm:text-sm text-slate-300 filter blur-[8px] select-none">第一印象の清潔感と知性のギャップによる安心感が最大の決定打となります。</p>
                      <span className="text-xs text-amber-400 font-bold shrink-0"><LockIcon className="w-3 h-3 mr-0.5" />アンロック</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして惹かれやすい異性の特徴をアンロック">
                {matchContent}
              </Link>
            );
          }
          return matchContent;
        })()}

        {/* 4. プレミアム専用③: あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」（新設） */}
        {(() => {
          const landmines = getPersonalizedLandmineTypes();
          const landmineContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-rose-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>あなたと絶対に合わない「相性最悪な地雷異性タイプ ワースト3」</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <LockIcon className="w-3 h-3 mr-0.5" />プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-rose-300/80">時間を無駄にしないための防衛データ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                {landmines.map((item, idx) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/50 space-y-1.5">
                    <div>
                      <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        <WarningIcon className="w-3 h-3 mr-0.5" />ワースト {idx + 1}
                      </span>
                    </div>
                    {isUnlocked ? (
                      <span className="text-xs sm:text-sm font-extrabold text-white block">{item.title}</span>
                    ) : (
                      <span className="text-xs sm:text-sm font-extrabold text-slate-300 filter blur-[8px] select-none block">
                        自己肯定感搾取・情緒不安定タイプ
                      </span>
                    )}
                    {isUnlocked ? (
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {item.desc}
                      </p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 text-[11px] filter blur-[8px] select-none">{item.blurPreview}</p>
                        <span className="text-[10px] text-amber-400 font-bold shrink-0"><LockIcon className="w-3 h-3 mr-0.5" />アンロック</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして地雷異性タイプをアンロック">
                {landmineContent}
              </Link>
            );
          }
          return landmineContent;
        })()}

        {/* 5. プレミアム専用④: 多角比較6項目別・何をすれば何pt上がるか具体策 */}
        {(() => {
          // 各カテゴリの改善ポテンシャルを現在のスコアから動的算出
          const bodyScoreVal = result.categoryScores?.body || 60;
          const ecoScoreVal = result.categoryScores?.economic || 60;
          const carScoreVal = result.categoryScores?.career || 60;
          const acaScoreVal = result.categoryScores?.academic || 60;
          const socScoreVal = result.categoryScores?.social || 50;
          const gloScoreVal = result.categoryScores?.ability || 50;

          const bodyPotential = Math.max(1.5, Math.min(8.0, Math.round(((100 - bodyScoreVal) * 0.12) * 10) / 10));
          const ecoPotential = Math.max(2.0, Math.min(9.0, Math.round(((100 - ecoScoreVal) * 0.14) * 10) / 10));
          const carPotential = Math.max(1.5, Math.min(6.5, Math.round(((100 - carScoreVal) * 0.10) * 10) / 10));
          const acaPotential = Math.max(1.0, Math.min(5.0, Math.round(((100 - acaScoreVal) * 0.08) * 10) / 10));
          const socPotential = Math.max(1.5, Math.min(7.0, Math.round(((100 - socScoreVal) * 0.12) * 10) / 10));
          const gloPotential = Math.max(1.5, Math.min(6.0, Math.round(((100 - gloScoreVal) * 0.10) * 10) / 10));

          const totalPotentialPt = (
            bodyPotential +
            ecoPotential +
            carPotential +
            acaPotential +
            socPotential +
            gloPotential
          ).toFixed(1);

          const improvementCategories = [
            {
              id: 'body',
              title: '身体・外見 (BODY)',
              icon: Activity,
              potential: bodyPotential,
              color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
              barColor: 'bg-emerald-400',
              textColor: 'text-emerald-400',
              actionTitle: '体脂肪率の適正化 ＆ 写真クオリティの最適化',
              actionDetail: '体脂肪率を理想基準（男性14% / 女性21%）へあと2〜3%引き締め、自然光の清潔感あるプロフィール写真へ最適化。',
              breakdown: [
                { label: '体脂肪率・体型適正化', pt: `+${(bodyPotential * 0.6).toFixed(1)}pt` },
                { label: '写真・清潔感最適化', pt: `+${(bodyPotential * 0.4).toFixed(1)}pt` },
              ],
            },
            {
              id: 'eco',
              title: '年収・資産 (INCOME)',
              icon: Coins,
              potential: ecoPotential,
              color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
              barColor: 'bg-amber-400',
              textColor: 'text-amber-400',
              actionTitle: '副業収益の確立 ＆ 純資産アセットの蓄積',
              actionDetail: '月5万〜10万円の副収入の確立、または新NISA等による資産形成で純資産と可処分所得の底上げを図る。',
              breakdown: [
                { label: '年収・副業額面向上', pt: `+${(ecoPotential * 0.6).toFixed(1)}pt` },
                { label: '純資産・無借金評価', pt: `+${(ecoPotential * 0.4).toFixed(1)}pt` },
              ],
            },
            {
              id: 'car',
              title: 'キャリア (CAREER)',
              icon: Briefcase,
              potential: carPotential,
              color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
              barColor: 'bg-indigo-400',
              textColor: 'text-indigo-400',
              actionTitle: '社内役職昇進 ＆ 企業ステータスの引き上げ',
              actionDetail: 'リーダー・マネジメント層への昇格や、同職種上位大手企業へのキャリアアップ転職で職位スコアを獲得。',
              breakdown: [
                { label: '役職・職位ランク昇格', pt: `+${(carPotential * 0.6).toFixed(1)}pt` },
                { label: '企業規模・安定性加点', pt: `+${(carPotential * 0.4).toFixed(1)}pt` },
              ],
            },
            {
              id: 'aca',
              title: '学歴・知性 (ACADEMIC)',
              icon: GraduationCap,
              potential: acaPotential,
              color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
              barColor: 'bg-purple-400',
              textColor: 'text-purple-400',
              actionTitle: '専門資格の取得 ＆ 知性アセットの拡充',
              actionDetail: '業務直結の国家資格や高度専門スキルの認定を取得し、知性・論理対話力の客観的裏付けを強化。',
              breakdown: [
                { label: '難関・専門資格の取得', pt: `+${(acaPotential * 0.65).toFixed(1)}pt` },
                { label: '知性対話力ボーナス', pt: `+${(acaPotential * 0.35).toFixed(1)}pt` },
              ],
            },
            {
              id: 'soc',
              title: 'SNS・影響力 (SOCIAL)',
              icon: Share2,
              potential: socPotential,
              color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
              barColor: 'bg-pink-400',
              textColor: 'text-pink-400',
              actionTitle: '特定分野の発信 ＆ フォロワー1,000人達成',
              actionDetail: '専門分野や趣味での有益な情報発信を継続し、SNS認知度と同世代上位の波及力を獲得。',
              breakdown: [
                { label: 'フォロワー1,000人規模', pt: `+${(socPotential * 0.6).toFixed(1)}pt` },
                { label: '発信力・波及力ボーナス', pt: `+${(socPotential * 0.4).toFixed(1)}pt` },
              ],
            },
            {
              id: 'glo',
              title: 'グローバル (GLOBAL)',
              icon: Globe,
              potential: gloPotential,
              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
              barColor: 'bg-cyan-400',
              textColor: 'text-cyan-400',
              actionTitle: 'TOEIC730点以上の獲得 ＆ 実用多言語スキル',
              actionDetail: '英語スコアの公式獲得や海外渡航実績により、市場価値の高いグローバル対応力を証明。',
              breakdown: [
                { label: 'TOEIC・語学スコア加点', pt: `+${(gloPotential * 0.65).toFixed(1)}pt` },
                { label: '海外渡航・適応力評価', pt: `+${(gloPotential * 0.35).toFixed(1)}pt` },
              ],
            },
          ];

          const actionContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-purple-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>各項目別：何をすれば何pt上がるか具体策（最大 +{totalPotentialPt}pt）</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <LockIcon className="w-3 h-3 mr-0.5" />プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">項目別スコア引き上げアクション</span>
              </div>

              {/* 6項目別カードグリッド */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {improvementCategories.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                    >
                      <div>
                        {/* ヘッダー: 項目名 + 向上ポイント */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-black text-white text-xs sm:text-sm">{cat.title}</span>
                          </div>
                          <span className={`text-xs sm:text-sm font-black ${cat.textColor} font-mono`}>
                            最大 +{cat.potential.toFixed(1)}pt 向上
                          </span>
                        </div>

                        {/* プログレスバー */}
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden my-2 border border-slate-800/60">
                          <div
                            className={`h-full rounded-full ${cat.barColor}`}
                            style={{ width: `${Math.min(95, Math.max(30, Math.round((cat.potential / 9.0) * 100)))}%` }}
                          />
                        </div>

                        {/* 何をすれば上がるか */}
                        <div className="space-y-1 pt-1">
                          <div className="text-[11px] font-black text-slate-200 flex items-center gap-1 flex-wrap">
                            <span className="shrink-0 text-emerald-400 font-extrabold">【具体策】</span>
                            {isUnlocked ? (
                              <span>{cat.actionTitle}</span>
                            ) : (
                              <span className="text-slate-300 filter blur-[8px] select-none">
                                体脂肪率の適正化 ＆ 写真クオリティの最適化
                              </span>
                            )}
                          </div>
                          {isUnlocked ? (
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {cat.actionDetail}
                            </p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-slate-400 text-[11px] filter blur-[8px] select-none">
                                {cat.actionDetail}
                              </p>
                              <span className="text-[10px] text-amber-400 font-bold shrink-0"><LockIcon className="w-3 h-3 mr-0.5" />アンロック</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 加点の内訳バッジ */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-1.5 text-[10px]">
                        {cat.breakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                          >
                            {isUnlocked ? (
                              <span>{item.label}</span>
                            ) : (
                              <span className="filter blur-[7px] select-none text-slate-400">
                                改善スコア加点要素
                              </span>
                            )}
                            <span className={`font-bold ${cat.textColor} font-mono shrink-0`}>{item.pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックして改善ロードマップをアンロック">
                {actionContent}
              </Link>
            );
          }
          return actionContent;
        })()}

        {/* 6. プレミアム専用⑤: パーソナライズ「即コピペで使える最強自己PR文章」（新設） */}
        {(() => {
          const prContent = (
            <div className={`p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 space-y-4 transition-all ${
              !isUnlocked ? 'cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900' : ''
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                    <span>パーソナライズ「即コピペで使える最強プロフィール文章」</span>
                    {!isUnlocked && (
                      <span className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <LockIcon className="w-3 h-3 mr-0.5" />プレミアム
                      </span>
                    )}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-indigo-300">マッチングアプリ・婚活特化フォーマット</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* パターンA: 恋活・マッチングアプリ用 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      パターンA: 恋活・マッチングアプリ用
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={copyAppBio}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-[11px] font-bold text-indigo-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedApp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedApp ? 'コピー完了' : 'コピー'}</span>
                      </button>
                    )}
                  </div>
                  {isUnlocked ? (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-mono select-all">
                      {profileAppText}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-400 leading-relaxed whitespace-pre-line border border-slate-800 filter blur-[8px] select-none">
                      {profileAppText}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">誠実さ・知性・親しみやすさを黄金比率で両立</span>
                </div>

                {/* パターンB: 真剣婚活・結婚相談所用 */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-pink-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400" />
                      パターンB: 真剣婚活・結婚相談所用
                    </span>
                    {isUnlocked && (
                      <button
                        onClick={copyMarriageBio}
                        className="px-2.5 py-1 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/40 text-[11px] font-bold text-pink-200 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {copiedMarriage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMarriage ? 'コピー完了' : 'コピー'}</span>
                      </button>
                    )}
                  </div>
                  {isUnlocked ? (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed whitespace-pre-line border border-slate-800 font-mono select-all">
                      {profileMarriageText}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-400 leading-relaxed whitespace-pre-line border border-slate-800 filter blur-[8px] select-none">
                      {profileMarriageText}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block">生活基盤の安定感・将来像の信頼性を訴求</span>
                </div>
              </div>
            </div>
          );

          if (!isUnlocked) {
            return (
              <Link href={`/purchase/${diagnosisId}`} className="block focus:outline-none" title="クリックしてプロフィール文章をアンロック">
                {prContent}
              </Link>
            );
          }
          return prContent;
        })()}

        {/* 7. 未アンロック時の最下部総合CTAカード */}
        {!isUnlocked && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/80 via-slate-900/95 to-indigo-950/80 border-2 border-purple-500/50 shadow-2xl shadow-purple-950/50 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 mx-auto flex items-center justify-center shadow-xl shadow-purple-600/40">
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="text-lg sm:text-xl font-black text-white">
                プレミアム深層レポート ＆ 完全データアンロック
              </h4>
              <p className="text-xs text-slate-300">
                1回買い切り ¥500（月額課金・追加費用なし）で、あなたの強み・主戦場・相性・ロードマップを完全アンロック
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left text-xs text-slate-300 py-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>主戦場ランキング ＆ 1,000人受容</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>好かれやすい異性の特徴 (全7項目)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>相性最悪な地雷異性タイプ ワースト3</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>6カテゴリ改善ロードマップ ＆ 自己PR文章</span>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <Link
                href={`/purchase/${diagnosisId}`}
                scroll={true}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-purple-600/40 transition-all cursor-pointer"
              >
                <Unlock className="w-5 h-5" />
                <span>¥500 で詳細データを完全アンロック</span>
                <ChevronRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Apple Pay / Google Pay / カード対応
                </span>
                <span>•</span>
                <span>買い切り・即時反映</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
