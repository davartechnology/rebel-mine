import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';
import '../../config/constants.dart';
import '../../services/storage_service.dart';

class HistoryTab extends StatefulWidget {
  const HistoryTab({super.key});

  @override
  State<HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends State<HistoryTab> {
  bool _isLoading = true;
  List<dynamic> _transactions = [];
  double _totalEarned = 0.0;
  int _totalMinings = 0;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final token = await StorageService.getToken();
      if (token == null) return;

      final response = await http.get(
        Uri.parse(AppConstants.walletTransactionsUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _transactions = data['transactions'] ?? [];
          _totalEarned = (data['totalEarned'] ?? 0.0).toDouble();
          _totalMinings = data['totalMinings'] ?? 0;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr).toLocal();
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return dateStr;
    }
  }

  IconData _getIcon(String? type) {
    switch (type) {
      case 'mining': return Icons.flash_on;
      case 'referral': return Icons.people;
      case 'bonus': return Icons.star;
      case 'withdrawal': return Icons.arrow_upward;
      default: return Icons.swap_horiz;
    }
  }

  Color _getColor(String? type) {
    switch (type) {
      case 'withdrawal': return Colors.orange;
      case 'referral': return const Color(0xFF1A6FFF);
      case 'bonus': return Colors.amber;
      default: return AppColors.red;
    }
  }

  String _getLabel(String? type) {
    switch (type) {
      case 'mining': return 'MINAGE';
      case 'referral': return 'PARRAINAGE';
      case 'bonus': return 'BONUS';
      case 'withdrawal': return 'RETRAIT';
      default: return 'TRANSACTION';
    }
  }

  @override
  Widget build(BuildContext context) {
    return _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppColors.red))
        : RefreshIndicator(
            color: AppColors.red,
            onRefresh: _loadHistory,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                children: [
                  _buildStatsRow(),
                  const SizedBox(height: 20),
                  _buildTransactionsList(),
                ],
              ),
            ),
          );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            Icons.flash_on,
            _totalMinings.toString(),
            'MINAGES TOTAL',
            AppColors.red,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            Icons.account_balance_wallet,
            '${_totalEarned.toStringAsFixed(2)} SHEE',
            'TOTAL GAGNÉ',
            const Color(0xFF1A6FFF),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(IconData icon, String value, String label, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontFamily: 'BebasNeue',
              fontSize: 18,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 10,
              letterSpacing: 1,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionsList() {
    if (_transactions.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(48),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: const Column(
          children: [
            Icon(Icons.history, color: Colors.white24, size: 56),
            SizedBox(height: 16),
            Text(
              'AUCUNE TRANSACTION',
              style: TextStyle(
                color: Colors.white38,
                fontFamily: 'BebasNeue',
                fontSize: 18,
                letterSpacing: 3,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Commence à miner pour voir ton historique !',
              style: TextStyle(color: Colors.white24, fontSize: 12),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'HISTORIQUE',
              style: TextStyle(
                color: Colors.white,
                fontFamily: 'BebasNeue',
                fontSize: 18,
                letterSpacing: 3,
              ),
            ),
          ),
          const Divider(color: Colors.white12, height: 1),
          ..._transactions.map((t) => _buildTransactionItem(t)),
        ],
      ),
    );
  }

  Widget _buildTransactionItem(dynamic t) {
    final type = t['type'] as String?;
    final color = _getColor(type);
    final amount = double.tryParse(t['amount'].toString()) ?? 0.0;
    final isWithdrawal = type == 'withdrawal';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(_getIcon(type), color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getLabel(type),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _formatDate(t['createdAt']),
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
          Text(
            '${isWithdrawal ? '-' : '+'}${amount.toStringAsFixed(2)} SHEE',
            style: TextStyle(
              color: isWithdrawal ? Colors.orange : color,
              fontFamily: 'BebasNeue',
              fontSize: 16,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}