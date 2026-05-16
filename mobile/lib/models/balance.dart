class Balance {
  final double frz;
  final double reserved;
  final double totalMined;
  final double totalWithdrawn;
  final double todayEarned;
  final int totalMiningCount;

  Balance({
    required this.frz,
    required this.reserved,
    required this.totalMined,
    required this.totalWithdrawn,
    required this.todayEarned,
    required this.totalMiningCount,
  });

  factory Balance.fromJson(Map<String, dynamic> json) {
    return Balance(
      frz: double.tryParse(json['frz']?.toString() ?? '0') ?? 0,
      reserved: double.tryParse(json['reserved']?.toString() ?? '0') ?? 0,
      totalMined: double.tryParse(json['totalMined']?.toString() ?? '0') ?? 0,
      totalWithdrawn: double.tryParse(json['totalWithdrawn']?.toString() ?? '0') ?? 0,
      todayEarned: double.tryParse(json['todayEarned']?.toString() ?? '0') ?? 0,
      totalMiningCount: json['totalMiningCount'] ?? 0,
    );
  }

  String get frzFormatted => frz.toStringAsFixed(8);
  String get reservedFormatted => reserved.toStringAsFixed(8);
  String get todayEarnedFormatted => todayEarned.toStringAsFixed(8);
}