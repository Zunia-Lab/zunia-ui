import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';

enum ZuniaIconButtonVariant { secondary, ghost, danger }

enum ZuniaIconButtonSize { sm, md }

/// Icon-only control, mirroring React `IconButton`.
///
/// [label] is required and feeds both the tooltip and the semantics node. An
/// icon-only button with no accessible name is unreachable to TalkBack and
/// VoiceOver — that is the failure the React side prevents by making
/// `aria-label` mandatory, and it is just as easy to hit here.
class ZuniaIconButton extends StatelessWidget {
  const ZuniaIconButton({
    super.key,
    required this.label,
    required this.icon,
    this.onPressed,
    this.variant = ZuniaIconButtonVariant.ghost,
    this.size = ZuniaIconButtonSize.md,
  });

  /// Tooltip text and accessible name. Required, never decorative.
  final String label;
  final IconData icon;
  final VoidCallback? onPressed;
  final ZuniaIconButtonVariant variant;
  final ZuniaIconButtonSize size;

  double get _side => size == ZuniaIconButtonSize.sm
      ? ZuniaControls.heightMd
      : ZuniaControls.heightLg;

  double get _iconSize => size == ZuniaIconButtonSize.sm ? 16 : 18;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final disabled = onPressed == null;

    late final Color fg;
    late final BorderSide? side;
    switch (variant) {
      case ZuniaIconButtonVariant.secondary:
        // fg on surface: 18.88:1 light / 16.24:1 dark.
        fg = s.fg;
        side = BorderSide(color: s.lineStrong);
      case ZuniaIconButtonVariant.ghost:
        // fgMuted on surface: 9.74:1 light / 10.86:1 dark.
        fg = s.fgMuted;
        side = null;
      case ZuniaIconButtonVariant.danger:
        // danger on surface: 6.00:1 light / 5.28:1 dark.
        fg = s.danger;
        side = BorderSide(color: s.dangerLine);
    }

    // MergeSemantics, not a second Semantics node: Tooltip contributes the
    // label and InkWell contributes button + enabled + onTap, and without the
    // merge a screen reader walks them as two separate nodes.
    return MergeSemantics(
      child: Tooltip(
        message: label,
        child: SizedBox(
          width: _side,
          height: _side,
          child: Material(
            color: Colors.transparent,
            shape: CircleBorder(side: side ?? BorderSide.none),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: onPressed,
              customBorder: const CircleBorder(),
              hoverColor: s.stateHover,
              splashColor: s.statePress,
              highlightColor: s.statePress,
              child: Center(
                child: Icon(
                  icon,
                  size: _iconSize,
                  color:
                      disabled ? fg.withValues(alpha: s.disabledOpacity) : fg,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
