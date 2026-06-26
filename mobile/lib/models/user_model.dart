class UserModel {
  final String id;
  final String fullName;
  final String role;
  final String? whatsappNumber;
  final String? profileImageUrl;
  final String? telegramChannelLink;
  final String? introVideoUrl;
  final String? bio;
  final String? experience;
  final double averageRating;
  final int totalReviews;
  final double walletBalance;
  final double pendingFunds;
  final double totalEarnings;
  final String kycStatus;

  UserModel({
    required this.id,
    required this.fullName,
    required this.role,
    this.whatsappNumber,
    this.profileImageUrl,
    this.telegramChannelLink,
    this.introVideoUrl,
    this.bio,
    this.experience,
    this.averageRating = 0,
    this.totalReviews = 0,
    this.walletBalance = 0,
    this.pendingFunds = 0,
    this.totalEarnings = 0,
    this.kycStatus = 'not_submitted',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['_id'] ?? '',
        fullName: json['fullName'] ?? '',
        role: json['role'] ?? 'student',
        whatsappNumber: json['whatsappNumber'],
        profileImageUrl: json['profileImageUrl'],
        telegramChannelLink: json['telegramChannelLink'],
        introVideoUrl: json['introVideoUrl'],
        bio: json['bio'],
        experience: json['experience'],
        averageRating: (json['averageRating'] ?? 0).toDouble(),
        totalReviews: json['totalReviews'] ?? 0,
        walletBalance: (json['walletBalance'] ?? 0).toDouble(),
        pendingFunds: (json['pendingFunds'] ?? 0).toDouble(),
        totalEarnings: (json['totalEarnings'] ?? 0).toDouble(),
        kycStatus: json['kycStatus'] ?? 'not_submitted',
      );
}
