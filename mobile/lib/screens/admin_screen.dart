import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/empty_state.dart';
import '../widgets/section_title.dart';
import '../widgets/setting_tile.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  int _tabIndex = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AppState>().refreshAdmin());
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final pages = [
      const _AdminOverviewTab(),
      const _AdminUsersTab(),
      const _AdminCoursesTab(),
      const _AdminPaymentsTab(),
      const _AdminSettingsTab(),
    ];

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        elevation: 0,
        title: const Text('Admin Panel', style: AppTextStyles.appBarTitle),
      ),
      body: RefreshIndicator(
        color: AppColors.green,
        onRefresh: app.refreshAdmin,
        child: pages[_tabIndex],
      ),
      bottomNavigationBar: AppBottomNav(
        selectedIndex: _tabIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Overview'),
          NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Users'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: 'Courses'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Payments'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Setting'),
        ],
      ),
    );
  }
}

class _AdminOverviewTab extends StatelessWidget {
  const _AdminOverviewTab();

  @override
  Widget build(BuildContext context) {
    final dashboard = context.watch<AppState>().adminDashboard;
    final users = (dashboard?['users'] ?? {}) as Map<String, dynamic>;
    final courses = (dashboard?['courses'] ?? {}) as Map<String, dynamic>;
    final payments = (dashboard?['payments'] ?? {}) as Map<String, dynamic>;
    final kyc = (dashboard?['kyc'] ?? {}) as Map<String, dynamic>;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('Overview'),
        const SizedBox(height: AppSpacing.md),
        _MetricGrid(
          metrics: [
            _MetricData('Users', '${users['total'] ?? 0}', Icons.people_outline),
            _MetricData('Teachers', '${users['teachers'] ?? 0}', Icons.school_outlined),
            _MetricData('Students', '${users['students'] ?? 0}', Icons.person_outline),
            _MetricData('Courses', '${courses['total'] ?? 0}', Icons.menu_book_outlined),
            _MetricData('Revenue', '\$${_money(payments['totalRevenue'])}', Icons.payments_outlined),
            _MetricData('Commission', '\$${_money(payments['adminCommission'])}', Icons.account_balance_wallet_outlined),
            _MetricData('Payments', '${payments['completedCount'] ?? 0}', Icons.check_circle_outline),
            _MetricData('Pending KYC', '${kyc['pending'] ?? 0}', Icons.verified_user_outlined),
          ],
        ),
      ],
    );
  }
}

class _AdminUsersTab extends StatelessWidget {
  const _AdminUsersTab();

  @override
  Widget build(BuildContext context) {
    final users = context.watch<AppState>().adminUsers;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('Users'),
        const SizedBox(height: AppSpacing.md),
        if (users.isEmpty)
          const EmptyState(message: 'No users found', icon: Icons.people_outline)
        else
          ...users.map((user) => _UserCard(user: user)),
      ],
    );
  }
}

class _UserCard extends StatelessWidget {
  const _UserCard({required this.user});

  final Map<String, dynamic> user;

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    final id = user['_id']?.toString() ?? '';
    final role = user['role']?.toString() ?? 'student';
    final kycStatus = user['kycStatus']?.toString() ?? 'not_submitted';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: _adminCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.greenSoft,
                foregroundColor: AppColors.green,
                child: Text((user['fullName']?.toString().isNotEmpty ?? false) ? user['fullName'].toString()[0].toUpperCase() : 'U'),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user['fullName'] ?? 'User', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
                    Text(user['email'] ?? '', style: AppTextStyles.small),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Delete user',
                onPressed: () => _confirmDeleteUser(context, app, id),
                icon: const Icon(Icons.delete_outline, color: Color(0xFFDC2626)),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: role,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: const [
                    DropdownMenuItem(value: 'student', child: Text('Student')),
                    DropdownMenuItem(value: 'teacher', child: Text('Teacher')),
                    DropdownMenuItem(value: 'admin', child: Text('Admin')),
                  ],
                  onChanged: (value) {
                    if (value != null) app.updateAdminUser(id, {'role': value});
                  },
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: kycStatus,
                  decoration: const InputDecoration(labelText: 'KYC'),
                  items: const [
                    DropdownMenuItem(value: 'not_submitted', child: Text('None')),
                    DropdownMenuItem(value: 'pending', child: Text('Pending')),
                    DropdownMenuItem(value: 'verified', child: Text('Verified')),
                    DropdownMenuItem(value: 'rejected', child: Text('Rejected')),
                  ],
                  onChanged: (value) {
                    if (value != null) app.updateAdminUser(id, {'kycStatus': value});
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDeleteUser(BuildContext context, AppState app, String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete user?'),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirmed == true) {
      await app.deleteAdminUser(id);
    }
  }
}

class _AdminCoursesTab extends StatelessWidget {
  const _AdminCoursesTab();

  @override
  Widget build(BuildContext context) {
    final courses = context.watch<AppState>().adminCourses;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('Courses'),
        const SizedBox(height: AppSpacing.md),
        if (courses.isEmpty)
          const EmptyState(message: 'No courses found', icon: Icons.menu_book_outlined)
        else
          ...courses.map((course) => _AdminCourseCard(course: course)),
      ],
    );
  }
}

class _AdminCourseCard extends StatelessWidget {
  const _AdminCourseCard({required this.course});

  final CourseModel course;

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: _adminCardDecoration(),
      child: Row(
        children: [
          Container(
            width: 72,
            height: 58,
            decoration: BoxDecoration(
              color: AppColors.greenSoft,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.menu_book_rounded, color: AppColors.green),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(course.courseName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text('${course.teacher.fullName} • ${course.category}', maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTextStyles.small),
                const SizedBox(height: 4),
                Text('\$${course.price.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.green, fontWeight: FontWeight.w900)),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Delete course',
            onPressed: () => _confirmDeleteCourse(context, app, course),
            icon: const Icon(Icons.delete_outline, color: Color(0xFFDC2626)),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmDeleteCourse(BuildContext context, AppState app, CourseModel course) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete course?'),
        content: Text('Delete "${course.courseName}" permanently?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete')),
        ],
      ),
    );
    if (confirmed == true) {
      await app.deleteAdminCourse(course.id);
    }
  }
}

class _AdminPaymentsTab extends StatelessWidget {
  const _AdminPaymentsTab();

  @override
  Widget build(BuildContext context) {
    final transactions = context.watch<AppState>().adminTransactions;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('Payments'),
        const SizedBox(height: AppSpacing.md),
        if (transactions.isEmpty)
          const EmptyState(message: 'No transactions found', icon: Icons.receipt_long_outlined)
        else
          ...transactions.map((transaction) => _TransactionCard(transaction: transaction)),
      ],
    );
  }
}

class _TransactionCard extends StatelessWidget {
  const _TransactionCard({required this.transaction});

  final Map<String, dynamic> transaction;

  @override
  Widget build(BuildContext context) {
    final status = transaction['status']?.toString() ?? 'pending';
    final user = transaction['user'];
    final userName = user is Map ? user['fullName'] ?? 'User' : 'User';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: _adminCardDecoration(),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: status == 'completed' ? AppColors.greenSoft : const Color(0xFFFEE2E2),
            foregroundColor: status == 'completed' ? AppColors.green : const Color(0xFFDC2626),
            child: Icon(status == 'completed' ? Icons.check : Icons.close),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(transaction['type'] ?? 'transaction', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
                Text('$userName • $status', style: AppTextStyles.small),
                if ((transaction['note'] ?? '').toString().isNotEmpty)
                  Text(transaction['note'], maxLines: 2, overflow: TextOverflow.ellipsis, style: AppTextStyles.small),
              ],
            ),
          ),
          Text('\$${_money(transaction['amount'])}', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}

class _AdminSettingsTab extends StatelessWidget {
  const _AdminSettingsTab();

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final user = app.currentUser;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('Setting'),
        const SizedBox(height: AppSpacing.lg),
        Center(
          child: CircleAvatar(
            radius: 48,
            backgroundColor: AppColors.greenSoft,
            foregroundColor: AppColors.green,
            child: Text((user?.fullName.isNotEmpty ?? false) ? user!.fullName[0].toUpperCase() : 'A', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900)),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Center(child: Text(user?.fullName ?? 'Admin', style: const TextStyle(color: AppColors.textDark, fontSize: 19, fontWeight: FontWeight.w900))),
        const Center(child: Text('admin', style: AppTextStyles.body)),
        const SizedBox(height: AppSpacing.xl),
        SettingTile(
          icon: Icons.refresh,
          title: 'Refresh data',
          subtitle: 'Reload users, courses, and payments',
          onTap: app.refreshAdmin,
        ),
        SettingTile(
          icon: Icons.dark_mode_outlined,
          title: 'Dark mode',
          subtitle: 'Keep the clean admin theme',
          trailing: Switch(value: app.darkMode, activeThumbColor: AppColors.green, onChanged: app.setDarkMode),
        ),
        SettingTile(
          icon: Icons.logout,
          title: 'Logout',
          subtitle: 'Sign out from admin panel',
          onTap: app.logout,
        ),
      ],
    );
  }
}

class _MetricGrid extends StatelessWidget {
  const _MetricGrid({required this.metrics});

  final List<_MetricData> metrics;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      itemCount: metrics.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.28,
      ),
      itemBuilder: (_, index) {
        final metric = metrics[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: _adminCardDecoration(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: AppColors.greenSoft,
                foregroundColor: AppColors.green,
                child: Icon(metric.icon),
              ),
              const Spacer(),
              Text(metric.value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.textDark, fontSize: 22, fontWeight: FontWeight.w900)),
              Text(metric.label, style: AppTextStyles.small),
            ],
          ),
        );
      },
    );
  }
}

class _MetricData {
  const _MetricData(this.label, this.value, this.icon);

  final String label;
  final String value;
  final IconData icon;
}

String _money(dynamic value) {
  final number = value is num ? value.toDouble() : double.tryParse(value?.toString() ?? '') ?? 0;
  return number.toStringAsFixed(2);
}

BoxDecoration _adminCardDecoration() {
  return BoxDecoration(
    color: AppColors.surface,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: AppColors.border),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withValues(alpha: 0.05),
        blurRadius: 22,
        offset: const Offset(0, 10),
      ),
    ],
  );
}
