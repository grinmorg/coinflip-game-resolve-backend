// src/game/game.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common'
import { parseAbiItem } from 'viem'

import { CONTRACT_COIN_FLIP_ADDRESS } from '@/src/shared/constants/contracts'

import { SignerService } from '../signer/signer.service'

@Injectable()
export class GameService implements OnModuleInit {
	private unwatch: () => void

	constructor(private signerService: SignerService) {}

	async onModuleInit() {
		await this.watchGameEvents()
	}

	// Прослушивание события GameJoined
	async watchGameEvents() {
		console.log('watch: GameJoined event')

		this.unwatch = this.signerService.publicClient.watchEvent({
			address: CONTRACT_COIN_FLIP_ADDRESS,
			event: parseAbiItem(
				'event GameJoined(uint256 indexed gameId, address indexed player1, address indexed player2, uint256 choice)'
			),
			onLogs: async logs => {
				const { gameId, result, signature } = await this.resolveGame(
					logs[0].args.gameId
				)

				console.log(`Результат игры: ${gameId}, победитель ${result}`)

				const resolve = await this.signerService.resolveOnChain(
					gameId,
					result,
					signature
				)

				console.log('Результат записан в блокчейн:', resolve)
			}
		})
	}

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

	onApplicationShutdown() {
		if (this.unwatch) this.unwatch()
	}
}
