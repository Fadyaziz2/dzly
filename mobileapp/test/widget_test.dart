import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ihjizli_dz/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const IhjizliDzApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
