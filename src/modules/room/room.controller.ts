import {
  ApiAuthController,
  ApiResponseArray,
  ApiResponseObject,
} from '@services/openApi';
import { RoomService } from './room.service';
import { Body, Get, Post, Delete, Param } from '@nestjs/common';
import { CreateRoomDTO } from './dto/createRoom.dto';
import { Room } from '@modules/courseRegistration/entity/room.entity';
import { ViewAllRoomsDTO } from './dto/viewAllRooms.dto';

@ApiAuthController('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/create')
  @ApiResponseObject(Room)
  async createRoom(@Body() body: CreateRoomDTO): Promise<Room> {
    return this.roomService.createRoom(body);
  }

  @Get('all-rooms')
  @ApiResponseArray(ViewAllRoomsDTO)
  async getAllRooms(): Promise<ViewAllRoomsDTO[]> {
    return this.roomService.getAllRooms();
  }

  @Get(':id')
  @ApiResponseObject(Room)
  async getRoomById(@Param('id') id: string): Promise<Room> {
    return this.roomService.getRoomById(id);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string): Promise<void> {
    return this.roomService.deleteRoom(id);
  }
}
