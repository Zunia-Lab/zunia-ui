import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

/// Digits only.
class IntegerDigitFormatter extends TextInputFormatter {
  const IntegerDigitFormatter();

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    return _apply(newValue, newValue.text.replaceAll(RegExp(r'\D'), ''));
  }
}

/// Digits and a single decimal point.
class DecimalDigitFormatter extends TextInputFormatter {
  const DecimalDigitFormatter();

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    var seenDot = false;
    final buffer = StringBuffer();
    for (final char in newValue.text.split('')) {
      final code = char.codeUnitAt(0);
      if (code >= 48 && code <= 57) {
        buffer.write(char);
        continue;
      }
      if (char == '.' && !seenDot) {
        seenDot = true;
        buffer.write('.');
      }
    }
    return _apply(newValue, buffer.toString());
  }
}

TextEditingValue _apply(TextEditingValue next, String text) {
  if (text == next.text) return next;
  final offset = text.length < next.selection.end ? text.length : next.selection.end;
  return TextEditingValue(
    text: text,
    selection: TextSelection.collapsed(offset: offset.clamp(0, text.length)),
  );
}

List<TextInputFormatter> digitFormattersFor(TextInputType? type) {
  if (type == null) return const [];
  if (type.decimal) return const [DecimalDigitFormatter()];
  if (type == TextInputType.number) return const [IntegerDigitFormatter()];
  return const [];
}

class ZuniaInput extends StatelessWidget {
  const ZuniaInput({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.errorText,
    this.trailing,
    this.obscureText = false,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.autofillHints,
    this.keyboardType,
    this.inputFormatters,
  });

  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? errorText;
  final Widget? trailing;
  final bool obscureText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;
  final Iterable<String>? autofillHints;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: zuniaMono(
              fontSize: 9.5,
              letterSpacing: 1.3,
              color: s.fgMuted,
            ),
          ),
          const SizedBox(height: 8),
        ],
        TextField(
          controller: controller,
          obscureText: obscureText,
          onChanged: onChanged,
          onSubmitted: onSubmitted,
          autofocus: autofocus,
          autofillHints: autofillHints,
          keyboardType: keyboardType,
          inputFormatters:
              inputFormatters ??
              (digitFormattersFor(keyboardType).isEmpty
                  ? null
                  : digitFormattersFor(keyboardType)),
          autocorrect: false,
          enableSuggestions: !obscureText,
          style: zuniaMono(fontSize: 12.5, color: s.fg),
          decoration: InputDecoration(
            hintText: hint,
            errorText: errorText,
            suffixIcon: trailing == null
                ? null
                : Padding(
                    padding: const EdgeInsets.only(right: 12),
                    child: Center(widthFactor: 1, child: trailing),
                  ),
          ),
        ),
      ],
    );
  }
}
