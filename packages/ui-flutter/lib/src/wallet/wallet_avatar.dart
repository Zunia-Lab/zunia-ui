import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

/// Deterministic non-human 3D orb — same seed → same look as the React Avatar.
class ZuniaWalletAvatar extends StatelessWidget {
  const ZuniaWalletAvatar({
    super.key,
    required this.seed,
    this.size = 32,
    this.semanticLabel,
  });

  final String seed;
  final double size;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel ?? 'Wallet avatar',
      child: SizedBox(
        width: size,
        height: size,
        child: ClipOval(
          child: CustomPaint(
            painter: _WalletOrbPainter(style: resolveAvatarStyle(seed)),
          ),
        ),
      ),
    );
  }
}

class AvatarPalette {
  const AvatarPalette({
    required this.light,
    required this.mid,
    required this.dark,
    required this.accent,
  });

  final Color light;
  final Color mid;
  final Color dark;
  final Color accent;
}

enum AvatarMotif { ring, crescent, shard, core }

class AvatarStyle {
  const AvatarStyle({
    required this.palette,
    required this.motif,
    required this.rotateDeg,
  });

  final AvatarPalette palette;
  final AvatarMotif motif;
  final double rotateDeg;
}

const List<AvatarPalette> kAvatarPalettes = [
  AvatarPalette(
    light: Color(0xFFFFB4A8),
    mid: Color(0xFFFF1B0C),
    dark: Color(0xFF7A0E06),
    accent: Color(0xFFFF8A17),
  ),
  AvatarPalette(
    light: Color(0xFFFFC9A0),
    mid: Color(0xFFFF4E12),
    dark: Color(0xFF7A2808),
    accent: Color(0xFFFFBE14),
  ),
  AvatarPalette(
    light: Color(0xFFFFE0A0),
    mid: Color(0xFFFF8A17),
    dark: Color(0xFF7A4508),
    accent: Color(0xFFFFE05C),
  ),
  AvatarPalette(
    light: Color(0xFFFFE9A8),
    mid: Color(0xFFFFBE14),
    dark: Color(0xFF7A5C08),
    accent: Color(0xFFFF8A17),
  ),
  AvatarPalette(
    light: Color(0xFFA7F3D0),
    mid: Color(0xFF0D9488),
    dark: Color(0xFF064E3B),
    accent: Color(0xFF5EEAD4),
  ),
  AvatarPalette(
    light: Color(0xFF99F6E4),
    mid: Color(0xFF0F766E),
    dark: Color(0xFF134E4A),
    accent: Color(0xFF2DD4BF),
  ),
  AvatarPalette(
    light: Color(0xFFFCA5A5),
    mid: Color(0xFFDC2626),
    dark: Color(0xFF7F1D1D),
    accent: Color(0xFFFB7185),
  ),
  AvatarPalette(
    light: Color(0xFFE2E8F0),
    mid: Color(0xFF64748B),
    dark: Color(0xFF1E293B),
    accent: Color(0xFF94A3B8),
  ),
  AvatarPalette(
    light: Color(0xFFF9A8D4),
    mid: Color(0xFFDB2777),
    dark: Color(0xFF831843),
    accent: Color(0xFFFDA4AF),
  ),
  AvatarPalette(
    light: Color(0xFF86EFAC),
    mid: Color(0xFF16A34A),
    dark: Color(0xFF14532D),
    accent: Color(0xFFBEF264),
  ),
  AvatarPalette(
    light: Color(0xFFFDBA74),
    mid: Color(0xFFEA580C),
    dark: Color(0xFF7C2D12),
    accent: Color(0xFFFBBF24),
  ),
  AvatarPalette(
    light: Color(0xFFFECACA),
    mid: Color(0xFFD42800),
    dark: Color(0xFF5C1200),
    accent: Color(0xFFFF6A05),
  ),
];

/// FNV-1a 32-bit — must match `hashSeed` in `@zunialab/ui`.
int hashSeed(String seed) {
  var h = 0x811c9dc5;
  final normalized = seed.trim().toLowerCase();
  final input = normalized.isEmpty ? 'zunia' : normalized;
  for (final unit in input.codeUnits) {
    h ^= unit;
    h = (h * 0x01000193) & 0xffffffff;
  }
  return h;
}

AvatarStyle resolveAvatarStyle(String seed) {
  final h = hashSeed(seed);
  final palette = kAvatarPalettes[h % kAvatarPalettes.length];
  final motif = AvatarMotif.values[(h >> 8) % AvatarMotif.values.length];
  final rotateDeg = ((h >> 16) % 360).toDouble();
  return AvatarStyle(palette: palette, motif: motif, rotateDeg: rotateDeg);
}

class _WalletOrbPainter extends CustomPainter {
  _WalletOrbPainter({required this.style});

  final AvatarStyle style;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.shortestSide / 2;

    final ball = Paint()
      ..shader = ui.Gradient.radial(
        Offset(center.dx - radius * 0.28, center.dy - radius * 0.36),
        radius * 1.35,
        [style.palette.light, style.palette.mid, style.palette.dark],
        const [0.0, 0.48, 1.0],
      );
    canvas.drawCircle(center, radius, ball);

    final rim = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = radius * 0.04
      ..shader = ui.Gradient.linear(
        Offset(0, 0),
        Offset(size.width, size.height),
        [
          const Color(0x47FFFFFF),
          const Color(0x59000000),
        ],
      );
    canvas.drawCircle(center, radius - rim.strokeWidth / 2, rim);

    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(style.rotateDeg * math.pi / 180);
    canvas.translate(-center.dx, -center.dy);
    _paintMotif(canvas, center, radius);
    canvas.restore();

    final shine = Paint()
      ..shader = ui.Gradient.radial(
        Offset(center.dx - radius * 0.32, center.dy - radius * 0.38),
        radius * 0.85,
        [
          const Color(0x9EFFFFFF),
          const Color(0x14FFFFFF),
          const Color(0x00FFFFFF),
        ],
        const [0.0, 0.55, 1.0],
      );
    canvas.drawCircle(center, radius, shine);

    final glint = Paint()..color = const Color(0x38FFFFFF);
    canvas.drawOval(
      Rect.fromCenter(
        center: Offset(center.dx - radius * 0.28, center.dy - radius * 0.42),
        width: radius * 0.62,
        height: radius * 0.36,
      ),
      glint,
    );
  }

  void _paintMotif(Canvas canvas, Offset center, double radius) {
    final paint = Paint()..color = style.palette.accent.withValues(alpha: 0.48);
    switch (style.motif) {
      case AvatarMotif.ring:
        canvas.drawCircle(
          center,
          radius * 0.56,
          Paint()
            ..color = style.palette.accent.withValues(alpha: 0.55)
            ..style = PaintingStyle.stroke
            ..strokeWidth = radius * 0.16,
        );
      case AvatarMotif.crescent:
        final path = Path()
          ..addOval(Rect.fromCircle(center: center, radius: radius * 0.62))
          ..addOval(
            Rect.fromCircle(
              center: Offset(center.dx + radius * 0.22, center.dy),
              radius: radius * 0.5,
            ),
          )
          ..fillType = PathFillType.evenOdd;
        canvas.drawPath(path, paint);
      case AvatarMotif.shard:
        final path = Path()
          ..moveTo(center.dx, center.dy - radius * 0.68)
          ..lineTo(center.dx + radius * 0.5, center.dy + radius * 0.12)
          ..lineTo(center.dx, center.dy + radius * 0.68)
          ..lineTo(center.dx - radius * 0.5, center.dy + radius * 0.12)
          ..close();
        canvas.drawPath(
          path,
          Paint()..color = style.palette.accent.withValues(alpha: 0.38),
        );
      case AvatarMotif.core:
        canvas.drawCircle(
          center,
          radius * 0.34,
          Paint()..color = style.palette.accent.withValues(alpha: 0.5),
        );
    }
  }

  @override
  bool shouldRepaint(covariant _WalletOrbPainter oldDelegate) {
    return oldDelegate.style.palette != style.palette ||
        oldDelegate.style.motif != style.motif ||
        oldDelegate.style.rotateDeg != style.rotateDeg;
  }
}
