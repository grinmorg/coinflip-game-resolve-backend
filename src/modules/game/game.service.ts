// src/game/game.service.ts
import { Injectable } from '@nestjs/common'

import { SignerService } from '../signer/signer.service'

@Injectable()
export class GameService {
	constructor(private signerService: SignerService) {}

	async resolveGame(gameId: number) {
		// Ваша логика определения победителя (например, из БД или случайно)
		const result = Math.random() > 0.5 ? 1 : 0 // 0 или 1

		const signature = await this.signerService.signGameResult(
			gameId,
			result
		)

		return {
			gameId,
			result,
			signature,
			signerAddress: this.signerService.signerAddress
		}
	}
}
