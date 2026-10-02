export interface Source { id: string; title: string; author: string; section: string; quote?: string; url: string; kind: 'primary' | 'research' }
const qimeng = 'https://zh.wikisource.org/wiki/易學啟蒙通釋_(四庫全書本)/卷上'
export const sources: Record<string, Source> = {
  centralEarth: { id: 'centralEarth', title: '《礼记》', author: '传世经典', section: '月令 · 中央土', quote: '中央土。', url: 'https://ctext.org/liji/yue-ling/zh', kind: 'primary' },
  totals: { id: 'totals', title: '《周易》', author: '传世经典；此处参校《易学启蒙》所录经文', section: '系辞上 · 天地之数', quote: '天數二十有五，地數三十，凡天地之數五十有五。', url: qimeng + '#本圖書第一', kind: 'primary' },
  xici: { id: 'xici', title: '《周易》', author: '传世经典；《易传》作者与成书问题另有学术讨论', section: '系辞上', quote: '河出圖，洛出書，聖人則之。', url: 'https://ctext.org/book-of-changes/xi-ci-shang', kind: 'primary' },
  dao: { id: 'dao', title: '《周易》', author: '传世经典', section: '系辞上 · 第五章', quote: '一陰一陽之謂道，繼之者善也，成之者性也。', url: 'https://ctext.org/book-of-changes/xi-ci-shang', kind: 'primary' },
  hetu: { id: 'hetu', title: '《易学启蒙》', author: '南宋 · 朱熹、蔡元定；据胡方平《易学启蒙通释》所载正文', section: '本图书第一 · 河图之位', quote: '一與六共宗而居乎北，二與七為朋而居乎南，三與八同道而居乎東，四與九為友而居乎西，五與十相守而居乎中。', url: qimeng + '#本圖書第一', kind: 'primary' },
  luoshu: { id: 'luoshu', title: '《易学启蒙》', author: '南宋 · 朱熹、蔡元定；据胡方平《易学启蒙通释》所载正文', section: '本图书第一 · 蔡元定论九宫', quote: '九宮之數，戴九履一，左三右七，二四為肩，六八為足。', url: qimeng + '#本圖書第一', kind: 'primary' },
  polarity: { id: 'polarity', title: '《易学启蒙》', author: '南宋 · 朱熹、蔡元定；据胡方平《易学启蒙通释》所载正文', section: '本图书第一 · 天数与地数', quote: '陽數奇，故一三五七九皆屬乎天。……隂數偶，故二四六八十皆屬乎地。', url: qimeng + '#本圖書第一', kind: 'primary' },
  generation: { id: 'generation', title: '《易学启蒙》', author: '南宋 · 朱熹、蔡元定；据胡方平《易学启蒙通释》所载正文', section: '本图书第一 · 五行生成之数', quote: '天以一生水，而地以六成之。地以二生火，而天以七成之。天以三生木，而地以八成之。地以四生金，而天以九成之。天以五生土，而地以十成之。', url: qimeng + '#本圖書第一', kind: 'primary' },
  hongfan: { id: 'hongfan', title: '《尚书》', author: '传世经典', section: '洪范 · 五行', quote: '一曰水，二曰火，三曰木，四曰金，五曰土。', url: 'https://ctext.org/shang-shu/great-plan', kind: 'primary' },
  palace: { id: 'palace', title: '《周易折中》', author: '清 · 李光地等编；本段引宋 · 项安世', section: '说卦传 · “万物出乎震”节 · 集说', quote: '震、巽二木主春，故震在东方。巽东南次之。离火主夏，故为南方之卦。兑、乾二金主秋，故兑为正秋。乾西北次之。坎水主冬，故为北方之卦。土王四季，故坤土在夏秋之交，为西南方之卦；艮土在冬春之交，为东北方之卦。', url: 'https://www.shidianguji.com/mid-page/7601263576687149065', kind: 'primary' },
  cycle: { id: 'cycle', title: '《周易述》', author: '清 · 惠栋', section: '卷十六 · 系辞上', quote: '木克土，土克水，水克火，火克金，金克木。', url: 'https://zh.wikisource.org/wiki/周易述_(四庫全書本)/卷16', kind: 'primary' },
  generatingCycle: { id: 'generatingCycle', title: '《五行大义》', author: '隋 · 萧吉', section: '卷二 · 第四论相生', quote: '凡五行相生。……木火土金水是也。', url: 'https://zh.wikisource.org/wiki/五行大義/2#第四論相生', kind: 'primary' },
  history: { id: 'history', title: '《论刘牧〈河图〉〈洛书〉说的架构与意蕴》', author: '张克宾', section: '《周易研究》2024年第4期；山东大学易学与中国古代哲学研究中心', url: 'https://zhouyi.sdu.edu.cn/info/1034/1725.htm', kind: 'research' },
  debate: { id: 'debate', title: '《易学象数论》', author: '明清之际 · 黄宗羲', section: '图书一', quote: '六經之言「圖書」凡四。', url: 'https://zh.wikisource.org/wiki/易學象數論/圖書一', kind: 'primary' },
  method: { id: 'method', title: '《周易》', author: '传世经典', section: '系辞下', quote: '仰則觀象於天，俯則觀法於地。', url: 'https://ctext.org/book-of-changes/xi-ci-xia', kind: 'primary' },
}
