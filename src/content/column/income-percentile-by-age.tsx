import ColumnCta from '@/components/column/ColumnCta';
import DataTable from '@/components/column/DataTable';
import { INCOME_AGE_LABELS, formatTop, incomeTopPercent, type ColumnGender } from '@/lib/column/stats';
import type { ColumnArticle } from './types';

const LIMITS = [300, 400, 500, 600, 700, 800, 1000, 1500];
const AGES = INCOME_AGE_LABELS.filter((l) => l !== '65歳以上');

function rowsFor(gender: ColumnGender) {
  return AGES.map((age) => [age, ...LIMITS.map((l) => formatTop(incomeTopPercent(age, gender, l)))]);
}

const HEADERS = ['年齢', ...LIMITS.map((l) => `${l}万円超`)];
const NOTE =
  '数値は「その年収を超える人が同じ年齢・性別の給与所得者のうち何%いるか」。国税庁「民間給与実態統計調査」の年齢階層別・性別の給与階級分布をもとに当サービスが推計した値で、人間スペック診断の年収スコアと同じデータです。';

function Body() {
  return (
    <>
      <p>
        「自分の年収は同世代の中でどのくらいの位置なのか」。平均年収と比べるだけでは、上位何%なのかはわかりません。年収の分布は一部の高所得者に引っ張られて平均が高めに出るため、実感とずれやすいからです。
      </p>
      <p>
        この記事では、年齢と性別ごとに「年収◯万円を超える人は上位何%か」を一覧にしました。自分の年齢の行を見れば、おおよその順位がわかります。
      </p>

      <h2>男性：年齢別・年収の上位何%早見表</h2>
      <DataTable caption="男性の年収ライン別「上位何%」" headers={HEADERS} rows={rowsFor('MALE')} note={NOTE} />
      <p>
        たとえば30〜34歳の男性で年収500万円を超えていれば上位{formatTop(incomeTopPercent('30〜34歳', 'MALE', 500))}、
        年収700万円超なら上位{formatTop(incomeTopPercent('30〜34歳', 'MALE', 700))}です。
        同じ年収500万円でも、25〜29歳なら上位{formatTop(incomeTopPercent('25〜29歳', 'MALE', 500))}と、年齢が若いほど順位は上がります。
      </p>

      <h2>女性：年齢別・年収の上位何%早見表</h2>
      <DataTable caption="女性の年収ライン別「上位何%」" headers={HEADERS} rows={rowsFor('FEMALE')} note={NOTE} />
      <p>
        女性は短時間勤務やパートで働く人も給与所得者に含まれるため、同じ年収でも男性より順位が高く出ます。
        30〜34歳の女性で年収400万円を超えていれば上位{formatTop(incomeTopPercent('30〜34歳', 'FEMALE', 400))}、
        500万円超なら上位{formatTop(incomeTopPercent('30〜34歳', 'FEMALE', 500))}です。
      </p>

      <ColumnCta />

      <h2>早見表の読み方と注意点</h2>
      <ul>
        <li>対象は会社などから給与を受け取っている人（給与所得者）です。自営業やフリーランスの事業所得は含みません。</li>
        <li>年収は手取りではなく、税金や社会保険料を引く前の額面（賞与を含む）で比べてください。</li>
        <li>パート・アルバイトも含んだ分布です。正社員同士で比べると、順位はこの表より下がります。</li>
        <li>表は年収の区切りごとの値です。区切りの間の年収は、前後の値のあいだと考えてください。</li>
      </ul>

      <h2>年収だけで「市場価値」は決まらない</h2>
      <p>
        同じ年収でも、勤め先の規模、職種、学歴、資産、年齢によって周りからの評価は変わります。年収が平均的でも、純資産や語学力、身長などほかの項目で上位に入っていることは珍しくありません。
      </p>
      <p>
        人間スペック診断では、年収に加えて学歴・資産・身長・語学など複数の項目を同世代と比べ、総合で上位何%かを算出します。年収の順位がわかったら、ほかの項目も含めた全体の立ち位置を確かめてみてください。
      </p>
    </>
  );
}

const article: ColumnArticle = {
  slug: 'income-percentile-by-age',
  title: '年収は上位何%？年齢別・男女別の早見表【20代〜60代】',
  description:
    '年収300万〜1500万円が同世代の上位何%にあたるかを、年齢別・男女別の早見表でまとめました。国税庁の民間給与実態統計調査をもとにした分布データで、自分の年収の順位がすぐわかります。',
  keywords: ['年収 上位何%', '年収 割合 年齢別', '年収 順位', '年収 中央値 年齢別', '年収 同世代 比較'],
  category: '年収',
  publishedAt: '2026-10-30',
  updatedAt: '2026-10-30',
  faq: [
    {
      q: '30代前半で年収500万円は上位何%ですか？',
      a: `30〜34歳の男性で年収500万円を超えていれば上位${formatTop(incomeTopPercent('30〜34歳', 'MALE', 500))}、女性なら上位${formatTop(incomeTopPercent('30〜34歳', 'FEMALE', 500))}です（給与所得者全体での比較）。`,
    },
    {
      q: '年収は手取りと額面のどちらで比べればよいですか？',
      a: '額面（税金・社会保険料を引く前、賞与込み）で比べてください。統計の給与額は額面で集計されています。',
    },
    {
      q: '自営業やフリーランスの年収も比べられますか？',
      a: 'この早見表は給与所得者の分布なので、事業所得は対象外です。目安としては、売上ではなく経費を引いた所得で比べるのが近い比較になります。',
    },
  ],
  related: ['income-10-million', 'net-worth-by-age', 'love-market-value'],
  Body,
};

export default article;
