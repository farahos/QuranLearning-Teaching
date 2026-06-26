class ReviewModel {
  final int rating;
  final String comment;
  final String studentName;

  ReviewModel({required this.rating, required this.comment, required this.studentName});

  factory ReviewModel.fromJson(Map<String, dynamic> json) => ReviewModel(
        rating: json['rating'] ?? 0,
        comment: json['comment'] ?? '',
        studentName: (json['student'] ?? {})['fullName'] ?? 'Student',
      );
}
