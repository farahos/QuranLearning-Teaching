import 'package:flutter/material.dart';
import '../models/course_model.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AppState extends ChangeNotifier {
  final ApiService _api = ApiService();
  String? token;
  UserModel? currentUser;
  List<CourseModel> courses = [];
  List<Map<String, dynamic>> teacherStudentCourses = [];
  Map<String, dynamic>? adminDashboard;
  List<Map<String, dynamic>> adminUsers = [];
  List<CourseModel> adminCourses = [];
  List<Map<String, dynamic>> adminTransactions = [];
  final Set<String> favoriteCourseIds = {};
  final Set<String> learningCourseIds = {};
  String? error;
  bool darkMode = false;

  bool get isLoggedIn => token != null;

  Future<void> register(String name, String email, String password, String role) async {
    final data = await _api.post('/auth/register', {
      'fullName': name,
      'email': email,
      'password': password,
      'role': role,
    });
    token = data['token'];
    currentUser = UserModel.fromJson(data['user']);
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final data = await _api.post('/auth/login', {'email': email, 'password': password});
    token = data['token'];
    currentUser = UserModel.fromJson(data['user']);
    notifyListeners();
  }

  Future<void> fetchCourses() async {
    final data = await _api.get('/courses');
    courses = (data as List).map((e) => CourseModel.fromJson(e)).toList();
    notifyListeners();
  }

  Future<void> fetchTeacherStudents() async {
    final data = await _api.get('/courses/teacher/students', token: token);
    teacherStudentCourses = (data as List).map((e) => e as Map<String, dynamic>).toList();
    notifyListeners();
  }

  Future<void> fetchAdminDashboard() async {
    adminDashboard = await _api.get('/admin/dashboard', token: token) as Map<String, dynamic>;
    notifyListeners();
  }

  Future<void> fetchAdminUsers() async {
    final data = await _api.get('/admin/users', token: token);
    adminUsers = (data as List).map((e) => e as Map<String, dynamic>).toList();
    notifyListeners();
  }

  Future<void> fetchAdminCourses() async {
    final data = await _api.get('/admin/courses', token: token);
    adminCourses = (data as List).map((e) => CourseModel.fromJson(e)).toList();
    notifyListeners();
  }

  Future<void> fetchAdminTransactions() async {
    final data = await _api.get('/admin/transactions', token: token);
    adminTransactions = (data as List).map((e) => e as Map<String, dynamic>).toList();
    notifyListeners();
  }

  Future<void> refreshAdmin() async {
    await Future.wait([
      fetchAdminDashboard(),
      fetchAdminUsers(),
      fetchAdminCourses(),
      fetchAdminTransactions(),
    ]);
  }

  Future<void> updateAdminUser(String id, Map<String, dynamic> updates) async {
    final data = await _api.put('/admin/users/$id', updates, token: token);
    final updated = data as Map<String, dynamic>;
    adminUsers = adminUsers.map((user) => user['_id'] == id ? updated : user).toList();
    notifyListeners();
  }

  Future<void> deleteAdminUser(String id) async {
    await _api.delete('/admin/users/$id', token: token);
    adminUsers = adminUsers.where((user) => user['_id'] != id).toList();
    notifyListeners();
  }

  Future<void> deleteAdminCourse(String id) async {
    await _api.delete('/admin/courses/$id', token: token);
    adminCourses = adminCourses.where((course) => course.id != id).toList();
    notifyListeners();
  }

  Future<Map<String, dynamic>> buyCourse(String courseId, String paymentMethod, String phoneNumber) async {
    final data = await _api.post('/wallet/pay-course', {
      'courseId': courseId,
      'paymentMethod': paymentMethod,
      'phoneNumber': phoneNumber,
    }, token: token);
    learningCourseIds.add(courseId);
    notifyListeners();
    return data;
  }

  Future<void> addReview(String courseId, String teacherId, int rating, String comment) async {
    await _api.post('/reviews', {
      'course': courseId,
      'teacher': teacherId,
      'rating': rating,
      'comment': comment,
    }, token: token);
  }

  Future<void> submitKyc(String docUrl) async {
    await _api.post('/kyc/submit', {'kycDocumentUrl': docUrl}, token: token);
  }

  Future<String> uploadCourseVideo(String fileName, String base64Data) async {
    final data = await _api.uploadVideo(fileName, base64Data, token: token);
    return data['videoUrl'] ?? '';
  }

  Future<String> uploadImage(String fileName, String base64Data) async {
    final data = await _api.uploadImage(fileName, base64Data, token: token);
    return data['imageUrl'] ?? '';
  }

  Future<void> updateProfile(String fullName, String profileImageUrl) async {
    final data = await _api.put('/users/me', {
      'fullName': fullName,
      'profileImageUrl': profileImageUrl,
    }, token: token);
    currentUser = UserModel.fromJson(data);
    notifyListeners();
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _api.put('/users/me/password', {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    }, token: token);
  }

  Future<void> createCourse(String name, String desc, double price, String category, String videoUrl, double commissionRate, {String coverImageUrl = '', List<Map<String, String>> lessons = const []}) async {
    await _api.post('/courses', {
      'courseName': name,
      'description': desc,
      'price': price,
      'category': category,
      'coverImageUrl': coverImageUrl,
      'introVideoUrl': videoUrl,
      'commissionRate': 0.2,
      'lessons': lessons,
    }, token: token);
    await fetchCourses();
  }

  Future<void> updateCourse(String id, String name, String desc, double price, String category, String videoUrl, double commissionRate, {String coverImageUrl = '', List<Map<String, String>> lessons = const []}) async {
    await _api.put('/courses/$id', {
      'courseName': name,
      'description': desc,
      'price': price,
      'category': category,
      'coverImageUrl': coverImageUrl,
      'introVideoUrl': videoUrl,
      'commissionRate': 0.2,
      'lessons': lessons,
    }, token: token);
    await fetchCourses();
  }

  Future<void> deleteCourse(String id) async {
    await _api.delete('/courses/$id', token: token);
    courses = courses.where((course) => course.id != id).toList();
    favoriteCourseIds.remove(id);
    learningCourseIds.remove(id);
    notifyListeners();
  }

  void toggleFavorite(String id) {
    if (favoriteCourseIds.contains(id)) {
      favoriteCourseIds.remove(id);
    } else {
      favoriteCourseIds.add(id);
    }
    notifyListeners();
  }

  void setDarkMode(bool value) {
    darkMode = value;
    notifyListeners();
  }

  void logout() {
    token = null;
    currentUser = null;
    courses = [];
    teacherStudentCourses = [];
    adminDashboard = null;
    adminUsers = [];
    adminCourses = [];
    adminTransactions = [];
    favoriteCourseIds.clear();
    learningCourseIds.clear();
    notifyListeners();
  }
}
