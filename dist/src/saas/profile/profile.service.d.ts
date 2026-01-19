import { PrismaService } from '../../prisma/prisma.service';
export declare class ProfileService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: number): Promise<{
        name: string | null;
        id: number;
        grade: string | null;
        gender: string | null;
        nickname: string | null;
        email: string | null;
        profile_image: string | null;
        school: string | null;
    } | null>;
    updateProfile(userId: number, data: {
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
