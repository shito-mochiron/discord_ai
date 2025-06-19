import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserId } from '../common/decorators/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@UserId() user_id: string) {
    return this.userService.getUserById(user_id);
  }

  @Delete()
  async deleteUser(@UserId() user_id: string) {
    return this.userService.deleteUser(user_id);
  }
}
