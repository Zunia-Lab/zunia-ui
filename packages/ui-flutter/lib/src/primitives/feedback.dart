import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

class ZuniaSectionLabel extends StatelessWidget {
  const ZuniaSectionLabel(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Text(
      text.toUpperCase(),
      style: zuniaMono(fontSize: 10, letterSpacing: 1.6, color: s.fgStrong),
    );
  }
}

class ZuniaPill extends StatelessWidget {
  const ZuniaPill(this.label, {super.key, this.tone = ZuniaPillTone.neutral});
  final String label;
  final ZuniaPillTone tone;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    Color border;
    Color fg;
    Color? bg;
    switch (tone) {
      case ZuniaPillTone.neutral:
        border = s.line;
        fg = s.fgMuted;
        bg = null;
      case ZuniaPillTone.accent:
        border = s.accent;
        fg = s.accentFg;
        bg = s.accent;
      case ZuniaPillTone.danger:
        border = s.danger.withValues(alpha: 0.45);
        fg = s.danger;
        bg = null;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(ZuniaRadii.full),
        border: Border.all(color: border),
      ),
      child: Text(
        label.toUpperCase(),
        style: zuniaMono(fontSize: 10, letterSpacing: 1.2, color: fg),
      ),
    );
  }
}

enum ZuniaPillTone { neutral, accent, danger }

enum ZuniaCalloutTone { info, danger, warning }

class ZuniaCallout extends StatelessWidget {
  const ZuniaCallout({
    super.key,
    this.title,
    required this.body,
    this.danger = false,
    this.tone,
  });

  final String? title;
  final String body;
  /// Legacy: prefer [tone]. When true and [tone] is null, uses danger.
  final bool danger;
  final ZuniaCalloutTone? tone;

  ZuniaCalloutTone get _tone =>
      tone ?? (danger ? ZuniaCalloutTone.danger : ZuniaCalloutTone.info);

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final t = _tone;
    late final Color border;
    late final Color fill;
    late final Color titleColor;
    late final Color bodyColor;
    late final Color iconColor;

    switch (t) {
      case ZuniaCalloutTone.danger:
        border = s.danger.withValues(alpha: 0.4);
        fill = s.danger.withValues(alpha: 0.12);
        titleColor = s.danger;
        bodyColor = s.danger.withValues(alpha: 0.85);
        iconColor = s.danger;
      case ZuniaCalloutTone.warning:
        border = s.warning.withValues(alpha: 0.38);
        fill = s.warning.withValues(alpha: 0.1);
        titleColor = s.warning;
        bodyColor = s.warning.withValues(alpha: 0.82);
        iconColor = s.warning;
      case ZuniaCalloutTone.info:
        border = s.infoLine;
        fill = s.infoFill;
        titleColor = s.fg;
        bodyColor = s.fgMuted;
        iconColor = s.accent;
    }

    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (t == ZuniaCalloutTone.warning || t == ZuniaCalloutTone.danger)
            Padding(
              padding: const EdgeInsets.only(top: 1),
              child: Icon(
                Icons.warning_amber_rounded,
                size: 16,
                color: iconColor,
              ),
            )
          else
            Container(
              margin: const EdgeInsets.only(top: 5),
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: iconColor,
              ),
            ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: zuniaSans(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: titleColor,
                    ),
                  ),
                if (title != null) const SizedBox(height: 5),
                Text(
                  body,
                  style: zuniaSans(
                    fontSize: 11.5,
                    height: 1.5,
                    color: bodyColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ZuniaEmptyState extends StatelessWidget {
  const ZuniaEmptyState({
    super.key,
    required this.title,
    this.description,
    this.action,
  });
  final String title;
  final String? description;

  /// Optional single call to action, e.g. "Manage networks".
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
      child: Column(
        children: [
          Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: s.lineStrong, style: BorderStyle.solid),
            ),
            child: Text('◇', style: TextStyle(color: s.fgDim, fontSize: 17)),
          ),
          const SizedBox(height: 12),
          Text(title, style: zuniaSans(fontSize: 13.5, fontWeight: FontWeight.w500, color: s.fg)),
          if (description != null) ...[
            const SizedBox(height: 7),
            Text(
              description!,
              textAlign: TextAlign.center,
              style: zuniaSans(fontSize: 11.5, height: 1.5, color: s.fgMuted),
            ),
          ],
          if (action != null) ...[
            const SizedBox(height: 14),
            action!,
          ],
        ],
      ),
    );
  }
}

/// `glass` is the default card wash from the mocks; `hero` is the elevated
/// cobalt→violet panel used for claimable rewards, in-flight transfers and
/// staking summaries; `solid` keeps an opaque surface for sheets and dialogs.
enum ZuniaCardTone { glass, raised, hero, solid }

class ZuniaCard extends StatelessWidget {
  const ZuniaCard({
    super.key,
    required this.child,
    this.padding,
    this.tone = ZuniaCardTone.glass,
    this.radius = 16,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final ZuniaCardTone tone;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);

    Gradient? gradient;
    Color? color;
    Color border = s.line;

    switch (tone) {
      case ZuniaCardTone.glass:
        gradient = s.surfaceGradient;
      case ZuniaCardTone.raised:
        gradient = s.surfaceRaisedGradient;
      case ZuniaCardTone.hero:
        gradient = s.heroGradient;
        border = s.infoLine;
      case ZuniaCardTone.solid:
        color = s.surface;
    }

    return Container(
      padding: padding ?? const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color,
        gradient: gradient,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: border),
      ),
      child: child,
    );
  }
}

class ZuniaKeyValueRow extends StatelessWidget {
  const ZuniaKeyValueRow({super.key, required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: zuniaMono(fontSize: 11, color: s.fgMuted)),
        Text(value, style: zuniaMono(fontSize: 11, color: s.fg)),
      ],
    );
  }
}

class ZuniaSkeleton extends StatelessWidget {
  const ZuniaSkeleton({super.key, this.width, this.height = 9});
  final double? width;
  final double height;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: s.stateHover,
        borderRadius: BorderRadius.circular(ZuniaRadii.full),
      ),
    );
  }
}
