import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ChatModule } from './chat/chat.module';

@Module({
  controllers: [],
  providers: [],
  imports: [

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),

    ChatModule,

  ],
})
export class AppModule {}
