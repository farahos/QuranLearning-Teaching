import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AuthPageShell extends StatelessWidget {
  const AuthPageShell({
    super.key,
    required this.heading,
    required this.child,
  });

  final String heading;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      body: Stack(
        children: [
          Positioned(
            top: -82,
            right: -68,
            child: Container(
              width: 202,
              height: 202,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.green.withValues(alpha: 0.14),
              ),
            ),
          ),
          Positioned(
            top: 86,
            left: -34,
            child: Container(
              width: 74,
              height: 74,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.greenAlt.withValues(alpha: 0.10),
              ),
            ),
          ),
          SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight - 52),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 440),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Quran Connect',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.title,
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            Text(
                              heading,
                              textAlign: TextAlign.center,
                              style: AppTextStyles.heading,
                            ),
                            const SizedBox(height: AppSpacing.xl),
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.08),
                                    blurRadius: 30,
                                    offset: const Offset(0, 16),
                                  ),
                                ],
                              ),
                              child: child,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
