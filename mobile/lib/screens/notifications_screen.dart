import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/empty_state.dart';

const _typeIcons = {
  'enrollment': Icons.school_outlined,
  'review': Icons.star_outline,
  'kyc': Icons.verified_outlined,
};

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      await context.read<AppState>().fetchNotifications();
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final notifications = app.notifications;
    final unreadCount = notifications.where((item) => item['read'] != true).length;

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        elevation: 0,
        title: const Text('Notifications', style: AppTextStyles.appBarTitle),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: () => app.markAllNotificationsRead(),
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : notifications.isEmpty
              ? const EmptyState(message: "You're all caught up.", icon: Icons.notifications_none)
              : RefreshIndicator(
                  color: AppColors.green,
                  onRefresh: app.fetchNotifications,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    itemCount: notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (_, index) {
                      final item = notifications[index];
                      final read = item['read'] == true;
                      return Dismissible(
                        key: ValueKey(item['_id']),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(color: Colors.red.shade400, borderRadius: BorderRadius.circular(16)),
                          child: const Icon(Icons.delete_outline, color: Colors.white),
                        ),
                        onDismissed: (_) => app.removeNotification(item['_id'] as String),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () {
                            if (!read) app.markNotificationRead(item['_id'] as String);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: read ? AppColors.surface : AppColors.greenSoft,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  backgroundColor: AppColors.surface,
                                  foregroundColor: AppColors.green,
                                  child: Icon(_typeIcons[item['type']] ?? Icons.notifications_none, size: 18),
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Expanded(
                                  child: Text(
                                    (item['message'] ?? '') as String,
                                    style: TextStyle(
                                      color: AppColors.textDark,
                                      fontWeight: read ? FontWeight.w600 : FontWeight.w900,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
