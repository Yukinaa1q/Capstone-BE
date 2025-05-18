import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Raw, Repository } from 'typeorm';
import { Stat } from './entity/stat.entity';
import { Tutor } from '@modules/tutor/entity/tutor.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { Student } from '@modules/student/entity/student.entity';
import { paymentFormula } from 'src/utils/paymentFormula';
import { Course } from '@modules/course/entity/course.entity';

@Injectable()
export class StatService {
  constructor(
    @InjectRepository(Stat)
    private readonly statRepository: Repository<Stat>,
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Classroom)
    private readonly classRepository: Repository<Classroom>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async monthStat() {
    const tutor = await this.tutorRepository.find();
    let result = [];
    for (let month = 1; month <= 12; month++) {
      let outcome = 0;
      let income = 0;
      for (const item of tutor) {
        const findClass = await this.classRepository.findBy({
          classId: In(item.paidClassList),
          status: In(['payment', 'open']),
          startDate: Raw(
            (alias) =>
              `EXTRACT(MONTH FROM TO_DATE(${alias}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) = :month`,
            {
              month: month,
            },
          ),
        });
        if (findClass) {
          for (const classs of findClass) {
            outcome += paymentFormula(
              classs.course.coursePrice,
              classs.currentStudents,
              classs.course.duration,
              0.4,
            );
          }
        }
      }
      const stats = await this.statRepository
        .createQueryBuilder('stat')
        .where('EXTRACT(MONTH FROM stat.createdTime) = :month', {
          month: month,
        })
        .getMany();

      for (const item of stats) {
        income += item.value;
      }

      result.push({
        month: month,
        income: income,
        outcome: outcome,
      });
    }

    return result;
  }

  async incomeSubject() {
    const results = await this.courseRepository
      .createQueryBuilder('course')
      .select('DISTINCT course.courseSubject', 'courseSubject')
      .getRawMany();

    const subjects = results.map((item) => item.courseSubject);
    const result = [];
    for (const subject of subjects) {
      let income = 0;
      const findCourse = await this.courseRepository.find({
        where: { courseSubject: subject },
      });
      for (const course of findCourse) {
        const stats = await this.statRepository.findBy({
          classId: In(course.classes),
        });
        if (stats) {
          for (const stat of stats) {
            income += stat.value;
          }
        }
      }
      result.push({ subject: subject, income: income });
    }
    return result;
  }
}
