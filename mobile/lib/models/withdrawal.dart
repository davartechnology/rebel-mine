class Withdrawal {
  final String id;
  final double requested;
  final double reserve;
  final double fee;
  final double sent;
  final String paymentMethod;
  final String paymentAddress;
  final String status;
  final int withdrawalNumber;
  final String requestedAt;

  Withdrawal({
    required this.id,
    required this.requested,
    required this.reserve,
    required this.fee,
    required this.sent,
    required this.paymentMethod,
    required this.paymentAddress,
    required this.status,
    required this.withdrawalNumber,
    required this.requestedAt,
  });

  factory Withdrawal.fromJson(Map<String, dynamic> json) {
    return Withdrawal(
      id: json['id'] ?? '',
      requested: double.tryParse(json['requested']?.toString() ?? '0') ?? 0,
      reserve: double.tryParse(json['reserve']?.toString() ?? '0') ?? 0,
      fee: double.tryParse(json['fee']?.toString() ?? '0') ?? 0,
      sent: double.tryParse(json['sent']?.toString() ?? '0') ?? 0,
      paymentMethod: json['paymentMethod'] ?? '',
      paymentAddress: json['paymentAddress'] ?? '',
      status: json['status'] ?? 'pending',
      withdrawalNumber: json['withdrawalNumber'] ?? 0,
      requestedAt: json['requestedAt'] ?? '',
    );
  }

  String get statusLabel {
    switch (status) {
      case 'completed': return '✅ Payé';
      case 'pending': return '⏳ En attente';
      case 'processing': return '🔄 En cours';
      case 'rejected': return '❌ Rejeté';
      default: return status;
    }
  }
}