import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppTextStyles {
  static const title = TextStyle(
    color: AppColors.green,
    fontSize: 18,
    fontWeight: FontWeight.w800,
  );

  static const appBarTitle = TextStyle(
    color: AppColors.textDark,
    fontSize: 22,
    fontWeight: FontWeight.w900,
  );

  static const heading = TextStyle(
    color: AppColors.textDark,
    fontSize: 31,
    fontWeight: FontWeight.w800,
    height: 1.12,
  );

  static const sectionTitle = TextStyle(
    color: AppColors.textDark,
    fontSize: 22,
    fontWeight: FontWeight.w900,
    height: 1.15,
  );

  static const body = TextStyle(
    color: AppColors.textMuted,
    fontSize: 14,
    fontWeight: FontWeight.w500,
  );

  static const small = TextStyle(
    color: AppColors.textMuted,
    fontSize: 12,
    fontWeight: FontWeight.w600,
  );
}
