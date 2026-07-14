import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/empty_state.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});

  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await context.read<AppState>().fetchCertificates();
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final certificates = app.certificates;

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        elevation: 0,
        title: const Text('Certificates', style: AppTextStyles.appBarTitle),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : certificates.isEmpty
              ? const EmptyState(
                  message: 'Complete all lessons in a course to earn a certificate.',
                  icon: Icons.workspace_premium_outlined,
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  itemCount: certificates.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (_, index) {
                    final certificate = certificates[index];
                    final course = (certificate['course'] ?? {}) as Map<String, dynamic>;
                    return ListTile(
                      tileColor: AppColors.surface,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.border)),
                      leading: const CircleAvatar(
                        backgroundColor: AppColors.greenSoft,
                        foregroundColor: AppColors.green,
                        child: Icon(Icons.workspace_premium_outlined),
                      ),
                      title: Text(course['courseName'] ?? 'Course', style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.textDark)),
                      subtitle: const Text('Completed', style: AppTextStyles.small),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _showCertificate(context, certificate, course),
                    );
                  },
                ),
    );
  }

  void _showCertificate(BuildContext context, Map<String, dynamic> certificate, Map<String, dynamic> course) {
    final app = context.read<AppState>();
    final teacher = (course['teacher'] ?? {}) as Map<String, dynamic>;
    final issuedAt = (certificate['issuedAt'] ?? '').toString();

    showDialog<void>(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.workspace_premium, color: AppColors.warning, size: 44),
              const SizedBox(height: AppSpacing.sm),
              const Text('CERTIFICATE OF COMPLETION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.textMuted, letterSpacing: 1.2)),
              const SizedBox(height: AppSpacing.sm),
              Text(
                app.currentUser?.fullName ?? '',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textDark),
              ),
              const SizedBox(height: 4),
              const Text('has successfully completed', style: AppTextStyles.small),
              const SizedBox(height: 4),
              Text(
                course['courseName'] ?? '',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppColors.green),
              ),
              if ((teacher['fullName'] ?? '').toString().isNotEmpty) ...[
                const SizedBox(height: 4),
                Text('Instructor: ${teacher['fullName']}', style: AppTextStyles.small),
              ],
              const SizedBox(height: AppSpacing.md),
              if (issuedAt.isNotEmpty) Text('Issued ${issuedAt.split("T").first}', style: AppTextStyles.small),
              Text('Code: ${certificate['certificateCode'] ?? ''}', style: AppTextStyles.small),
              const SizedBox(height: AppSpacing.md),
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
            ],
          ),
        ),
      ),
    );
  }
}
