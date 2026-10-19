import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import '../platform/platform.dart';

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
    /// When true (default), the footer floats over the content with no bar chrome.
    this.floatingFooter = true,
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

  /// Floating CTA dock (no full-bleed footer strip). Set false for a solid bar.
  final bool floatingFooter;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final bottomInset = MediaQuery.of(context).viewPadding.bottom;
    final content = Column(
      children: [
        if (title != null || onBack != null || trailing != null)
          ZuniaPlatform.isCupertino(context)
              ? _CupertinoHeader(title: title, onBack: onBack, trailing: trailing)
              : Padding(
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
          floatingFooter
              ? Padding(
                  padding: EdgeInsets.fromLTRB(
                    18,
                    8,
                    18,
                    10 + bottomInset,
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(minWidth: double.infinity),
                    child: footer!,
                  ),
                )
              : DecoratedBox(
                  decoration: BoxDecoration(
                    color: s.screenMid.withValues(alpha: 0.92),
                    border: Border(top: BorderSide(color: s.line)),
                  ),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      16,
                      12,
                      16,
                      12 + bottomInset,
                    ),
                    child: ConstrainedBox(
                      constraints:
                          const BoxConstraints(minWidth: double.infinity),
                      child: footer!,
                    ),
                  ),
                ),
      ],
    );

    if (!gradient) return content;

    return ZuniaBackdrop(child: content);
  }
}

/// iOS navigation bar: a chevron back, the title centred, actions at the end.
class _CupertinoHeader extends StatelessWidget {
  const _CupertinoHeader({this.title, this.onBack, this.trailing});

  final String? title;
  final VoidCallback? onBack;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return SizedBox(
      height: 48,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 72),
              child: Text(
                title!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: zuniaSans(
                  fontSize: 17,
                  fontWeight: FontWeight.w600,
                  letterSpacing: -0.4,
                  color: s.fg,
                ),
              ),
            ),
          if (onBack != null)
            Align(
              alignment: Alignment.centerLeft,
              child: CupertinoButton(
                padding: const EdgeInsets.only(left: 8, right: 12),
                minimumSize: const Size(44, 44),
                onPressed: onBack,
                child: Icon(CupertinoIcons.chevron_back, size: 26, color: s.fg),
              ),
            ),
          if (trailing != null)
            Align(
              alignment: Alignment.centerRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 12),
                child: trailing!,
              ),
            ),
        ],
      ),
    );
  }
}

class _BackControl extends StatelessWidget {
  const _BackControl({required this.onPressed});

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return IconButton(
      onPressed: onPressed,
      tooltip: MaterialLocalizations.of(context).backButtonTooltip,
      visualDensity: VisualDensity.compact,
      icon: Icon(Icons.arrow_back, size: 22, color: s.fg),
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
    final bottomInset = MediaQuery.of(context).viewPadding.bottom;
    return Padding(
      // Float above the home indicator; no full-bleed scaffold bar behind it.
      padding: EdgeInsets.fromLTRB(14, 0, 14, 10 + bottomInset),
      child: Material(
        color: Colors.transparent,
        elevation: 0,
        child: Container(
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
                      padding: const EdgeInsets.symmetric(
                        vertical: 9,
                        horizontal: 4,
                      ),
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
        ),
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

/// The screen ground: a warm gradient with a soft brand glow and a faint dot
/// grid, instead of a flat near-black. Everything sits on it; it never moves.
///
/// Drawn once per page: inside another backdrop (a root tab in the shell) it
/// only shows its child. It reaches up under the status bar, so a page whose
/// content starts below a SafeArea keeps one continuous ground.
class ZuniaBackdrop extends StatelessWidget {
  const ZuniaBackdrop({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (context.getInheritedWidgetOfExactType<_BackdropScope>() != null) {
      return child;
    }
    final dark = Theme.of(context).brightness == Brightness.dark;
    final view = View.of(context);
    final above = view.padding.top / view.devicePixelRatio;
    return _BackdropScope(
      child: Stack(
        fit: StackFit.passthrough,
        clipBehavior: Clip.none,
        children: [
          Positioned(
            left: 0,
            right: 0,
            top: -above,
            bottom: 0,
            child: RepaintBoundary(
              child: CustomPaint(painter: _BackdropPainter(dark: dark)),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _BackdropScope extends InheritedWidget {
  const _BackdropScope({required super.child});

  @override
  bool updateShouldNotify(_BackdropScope oldWidget) => false;
}

class _BackdropPainter extends CustomPainter {
  _BackdropPainter({required this.dark});

  final bool dark;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Offset.zero & size;
    canvas.drawRect(
      rect,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: dark
              ? const [Color(0xFF221A16), Color(0xFF15110F), Color(0xFF0E0C0B)]
              : const [Color(0xFFFCFAF8), Color(0xFFF6F3F0), Color(0xFFF1EEEA)],
          stops: const [0, 0.45, 1],
        ).createShader(rect),
    );

    void glow(Offset center, double radius, Color color) {
      canvas.drawCircle(
        center,
        radius,
        Paint()
          ..shader = RadialGradient(
            colors: [color, color.withValues(alpha: 0)],
          ).createShader(Rect.fromCircle(center: center, radius: radius)),
      );
    }

    final w = size.width;
    glow(
      Offset(w * 0.92, size.height * 0.02),
      w * 0.95,
      const Color(0xFFFF1B0C).withValues(alpha: dark ? 0.17 : 0.07),
    );
    glow(
      Offset(w * 0.05, size.height * 0.98),
      w * 0.8,
      const Color(0xFFFF6A10).withValues(alpha: dark ? 0.07 : 0.04),
    );

    // A dot every 22 px, fading out towards the bottom.
    const step = 22.0;
    final dot = Paint();
    for (var y = step / 2; y < size.height; y += step) {
      final fade = 1 - (y / size.height);
      dot.color = (dark ? const Color(0xFFFFFFFF) : const Color(0xFF000000))
          .withValues(alpha: (dark ? 0.035 : 0.03) * fade);
      for (var x = step / 2; x < w; x += step) {
        canvas.drawCircle(Offset(x, y), 0.8, dot);
      }
    }
  }

  @override
  bool shouldRepaint(_BackdropPainter old) => old.dark != dark;
}

/// The colour at the top of [ZuniaBackdrop], for a Scaffold whose status-bar
/// strip should continue the backdrop drawn below its SafeArea.
Color zuniaGroundTop(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark
        ? const Color(0xFF221A16)
        : const Color(0xFFFCFAF8);
