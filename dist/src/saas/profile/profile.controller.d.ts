import { ProfileService } from './profile.service';
export declare class ProfileController {
    private profileService;
    constructor(profileService: ProfileService);
    getProfile(req: any): Promise<{
        name: string | null;
        id: number;
        grade: string | null;
        gender: string | null;
        nickname: string | null;
        email: string | null;
        profile_image: string | null;
        school: string | null;
    }>;
    updateProfile(req: any, body: {
        name?: string;
        school?: string;
        grade?: string;
        gender?: string;
    }): Promise<{
        name: string | null;
        id: number;
        grade: string | null;
        gender: string | null;
        nickname: string | null;
        email: string | null;
        profile_image: string | null;
        school: string | null;
    }>;
}
