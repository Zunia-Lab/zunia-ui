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
        border = s.dangerLine;
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
      // The tone tokens (…Line/…Fill/…Fg) are exactly the combinations
      // @zunialab/tokens measures in check:contrast. The danger and warning
      // branches used to mix their own alphas instead, and the faded body copy
      // that produced fell below AA: danger at 85% measured 3.95:1 light /
      // 3.72:1 dark on its fill, warning at 82% measured 3.65:1 light. The flat
      // …Fg tokens are gate-certified at 6.77:1 / 10.38:1 and 5.80:1 / 10.45:1
      // over surfaceRaised.
      case ZuniaCalloutTone.danger:
        border = s.dangerLine;
        fill = s.dangerFill;
        titleColor = s.danger;
        bodyColor = s.dangerFg;
        iconColor = s.danger;
      case ZuniaCalloutTone.warning:
        border = s.warningLine;
        fill = s.warningFill;
        titleColor = s.warning;
        bodyColor = s.warningFg;
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
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
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

/// Indeterminate activity indicator (React `Spinner`).
///
/// Wraps [CircularProgressIndicator] so call sites stop re-deriving a stroke
/// width and a colour; an unstyled indicator picks up Material's primary and
/// its own track, neither of which matched the palette before the theme carried
/// a `progressIndicatorTheme`.
class ZuniaSpinner extends StatelessWidget {
  const ZuniaSpinner({
    super.key,
    this.size = 16,
    this.color,
    this.semanticsLabel = 'Loading',
  });

  final double size;

  /// Defaults to the accent. Pass the surrounding foreground when the spinner
  /// sits on an accent fill, where accent-on-accent would be invisible.
  final Color? color;

  /// Announced by screen readers; a bare spinner is silent otherwise.
  final String semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return SizedBox(
      width: size,
      height: size,
      child: CircularProgressIndicator(
        strokeWidth: size <= 16 ? 2 : 2.5,
        // accent against surface is 3.88:1 light / 4.77:1 dark — above the 3:1
        // that WCAG 1.4.11 asks of a non-text indicator.
        color: color ?? s.accent,
        semanticsLabel: semanticsLabel,
      ),
    );
  }
}

/// Label / value / delta stack (React `Stat`).
class ZuniaStat extends StatelessWidget {
  const ZuniaStat({
    super.key,
    required this.label,
    required this.value,
    this.delta,
    this.crossAxisAlignment = CrossAxisAlignment.start,
  });

  final String label;
  final String value;
  final String? delta;
  final CrossAxisAlignment crossAxisAlignment;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: crossAxisAlignment,
      children: [
        // fgStrong on surface: 17.40:1 light / 14.61:1 dark.
        Text(
          label.toUpperCase(),
          style: zuniaMono(
            fontSize: ZuniaType.labelCaps,
            letterSpacing: 1.4,
            color: s.fgStrong,
          ),
        ),
        const SizedBox(height: ZuniaSpace.s1 + 2),
        // fg on surface: 18.88:1 light / 16.24:1 dark.
        Text(
          value,
          style: zuniaSans(
            fontSize: ZuniaType.title,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.6,
            color: s.fg,
            tabular: const FontFeature.tabularFigures(),
          ),
        ),
        if (delta != null) ...[
          const SizedBox(height: ZuniaSpace.s1),
          // fgDim on surface: 5.74:1 light / 5.36:1 dark.
          Text(
            delta!,
            style: zuniaMono(fontSize: ZuniaType.mono, color: s.fgDim),
          ),
        ],
      ],
    );
  }
}

/// Tappable list row with leading/trailing slots (React `ListRow`).
///
/// The selected state is carried by a fill *and* an accent edge, not by colour
/// alone, so it survives a monochrome or high-contrast rendering.
class ZuniaListRow extends StatelessWidget {
  const ZuniaListRow({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.onTap,
    this.selected = false,
    this.danger = false,
  });

  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool selected;

  /// Destructive rows (remove wallet, forget dApp) take the danger foreground.
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    // fg on surface 18.88:1 light / 16.24:1 dark; on the selected fill it is
    // 15.61:1 / 12.13:1. danger on surface: 6.00:1 / 5.28:1.
    final titleColor = danger ? s.danger : s.fg;

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
                  border: Border(
                    left: BorderSide(color: s.accent, width: 2),
                  ),
                )
              : null,
          padding: EdgeInsets.fromLTRB(
            selected ? ZuniaSpace.s4 - 2 : ZuniaSpace.s4,
            ZuniaSpace.s3,
            ZuniaSpace.s4,
            ZuniaSpace.s3,
          ),
          child: Row(
            children: [
              if (leading != null) ...[
                leading!,
                const SizedBox(width: ZuniaSpace.s3),
              ],
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      overflow: TextOverflow.ellipsis,
                      style: zuniaSans(
                        fontSize: ZuniaType.label,
                        fontWeight: FontWeight.w500,
                        color: titleColor,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      // fgMuted on surface: 9.74:1 light / 10.86:1 dark.
                      Text(
                        subtitle!,
                        overflow: TextOverflow.ellipsis,
                        style: zuniaSans(
                          fontSize: ZuniaType.caption,
                          color: s.fgMuted,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: ZuniaSpace.s3),
                trailing!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}
