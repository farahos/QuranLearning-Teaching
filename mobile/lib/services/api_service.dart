import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  ApiException(this.message, this.statusCode);

  final String message;
  final int statusCode;

  @override
  String toString() => message;
}

class ApiService {
  // Emulators/simulators can't reach a phone's "localhost", so the default
  // depends on platform. Override for a real device with:
  //   flutter run --dart-define=API_BASE_URL=http://<your-lan-ip>:5001/api
  static String get baseUrl {
    const override = String.fromEnvironment('API_BASE_URL');
    if (override.isNotEmpty) return override;
    if (kIsWeb) {
      return '${Uri.base.scheme}://${Uri.base.host}:5001/api';
    }
    return 'http://10.0.2.2:5001/api';
  }

  static String mediaUrl(String path) {
    if (path.startsWith('http')) return path;
    final apiRoot = baseUrl.replaceFirst('/api', '');
    return '$apiRoot$path';
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body, {String? token}) async {
    final res = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return _parse(res);
  }

  Future<dynamic> get(String path, {String? token}) async {
    final res = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );
    return _parse(res);
  }

  Future<dynamic> put(String path, Map<String, dynamic> body, {String? token}) async {
    final res = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return _parse(res);
  }

  Future<dynamic> delete(String path, {String? token}) async {
    final res = await http.delete(
      Uri.parse('$baseUrl$path'),
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );
    return _parse(res);
  }

  Future<dynamic> patch(String path, Map<String, dynamic> body, {String? token}) async {
    final res = await http.patch(
      Uri.parse('$baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );
    return _parse(res);
  }

  Future<Map<String, dynamic>> uploadVideo(String fileName, String base64Data, {String? token}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/uploads/video'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'fileName': fileName,
        'data': base64Data,
      }),
    );
    return _parse(res) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> uploadImage(String fileName, String base64Data, {String? token}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/uploads/image'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'fileName': fileName,
        'data': base64Data,
      }),
    );
    return _parse(res) as Map<String, dynamic>;
  }

  dynamic _parse(http.Response res) {
    final data = res.body.isEmpty ? {} : jsonDecode(res.body);
    if (res.statusCode >= 400) {
      final message = (data is Map && data['message'] != null) ? data['message'] as String : 'Request failed';
      throw ApiException(message, res.statusCode);
    }
    return data;
  }
}
