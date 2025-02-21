import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateCustomID, hashPassword } from '@utils';
import { Tutor } from './entity/tutor.entity';
import { CreateTutorDTO } from './dto/createTutor.dto';
import { UpdateTutorDTO } from './dto/updateTutor.dto';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
  ) {}

  async getNextTutorID(): Promise<string> {
    const lastTutor = await this.tutorRepository
      .createQueryBuilder('tutor')
      .orderBy('tutor.tutorCode', 'DESC')
      .getOne();

    const lastNumber = lastTutor ? parseInt(lastTutor.tutorCode.slice(2)) : 0;
    return generateCustomID('TU', lastNumber + 1);
  }

  async createTutor(data: CreateTutorDTO): Promise<Tutor> {
    const hashPass = await hashPassword(data.password);
    const tutorCode = await this.getNextTutorID();
    const { password, ...tutorData } = data;
    const newTutor = this.tutorRepository.create({
      password: hashPass,
      tutorCode: tutorCode,
      ...tutorData,
    });
    await this.tutorRepository.save(newTutor);
    return newTutor;
  }

  async editTutorInfo(userId: string, data: UpdateTutorDTO): Promise<Tutor> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    await this.tutorRepository.update(userId, data);

    return this.tutorRepository.findOne({ where: { userId: userId } });
  }

  async findOneTutor(data: string): Promise<Tutor> {
    const findTutor = await this.tutorRepository.findOne({
      where: { email: data },
    });
    return findTutor;
  }
}
