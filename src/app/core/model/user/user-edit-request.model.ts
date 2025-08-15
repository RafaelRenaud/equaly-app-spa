export interface UserEditRequest {
  department: {
    id: number | null;
  };
  login: string;
  username: string;
  nickname: string;
  email: string;
}
