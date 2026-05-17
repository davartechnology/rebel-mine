class AppConstants {
  static const String baseUrl = 'https://rebel-mine.vercel.app';

  static const String mobileAuthUrl = '$baseUrl/api/auth/mobile';
  static const String registerUrl = '$baseUrl/api/auth/register';
  static const String miningStatusUrl = '$baseUrl/api/mining/status';
  static const String miningStartUrl = '$baseUrl/api/mining/start';
  static const String miningVerifyAdUrl = '$baseUrl/api/mining/verify-ad';
  static const String miningCompleteUrl = '$baseUrl/api/mining/complete';
  static const String walletBalanceUrl = '$baseUrl/api/wallet/balance';
  static const String walletTransactionsUrl = '$baseUrl/api/wallet/transactions';
  static const String walletWithdrawUrl = '$baseUrl/api/wallet/withdraw';
  static const String referralInfoUrl = '$baseUrl/api/referral/info';
  static const String userProfileUrl = '$baseUrl/api/user/profile';

  static const String appName = 'SHEE MINE';
  static const String ecosystemName = 'SHIEFO';
  static const String tokenName = 'SHEE';
  static const String tokenTicker = 'SHEE';
  static const String slogan = 'Build the future. Own the system.';

  static const double miningReward = 1.0;
  static const int cooldownMinutes = 20;
  static const int animationSeconds = 300;
  static const double withdrawalMinimum = 10.0;
  static const double tokenPrice = 0.002;

  static const String admobAppId =
      'ca-app-pub-3940256099942544~3347511713';
  static const String bannerAdId =
      'ca-app-pub-3940256099942544/6300978111';
  static const String interstitialAdId =
      'ca-app-pub-3940256099942544/1033173712';
  static const String rewardedAdId =
      'ca-app-pub-3940256099942544/5224354917';
}