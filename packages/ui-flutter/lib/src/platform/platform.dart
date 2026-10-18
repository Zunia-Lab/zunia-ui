import 'dart:async';
import 'dart:ui' show ImageFilter;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

/// Which platform's conventions a widget follows.
///
/// Read from [ThemeData.platform], not from `dart:io`, so a test or a design
/// review can render the iPhone build on an Android device and the other way
/// round by overriding the theme.
enum ZuniaPlatformStyle { cupertino, material }

abstract final class ZuniaPlatform {
  static ZuniaPlatformStyle of(BuildContext context) =>
      styleFor(Theme.of(context).platform);

  static ZuniaPlatformStyle styleFor(TargetPlatform platform) {
    switch (platform) {
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return ZuniaPlatformStyle.cupertino;
      case TargetPlatform.android:
      case TargetPlatform.fuchsia:
      case TargetPlatform.linux:
      case TargetPlatform.windows:
        return ZuniaPlatformStyle.material;
    }
  }

  static bool isCupertino(BuildContext context) =>
      of(context) == ZuniaPlatformStyle.cupertino;
}

/// Haptics with the platform's own vocabulary.
///
/// iOS has notification feedback (success, warning, error) and Android 11+ has
/// CONFIRM and REJECT; Flutter's [HapticFeedback] exposes neither. The app
/// registers `zunia/haptics` natively for those; when it is absent (tests, an
/// older host) the nearest impact is played instead, so a caller never has to
/// care which build it runs in.
abstract final class ZuniaHaptics {
  static const _channel = MethodChannel('zunia/haptics');
  static bool _nativeMissing = false;

  /// A value changed: a tab, a segment, a picker row.
  static Future<void> selection() => HapticFeedback.selectionClick();

  /// A light tap: a button that opens something.
  static Future<void> light() => HapticFeedback.lightImpact();

  /// A firm tap: hold-to-confirm passing its threshold.
  static Future<void> medium() => HapticFeedback.mediumImpact();

  static Future<void> success() =>
      _notify('success', HapticFeedback.mediumImpact);

  static Future<void> warning() =>
      _notify('warning', HapticFeedback.lightImpact);

  static Future<void> error() => _notify('error', HapticFeedback.heavyImpact);

  static Future<void> _notify(
      String kind, Future<void> Function() fallback) async {
    if (!_nativeMissing) {
      try {
        await _channel.invokeMethod<void>(kind);
        return;
      } on MissingPluginException {
        _nativeMissing = true;
      } on PlatformException {
        // Fall through to the impact below.
      }
    }
    await fallback();
  }
}

/// Spinner in the platform's own shape.
class ZuniaActivityIndicator extends StatelessWidget {
  const ZuniaActivityIndicator({super.key, this.size = 20, this.color});

  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    if (ZuniaPlatform.isCupertino(context)) {
      return CupertinoActivityIndicator(
        radius: size / 2,
        color: color ?? s.fgMuted,
      );
    }
    return SizedBox.square(
      dimension: size,
      child: CircularProgressIndicator(
        strokeWidth: size >= 28 ? 3 : 2.25,
        color: color ?? s.accent,
      ),
    );
  }
}

/// On/off control: the iOS switch on iPhone, the Material 3 switch on Android.
class ZuniaAdaptiveSwitch extends StatelessWidget {
  const ZuniaAdaptiveSwitch({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final bool value;
  final ValueChanged<bool>? onChanged;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final changed = onChanged == null
        ? null
        : (bool next) {
            ZuniaHaptics.selection();
            onChanged!(next);
          };
    if (ZuniaPlatform.isCupertino(context)) {
      return CupertinoSwitch(
        value: value,
        onChanged: changed,
        activeTrackColor: s.accent,
      );
    }
    return Switch(
      value: value,
      onChanged: changed,
      activeThumbColor: s.accentFg,
      activeTrackColor: s.accent,
      inactiveThumbColor: s.fgDim,
      inactiveTrackColor: s.stateHover,
      trackOutlineColor: WidgetStatePropertyAll(s.lineStrong),
    );
  }
}

/// One button of an alert or an action sheet.
class ZuniaAlertAction<T> {
  const ZuniaAlertAction({
    required this.label,
    this.value,
    this.destructive = false,
    this.isDefault = false,
  });

  final String label;

  /// What the dialog returns when this action is chosen.
  final T? value;
  final bool destructive;

  /// The action Return triggers, drawn bold on iOS.
  final bool isDefault;
}

/// A short question with two or three answers: `UIAlertController` on iOS,
/// a Material 3 dialog on Android. Dismissing returns null.
Future<T?> showZuniaAlert<T>(
  BuildContext context, {
  required String title,
  String? message,
  Widget? content,
  required List<ZuniaAlertAction<T>> actions,
}) {
  final body = content ?? (message == null ? null : Text(message));
  if (ZuniaPlatform.isCupertino(context)) {
    return showCupertinoDialog<T>(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => CupertinoAlertDialog(
        title: Text(title),
        content: body == null
            ? null
            : Padding(padding: const EdgeInsets.only(top: 6), child: body),
        actions: [
          for (final action in actions)
            CupertinoDialogAction(
              isDestructiveAction: action.destructive,
              isDefaultAction: action.isDefault,
              onPressed: () => Navigator.of(ctx).pop(action.value),
              child: Text(action.label),
            ),
        ],
      ),
    );
  }
  return showDialog<T>(
    context: context,
    builder: (ctx) {
      final s = ZuniaSemanticsExt.of(ctx);
      return AlertDialog(
        title: Text(title),
        content: body,
        actions: [
          for (final action in actions)
            TextButton(
              style: TextButton.styleFrom(
                foregroundColor: action.destructive
                    ? s.danger
                    : action.isDefault
                        ? s.fg
                        : s.fgMuted,
                textStyle: zuniaSans(
                  fontSize: ZuniaType.label,
                  fontWeight:
                      action.isDefault ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
              onPressed: () => Navigator.of(ctx).pop(action.value),
              child: Text(action.label),
            ),
        ],
      );
    },
  );
}

/// "Are you sure?" with one answer that does it. True only when confirmed.
Future<bool> showZuniaConfirm(
  BuildContext context, {
  required String title,
  String? message,
  required String confirmLabel,
  String cancelLabel = 'Cancel',
  bool destructive = false,
}) async {
  final answer = await showZuniaAlert<bool>(
    context,
    title: title,
    message: message,
    actions: [
      ZuniaAlertAction(label: cancelLabel, value: false),
      ZuniaAlertAction(
        label: confirmLabel,
        value: true,
        destructive: destructive,
        isDefault: !destructive,
      ),
    ],
  );
  return answer ?? false;
}

/// A choice among a few actions: the iOS action sheet rising from the bottom,
/// or a Material 3 bottom sheet list on Android.
Future<T?> showZuniaActionSheet<T>(
  BuildContext context, {
  String? title,
  String? message,
  required List<ZuniaAlertAction<T>> actions,
  String cancelLabel = 'Cancel',
}) {
  ZuniaHaptics.light();
  if (ZuniaPlatform.isCupertino(context)) {
    return showCupertinoModalPopup<T>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: title == null ? null : Text(title),
        message: message == null ? null : Text(message),
        actions: [
          for (final action in actions)
            CupertinoActionSheetAction(
              isDestructiveAction: action.destructive,
              isDefaultAction: action.isDefault,
              onPressed: () => Navigator.of(ctx).pop(action.value),
              child: Text(action.label),
            ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.of(ctx).pop(),
          child: Text(cancelLabel),
        ),
      ),
    );
  }
  return showModalBottomSheet<T>(
    context: context,
    showDragHandle: true,
    useSafeArea: true,
    builder: (ctx) {
      final s = ZuniaSemanticsExt.of(ctx);
      return SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (title != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 4),
                child: Text(
                  title,
                  style: zuniaSans(
                    fontSize: ZuniaType.heading,
                    fontWeight: FontWeight.w500,
                    color: s.fg,
                  ),
                ),
              ),
            if (message != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
                child: Text(
                  message,
                  style: zuniaSans(fontSize: ZuniaType.body, color: s.fgMuted),
                ),
              ),
            for (final action in actions)
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 24),
                title: Text(
                  action.label,
                  style: zuniaSans(
                    fontSize: ZuniaType.label + 1,
                    fontWeight:
                        action.isDefault ? FontWeight.w600 : FontWeight.w400,
                    color: action.destructive ? s.danger : s.fg,
                  ),
                ),
                onTap: () => Navigator.of(ctx).pop(action.value),
              ),
            const SizedBox(height: 8),
          ],
        ),
      );
    },
  );
}

/// Grouped settings rows: inset and rounded on iOS (Settings.app), flat with a
/// section label on Android (Material 3 settings lists).
class ZuniaListSection extends StatelessWidget {
  const ZuniaListSection({
    super.key,
    this.header,
    this.footer,
    required this.children,
  });

  final String? header;
  final String? footer;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final cupertino = ZuniaPlatform.isCupertino(context);
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      rows.add(children[i]);
      if (cupertino && i < children.length - 1) {
        rows.add(
          Padding(
            // iOS separators start under the title, not at the edge.
            padding: const EdgeInsetsDirectional.only(start: 56),
            child: Container(height: 0.5, color: s.line),
          ),
        );
      }
    }

    final headerText = header == null
        ? null
        : Padding(
            padding: cupertino
                ? const EdgeInsets.fromLTRB(32, 22, 32, 7)
                : const EdgeInsets.fromLTRB(20, 20, 20, 6),
            child: Text(
              cupertino ? header!.toUpperCase() : header!,
              style: cupertino
                  ? zuniaSans(
                      fontSize: 12.5,
                      letterSpacing: 0.2,
                      color: s.fgDim,
                    )
                  : zuniaSans(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.1,
                      color: s.accent,
                    ),
            ),
          );
    final footerText = footer == null
        ? null
        : Padding(
            padding: cupertino
                ? const EdgeInsets.fromLTRB(32, 7, 32, 0)
                : const EdgeInsets.fromLTRB(20, 4, 20, 0),
            child: Text(
              footer!,
              style: zuniaSans(fontSize: 12.5, height: 1.35, color: s.fgDim),
            ),
          );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (headerText != null) headerText,
        if (cupertino)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: ColoredBox(
                color: s.surface,
                child: Column(mainAxisSize: MainAxisSize.min, children: rows),
              ),
            ),
          )
        else
          Column(mainAxisSize: MainAxisSize.min, children: rows),
        if (footerText != null) footerText,
      ],
    );
  }
}

/// A row inside [ZuniaListSection].
///
/// Navigation rows end in a chevron on iOS only: Android never draws one. iOS
/// rows highlight while pressed; Android rows ripple.
class ZuniaListTile extends StatelessWidget {
  const ZuniaListTile({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.value,
    this.onTap,
    this.navigates = false,
    this.destructive = false,
  });

  final String title;
  final String? subtitle;

  /// An icon, usually; iOS draws it on a tinted rounded square.
  final IconData? leading;
  final Widget? trailing;

  /// Current setting shown on the right (e.g. "10 min").
  final String? value;
  final VoidCallback? onTap;

  /// Opens another screen.
  final bool navigates;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final cupertino = ZuniaPlatform.isCupertino(context);
    final titleColor = destructive ? s.danger : s.fg;

    Widget? lead;
    if (leading != null) {
      lead = cupertino
          ? Container(
              width: 29,
              height: 29,
              decoration: BoxDecoration(
                color: destructive ? s.dangerFill : s.glass2,
                borderRadius: BorderRadius.circular(7),
              ),
              child:
                  Icon(leading, size: 17, color: destructive ? s.danger : s.fg),
            )
          : SizedBox(
              width: 24,
              child: Icon(leading,
                  size: 22, color: destructive ? s.danger : s.fgMuted),
            );
    }

    final trailingParts = <Widget>[
      if (value != null)
        Flexible(
          child: Text(
            value!,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: zuniaSans(fontSize: cupertino ? 15 : 14, color: s.fgDim),
          ),
        ),
      if (trailing != null) trailing!,
      if (navigates && cupertino)
        Padding(
          padding: const EdgeInsets.only(left: 6),
          child:
              Icon(CupertinoIcons.chevron_forward, size: 16, color: s.fgFaint),
        ),
    ];

    final row = Padding(
      padding: cupertino
          ? EdgeInsets.fromLTRB(
              16, subtitle == null ? 11 : 9, 14, subtitle == null ? 11 : 9)
          : EdgeInsets.fromLTRB(
              20, subtitle == null ? 14 : 12, 20, subtitle == null ? 14 : 12),
      child: Row(
        children: [
          if (lead != null) ...[lead, SizedBox(width: cupertino ? 12 : 20)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  title,
                  style: zuniaSans(
                    fontSize: cupertino ? 16 : 16,
                    fontWeight: cupertino ? FontWeight.w400 : FontWeight.w500,
                    letterSpacing: cupertino ? -0.3 : 0,
                    color: titleColor,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style:
                        zuniaSans(fontSize: 13, height: 1.3, color: s.fgMuted),
                  ),
                ],
              ],
            ),
          ),
          if (trailingParts.isNotEmpty) ...[
            const SizedBox(width: 10),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 180),
              child:
                  Row(mainAxisSize: MainAxisSize.min, children: trailingParts),
            ),
          ],
        ],
      ),
    );

    if (onTap == null) return row;
    if (cupertino) return _PressHighlight(onTap: onTap!, child: row);
    return InkWell(onTap: onTap, child: row);
  }
}

/// iOS table-cell press state: grey while the finger is down, no ripple.
class _PressHighlight extends StatefulWidget {
  const _PressHighlight({required this.onTap, required this.child});

  final VoidCallback onTap;
  final Widget child;

  @override
  State<_PressHighlight> createState() => _PressHighlightState();
}

class _PressHighlightState extends State<_PressHighlight> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => setState(() => _down = true),
      onTapCancel: () => setState(() => _down = false),
      onTapUp: (_) => setState(() => _down = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: _down ? 0 : 220),
        color: _down ? s.statePress : Colors.transparent,
        child: widget.child,
      ),
    );
  }
}

/// One destination of [ZuniaNavigationBar].
class ZuniaTabItem {
  const ZuniaTabItem({
    required this.id,
    required this.label,
    required this.icon,
    this.activeIcon,
    this.cupertinoIcon,
    this.cupertinoActiveIcon,
    this.badge,
  });

  final String id;
  final String label;
  final IconData icon;
  final IconData? activeIcon;

  /// SF-style glyph used on iOS; [icon] otherwise.
  final IconData? cupertinoIcon;
  final IconData? cupertinoActiveIcon;

  /// Count shown on the icon; null or 0 hides it.
  final int? badge;
}

/// The root tab bar each platform expects.
///
/// iOS: a translucent bar across the bottom edge, blurred over the content
/// that scrolls under it, tinted icon and label on the selected tab.
/// Android: a Material 3 navigation bar with the tonal pill indicator.
///
/// Place it in `Scaffold.bottomNavigationBar` with `extendBody: true`, so the
/// iOS bar can blur what scrolls beneath it.
class ZuniaNavigationBar extends StatelessWidget {
  const ZuniaNavigationBar({
    super.key,
    required this.items,
    required this.value,
    required this.onChanged,
  });

  final List<ZuniaTabItem> items;
  final String value;
  final ValueChanged<String> onChanged;

  int get _index {
    final i = items.indexWhere((item) => item.id == value);
    return i < 0 ? 0 : i;
  }

  void _select(int index) {
    final id = items[index].id;
    if (id != value) ZuniaHaptics.selection();
    onChanged(id);
  }

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    if (ZuniaPlatform.isCupertino(context)) {
      final bottom = MediaQuery.of(context).viewPadding.bottom;
      return ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: s.screenMid.withValues(alpha: 0.78),
              border: Border(top: BorderSide(color: s.line, width: 0.5)),
            ),
            child: Padding(
              padding: EdgeInsets.only(bottom: bottom, top: 6),
              child: SizedBox(
                height: 50,
                child: Row(
                  children: [
                    for (var i = 0; i < items.length; i++)
                      Expanded(
                        child: _CupertinoTab(
                          item: items[i],
                          active: i == _index,
                          onTap: () => _select(i),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return NavigationBarTheme(
      data: NavigationBarThemeData(
        backgroundColor: s.surface,
        surfaceTintColor: Colors.transparent,
        indicatorColor: s.accent.withValues(alpha: 0.18),
        height: 72,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => zuniaSans(
            fontSize: 12,
            fontWeight: states.contains(WidgetState.selected)
                ? FontWeight.w600
                : FontWeight.w500,
            color: states.contains(WidgetState.selected) ? s.fg : s.fgMuted,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            size: 24,
            color: states.contains(WidgetState.selected) ? s.accent : s.fgMuted,
          ),
        ),
      ),
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: s.line)),
        ),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _select,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            for (final item in items)
              NavigationDestination(
                icon: _badged(item.icon, item.badge, s),
                selectedIcon:
                    _badged(item.activeIcon ?? item.icon, item.badge, s),
                label: item.label,
              ),
          ],
        ),
      ),
    );
  }

  static Widget _badged(IconData icon, int? badge, ZuniaSemantic s) {
    if (badge == null || badge <= 0) return Icon(icon);
    return Badge(
      label: Text(badge > 99 ? '99+' : '$badge'),
      backgroundColor: s.accent,
      textColor: s.accentFg,
      child: Icon(icon),
    );
  }
}

class _CupertinoTab extends StatelessWidget {
  const _CupertinoTab({
    required this.item,
    required this.active,
    required this.onTap,
  });

  final ZuniaTabItem item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final color = active ? s.accent : s.fgDim;
    final icon = active
        ? (item.cupertinoActiveIcon ??
            item.cupertinoIcon ??
            item.activeIcon ??
            item.icon)
        : (item.cupertinoIcon ?? item.icon);
    Widget glyph = Icon(icon, size: 25, color: color);
    final badge = item.badge;
    if (badge != null && badge > 0) {
      glyph = Badge(
        label: Text(badge > 99 ? '99+' : '$badge'),
        backgroundColor: s.danger,
        textColor: Colors.white,
        child: glyph,
      );
    }
    return Semantics(
      selected: active,
      button: true,
      label: item.label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: ExcludeSemantics(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              glyph,
              const SizedBox(height: 2),
              Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.clip,
                style: zuniaSans(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w500,
                  letterSpacing: 0.1,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A screen whose title starts large and settles into the bar as the content
/// scrolls: the iOS large-title navigation bar, the Material 3 large top app
/// bar on Android.
///
/// [slivers] are the content. Wrap a plain list in `SliverList` /
/// `SliverToBoxAdapter`.
class ZuniaLargeTitleScaffold extends StatelessWidget {
  const ZuniaLargeTitleScaffold({
    super.key,
    required this.title,
    required this.slivers,
    this.actions = const [],
    this.onRefresh,
    this.showBack,
  });

  final String title;
  final List<Widget> slivers;
  final List<Widget> actions;
  final Future<void> Function()? onRefresh;

  /// Defaults to whether there is a route to go back to.
  final bool? showBack;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final canPop = showBack ?? Navigator.of(context).canPop();
    final cupertino = ZuniaPlatform.isCupertino(context);
    final bottom = MediaQuery.of(context).padding.bottom;

    if (cupertino) {
      // CupertinoPageScaffold sets no Material ancestor and no text style, so
      // Material rows (ink, ListTile) would assert and plain Text would fall
      // back to Flutter's debug style. A transparent Material provides both.
      return CupertinoPageScaffold(
        backgroundColor: s.screenMid,
        child: Material(
          type: MaterialType.transparency,
          textStyle: zuniaSans(fontSize: 15, color: s.fg),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            slivers: [
              CupertinoSliverNavigationBar(
                largeTitle: Text(title),
                backgroundColor: s.screenMid.withValues(alpha: 0.82),
                border: Border(bottom: BorderSide(color: s.line, width: 0.5)),
                automaticallyImplyLeading: canPop,
                previousPageTitle: canPop ? 'Back' : null,
                trailing: actions.isEmpty
                    ? null
                    : Row(mainAxisSize: MainAxisSize.min, children: actions),
              ),
              if (onRefresh != null)
                CupertinoSliverRefreshControl(onRefresh: onRefresh),
              ...slivers,
              SliverPadding(padding: EdgeInsets.only(bottom: bottom + 24)),
            ],
          ),
        ),
      );
    }

    final scroll = CustomScrollView(
      slivers: [
        SliverAppBar.large(
          backgroundColor: s.screenMid,
          surfaceTintColor: Colors.transparent,
          scrolledUnderElevation: 0,
          automaticallyImplyLeading: canPop,
          title: Text(
            title,
            style: zuniaSans(
                fontWeight: FontWeight.w500, letterSpacing: -0.5, color: s.fg),
          ),
          actions: [...actions, const SizedBox(width: 8)],
        ),
        ...slivers,
        SliverPadding(padding: EdgeInsets.only(bottom: bottom + 24)),
      ],
    );
    return Scaffold(
      backgroundColor: s.screenMid,
      body: onRefresh == null
          ? scroll
          : RefreshIndicator(
              onRefresh: onRefresh!,
              color: s.accent,
              backgroundColor: s.surfaceRaised,
              child: scroll,
            ),
    );
  }
}

/// Pull to refresh in the platform's own style around any scrollable.
class ZuniaRefresh extends StatelessWidget {
  const ZuniaRefresh({super.key, required this.onRefresh, required this.child});

  final Future<void> Function() onRefresh;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return RefreshIndicator.adaptive(
      onRefresh: () async {
        unawaited(ZuniaHaptics.light());
        await onRefresh();
      },
      color: s.accent,
      backgroundColor: s.surfaceRaised,
      child: child,
    );
  }
}

/// Page transitions per platform: the iOS push with its edge swipe back, and
/// Android's predictive back, which previews the screen underneath while the
/// back gesture is still in progress.
const zuniaPageTransitions = PageTransitionsTheme(
  builders: {
    TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
    TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
    TargetPlatform.android: PredictiveBackPageTransitionsBuilder(),
  },
);
