import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../theme/app_theme.dart';
import '../../config/constants.dart';
import '../../services/storage_service.dart';

class MineTab extends StatefulWidget {
  const MineTab({super.key});

  @override
  State<MineTab> createState() => _MineTabState();
}

class _MineTabState extends State<MineTab> with SingleTickerProviderStateMixin {
  // État
  double _balance = 0.0;
  bool _isMining = false;
  bool _canMine = true;
  bool _isLoading = true;
  int _cooldownSeconds = 0;
  String? _errorMessage;

  // Animation
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  // Timer
  Timer? _cooldownTimer;
  Timer? _refreshTimer;

  // AdMob
  RewardedAd? _rewardedAd;
  bool _adLoaded = false;

  @override
  void initState() {
    super.initState();

    // Animation pulse
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _loadStatus();
    _loadRewardedAd();

    // Refresh toutes les 30 secondes
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _loadStatus();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _cooldownTimer?.cancel();
    _refreshTimer?.cancel();
    _rewardedAd?.dispose();
    super.dispose();
  }

  // ── Charger le statut de minage ──────────────────────────────────────────
  Future<void> _loadStatus() async {
    try {
      final token = await StorageService.getToken();
      if (token == null) return;

      final response = await http.get(
        Uri.parse(AppConstants.miningStatusUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _balance = (data['balance'] ?? 0.0).toDouble();
          _canMine = data['canMine'] ?? true;
          _isLoading = false;

          if (!_canMine && data['cooldownSeconds'] != null) {
            _cooldownSeconds = data['cooldownSeconds'];
            _startCooldownTimer();
          } else {
            _cooldownSeconds = 0;
            _cooldownTimer?.cancel();
          }
        });
      } else {
        setState(() {
          _isLoading = false;
          _balance = 0.0;
          _canMine = true;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _canMine = true;
      });
    }
  }

  // ── Timer cooldown ────────────────────────────────────────────────────────
  void _startCooldownTimer() {
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_cooldownSeconds <= 0) {
        timer.cancel();
        setState(() {
          _canMine = true;
          _cooldownSeconds = 0;
        });
      } else {
        setState(() {
          _cooldownSeconds--;
        });
      }
    });
  }

  String _formatCooldown(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  // ── Lancer le minage ─────────────────────────────────────────────────────
  Future<void> _startMining() async {
    if (!_canMine || _isMining) return;

    setState(() {
      _isMining = true;
      _errorMessage = null;
    });

    try {
      final token = await StorageService.getToken();
      if (token == null) return;

      final response = await http.post(
        Uri.parse(AppConstants.miningStartUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        setState(() {
          _balance = (data['balance'] ?? _balance).toDouble();
          _canMine = false;
          _cooldownSeconds = AppConstants.cooldownMinutes * 60;
          _isMining = false;
        });
        _startCooldownTimer();
        _showSuccessSnack('+${AppConstants.miningReward} SHEE miné !');

        // Charger pub pour la prochaine fois
        _loadRewardedAd();
      } else {
        setState(() {
          _isMining = false;
          _errorMessage = data['error'] ?? 'Erreur de minage';
        });
      }
    } catch (e) {
      setState(() {
        _isMining = false;
        _errorMessage = 'Erreur de connexion';
      });
    }
  }

  // ── AdMob Rewarded ────────────────────────────────────────────────────────
  void _loadRewardedAd() {
    RewardedAd.load(
      adUnitId: AppConstants.rewardedAdId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          setState(() {
            _rewardedAd = ad;
            _adLoaded = true;
          });
        },
        onAdFailedToLoad: (error) {
          setState(() {
            _adLoaded = false;
          });
        },
      ),
    );
  }

  void _watchAdForBonus() {
    if (!_adLoaded || _rewardedAd == null) {
      _showSuccessSnack('Pub non disponible, réessaie plus tard');
      return;
    }

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _loadRewardedAd();
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        ad.dispose();
        _loadRewardedAd();
      },
    );

    _rewardedAd!.show(
      onUserEarnedReward: (ad, reward) async {
        // Bonus +0.5 SHEE pour avoir regardé la pub
        try {
          final token = await StorageService.getToken();
          if (token == null) return;

          await http.post(
            Uri.parse(AppConstants.miningVerifyAdUrl),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({'adType': 'rewarded'}),
          );

          await _loadStatus();
          _showSuccessSnack('+0.5 SHEE bonus pour la pub !');
        } catch (e) {
          // ignore
        }
      },
    );

    setState(() {
      _rewardedAd = null;
      _adLoaded = false;
    });
  }

  void _showSuccessSnack(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: AppColors.red,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return _isLoading
        ? const Center(child: CircularProgressIndicator(color: AppColors.red))
        : RefreshIndicator(
            color: AppColors.red,
            onRefresh: _loadStatus,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                child: Column(
                  children: [
                    _buildBalanceCard(),
                    const SizedBox(height: 32),
                    _buildMineButton(),
                    const SizedBox(height: 24),
                    if (!_canMine) _buildCooldownCard(),
                    if (_canMine && _adLoaded) _buildAdBonus(),
                    if (_errorMessage != null) _buildError(),
                    const SizedBox(height: 32),
                    _buildInfoCard(),
                  ],
                ),
              ),
            ),
          );
  }

  // Carte solde
  Widget _buildBalanceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.red.withOpacity(0.3), width: 1),
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
            'TON SOLDE',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 11,
              letterSpacing: 3,
              fontFamily: 'BebasNeue',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${_balance.toStringAsFixed(2)} SHEE',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 40,
              fontFamily: 'BebasNeue',
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '≈ \$${(_balance * AppConstants.tokenPrice).toStringAsFixed(4)} USD',
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  // Bouton de minage
  Widget _buildMineButton() {
    return GestureDetector(
      onTap: _canMine && !_isMining ? _startMining : null,
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _canMine && !_isMining ? _pulseAnimation.value : 1.0,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _canMine
                    ? AppColors.red
                    : const Color(0xFF333333),
                boxShadow: _canMine
                    ? [
                        BoxShadow(
                          color: AppColors.red.withOpacity(0.5),
                          blurRadius: 30,
                          spreadRadius: 5,
                        ),
                      ]
                    : [],
              ),
              child: Center(
                child: _isMining
                    ? const CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 3,
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _canMine ? Icons.flash_on : Icons.lock_clock,
                            color: Colors.white,
                            size: 50,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _canMine ? 'MINER' : 'COOLDOWN',
                            style: const TextStyle(
                              color: Colors.white,
                              fontFamily: 'BebasNeue',
                              fontSize: 22,
                              letterSpacing: 3,
                            ),
                          ),
                          if (_canMine)
                            Text(
                              '+${AppConstants.miningReward} SHEE',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                              ),
                            ),
                        ],
                      ),
              ),
            ),
          );
        },
      ),
    );
  }

  // Cooldown timer
  Widget _buildCooldownCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.timer, color: Colors.white54, size: 20),
          const SizedBox(width: 10),
          const Text(
            'PROCHAIN MINAGE DANS',
            style: TextStyle(
              color: Colors.white54,
              fontFamily: 'BebasNeue',
              fontSize: 14,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            _formatCooldown(_cooldownSeconds),
            style: const TextStyle(
              color: AppColors.red,
              fontFamily: 'BebasNeue',
              fontSize: 22,
              letterSpacing: 2,
            ),
          ),
        ],
      ),
    );
  }

  // Bonus pub
  Widget _buildAdBonus() {
    return GestureDetector(
      onTap: _watchAdForBonus,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A2E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF1A6FFF).withOpacity(0.5)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.play_circle_fill, color: Color(0xFF1A6FFF), size: 24),
            SizedBox(width: 10),
            Text(
              'REGARDER UNE PUB → +0.5 SHEE',
              style: TextStyle(
                color: Color(0xFF1A6FFF),
                fontFamily: 'BebasNeue',
                fontSize: 15,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Erreur
  Widget _buildError() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMessage!,
              style: const TextStyle(color: Colors.red, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  // Info card
  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: [
          _buildInfoRow('⛏️', 'Récompense', '${AppConstants.miningReward} SHEE / minage'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('⏱️', 'Cooldown', '${AppConstants.cooldownMinutes} minutes'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('💰', 'Prix SHEE', '\$${AppConstants.tokenPrice} USD'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('🎯', 'Retrait min.', '${AppConstants.withdrawalMinimum} SHEE'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String emoji, String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white54, fontSize: 13),
            ),
          ],
        ),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}