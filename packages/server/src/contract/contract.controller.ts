import { Controller, Post, Body } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateGreetingDto } from './dto/create-greeting.dto';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  create(@Body() createGreetingDto: CreateGreetingDto) {
    return this.contractService.createGreeting(createGreetingDto);
  }
}
