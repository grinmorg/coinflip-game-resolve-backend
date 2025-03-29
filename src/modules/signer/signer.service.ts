// src/signer/signer.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
	Account,
	Chain,
	createPublicClient,
	createWalletClient,
	Hash,
	Hex,
	http
} from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { arbitrum, sepolia } from 'viem/chains'

import { CoinFlipABI } from '@/src/shared/constants/abi-coinflip'
import { CONTRACT_COIN_FLIP_ADDRESS } from '@/src/shared/constants/contracts'

@Injectable()
export class SignerService implements OnModuleInit {
	private readonly logger = new Logger(SignerService.name)
	private account: Account
	public signerAddress: Hex
	public publicClient: any
	public walletClient: any
	private currentChain: Chain

	constructor(private configService: ConfigService) {}

	async onModuleInit() {
		await this.initializeSigner()
	}

	private async initializeSigner() {
		const chainId = this.configService.get<number>('CHAIN_ID', sepolia.id)
		const privateKey = this.configService.get<Hex>('SIGNER_PRIVATE_KEY')

		// Инициализация сети
		this.currentChain = this.getChainById(chainId)
		this.publicClient = createPublicClient({
			chain: this.currentChain,
			transport: http()
		})

		this.walletClient = createWalletClient({
			chain: this.currentChain,
			transport: http(),
			account: this.account
		})

		// Инициализация аккаунта
		this.account = privateKey
			? privateKeyToAccount(privateKey)
			: this.generateNewWallet()

		this.signerAddress = this.account.address
		this.logger.log(`Signer initialized on ${this.currentChain.name}`)
		this.logger.log(`Signer address: ${this.signerAddress}`)
	}

	private generateNewWallet(): Account {
		const privateKey = generatePrivateKey()
		this.logger.warn('========================================')
		this.logger.warn('⚠️ Generated new signer wallet. Add to .env:')
		this.logger.warn(`SIGNER_PRIVATE_KEY=${privateKey}`)
		this.logger.warn('========================================')
		return privateKeyToAccount(privateKey)
	}

	private getChainById(chainId: number): Chain {
		const chains = {
			[sepolia.id]: sepolia,
			[arbitrum.id]: arbitrum
		}
		return chains[chainId] ?? sepolia
	}

	async signGameResult(gameId: number, result: number): Promise<Hash> {
		const domain = {
			chainId: this.currentChain.id // Минимальная защита от межсетевых replay-атак
		}

		const types = {
			GameResult: [
				{ name: 'gameId', type: 'uint256' },
				{ name: 'result', type: 'uint256' }
			]
		}

		const value = {
			gameId: BigInt(gameId),
			result: BigInt(result)
		}

		return await this.account.signTypedData({
			domain,
			message: value,
			primaryType: 'GameResult',
			types
		})
	}

	// Отправка в блокчейн
	async resolveOnChain(
		gameId: number,
		result: number,
		signature: Hash
	): Promise<Hash> {
		const { request } = await this.publicClient.simulateContract({
			address: CONTRACT_COIN_FLIP_ADDRESS,
			abi: CoinFlipABI,
			functionName: 'resolveGame',
			args: [gameId, result, signature],
			account: this.account
		})

		const txHash = await this.walletClient.writeContract(request)
		return txHash
	}
}
