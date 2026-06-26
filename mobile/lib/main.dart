import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/app_state.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: const QuranConnectApp(),
    ),
  );
}

class QuranConnectApp extends StatelessWidget {
  const QuranConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Quran Connect',
      theme: AppTheme.light(),
      themeMode: ThemeMode.light,
      home: Consumer<AppState>(
        builder: (_, state, __) => state.isLoggedIn ? const HomeScreen() : const AuthScreen(),
      ),
    );
  }
}
