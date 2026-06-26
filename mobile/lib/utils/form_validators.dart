class FormValidators {
  static String? fullName(String? value) {
    if ((value?.trim() ?? '').isEmpty) return 'Full name is required';
    return null;
  }

  static String? email(String? value) {
    final email = value?.trim() ?? '';
    final emailPattern = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    if (email.isEmpty) return 'Email is required';
    if (!emailPattern.hasMatch(email)) return 'Enter a valid email';
    return null;
  }

  static String? password(String? value) {
    final password = value ?? '';
    if (password.isEmpty) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }
}
