export type TaskDetail = {
  id: string;
  status: "Pending" | "Completed" | "Error";
  translation?: string;
  location?: string;
  format?: string;
  responseTime?: string;
};

export type BackgroundTasks = {
  [key: string]: TaskDetail;
};
