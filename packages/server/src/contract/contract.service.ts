import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateGreetingDto } from './dto/create-greeting.dto';
import { ABI } from './abi/YourContract.abi';
import axios from 'axios';
import { KeysName } from '../KeysName';
import { Wallet, ethers } from 'ethers';

@Injectable()
export class ContractService {
  constructor(private readonly configService: ConfigService) {}
  private RPC_URL;
  private NETWORK_NAME;
  private GAS_STATION;
  private PRIVATE_KEY;
  private CONTRACT_ADDRESS;

  async loadSecret() {
    this.GAS_STATION = await this.configService.get(KeysName.GAS_STATION);
    this.RPC_URL = await this.configService.get(KeysName.RPC_URL);
    this.PRIVATE_KEY = await this.configService.get(KeysName.PRIVATE_KEY);
    this.NETWORK_NAME = await this.configService.get(KeysName.NETWORK_NAME);
    this.CONTRACT_ADDRESS = await this.configService.get(
      KeysName.CONTRACT_ADDRESS,
    );
  }
  async getCurrentFee() {
    try {
      await this.loadSecret();
      const response = await axios.get(this.GAS_STATION);
      const data = response.data;
      const fast_maxPriorityFee: number = data.fast.maxPriorityFee;
      const fast_maxFeePerGas: number = data.fast.maxFee;
      return {
        fast_maxPriorityFee: fast_maxPriorityFee.toFixed(4),
        fast_maxFeePerGas: fast_maxFeePerGas.toFixed(4),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async createGreeting(createGreetingDto: CreateGreetingDto) {
    await this.loadSecret();
    const ethersHttpProvider = new ethers.JsonRpcProvider(
      this.RPC_URL,
      this.NETWORK_NAME,
    );
    const walletPrivateKey = new Wallet(this.PRIVATE_KEY, ethersHttpProvider); // Replace with your private key

    const contractInterface = new ethers.Interface(ABI);
    const nonce = await ethersHttpProvider.getTransactionCount(
      walletPrivateKey.address,
      'latest',
    );

    const greetingParams = {
      _greeting: createGreetingDto.greeting,
    };
    const data = contractInterface.encodeFunctionData('setGreeting', [
      greetingParams,
    ]);
    const fees = await this.getCurrentFee();
    const txObject = {
      nonce: nonce,
      from: walletPrivateKey.address,
      to: this.CONTRACT_ADDRESS,
      data: data,
      chainId: 137,
      gasLimit: 5000000,
      maxPriorityFeePerGas: ethers.parseUnits(
        String(fees.fast_maxPriorityFee),
        'gwei',
      ),
      maxFeePerGas: ethers.parseUnits(String(fees.fast_maxFeePerGas), 'gwei'),
    };

    const signedTx = await walletPrivateKey.signTransaction(txObject);
    try {
      await ethersHttpProvider
        .broadcastTransaction(signedTx)
        .then((receipt) => {
          console.log(receipt);
          return receipt;
        })
        .catch((err) => {
          throw new Error(err);
        });
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
