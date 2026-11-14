import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'controllers/auth_controller.dart';
import 'controllers/booking_controller.dart';
import 'controllers/favorites_controller.dart';
import 'controllers/home_controller.dart';
import 'controllers/navigation_controller.dart';
import 'controllers/notifications_controller.dart';
import 'core/theme/app_theme.dart';
import 'services/api_service.dart';
import 'views/main_nav/main_navigation_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService().init();

  runApp(const IhjizliDzApp());
}

class IhjizliDzApp extends StatelessWidget {
  const IhjizliDzApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NavigationController()),
        ChangeNotifierProvider(create: (_) => AuthController()..initAuth()),
        ChangeNotifierProvider(create: (_) => HomeController()),
        ChangeNotifierProvider(create: (_) => BookingController()),
        ChangeNotifierProvider(create: (_) => FavoritesController()),
        ChangeNotifierProvider(create: (_) => NotificationsController()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'احجزلي Dz',
        theme: AppTheme.lightTheme,
        builder: (context, child) {
          return Directionality(
            textDirection: TextDirection.rtl,
            child: child!,
          );
        },
        home: const MainNavigationView(),
      ),
    );
  }
}
