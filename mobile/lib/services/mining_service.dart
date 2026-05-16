import 'api_service.dart';
import '../config/constants.dart';

class MiningService {
  // Statut du minage
  static Future<Map<String, dynamic>> getStatus() async {
    return await ApiService.get(AppConstants.miningStatusUrl);
  }

  // Démarrer un minage
  static Future<Map<String, dynamic>> startMining() async {
    return await ApiService.post(AppConstants.miningStartUrl);
  }

  // Vérifier la pub
  static Future<Map<String, dynamic>> verifyAd({
    required String sessionId,
    required String adToken,
  }) async {
    return await ApiService.post(
      AppConstants.miningVerifyAdUrl,
      body: {
        'sessionId': sessionId,
        'adToken': adToken,
      },
    );
  }

  // Compléter le minage
  static Future<Map<String, dynamic>> completeMining({
    required String sessionId,
  }) async {
    return await ApiService.post(
      AppConstants.miningCompleteUrl,
      body: {'sessionId': sessionId},
    );
  }
}