import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';
import '../../config/constants.dart';
import '../../services/storage_service.dart';

class ReferralTab extends StatefulWidget {
  const ReferralTab({super.key});

  @override
  State<ReferralTab> createState() => _ReferralTabState();
}

class _ReferralTabState extends State<ReferralTab> {
  bool _isLoading = true;
  String? _referralCode;
  int _totalReferrals = 0;
  double _referralEarnings = 0.0;
  List<dynamic> _referrals = [];

  @override
  void initState() {
    super.initState();
    _loadReferralInfo();
  }

  Future<void> _loadReferralInfo() async {
    try {
      final token = await StorageService.getToken();
      if (token == null) return;

      final response = await http.get(
        Uri.parse(AppConstants.referralInfoUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _referralCode = data['referralCode'];
          _totalReferrals = data['totalReferrals'] ?? 0;
          _referralEarnings = (data['referralEarnings'] ?? 0.0).toDouble();
          _referrals = data['referrals'] ?? [];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _copyCode() {
    if (_referralCode == null) return;
    Clipboard.setData(ClipboardData(text: _referralCode!));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Code copié !', style: TextStyle(color: Colors.white)),
        backgroundColor: AppColors.red,
        duration: Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppColors.red))
        : RefreshIndicator(
            color: AppColors.red,
            onRefresh: _loadReferralInfo,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                children: [
                  _buildCodeCard(),
                  const SizedBox(height: 20),
                  _buildStatsRow(),
                  const SizedBox(height: 20),
                  _buildHowItWorks(),
                  const SizedBox(height: 20),
                  _buildReferralsList(),
                ],
              ),
            ),
          );
  }

  Widget _buildCodeCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.red.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: AppColors.red.withOpacity(0.1),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'TON CODE DE PARRAINAGE',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 11,
              letterSpacing: 3,
              fontFamily: 'BebasNeue',
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF0D0D0D),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.red.withOpacity(0.5)),
            ),
            child: Text(
              _referralCode ?? '------',
              style: const TextStyle(
                color: AppColors.red,
                fontFamily: 'BebasNeue',
                fontSize: 36,
                letterSpacing: 8,
              ),
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _copyCode,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.red,
                borderRadius: BorderRadius.circular(30),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.copy, color: Colors.white, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'COPIER LE CODE',
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: 'BebasNeue',
                      fontSize: 16,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            '👥',
            _totalReferrals.toString(),
            'FILLEULS',
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            '💰',
            '${_referralEarnings.toStringAsFixed(2)} SHEE',
            'GAINS PARRAINAGE',
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String emoji, String value, String label) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontFamily: 'BebasNeue',
              fontSize: 20,
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

  Widget _buildHowItWorks() {
  return Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: const Color(0xFF1A1A1A),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: Colors.white12),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'COMMISSIONS DE PARRAINAGE',
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'BebasNeue',
            fontSize: 18,
            letterSpacing: 3,
          ),
        ),
        const SizedBox(height: 16),
        _buildStep('1', 'Tu invites quelqu\'un → tu gagnes 20% de chaque minage'),
        const SizedBox(height: 12),
        _buildStep('2', 'Ton filleul invite quelqu\'un → tu gagnes 10%, lui 20%'),
        const SizedBox(height: 12),
        _buildStep('3', 'Niveau 3 → tu gagnes 5%, niveau 2 gagne 10%, niveau 3 gagne 20%'),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.red.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.red.withOpacity(0.3)),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.red, size: 16),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  '1 SHEE miné = 0.20 SHEE niveau 1 + 0.10 SHEE niveau 2 + 0.05 SHEE niveau 3',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

  Widget _buildStep(String number, String text) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: const BoxDecoration(
            color: AppColors.red,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number,
              style: const TextStyle(
                color: Colors.white,
                fontFamily: 'BebasNeue',
                fontSize: 14,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
        ),
      ],
    );
  }

  Widget _buildReferralsList() {
    if (_referrals.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: const Column(
          children: [
            Icon(Icons.people_outline, color: Colors.white24, size: 48),
            SizedBox(height: 12),
            Text(
              'PAS ENCORE DE FILLEULS',
              style: TextStyle(
                color: Colors.white38,
                fontFamily: 'BebasNeue',
                fontSize: 16,
                letterSpacing: 2,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Partage ton code pour commencer à gagner !',
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
              'MES FILLEULS',
              style: TextStyle(
                color: Colors.white,
                fontFamily: 'BebasNeue',
                fontSize: 18,
                letterSpacing: 3,
              ),
            ),
          ),
          const Divider(color: Colors.white12, height: 1),
          ..._referrals.map((r) => _buildReferralItem(r)),
        ],
      ),
    );
  }

  Widget _buildReferralItem(dynamic referral) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.red.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                (referral['username'] ?? '?')[0].toUpperCase(),
                style: const TextStyle(
                  color: AppColors.red,
                  fontFamily: 'BebasNeue',
                  fontSize: 18,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  referral['username'] ?? 'Utilisateur',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  referral['joinedAt'] ?? '',
                  style: const TextStyle(color: Colors.white38, fontSize: 11),
                ),
              ],
            ),
          ),
          Text(
            '+${(referral['bonus'] ?? 0.5).toStringAsFixed(1)} SHEE',
            style: const TextStyle(
              color: AppColors.red,
              fontFamily: 'BebasNeue',
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
}