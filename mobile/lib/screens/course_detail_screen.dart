import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';

class CourseDetailScreen extends StatefulWidget {
  final CourseModel course;
  const CourseDetailScreen({super.key, required this.course});

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
      backgroundColor: const Color(0xFF050505),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 280,
            backgroundColor: const Color(0xFF050505),
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if ((c.coverImageUrl ?? '').isEmpty)
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Color(0xFF1B7F79), Color(0xFF101010)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                      ),
                      child: const Icon(Icons.menu_book_rounded, color: Colors.white, size: 82),
                    )
                  else
                    Image.network(ApiService.mediaUrl(c.coverImageUrl!), fit: BoxFit.cover),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.black.withOpacity(0.15), Colors.black.withOpacity(0.9)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 18,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(c.category, style: const TextStyle(color: Color(0xFF9FDB9C), fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        Text(c.courseName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 28, height: 1.08, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 8),
                        Text(c.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 30),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _StatChip(icon: Icons.star, label: ratingText, detail: '${teacher.totalReviews} reviews'),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _StatChip(icon: Icons.play_circle_outline, label: '${c.lessons.length}', detail: 'lessons'),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _StatChip(icon: Icons.payments_outlined, label: '\$${c.price.toStringAsFixed(2)}', detail: 'price'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _InstructorCard(
                    name: teacher.fullName,
                    imageUrl: teacher.profileImageUrl,
                    rating: ratingText,
                    reviews: teacher.totalReviews,
                    experience: teacherExperience.isEmpty ? 'Experienced Quran instructor. Course details and teaching background will appear here when the instructor updates their profile.' : teacherExperience,
                  ),
                  const SizedBox(height: 18),
                  _SectionCard(
                    title: 'What you will learn',
                    child: Text(c.description, style: const TextStyle(color: Colors.white70, height: 1.35)),
                  ),
                  const SizedBox(height: 18),
                  _SectionCard(
                    title: 'Lessons',
                    child: c.lessons.isEmpty
                        ? const Text('Lessons will appear here after the instructor adds them.', style: TextStyle(color: Colors.white60))
                        : Column(
                            children: c.lessons.asMap().entries.map((entry) {
                              return ListTile(
                                contentPadding: EdgeInsets.zero,
                                leading: CircleAvatar(
                                  backgroundColor: const Color(0xFF1B5E20),
                                  foregroundColor: Colors.white,
                                  child: Text('${entry.key + 1}'),
                                ),
                                title: Text(entry.value.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                                subtitle: const Text('Video lesson', style: TextStyle(color: Colors.white60)),
                                trailing: const Icon(Icons.lock_outline, color: Colors.white54),
                              );
                            }).toList(),
                          ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: () => _showCheckout(context, app, c),
                          icon: const Icon(Icons.shopping_cart_checkout),
                          label: const Text('Buy Course'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      IconButton.filledTonal(
                        tooltip: 'WhatsApp',
                        onPressed: () => _contactTeacher(teacher.whatsappNumber),
                        icon: const Icon(Icons.chat_outlined),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
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
            ),
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
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111111),
      builder: (sheetContext) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Checkout', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Text(course.courseName, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 4),
              Text('\$${course.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 16),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'EVC Plus', label: Text('EVC')),
                  ButtonSegment(value: 'Zaad', label: Text('Zaad')),
                  ButtonSegment(value: 'Sahal', label: Text('Sahal')),
                ],
                selected: {paymentMethod},
                onSelectionChanged: (value) => setSheetState(() => paymentMethod = value.first),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: paymentPhone,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(labelText: '$paymentMethod phone number', border: const OutlineInputBorder()),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  icon: const Icon(Icons.shopping_cart_checkout),
                  label: const Text('Confirm purchase'),
                  onPressed: () async {
                    final data = await app.buyCourse(course.id, paymentMethod, paymentPhone.text.trim());
                    if (!context.mounted) return;
                    Navigator.pop(sheetContext);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Course purchased. Telegram: ${data['telegramChannelLink'] ?? 'Not provided'}')),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InstructorCard extends StatelessWidget {
  final String name;
  final String? imageUrl;
  final String rating;
  final int reviews;
  final String experience;

  const _InstructorCard({required this.name, required this.imageUrl, required this.rating, required this.reviews, required this.experience});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Instructor',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: const Color(0xFF1B5E20),
                backgroundImage: (imageUrl ?? '').isEmpty ? null : NetworkImage(ApiService.mediaUrl(imageUrl!)),
                child: (imageUrl ?? '').isEmpty ? const Icon(Icons.person_outline, color: Colors.white) : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                    const SizedBox(height: 4),
                    Text('$rating rating - $reviews reviews', style: const TextStyle(color: Colors.white60)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text('Experience', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
          const SizedBox(height: 6),
          Text(experience, style: const TextStyle(color: Colors.white70, height: 1.35)),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String detail;

  const _StatChip({required this.icon, required this.label, required this.detail});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF9FDB9C), size: 20),
          const SizedBox(height: 8),
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
          Text(detail, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFF151515), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final int rating;
  final TextEditingController comment;
  final ValueChanged<int?> onRatingChanged;
  final VoidCallback onSubmit;

  const _ReviewCard({required this.rating, required this.comment, required this.onRatingChanged, required this.onSubmit});

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Leave Review',
      child: Column(
        children: [
          DropdownButtonFormField<int>(
            value: rating,
            decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Rating'),
            items: [1, 2, 3, 4, 5].map((e) => DropdownMenuItem(value: e, child: Text('$e Star'))).toList(),
            onChanged: onRatingChanged,
          ),
          const SizedBox(height: 10),
          TextField(
            controller: comment,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Comment', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: FilledButton(onPressed: onSubmit, child: const Text('Submit Review')),
          ),
        ],
      ),
    );
  }
}
