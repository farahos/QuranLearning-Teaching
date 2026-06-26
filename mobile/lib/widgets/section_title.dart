import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class SectionTitle extends StatelessWidget {
  const SectionTitle(this.title, {super.key, this.trailing});

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: Text(title, style: AppTextStyles.sectionTitle)),
        if (trailing != null) trailing!,
      ],
    );
  }
}
