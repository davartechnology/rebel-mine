import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';

class ApiService {
  static Future<Map<String, String>> _getHeaders() async {
    final token = await StorageService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> get(String url) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse(url),
        headers: headers,
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {
          'error': 'Erreur ${response.statusCode}',
          'statusCode': response.statusCode,
        };
      }
    } catch (e) {
      return {'error': 'Erreur de connexion: $e'};
    }
  }

  static Future<Map<String, dynamic>> post(
    String url, {
    Map<String, dynamic>? body,
  }) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse(url),
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      return {
        ...data,
        'statusCode': response.statusCode,
        'success': response.statusCode == 200 || response.statusCode == 201,
      };
    } catch (e) {
      return {'error': 'Erreur de connexion: $e', 'success': false};
    }
  }
}