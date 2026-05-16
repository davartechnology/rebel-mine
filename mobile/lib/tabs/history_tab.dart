import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class HistoryTab extends StatelessWidget {
  const HistoryTab({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'HISTORIQUE TAB',
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