import ColumnCta from '@/components/column/ColumnCta';
import DataTable from '@/components/column/DataTable';
import { INCOME_AGE_LABELS, formatTop, incomeTopPercent } from '@/lib/column/stats';
import type { ColumnArticle } from './types';

const AGES = INCOME_AGE_LABELS.filter((l) => l !== '65歳以上');

function Body() {
  const rows = AGES.map((age) => [
    age,
    formatTop(incomeTopPercent(age, 'MALE', 1000)),
    formatTop(incomeTopPercent(age, 'FEMALE', 1000)),
    formatTop(incomeTopPercent(age, 'OVERALL', 1000)),
  ]);
  const rows800 = AGES.map((age) => [
    age,
    formatTop(incomeTopPercent(age, 'MALE', 600)),
    formatTop(incomeTopPercent(age, 'MALE', 800)),
    formatTop(incomeTopPercent(age, 'MALE', 1500)),
  ]);

  return (
    <>
      <p>
        「年収1000万円」は高収入の代名詞としてよく使われます。では実際に、年収1000万円を超えている人は同世代の中でどのくらいいるのでしょうか。
        結論から言うと、割合は年齢によって大きく変わります。30代前半の男性では上位{formatTop(incomeTopPercent('30〜34歳', 'MALE', 1000))}ですが、
        50代前半の男性では上位{formatTop(incomeTopPercent('50〜54歳', 'MALE', 1000))}まで広がります。
      </p>

      <h2>年収1000万円超の割合（年齢別・男女別）</h2>
      <DataTable
        caption="年収1000万円を超える人の割合（＝上位何%）"
        headers={['年齢', '男性', '女性', '男女計']}
        rows={rows}
        note="国税庁「民間給与実態統計調査」の年齢階層別・性別の給与階級分布をもとに当サービスが推計した値です。給与所得者（パート・アルバイトを含む）が対象です。"
      />
      <p>
        20代で年収1000万円を超える人はごく一部で、25〜29歳では男女計で上位{formatTop(incomeTopPercent('25〜29歳', 'OVERALL', 1000))}です。
        年齢とともに昇進や管理職手当で割合は増え、男性では50代後半に上位{formatTop(incomeTopPercent('55〜59歳', 'MALE', 1000))}とピークを迎えます。
      </p>

      <h2>600万・800万・1500万円のラインも確認</h2>
      <DataTable
        caption="男性の年収ライン別「上位何%」"
        headers={['年齢', '600万円超', '800万円超', '1500万円超']}
        rows={rows800}
      />
      <p>
        1000万円の手前でも、30代前半の男性で年収800万円を超えていれば上位{formatTop(incomeTopPercent('30〜34歳', 'MALE', 800))}に入ります。
        「1000万円に届かないから平均的」というわけではなく、年齢を考えれば十分に高い順位であることも多いのです。
      </p>

      <ColumnCta />

      <h2>年収1000万円に届きやすい条件</h2>
      <ul>
        <li><strong>勤め先の規模と業種</strong>：大企業や外資系、金融・コンサル・総合商社・IT などは、30代で1000万円台に届く給与体系を持つ会社が多い傾向です。</li>
        <li><strong>役職</strong>：一般的な日本企業では、課長〜部長クラスの管理職になることが大きな分かれ目になります。</li>
        <li><strong>専門職</strong>：医師、弁護士などの資格職や、需要の高い専門スキルを持つ職種は年齢にかかわらず高年収になりやすい職種です。</li>
        <li><strong>転職と副業</strong>：同じスキルでも会社によって給与水準は大きく違います。年収を上げる手段として転職を選ぶ人も増えています。</li>
      </ul>

      <h2>年収以外のスペックも含めて比べる</h2>
      <p>
        年収1000万円は一つの目安ですが、純資産、学歴、勤め先、語学力などを合わせると、同世代での立ち位置はまた違って見えます。
        人間スペック診断では、こうした項目を同じ年齢・性別の統計と比べて、総合で上位何%かを出します。
      </p>
    </>
  );
}

const article: ColumnArticle = {
  slug: 'income-10-million',
  title: '年収1000万円は上位何%？年代別・男女別の割合と届きやすい条件',
  description:
    '年収1000万円を超える人は同世代の上位何%か、20代〜60代の年代別・男女別にまとめました。600万・800万・1500万円のラインや、1000万円に届きやすい業種・役職の傾向も解説します。',
  keywords: ['年収1000万 割合', '年収1000万 上位何%', '年収1000万 30代', '年収800万 上位', '高年収 割合'],
  category: '年収',
  publishedAt: '2026-10-30',
  updatedAt: '2026-10-30',
  faq: [
    {
      q: '30代で年収1000万円は上位何%ですか？',
      a: `男性の場合、30〜34歳で上位${formatTop(incomeTopPercent('30〜34歳', 'MALE', 1000))}、35〜39歳で上位${formatTop(incomeTopPercent('35〜39歳', 'MALE', 1000))}です。`,
    },
    {
      q: '年収1000万円の人が一番多い年代は？',
      a: `割合が最も高いのは男性の50代後半で、上位${formatTop(incomeTopPercent('55〜59歳', 'MALE', 1000))}が年収1000万円を超えています。`,
    },
  ],
  related: ['income-percentile-by-age', 'net-worth-by-age', 'education-percentile'],
  Body,
};

export default article;
