import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import 'zunia_semantics_ext.dart';

/// Quiet 1px focus edge matching web (no offset halo).
class ZuniaFocusRing extends StatelessWidget {
  const ZuniaFocusRing({
    super.key,
    required this.child,
    this.focused = false,
    this.borderRadius,
  });

  final Widget child;
  final bool focused;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    if (!focused) return child;
    return Container(
      decoration: BoxDecoration(
        borderRadius: borderRadius ?? BorderRadius.circular(ZuniaRadii.full),
        border: Border.all(
          color: s.accent.withValues(alpha: 0.4),
          width: ZuniaControls.focusWidth,
        ),
      ),
      child: child,
    );
  }
}
