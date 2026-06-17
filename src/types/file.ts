// 类型定义 - 留待后续步骤实现
export type OpenedFile = {
  path: string;
  name: string;
  content: string;
  size: number;
  modifiedAt: number;
};

export type RecentFile = {
  path: string;
  name: string;
  openedAt: number;
};