import 'package:flutter/material.dart';

import '../wallet/wallet_avatar.dart';

/// Circular avatar with a deterministic orb fallback (React `Avatar`).
///
/// The fallback is not decoration. Chain and collection icons are remote, so a
/// cold start, an offline wallet or a host that refuses the request would
/// otherwise leave an empty circle where an identity belongs — and an empty
/// circle next to another empty circle is how a user picks the wrong chain.
/// The orb is seeded, so the same chain always draws the same mark.
class ZuniaAvatar extends StatelessWidget {
  const ZuniaAvatar({
    super.key,
    this.imageUrl,
    this.seed,
    this.fallback,
    this.size = 32,
    this.semanticLabel,
  });

  /// Remote icon. Null, or a failed load, falls back to the orb.
  final String? imageUrl;

  /// Orb seed. Falls back to [fallback], then to a constant.
  final String? seed;

  /// Human name, used as the orb seed and the accessible label.
  final String? fallback;

  final double size;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final orbSeed = seed ?? fallback ?? 'zunia';
    final label = semanticLabel ?? fallback ?? 'Avatar';
    final orb = ZuniaWalletAvatar(seed: orbSeed, size: size, semanticLabel: label);

    if (imageUrl == null || imageUrl!.isEmpty) return orb;

    return Semantics(
      label: label,
      image: true,
      child: SizedBox(
        width: size,
        height: size,
        child: ClipOval(
          child: Image.network(
            imageUrl!,
            width: size,
            height: size,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stack) => orb,
          ),
        ),
      ),
    );
  }
}
