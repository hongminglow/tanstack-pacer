export type QueuePosition = "front" | "back";

export type TaskItem = {
  id: string;
  label: string;
  priority: number;
};

export type BatchItem = {
  id: string;
  payload: string;
};

export type BatchResult = {
  id: string;
  at: number;
  items: BatchItem[];
};
