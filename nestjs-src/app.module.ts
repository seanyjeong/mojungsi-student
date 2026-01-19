import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UniversitiesModule } from './universities/universities.module';
import { CalculatorsModule } from './calculators/calculators.module';
import { FormulaConfigsModule } from './admin/formula-configs/formula-configs.module';
import { UniversitiesModule as AdminUniversitiesModule } from './admin/universities/universities.module';
import { AuthModule } from './admin/auth/auth.module';
import { JungsiAdminModule } from './admin/jungsi/jungsi-admin.module';
import { SaasAuthModule } from './saas/auth/saas-auth.module';
import { ProfileModule } from './saas/profile/profile.module';
import { ScoresModule } from './saas/scores/scores.module';
import { SavedUniversitiesModule } from './saas/universities/saved-universities.module';
import { PracticalModule } from './saas/practical/practical.module';
import { NoticesModule } from './saas/notices/notices.module';
import { AdminNoticesModule } from './admin/notices/admin-notices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UniversitiesModule,
    CalculatorsModule,
    FormulaConfigsModule,
    AdminUniversitiesModule,
    AuthModule,
    JungsiAdminModule,
    SaasAuthModule,
    ProfileModule,
    ScoresModule,
    SavedUniversitiesModule,
    PracticalModule,
    NoticesModule,
    AdminNoticesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
