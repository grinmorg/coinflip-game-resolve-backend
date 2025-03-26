import { Module } from '@nestjs/common'

import { SignerModule } from '../signer/signer.module'

import { GameController } from './game.controller'
import { GameService } from './game.service'

@Module({
	imports: [SignerModule],
	controllers: [GameController],
	providers: [GameService]
})
export class GameModule {}
