export interface MessageEvent {
  data: {
    receiverId: string;
    message: string;
  };
  id?: string;
  type?: string;
  retry?: number;
}
