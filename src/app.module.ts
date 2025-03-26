import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { GameModule } from './modules/game/game.module'
import { SignerModule } from './modules/signer/signer.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		SignerModule,
		GameModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
