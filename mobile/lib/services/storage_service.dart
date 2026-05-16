import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _sessionKey = 'session_token';
  static const String _userEmailKey = 'user_email';
  static const String _userIdKey = 'user_id';

  // Sauvegarder la session
  static Future<void> saveSession({
    required String token,
    required String email,
    required String userId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, token);
    await prefs.setString(_userEmailKey, email);
    await prefs.setString(_userIdKey, userId);
  }

  // Récupérer le token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_sessionKey);
  }

  // Récupérer l'email
  static Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userEmailKey);
  }

  // Récupérer l'userId
  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userIdKey);
  }

  // Vérifier si connecté
  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Déconnexion
  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    await prefs.remove(_userEmailKey);
    await prefs.remove(_userIdKey);
  }
}