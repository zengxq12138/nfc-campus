import type { GraduateProfile } from "@/lib/types";

export const sampleProfiles: GraduateProfile[] = [
  {
    publicId: "gxu-2026-lin-yu",
    name: "林予安",
    majorClass: "计算机科学与技术 2022 级 2 班",
    signature: "把夏天、球场、图书馆夜灯和朋友的笑声，都装进这份小小的礼物里。",
    passwordSet: false,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=82",
        alt: "毕业生与同学在校园合影"
      },
      {
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=82",
        alt: "毕业季校园合影"
      },
      {
        url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=82",
        alt: "毕业生在校园草地合影"
      }
    ]
  },
  {
    publicId: "gxu-2026-chen-mu",
    name: "陈沐晴",
    majorClass: "新闻传播学 2022 级 1 班",
    signature: "愿所有赶过的早八、改过的稿、拍过的风景，都在以后继续发光。",
    passwordSet: true,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=82",
        alt: "毕业生个人照片"
      },
      {
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=82",
        alt: "同学在教室学习"
      }
    ]
  }
];
