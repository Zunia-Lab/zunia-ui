import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

class ZuniaSwitch extends StatelessWidget {
  const ZuniaSwitch({super.key, required this.value, required this.onChanged});

  final bool value;
  final ValueChanged<bool>? onChanged;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Switch(
      value: value,
      onChanged: onChanged,
      activeThumbColor: s.accentFg,
      activeTrackColor: s.accent,
      inactiveThumbColor: s.fgDim,
      inactiveTrackColor: s.stateHover,
      trackOutlineColor: WidgetStatePropertyAll(s.lineStrong),
    );
  }
}

class ZuniaSegmented<T> extends StatelessWidget {
  const ZuniaSegmented({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
  });

  final Map<T, String> options;
  final T value;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ZuniaRadii.full),
        border: Border.all(color: s.line),
      ),
      child: Row(
        children: options.entries.map((e) {
          final selected = e.key == value;
          return Expanded(
            child: Material(
              color: selected ? s.accent : Colors.transparent,
              borderRadius: BorderRadius.circular(ZuniaRadii.full),
              child: InkWell(
                onTap: () => onChanged(e.key),
                borderRadius: BorderRadius.circular(ZuniaRadii.full),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Text(
                    e.value.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'JetBrainsMono',
                      fontSize: 10.5,
                      letterSpacing: 1.2,
                      color: selected ? s.accentFg : s.fgMuted,
                      fontWeight: FontWeight.w500,
                    ),
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

/// Labelled checkbox (React `Checkbox`).
///
/// The whole row is the hit target: a 22px box alone is under the 44px minimum
/// touch size, which is how the bare `Checkbox` in the onboarding consent step
/// behaved.
class ZuniaCheckbox extends StatelessWidget {
  const ZuniaCheckbox({
    super.key,
    required this.value,
    required this.onChanged,
    required this.label,
    this.description,
  });

  final bool value;
  final ValueChanged<bool>? onChanged;
  final String label;
  final String? description;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final disabled = onChanged == null;
    // MergeSemantics folds the Checkbox's checked state, the label text and the
    // InkWell's tap into a single node. Wrapping the row in a hand-written
    // Semantics and excluding the subtree instead would drop the tap action,
    // leaving the row announced but not operable.
    return MergeSemantics(
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(ZuniaRadii.md),
        child: InkWell(
          onTap: disabled ? null : () => onChanged!(!value),
          borderRadius: BorderRadius.circular(ZuniaRadii.md),
          hoverColor: s.stateHover,
          splashColor: s.statePress,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: ZuniaSpace.s2,
              vertical: ZuniaSpace.s3,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 22,
                  height: 22,
                  // Colours come from the theme's checkboxTheme: accent fill
                  // with an accentFg check, 5.10:1 in both themes.
                  child: Checkbox(
                    value: value,
                    onChanged:
                        disabled ? null : (v) => onChanged!(v ?? false),
                    visualDensity: VisualDensity.compact,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
                const SizedBox(width: ZuniaSpace.s3),
                Expanded(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // fg on surface: 18.88:1 light / 16.24:1 dark.
                      Text(
                        label,
                        style: zuniaSans(
                          fontSize: ZuniaType.caption,
                          color: s.fg,
                          height: 1.45,
                        ),
                      ),
                      if (description != null) ...[
                        const SizedBox(height: 2),
                        // fgMuted on surface: 9.74:1 light / 10.86:1 dark.
                        Text(
                          description!,
                          style: zuniaSans(
                            fontSize: ZuniaType.caption,
                            color: s.fgMuted,
                            height: 1.45,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Single-value slider (React `Slider`).
///
/// Every call site was re-declaring a `SliderTheme` inline; the colours now come
/// from the theme so a palette change reaches them.
class ZuniaSlider extends StatelessWidget {
  const ZuniaSlider({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 1,
    this.divisions,
    this.semanticFormatterCallback,
  });

  final double value;
  final ValueChanged<double>? onChanged;
  final double min;
  final double max;
  final int? divisions;
  final SemanticFormatterCallback? semanticFormatterCallback;

  @override
  Widget build(BuildContext context) {
    return Slider(
      value: value.clamp(min, max),
      onChanged: onChanged,
      min: min,
      max: max,
      divisions: divisions,
      semanticFormatterCallback: semanticFormatterCallback,
    );
  }
}
