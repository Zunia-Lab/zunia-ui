import 'package:flutter/material.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

class ZuniaSparkline extends StatelessWidget {
  const ZuniaSparkline({super.key, required this.points, this.negative = false});
  final List<double> points;
  final bool negative;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return CustomPaint(
      size: const Size(double.infinity, 24),
      painter: _SparkPainter(points, negative ? s.danger : s.fg),
    );
  }
}

class _SparkPainter extends CustomPainter {
  _SparkPainter(this.points, this.color);
  final List<double> points;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;
    final max = points.reduce((a, b) => a > b ? a : b);
    final min = points.reduce((a, b) => a < b ? a : b);
    final range = (max - min).abs() < 0.001 ? 1.0 : max - min;
    final path = Path();
    for (var i = 0; i < points.length; i++) {
      final x = size.width * (i / (points.length - 1).clamp(1, 999));
      final y = size.height - ((points[i] - min) / range) * (size.height - 4) - 2;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(
      path,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.6
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(covariant _SparkPainter oldDelegate) =>
      oldDelegate.points != points || oldDelegate.color != color;
}

class ZuniaBarRow extends StatelessWidget {
  const ZuniaBarRow({
    super.key,
    required this.label,
    required this.value,
    required this.pct,
  });

  final String label;
  final String value;
  final double pct;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Row(
      children: [
        SizedBox(
          width: 52,
          child: Text(label, style: zuniaMono(fontSize: 10, color: s.fgMuted)),
        ),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: pct.clamp(0, 1),
              minHeight: 12,
              backgroundColor: s.stateHover,
              color: s.fg,
            ),
          ),
        ),
        SizedBox(
          width: 52,
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: zuniaMono(fontSize: 10, color: s.fg),
          ),
        ),
      ],
    );
  }
}

class ZuniaTallyBar extends StatelessWidget {
  const ZuniaTallyBar({
    super.key,
    required this.yes,
    required this.no,
    required this.veto,
    this.abstain = 0,
  });

  final double yes;
  final double no;
  final double veto;
  final double abstain;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final total = yes + no + veto + abstain;
    if (total <= 0) return const SizedBox(height: 8);
    // Flex weights must be integers, so shares are scaled and rounded; a zero
    // share collapses to nothing rather than showing a sliver.
    int weight(double share) => (share / total * 1000).round();
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: SizedBox(
        height: 8,
        child: Row(
          children: [
            Expanded(flex: weight(yes), child: ColoredBox(color: s.accent)),
            Expanded(flex: weight(no), child: ColoredBox(color: s.danger)),
            Expanded(flex: weight(veto), child: ColoredBox(color: s.warning)),
            Expanded(
              flex: weight(abstain),
              child: ColoredBox(color: s.stateHover),
            ),
          ],
        ),
      ),
    );
  }
}
