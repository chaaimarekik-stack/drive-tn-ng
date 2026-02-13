export interface LoginRequest {
    email: string;
    password: string;
    portal?: string | null;
}

export interface AuthResponse {
    accessToken: string;
    expiresIn: number;
}
