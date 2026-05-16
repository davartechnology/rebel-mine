import 'package:flutter/material.dart';

class AppColors {
  // Couleurs principales SHIEFO
  static const Color bg = Color(0xFF080A0F);
  static const Color bg2 = Color(0xFF0D1018);
  static const Color bg3 = Color(0xFF12151E);
  static const Color red = Color(0xFFE8192C);
  static const Color red2 = Color(0xFFFF3347);
  static const Color silver = Color(0xFFC8D0DE);
  static const Color silver2 = Color(0xFFE8EDF5);
  static const Color blue = Color(0xFF1A6FFF);
  static const Color blue2 = Color(0xFF4D8FFF);
  static const Color gold = Color(0xFFC9A84C);
  static const Color muted = Color(0xFF4A5568);
  static const Color green = Color(0xFF16A34A);
  static const Color border = Color(0x0FFFFFFF);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.bg,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.red,
        secondary: AppColors.blue,
        surface: AppColors.bg2,
        error: AppColors.red2,
      ),
      fontFamily: 'Barlow',
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.bg,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: 'BebasNeue',
          fontSize: 22,
          letterSpacing: 4,
          color: AppColors.silver2,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.bg,
        selectedItemColor: AppColors.red,
        unselectedItemColor: AppColors.muted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.red,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 14,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bg,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.red),
        ),
        labelStyle: const TextStyle(
          color: AppColors.muted,
          fontFamily: 'BarlowCondensed',
          letterSpacing: 2,
        ),
        hintStyle: TextStyle(
          color: AppColors.muted.withOpacity(0.6),
        ),
      ),
    );
  }
}