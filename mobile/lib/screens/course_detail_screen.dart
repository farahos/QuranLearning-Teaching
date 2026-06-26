import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/primary_button.dart';
import '../widgets/section_title.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key, required this.course});

  final CourseModel course;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  final comment = TextEditingController();
  final paymentPhone = TextEditingController();
  String paymentMethod = 'EVC Plus';
  int rating = 5;

  @override
  void dispose() {
    comment.dispose();
    paymentPhone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final app = context.read<AppState>();
    final c = widget.course;
    final teacher = c.teacher;
    final teacherExperience = (teacher.experience ?? teacher.bio ?? '').trim();
    final ratingText = teacher.averageRating == 0 ? 'New' : teacher.averageRating.toStringAsFixed(1);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        surfaceTintColor: AppColors.surface,
        foregroundColor: AppColors.textDark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      floatingActionButton: FloatingActionButton.small(
        tooltip: 'Message teacher',
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.green,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
          side: const BorderSide(color: AppColors.green),
        ),
        onPressed: () => _contactTeacher(teacher.whatsappNumber),
        child: const Icon(Icons.chat_outlined),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: PrimaryButton(
          label: 'Buy Course',
          onPressed: () => _showCheckout(context, app, c),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          _CourseBanner(course: c),
          const SizedBox(height: AppSpacing.lg),
          Text(c.category, style: const TextStyle(color: AppColors.green, fontWeight: FontWeight.w900)),
          const SizedBox(height: AppSpacing.xs),
          Text(
            c.courseName,
            style: const TextStyle(
              color: AppColors.textDark,
              fontSize: 28,
              fontWeight: FontWeight.w900,
              height: 1.12,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(c.description, style: AppTextStyles.body),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Expanded(child: _StatCard(icon: Icons.star_rounded, label: ratingText, detail: '${teacher.totalReviews} reviews')),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(icon: Icons.play_circle_outline, label: '${c.lessons.length}', detail: 'lessons')),
              const SizedBox(width: 10),
              Expanded(child: _StatCard(icon: Icons.payments_outlined, label: '\$${c.price.toStringAsFixed(2)}', detail: 'price')),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          _InstructorCard(
            name: teacher.fullName,
            imageUrl: teacher.profileImageUrl,
            rating: ratingText,
            reviews: teacher.totalReviews,
            experience: teacherExperience.isEmpty
                ? 'Experienced Quran instructor. Course details and teaching background will appear here when the instructor updates their profile.'
                : teacherExperience,
          ),
          const SizedBox(height: AppSpacing.md),
          _InfoCard(
            title: 'What you will learn',
            child: Text(c.description, style: AppTextStyles.body),
          ),
          const SizedBox(height: AppSpacing.md),
          _InfoCard(
            title: 'Lessons',
            child: c.lessons.isEmpty
                ? const Text('Lessons will appear here after the instructor adds them.', style: AppTextStyles.body)
                : Column(
                    children: c.lessons.asMap().entries.map((entry) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: AppColors.greenSoft,
                          foregroundColor: AppColors.green,
                          child: Text('${entry.key + 1}'),
                        ),
                        title: Text(
                          entry.value.title,
                          style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900),
                        ),
                        subtitle: const Text('Video lesson', style: AppTextStyles.small),
                        trailing: const Icon(Icons.lock_outline, color: AppColors.textMuted),
                      );
                    }).toList(),
                  ),
          ),
          const SizedBox(height: AppSpacing.md),
          _ReviewCard(
            rating: rating,
            comment: comment,
            onRatingChanged: (value) => setState(() => rating = value ?? 5),
            onSubmit: () async {
              await app.addReview(c.id, teacher.id, rating, comment.text.trim());
              if (!context.mounted) return;
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Review submitted')));
            },
          ),
        ],
      ),
    );
  }

  Future<void> _contactTeacher(String? phone) async {
    final uri = Uri.parse('https://wa.me/${phone ?? ''}?text=Assalamu%20Alaikum,%20I%20am%20interested%20in%20your%20Quran%20course.');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _showCheckout(BuildContext context, AppState app, CourseModel course) async {
    var isProcessing = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(16, 18, 16, MediaQuery.of(context).viewInsets.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionTitle('Checkout'),
              const SizedBox(height: AppSpacing.xs),
              Text(course.courseName, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppTextStyles.body),
              const SizedBox(height: AppSpacing.xs),
              Text(
                '\$${course.price.toStringAsFixed(2)}',
                style: const TextStyle(color: AppColors.textDark, fontSize: 18, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: AppSpacing.md),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'EVC Plus', label: Text('EVC')),
                  ButtonSegment(value: 'Zaad', label: Text('Zaad')),
                  ButtonSegment(value: 'Sahal', label: Text('Sahal')),
                ],
                selected: {paymentMethod},
                onSelectionChanged: isProcessing ? null : (value) => setSheetState(() => paymentMethod = value.first),
                style: ButtonStyle(
                  backgroundColor: WidgetStateProperty.resolveWith(
                    (states) => states.contains(WidgetState.selected) ? AppColors.greenSoft : AppColors.surface,
                  ),
                  foregroundColor: WidgetStateProperty.resolveWith(
                    (states) => states.contains(WidgetState.selected) ? AppColors.green : AppColors.textDark,
                  ),
                  side: WidgetStateProperty.resolveWith(
                    (states) => BorderSide(color: states.contains(WidgetState.selected) ? AppColors.green : AppColors.border),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: paymentPhone,
                enabled: !isProcessing,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(labelText: '$paymentMethod phone number'),
              ),
              const SizedBox(height: AppSpacing.md),
              PrimaryButton(
                label: isProcessing ? 'Processing payment' : 'Confirm purchase',
                loading: isProcessing,
                onPressed: isProcessing
                    ? null
                    : () async {
                        if (paymentPhone.text.trim().isEmpty) {
                          final message = 'Fadlan geli number-ka $paymentMethod.';
                          _showPaymentSnack(context, message: message, success: false);
                          return;
                        }

                        setSheetState(() => isProcessing = true);
                        try {
                          await app.buyCourse(course.id, paymentMethod, paymentPhone.text.trim());
                          if (!context.mounted) return;
                          Navigator.pop(sheetContext);
                          _showPaymentSnack(
                            context,
                            success: true,
                            message: 'Lacag bixinta way guuleysatay. Course-ka waa laguu furay.',
                          );
                        } catch (error) {
                          if (!context.mounted) return;
                          final message = _friendlyPaymentMessage(error);
                          setSheetState(() => isProcessing = false);
                          _showPaymentSnack(context, message: message, success: false);
                        }
                      },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

void _showPaymentSnack(BuildContext context, {required String message, required bool success}) {
  final color = success ? AppColors.green : const Color(0xFFDC2626);
  final overlay = Overlay.maybeOf(context);
  if (overlay == null) return;

  late final OverlayEntry entry;
  entry = OverlayEntry(
    builder: (context) {
      final size = MediaQuery.sizeOf(context);
      final safeTop = MediaQuery.paddingOf(context).top;
      final toastWidth = size.width < 520 ? size.width - 32 : 380.0;

      return Positioned(
        top: safeTop + 16,
        right: 16,
        width: toastWidth,
        child: Material(
          color: Colors.transparent,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: color.withValues(alpha: 0.28),
                  blurRadius: 22,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Row(
              children: [
                Icon(success ? Icons.check_circle_outline : Icons.error_outline, color: Colors.white),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    message,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, height: 1.25),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    },
  );

  overlay.insert(entry);
  Future<void>.delayed(const Duration(seconds: 4), () {
    if (entry.mounted) entry.remove();
  });
}

String _friendlyPaymentMessage(Object error) {
  final raw = error.toString().replaceFirst('Exception: ', '').trim();
  final lower = raw.toLowerCase();

  if (lower.contains('cancel') || lower.contains('cancelled') || lower.contains('canceled')) {
    return 'Lacag bixinta waa la kansalay. Fadlan isku day mar kale.';
  }
  if (lower.contains('reject') || lower.contains('declin') || lower.contains('denied') || lower.contains('diid')) {
    return 'Lacag bixinta waa la diiday. Hubi number-ka ama ogolaanshaha telefoonka.';
  }
  if (lower.contains('insufficient') || lower.contains('balance') || lower.contains('haraag') || lower.contains('fund')) {
    return 'Haraagaagu kuguma filna. Fadlan ku shubo lacag kadibna isku day mar kale.';
  }
  if (lower.contains('timeout') || lower.contains('timed out')) {
    return 'Request-ka lacag bixinta wuu dhacay. Fadlan isku day mar kale.';
  }
  if (lower.contains('phone number') || lower.contains('account')) {
    return 'Number-ka lacag bixinta sax ma aha ama lama helin. Fadlan hubi number-ka.';
  }
  if (lower.contains('provider') || lower.contains('unavailable') || lower.contains('network')) {
    return 'Adeegga lacag bixinta hadda lama heli karo. Fadlan mar kale isku day.';
  }
  if (raw.isNotEmpty && raw.length < 110) {
    return raw;
  }
  return 'Lacag bixinta ma dhammaystirmin. Fadlan hubi xogta kadibna isku day mar kale.';
}

class _CourseBanner extends StatelessWidget {
  const _CourseBanner({required this.course});

  final CourseModel course;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: const LinearGradient(
            colors: [Color(0xFFE8F7EE), Color(0xFFCFF3DB)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: (course.coverImageUrl ?? '').isEmpty
            ? const Center(child: Icon(Icons.menu_book_rounded, color: AppColors.green, size: 78))
            : Image.network(ApiService.mediaUrl(course.coverImageUrl!), fit: BoxFit.cover),
      ),
    );
  }
}

class _InstructorCard extends StatelessWidget {
  const _InstructorCard({
    required this.name,
    required this.imageUrl,
    required this.rating,
    required this.reviews,
    required this.experience,
  });

  final String name;
  final String? imageUrl;
  final String rating;
  final int reviews;
  final String experience;

  @override
  Widget build(BuildContext context) {
    return _InfoCard(
      title: 'Instructor',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.greenSoft,
                foregroundColor: AppColors.green,
                backgroundImage: (imageUrl ?? '').isEmpty ? null : NetworkImage(ApiService.mediaUrl(imageUrl!)),
                child: (imageUrl ?? '').isEmpty ? const Icon(Icons.person_outline) : null,
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(color: AppColors.textDark, fontSize: 18, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 4),
                    Text('$rating rating - $reviews reviews', style: AppTextStyles.small),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          const Text('Experience', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(experience, style: AppTextStyles.body),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.icon, required this.label, required this.detail});

  final IconData icon;
  final String label;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: _detailCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.green, size: 20),
          const SizedBox(height: AppSpacing.xs),
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900)),
          Text(detail, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTextStyles.small),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: _detailCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppColors.textDark, fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: AppSpacing.sm),
          child,
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({
    required this.rating,
    required this.comment,
    required this.onRatingChanged,
    required this.onSubmit,
  });

  final int rating;
  final TextEditingController comment;
  final ValueChanged<int?> onRatingChanged;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return _InfoCard(
      title: 'Leave Review',
      child: Column(
        children: [
          DropdownButtonFormField<int>(
            initialValue: rating,
            decoration: const InputDecoration(labelText: 'Rating'),
            items: [1, 2, 3, 4, 5].map((e) => DropdownMenuItem(value: e, child: Text('$e Star'))).toList(),
            onChanged: onRatingChanged,
          ),
          const SizedBox(height: AppSpacing.sm),
          TextField(
            controller: comment,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Comment'),
          ),
          const SizedBox(height: AppSpacing.sm),
          PrimaryButton(onPressed: onSubmit, label: 'Submit Review'),
        ],
      ),
    );
  }
}

BoxDecoration _detailCardDecoration() {
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
