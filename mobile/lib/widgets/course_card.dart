import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../screens/course_detail_screen.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class CourseCard extends StatelessWidget {
  const CourseCard({
    super.key,
    required this.course,
    this.compact = false,
    this.badge,
  });

  final CourseModel course;
  final bool compact;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    final app = context.watch<AppState>();
    final isTeacher = app.currentUser?.role == 'teacher';
    final isFavorite = app.favoriteCourseIds.contains(course.id);
    final rating = course.teacher.averageRating == 0 ? 4.8 : course.teacher.averageRating;

    return InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => CourseDetailScreen(course: course)),
      ),
      borderRadius: BorderRadius.circular(22),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 10,
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
                      gradient: LinearGradient(
                        colors: [Color(0xFFE8F7EE), Color(0xFFCFF3DB)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: (course.coverImageUrl ?? '').isEmpty
                        ? const Center(
                            child: Icon(Icons.menu_book_rounded, color: AppColors.green, size: 46),
                          )
                        : Image.network(ApiService.mediaUrl(course.coverImageUrl!), fit: BoxFit.cover),
                  ),
                  if (!isTeacher)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: IconButton(
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: isFavorite ? AppColors.green : AppColors.textMuted,
                          fixedSize: const Size(40, 40),
                          elevation: 2,
                          shadowColor: Colors.black.withValues(alpha: 0.12),
                        ),
                        icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, size: 20),
                        onPressed: () => app.toggleFavorite(course.id),
                      ),
                    ),
                  if (badge != null)
                    Positioned(
                      left: 10,
                      top: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                        decoration: BoxDecoration(
                          color: badge == 'FREE' ? AppColors.green : AppColors.warning,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          badge!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.courseName,
                    maxLines: compact ? 2 : 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.textDark,
                      fontSize: 16,
                      height: 1.18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    course.teacher.fullName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTextStyles.small,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, color: AppColors.warning, size: 18),
                      const SizedBox(width: 3),
                      Text(
                        rating.toStringAsFixed(1),
                        style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '(${course.teacher.totalReviews})',
                          overflow: TextOverflow.ellipsis,
                          style: AppTextStyles.small,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '\$${course.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: AppColors.textDark,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.greenSoft,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          course.category,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.green,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
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
