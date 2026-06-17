// 类型定义 - 留待后续步骤实现
export type AppSettings = {
  theme: "light" | "dark" | "system";
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  contentWidth: "narrow" | "normal" | "wide";
  sidebarVisible: boolean;
  outlineVisible: boolean;
  lastOpenedFile?: string;
  lastOpenedFolder?: string;
  recentFiles: import("./file").RecentFile[];
};