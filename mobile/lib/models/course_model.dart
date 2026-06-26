import 'user_model.dart';

class LessonModel {
  final String title;
  final String videoUrl;

  LessonModel({
    required this.title,
    required this.videoUrl,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) => LessonModel(
        title: json['title'] ?? '',
        videoUrl: json['videoUrl'] ?? '',
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
  });

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
      );
}
