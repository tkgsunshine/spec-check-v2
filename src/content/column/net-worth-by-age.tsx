import ColumnCta from '@/components/column/ColumnCta';
import DataTable from '@/components/column/DataTable';
import { NET_WORTH_AGE_LABELS, formatTop, netWorthTopPercent } from '@/lib/column/stats';
import type { ColumnArticle } from './types';

const LIMITS = [0, 100, 300, 500, 1000, 2000, 3000, 5000, 10000];

function label(limit: number): string {
  if (limit === 0) return 'プラス';
  if (limit === 10000) return '1億円超';
  return `${limit}万円超`;
}

function Body() {
  const rows = NET_WORTH_AGE_LABELS.map((age) => [
    age,
    ...LIMITS.map((l) => formatTop(netWorthTopPercent(age, 'OVERALL', l))),
  ]);

  return (
    <>
      <p>
        貯金や資産の額は、年収以上に人と比べにくいものです。この記事では、預貯金・投資・不動産などの資産からローンなどの負債を引いた「純資産」が、同世代の中で上位何%にあたるかを年代別にまとめました。
      </p>

      <h2>年代別・純資産の上位何%早見表</h2>
      <DataTable
        caption="純資産ライン別「上位何%」（男女計）"
        headers={['年代', ...LIMITS.map(label)]}
        rows={rows}
        note="「プラス」は純資産が0円を超える人の割合です。総務省「家計調査（貯蓄・負債編）」をもとに当サービスが年代別に推計した分布で、人間スペック診断の資産スコアと同じデータです。"
      />
      <p>
        20代なら純資産300万円超で上位{formatTop(netWorthTopPercent('20代', 'OVERALL', 300))}、1000万円超なら上位{formatTop(netWorthTopPercent('20代', 'OVERALL', 1000))}です。
        40代で1000万円超は上位{formatTop(netWorthTopPercent('40代', 'OVERALL', 1000))}、50代で2000万円超は上位{formatTop(netWorthTopPercent('50代', 'OVERALL', 2000))}にあたります。
      </p>

      <h2>30代は「純資産マイナス」が増える</h2>
      <p>
        表を見ると、純資産がプラスの人の割合は20代で{formatTop(netWorthTopPercent('20代', 'OVERALL', 0))}なのに対し、30代では{formatTop(netWorthTopPercent('30代', 'OVERALL', 0))}に下がります。
        結婚や出産を機に住宅ローンを組む人が増え、資産より負債が大きくなるためです。ローン返済が進む40代以降は、再びプラスの人が増えていきます。
      </p>
      <p>
        つまり30代で純資産がマイナスでも、持ち家を買った直後なら珍しいことではありません。比べるときは、家の価値を資産に、ローン残高を負債に、両方を入れて計算するのが正確です。
      </p>

      <ColumnCta />

      <h2>純資産の計算方法</h2>
      <ul>
        <li><strong>資産</strong>：預貯金、株式・投資信託などの金融資産、不動産（時価）、車、時計などの換金できる持ち物</li>
        <li><strong>負債</strong>：住宅ローン、自動車ローン、奨学金、カードローンなどの借入残高</li>
        <li><strong>純資産</strong>＝資産の合計 − 負債の合計</li>
      </ul>
      <p>
        人間スペック診断の資産の項目でも、この考え方で純資産を計算し、同じ年代・性別の人と比べて順位を出しています。
      </p>

      <h2>資産を増やすには「収入−支出」と時間</h2>
      <p>
        純資産を増やす方法はシンプルで、収入を増やす、支出を減らす、増えた分を長く運用する、の3つです。
        年代別の表を見てもわかるとおり、資産は時間とともに積み上がるもの。同世代と比べて今どの位置にいるかを知ることが、目標を立てる第一歩になります。
      </p>
    </>
  );
}

const article: ColumnArticle = {
  slug: 'net-worth-by-age',
  title: '貯金・純資産は同世代で上位何%？20代〜70代の年代別早見表',
  description:
    '貯金や投資・不動産からローンを引いた純資産が、同世代の上位何%にあたるかを年代別の早見表でまとめました。30代で純資産がマイナスになりやすい理由や、純資産の計算方法も解説します。',
  keywords: ['貯金 平均 年代別', '純資産 上位何%', '貯金 中央値', '資産 同世代 比較', '30代 貯金'],
  category: '資産',
  publishedAt: '2026-10-30',
  updatedAt: '2026-10-30',
  faq: [
    {
      q: '20代で貯金300万円は多いほうですか？',
      a: `20代で純資産300万円超は上位${formatTop(netWorthTopPercent('20代', 'OVERALL', 300))}にあたり、同世代の中では多いほうです。`,
    },
    {
      q: '住宅ローンがあると純資産はどう計算しますか？',
      a: '家の時価を資産に、ローン残高を負債に入れて差し引きます。買った直後はマイナスになりやすく、返済が進むにつれてプラスに近づきます。',
    },
  ],
  related: ['income-percentile-by-age', 'income-10-million', 'love-market-value'],
  Body,
};

export default article;
