import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../primitives/avatar.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

/// Chain name with its icon, as a pill (React `ChainBadge`).
class ZuniaChainBadge extends StatelessWidget {
  const ZuniaChainBadge({
    super.key,
    required this.name,
    this.iconUrl,
    this.compact = false,
  });

  /// Display name. Callers pass the chain id when there is no prettier name —
  /// an id is still an identity, an empty string is not.
  final String name;
  final String? iconUrl;

  /// Tighter padding for the 360px popup.
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      padding: EdgeInsets.fromLTRB(
        compact ? 4 : 6,
        compact ? 3 : 5,
        compact ? 8 : 10,
        compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: s.surface,
        borderRadius: BorderRadius.circular(ZuniaRadii.full),
        border: Border.all(color: s.line),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          ZuniaAvatar(imageUrl: iconUrl, fallback: name, size: compact ? 16 : 20),
          SizedBox(width: compact ? 5 : 8),
          Flexible(
            child: Text(
              name,
              overflow: TextOverflow.ellipsis,
              // fg on surface: 18.88:1 light / 16.24:1 dark.
              style: zuniaSans(
                fontSize: compact ? ZuniaType.caption : ZuniaType.label,
                fontWeight: FontWeight.w500,
                color: s.fg,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Overlapping chain icons with an optional overflow count (React `ChainStack`).
class ZuniaChainStack extends StatelessWidget {
  const ZuniaChainStack({
    super.key,
    required this.chains,
    this.extra = 0,
    this.size = 24,
  });

  /// Ordered `(name, iconUrl)` pairs. Name doubles as the orb seed.
  final List<ZuniaChainStackItem> chains;

  /// Count of chains not drawn, rendered as a `+N` disc.
  final int extra;

  final double size;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final overlap = size * 0.32;

    final discs = <Widget>[];
    for (var i = 0; i < chains.length; i++) {
      final item = chains[i];
      discs.add(
        Container(
          margin: EdgeInsets.only(left: i == 0 ? 0 : -overlap),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: s.surface, width: 2),
          ),
          child: ZuniaAvatar(
            imageUrl: item.iconUrl,
            fallback: item.name,
            size: size,
          ),
        ),
      );
    }
    if (extra > 0) {
      discs.add(
        Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          margin: EdgeInsets.only(left: chains.isEmpty ? 0 : -overlap),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: s.glass2,
            border: Border.all(color: s.surface, width: 2),
          ),
          // fgMuted on glass2 over surface: 8.62:1 light / 9.52:1 dark.
          child: Text(
            '+$extra',
            style: zuniaMono(fontSize: size * 0.32, color: s.fgMuted),
          ),
        ),
      );
    }

    return Semantics(
      label: chains.map((c) => c.name).join(', '),
      child: Row(mainAxisSize: MainAxisSize.min, children: discs),
    );
  }
}

@immutable
class ZuniaChainStackItem {
  const ZuniaChainStackItem({required this.name, this.iconUrl});

  final String name;
  final String? iconUrl;
}
