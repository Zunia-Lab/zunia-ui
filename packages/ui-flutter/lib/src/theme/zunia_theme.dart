import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import 'zunia_semantics_ext.dart';

const String kZuniaSans = 'SpaceGrotesk';
const String kZuniaMono = 'JetBrainsMono';

TextStyle zuniaSans({
  double? fontSize,
  FontWeight? fontWeight,
  double? letterSpacing,
  double? height,
  Color? color,
  FontFeature? tabular,
}) {
  return TextStyle(
    fontFamily: kZuniaSans,
    fontSize: fontSize,
    fontWeight: fontWeight,
    letterSpacing: letterSpacing,
    height: height,
    color: color,
    fontFeatures: tabular != null ? [tabular] : null,
  );
}

TextStyle zuniaMono({
  double? fontSize,
  FontWeight? fontWeight,
  double? letterSpacing,
  double? height,
  Color? color,
}) {
  return TextStyle(
    fontFamily: kZuniaMono,
    fontSize: fontSize,
    fontWeight: fontWeight,
    letterSpacing: letterSpacing,
    height: height,
    color: color,
    fontFeatures: const [FontFeature.tabularFigures()],
  );
}

abstract final class ZuniaTheme {
  static ThemeData dark({String? fontFamily}) {
    final s = ZuniaSemantic.dark;
    return _build(Brightness.dark, s, fontFamily ?? kZuniaSans);
  }

  static ThemeData light({String? fontFamily}) {
    final s = ZuniaSemantic.light;
    return _build(Brightness.light, s, fontFamily ?? kZuniaSans);
  }

  static ThemeData _build(Brightness brightness, ZuniaSemantic s, String fontFamily) {
    final base = ThemeData(
      useMaterial3: true,
      brightness: brightness,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: s.screenMid,
      // Material resolves these slots by ROLE, not by name, and every slot left
      // null falls back to another slot rather than to nothing. A token whose
      // role does not match the slot therefore paints in places the design was
      // never reviewed against. Ratios below are WCAG 2.x, measured light/dark
      // against the ground the slot actually paints on.
      colorScheme: ColorScheme(
        brightness: brightness,
        // accentFg is tuned for the accent ramp: 5.10:1 in both themes.
        primary: s.accent,
        onPrimary: s.accentFg,
        // Zunia has a single accent, so Material's "secondary" carries the
        // neutral emphasis fill. bg on fgMuted: 8.55:1 light / 11.62:1 dark.
        secondary: s.fgMuted,
        onSecondary: s.bg,
        // secondaryContainer falls back to `secondary`, which would paint
        // SegmentedButton/FilterChip surfaces with a full-strength neutral.
        // A container has to be tonal: fg on surfaceSunken is 14.32:1 light /
        // 17.03:1 dark.
        secondaryContainer: s.surfaceSunken,
        onSecondaryContainer: s.fg,
        error: s.danger,
        // Was `accentFg`. onError is the foreground for the RED error fill and
        // has nothing to do with the accent ramp; once accentFg moved from
        // #FFFFFF to #0B0A09 it measured 3.29:1 on `danger` in light — below AA.
        // `dangerFg` is not the replacement either: that token is danger-tinted
        // TEXT for the page background and lands at 1.34:1 on `danger` in light.
        // `bg` is the inverse-of-fg ground: 5.27:1 light / 5.64:1 dark.
        onError: s.bg,
        // errorContainer/onErrorContainer fall back to error/onError, i.e. the
        // saturated fill. The tonal pair is dangerFill + dangerFg:
        // 7.12:1 light / 10.97:1 dark.
        errorContainer: s.dangerFill,
        onErrorContainer: s.dangerFg,
        surface: s.surface,
        onSurface: s.fg,
        // Material paints secondary text, hints and icons with onSurfaceVariant.
        // Its fallback is onSurface, which renders every one of them at full
        // text strength. fgMuted on surface: 9.74:1 light / 10.86:1 dark.
        onSurfaceVariant: s.fgMuted,
        // outline is the emphasis boundary; outlineVariant is the decorative
        // one. outlineVariant does NOT fall back to outline — it falls back to
        // onBackground/onSurface, so a stock M3 Divider was drawing `fg` at full
        // strength (18.88:1 light) where a hairline belongs.
        // Measured as non-text boundaries: lineStrong 1.55:1 light / 1.90:1
        // dark, line 1.29:1 / 1.46:1. Both sit under Material's 3:1 guidance —
        // the hairline is deliberate here and focus is carried by focusRing, not
        // by the outline. Closing that gap needs a change in @zunialab/tokens.
        outline: s.lineStrong,
        outlineVariant: s.line,
        // SnackBar and friends invert against these. Pinning them stops the
        // inversion from being an accident of the onSurface/surface fallbacks.
        // bg on fg: 16.58:1 light / 17.37:1 dark.
        inverseSurface: s.fg,
        onInverseSurface: s.bg,
        // inversePrimary falls back to onPrimary — accentFg on the inverted
        // ground is 1.05:1 in light, i.e. an invisible SnackBar action label.
        // No accent token clears AA on both inverted grounds (accent measures
        // 4.87:1 light but 3.41:1 dark), so this slot carries the inverse
        // foreground instead.
        inversePrimary: s.bg,
        shadow: s.shadow,
        scrim: s.scrim,
        // Elevation in this design is a surface token (surfaceRaised), not a
        // hue shift. surfaceTint defaults to `primary`, which would wash every
        // elevated Material surface — dialogs, menus — in accent red.
        surfaceTint: Colors.transparent,
      ),
      // colorScheme.outline is now lineStrong; keep the legacy dividerColor on
      // the hairline so DataTable/PopupMenuDivider do not thicken with it.
      dividerColor: s.line,
      extensions: [ZuniaSemanticsExt(s)],
    );

    return base.copyWith(
      textTheme: base.textTheme.apply(
        fontFamily: fontFamily,
        bodyColor: s.fg,
        displayColor: s.fg,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: s.bg,
        foregroundColor: s.fg,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: zuniaSans(
          fontSize: 20,
          fontWeight: FontWeight.w500,
          letterSpacing: -0.5,
          color: s.fg,
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return s.accent.withValues(alpha: s.disabledOpacity);
            }
            if (states.contains(WidgetState.pressed)) {
              return s.accent.withValues(alpha: 0.8);
            }
            if (states.contains(WidgetState.hovered)) {
              return s.accent.withValues(alpha: 0.9);
            }
            return s.accent;
          }),
          foregroundColor: WidgetStatePropertyAll(s.accentFg),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          ),
          shape: const WidgetStatePropertyAll(StadiumBorder()),
          textStyle: WidgetStatePropertyAll(
            zuniaSans(fontWeight: FontWeight.w500, fontSize: 13, letterSpacing: -0.2),
          ),
          overlayColor: const WidgetStatePropertyAll(Colors.transparent),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: ButtonStyle(
          foregroundColor: WidgetStatePropertyAll(s.fg),
          side: WidgetStatePropertyAll(BorderSide(color: s.lineStrong)),
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.pressed)) return s.statePress;
            if (states.contains(WidgetState.hovered)) return s.stateHover;
            return Colors.transparent;
          }),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          ),
          shape: const WidgetStatePropertyAll(StadiumBorder()),
        ),
      ),
      cardTheme: CardThemeData(
        color: s.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ZuniaRadii.lg),
          side: BorderSide(color: s.line),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: s.stateHover,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: s.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: s.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: s.accent, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: s.danger),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 13, vertical: 12),
        hintStyle: zuniaMono(fontSize: 12.5, color: s.fgDim),
      ),
      listTileTheme: ListTileThemeData(
        selectedTileColor: s.stateSelected,
        selectedColor: s.fg,
        iconColor: s.fgMuted,
        textColor: s.fg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        mouseCursor: WidgetStateMouseCursor.clickable,
      ),
      iconButtonTheme: IconButtonThemeData(
        style: ButtonStyle(
          overlayColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return Colors.transparent;
            }
            if (states.contains(WidgetState.pressed)) return s.statePress;
            if (states.contains(WidgetState.hovered)) return s.stateHover;
            return null;
          }),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: ButtonStyle(
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return s.fgMuted.withValues(alpha: s.disabledOpacity);
            }
            if (states.contains(WidgetState.hovered)) return s.fg;
            return s.fgMuted;
          }),
          overlayColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.pressed)) return s.statePress;
            if (states.contains(WidgetState.hovered)) return s.stateHover;
            return null;
          }),
        ),
      ),
      // Divider resolves colorScheme.outlineVariant, everything older resolves
      // dividerColor. Pin both to the hairline so the two never drift apart.
      dividerTheme: DividerThemeData(color: s.line),
      // Bare SnackBars are raised from a dozen screens. Without this they render
      // Material's inverse-surface slab, which shares nothing with the palette.
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: s.surfaceRaised,
        // fg on surfaceRaised: 17.95:1 light / 15.49:1 dark.
        contentTextStyle: zuniaSans(fontSize: ZuniaType.label, color: s.fg),
        // The accent is not legible as label text on this ground in light
        // (3.69:1), so an action label carries fg rather than accent colour.
        actionTextColor: s.fg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ZuniaRadii.lg),
          side: BorderSide(color: s.lineStrong),
        ),
      ),
      // Every `tooltip:` on an icon button used the Material default slab.
      tooltipTheme: TooltipThemeData(
        decoration: BoxDecoration(
          color: s.surfaceRaised,
          borderRadius: BorderRadius.circular(ZuniaRadii.sm),
          border: Border.all(color: s.lineStrong),
        ),
        // fg on surfaceRaised: 17.95:1 light / 15.49:1 dark.
        textStyle: zuniaMono(fontSize: ZuniaType.mono, color: s.fg),
        padding: const EdgeInsets.symmetric(
          horizontal: ZuniaSpace.s2,
          vertical: ZuniaSpace.s1,
        ),
        waitDuration: const Duration(milliseconds: 400),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: s.surfaceRaised,
        // Elevation is a surface token here; the M3 tint would tine dialogs red.
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ZuniaRadii.xxl),
          side: BorderSide(color: s.line),
        ),
        // fg on surfaceRaised: 17.95:1 light / 15.49:1 dark.
        titleTextStyle: zuniaSans(
          fontSize: ZuniaType.heading,
          fontWeight: FontWeight.w500,
          color: s.fg,
        ),
        // fgMuted on surfaceRaised: 9.26:1 light / 10.36:1 dark.
        contentTextStyle: zuniaSans(fontSize: ZuniaType.body, color: s.fgMuted),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: s.surface,
        modalBackgroundColor: s.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        modalElevation: 0,
        dragHandleColor: s.lineStrong,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(ZuniaRadii.sheet),
          ),
        ),
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.disabled)) return s.line;
          if (states.contains(WidgetState.selected)) return s.accent;
          return Colors.transparent;
        }),
        // accentFg on accent: 5.10:1 in both themes.
        checkColor: WidgetStatePropertyAll(s.accentFg),
        side: BorderSide(color: s.lineStrong, width: 1.5),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ZuniaRadii.xs),
        ),
        overlayColor: WidgetStatePropertyAll(s.stateHover),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: s.accent,
        inactiveTrackColor: s.glass2,
        thumbColor: s.fg,
        overlayColor: s.stateHover,
        trackHeight: 3,
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: s.accent,
        linearTrackColor: s.glass2,
        circularTrackColor: Colors.transparent,
      ),
    );
  }
}
