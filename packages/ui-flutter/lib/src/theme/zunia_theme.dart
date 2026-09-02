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
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: s.accent,
        onPrimary: s.accentFg,
        secondary: s.fgMuted,
        onSecondary: s.bg,
        error: s.danger,
        onError: s.accentFg,
        surface: s.surface,
        onSurface: s.fg,
        outline: s.line,
      ),
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
    );
  }
}
