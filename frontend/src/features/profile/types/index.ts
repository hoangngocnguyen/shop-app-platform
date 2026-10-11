export interface UserProfileResponse {
    user_id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    date_of_birth?: string | null;
}

export interface UpdateUserRequest {
    name?: string | null;
    username?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
}

export interface AvatarResponse {
    avatar_url?: string | null;
}