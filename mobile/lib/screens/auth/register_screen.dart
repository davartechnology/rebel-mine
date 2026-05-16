import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _referralController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;
  String _error = '';

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _referralController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    setState(() {
      _error = '';
    });

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _error = 'Les mots de passe ne correspondent pas');
      return;
    }

    if (_passwordController.text.length < 8) {
      setState(() => _error = 'Mot de passe trop court (8 caractères minimum)');
      return;
    }

    setState(() => _loading = true);

    final result = await AuthService.register(
      username: _usernameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      referralCode: _referralController.text.trim().toUpperCase(),
    );

    if (mounted) {
      setState(() => _loading = false);

      if (result['success'] == true) {
        Navigator.pushReplacementNamed(
          context,
          '/login',
          arguments: {'registered': true},
        );
      } else {
        setState(() {
          _error = result['error'] ?? 'Erreur lors de l\'inscription';
        });
      }
    }
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscure = false,
    TextInputType keyboard = TextInputType.text,
    bool optional = false,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboard,
      style: const TextStyle(color: AppColors.silver2),
      decoration: InputDecoration(
        labelText: optional ? '$label (optionnel)' : label,
        hintText: hint,
        prefixIcon: Icon(icon, color: AppColors.muted, size: 20),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 40),

              // Logo
              const Text(
                'SHEE MINE',
                style: TextStyle(
                  fontFamily: 'BebasNeue',
                  fontSize: 32,
                  letterSpacing: 6,
                  color: AppColors.silver2,
                ),
              ),

              const SizedBox(height: 4),

              const Text(
                'Créer votre compte',
                style: TextStyle(
                  fontFamily: 'BarlowCondensed',
                  fontSize: 13,
                  letterSpacing: 3,
                  color: AppColors.muted,
                ),
              ),

              const SizedBox(height: 16),

              // Bonus badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: AppColors.red.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.red.withOpacity(0.2),
                  ),
                ),
                child: const Text(
                  '🎁 Bonus inscription : +0.50 SHEE offerts',
                  style: TextStyle(
                    color: AppColors.red2,
                    fontFamily: 'BarlowCondensed',
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Error
              if (_error.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.red.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    '⚠️ $_error',
                    style: const TextStyle(
                      color: AppColors.red2,
                      fontFamily: 'BarlowCondensed',
                      fontSize: 14,
                    ),
                  ),
                ),

              // Form
              Container(
                decoration: BoxDecoration(
                  color: AppColors.bg2,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.06),
                  ),
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    _buildField(
                      controller: _usernameController,
                      label: "NOM D'UTILISATEUR",
                      hint: 'shee_user',
                      icon: Icons.person_outlined,
                    ),
                    const SizedBox(height: 14),
                    _buildField(
                      controller: _emailController,
                      label: 'EMAIL',
                      hint: 'vous@email.com',
                      icon: Icons.email_outlined,
                      keyboard: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      style: const TextStyle(color: AppColors.silver2),
                      decoration: InputDecoration(
                        labelText: 'MOT DE PASSE',
                        hintText: '••••••••',
                        prefixIcon: const Icon(
                          Icons.lock_outlined,
                          color: AppColors.muted,
                          size: 20,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            color: AppColors.muted,
                            size: 20,
                          ),
                          onPressed: () => setState(
                            () => _obscurePassword = !_obscurePassword,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildField(
                      controller: _confirmPasswordController,
                      label: 'CONFIRMER MOT DE PASSE',
                      hint: '••••••••',
                      icon: Icons.lock_outlined,
                      obscure: true,
                    ),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _referralController,
                      style: const TextStyle(
                        color: AppColors.silver2,
                        letterSpacing: 2,
                      ),
                      textCapitalization: TextCapitalization.characters,
                      decoration: const InputDecoration(
                        labelText: 'CODE DE PARRAINAGE (optionnel)',
                        hintText: 'XXXXXXXX',
                        prefixIcon: Icon(
                          Icons.card_giftcard_outlined,
                          color: AppColors.muted,
                          size: 20,
                        ),
                      ),
                      onChanged: (val) {
                        _referralController.value =
                            _referralController.value.copyWith(
                          text: val.toUpperCase(),
                          selection: TextSelection.collapsed(
                            offset: val.length,
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _register,
                        child: _loading
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Text(
                                'CRÉER MON COMPTE',
                                style: TextStyle(
                                  fontFamily: 'BebasNeue',
                                  fontSize: 16,
                                  letterSpacing: 3,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Déjà un compte ? ',
                    style: TextStyle(
                      color: AppColors.muted,
                      fontFamily: 'BarlowCondensed',
                      fontSize: 14,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(
                      context,
                      '/login',
                    ),
                    child: const Text(
                      'Se connecter',
                      style: TextStyle(
                        color: AppColors.red,
                        fontFamily: 'BarlowCondensed',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}