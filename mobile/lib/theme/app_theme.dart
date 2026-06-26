import 'package:flutter/material.dart';

class AppColors {
  static const green = Color(0xFF16A34A);
  static const greenAlt = Color(0xFF18A558);
  static const textDark = Color(0xFF111827);
  static const textMuted = Color(0xFF6B7280);
  static const inputBackground = Color(0xFFF3F4F6);
  static const border = Color(0xFFE5E7EB);
  static const surface = Colors.white;
  static const scaffold = Colors.white;
}

class AppSpacing {
  static const xs = 8.0;
  static const sm = 12.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
}

class AppTextStyles {
  static const title = TextStyle(
    color: AppColors.green,
    fontSize: 18,
    fontWeight: FontWeight.w800,
  );

  static const heading = TextStyle(
    color: AppColors.textDark,
    fontSize: 31,
    fontWeight: FontWeight.w800,
    height: 1.12,
  );

  static const body = TextStyle(
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );
}

class AppTheme {
  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.scaffold,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.green,
        primary: AppColors.green,
        surface: AppColors.surface,
        brightness: Brightness.light,
      ),
      fontFamily: 'Roboto',
      textSelectionTheme: const TextSelectionThemeData(
        cursorColor: AppColors.green,
        selectionHandleColor: AppColors.green,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.inputBackground,
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 17),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.green, width: 1.4),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFDC2626), width: 1.2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFFDC2626), width: 1.4),
        ),
        hintStyle: const TextStyle(color: AppColors.textMuted),
      ),
    );
  }
}
