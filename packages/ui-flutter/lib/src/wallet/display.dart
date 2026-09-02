import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import 'activity.dart';

String truncateAddress(String address, {int left = 8, int right = 4}) {
  if (address.length <= left + right + 1) return address;
  return '${address.substring(0, left)}…${address.substring(address.length - right)}';
}

class ZuniaAmount extends StatelessWidget {
  const ZuniaAmount({
    super.key,
    required this.value,
    this.denom,
    this.hero = false,
  });

  final String value;
  final String? denom;
  final bool hero;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final split = _splitFractional(value);
    final baseStyle = zuniaSans(
      fontSize: hero ? ZuniaType.amount : 16,
      fontWeight: hero ? FontWeight.w500 : FontWeight.w700,
      letterSpacing: hero ? -1.2 : -0.4,
      height: 1.05,
      color: s.fg,
      tabular: FontFeature.tabularFigures(),
    );

    return Text.rich(
      TextSpan(
        text: split.$1,
        style: baseStyle,
        children: [
          if (split.$2 != null)
            TextSpan(
              text: split.$2,
              style: baseStyle.copyWith(color: s.fgDim),
            ),
          if (denom != null)
            TextSpan(
              text: ' $denom',
              style: zuniaMono(
                fontSize: hero ? 14 : 12,
                fontWeight: FontWeight.w600,
                color: s.fgMuted,
              ),
            ),
        ],
      ),
    );
  }

  /// Splits `"$12,408.20"` into `("$12,408", ".20")` so hero amounts mute cents.
  static (String, String?) _splitFractional(String raw) {
    final dot = raw.lastIndexOf('.');
    if (dot <= 0 || dot == raw.length - 1) return (raw, null);
    final frac = raw.substring(dot);
    if (!RegExp(r'^\.\d+$').hasMatch(frac)) return (raw, null);
    return (raw.substring(0, dot), frac);
  }
}

class ZuniaAddressChip extends StatelessWidget {
  const ZuniaAddressChip({super.key, required this.address, this.onCopy});
  final String address;
  final VoidCallback? onCopy;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return GestureDetector(
      onTap: onCopy,
      child: Text(
        truncateAddress(address),
        style: zuniaMono(fontSize: 11, color: s.fgMuted),
      ),
    );
  }
}

class ZuniaAssetRow extends StatelessWidget {
  const ZuniaAssetRow({
    super.key,
    required this.symbol,
    this.chain,
    required this.balance,
    required this.value,
    this.selected = false,
    this.onTap,
  });

  final String symbol;
  final String? chain;
  final String balance;
  final String value;
  final bool selected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Material(
      color: selected ? s.stateSelected : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        hoverColor: s.stateHover,
        splashColor: s.statePress,
        highlightColor: s.statePress,
        child: Container(
          decoration: selected
              ? BoxDecoration(
                  border: Border(left: BorderSide(color: s.accent, width: 2)),
                )
              : null,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 13),
          child: Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: s.stateHover,
                child: Text(symbol.characters.first, style: zuniaMono(fontSize: 10, color: s.fg)),
              ),
              const SizedBox(width: 11),
              Expanded(
                flex: 2,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(symbol, style: zuniaSans(fontSize: 12.5, fontWeight: FontWeight.w500, color: s.fg)),
                    if (chain != null)
                      Text(chain!, style: zuniaMono(fontSize: 9.5, color: s.fgMuted)),
                  ],
                ),
              ),
              Expanded(
                child: Text(
                  balance,
                  textAlign: TextAlign.right,
                  style: zuniaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                    color: s.fg,
                    tabular: FontFeature.tabularFigures(),
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  value,
                  textAlign: TextAlign.right,
                  style: zuniaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.3,
                    color: s.fg,
                    tabular: FontFeature.tabularFigures(),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ZuniaActivityRow extends StatelessWidget {
  const ZuniaActivityRow({
    super.key,
    required this.title,
    required this.subtitle,
    this.amount,
    this.failed = false,
    this.kind,
    this.kindName,
  });

  final String title;
  final String subtitle;
  final String? amount;
  final bool failed;
  final ZuniaActivityKind? kind;
  final String? kindName;

  @override
  Widget build(BuildContext context) {
    final presentation = zuniaActivityPresentation(
      context,
      kind: kind,
      kindName: kindName,
      success: !failed,
    );
    final amountColor = zuniaActivityAmountColor(
      context,
      kind: kind,
      kindName: kindName,
      success: !failed,
      amount: amount,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: presentation.border),
              color: presentation.bg,
            ),
            child: Text(
              presentation.icon,
              style: TextStyle(
                color: presentation.fg,
                fontSize: 15,
                fontWeight: FontWeight.w600,
                height: 1,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: zuniaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: ZuniaSemanticsExt.of(context).fg,
                  ),
                ),
                Text(
                  subtitle,
                  style: zuniaMono(
                    fontSize: 10,
                    color: ZuniaSemanticsExt.of(context).fgMuted,
                  ),
                ),
              ],
            ),
          ),
          if (amount != null)
            Text(
              amount!,
              style: zuniaSans(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.3,
                color: amountColor,
                tabular: FontFeature.tabularFigures(),
              ),
            ),
        ],
      ),
    );
  }
}

class ZuniaWalletChip extends StatelessWidget {
  const ZuniaWalletChip({super.key, required this.name, this.onTap});
  final String name;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final initial = name.isEmpty ? '?' : name.characters.first.toUpperCase();
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(2, 2, 6, 2),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 22,
                height: 22,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: s.accent,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  initial,
                  style: zuniaMono(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: s.accentFg,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  name,
                  overflow: TextOverflow.ellipsis,
                  style: zuniaSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: s.fg,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '▾',
                style: TextStyle(color: s.fgMuted, fontSize: 9, height: 1),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Raised glass network chip matching the Mobile Wallet "Mainnet N" pill.
class ZuniaNetworkChip extends StatelessWidget {
  const ZuniaNetworkChip({
    super.key,
    required this.label,
    required this.count,
    this.onTap,
    this.verified = true,
  });

  final String label;
  final int count;
  final VoidCallback? onTap;
  final bool verified;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        customBorder: const StadiumBorder(),
        child: Ink(
          decoration: BoxDecoration(
            gradient: s.surfaceRaisedGradient,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (verified) ...[
                  Icon(Icons.verified, size: 13, color: const Color(0xFFF2913B)),
                  const SizedBox(width: 7),
                ],
                Text(
                  label,
                  style: zuniaMono(fontSize: 11, color: s.fgStrong),
                ),
                const SizedBox(width: 6),
                Text(
                  '$count',
                  style: zuniaMono(fontSize: 11, color: s.info),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Home quick-action tile: primary uses accent gradient, others use glass.
class ZuniaQuickAction extends StatelessWidget {
  const ZuniaQuickAction({
    super.key,
    required this.label,
    required this.icon,
    required this.onTap,
    this.primary = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final fg = primary ? s.accentFg : s.fg;
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            height: 72,
            decoration: BoxDecoration(
              gradient: primary ? s.accentGradient : null,
              color: primary ? null : s.glass,
              borderRadius: BorderRadius.circular(16),
              boxShadow: primary
                  ? [
                      BoxShadow(
                        color: const Color(0xFF3B6BFF).withValues(alpha: 0.35),
                        blurRadius: 18,
                        offset: const Offset(0, 8),
                      ),
                    ]
                  : null,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 20, color: fg),
                const SizedBox(height: 6),
                Text(
                  label,
                  style: zuniaSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: fg,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
