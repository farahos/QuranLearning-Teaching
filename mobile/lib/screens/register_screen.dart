import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_state.dart';
import '../theme/app_theme.dart';
import '../utils/form_validators.dart';
import '../widgets/auth_page_shell.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/primary_button.dart';
import '../widgets/role_selector.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  String _role = 'student';
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      await context.read<AppState>().register(
            _nameController.text.trim(),
            _emailController.text.trim(),
            _passwordController.text.trim(),
            _role,
          );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthPageShell(
      heading: 'Learn Quran with trusted teachers',
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            RoleSelector(
              value: _role,
              onChanged: (value) => setState(() => _role = value),
            ),
            const SizedBox(height: AppSpacing.md),
            CustomTextField(
              controller: _nameController,
              hintText: 'Full name',
              textInputAction: TextInputAction.next,
              validator: FormValidators.fullName,
            ),
            const SizedBox(height: AppSpacing.sm),
            CustomTextField(
              controller: _emailController,
              hintText: 'Email',
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              validator: FormValidators.email,
            ),
            const SizedBox(height: AppSpacing.sm),
            CustomTextField(
              controller: _passwordController,
              hintText: 'Password',
              obscureText: true,
              textInputAction: TextInputAction.done,
              validator: FormValidators.password,
            ),
            const SizedBox(height: AppSpacing.lg),
            PrimaryButton(
              label: 'Create account',
              loading: _loading,
              onPressed: _submit,
            ),
            const SizedBox(height: AppSpacing.md),
            _RegisterFooter(
              onTap: () {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _RegisterFooter extends StatelessWidget {
  const _RegisterFooter({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.center,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        const Text('Already have an account? ', style: AppTextStyles.body),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 2, vertical: 4),
            child: Text(
              'Log in',
              style: TextStyle(
                color: AppColors.green,
                fontSize: 14,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
