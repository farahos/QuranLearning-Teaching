import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';

import '../models/course_model.dart';
import '../providers/app_state.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class LessonPlayerScreen extends StatefulWidget {
  const LessonPlayerScreen({super.key, required this.courseId, required this.lesson});

  final String courseId;
  final LessonModel lesson;

  @override
  State<LessonPlayerScreen> createState() => _LessonPlayerScreenState();
}

class _LessonPlayerScreenState extends State<LessonPlayerScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  String? _error;
  bool _loading = true;
  bool _completedFired = false;

  bool get _isExternalLink {
    final url = widget.lesson.videoUrl.toLowerCase();
    return url.contains('youtube.com') || url.contains('youtu.be') || url.contains('vimeo.com');
  }

  @override
  void initState() {
    super.initState();
    if (widget.lesson.id.isNotEmpty) {
      context.read<AppState>().markLessonProgress(widget.courseId, widget.lesson.id, completed: false);
    }
    if (widget.lesson.videoUrl.isEmpty || _isExternalLink) {
      _loading = false;
    } else {
      _initializePlayer();
    }
  }

  Future<void> _initializePlayer() async {
    final url = ApiService.mediaUrl(widget.lesson.videoUrl);
    try {
      final controller = VideoPlayerController.networkUrl(Uri.parse(url));
      await controller.initialize();
      if (!mounted) return;
      _videoController = controller;
      controller.addListener(_handleVideoProgress);
      _chewieController = ChewieController(
        videoPlayerController: controller,
        autoPlay: true,
        looping: false,
        materialProgressColors: ChewieProgressColors(
          playedColor: AppColors.green,
          handleColor: AppColors.green,
        ),
        errorBuilder: (context, message) => Center(
          child: Text(message, style: const TextStyle(color: Colors.white70)),
        ),
      );
      setState(() => _loading = false);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load this video. Please check your connection and try again.';
        _loading = false;
      });
    }
  }

  void _handleVideoProgress() {
    final controller = _videoController;
    if (controller == null || _completedFired || widget.lesson.id.isEmpty) return;
    final value = controller.value;
    if (!value.isInitialized || value.duration == Duration.zero) return;
    final remaining = value.duration - value.position;
    if (remaining <= const Duration(seconds: 1)) {
      _completedFired = true;
      context.read<AppState>().markLessonProgress(widget.courseId, widget.lesson.id, completed: true);
    }
  }

  @override
  void dispose() {
    _videoController?.removeListener(_handleVideoProgress);
    _chewieController?.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _openExternally() async {
    final uri = Uri.tryParse(widget.lesson.videoUrl);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(widget.lesson.title, overflow: TextOverflow.ellipsis),
      ),
      body: Center(child: _buildBody()),
    );
  }

  Widget _buildBody() {
    if (widget.lesson.videoUrl.isEmpty) {
      return const Text('No video available for this lesson yet.', style: TextStyle(color: Colors.white70));
    }
    if (_isExternalLink) {
      return Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.ondemand_video, color: Colors.white70, size: 56),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'This lesson video is hosted externally. Open it in your browser or video app.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton.icon(
              onPressed: _openExternally,
              icon: const Icon(Icons.open_in_new),
              label: const Text('Open video'),
            ),
          ],
        ),
      );
    }
    if (_loading) {
      return const CircularProgressIndicator(color: Colors.white);
    }
    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: Colors.white70, size: 48),
            const SizedBox(height: AppSpacing.sm),
            Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70)),
          ],
        ),
      );
    }
    if (_chewieController == null) {
      return const Text('Video unavailable.', style: TextStyle(color: Colors.white70));
    }
    final aspectRatio = _videoController!.value.aspectRatio;
    return AspectRatio(
      aspectRatio: aspectRatio == 0 ? 16 / 9 : aspectRatio,
      child: Chewie(controller: _chewieController!),
    );
  }
}
