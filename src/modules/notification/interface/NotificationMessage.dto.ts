export interface MessageEvent {
  data: {
    receiverId: string;
    message: string;
  } | null;
  id?: string;
  type?: string;
  retry?: number;
}
