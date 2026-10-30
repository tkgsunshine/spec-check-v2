import ColumnCta from '@/components/column/ColumnCta';
import DataTable from '@/components/column/DataTable';
import { DEGREE_SCORES } from '@/lib/score-engine/academic';
import { formatTop } from '@/lib/column/stats';
import type { ColumnArticle } from './types';

const ORDER = ['DOCTOR', 'MASTER', 'BACHELOR', 'JUNIOR_COLLEGE', 'VOCATIONAL', 'HIGH_SCHOOL'] as const;

function Body() {
  const rows = ORDER.map((code) => [DEGREE_SCORES[code].label, `上位${formatTop(DEGREE_SCORES[code].topPercent)}`]);

  return (
    <>
      <p>
        学歴は、年収や仕事と並んで「スペック」として比べられやすい項目です。大学卒や大学院卒は、同世代の中でどのくらいの位置にいるのでしょうか。
        この記事では、最終学歴ごとの「上位何%」と、同じ学歴でも世代や大学によって評価が変わる理由を解説します。
      </p>

      <h2>最終学歴別の上位何%</h2>
      <DataTable
        caption="最終学歴ごとの「上位何%」"
        headers={['最終学歴', '位置']}
        rows={rows}
        note="その学歴以上の人が全体のうち何%いるかを示します。国勢調査・学校基本調査の学歴構成をもとに、人間スペック診断の学歴スコアで使っている値です。"
      />
      <p>
        大学卒（学士）以上は上位{formatTop(DEGREE_SCORES.BACHELOR.topPercent)}、大学院修士課程修了は上位{formatTop(DEGREE_SCORES.MASTER.topPercent)}、
        博士課程修了は上位{formatTop(DEGREE_SCORES.DOCTOR.topPercent)}です。大学院卒はおよそ20人に1人の少数派です。
      </p>

      <h2>同じ大卒でも、世代によって希少性が違う</h2>
      <p>
        大学進学率は時代とともに大きく上がってきました。若い世代では大学進学が当たり前になりつつある一方、60代・70代では大学卒の割合がずっと低く、同じ大卒でも同世代の中での希少性は高くなります。
      </p>
      <p>
        人間スペック診断では、こうした世代ごとの進学率の違いを考慮し、55歳以上の大卒・院卒には世代に応じたボーナスを加えています。
        また、住んでいる都道府県によっても大学進学率は違うため、進学率の低い地域ほど大卒の希少性を高く評価しています。
      </p>

      <ColumnCta />

      <h2>大学名（偏差値）でも評価は変わる</h2>
      <p>
        同じ「大卒」でも、出身大学によって周りからの見られ方は変わります。人間スペック診断では、大学名を入力すると偏差値をもとにスコアを補正し、学歴の評価に反映します。
        医学部や旧帝大・難関私大の出身であれば、最終学歴だけで比べたときより高い順位になります。
      </p>

      <h2>学歴は「総合スペック」の一部</h2>
      <p>
        学歴は年収や勤め先と結びつきやすい一方で、それだけで市場価値が決まるわけではありません。年収、資産、語学力、身長などと組み合わせて見ることで、同世代の中での本当の立ち位置がわかります。
      </p>
    </>
  );
}

const article: ColumnArticle = {
  slug: 'education-percentile',
  title: '学歴は上位何%？大卒・大学院卒の割合と世代による違い',
  description:
    '大学卒・大学院卒・高卒など最終学歴ごとに、同世代の中で上位何%にあたるかをまとめました。世代や住んでいる地域、出身大学によって学歴の希少性が変わる理由も解説します。',
  keywords: ['学歴 上位何%', '大卒 割合', '大学院卒 割合', '学歴 ランキング', '最終学歴 割合'],
  category: '学歴',
  publishedAt: '2026-10-30',
  updatedAt: '2026-10-30',
  faq: [
    {
      q: '大学院卒は上位何%ですか？',
      a: `修士課程修了で上位${formatTop(DEGREE_SCORES.MASTER.topPercent)}、博士課程修了で上位${formatTop(DEGREE_SCORES.DOCTOR.topPercent)}です。`,
    },
    {
      q: '大卒の割合は世代で違いますか？',
      a: '違います。大学進学率は時代とともに上がってきたため、年齢が上の世代ほど大卒の割合は低く、同世代の中での希少性は高くなります。',
    },
  ],
  related: ['income-percentile-by-age', 'income-10-million', 'net-worth-by-age'],
  Body,
};

export default article;
