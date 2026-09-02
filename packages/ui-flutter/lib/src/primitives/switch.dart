import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';

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
