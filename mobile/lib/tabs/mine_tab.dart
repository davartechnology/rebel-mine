import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

class _MineTabState extends State<MineTab>
    with TickerProviderStateMixin, WidgetsBindingObserver {

  static const int _miningDuration = 300; // 5 minutes en secondes

  double _baseBalance = 0.0;
  double _miningProgress = 0.0; // 0.0 → 1.0
  bool _isAnimatingMining = false;
  int _miningElapsed = 0; // secondes écoulées depuis début minage

  bool _isMining = false;
  bool _canMine = true;
  bool _isLoading = true;
  bool _isFirstMine = true;
  int _cooldownSeconds = 0;
  String? _errorMessage;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  Timer? _cooldownTimer;
  Timer? _refreshTimer;
  Timer? _miningTimer; // Timer réel pour l'animation de minage

  InterstitialAd? _interstitialAd;
  bool _interstitialReady = false;
  RewardedAd? _rewardedAd;
  bool _rewardedReady = false;

  double get _displayBalance => _baseBalance + (_miningProgress * 1.0);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _loadStatus();
    _checkPendingMining(); // Vérifier si un minage était en cours
    _loadInterstitialAd();
    _loadRewardedAd();

    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (!_isAnimatingMining) _loadStatus();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pulseController.dispose();
    _cooldownTimer?.cancel();
    _refreshTimer?.cancel();
    _miningTimer?.cancel();
    _interstitialAd?.dispose();
    _rewardedAd?.dispose();
    super.dispose();
  }

  // Détecter quand l'app revient au premier plan
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkPendingMining();
      _loadStatus();
    }
  }

  // ── Vérifier si minage en cours (après navigation ou retour app) ───────────
  Future<void> _checkPendingMining() async {
    final prefs = await SharedPreferences.getInstance();
    final startTimeMs = prefs.getInt('mining_start_time');
    if (startTimeMs == null) return;

    final elapsed =
        (DateTime.now().millisecondsSinceEpoch - startTimeMs) / 1000;

    if (elapsed < _miningDuration) {
      // Minage toujours en cours
      if (!mounted) return;
      setState(() {
        _isAnimatingMining = true;
        _miningElapsed = elapsed.toInt();
        _miningProgress = elapsed / _miningDuration;
      });
      _startMiningTimer(resumeFrom: elapsed.toInt());
    } else {
      // Minage terminé pendant l'absence
      await prefs.remove('mining_start_time');
      if (!mounted) return;
      setState(() {
        _isAnimatingMining = false;
        _miningProgress = 0.0;
        _miningElapsed = 0;
      });
      // Rafraîchir le solde depuis le serveur
      _loadStatus();
    }
  }

  // ── Timer de minage basé sur temps réel ────────────────────────────────────
  void _startMiningTimer({int resumeFrom = 0}) {
    _miningTimer?.cancel();
    _miningElapsed = resumeFrom;

    _miningTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      _miningElapsed++;
      final progress = _miningElapsed / _miningDuration;

      if (_miningElapsed >= _miningDuration) {
        timer.cancel();
        // Animation terminée
        SharedPreferences.getInstance()
            .then((p) => p.remove('mining_start_time'));
        setState(() {
          _baseBalance = _baseBalance + 1.0;
          _miningProgress = 0.0;
          _isAnimatingMining = false;
          _miningElapsed = 0;
        });
        _showSnack('✅ +1.00 SHEE crédité sur ton compte !');
        _loadStatus();
      } else {
        setState(() {
          _miningProgress = progress;
        });
      }
    });
  }

  // ── Statut minage ──────────────────────────────────────────────────────────
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

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          if (!_isAnimatingMining) {
            _baseBalance =
                double.tryParse(data['balance'].toString()) ?? 0.0;
          }
          _canMine = data['canMine'] ?? true;
          _isFirstMine = data['isFirstMine'] ?? true;
          _isLoading = false;

          if (!_canMine && data['cooldownSeconds'] != null) {
            _cooldownSeconds = data['cooldownSeconds'];
            _startCooldownTimer();
          } else if (_canMine) {
            _cooldownSeconds = 0;
            _cooldownTimer?.cancel();
          }
        });
      } else {
        setState(() {
          _isLoading = false;
          _canMine = true;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _canMine = true;
      });
    }
  }

  // ── Cooldown ───────────────────────────────────────────────────────────────
  void _startCooldownTimer() {
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_cooldownSeconds <= 0) {
        timer.cancel();
        setState(() {
          _canMine = true;
          _cooldownSeconds = 0;
        });
      } else {
        setState(() => _cooldownSeconds--);
      }
    });
  }

  String _formatCooldown(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  // ── Pubs ───────────────────────────────────────────────────────────────────
  void _loadInterstitialAd() {
    InterstitialAd.load(
      adUnitId: AppConstants.interstitialAdId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          if (!mounted) return;
          setState(() {
            _interstitialAd = ad;
            _interstitialReady = true;
          });
        },
        onAdFailedToLoad: (_) {
          if (!mounted) return;
          setState(() => _interstitialReady = false);
        },
      ),
    );
  }

  void _loadRewardedAd() {
    RewardedAd.load(
      adUnitId: AppConstants.rewardedAdId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          if (!mounted) return;
          setState(() {
            _rewardedAd = ad;
            _rewardedReady = true;
          });
        },
        onAdFailedToLoad: (_) {
          if (!mounted) return;
          setState(() => _rewardedReady = false);
        },
      ),
    );
  }

  // ── Clic MINER ─────────────────────────────────────────────────────────────
  void _onMineTap() {
    if (!_canMine || _isMining || _isAnimatingMining) return;

    if (!_isFirstMine && _rewardedReady) {
      _showRewardedThenMine();
    } else if (_interstitialReady) {
      _showInterstitialThenMine();
    } else {
      _executeMining();
    }
  }

  void _showInterstitialThenMine() {
    _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _interstitialAd = null;
        _interstitialReady = false;
        _loadInterstitialAd();
        _executeMining();
      },
      onAdFailedToShowFullScreenContent: (ad, _) {
        ad.dispose();
        _interstitialReady = false;
        _loadInterstitialAd();
        _executeMining();
      },
    );
    _interstitialAd!.show();
    setState(() => _interstitialAd = null);
  }

  void _showRewardedThenMine() {
    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdDismissedFullScreenContent: (ad) {
        ad.dispose();
        _rewardedAd = null;
        _rewardedReady = false;
        _loadRewardedAd();
        _executeMining();
      },
      onAdFailedToShowFullScreenContent: (ad, _) {
        ad.dispose();
        _rewardedReady = false;
        _loadRewardedAd();
        _executeMining();
      },
    );
    _rewardedAd!.show(onUserEarnedReward: (_, __) {});
    setState(() => _rewardedAd = null);
  }

  // ── Exécuter minage ────────────────────────────────────────────────────────
  Future<void> _executeMining() async {
    if (!mounted) return;
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

      if (!mounted) return;
      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        // Sauvegarder le timestamp de début
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt(
          'mining_start_time',
          DateTime.now().millisecondsSinceEpoch,
        );

        setState(() {
          _canMine = false;
          _isFirstMine = false;
          _cooldownSeconds = AppConstants.cooldownMinutes * 60;
          _isMining = false;
          _isAnimatingMining = true;
          _miningProgress = 0.0;
          _miningElapsed = 0;
        });

        _startCooldownTimer();
        _startMiningTimer();
        _showSnack('⛏️ Minage démarré ! Regarde ton solde monter...');
      } else {
        setState(() {
          _isMining = false;
          _errorMessage = data['error'] ?? 'Erreur de minage';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isMining = false;
        _errorMessage = 'Erreur de connexion';
      });
    }
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: AppColors.red,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  // ── BUILD ──────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return _isLoading
        ? const Center(
            child: CircularProgressIndicator(color: AppColors.red))
        : RefreshIndicator(
            color: AppColors.red,
            onRefresh: _loadStatus,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 24),
                child: Column(
                  children: [
                    _buildBalanceCard(),
                    const SizedBox(height: 32),
                    _buildMineButton(),
                    const SizedBox(height: 24),
                    if (_isAnimatingMining) _buildMiningProgressCard(),
                    if (!_canMine) _buildCooldownCard(),
                    if (_errorMessage != null) _buildError(),
                    const SizedBox(height: 32),
                    _buildInfoCard(),
                  ],
                ),
              ),
            ),
          );
  }

  Widget _buildBalanceCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _isAnimatingMining
              ? AppColors.red.withOpacity(0.8)
              : AppColors.red.withOpacity(0.3),
          width: _isAnimatingMining ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.red
                .withOpacity(_isAnimatingMining ? 0.25 : 0.1),
            blurRadius: _isAnimatingMining ? 40 : 20,
            spreadRadius: _isAnimatingMining ? 5 : 2,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
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
              if (_isAnimatingMining) ...[
                const SizedBox(width: 8),
                const SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(
                    color: AppColors.red,
                    strokeWidth: 2,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _isAnimatingMining
                ? '${_displayBalance.toStringAsFixed(8)} SHEE'
                : '${_displayBalance.toStringAsFixed(2)} SHEE',
            style: TextStyle(
              color: _isAnimatingMining ? AppColors.red : Colors.white,
              fontSize: _isAnimatingMining ? 26 : 40,
              fontFamily: 'BebasNeue',
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '≈ \$${(_displayBalance * AppConstants.tokenPrice).toStringAsFixed(6)} USD',
            style: const TextStyle(color: Colors.white38, fontSize: 13),
          ),
          if (_isAnimatingMining) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: _miningProgress,
                backgroundColor: Colors.white12,
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AppColors.red),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              '${(_miningProgress * 100).toStringAsFixed(4)}% miné',
              style: const TextStyle(
                color: AppColors.red,
                fontSize: 11,
                letterSpacing: 1,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMineButton() {
    final bool blocked = _isAnimatingMining;
    return GestureDetector(
      onTap: _canMine && !_isMining && !blocked ? _onMineTap : null,
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _canMine && !_isMining && !blocked
                ? _pulseAnimation.value
                : 1.0,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: (_canMine && !blocked)
                    ? AppColors.red
                    : const Color(0xFF333333),
                boxShadow: (_canMine && !blocked)
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
                            blocked
                                ? Icons.hourglass_bottom
                                : (_canMine
                                    ? Icons.flash_on
                                    : Icons.lock_clock),
                            color: Colors.white,
                            size: 50,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            blocked
                                ? 'EN COURS'
                                : (_canMine ? 'MINER' : 'COOLDOWN'),
                            style: const TextStyle(
                              color: Colors.white,
                              fontFamily: 'BebasNeue',
                              fontSize: 22,
                              letterSpacing: 3,
                            ),
                          ),
                          if (_canMine && !blocked)
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

  Widget _buildMiningProgressCard() {
    final remaining = _miningDuration - _miningElapsed;
    final m = (remaining ~/ 60).toString().padLeft(2, '0');
    final s = (remaining % 60).toString().padLeft(2, '0');

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.red.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          const Text('⛏️', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'MINAGE EN COURS',
                style: TextStyle(
                  color: AppColors.red,
                  fontFamily: 'BebasNeue',
                  fontSize: 15,
                  letterSpacing: 2,
                ),
              ),
              Text(
                'Fin dans $m:$s',
                style:
                    const TextStyle(color: Colors.white38, fontSize: 12),
              ),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '+${(_miningProgress).toStringAsFixed(8)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontFamily: 'BebasNeue',
                  fontSize: 14,
                ),
              ),
              const Text(
                'SHEE',
                style: TextStyle(
                  color: AppColors.red,
                  fontFamily: 'BebasNeue',
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

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
          _buildInfoRow('⛏️', 'Récompense', '1 SHEE / minage'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('⏱️', 'Cooldown', '20 minutes'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('⚡', 'Animation', '5 minutes'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('💰', 'Prix SHEE', '\$0.002 USD'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('🎯', 'Retrait min.', '10 SHEE'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('👥', 'Parrainage niv.1', '20% / minage'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('👥', 'Parrainage niv.2', '10% / minage'),
          const Divider(color: Colors.white12, height: 20),
          _buildInfoRow('👥', 'Parrainage niv.3', '5% / minage'),
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
            Text(label,
                style:
                    const TextStyle(color: Colors.white54, fontSize: 13)),
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