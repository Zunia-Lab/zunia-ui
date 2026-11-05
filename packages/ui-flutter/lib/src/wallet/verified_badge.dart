import 'dart:math' as math;

import 'package:flutter/widgets.dart';

import '../theme/zunia_semantics_ext.dart';

/// The verified seal: a scalloped rosette in the brand gradient with a white
/// check, the shape people already read as "verified" on social networks.
///
/// Drawn, not an icon font, so it stays crisp at 12 px on a token logo and at
/// 24 px beside a name. [ring] draws a cut-out edge in that colour when the
/// seal overlaps artwork (a token logo), so it never smudges into it.
class ZuniaVerifiedBadge extends StatelessWidget {
  const ZuniaVerifiedBadge({
    super.key,
    this.size = 16,
    this.ring,
    this.semanticLabel = 'Verified',
  });

  final double size;
  final Color? ring;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final badge = CustomPaint(
      size: Size.square(size),
      painter: _RosettePainter(gradient: s.accentGradient, ring: ring),
    );
    final label = semanticLabel;
    if (label == null) return ExcludeSemantics(child: badge);
    return Semantics(label: label, image: true, child: ExcludeSemantics(child: badge));
  }
}

class _RosettePainter extends CustomPainter {
  _RosettePainter({required this.gradient, this.ring});

  final Gradient gradient;
  final Color? ring;

  /// Eight soft scallops around a circle.
  static Path rosette(Offset center, double radius) {
    const lobes = 8;
    const steps = 160;
    final path = Path();
    for (var i = 0; i <= steps; i++) {
      final t = i / steps * 2 * math.pi;
      final r = radius * (0.89 + 0.11 * math.cos(lobes * t));
      final p = Offset(
        center.dx + r * math.cos(t - math.pi / 2),
        center.dy + r * math.sin(t - math.pi / 2),
      );
      if (i == 0) {
        path.moveTo(p.dx, p.dy);
      } else {
        path.lineTo(p.dx, p.dy);
      }
    }
    return path..close();
  }

  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final full = size.shortestSide / 2;
    final ringColor = ring;
    // The cut-out edge is the rosette itself, slightly larger, in the ground
    // colour; the seal inside keeps its own shape.
    final radius = ringColor == null ? full : full * 0.86;
    if (ringColor != null) {
      canvas.drawPath(rosette(center, full), Paint()..color = ringColor);
    }
    final shape = rosette(center, radius);
    canvas.drawPath(
      shape,
      Paint()
        ..shader = gradient.createShader(
          Rect.fromCircle(center: center, radius: radius),
        ),
    );

    final d = radius * 2;
    final origin = center - Offset(radius, radius);
    final check = Path()
      ..moveTo(origin.dx + d * 0.30, origin.dy + d * 0.51)
      ..lineTo(origin.dx + d * 0.44, origin.dy + d * 0.65)
      ..lineTo(origin.dx + d * 0.71, origin.dy + d * 0.37);
    canvas.drawPath(
      check,
      Paint()
        ..color = const Color(0xFFFFFFFF)
        ..style = PaintingStyle.stroke
        ..strokeWidth = math.max(1.2, d * 0.11)
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(_RosettePainter old) =>
      old.gradient != gradient || old.ring != ring;
}
