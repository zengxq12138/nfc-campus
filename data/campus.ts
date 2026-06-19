import type { CampusSpot } from "@/lib/types";

const campusSource = "https://www.gxu.edu.cn/info/1021/18800.htm";

export const schoolFacts = [
  {
    label: "1928",
    text: "广西大学创办年份"
  },
  {
    label: "211",
    text: "国家重点建设高校"
  },
  {
    label: "双一流",
    text: "世界一流学科建设高校"
  }
];

export const campusOverview = [
  "广西大学坐落于广西首府南宁，是广西办学历史最悠久、规模最大的综合性大学。",
  "这所学校从八桂大地走来，也把一届又一届毕业生送往更远的地方。",
  "这一页不做厚重校史，只留下与毕业季一起亮起的母校画面。"
];

export const campusSpots: CampusSpot[] = [
  {
    slug: "huitang",
    name: "汇学堂",
    shortName: "汇学堂",
    description: "开学礼、讲座、晚会与毕业合影，都曾在这片开阔草坪前留下回声。",
    imageUrl: "/images/campus/01-huitang.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学汇学堂校园风光"
  },
  {
    slug: "zhixing-academy",
    name: "知行书院",
    shortName: "知行书院",
    description: "书院的门廊与树影连在一起，像校园生活里安静而可靠的背景。",
    imageUrl: "/images/campus/02-zhixing-academy.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学知行书院"
  },
  {
    slug: "sculpture-garden",
    name: "雕塑园",
    shortName: "雕塑园",
    description: "雕塑、草地和行人交错，是课间散步时常会经过的开放角落。",
    imageUrl: "/images/campus/03-sculpture-garden.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学雕塑园"
  },
  {
    slug: "student-activity-center",
    name: "大学生活动中心",
    shortName: "活动中心",
    description: "社团、排练、展演和热闹的夜晚，让这里成为青春感很浓的一站。",
    imageUrl: "/images/campus/04-student-activity-center.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学大学生活动中心"
  },
  {
    slug: "sixth-teaching-building",
    name: "第六教学楼",
    shortName: "六教",
    description: "走廊、阶梯教室与课表，在这里把一学期一学期慢慢排满。",
    imageUrl: "/images/campus/05-sixth-teaching-building.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学第六教学楼"
  },
  {
    slug: "auditorium",
    name: "大礼堂",
    shortName: "大礼堂",
    description: "庄重的立面和树木围合出仪式感，是校园记忆里很醒目的坐标。",
    imageUrl: "/images/campus/06-auditorium.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学大礼堂"
  },
  {
    slug: "biyun-lake-sunset",
    name: "碧云湖夕照",
    shortName: "碧云湖",
    description: "湖面接住傍晚的光，也接住很多次从自习路上抬头看到的风景。",
    imageUrl: "/images/campus/07-biyun-lake-sunset.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学碧云湖夕照"
  },
  {
    slug: "west-of-auditorium",
    name: "大礼堂西侧",
    shortName: "礼堂西侧",
    description: "从礼堂旁绕过，建筑的侧影和树荫把校园节奏放慢了一点。",
    imageUrl: "/images/campus/08-west-of-auditorium.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学大礼堂西侧"
  },
  {
    slug: "front-of-auditorium",
    name: "大礼堂前",
    shortName: "礼堂前",
    description: "正前方的开阔空间适合停下脚步，也适合在离校前再拍一张照片。",
    imageUrl: "/images/campus/09-front-of-auditorium.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学大礼堂前"
  },
  {
    slug: "campus-view",
    name: "校园小景",
    shortName: "校园小景",
    description: "不一定有响亮名字，却常常是在路过时最容易被记住的一角。",
    imageUrl: "/images/campus/10-campus-view.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学校园小景"
  },
  {
    slug: "biyun-lakeside",
    name: "碧云湖畔",
    shortName: "湖畔",
    description: "沿湖走一段，风从水面过来，带着校园里少有的安静。",
    imageUrl: "/images/campus/11-biyun-lakeside.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学碧云湖畔"
  },
  {
    slug: "campus-corner",
    name: "校园小景",
    shortName: "校园一角",
    description: "花木、道路和建筑边角组成日常风景，也组成离校后会想起的细节。",
    imageUrl: "/images/campus/12-campus-corner.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学校园小景"
  },
  {
    slug: "east-campus-staff-living-area",
    name: "东校园教工生活区",
    shortName: "东校园",
    description: "生活区带着校园里的烟火气，让大学不只属于课堂和图书馆。",
    imageUrl: "/images/campus/13-east-campus-staff-living-area.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学东校园教工生活区"
  },
  {
    slug: "shaded-campus-path",
    name: "校园林荫小道",
    shortName: "林荫小道",
    description: "树荫把道路盖住，很多赶课、散步和聊天的片段都从这里经过。",
    imageUrl: "/images/campus/14-shaded-campus-path.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学校园林荫小道"
  },
  {
    slug: "main-gate-lab-building",
    name: "学校大门和综合实验楼",
    shortName: "学校大门",
    description: "进校时从这里开始，离校时也常在这里回望一次。",
    imageUrl: "/images/campus/15-main-gate-lab-building.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学学校大门和综合实验楼"
  },
  {
    slug: "library",
    name: "图书馆",
    shortName: "图书馆",
    description: "灯光、座位、书架和截止日期，构成毕业前最真实的时间刻度。",
    imageUrl: "/images/campus/16-library.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学图书馆"
  },
  {
    slug: "multimedia-building",
    name: "多媒体教学楼",
    shortName: "多媒体楼",
    description: "课程、实验和报告从这里展开，属于许多人日常学习的路线。",
    imageUrl: "/images/campus/17-multimedia-building.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学多媒体教学楼"
  },
  {
    slug: "student-apartment",
    name: "学生公寓",
    shortName: "学生公寓",
    description: "夜归、外卖、洗衣和聊天，宿舍楼把大学生活变得具体。",
    imageUrl: "/images/campus/18-student-apartment.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学学生公寓"
  },
  {
    slug: "sunset-path",
    name: "夕阳小道",
    shortName: "夕阳小道",
    description: "落日照在路面上，晚课后的校园有一种很轻的告别感。",
    imageUrl: "/images/campus/19-sunset-path.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学夕阳小道"
  },
  {
    slug: "east-campus-staff-dormitory",
    name: "东校园教工宿舍楼",
    shortName: "教工宿舍楼",
    description: "建筑与绿树相互遮映，呈现校园里更生活化的一面。",
    imageUrl: "/images/campus/20-east-campus-staff-dormitory.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学东校园教工宿舍楼"
  },
  {
    slug: "qingcao-garden-corner",
    name: "西校园共青草坪花园一角",
    shortName: "共青草坪",
    description: "花园的一角把绿意铺开，适合把毕业季的心情放慢。",
    imageUrl: "/images/campus/21-qingcao-garden-corner.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学西校园共青草坪花园一角"
  },
  {
    slug: "campus-small-scene",
    name: "校园小景",
    shortName: "校园小景",
    description: "晴天里的树影和道路，是照片之外更柔软的校园记忆。",
    imageUrl: "/images/campus/22-campus-small-scene.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学校园小景"
  },
  {
    slug: "qingcao-garden-lotus-pond",
    name: "西校园共青草坪花园荷塘",
    shortName: "花园荷塘",
    description: "荷叶铺满水面，夏天的气息在这里格外清楚。",
    imageUrl: "/images/campus/23-qingcao-garden-lotus-pond.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学西校园共青草坪花园荷塘"
  },
  {
    slug: "ma-junwu-statue",
    name: "马君武雕像",
    shortName: "马君武",
    description: "雕像静静立在树影旁，提醒后来者这所学校的来处。",
    imageUrl: "/images/campus/24-ma-junwu-statue.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学马君武雕像"
  },
  {
    slug: "west-campus-view",
    name: "西校园小景",
    shortName: "西校园",
    description: "西校园的日常角落，把绿色、道路和建筑收进同一幅画面。",
    imageUrl: "/images/campus/25-west-campus-view.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学西校园小景"
  },
  {
    slug: "west-campus-jinghu",
    name: "西校园镜湖",
    shortName: "镜湖",
    description: "湖水映出树和天色，像给校园留下一面安静的镜子。",
    imageUrl: "/images/campus/26-west-campus-jinghu.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学西校园镜湖"
  },
  {
    slug: "west-campus-jinghu-corner",
    name: "西校园镜湖一角",
    shortName: "镜湖一角",
    description: "从湖边的一角望过去，校园的夏天有了更温柔的收尾。",
    imageUrl: "/images/campus/27-west-campus-jinghu-corner.jpg",
    sourceUrl: campusSource,
    imageAlt: "广西大学西校园镜湖一角"
  }
];
