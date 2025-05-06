import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDTO } from './dto/createRoom.dto';
import { ViewAllRoomsDTO } from './dto/viewAllRooms.dto';
import { Room } from '@modules/courseRegistration/entity/room.entity';
import { ResponseCode, ServiceException } from '@common/error';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async createRoom(data: CreateRoomDTO): Promise<Room> {
    const checkDup = await this.roomRepository.findOne({
      where: { roomCode: data.roomCode, roomAddress: data.roomAddress },
    });
    if (checkDup) {
      throw new ServiceException(ResponseCode.DUPLICATE_ROOM, 'Duplicate Room');
    }
    const maxClasses = 2;
    const newRoom = this.roomRepository.create({
      roomCode: data.roomCode,
      roomAddress: data.roomAddress,
      maxClasses: maxClasses,
      occupied: false,
      onlineRoom: null,
      classesIdList: [],
    });
    await this.roomRepository.save(newRoom);
    return newRoom;
  }

  async getAllRooms(): Promise<ViewAllRoomsDTO[]> {
    const rooms = await this.roomRepository.find();
    const result = [];
    rooms.forEach((room, index) => {
      result[index] = {} as ViewAllRoomsDTO;
      result[index].roomId = room.roomId;
      result[index].roomCode = room.roomCode || 'None';
      result[index].roomAddress = room.roomAddress || 'None';
      result[index].onlineRoom = room.onlineRoom || 'None';
      result[index].maxClasses = room.maxClasses;
      result[index].currentClasses = 0;
    });
    return result;
  }

  async getRoomById(roomId: string): Promise<Room> {
    return this.roomRepository.findOne({ where: { roomId } });
  }

  async deleteRoom(roomId: string): Promise<void> {
    await this.roomRepository.delete(roomId);
  }
}
