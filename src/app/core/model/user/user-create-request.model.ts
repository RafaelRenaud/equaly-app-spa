
export interface UserCreateRequest {
  universalUser: {
    id: number
  },
  company: {
    id: number | null
  },
  department: {
    id: number | null
  },
  login: string,
  username: string,
  nickname: string,
  email: string
}