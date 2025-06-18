import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserId } from '../common/decorators/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string, @UserId() requesterId: string) {
    return this.userService.getUserById(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @UserId() requesterId: string) {
    return this.userService.deleteUser(id);
  }
}
