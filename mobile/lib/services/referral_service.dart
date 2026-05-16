import 'api_service.dart';
import '../config/constants.dart';

class ReferralService {
  // Infos parrainage
  static Future<Map<String, dynamic>> getInfo() async {
    return await ApiService.get(AppConstants.referralInfoUrl);
  }
}