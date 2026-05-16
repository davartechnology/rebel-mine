class User {
  final String id;
  final String email;
  final String username;
  final String referralCode;
  final String tier;
  final bool isVerified;
  final int withdrawalCount;
  final String createdAt;

  User({
    required this.id,
    required this.email,
    required this.username,
    required this.referralCode,
    required this.tier,
    required this.isVerified,
    required this.withdrawalCount,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      username: json['username'] ?? '',
      referralCode: json['referralCode'] ?? '',
      tier: json['tier'] ?? 'bronze',
      isVerified: json['isVerified'] ?? false,
      withdrawalCount: json['withdrawalCount'] ?? 0,
      createdAt: json['createdAt'] ?? '',
    );
  }
}