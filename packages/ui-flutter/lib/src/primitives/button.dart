import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

enum ZuniaButtonVariant { primary, secondary, ghost, danger }
enum ZuniaButtonSize { sm, md, lg }

class ZuniaButton extends StatelessWidget {
  const ZuniaButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ZuniaButtonVariant.primary,
    this.size = ZuniaButtonSize.md,
    this.loading = false,
    this.leading,
  });

  final String label;
  final VoidCallback? onPressed;
  final ZuniaButtonVariant variant;
  final ZuniaButtonSize size;
  final bool loading;

  /// Optional leading icon shown before [label].
  final Widget? leading;

  double get _height {
    switch (size) {
      case ZuniaButtonSize.sm:
        return ZuniaControls.heightMd;
      case ZuniaButtonSize.md:
        return ZuniaControls.heightLg;
      case ZuniaButtonSize.lg:
        return ZuniaControls.heightMobileCta;
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final disabled = onPressed == null || loading;

    Color bg;
    Color fg;
    BorderSide? side;
    Gradient? gradient;

    switch (variant) {
      case ZuniaButtonVariant.primary:
        // The cobalt→violet ramp plus its glow is the product's primary action.
        bg = s.accent;
        fg = s.accentFg;
        side = null;
        gradient = s.accentGradient;
      case ZuniaButtonVariant.secondary:
        bg = Colors.transparent;
        fg = s.fg;
        side = BorderSide(color: s.lineStrong);
        gradient = s.surfaceRaisedGradient;
      case ZuniaButtonVariant.ghost:
        bg = Colors.transparent;
        fg = s.fgMuted;
        side = null;
      case ZuniaButtonVariant.danger:
        bg = Colors.transparent;
        fg = s.danger;
        side = BorderSide(color: s.danger.withValues(alpha: 0.45));
    }

    final body = SizedBox(
      height: _height,
      child: Material(
        color: gradient != null
            ? Colors.transparent
            : (disabled ? bg.withValues(alpha: s.disabledOpacity) : bg),
        shape: StadiumBorder(side: side ?? BorderSide.none),
        child: InkWell(
          onTap: disabled ? null : onPressed,
          customBorder: const StadiumBorder(),
          hoverColor: variant == ZuniaButtonVariant.primary
              ? Colors.white.withValues(alpha: 0.1)
              : s.stateHover,
          splashColor: variant == ZuniaButtonVariant.primary
              ? Colors.white.withValues(alpha: 0.16)
              : s.statePress,
          highlightColor: variant == ZuniaButtonVariant.primary
              ? Colors.white.withValues(alpha: 0.08)
              : s.statePress,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: size == ZuniaButtonSize.sm ? 16 : 22),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (loading) ...[
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: fg),
                  ),
                  const SizedBox(width: 8),
                ] else if (leading != null) ...[
                  IconTheme(
                    data: IconThemeData(color: fg, size: size == ZuniaButtonSize.sm ? 14 : 16),
                    child: leading!,
                  ),
                  const SizedBox(width: 8),
                ],
                Text(
                  label,
                  style: zuniaSans(
                    fontSize: size == ZuniaButtonSize.sm ? 11.5 : 13,
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

    if (gradient == null) return body;

    return Opacity(
      opacity: disabled ? s.disabledOpacity : 1,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(ZuniaRadii.full),
          boxShadow: variant == ZuniaButtonVariant.primary && !disabled
              ? [
                  BoxShadow(
                    color: const Color(0xFF3B6BFF).withValues(alpha: 0.4),
                    blurRadius: 22,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        child: body,
      ),
    );
  }
}
