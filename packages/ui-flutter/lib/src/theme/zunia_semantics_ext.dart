import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

/// ThemeExtension wrapping [ZuniaSemantic] for widget lookups.
@immutable
class ZuniaSemanticsExt extends ThemeExtension<ZuniaSemanticsExt> {
  const ZuniaSemanticsExt(this.tokens);

  final ZuniaSemantic tokens;

  static ZuniaSemantic of(BuildContext context) {
    final ext = Theme.of(context).extension<ZuniaSemanticsExt>();
    if (ext != null) return ext.tokens;
    final brightness = Theme.of(context).brightness;
    return brightness == Brightness.dark ? ZuniaSemantic.dark : ZuniaSemantic.light;
  }

  @override
  ZuniaSemanticsExt copyWith({ZuniaSemantic? tokens}) =>
      ZuniaSemanticsExt(tokens ?? this.tokens);

  @override
  ZuniaSemanticsExt lerp(ThemeExtension<ZuniaSemanticsExt>? other, double t) {
    if (other is! ZuniaSemanticsExt) return this;
    return t < 0.5 ? this : other;
  }
}
