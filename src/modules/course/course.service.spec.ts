import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entity/course.entity';
import { CloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { CreateCourseDTO } from './dto/createCourse.dto';
import { ServiceException } from '@common/error';


describe('CourseService', () => {
  let courseService: CourseService;
  let courseRepository: any;
  let cloudinaryService: CloudinaryService;

  const mockCourseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
    courseRepository = module.get(getRepositoryToken(Course));
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    const mockFile = {
      fieldname: 'courseImage',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    const mockCreateCourseDto: CreateCourseDTO = {
      courseSubject: 'Math',
      courseName: 'Calculus 101',
      courseLevel: 'Beginner',
      coursePrice: 99.99,
      courseCode: 'MATH101',
      participantNumber: 0,
      courseDescription: 'Learn basic calculus',
      courseOutline: JSON.stringify([
        { topic: 'Introduction', duration: '1 hour' },
        { topic: 'Derivatives', duration: '2 hours' },
      ]),
    };

    const mockImageUrl = 'https://cloudinary.com/test-image.jpg';

    const mockCourse = {
      id: 1,
      courseImage: mockImageUrl,
      ...mockCreateCourseDto,
      courseOutline: JSON.parse(mockCreateCourseDto.courseOutline),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a course successfully', async () => {
      // Mock findOneCourse to return null (no duplicate)
      jest.spyOn(courseService, 'findOneCourse').mockResolvedValue(null);
      
      // Mock cloudinary upload
      mockCloudinaryService.uploadImage.mockResolvedValue(mockImageUrl);
      
      // Mock repository methods
      mockCourseRepository.create.mockReturnValue({
        courseImage: mockImageUrl,
        ...mockCreateCourseDto,
        courseOutline: mockCreateCourseDto.courseOutline,
      });
      mockCourseRepository.save.mockResolvedValue(mockCourse);

      const result = await courseService.createCourse(mockFile, mockCreateCourseDto);

      expect(courseService.findOneCourse).toHaveBeenCalledWith('MATH101');
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(courseRepository.create).toHaveBeenCalledWith({
        courseImage: mockImageUrl,
        ...mockCreateCourseDto,
      });
      expect(courseRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCourse);
    });

    it('should throw an exception when course code already exists', async () => {
      // Mock findOneCourse to return an existing course
      jest.spyOn(courseService, 'findOneCourse').mockResolvedValue(mockCourse);

      await expect(courseService.createCourse(mockFile, mockCreateCourseDto))
        .rejects.toThrow(ServiceException);
      
      expect(courseService.findOneCourse).toHaveBeenCalledWith('MATH101');
      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(courseRepository.create).not.toHaveBeenCalled();
      expect(courseRepository.save).not.toHaveBeenCalled();
    });

    it('should parse JSON courseOutline string', async () => {
      // Mock findOneCourse to return null (no duplicate)
      jest.spyOn(courseService, 'findOneCourse').mockResolvedValue(null);
      
      // Mock cloudinary upload
      mockCloudinaryService.uploadImage.mockResolvedValue(mockImageUrl);
      
      // Mock repository methods with string courseOutline
      const courseWithStringOutline = {
        courseImage: mockImageUrl,
        ...mockCreateCourseDto,
      };
      mockCourseRepository.create.mockReturnValue(courseWithStringOutline);
      mockCourseRepository.save.mockImplementation(async () => {
        return {
          ...courseWithStringOutline,
          courseOutline: JSON.parse(mockCreateCourseDto.courseOutline),
          id: 1,
        };
      });

      const result = await courseService.createCourse(mockFile, mockCreateCourseDto);

      expect(result.courseOutline).toEqual(JSON.parse(mockCreateCourseDto.courseOutline));
    });

    it('should handle cloudinary upload failure', async () => {
      // Mock findOneCourse to return null (no duplicate)
      jest.spyOn(courseService, 'findOneCourse').mockResolvedValue(null);
      
      // Mock cloudinary upload failure
      mockCloudinaryService.uploadImage.mockRejectedValue(new Error('Upload failed'));
      
      await expect(courseService.createCourse(mockFile, mockCreateCourseDto))
        .rejects.toThrow('Upload failed');
      
      expect(courseRepository.create).not.toHaveBeenCalled();
      expect(courseRepository.save).not.toHaveBeenCalled();
    });
  });
});