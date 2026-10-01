import type { Direction, Element, Language } from '../domain/model'
export type Bilingual = [string, string]
export const pick = (text: Bilingual, lang: Language) => text[lang === 'zh-CN' ? 0 : 1]
export const directions: Record<Direction, Bilingual> = { north: ['北', 'North'], south: ['南', 'South'], east: ['东', 'East'], west: ['西', 'West'], center: ['中', 'Center'], ne: ['东北', 'Northeast'], nw: ['西北', 'Northwest'], se: ['东南', 'Southeast'], sw: ['西南', 'Southwest'] }
export const elements: Record<Element, Bilingual> = { water: ['水', 'Water'], fire: ['火', 'Fire'], wood: ['木', 'Wood'], metal: ['金', 'Metal'], earth: ['土', 'Earth'] }
export const copy = {
  hetu: ['河图', 'Hetu'], luoshu: ['洛书', 'Luoshu'], compare: ['对照', 'Compare'],
  original: ['原图', 'Form'], polarity: ['阴阳', 'Yin / yang'], pairs: ['生成', 'Pairs'], balance: ['均衡', 'Balance'], elements: ['五行', 'Five phases'],
  hetuSubtitle: ['五方相合，生成有序。', 'Five directions. Numbers in relation.'],
  luoshuSubtitle: ['九宫错落，纵横有度。', 'Nine positions. A measured balance.'],
  compareSubtitle: ['同数异位，参照而观。', 'The same numbers, differently arranged.'],
  hetuIntro: ['一至十，分居五方。每一组数字，以五相续。', 'One to ten, paired across five directions. Each pair differs by five.'],
  luoshuIntro: ['一至九，布列九宫。纵、横、斜，皆合十五。', 'One to nine in a square. Every row, column and diagonal sums to fifteen.'],
  compareIntro: ['循同一数字，观察两种秩序之间的位置变化。', 'Follow a number to see how its position changes between two arrangements.'],
  explore: ['探索关系', 'Explore relations'], intro: ['入门', 'Learn'], about: ['关于', 'About'], view: ['视角', 'View'],
  oblique: ['空间视角', 'Spatial view'], top: ['阅读视角', 'Reading view'], focus: ['聚焦所选', 'Focus selection'], reset: ['复位', 'Reset'],
  controls: ['拖动旋转 · 滚动缩放 · 点击探索', 'Drag to orbit · Scroll to zoom · Select to explore'],
  mobileControls: ['单指旋转 · 双指缩放 · 轻触探索', 'Drag to orbit · Pinch to zoom · Tap to explore'],
  source: ['查看出处', 'View source'], readSource: ['阅读原文 ↗', 'Read the source ↗'], close: ['关闭', 'Close'],
  skip: ['跳过导览', 'Skip introduction'], pause: ['暂停', 'Pause'], resume: ['继续', 'Resume'], next: ['下一步', 'Next'], replay: ['重播导览', 'Replay introduction'],
  selection: ['数字', 'Number'], yang: ['阳 · 奇数', 'Yang · odd'], yin: ['阴 · 偶数', 'Yin · even'], direction: ['方位', 'Direction'], phase: ['配属', 'Phase'],
  count: ['点', 'points'], clear: ['取消选择', 'Clear selection'], choose: ['选择一个数字，展开它的关系。', 'Select a number to uncover its relations.'],
  pairExplanation: ['生数与成数同居一方，彼此相差五。', 'A generating number and its completing number share a direction and differ by five.'],
  polarityExplanation: ['本图式以白点表奇数，以黑点表偶数；奇偶分别配属阳、阴。', 'In this diagram, white points denote odd numbers and black points even numbers, associated with yang and yin.'],
  balanceExplanation: ['由本图点数计算：每行、每列及两条对角线，合数皆为十五。', 'Calculated from this arrangement: every row, column and both diagonals sum to fifteen.'],
  oppositeExplanation: ['与中心相对的两数合十，加上中五，合为十五。', 'Opposite numbers sum to ten. Together with the central five, they total fifteen.'],
  elementExplanation: ['河图以五行生成数配属五方；颜色只在当前关系中作提示。', 'Hetu associates generating and completing numbers with five phases and directions. Color accents mark the active relation.'],
  palaceExplanation: ['此处使用后天九宫的方位与卦象配属；与河图的数字五行配属分别理解。', 'This layer uses later nine-palace and trigram associations, distinct from the number–phase associations in Hetu.'],
  computed: ['点阵计算', 'From the arrangement'], traditional: ['传统配属', 'Traditional association'],
  generating: ['相生', 'Generating'], controlling: ['相克', 'Controlling'], playRelation: ['演示关系', 'Play relation'], stop: ['停止', 'Stop'],
  line: ['纵横斜线', 'Lines of fifteen'], previous: ['上一条', 'Previous'], following: ['下一条', 'Next'],
  twoD: ['二维阅读', '2D reading'], threeD: ['三维探索', '3D exploration'], loading: ['空间正在显现', 'Preparing the space'],
  fallback: ['已切换至二维阅读，数字与关系保持完整。', '2D reading is active. All numbers and relations remain available.'],
  restore: ['恢复三维', 'Retry 3D'], reduced: ['减少动态效果', 'Reduce motion'], quality: ['画质', 'Quality'], auto: ['标准', 'Standard'], low: ['轻量', 'Light'],
  read: ['读图', 'Reading'], history: ['源流', 'History'], method: ['方法', 'Practice'],
  learnTitle: ['从点数入门', 'Begin with the points'], learnSubtitle: ['先看关系，再读传统。', 'Observe the relations. Then read the tradition.'],
  historyTitle: ['图书之名，历代之说', 'Names with a history'], methodTitle: ['观象、辨数、知其所出', 'Observe, compare, trace the source'],
  tenNote: ['十属于河图；切换后已清除选择。', 'Ten belongs to Hetu; the selection has been cleared.'],
  orientation: ['南上 · 东左', 'South above · East left'],
} satisfies Record<string, Bilingual>
export const guideSteps: { title: Bilingual; body: Bilingual; source?: string }[] = [
  { title: ['从点，开始', 'Begin with a point'], body: ['每一组点，组成一个数字。河图以一至十，布列五方。', 'Each group of points forms a number. Hetu places one through ten across five directions.'], source: 'hetu' },
  { title: ['一与六，共居北方', 'One and six, together in the north'], body: ['一为生数，六为成数。同方相合，彼此相差五。', 'One is a generating number; six completes it. They share a direction and differ by five.'], source: 'generation' },
  { title: ['同一组数，另一种秩序', 'The numbers find another arrangement'], body: ['一至九重新布列。十淡出；这里演示的是布局对照。', 'One through nine move to new positions. Ten recedes. This transition compares the two layouts.'] },
  { title: ['中五，纵横皆十五', 'Five at the center. Fifteen in every line.'], body: ['九、五、一合十五。每行、每列、两条对角线亦然。', 'Nine, five and one total fifteen. So do every row, column and both diagonals.'] },
  { title: ['循数而观，关系自明', 'Follow a number. Find its relations.'], body: ['轻触一个数字，或选择关系视图，继续探索。', 'Select a number or a relation view to continue your exploration.'] },
]
export const lessons: Record<'read' | 'history' | 'method', { title: Bilingual; body: Bilingual; source?: string; source2?: string; action?: 'pairs' | 'balance' | 'polarity' }[]> = {
  read: [
    { title: ['01 / 点就是数', '01 / Count the points'], body: ['先数点，再看奇偶。白点组成奇数，黑点组成偶数；此图式以奇为阳、偶为阴。', 'Count first, then compare parity. White groups are odd and black groups even; this convention associates odd with yang and even with yin.'], source: 'polarity', action: 'polarity' },
    { title: ['02 / 河图：生成相合', '02 / Hetu: paired numbers'], body: ['一与六、二与七、三与八、四与九、五与十，共居五方。生成与阴阳是不同的分组，生数之中也有奇偶。', 'One/six, two/seven, three/eight, four/nine and five/ten share five directions. Generating/completing and yin/yang are different classifications.'], source: 'hetu', action: 'pairs' },
    { title: ['03 / 洛书：纵横均衡', '03 / Luoshu: balance across the square'], body: ['先找中心五，再观察四组对位。两数合十，加中五为十五；八条直线也都合十五。这可以直接用点数验证。', 'Locate the central five, then the four opposite pairs. Each pair sums to ten; with five, to fifteen. Verify all eight lines by counting.'], action: 'balance' },
    { title: ['04 / 阴阳：循变化读关系', '04 / Yin and yang: reading change'], body: ['《系辞上》说“一阴一阳之谓道”。图中的奇偶是阅读这一概念的一个入口；回到经典语境，继续观察阴阳如何描述交替、相待与变化。', 'The Xici speaks of the alternation of yin and yang as dao. Parity in these diagrams is one starting point; return to the classical context to explore alternation, relation and change.'], source: 'dao' },
    { title: ['05 / 五行：两种次序', '05 / Five phases: two sequences'], body: ['《洪范》以水、火、木、金、土为五行之序；相生关系则依木、火、土、金、水循环。区分列举的次序与关系的次序，再观察它们在图中的方位。', 'Hongfan lists water, fire, wood, metal and earth. The generating cycle runs wood, fire, earth, metal and water. Distinguish enumeration from relational sequence, then observe the directions in the diagrams.'], source: 'hongfan', source2: 'generatingCycle' },
  ],
  history: [
    { title: ['经典中的“图”与“书”', 'The names in the classics'], body: ['《系辞上》记“河出图，洛出书，圣人则之”。这一传世表述没有给出今天所见黑白数点图的完整样式。', 'The Xici names a chart from the Yellow River and a writing from the Luo. That passage does not specify the complete black-and-white point diagrams used today.'], source: 'xici' },
    { title: ['宋代易图学的形成', 'The Song development of diagram studies'], body: ['黑白数点图在宋代易学中得到系统阐释。刘牧以九数为河图、十数为洛书；朱熹、蔡元定所论名称与之相反。本作品采用后者所论十数河图、九数洛书。', 'Song scholars developed systematic accounts of the point diagrams. Liu Mu called the nine-number form Hetu and the ten-number form Luoshu; Zhu Xi and Cai Yuanding used the reverse names. This work follows the latter convention.'], source: 'history' },
    { title: ['传统之中，也有辨论', 'Debate within the tradition'], body: ['黄宗羲《易学象数论》对图书之说提出辨论。阅读时应辨别经文、后世解释和传说，各自知道其依据。', 'Huang Zongxi critically examined chart-and-writing theories in Yixue Xiangshu Lun. Distinguish canonical passages, later interpretations and legends when reading.'], source: 'debate' },
  ],
  method: [
    { title: ['观象：先看位置', 'Observe: begin with position'], body: ['将图式转到阅读视角，辨认五方与九宫。本文以南在上、东在左的约定展示；旋转镜头不会改变方位。', 'Use the reading view to identify the five directions and nine positions. South is above and east left; orbiting the camera does not change those directions.'] },
    { title: ['辨数：亲手验证关系', 'Compare: verify the numbers'], body: ['先验证差五、合十与合十五，再阅读阴阳、五行的解释。可计算的关系与传统象征的配属，分别理解。', 'Verify differences of five and sums of ten and fifteen before reading yin/yang and five-phase interpretations. Treat arithmetic relations and traditional symbolic associations separately.'] },
    { title: ['读经：回到真实出处', 'Read: return to the source'], body: ['将鼠标移到小注标记，或用键盘、轻触展开，阅读篇名与原文。从观察、辨数到读经，逐步体会古人如何组织经验、理解变化，并将所学消化为自己的认识。', 'Hover, focus or tap a reference mark to read the source and original passage. Move from observing to comparing and reading: discover how earlier thinkers organized experience and understood change, then reflect in your own terms.'], source: 'method' },
  ],
}
