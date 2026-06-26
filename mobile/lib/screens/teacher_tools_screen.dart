import 'dart:convert';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';

class TeacherToolsScreen extends StatefulWidget {
  final bool embedded;

  const TeacherToolsScreen({super.key, this.embedded = false});

  @override
  State<TeacherToolsScreen> createState() => _TeacherToolsScreenState();
}

class _TeacherToolsScreenState extends State<TeacherToolsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<AppState>().fetchCourses());
  }

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final teacher = app.currentUser;
    final myCourses = app.courses.where((course) => course.teacher.id == teacher?.id).toList();
    final totalValue = myCourses.fold<double>(0, (sum, course) => sum + course.price);
    final avgRating = teacher?.averageRating ?? 0;

    final content = RefreshIndicator(
      onRefresh: app.fetchCourses,
      child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 31,
                  backgroundColor: const Color(0xFF1B5E20),
                  backgroundImage: (teacher?.profileImageUrl ?? '').isEmpty ? null : NetworkImage(ApiService.mediaUrl(teacher!.profileImageUrl!)),
                  child: (teacher?.profileImageUrl ?? '').isEmpty ? const Icon(Icons.school_outlined, color: Colors.white, size: 30) : null,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        teacher?.fullName ?? 'Teacher',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${myCourses.length} courses published',
                        style: const TextStyle(color: Colors.white60, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),
            Row(
              children: [
                Expanded(child: _MetricCard(label: 'Courses', value: myCourses.length.toString(), icon: Icons.video_library_outlined)),
                const SizedBox(width: 10),
                Expanded(child: _MetricCard(label: 'Rating', value: avgRating == 0 ? 'New' : avgRating.toStringAsFixed(1), icon: Icons.star_outline)),
                const SizedBox(width: 10),
                Expanded(child: _MetricCard(label: 'Catalog', value: '\$${totalValue.toStringAsFixed(0)}', icon: Icons.payments_outlined)),
              ],
            ),
            const SizedBox(height: 26),
            _ActionPanel(
              title: 'Create your next Quran course',
              subtitle: 'Add course title, description, price, category and intro video.',
              buttonText: 'Create course',
              icon: Icons.movie_creation_outlined,
              onPressed: () => _openCourseEditor(context),
            ),
            const SizedBox(height: 24),
            const _TeacherSectionTitle('Course management'),
            const SizedBox(height: 12),
            if (myCourses.isEmpty)
              _EmptyInstructorState(onCreate: () => _openCourseEditor(context))
            else
              ...myCourses.map(
                (course) => _InstructorCourseCard(
                  course: course,
                  onEdit: () => _openCourseEditor(context, course: course),
                  onDelete: () => _confirmDelete(context, app, course),
                ),
              ),
          ],
        ),
    );

    if (widget.embedded) {
      return content;
    }

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        backgroundColor: const Color(0xFF050505),
        foregroundColor: Colors.white,
        title: const Text('Instructor'),
        actions: [
          IconButton(
            tooltip: 'Create course',
            onPressed: () => _openCourseEditor(context),
            icon: const Icon(Icons.add_circle_outline),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openCourseEditor(context),
        icon: const Icon(Icons.add),
        label: const Text('New course'),
      ),
      body: content,
    );
  }

  Future<void> _openCourseEditor(BuildContext context, {CourseModel? course}) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111111),
      builder: (_) => _CourseEditorSheet(course: course),
    );
  }

  Future<void> _confirmDelete(BuildContext context, AppState app, CourseModel course) async {
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

    if (confirmed != true) return;

    await app.deleteCourse(course.id);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Course deleted')));
  }
}

class _CourseEditorSheet extends StatefulWidget {
  final CourseModel? course;

  const _CourseEditorSheet({this.course});

  @override
  State<_CourseEditorSheet> createState() => _CourseEditorSheetState();
}

class _CourseEditorSheetState extends State<_CourseEditorSheet> {
  late final TextEditingController name;
  late final TextEditingController desc;
  late final TextEditingController price;
  late final TextEditingController category;
  late final List<_LessonDraft> lessons;
  String coverImageUrl = '';
  String? selectedCoverName;
  Uint8List? selectedCoverBytes;
  bool saving = false;

  @override
  void initState() {
    super.initState();
    final course = widget.course;
    name = TextEditingController(text: course?.courseName ?? '');
    desc = TextEditingController(text: course?.description ?? '');
    price = TextEditingController(text: course == null ? '' : course.price.toStringAsFixed(2));
    category = TextEditingController(text: course?.category ?? 'Quran');
    coverImageUrl = course?.coverImageUrl ?? '';
    selectedCoverName = coverImageUrl.isEmpty ? null : coverImageUrl.split('/').last;
    lessons = course == null || course.lessons.isEmpty
        ? [_LessonDraft()]
        : course.lessons.map((lesson) => _LessonDraft(title: lesson.title, videoUrl: lesson.videoUrl)).toList();
  }

  @override
  void dispose() {
    name.dispose();
    desc.dispose();
    price.dispose();
    category.dispose();
    for (final lesson in lessons) {
      lesson.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.course != null;

    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
      child: ListView(
        shrinkWrap: true,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  isEditing ? 'Edit course' : 'Create course',
                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900),
                ),
              ),
              IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 12),
          _DarkField(controller: name, label: 'Course name'),
          const SizedBox(height: 10),
          _DarkField(controller: desc, label: 'Description', minLines: 3, maxLines: 5),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _DarkField(controller: price, label: 'Price', keyboardType: TextInputType.number)),
              const SizedBox(width: 10),
              Expanded(child: _DarkField(controller: category, label: 'Category')),
            ],
          ),
          const SizedBox(height: 10),
          _ImageUploadBox(
            title: 'Course cover image',
            fileName: selectedCoverName,
            hasExistingImage: coverImageUrl.isNotEmpty && selectedCoverBytes == null,
            onPick: _pickCoverImage,
            onClear: () => setState(() {
              coverImageUrl = '';
              selectedCoverName = null;
              selectedCoverBytes = null;
            }),
          ),
          const SizedBox(height: 10),
          const Text('Lessons', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
          const SizedBox(height: 8),
          ...lessons.asMap().entries.map((entry) {
            final index = entry.key;
            final lesson = entry.value;
            return _LessonEditorCard(
              index: index,
              lesson: lesson,
              canRemove: lessons.length > 1,
              onPick: () => _pickLessonVideo(index),
              onClear: () => setState(() => lesson.clearVideo()),
              onRemove: () => setState(() => lessons.removeAt(index).dispose()),
            );
          }),
          OutlinedButton.icon(
            onPressed: () => setState(() => lessons.add(_LessonDraft())),
            icon: const Icon(Icons.add),
            label: const Text('Add lesson'),
          ),
          const SizedBox(height: 14),
          FilledButton.icon(
            onPressed: saving ? null : _saveCourse,
            icon: Icon(isEditing ? Icons.save_outlined : Icons.add),
            label: Text(saving ? 'Saving...' : isEditing ? 'Update course' : 'Publish course'),
          ),
        ],
      ),
    );
  }

  Future<void> _saveCourse() async {
    final app = context.read<AppState>();
    final parsedPrice = double.tryParse(price.text.trim()) ?? 0;
    setState(() => saving = true);
    try {
      var uploadedCoverImageUrl = coverImageUrl;
      if (selectedCoverBytes != null && selectedCoverName != null) {
        uploadedCoverImageUrl = await app.uploadImage(selectedCoverName!, base64Encode(selectedCoverBytes!));
      }

      final lessonPayload = <Map<String, String>>[];
      for (var i = 0; i < lessons.length; i++) {
        final lesson = lessons[i];
        var videoUrl = lesson.videoUrl;
        if (lesson.selectedVideoBytes != null && lesson.selectedVideoName != null) {
          videoUrl = await app.uploadCourseVideo(lesson.selectedVideoName!, base64Encode(lesson.selectedVideoBytes!));
        }
        if (lesson.title.text.trim().isNotEmpty && videoUrl.isNotEmpty) {
          lessonPayload.add({
            'title': lesson.title.text.trim(),
            'videoUrl': videoUrl,
          });
        }
      }
      final courseVideoUrl = lessonPayload.isEmpty ? '' : lessonPayload.first['videoUrl']!;

      if (widget.course == null) {
        await app.createCourse(name.text.trim(), desc.text.trim(), parsedPrice, category.text.trim(), courseVideoUrl, 0.2, coverImageUrl: uploadedCoverImageUrl, lessons: lessonPayload);
      } else {
        await app.updateCourse(widget.course!.id, name.text.trim(), desc.text.trim(), parsedPrice, category.text.trim(), courseVideoUrl, 0.2, coverImageUrl: uploadedCoverImageUrl, lessons: lessonPayload);
      }
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.course == null ? 'Course published' : 'Course updated')));
    } catch (err) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.toString())));
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  Future<void> _pickLessonVideo(int index) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.video,
      withData: true,
    );
    final file = result?.files.single;
    if (file == null || file.bytes == null) return;
    setState(() {
      lessons[index].selectedVideoName = file.name;
      lessons[index].selectedVideoBytes = file.bytes;
      lessons[index].videoUrl = '';
    });
  }

  Future<void> _pickCoverImage() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );
    final file = result?.files.single;
    if (file == null || file.bytes == null) return;
    setState(() {
      selectedCoverName = file.name;
      selectedCoverBytes = file.bytes;
      coverImageUrl = '';
    });
  }
}

class _LessonDraft {
  final TextEditingController title;
  String videoUrl;
  String? selectedVideoName;
  Uint8List? selectedVideoBytes;

  _LessonDraft({String title = '', this.videoUrl = ''}) : title = TextEditingController(text: title) {
    selectedVideoName = videoUrl.isEmpty ? null : videoUrl.split('/').last;
  }

  void clearVideo() {
    videoUrl = '';
    selectedVideoName = null;
    selectedVideoBytes = null;
  }

  void dispose() {
    title.dispose();
  }
}

class _ImageUploadBox extends StatelessWidget {
  final String title;
  final String? fileName;
  final bool hasExistingImage;
  final VoidCallback onPick;
  final VoidCallback onClear;

  const _ImageUploadBox({
    required this.title,
    required this.fileName,
    required this.hasExistingImage,
    required this.onPick,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    final hasImage = (fileName ?? '').isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1D1D1D),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: hasImage ? const Color(0xFF86D083) : Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          Row(
            children: [
              CircleAvatar(
                backgroundColor: hasImage ? const Color(0xFF1B5E20) : const Color(0xFF2A2A2A),
                foregroundColor: Colors.white,
                child: Icon(hasImage ? Icons.check : Icons.image_outlined),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hasImage ? fileName! : 'Choose file',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      hasExistingImage ? 'Current uploaded image' : 'Upload JPG, PNG, or WEBP',
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onPick,
                  icon: Icon(hasImage ? Icons.swap_horiz : Icons.upload_file),
                  label: Text(hasImage ? 'Replace file' : 'Choose file'),
                ),
              ),
              if (hasImage) ...[
                const SizedBox(width: 10),
                IconButton.filledTonal(
                  tooltip: 'Remove image',
                  onPressed: onClear,
                  icon: const Icon(Icons.delete_outline),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _LessonEditorCard extends StatelessWidget {
  final int index;
  final _LessonDraft lesson;
  final bool canRemove;
  final VoidCallback onPick;
  final VoidCallback onClear;
  final VoidCallback onRemove;

  const _LessonEditorCard({
    required this.index,
    required this.lesson,
    required this.canRemove,
    required this.onPick,
    required this.onClear,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final fileName = lesson.selectedVideoName;
    final hasVideo = (fileName ?? '').isNotEmpty;
    final hasExistingVideo = lesson.videoUrl.isNotEmpty && lesson.selectedVideoBytes == null;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1D1D1D),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: hasVideo ? const Color(0xFF86D083) : Colors.white12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text('Lesson ${index + 1}', style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700)),
              ),
              if (canRemove)
                IconButton(
                  tooltip: 'Remove lesson',
                  onPressed: onRemove,
                  icon: const Icon(Icons.close, color: Colors.white70, size: 18),
                ),
            ],
          ),
          _DarkField(controller: lesson.title, label: 'Lesson title'),
          const SizedBox(height: 10),
          Row(
            children: [
              CircleAvatar(
                backgroundColor: hasVideo ? const Color(0xFF1B5E20) : const Color(0xFF2A2A2A),
                foregroundColor: Colors.white,
                child: Icon(hasVideo ? Icons.check : Icons.video_call_outlined),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      hasVideo ? fileName! : 'Choose file',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      hasExistingVideo ? 'Current lesson video' : 'Upload a video for this lesson',
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onPick,
                  icon: Icon(hasVideo ? Icons.swap_horiz : Icons.upload_file),
                  label: Text(hasVideo ? 'Replace file' : 'Choose file'),
                ),
              ),
              if (hasVideo) ...[
                const SizedBox(width: 10),
                IconButton.filledTonal(
                  tooltip: 'Remove video',
                  onPressed: onClear,
                  icon: const Icon(Icons.delete_outline),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _MetricCard({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(height: 12),
          Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        ],
      ),
    );
  }
}

class _ActionPanel extends StatelessWidget {
  final String title;
  final String subtitle;
  final String buttonText;
  final IconData icon;
  final VoidCallback onPressed;

  const _ActionPanel({required this.title, required this.subtitle, required this.buttonText, required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFF1B5E20),
            foregroundColor: Colors.white,
            child: Icon(icon),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.white60, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          FilledButton(onPressed: onPressed, child: Text(buttonText)),
        ],
      ),
    );
  }
}

class _TeacherSectionTitle extends StatelessWidget {
  final String title;

  const _TeacherSectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900));
  }
}

class _InstructorCourseCard extends StatelessWidget {
  final CourseModel course;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _InstructorCourseCard({required this.course, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 92,
            height: 58,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(6),
              gradient: const LinearGradient(colors: [Color(0xFF1B7F79), Color(0xFF222222)]),
            ),
            clipBehavior: Clip.antiAlias,
            child: (course.coverImageUrl ?? '').isEmpty
                ? const Icon(Icons.menu_book_rounded, color: Colors.white)
                : Image.network(ApiService.mediaUrl(course.coverImageUrl!), fit: BoxFit.cover),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(course.courseName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text(course.category, style: const TextStyle(color: Colors.white60, fontSize: 12)),
                const SizedBox(height: 7),
                Row(
                  children: [
                    Text('\$${course.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                    const SizedBox(width: 10),
                    const Icon(Icons.check_circle, color: Color(0xFF86D083), size: 15),
                    const SizedBox(width: 4),
                    const Text('Published', style: TextStyle(color: Colors.white60, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            color: const Color(0xFF222222),
            icon: const Icon(Icons.more_vert, color: Colors.white),
            onSelected: (value) {
              if (value == 'edit') onEdit();
              if (value == 'delete') onDelete();
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'edit', child: Text('Edit')),
              PopupMenuItem(value: 'delete', child: Text('Delete')),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyInstructorState extends StatelessWidget {
  final VoidCallback onCreate;

  const _EmptyInstructorState({required this.onCreate});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Column(
        children: [
          const Icon(Icons.video_call_outlined, color: Colors.white70, size: 42),
          const SizedBox(height: 10),
          const Text('No courses yet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          const Text('Start by publishing your first Quran course.', textAlign: TextAlign.center, style: TextStyle(color: Colors.white60)),
          const SizedBox(height: 12),
          FilledButton(onPressed: onCreate, child: const Text('Create course')),
        ],
      ),
    );
  }
}

class _DarkField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final int minLines;
  final int maxLines;
  final TextInputType? keyboardType;

  const _DarkField({required this.controller, required this.label, this.minLines = 1, this.maxLines = 1, this.keyboardType});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      minLines: minLines,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      decoration: _darkInputDecoration(label),
    );
  }
}

InputDecoration _darkInputDecoration(String label) {
  return InputDecoration(
    labelText: label,
    labelStyle: const TextStyle(color: Colors.white70),
    filled: true,
    fillColor: const Color(0xFF1D1D1D),
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF86D083))),
  );
}
