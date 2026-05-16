class ReferralInfo {
  final String referralCode;
  final String tier;
  final String nextTier;
  final int nextTierCount;
  final int referralCount;
  final ReferralEarnings earnings;
  final List<ReferralUser> referrals;

  ReferralInfo({
    required this.referralCode,
    required this.tier,
    required this.nextTier,
    required this.nextTierCount,
    required this.referralCount,
    required this.earnings,
    required this.referrals,
  });

  factory ReferralInfo.fromJson(Map<String, dynamic> json) {
    return ReferralInfo(
      referralCode: json['referralCode'] ?? '',
      tier: json['tier'] ?? 'bronze',
      nextTier: json['nextTier'] ?? 'silver',
      nextTierCount: json['nextTierCount'] ?? 5,
      referralCount: json['referralCount'] ?? 0,
      earnings: ReferralEarnings.fromJson(json['earnings'] ?? {}),
      referrals: (json['referrals'] as List? ?? [])
          .map((r) => ReferralUser.fromJson(r))
          .toList(),
    );
  }
}

class ReferralEarnings {
  final double n1;
  final double n2;
  final double n3;
  final double total;

  ReferralEarnings({
    required this.n1,
    required this.n2,
    required this.n3,
    required this.total,
  });

  factory ReferralEarnings.fromJson(Map<String, dynamic> json) {
    return ReferralEarnings(
      n1: double.tryParse(json['n1']?.toString() ?? '0') ?? 0,
      n2: double.tryParse(json['n2']?.toString() ?? '0') ?? 0,
      n3: double.tryParse(json['n3']?.toString() ?? '0') ?? 0,
      total: double.tryParse(json['total']?.toString() ?? '0') ?? 0,
    );
  }

  String get totalFormatted => total.toStringAsFixed(8);
}

class ReferralUser {
  final String username;
  final double earned;
  final String joinedAt;
  final int miningCount;

  ReferralUser({
    required this.username,
    required this.earned,
    required this.joinedAt,
    required this.miningCount,
  });

  factory ReferralUser.fromJson(Map<String, dynamic> json) {
    return ReferralUser(
      username: json['username'] ?? 'User****',
      earned: double.tryParse(json['earned']?.toString() ?? '0') ?? 0,
      joinedAt: json['joinedAt'] ?? '',
      miningCount: json['miningCount'] ?? 0,
    );
  }

  String get earnedFormatted => earned.toStringAsFixed(8);
}