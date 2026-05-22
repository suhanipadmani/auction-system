export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationResponse {
  success: boolean;
  data: INotification[];
  total: number;
  page: number;
  totalPages: number;
}
