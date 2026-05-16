import 'api_service.dart';
import '../config/constants.dart';

class WalletService {
  // Solde
  static Future<Map<String, dynamic>> getBalance() async {
    return await ApiService.get(AppConstants.walletBalanceUrl);
  }

  // Transactions
  static Future<Map<String, dynamic>> getTransactions({
    String type = 'all',
    int page = 1,
  }) async {
    return await ApiService.get(
      '${AppConstants.walletTransactionsUrl}?type=$type&page=$page',
    );
  }

  // Retrait
  static Future<Map<String, dynamic>> withdraw({
    required double amount,
    required String paymentMethod,
    required String paymentAddress,
  }) async {
    return await ApiService.post(
      AppConstants.walletWithdrawUrl,
      body: {
        'amount': amount,
        'paymentMethod': paymentMethod,
        'paymentAddress': paymentAddress,
      },
    );
  }
}