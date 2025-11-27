import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ConfigifyModule } from '@itgorillaz/configify';
import { MulterModule } from '@nestjs/platform-express';
@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    MulterModule.register(
      {
      dest: './uploads', 
    },
    )
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class AppModule {}
