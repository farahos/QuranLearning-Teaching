import 'dart:convert';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
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

    final pages = isTeacher ? [
      const TeacherToolsScreen(embedded: true),
      _SearchTab(
        courses: app.courses,
        search: _search,
        onChanged: (value) => setState(() => _search = value),
      ),
      const _TeacherStudentsTab(),
      const _SettingsTab(),
    ] : [
      _FeaturedTab(courses: app.courses),
      _SearchTab(
        courses: app.courses,
        search: _search,
        onChanged: (value) => setState(() => _search = value),
      ),
      _CourseCollectionTab(
        title: 'My learning',
        emptyMessage: 'Courses you pay for will appear here.',
        courses: app.courses.where((course) => app.learningCourseIds.contains(course.id)).toList(),
      ),
      _CourseCollectionTab(
        title: 'Favorite',
        emptyMessage: 'Tap the heart on a course to save it here.',
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
            NavigationDestination(icon: Icon(Icons.play_circle_outline), selectedIcon: Icon(Icons.play_circle), label: 'My learning'),
            NavigationDestination(icon: Icon(Icons.favorite_border), selectedIcon: Icon(Icons.favorite), label: 'Favorite'),
            NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Setting'),
          ];

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        backgroundColor: const Color(0xFF050505),
        foregroundColor: Colors.white,
        title: const Text('Quran Learning'),
      ),
      body: isTeacher
          ? pages[selectedIndex]
          : RefreshIndicator(
              onRefresh: app.fetchCourses,
              child: pages[selectedIndex],
            ),
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          backgroundColor: Colors.black,
          indicatorColor: Colors.white.withOpacity(0.12),
          labelTextStyle: MaterialStateProperty.resolveWith(
            (states) => TextStyle(
              color: states.contains(MaterialState.selected) ? Colors.white : Colors.white54,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          iconTheme: MaterialStateProperty.resolveWith(
            (states) => IconThemeData(
              color: states.contains(MaterialState.selected) ? Colors.white : Colors.white54,
            ),
          ),
        ),
        child: NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: (index) => setState(() => _tabIndex = index),
          destinations: destinations,
        ),
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
    final totalStudents = courses.fold<int>(0, (sum, course) => sum + ((course['enrolledStudents'] ?? []) as List).length);

    return RefreshIndicator(
      onRefresh: app.fetchTeacherStudents,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
        children: [
          const _SectionTitle(title: 'Students'),
          const SizedBox(height: 8),
          Text('$totalStudents students bought your courses', style: const TextStyle(color: Colors.white60, fontWeight: FontWeight.w600)),
          const SizedBox(height: 18),
          if (totalStudents == 0)
            const _EmptyPanel(message: 'Students who buy your courses will appear here.')
          else
            ...courses.map((course) {
              final students = (course['enrolledStudents'] ?? []) as List;
              if (students.isEmpty) return const SizedBox.shrink();
              return _TeacherStudentCourseGroup(courseName: course['courseName'] ?? 'Course', students: students);
            }),
        ],
      ),
    );
  }
}

class _TeacherStudentCourseGroup extends StatelessWidget {
  final String courseName;
  final List students;

  const _TeacherStudentCourseGroup({required this.courseName, required this.students});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(courseName, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900)),
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
                backgroundColor: const Color(0xFF1B5E20),
                backgroundImage: image.isEmpty ? null : NetworkImage(ApiService.mediaUrl(image)),
                child: image.isEmpty ? const Icon(Icons.person_outline, color: Colors.white) : null,
              ),
              title: Text(student['fullName'] ?? 'Student', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
              subtitle: Text(
                '$email${purchasedDate.isEmpty ? '' : '\nPurchased: $purchasedDate'}',
                style: const TextStyle(color: Colors.white60),
              ),
              trailing: Text(entryMap['paymentMethod'] ?? '', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            );
          }),
        ],
      ),
    );
  }
}

class _FeaturedTab extends StatelessWidget {
  final List<CourseModel> courses;

  const _FeaturedTab({required this.courses});

  @override
  Widget build(BuildContext context) {
    final featured = courses.take(6).toList();
    final shortCourses = courses.skip(1).take(6).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        const _CategoryRow(),
        const SizedBox(height: 24),
        _SectionTitle(title: featured.isEmpty ? 'Start learning Quran today' : 'Because you enrolled in Quran learning'),
        const SizedBox(height: 12),
        _HorizontalCourseList(courses: featured.isEmpty ? courses : featured),
        const SizedBox(height: 28),
        const _SectionTitle(title: 'Short and sweet courses for you'),
        const SizedBox(height: 12),
        _HorizontalCourseList(courses: shortCourses.isEmpty ? courses : shortCourses, compact: true),
      ],
    );
  }
}

class _SearchTab extends StatelessWidget {
  final List<CourseModel> courses;
  final String search;
  final ValueChanged<String> onChanged;

  const _SearchTab({required this.courses, required this.search, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final results = courses.where((course) {
      final query = search.toLowerCase();
      return course.courseName.toLowerCase().contains(query) ||
          course.teacher.fullName.toLowerCase().contains(query) ||
          course.category.toLowerCase().contains(query);
    }).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        TextField(
          onChanged: onChanged,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Search Quran, Tajweed, Hifz...',
            hintStyle: const TextStyle(color: Colors.white54),
            prefixIcon: const Icon(Icons.search, color: Colors.white70),
            filled: true,
            fillColor: const Color(0xFF171717),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
          ),
        ),
        const SizedBox(height: 18),
        _CourseGrid(courses: results),
      ],
    );
  }
}

class _CourseCollectionTab extends StatelessWidget {
  final String title;
  final String emptyMessage;
  final List<CourseModel> courses;

  const _CourseCollectionTab({required this.title, required this.emptyMessage, required this.courses});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      children: [
        _SectionTitle(title: title),
        const SizedBox(height: 14),
        if (courses.isEmpty)
          _EmptyPanel(message: emptyMessage)
        else
          _CourseGrid(courses: courses),
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
        const _SectionTitle(title: 'Setting'),
        const SizedBox(height: 16),
        Center(
          child: CircleAvatar(
            radius: 44,
            backgroundImage: (user?.profileImageUrl ?? '').isEmpty ? null : NetworkImage(ApiService.mediaUrl(user!.profileImageUrl!)),
            child: (user?.profileImageUrl ?? '').isEmpty ? const Icon(Icons.person_outline, size: 38) : null,
          ),
        ),
        const SizedBox(height: 12),
        Center(
          child: Text(user?.fullName ?? 'Student', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
        ),
        Center(
          child: Text(user?.role ?? 'student', style: const TextStyle(color: Colors.white60)),
        ),
        const SizedBox(height: 22),
        _SettingsTile(
          icon: Icons.edit_outlined,
          title: 'Edit profile',
          subtitle: 'Change profile image and name',
          onTap: () => _showEditProfileDialog(context),
        ),
        _SettingsTile(
          icon: Icons.lock_outline,
          title: 'Change password',
          subtitle: 'Update your account password',
          onTap: () => _showChangePasswordDialog(context),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          secondary: const CircleAvatar(
            backgroundColor: Color(0xFF171717),
            foregroundColor: Colors.white,
            child: Icon(Icons.dark_mode_outlined),
          ),
          title: const Text('Dark mode', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
          subtitle: const Text('Change app appearance', style: TextStyle(color: Colors.white60)),
          value: app.darkMode,
          onChanged: app.setDarkMode,
        ),
        _SettingsTile(
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
              const SizedBox(height: 12),
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
  const _CategoryRow();

  @override
  Widget build(BuildContext context) {
    const categories = ['Quran', 'Tajweed', 'Hifz', 'Arabic', 'Kids'];
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, index) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 18),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white70),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Text(categories[index], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(color: Colors.white, fontSize: 28, height: 1.15, fontWeight: FontWeight.w900),
    );
  }
}

class _HorizontalCourseList extends StatelessWidget {
  final List<CourseModel> courses;
  final bool compact;

  const _HorizontalCourseList({required this.courses, this.compact = false});

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return const _EmptyPanel(message: 'No courses found yet.');
    }

    return SizedBox(
      height: compact ? 240 : 305,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: courses.length,
        separatorBuilder: (_, __) => const SizedBox(width: 18),
        itemBuilder: (_, index) => SizedBox(
          width: 230,
          child: _CourseCard(course: courses[index], compact: compact),
        ),
      ),
    );
  }
}

class _CourseGrid extends StatelessWidget {
  final List<CourseModel> courses;

  const _CourseGrid({required this.courses});

  @override
  Widget build(BuildContext context) {
    if (courses.isEmpty) {
      return const _EmptyPanel(message: 'No courses match this view.');
    }

    return GridView.builder(
      itemCount: courses.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 18,
        childAspectRatio: 0.58,
      ),
      itemBuilder: (_, index) => _CourseCard(course: courses[index]),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final CourseModel course;
  final bool compact;

  const _CourseCard({required this.course, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isTeacher = app.currentUser?.role == 'teacher';
    final isFavorite = app.favoriteCourseIds.contains(course.id);
    final rating = course.teacher.averageRating == 0 ? 4.8 : course.teacher.averageRating;

    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CourseDetailScreen(course: course))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(
              children: [
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1B7F79), Color(0xFF232323)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: (course.coverImageUrl ?? '').isEmpty
                      ? const Center(child: Icon(Icons.menu_book_rounded, color: Colors.white, size: 46))
                      : Image.network(ApiService.mediaUrl(course.coverImageUrl!), fit: BoxFit.cover),
                ),
                if (!isTeacher)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: IconButton.filledTonal(
                      constraints: const BoxConstraints.tightFor(width: 38, height: 38),
                      padding: EdgeInsets.zero,
                      icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, size: 20),
                      onPressed: () => app.toggleFavorite(course.id),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          Text(
            course.courseName,
            maxLines: compact ? 2 : 3,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 17, height: 1.15, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 6),
          Text(
            course.teacher.fullName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text(rating.toStringAsFixed(1), style: const TextStyle(color: Color(0xFFF2A900), fontWeight: FontWeight.w800)),
              const SizedBox(width: 4),
              const Icon(Icons.star, color: Color(0xFFF2A900), size: 16),
              const SizedBox(width: 4),
              Text('(${course.teacher.totalReviews})', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 8),
          Text('\$${course.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900)),
          if (!compact && rating >= 4.7) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(color: const Color(0xFFEFC47F), borderRadius: BorderRadius.circular(4)),
              child: const Text('Highest Rated', style: TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.w900)),
            ),
          ],
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  const _SettingsTile({required this.icon, required this.title, required this.subtitle, this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 4),
      leading: CircleAvatar(
        backgroundColor: const Color(0xFF171717),
        foregroundColor: Colors.white,
        child: Icon(icon),
      ),
      title: Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.white60)),
      trailing: onTap == null ? null : const Icon(Icons.chevron_right, color: Colors.white70),
      onTap: onTap,
    );
  }
}

class _EmptyPanel extends StatelessWidget {
  final String message;

  const _EmptyPanel({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: const Color(0xFF171717), borderRadius: BorderRadius.circular(8)),
      child: Text(message, style: const TextStyle(color: Colors.white70)),
    );
  }
}
