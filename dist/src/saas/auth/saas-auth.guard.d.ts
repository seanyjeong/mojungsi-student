import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SaasAuthService } from './saas-auth.service';
export declare class SaasAuthGuard implements CanActivate {
    private authService;
    constructor(authService: SaasAuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
