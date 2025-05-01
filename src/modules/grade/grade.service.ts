import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Grade } from './entity/grade.entity';
import { Classroom } from '@modules/class/entity/class.entity';
import { Student } from '@modules/student/entity/student.entity';
import { UpdateGradeDTO } from './dto/updateGrade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    @InjectRepository(Classroom)
    private readonly classRepository: Repository<Classroom>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async viewStudentGradeInClass(classId: string) {
    const classroom = await this.classRepository.findOne({
      where: { classCode: classId },
    });
    // Get all student IDs in this class
    const studentIds = classroom.studentList || [];
    if (studentIds.length === 0) {
      return {
        classInfo: {
          id: classroom.classId,
          name: classroom.courseTitle,
          classCode: classroom.classCode,
        },
        studentGrades: [],
        message: 'No students enrolled in this class',
      };
    }
    // Find existing grades for this class
    const existingGrades = await this.gradeRepository.find({
      where: { classroomId: classroom.classId, studentId: In(studentIds) },
    });

    // Check if this is the first time - no students have grades yet
    const isFirstTimeCreated = existingGrades.length === 0;

    if (isFirstTimeCreated && studentIds.length > 0) {
      // Fetch all students' info at once
      const students = await this.studentRepository.find({
        where: { userId: In(studentIds) },
      });

      // Create grade placeholders for all students
      const gradesToCreate = students.map((student) => {
        return this.gradeRepository.create({
          studentId: student.userId,
          classroomId: classroom.classId,
          midtermScore: 0,
          assignmentScore: 0,
          homeworkScore: 0,
          finalScore: 0,
        });
      });

      // Save all grade placeholders in a batch operation
      const savedGrades = await this.gradeRepository.save(gradesToCreate);

      // Map each student to their newly created grade
      const results = students.map((student) => {
        const studentGrades = savedGrades.filter(
          (grade) => grade.studentId === student.userId,
        );

        return {
          id: student.userId,
          name: student.name,
          studentCode: student.studentCode,

          grades: studentGrades,
        };
      });

      return {
        classInfo: {
          id: classroom.classId,
          name: classroom.courseTitle,
          classCode: classroom.classCode,
        },
        studentGrades: results,
        isFirstTimeCreated,
      };
    }

    // For non-first time cases or when some students already have grades
    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        // Get student details
        const student = await this.studentRepository.findOne({
          where: { userId: studentId },
        });

        if (!student) {
          return { studentId, error: 'Student not found' };
        }

        // Get grades for this student using filter
        const studentGrades = existingGrades.filter(
          (grade) => grade.studentId === studentId,
        );

        // Check if student has grades
        if (studentGrades.length === 0) {
          // Create a new grade placeholder for the student
          const newGrade = this.gradeRepository.create({
            studentId: student.userId,
            classroomId: classroom.classId,
            midtermScore: 0,
            assignmentScore: 0,
            homeworkScore: 0,
            finalScore: 0,
          });

          await this.gradeRepository.save(newGrade);

          return {
            id: student.userId,
            name: student.name,
            studentCode: student.studentCode,

            grades: newGrade,
          };
        }

        // Return student with existing grades
        return {
          id: student.userId,
          name: student.name,
          studentCode: student.studentCode,

          grades: studentGrades,
        };
      }),
    );

    return {
      classInfo: {
        id: classroom.classId,
        name: classroom.courseTitle,
        classCode: classroom.classCode,
      },
      studentGrades: results,
      isFirstTimeCreated,
    };
  }

  async updateGrade(data: UpdateGradeDTO[]) {
    for (const item of data) {
      const grade = await this.gradeRepository.findOne({
        where: {
          classroomId: item.classroomId,
          studentId: In([item.studentId]),
        },
      });
      await this.gradeRepository.update(grade.gradeId, item);
    }
  }

  async searchStudentForGrade(search: string = '') {
    if (!search) {
      return [];
    }
    try {
      const students = await this.studentRepository
        .createQueryBuilder('student')
        .where('LOWER(student.name) LIKE LOWER(:search)', {
          search: `%${search}%`,
        })
        .getMany();

      const result = [
        ...students.map((item) => ({
          userId: item.userId,
          userCode: item.studentCode,
          name: item.name,
          avatarUrl: item.avatarUrl || 'None',
        })),
      ];

      return result;
    } catch (error) {
      // Handle errors appropriately
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  async viewScoreStudent(studentId: string) {
    const student = await this.studentRepository.findOne({
      where: { userId: studentId },
    });
    const classroom = await this.classRepository.find({
      where: [
        { classId: In(student.paidClass) },
        { classId: In(student.classes) },
      ],
    });

    const classId = classroom.map((item) => item.classId);

    const studentGrade = await this.gradeRepository.find({
      where: { classroomId: In(classId), studentId: student.userId },
    });

    return studentGrade;
  }
}
