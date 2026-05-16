import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../theme/app_theme.dart';
import '../config/constants.dart';
import '../services/auth_service.dart';
import '../tabs/mine_tab.dart';
import '../tabs/referral_tab.dart';
import '../tabs/history_tab.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  BannerAd? _bannerAd;
  bool _bannerAdLoaded = false;

  final List<Widget> _tabs = const [
    MineTab(),
    ReferralTab(),
    HistoryTab(),
  ];

  @override
  void initState() {
    super.initState();
    _loadBannerAd();
  }

  void _loadBannerAd() {
    _bannerAd = BannerAd(
      adUnitId: AppConstants.bannerAdId,
      size: AdSize.banner,
      request: const AdRequest(),
      listener: BannerAdListener(
        onAdLoaded: (_) {
          setState(() => _bannerAdLoaded = true);
        },
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          print('=== ERREUR BANNIERE: $error ===');
        },
      ),
    )..load();
  }

  @override
  void dispose() {
    _bannerAd?.dispose();
    super.dispose();
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        elevation: 0,
        title: const Text(
          'SHIEFO',
          style: TextStyle(
            fontFamily: 'BebasNeue',
            fontSize: 22,
            letterSpacing: 6,
            color: AppColors.red,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.logout,
              color: AppColors.muted,
              size: 20,
            ),
            onPressed: _logout,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(
            color: Colors.white.withOpacity(0.06),
            height: 1,
          ),
        ),
      ),
      body: Column(
        children: [
          // Contenu principal
          Expanded(
            child: _tabs[_currentIndex],
          ),

          // Bannière pub
          if (_bannerAdLoaded && _bannerAd != null)
            Container(
              color: AppColors.bg,
              alignment: Alignment.center,
              width: _bannerAd!.size.width.toDouble(),
              height: _bannerAd!.size.height.toDouble(),
              child: AdWidget(ad: _bannerAd!),
            ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.bg,
          border: Border(
            top: BorderSide(
              color: Colors.white.withOpacity(0.06),
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: AppColors.bg,
          selectedItemColor: AppColors.red,
          unselectedItemColor: AppColors.muted,
          selectedLabelStyle: const TextStyle(
            fontFamily: 'BarlowCondensed',
            fontSize: 11,
            letterSpacing: 1,
            fontWeight: FontWeight.w600,
          ),
          unselectedLabelStyle: const TextStyle(
            fontFamily: 'BarlowCondensed',
            fontSize: 11,
            letterSpacing: 1,
          ),
          items: const [
            BottomNavigationBarItem(
              icon: Text('⛏️', style: TextStyle(fontSize: 22)),
              activeIcon: Text('⛏️', style: TextStyle(fontSize: 24)),
              label: 'Mine',
            ),
            BottomNavigationBarItem(
              icon: Text('👥', style: TextStyle(fontSize: 22)),
              activeIcon: Text('👥', style: TextStyle(fontSize: 24)),
              label: 'Référence',
            ),
            BottomNavigationBarItem(
              icon: Text('📋', style: TextStyle(fontSize: 22)),
              activeIcon: Text('📋', style: TextStyle(fontSize: 24)),
              label: 'Historique',
            ),
          ],
        ),
      ),
    );
  }
}