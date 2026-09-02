import 'package:flutter/material.dart';
import 'package:zunia_ui/zunia_ui.dart';

void main() => runApp(const GalleryApp());

class GalleryApp extends StatefulWidget {
  const GalleryApp({super.key});

  @override
  State<GalleryApp> createState() => _GalleryAppState();
}

class _GalleryAppState extends State<GalleryApp> {
  bool dark = true;
  String tab = 'home';
  String segment = 'mainnet';
  bool switchOn = true;
  String? seedWord;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Zunia UI Gallery',
      debugShowCheckedModeBanner: false,
      theme: dark ? ZuniaTheme.dark() : ZuniaTheme.light(),
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Zunia UI'),
          actions: [
            TextButton(
              onPressed: () => setState(() => dark = !dark),
              child: Text(dark ? 'LIGHT' : 'DARK'),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            const ZuniaSectionLabel('Buttons'),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                ZuniaButton(label: 'Primary', onPressed: () {}),
                ZuniaButton(
                  label: 'Secondary',
                  variant: ZuniaButtonVariant.secondary,
                  onPressed: () {},
                ),
                ZuniaButton(
                  label: 'Ghost',
                  variant: ZuniaButtonVariant.ghost,
                  onPressed: () {},
                ),
                ZuniaButton(
                  label: 'Danger',
                  variant: ZuniaButtonVariant.danger,
                  onPressed: () {},
                ),
                const ZuniaButton(label: 'Disabled'),
                ZuniaButton(label: 'Loading', loading: true, onPressed: () {}),
              ],
            ),
            const SizedBox(height: 28),
            const ZuniaSectionLabel('Inputs'),
            const SizedBox(height: 12),
            const ZuniaInput(label: 'Recipient', hint: 'cosmos1…'),
            const SizedBox(height: 12),
            ZuniaSegmented<String>(
              options: const {'mainnet': 'Mainnet', 'testnet': 'Testnet'},
              value: segment,
              onChanged: (v) => setState(() => segment = v),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ZuniaSwitch(
                  value: switchOn,
                  onChanged: (v) => setState(() => switchOn = v),
                ),
                const SizedBox(width: 12),
                const ZuniaPill('Verified'),
                const SizedBox(width: 8),
                const ZuniaPill('Unverified', tone: ZuniaPillTone.danger),
              ],
            ),
            const SizedBox(height: 28),
            const ZuniaSectionLabel('Wallet'),
            const SizedBox(height: 12),
            const ZuniaAmount(value: '12,408.42', denom: 'USD', hero: true),
            const SizedBox(height: 12),
            ZuniaWalletChip(name: 'Main', onTap: () {}),
            const SizedBox(height: 8),
            ZuniaAssetRow(
              symbol: 'ATOM',
              chain: 'cosmoshub-4',
              balance: '42.10',
              value: r'$482',
              selected: true,
              onTap: () {},
            ),
            ZuniaAssetRow(
              symbol: 'OSMO',
              chain: 'osmosis-1',
              balance: '1,204',
              value: r'$890',
              onTap: () {},
            ),
            const ZuniaActivityRow(
              kind: ZuniaActivityKind.ibc,
              title: 'IBC transfer',
              subtitle: 'Confirmed · 4.1s',
              amount: '+25 ATOM',
            ),
            const ZuniaActivityRow(
              kind: ZuniaActivityKind.sent,
              title: 'Send ATOM',
              subtitle: 'to cosmos1…abc',
              amount: '-1.2 ATOM',
            ),
            const ZuniaActivityRow(
              kind: ZuniaActivityKind.claim,
              title: 'Claim rewards',
              subtitle: 'osmosisvaloper1…',
              amount: '+0.4 OSMO',
            ),
            const SizedBox(height: 28),
            const ZuniaSectionLabel('Seed verifier'),
            const SizedBox(height: 12),
            ZuniaSeedVerifier(
              options: const ['ocean', 'cradle', 'vessel', 'orbit'],
              selected: seedWord,
              onSelect: (w) => setState(() => seedWord = w),
            ),
            const SizedBox(height: 28),
            const ZuniaSectionLabel('Feedback'),
            const SizedBox(height: 12),
            const ZuniaCallout(
              title: 'Transfer confirmed',
              body: '25 ATOM · 4.1s',
            ),
            const SizedBox(height: 10),
            const ZuniaCallout(
              title: 'Unrecognised contract',
              body: 'Review decoded messages before signing.',
              danger: true,
            ),
            const SizedBox(height: 10),
            const ZuniaEmptyState(
              title: 'No NFTs yet',
              description: 'Collections on Stargaze appear here automatically.',
            ),
            const SizedBox(height: 28),
            const ZuniaSectionLabel('Charts'),
            const SizedBox(height: 12),
            const SizedBox(
              height: 24,
              child: ZuniaSparkline(points: [2, 4, 3, 7, 5, 9, 8]),
            ),
            const SizedBox(height: 12),
            const ZuniaBarRow(label: 'ATOM', value: r'$19.0', pct: 0.82),
            const SizedBox(height: 8),
            const ZuniaBarRow(label: 'OSMO', value: r'$59.2', pct: 0.61),
            const SizedBox(height: 12),
            const ZuniaTallyBar(yes: 64, no: 22, veto: 14),
            const SizedBox(height: 80),
          ],
        ),
        bottomNavigationBar: ZuniaTabBar(
          items: const [
            (id: 'home', label: 'Home', icon: Icons.dashboard_outlined),
            (id: 'earn', label: 'Earn', icon: Icons.savings_outlined),
            (id: 'swap', label: 'Swap', icon: Icons.swap_horiz),
          ],
          value: tab,
          onChanged: (v) => setState(() => tab = v),
        ),
      ),
    );
  }
}
