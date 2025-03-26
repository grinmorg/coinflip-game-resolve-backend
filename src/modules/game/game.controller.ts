// src/game/game.controller.ts
import { Body, Controller, Post } from '@nestjs/common'

import { ResolveGameDto } from './dto/resolve-game.dto'
import { GameService } from './game.service'

@Controller('games')
export class GameController {
	constructor(private readonly gameService: GameService) {}

	@Post('resolve')
	async resolveGame(@Body() resolveGameDto: ResolveGameDto) {
		return this.gameService.resolveGame(resolveGameDto.gameId)
	}
}
