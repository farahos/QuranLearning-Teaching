import 'dart:convert';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_bottom_nav.dart';
import '../widgets/category_chip.dart';
import '../widgets/course_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/primary_button.dart';
import '../widgets/section_title.dart';
import '../widgets/setting_tile.dart';
import 'course_detail_screen.dart';
import 'teacher_tools_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tabIndex = 0;
  String _search = '';
  String _category = 'Quran';

  static const _categories = ['Quran', 'Tajweed', 'Hifz', 'Arabic', 'Hadith'];

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      final app = context.read<AppState>();
      await app.fetchCourses();
      if (app.currentUser?.role == 'teacher') {
        await app.fetchTeacherStudents();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isTeacher = app.currentUser?.role == 'teacher';
    final pages = isTeacher
        ? [
            const TeacherToolsScreen(embedded: true),
            _SearchTab(
              courses: app.courses,
              search: _search,
              category: _category,
              categories: _categories,
              onSearchChanged: (value) => setState(() => _search = value),
              onCategoryChanged: (value) => setState(() => _category = value),
            ),
            const _TeacherStudentsTab(),
            const _SettingsTab(),
          ]
        : [
            _FeaturedTab(
              courses: app.courses,
              category: _category,
              categories: _categories,
              onCategoryChanged: (value) => setState(() => _category = value),
            ),
            _SearchTab(
              courses: app.courses,
              search: _search,
              category: _category,
              categories: _categories,
              onSearchChanged: (value) => setState(() => _search = value),
              onCategoryChanged: (value) => setState(() => _category = value),
            ),
            _MyLearningTab(
              courses: app.courses.where((course) => app.learningCourseIds.contains(course.id)).toList(),
            ),
            _CourseCollectionTab(
              title: 'Favorite',
              emptyMessage: 'No favorite courses yet',
              icon: Icons.favorite_border,
              courses: app.courses.where((course) => app.favoriteCourseIds.contains(course.id)).toList(),
            ),
            const _SettingsTab(),
          ];
    final selectedIndex = _tabIndex >= pages.length ? 0 : _tabIndex;

    final destinations = isTeacher
        ? const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
            NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Students'),
            NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Setting'),
          ]
        : const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
            NavigationDestination(icon: Icon(Icons.play_circle_outline), selectedIcon: Icon(Icons.play_circle), label: 'My Learning'),
            NavigationDestination(icon: Icon(Icons.favorite_border), selectedIcon: Icon(Icons.favorite), label: 'Favorite'),
            NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Setting'),
          ];

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        elevation: 0,
        title: selectedIndex == 0 ? null : const Text('Quran Learning', style: AppTextStyles.appBarTitle),
      ),
      body: RefreshIndicator(
        color: AppColors.green,
        onRefresh: isTeacher && selectedIndex == 2 ? app.fetchTeacherStudents : app.fetchCourses,
        child: pages[selectedIndex],
      ),
      bottomNavigationBar: AppBottomNav(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) => setState(() => _tabIndex = index),
        destinations: destinations,
      ),
    );
  }
}

class _TeacherStudentsTab extends StatefulWidget {
  const _TeacherStudentsTab();

  @override
  State<_TeacherStudentsTab> createState() => _TeacherStudentsTabState();
}

class _TeacherStudentsTabState extends State<_TeacherStudentsTab> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AppState>().fetchTeacherStudents());
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final courses = app.teacherStudentCourses;
    final totalStudents = courses.fold<int>(
      0,
      (sum, course) => sum + ((course['enrolledStudents'] ?? []) as List).length,
    );

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('Students'),
        const SizedBox(height: AppSpacing.xs),
        Text('$totalStudents students bought your courses', style: AppTextStyles.body),
        const SizedBox(height: AppSpacing.lg),
        if (totalStudents == 0)
          const EmptyState(message: 'Students who buy your courses will appear here.', icon: Icons.people_outline)
        else
          ...courses.map((course) {
            final students = (course['enrolledStudents'] ?? []) as List;
            if (students.isEmpty) return const SizedBox.shrink();
            return _TeacherStudentCourseGroup(courseName: course['courseName'] ?? 'Course', students: students);
          }),
      ],
    );
  }
}

class _TeacherStudentCourseGroup extends StatelessWidget {
  const _TeacherStudentCourseGroup({required this.courseName, required this.students});

  final String courseName;
  final List students;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(courseName, style: const TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          ...students.map((entry) {
            final entryMap = entry as Map<String, dynamic>;
            final student = (entryMap['student'] ?? {}) as Map<String, dynamic>;
            final image = student['profileImageUrl'] ?? '';
            final purchasedAt = (entryMap['purchasedAt'] ?? '').toString();
            final purchasedDate = purchasedAt.isEmpty ? '' : purchasedAt.split('T').first;
            final email = student['email'] ?? '';
            return ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                backgroundColor: AppColors.greenSoft,
                foregroundColor: AppColors.green,
                backgroundImage: image.isEmpty ? null : NetworkImage(ApiService.mediaUrl(image)),
                child: image.isEmpty ? const Icon(Icons.person_outline) : null,
              ),
              title: Text(student['fullName'] ?? 'Student', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800)),
              subtitle: Text(
                '$email${purchasedDate.isEmpty ? '' : '\nPurchased: $purchasedDate'}',
                style: AppTextStyles.small,
              ),
              trailing: Text(entryMap['paymentMethod'] ?? '', style: AppTextStyles.small),
            );
          }),
        ],
      ),
    );
  }
}

class _FeaturedTab extends StatelessWidget {
  const _FeaturedTab({
    required this.courses,
    required this.category,
    required this.categories,
    required this.onCategoryChanged,
  });

  final List<CourseModel> courses;
  final String category;
  final List<String> categories;
  final ValueChanged<String> onCategoryChanged;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final enrolledCourses = courses.where((course) => app.learningCourseIds.contains(course.id)).toList();
    final categoryCourses = courses.where((course) => course.category.toLowerCase().contains(category.toLowerCase())).toList();
    final recommended = (categoryCourses.isEmpty ? courses : categoryCourses).take(8).toList();
    final topRated = [...courses]
      ..sort((a, b) => (b.teacher.averageRating == 0 ? 4.8 : b.teacher.averageRating).compareTo(a.teacher.averageRating == 0 ? 4.8 : a.teacher.averageRating));
    final freeCourses = courses.where((course) => course.price <= 0).toList();
    final newReleases = courses.reversed.take(8).toList();
    final teachers = _popularTeachers(courses);

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 28),
      children: [
        const _HomeHeader(),
        const SizedBox(height: AppSpacing.lg),
        const _HomeSearchBar(),
        const SizedBox(height: AppSpacing.md),
        _CategoryRow(categories: categories, selected: category, onChanged: onCategoryChanged),
        const SizedBox(height: AppSpacing.lg),
        const SectionTitle('Continue Learning'),
        const SizedBox(height: AppSpacing.md),
        if (enrolledCourses.isEmpty)
          _ContinueLearningPlaceholder(courses: recommended.isEmpty ? courses : recommended)
        else
          _ContinueLearningStrip(courses: enrolledCourses),
        const SizedBox(height: AppSpacing.xl),
        const SectionTitle('Recommended for you'),
        const SizedBox(height: AppSpacing.md),
        _HorizontalCourseList(courses: recommended.isEmpty ? courses : recommended),
        const SizedBox(height: AppSpacing.xl),
        const SectionTitle('Top rated courses'),
        const SizedBox(height: AppSpacing.md),
        _HorizontalCourseList(courses: topRated.take(8).toList(), badge: 'Highest Rated'),
        const SizedBox(height: AppSpacing.xl),
        const SectionTitle('Popular teachers'),
        const SizedBox(height: AppSpacing.md),
        _TeacherStrip(teachers: teachers),
        const SizedBox(height: AppSpacing.xl),
        const SectionTitle('Free courses'),
        const SizedBox(height: AppSpacing.md),
        _HorizontalCourseList(courses: freeCourses.isEmpty ? courses.take(4).toList() : freeCourses, badge: 'FREE'),
        const SizedBox(height: AppSpacing.xl),
        const SectionTitle('New releases'),
        const SizedBox(height: AppSpacing.md),
        _HorizontalCourseList(courses: newReleases.isEmpty ? courses : newReleases, badge: 'New'),
      ],
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader();

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppState>().currentUser;

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Quran Learning', style: AppTextStyles.appBarTitle),
              const SizedBox(height: 5),
              Text('What do you want to learn today?', style: AppTextStyles.body),
            ],
          ),
        ),
        IconButton(
          tooltip: 'Notifications',
          onPressed: () {},
          style: IconButton.styleFrom(
            backgroundColor: AppColors.inputBackground,
            foregroundColor: AppColors.textDark,
            fixedSize: const Size(44, 44),
          ),
          icon: const Icon(Icons.notifications_none),
        ),
        const SizedBox(width: AppSpacing.xs),
        CircleAvatar(
          radius: 22,
          backgroundColor: AppColors.greenSoft,
          foregroundColor: AppColors.green,
          child: Text((user?.fullName.isNotEmpty ?? false) ? user!.fullName[0].toUpperCase() : 'U'),
        ),
      ],
    );
  }
}

class _HomeSearchBar extends StatelessWidget {
  const _HomeSearchBar();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search for Quran, Tajweed, Hifz...',
              prefixIcon: Icon(Icons.search, color: AppColors.textMuted),
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        IconButton(
          tooltip: 'Filter',
          onPressed: () {},
          style: IconButton.styleFrom(
            backgroundColor: AppColors.green,
            foregroundColor: Colors.white,
            fixedSize: const Size(52, 52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          icon: const Icon(Icons.tune),
        ),
      ],
    );
  }
}

class _ContinueLearningStrip extends StatelessWidget {
  const _ContinueLearningStrip({required this.courses});

  final List<CourseModel> courses;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 178,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: courses.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (_, index) => SizedBox(width: 310, child: _ContinueLearningCard(course: courses[index])),
      ),
    );
  }
}

class _ContinueLearningPlaceholder extends StatelessWidget {
  const _ContinueLearningPlaceholder({required this.courses});

  final List<CourseModel> courses;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return const EmptyState(message: 'Your enrolled courses will appear here.', icon: Icons.play_circle_outline);
    }
    return _ContinueLearningStrip(courses: courses.take(2).toList());
  }
}

class _ContinueLearningCard extends StatelessWidget {
  const _ContinueLearningCard({required this.course});

  final CourseModel course;

  @override
  Widget build(BuildContext context) {
    final progress = course.lessons.isEmpty ? 0.32 : (1 / course.lessons.length).clamp(0.18, 0.82).toDouble();

    return InkWell(
      borderRadius: BorderRadius.circular(20),
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CourseDetailScreen(course: course))),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: _cardDecoration(),
        child: Row(
          children: [
            Container(
              width: 92,
              height: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: const LinearGradient(colors: [Color(0xFFE8F7EE), Color(0xFFCFF3DB)]),
              ),
              clipBehavior: Clip.antiAlias,
              child: (course.coverImageUrl ?? '').isEmpty
                  ? const Icon(Icons.menu_book_rounded, color: AppColors.green, size: 38)
                  : Image.network(ApiService.mediaUrl(course.coverImageUrl!), fit: BoxFit.cover),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(course.courseName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text(course.teacher.fullName, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTextStyles.small),
                  const Spacer(),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(999),
                    child: LinearProgressIndicator(
                      minHeight: 7,
                      value: progress,
                      backgroundColor: AppColors.inputBackground,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.green),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  SizedBox(
                    height: 38,
                    child: FilledButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CourseDetailScreen(course: course))),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.green,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Continue', style: TextStyle(fontWeight: FontWeight.w900)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TeacherStrip extends StatelessWidget {
  const _TeacherStrip({required this.teachers});

  final List<_TeacherSummary> teachers;

  @override
  Widget build(BuildContext context) {
    if (teachers.isEmpty) {
      return const EmptyState(message: 'Popular teachers will appear here.', icon: Icons.school_outlined);
    }

    return SizedBox(
      height: 132,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: teachers.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (_, index) {
          final teacher = teachers[index];
          return Container(
            width: 158,
            padding: const EdgeInsets.all(14),
            decoration: _cardDecoration(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.greenSoft,
                  foregroundColor: AppColors.green,
                  child: Text(teacher.name.isNotEmpty ? teacher.name[0].toUpperCase() : 'T'),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(teacher.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
                const SizedBox(height: 3),
                Row(
                  children: [
                    const Icon(Icons.star_rounded, color: AppColors.warning, size: 16),
                    Text(' ${teacher.rating.toStringAsFixed(1)}', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 12)),
                    Expanded(child: Text(' • ${teacher.students} students', overflow: TextOverflow.ellipsis, style: AppTextStyles.small)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

List<_TeacherSummary> _popularTeachers(List<CourseModel> courses) {
  final summaries = <String, _TeacherSummary>{};
  for (final course in courses) {
    final current = summaries[course.teacher.id];
    final students = current?.students ?? 0;
    summaries[course.teacher.id] = _TeacherSummary(
      name: course.teacher.fullName,
      rating: course.teacher.averageRating == 0 ? 4.8 : course.teacher.averageRating,
      students: students + course.lessons.length + 1,
    );
  }
  final list = summaries.values.toList()..sort((a, b) => b.rating.compareTo(a.rating));
  return list.take(8).toList();
}

class _TeacherSummary {
  const _TeacherSummary({required this.name, required this.rating, required this.students});

  final String name;
  final double rating;
  final int students;
}

class _SearchTab extends StatelessWidget {
  const _SearchTab({
    required this.courses,
    required this.search,
    required this.category,
    required this.categories,
    required this.onSearchChanged,
    required this.onCategoryChanged,
  });

  final List<CourseModel> courses;
  final String search;
  final String category;
  final List<String> categories;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onCategoryChanged;

  @override
  Widget build(BuildContext context) {
    final query = search.toLowerCase();
    final results = courses.where((course) {
      final matchesText = query.isEmpty ||
          course.courseName.toLowerCase().contains(query) ||
          course.teacher.fullName.toLowerCase().contains(query) ||
          course.category.toLowerCase().contains(query);
      final matchesCategory = category.isEmpty || course.category.toLowerCase().contains(category.toLowerCase());
      return matchesText && matchesCategory;
    }).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        TextField(
          onChanged: onSearchChanged,
          style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600),
          decoration: const InputDecoration(
            hintText: 'Search Quran, Tajweed, Hifz...',
            prefixIcon: Icon(Icons.search, color: AppColors.textMuted),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _CategoryRow(categories: categories, selected: category, onChanged: onCategoryChanged),
        const SizedBox(height: AppSpacing.lg),
        if (results.isEmpty)
          const EmptyState(message: 'No courses match your search', icon: Icons.search_off)
        else
          _CourseGrid(courses: results),
      ],
    );
  }
}

class _MyLearningTab extends StatelessWidget {
  const _MyLearningTab({required this.courses});

  final List<CourseModel> courses;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const SectionTitle('My Learning'),
        const SizedBox(height: AppSpacing.md),
        if (courses.isEmpty)
          const EmptyState(message: 'You have not enrolled in any course yet', icon: Icons.play_circle_outline)
        else
          ...courses.map((course) => _LearningCard(course: course)),
      ],
    );
  }
}

class _LearningCard extends StatelessWidget {
  const _LearningCard({required this.course});

  final CourseModel course;

  @override
  Widget build(BuildContext context) {
    final progress = course.lessons.isEmpty ? 0.35 : (1 / course.lessons.length).clamp(0.18, 0.85).toDouble();

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(course.courseName, style: const TextStyle(color: AppColors.textDark, fontSize: 17, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(course.teacher.fullName, style: AppTextStyles.small),
          const SizedBox(height: AppSpacing.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 8,
              value: progress,
              backgroundColor: AppColors.inputBackground,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.green),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          PrimaryButton(
            label: 'Continue',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => CourseDetailScreen(course: course)),
            ),
          ),
        ],
      ),
    );
  }
}

class _CourseCollectionTab extends StatelessWidget {
  const _CourseCollectionTab({
    required this.title,
    required this.emptyMessage,
    required this.icon,
    required this.courses,
  });

  final String title;
  final String emptyMessage;
  final IconData icon;
  final List<CourseModel> courses;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        SectionTitle(title),
        const SizedBox(height: AppSpacing.md),
        if (courses.isEmpty) EmptyState(message: emptyMessage, icon: icon) else _CourseGrid(courses: courses),
      ],
    );
  }
}

class _SettingsTab extends StatelessWidget {
  const _SettingsTab();

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
            backgroundImage: (user?.profileImageUrl ?? '').isEmpty ? null : NetworkImage(ApiService.mediaUrl(user!.profileImageUrl!)),
            child: (user?.profileImageUrl ?? '').isEmpty ? const Icon(Icons.person_outline, size: 42) : null,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Center(
          child: Text(
            user?.fullName ?? 'Student',
            style: const TextStyle(color: AppColors.textDark, fontSize: 19, fontWeight: FontWeight.w900),
          ),
        ),
        Center(child: Text(user?.role ?? 'student', style: AppTextStyles.body)),
        const SizedBox(height: AppSpacing.xl),
        SettingTile(
          icon: Icons.edit_outlined,
          title: 'Edit profile',
          subtitle: 'Change profile image and name',
          onTap: () => _showEditProfileDialog(context),
        ),
        SettingTile(
          icon: Icons.lock_outline,
          title: 'Change password',
          subtitle: 'Update your account password',
          onTap: () => _showChangePasswordDialog(context),
        ),
        SettingTile(
          icon: Icons.dark_mode_outlined,
          title: 'Dark mode',
          subtitle: 'Change app appearance',
          trailing: Switch(
            value: app.darkMode,
            activeThumbColor: AppColors.green,
            onChanged: app.setDarkMode,
          ),
        ),
        SettingTile(
          icon: Icons.logout,
          title: 'Logout',
          subtitle: 'Sign out from this account',
          onTap: app.logout,
        ),
      ],
    );
  }

  Future<void> _showEditProfileDialog(BuildContext context) async {
    final app = context.read<AppState>();
    final name = TextEditingController(text: app.currentUser?.fullName ?? '');
    var imageUrl = app.currentUser?.profileImageUrl ?? '';
    String? selectedImageName = imageUrl.isEmpty ? null : imageUrl.split('/').last;
    Uint8List? selectedImageBytes;

    await showDialog<void>(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (dialogContext, setDialogState) => AlertDialog(
          title: const Text('Edit profile'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: name, decoration: const InputDecoration(labelText: 'Name')),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton.icon(
                onPressed: () async {
                  final result = await FilePicker.platform.pickFiles(type: FileType.image, withData: true);
                  final file = result?.files.single;
                  if (file == null || file.bytes == null) return;
                  setDialogState(() {
                    selectedImageName = file.name;
                    selectedImageBytes = file.bytes;
                    imageUrl = '';
                  });
                },
                icon: const Icon(Icons.upload_file),
                label: Text(selectedImageName == null ? 'Choose profile image' : selectedImageName!),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            FilledButton(
              onPressed: () async {
                var profileImageUrl = imageUrl;
                if (selectedImageBytes != null && selectedImageName != null) {
                  profileImageUrl = await app.uploadImage(selectedImageName!, base64Encode(selectedImageBytes!));
                }
                await app.updateProfile(name.text.trim(), profileImageUrl);
                if (context.mounted) Navigator.pop(context);
              },
              child: const Text('Save'),
            ),
          ],
        ),
      ),
    );
    name.dispose();
  }

  Future<void> _showChangePasswordDialog(BuildContext context) async {
    final app = context.read<AppState>();
    final current = TextEditingController();
    final next = TextEditingController();

    await showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Change password'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: current, obscureText: true, decoration: const InputDecoration(labelText: 'Current password')),
            const SizedBox(height: AppSpacing.sm),
            TextField(controller: next, obscureText: true, decoration: const InputDecoration(labelText: 'New password')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              await app.changePassword(current.text, next.text);
              if (!context.mounted) return;
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password changed')));
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    current.dispose();
    next.dispose();
  }
}

class _CategoryRow extends StatelessWidget {
  const _CategoryRow({
    required this.categories,
    required this.selected,
    required this.onChanged,
  });

  final List<String> categories;
  final String selected;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, index) {
          final category = categories[index];
          return CategoryChip(
            label: category,
            selected: selected == category,
            onTap: () => onChanged(category),
          );
        },
      ),
    );
  }
}

class _HorizontalCourseList extends StatelessWidget {
  const _HorizontalCourseList({required this.courses, this.badge});

  final List<CourseModel> courses;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return const EmptyState(message: 'No courses found yet.');
    }

    return SizedBox(
      height: 312,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: courses.length,
        separatorBuilder: (_, __) => const SizedBox(width: 16),
        itemBuilder: (_, index) => SizedBox(
          width: 236,
          child: CourseCard(course: courses[index], badge: badge),
        ),
      ),
    );
  }
}

class _CourseGrid extends StatelessWidget {
  const _CourseGrid({required this.courses});

  final List<CourseModel> courses;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth >= 720 ? 3 : 2;
        return GridView.builder(
          itemCount: courses.length,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 14,
            mainAxisSpacing: 16,
            childAspectRatio: 0.58,
          ),
          itemBuilder: (_, index) => CourseCard(course: courses[index]),
        );
      },
    );
  }
}

BoxDecoration _cardDecoration() {
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
