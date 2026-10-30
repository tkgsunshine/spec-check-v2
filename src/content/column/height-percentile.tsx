import ColumnCta from '@/components/column/ColumnCta';
import DataTable from '@/components/column/DataTable';
import { formatTop, heightGroups, heightTopPercent } from '@/lib/column/stats';
import type { ColumnArticle } from './types';

const MALE_HEIGHTS = [165, 170, 175, 180, 185];
const FEMALE_HEIGHTS = [150, 155, 160, 165, 170];
const male = heightGroups('MALE');
const female = heightGroups('FEMALE');
const male20 = male[0];
const female20 = female[0];

const NOTE =
  '人間スペック診断で使っている年代別の平均身長と標準偏差をもとに、身長の分布を正規分布で近似して算出した値です。';

function Body() {
  const maleRows = male.map((g) => [g.label, `${g.mean}cm`, ...MALE_HEIGHTS.map((h) => formatTop(heightTopPercent(g, h)))]);
  const femaleRows = female.map((g) => [g.label, `${g.mean}cm`, ...FEMALE_HEIGHTS.map((h) => formatTop(heightTopPercent(g, h)))]);

  return (
    <>
      <p>
        「身長175cmは高いほう？」「160cmの女性は平均より上？」。身長は年代によって平均が違うため、同世代の中で比べるのが正確です。
        この記事では、男女・年代別に「身長◯cm以上は上位何%か」を一覧にしました。
      </p>

      <h2>男性：身長の上位何%早見表</h2>
      <DataTable
        caption="男性の身長ライン別「上位何%」"
        headers={['年代', '平均', ...MALE_HEIGHTS.map((h) => `${h}cm以上`)]}
        rows={maleRows}
        note={NOTE}
      />
      <p>
        20代男性の平均身長は{male20.mean}cmです。175cm以上なら上位{formatTop(heightTopPercent(male20, 175))}、
        180cm以上なら上位{formatTop(heightTopPercent(male20, 180))}と、およそ{Math.round(100 / heightTopPercent(male20, 180))}人に1人の割合になります。
      </p>

      <h2>女性：身長の上位何%早見表</h2>
      <DataTable
        caption="女性の身長ライン別「上位何%」"
        headers={['年代', '平均', ...FEMALE_HEIGHTS.map((h) => `${h}cm以上`)]}
        rows={femaleRows}
        note={NOTE}
      />
      <p>
        20代女性の平均身長は{female20.mean}cmです。160cm以上で上位{formatTop(heightTopPercent(female20, 160))}、
        165cm以上で上位{formatTop(heightTopPercent(female20, 165))}、170cm以上は上位{formatTop(heightTopPercent(female20, 170))}です。
      </p>

      <ColumnCta variant="LOVE" />

      <h2>年代が上がるほど平均身長が低い理由</h2>
      <p>
        表を見ると、60代は20代より平均身長が男性で約{Math.round(male20.mean - male[male.length - 1].mean)}cm、女性で約{Math.round(female20.mean - female[female.length - 1].mean)}cm低くなっています。
        これは加齢で背が縮むだけでなく、子どもの頃の栄養状態が良くなり、若い世代ほど背が高く育ったという世代差によるものです。
        同じ175cmでも、20代と60代では同世代の中での順位が違うのはこのためです。
      </p>

      <h2>恋愛・婚活での身長の見られ方</h2>
      <p>
        マッチングアプリや結婚相談所では、身長は検索条件として最初に入力される項目の一つです。特に20代では、見た目や体型とあわせて第一印象を左右しやすい要素です。
        一方で年代が上がるにつれ、経済力や落ち着きなど、ほかの要素の比重が大きくなっていきます。
      </p>
      <p>
        人間スペック診断の恋愛市場価値では、身長・体型を年齢や見た目、経済力などと組み合わせ、年代ごとの重みで総合評価しています。身長の順位がわかったら、恋愛市場全体での立ち位置も確かめてみてください。
      </p>
    </>
  );
}

const article: ColumnArticle = {
  slug: 'height-percentile',
  title: '身長は上位何%？男女・年代別の早見表【175cm・180cm・160cm】',
  description:
    '身長175cmや180cmの男性、160cmや165cmの女性が同世代の上位何%にあたるかを、男女・年代別の早見表でまとめました。年代で平均身長が違う理由や、恋愛・婚活での身長の見られ方も解説します。',
  keywords: ['身長 上位何%', '身長175 割合', '身長180 割合', '平均身長 男性 20代', '女性 身長 160 割合'],
  category: '身体',
  publishedAt: '2026-10-30',
  updatedAt: '2026-10-30',
  faq: [
    {
      q: '20代男性で身長175cmは上位何%ですか？',
      a: `20代男性の平均は${male20.mean}cmで、175cm以上は上位${formatTop(heightTopPercent(male20, 175))}です。`,
    },
    {
      q: '20代女性で身長165cmは高いほうですか？',
      a: `20代女性の平均は${female20.mean}cmで、165cm以上は上位${formatTop(heightTopPercent(female20, 165))}にあたり、高いほうです。`,
    },
  ],
  related: ['love-market-value', 'income-percentile-by-age', 'education-percentile'],
  Body,
};

export default article;
