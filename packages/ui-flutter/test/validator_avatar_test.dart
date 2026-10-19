// flutter_test answers every HTTP request with 400, so every logo candidate
// fails here, which is exactly the case under test: a validator without a
// published logo.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:zunia_ui/zunia_ui.dart';

Widget _host(Widget child) => MaterialApp(
      theme: ZuniaTheme.dark(),
      home: Scaffold(body: Center(child: child)),
    );

const _avatar = ZuniaValidatorAvatar(
  chainId: 'cosmoshub-4',
  chainName: 'cosmoshub',
  operatorAddress: 'cosmosvaloper15gyzcp2kffm6dl7s5mltlpfnlh3hqyz2xwj9n7',
  moniker: 'Kiln',
);

Future<void> _settle(WidgetTester tester) async {
  for (var i = 0; i < 20; i++) {
    await tester.pump(const Duration(milliseconds: 50));
  }
}

void main() {
  testWidgets('logos that do not load fall back to the initials, quietly', (tester) async {
    await tester.pumpWidget(_host(_avatar));
    await _settle(tester);
    expect(tester.takeException(), isNull);
    expect(find.text('KI'), findsOneWidget);
  });

  testWidgets('an avatar gone before its logo fails reports nothing', (tester) async {
    await tester.pumpWidget(_host(_avatar));
    // Scrolled away while the first candidate is still loading.
    await tester.pumpWidget(_host(const SizedBox()));
    await _settle(tester);
    expect(tester.takeException(), isNull);
  });
}
