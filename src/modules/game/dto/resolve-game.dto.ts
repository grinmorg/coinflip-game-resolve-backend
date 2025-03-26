import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class ResolveGameDto {
	@ApiProperty({
		description: 'ID игры',
		example: '1'
	})
	@IsNumber()
	gameId: number
}
