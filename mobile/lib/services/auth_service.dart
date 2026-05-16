import 'dart:convert';
import 'package:http/http.dart' as http;
import 'storage_service.dart';
import '../config/constants.dart';

class AuthService {
  // Connexion
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      // Étape 1 — Obtenir le CSRF token
      final csrfResponse = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/auth/csrf'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (csrfResponse.statusCode != 200) {
        return {'success': false, 'error': 'Erreur CSRF'};
      }

      final csrfData = jsonDecode(csrfResponse.body);
      final csrfToken = csrfData['csrfToken'];

      // Étape 2 — Login avec credentials
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/auth/callback/credentials'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': csrfResponse.headers['set-cookie'] ?? '',
        },
        body: {
          'email': email,
          'password': password,
          'csrfToken': csrfToken,
          'callbackUrl': AppConstants.baseUrl,
          'json': 'true',
        },
      ).timeout(const Duration(seconds: 15));

      // Récupérer le cookie de session
      final setCookie = response.headers['set-cookie'] ?? '';
      String? sessionToken;

      if (setCookie.contains('next-auth.session-token=')) {
        final parts = setCookie.split('next-auth.session-token=');
        if (parts.length > 1) {
          sessionToken = parts[1].split(';')[0];
        }
      }

      if (sessionToken != null && sessionToken.isNotEmpty) {
        // Récupérer les infos du user
        final profileResponse = await http.get(
          Uri.parse(AppConstants.userProfileUrl),
          headers: {
            'Cookie': 'next-auth.session-token=$sessionToken',
          },
        ).timeout(const Duration(seconds: 15));

        if (profileResponse.statusCode == 200) {
          final profile = jsonDecode(profileResponse.body);
          await StorageService.saveSession(
            token: sessionToken,
            email: profile['email'] ?? email,
            userId: profile['id'] ?? '',
          );
          return {'success': true, 'user': profile};
        }
      }

      return {
        'success': false,
        'error': 'Email ou mot de passe incorrect',
      };
    } catch (e) {
      return {'success': false, 'error': 'Erreur de connexion: $e'};
    }
  }

  // Inscription
  static Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String password,
    String? referralCode,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(AppConstants.registerUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
          'referralCode': referralCode ?? '',
        }),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true};
      } else {
        return {
          'success': false,
          'error': data['error'] ?? 'Erreur inscription',
        };
      }
    } catch (e) {
      return {'success': false, 'error': 'Erreur de connexion: $e'};
    }
  }

  // Déconnexion
  static Future<void> logout() async {
    await StorageService.clearSession();
  }

  // Vérifier session
  static Future<bool> isLoggedIn() async {
    return await StorageService.isLoggedIn();
  }
}