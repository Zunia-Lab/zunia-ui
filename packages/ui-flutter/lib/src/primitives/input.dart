import 'package:flutter/material.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

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
