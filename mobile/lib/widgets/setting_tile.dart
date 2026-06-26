import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class SettingTile extends StatelessWidget {
  const SettingTile({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.trailing,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: AppColors.greenSoft,
          foregroundColor: AppColors.green,
          child: Icon(icon),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: AppColors.textDark,
            fontWeight: FontWeight.w900,
          ),
        ),
        subtitle: Text(subtitle, style: AppTextStyles.small),
        trailing: trailing ?? (onTap == null ? null : const Icon(Icons.chevron_right, color: AppColors.textMuted)),
      ),
    );
  }
}
