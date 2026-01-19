export interface User {
    id: number;
    nickname: string;
    email: string | null;
    profileImage: string | null;
}
export declare function useAuth(): {
    user: any;
    isLoading: any;
    isLoggedIn: boolean;
    login: () => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
};
export declare function getToken(): string | null;
export declare function useRequireProfile(): {
    isProfileComplete: any;
};
