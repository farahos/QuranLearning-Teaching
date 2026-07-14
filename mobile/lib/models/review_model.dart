class ReviewModel {
  final String courseId;
  final int rating;
  final String comment;
  final String studentName;

  ReviewModel({required this.courseId, required this.rating, required this.comment, required this.studentName});

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    final course = json['course'];
    return ReviewModel(
      courseId: course is Map<String, dynamic> ? (course['_id'] ?? '') : (course?.toString() ?? ''),
      rating: json['rating'] ?? 0,
      comment: json['comment'] ?? '',
      studentName: (json['student'] ?? {})['fullName'] ?? 'Student',
    );
  }
}
