import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

enum ZuniaToastTone { neutral, success, danger, info }

/// Transient confirmation card (React `Toast`).
///
/// Rendered inside a transparent [SnackBar] by [showZuniaToast] so the card,
/// not Material's slab, is what the user sees.
class ZuniaToast extends StatelessWidget {
  const ZuniaToast({
    super.key,
    required this.title,
    this.meta,
    this.tone = ZuniaToastTone.neutral,
  });

  final String title;

  /// Trailing monospace detail — a tx hash tail, a chain id, a timestamp.
  final String? meta;
  final ZuniaToastTone tone;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);

    late final Color badge;
    late final IconData icon;
    switch (tone) {
      case ZuniaToastTone.neutral:
        badge = s.accent;
        icon = Icons.check;
      case ZuniaToastTone.success:
        badge = s.success;
        icon = Icons.check;
      case ZuniaToastTone.danger:
        badge = s.danger;
        icon = Icons.priority_high;
      case ZuniaToastTone.info:
        badge = s.info;
        icon = Icons.info_outline;
    }

    // The badge foreground is `bg`, not `accentFg`: accentFg is tuned for the
    // accent ramp only and drops to 3.29:1 on `danger` in light. bg measures
    // 3.41:1 on accent light / 5.10 dark, 5.27/5.64 on danger, 5.79/10.98 on
    // success and 5.18/8.38 on info — the icon is a non-text glyph, so the 3:1
    // floor in WCAG 1.4.11 applies rather than 4.5:1.
    // No Semantics wrapper here: showZuniaToast presents this inside a SnackBar,
    // which already publishes a live region, and a nested one announces twice.
    return Container(
      decoration: BoxDecoration(
        color: s.surfaceRaised,
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        border: Border.all(color: s.lineStrong),
        boxShadow: [
          BoxShadow(
            color: s.shadow,
            blurRadius: 34,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(
        horizontal: ZuniaSpace.s3,
        vertical: ZuniaSpace.s3,
      ),
      child: Row(
        children: [
          Container(
            width: 26,
            height: 26,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: badge,
              borderRadius: BorderRadius.circular(ZuniaRadii.sm),
            ),
            child: Icon(icon, size: 15, color: s.bg),
          ),
          const SizedBox(width: ZuniaSpace.s3),
          Expanded(
            // fg on surfaceRaised: 17.95:1 light / 15.49:1 dark.
            child: Text(
              title,
              style: zuniaSans(
                fontSize: ZuniaType.caption,
                fontWeight: FontWeight.w500,
                color: s.fg,
              ),
            ),
          ),
          if (meta != null) ...[
            const SizedBox(width: ZuniaSpace.s2),
            // fgDim on surfaceRaised: 5.46:1 light / 5.11:1 dark.
            Text(
              meta!,
              style: zuniaMono(fontSize: ZuniaType.monoMicro, color: s.fgDim),
            ),
          ],
        ],
      ),
    );
  }
}

/// Raises a [ZuniaToast] through the ambient [ScaffoldMessenger].
///
/// The SnackBar itself is stripped to nothing so the toast card carries the
/// whole appearance; a bare `SnackBar(content: Text(...))` inherits Material's
/// inverse-surface slab instead.
ScaffoldFeatureController<SnackBar, SnackBarClosedReason> showZuniaToast(
  BuildContext context,
  String title, {
  String? meta,
  ZuniaToastTone tone = ZuniaToastTone.neutral,
  Duration duration = const Duration(seconds: 3),
}) {
  return ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: ZuniaToast(title: title, meta: meta, tone: tone),
      duration: duration,
      behavior: SnackBarBehavior.floating,
      backgroundColor: Colors.transparent,
      // The theme gives a bare SnackBar a bordered card; this one carries its
      // own, so drop the outer shape or the border is drawn twice.
      shape: const RoundedRectangleBorder(side: BorderSide.none),
      elevation: 0,
      padding: EdgeInsets.zero,
      margin: const EdgeInsets.all(ZuniaSpace.s4),
      dismissDirection: DismissDirection.horizontal,
    ),
  );
}

/// Bottom-sheet chrome (React `SheetContent`).
///
/// Four screens had copied this gradient/radius/border block by hand and it had
/// already drifted — 28px corners against the 30px `ZuniaRadii.sheet`, and a
/// `line` top edge in some places against `lineStrong` in others.
class ZuniaSheet extends StatelessWidget {
  const ZuniaSheet({
    super.key,
    required this.child,
    this.title,
    this.padding = const EdgeInsets.fromLTRB(
      ZuniaSpace.s5,
      ZuniaSpace.s3,
      ZuniaSpace.s5,
      ZuniaSpace.s6,
    ),
  });

  final Widget child;
  final String? title;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: s.sheetGradient,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(ZuniaRadii.sheet),
        ),
        border: Border(top: BorderSide(color: s.lineStrong)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: padding,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 38,
                  height: 4,
                  decoration: BoxDecoration(
                    color: s.lineStrong,
                    borderRadius: BorderRadius.circular(ZuniaRadii.full),
                  ),
                ),
              ),
              if (title != null) ...[
                const SizedBox(height: ZuniaSpace.s4),
                // fg on the sheet ground: 17.95:1 light / 16.24:1 dark.
                Text(
                  title!,
                  style: zuniaSans(
                    fontSize: ZuniaType.heading,
                    fontWeight: FontWeight.w500,
                    letterSpacing: -0.3,
                    color: s.fg,
                  ),
                ),
              ],
              const SizedBox(height: ZuniaSpace.s4),
              Flexible(child: child),
            ],
          ),
        ),
      ),
    );
  }
}

/// Presents [builder] inside [ZuniaSheet].
///
/// [isScrollControlled] defaults to true: the Material default caps a sheet at
/// 9/16 of the screen, which pushes the confirm action out of reach on a short
/// phone.
Future<T?> showZuniaSheet<T>(
  BuildContext context, {
  required WidgetBuilder builder,
  String? title,
  bool isScrollControlled = true,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: isScrollControlled,
    useSafeArea: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => ZuniaSheet(title: title, child: builder(ctx)),
  );
}

/// Modal dialog (React `Dialog`).
class ZuniaDialog extends StatelessWidget {
  const ZuniaDialog({
    super.key,
    required this.title,
    required this.child,
    this.actions = const [],
    this.danger = false,
  });

  final String title;
  final Widget child;
  final List<Widget> actions;

  /// Destructive confirmations take a danger edge so the dialog reads as one
  /// before the button text is parsed.
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return AlertDialog(
      // Colours, radius and text styles come from the theme's dialogTheme; only
      // the destructive edge is per-instance.
      shape: danger
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(ZuniaRadii.xxl),
              side: BorderSide(color: s.dangerLine),
            )
          : null,
      title: Text(title),
      content: child,
      actionsPadding: const EdgeInsets.fromLTRB(
        ZuniaSpace.s4,
        0,
        ZuniaSpace.s4,
        ZuniaSpace.s4,
      ),
      actions: actions,
    );
  }
}

/// Presents a [ZuniaDialog].
Future<T?> showZuniaDialog<T>(
  BuildContext context, {
  required String title,
  required WidgetBuilder builder,
  List<Widget> Function(BuildContext context)? actions,
  bool danger = false,
}) {
  return showDialog<T>(
    context: context,
    builder: (ctx) => ZuniaDialog(
      title: title,
      danger: danger,
      actions: actions?.call(ctx) ?? const [],
      child: builder(ctx),
    ),
  );
}
