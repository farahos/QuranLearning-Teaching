import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class RoleSelector extends StatelessWidget {
  const RoleSelector({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _RoleButton(
          label: "I'm a student",
          active: value == 'student',
          onTap: () => onChanged('student'),
        ),
        const SizedBox(width: AppSpacing.sm),
        _RoleButton(
          label: "I'm a teacher",
          active: value == 'teacher',
          onTap: () => onChanged('teacher'),
        ),
      ],
    );
  }
}

class _RoleButton extends StatelessWidget {
  const _RoleButton({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Semantics(
        button: true,
        selected: active,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(999),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            height: 48,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: active ? AppColors.green : AppColors.surface,
              borderRadius: BorderRadius.circular(999),
              border: Border.all(
                color: active ? AppColors.green : AppColors.border,
                width: 1.2,
              ),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: AppColors.green.withValues(alpha: 0.18),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ]
                  : null,
            ),
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: active ? Colors.white : AppColors.textDark,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
