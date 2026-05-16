class Transaction {
  final String id;
  final String type;
  final double amount;
  final String description;
  final String status;
  final String createdAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.description,
    required this.status,
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0,
      description: json['description'] ?? '',
      status: json['status'] ?? '',
      createdAt: json['createdAt'] ?? '',
    );
  }

  bool get isPositive => type != 'withdrawal';

  String get icon {
    if (type == 'mine' || type == 'bonus') return '⛏️';
    if (type.startsWith('referral')) return '👥';
    if (type == 'withdrawal') return '💸';
    return '💰';
  }

  String get amountFormatted => amount.toStringAsFixed(8);

  String get timeAgo {
    final date = DateTime.tryParse(createdAt);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inSeconds < 60) return 'Il y a ${diff.inSeconds}s';
    if (diff.inMinutes < 60) return 'Il y a ${diff.inMinutes}min';
    if (diff.inHours < 24) return 'Il y a ${diff.inHours}h';
    return 'Il y a ${diff.inDays}j';
  }
}