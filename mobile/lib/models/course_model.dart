import 'user_model.dart';

class LessonModel {
  final String id;
  final String title;
  final String videoUrl;
  final String description;
  final bool locked;
  final bool preview;

  LessonModel({
    required this.id,
    required this.title,
    required this.videoUrl,
    this.description = '',
    this.locked = false,
    this.preview = false,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) => LessonModel(
        id: json['_id'] ?? '',
        title: json['title'] ?? '',
        videoUrl: json['videoUrl'] ?? '',
        description: json['description'] ?? '',
        locked: json['locked'] ?? false,
        preview: json['preview'] ?? false,
      );
}

class CourseModel {
  final String id;
  final String courseName;
  final String description;
  final double price;
  final String category;
  final String? coverImageUrl;
  final String? introVideoUrl;
  final List<LessonModel> lessons;
  final UserModel teacher;
  final List<String> enrolledStudentIds;
  final double ratingAverage;
  final int reviewCount;

  CourseModel({
    required this.id,
    required this.courseName,
    required this.description,
    required this.price,
    required this.category,
    this.coverImageUrl,
    this.introVideoUrl,
    this.lessons = const [],
    required this.teacher,
    this.enrolledStudentIds = const [],
    this.ratingAverage = 0,
    this.reviewCount = 0,
  });

  bool isEnrolledStudent(String? userId) => userId != null && enrolledStudentIds.contains(userId);

  factory CourseModel.fromJson(Map<String, dynamic> json) => CourseModel(
        id: json['_id'] ?? '',
        courseName: json['courseName'] ?? '',
        description: json['description'] ?? '',
        price: (json['price'] ?? 0).toDouble(),
        category: json['category'] ?? 'General',
        coverImageUrl: json['coverImageUrl'],
        introVideoUrl: json['introVideoUrl'],
        lessons: ((json['lessons'] ?? []) as List).map((e) => LessonModel.fromJson(e)).toList(),
        teacher: UserModel.fromJson(json['teacher'] ?? {}),
        enrolledStudentIds: ((json['enrolledStudents'] ?? []) as List)
            .map((e) {
              final student = (e as Map<String, dynamic>)['student'];
              if (student is Map<String, dynamic>) return student['_id'] as String? ?? '';
              return student?.toString() ?? '';
            })
            .where((id) => id.isNotEmpty)
            .toList(),
        ratingAverage: (json['ratingAverage'] ?? 0).toDouble(),
        reviewCount: json['reviewCount'] ?? 0,
      );
}
