import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;
  String _error = '';
  String _success = '';

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args != null && args is Map && args['registered'] == true) {
      setState(() {
        _success = 'Compte créé avec succès ! Connectez-vous.';
      });
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    final result = await AuthService.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    if (mounted) {
      setState(() => _loading = false);

      if (result['success'] == true) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        setState(() {
          _error = result['error'] ?? 'Erreur de connexion';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 60),

              // Logo
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.bg2,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: AppColors.red.withOpacity(0.3),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.red.withOpacity(0.15),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    'S',
                    style: TextStyle(
                      fontFamily: 'BebasNeue',
                      fontSize: 52,
                      color: AppColors.red,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

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
                'Connexion à votre compte',
                style: TextStyle(
                  fontFamily: 'BarlowCondensed',
                  fontSize: 13,
                  letterSpacing: 3,
                  color: AppColors.muted,
                ),
              ),

              const SizedBox(height: 40),

              // Success message
              if (_success.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppColors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: AppColors.green.withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    '✅ $_success',
                    style: const TextStyle(
                      color: AppColors.green,
                      fontFamily: 'BarlowCondensed',
                      fontSize: 14,
                    ),
                  ),
                ),

              // Error message
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

              // Form card
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
                    // Email
                    TextField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(color: AppColors.silver2),
                      decoration: const InputDecoration(
                        labelText: 'EMAIL',
                        hintText: 'vous@email.com',
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: AppColors.muted,
                          size: 20,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Password
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
                      onSubmitted: (_) => _login(),
                    ),

                    const SizedBox(height: 24),

                    // Login button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _login,
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
                                'SE CONNECTER',
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

              // Register link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Pas encore de compte ? ",
                    style: TextStyle(
                      color: AppColors.muted,
                      fontFamily: 'BarlowCondensed',
                      fontSize: 14,
                      letterSpacing: 1,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/register'),
                    child: const Text(
                      "S'inscrire",
                      style: TextStyle(
                        color: AppColors.red,
                        fontFamily: 'BarlowCondensed',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Bonus reminder
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.red.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.red.withOpacity(0.12),
                  ),
                ),
                child: const Text(
                  '🎁 Nouveau ? Inscrivez-vous et recevez +0.50 SHEE offerts',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.muted,
                    fontFamily: 'BarlowCondensed',
                    fontSize: 12,
                    letterSpacing: 0.5,
                  ),
                ),
              ),

              // Token notice
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.blue.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.blue.withOpacity(0.12),
                  ),
                ),
                child: const Text(
                  'ℹ️ Token SHEE non lancé · Prix actuel : 0.002\$ par SHEE · Retraits via FaucetPay & USDT TRC20',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.muted,
                    fontFamily: 'BarlowCondensed',
                    fontSize: 12,
                    letterSpacing: 0.5,
                  ),
                ),
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}