import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

/// Full-bleed phone chrome: screen gradient fill, optional back/title, footer.
class ZuniaScreenScaffold extends StatelessWidget {
  const ZuniaScreenScaffold({
    super.key,
    this.title,
    this.onBack,
    this.trailing,
    required this.body,
    this.footer,
    this.gradient = true,
    this.padding,
  });

  final String? title;
  final VoidCallback? onBack;
  final Widget? trailing;
  final Widget body;

  /// Pinned below the scrollable body, e.g. Back / Continue actions.
  final Widget? footer;

  /// When true, paints [ZuniaSemantic.screenGradient] behind the content.
  final bool gradient;

  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final content = Column(
      children: [
        if (title != null || onBack != null || trailing != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
            child: Row(
              children: [
                if (onBack != null)
                  _BackControl(onPressed: onBack!),
                if (title != null) ...[
                  if (onBack != null) const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      title!,
                      style: zuniaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        letterSpacing: -0.3,
                        color: s.fg,
                      ),
                    ),
                  ),
                ] else
                  const Spacer(),
                if (trailing != null) trailing!,
              ],
            ),
          ),
        Expanded(
          child: padding == null
              ? body
              : Padding(padding: padding!, child: body),
        ),
        if (footer != null)
          DecoratedBox(
            decoration: BoxDecoration(
              color: s.screenMid.withValues(alpha: 0.92),
              border: Border(top: BorderSide(color: s.line)),
            ),
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                child: footer!,
              ),
            ),
          ),
      ],
    );

    if (!gradient) return content;

    return DecoratedBox(
      decoration: BoxDecoration(gradient: s.screenGradient),
      child: content,
    );
  }
}

class _BackControl extends StatelessWidget {
  const _BackControl({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Material(
      color: s.glass,
      borderRadius: BorderRadius.circular(ZuniaRadii.md),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(ZuniaRadii.md),
        child: SizedBox(
          width: 34,
          height: 34,
          child: Icon(Icons.arrow_back, size: 18, color: s.fgMuted),
        ),
      ),
    );
  }
}

/// Floating root tab bar. Active destination widens into a cobalt pill.
class ZuniaTabBar extends StatelessWidget {
  const ZuniaTabBar({
    super.key,
    required this.items,
    required this.value,
    required this.onChanged,
  });

  final List<({String id, String label, IconData? icon})> items;
  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      margin: const EdgeInsets.fromLTRB(14, 0, 14, 12),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: s.tabBarBg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: s.line),
        boxShadow: [
          BoxShadow(
            color: s.shadow.withValues(alpha: 0.45),
            blurRadius: 30,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Row(
        children: items.map((item) {
          final active = item.id == value;
          return Expanded(
            flex: active ? 5 : 4,
            child: Material(
              color: active ? s.accent : Colors.transparent,
              borderRadius: BorderRadius.circular(999),
              child: InkWell(
                onTap: () => onChanged(item.id),
                borderRadius: BorderRadius.circular(999),
                hoverColor: active
                    ? Colors.white.withValues(alpha: 0.1)
                    : s.stateHover,
                splashColor: active
                    ? Colors.white.withValues(alpha: 0.14)
                    : s.statePress,
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 9, horizontal: 4),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (item.icon != null) ...[
                        Icon(
                          item.icon,
                          size: 20,
                          color: active ? s.accentFg : s.fgDim,
                        ),
                        const SizedBox(height: 4),
                      ],
                      Text(
                        item.label.toUpperCase(),
                        maxLines: 1,
                        overflow: TextOverflow.clip,
                        textAlign: TextAlign.center,
                        style: zuniaMono(
                          fontSize: 8.5,
                          letterSpacing: 1.0,
                          color: active ? s.accentFg : s.fgDim,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

/// Right-side drawer holding everything the tab bar does not.
class ZuniaDrawerPanel extends StatelessWidget {
  const ZuniaDrawerPanel({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Drawer(
      backgroundColor: Colors.transparent,
      width: 288,
      elevation: 0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(left: Radius.circular(28)),
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: s.sheetGradient,
          borderRadius:
              const BorderRadius.horizontal(left: Radius.circular(28)),
          border: Border(left: BorderSide(color: s.line)),
        ),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: children,
          ),
        ),
      ),
    );
  }
}

/// A single row inside [ZuniaDrawerPanel].
class ZuniaDrawerRow extends StatelessWidget {
  const ZuniaDrawerRow({
    super.key,
    required this.icon,
    required this.label,
    this.meta,
    this.badge = false,
    this.active = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String? meta;
  final bool badge;

  /// Raised glass + cobalt icon tile, matching the selected drawer item.
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        hoverColor: s.stateHover,
        splashColor: s.statePress,
        highlightColor: s.statePress,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: active ? s.surfaceRaisedGradient : null,
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 8),
            child: Row(
              children: [
                Container(
                  width: 26,
                  height: 26,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(9),
                    gradient: active ? s.accentGradient : null,
                    color: active ? null : s.glass2,
                  ),
                  child: Icon(
                    icon,
                    size: 14,
                    color: active ? s.accentFg : s.fg,
                  ),
                ),
                const SizedBox(width: 11),
                Expanded(
                  child: Text(
                    label,
                    overflow: TextOverflow.ellipsis,
                    style: zuniaSans(fontSize: 12, color: s.fg),
                  ),
                ),
                if (badge)
                  Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: s.info,
                      shape: BoxShape.circle,
                    ),
                  ),
                if (meta != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    meta!,
                    style: zuniaMono(
                      fontSize: 9,
                      color: active ? s.info : s.fgMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
