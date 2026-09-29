export interface User {
  user_id: string;
  name: string;
  username: string;
  avatar_url: string;
  role: RoleResponse;
}

export interface RoleResponse {
  code: string;
  name: string;
}