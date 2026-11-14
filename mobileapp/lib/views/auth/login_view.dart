import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/auth_controller.dart';
import '../../core/constants/app_assets.dart';
import '../../core/theme/app_colors.dart';
import 'register_view.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  final _emailPhoneCtrl = TextEditingController(text: 'client@dzly.com');
  final _passwordCtrl = TextEditingController(text: 'client123456');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailPhoneCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = context.read<AuthController>();
    final success = await auth.login(
      _emailPhoneCtrl.text.trim(),
      _passwordCtrl.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم تسجيل الدخول بنجاح! مرحباً بك في احجزلي Dz'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? 'فشل تسجيل الدخول، يرجى التأكد من البيانات'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _fillClientDemo() {
    setState(() {
      _emailPhoneCtrl.text = 'client@dzly.com';
      _passwordCtrl.text = 'client123456';
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('تسجيل الدخول', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.primaryBlue,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              // Brand Logo
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.primaryBlue,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryBlue.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: Image.asset(AppAssets.appLogo, fit: BoxFit.cover),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Center(
                child: Text(
                  'احجزلي Dz',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.textDark),
                ),
              ),
              const Center(
                child: Text(
                  'سجل دخولك لحجز الخدمات ومتابعة طلباتك',
                  style: TextStyle(fontSize: 13, color: AppColors.textGrey),
                ),
              ),
              const SizedBox(height: 32),

              // Email / Phone field
              TextFormField(
                controller: _emailPhoneCtrl,
                decoration: InputDecoration(
                  labelText: 'البريد الإلكتروني أو رقم الهاتف',
                  prefixIcon: const Icon(Icons.person_outline, color: AppColors.primaryBlue),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
                validator: (v) => (v == null || v.isEmpty) ? 'يرجى إدخال البريد أو الهاتف' : null,
              ),
              const SizedBox(height: 16),

              // Password field
              TextFormField(
                controller: _passwordCtrl,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'كلمة المرور',
                  prefixIcon: const Icon(Icons.lock_outline, color: AppColors.primaryBlue),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                ),
                validator: (v) => (v == null || v.length < 6) ? 'كلمة المرور لا تقل عن 6 أحرف' : null,
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: auth.isLoading ? null : _handleLogin,
                  child: auth.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('تسجيل الدخول', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 16),

              // Demo fill helper
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  side: const BorderSide(color: AppColors.accentYellow, width: 1.5),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: _fillClientDemo,
                icon: const Icon(Icons.flash_on, color: AppColors.accentYellow),
                label: const Text(
                  'دخول فوري بحساب العميل التجريبي (client@dzly.com)',
                  style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textDark, fontSize: 12),
                ),
              ),
              const SizedBox(height: 24),

              // Register Link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('ليس لديك حساب بعد؟ ', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegisterView()),
                      );
                    },
                    child: const Text(
                      'إنشاء حساب جديد',
                      style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
