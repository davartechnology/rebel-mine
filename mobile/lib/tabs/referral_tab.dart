import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ReferralTab extends StatelessWidget {
  const ReferralTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'RÉFÉRENCE TAB',
        style: TextStyle(
          color: AppColors.red,
          fontFamily: 'BebasNeue',
          fontSize: 24,
          letterSpacing: 4,
        ),
      ),
    );
  }
}