import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

/// One line of a fee breakdown.
@immutable
class ZuniaFeeRow {
  const ZuniaFeeRow({
    required this.label,
    required this.value,
    this.hint,
    this.emphasise = false,
  });

  final String label;

  /// Pre-formatted. Null renders as "not available" in [ZuniaSemantic.fgDim]
  /// rather than as a zero, because a failed fee read is not a free transfer.
  final String? value;

  /// Optional second line, e.g. "at 1% slippage".
  final String? hint;

  /// Draws the row at full foreground weight — for the total.
  final bool emphasise;
}

/// Stacked label/value fee rows (React `FeeSummary`).
class ZuniaFeeSummary extends StatelessWidget {
  const ZuniaFeeSummary({super.key, required this.rows, this.note});

  final List<ZuniaFeeRow> rows;

  /// Sentence under the rows, e.g. [zuniaSourceGasNote].
  final String? note;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final row in rows)
          Padding(
            padding: const EdgeInsets.only(bottom: ZuniaSpace.s2),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // fgMuted on surface: 9.74:1 light / 10.86:1 dark.
                Expanded(
                  child: Text(
                    row.label,
                    style: zuniaMono(
                      fontSize: ZuniaType.caption,
                      color: s.fgMuted,
                    ),
                  ),
                ),
                const SizedBox(width: ZuniaSpace.s3),
                Flexible(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        row.value ?? 'not available',
                        textAlign: TextAlign.end,
                        style: zuniaMono(
                          fontSize: ZuniaType.caption,
                          fontWeight:
                              row.emphasise ? FontWeight.w700 : FontWeight.w400,
                          color: row.value == null ? s.fgDim : s.fg,
                        ),
                      ),
                      if (row.hint != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                            row.hint!,
                            textAlign: TextAlign.end,
                            // fgDim on surface: 5.36:1 light / 5.11:1 dark.
                            style: zuniaMono(
                              fontSize: ZuniaType.monoMicro,
                              color: s.fgDim,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        if (note != null)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s1),
            child: Text(
              note!,
              style: zuniaSans(
                fontSize: ZuniaType.caption,
                height: 1.5,
                color: s.fgMuted,
              ),
            ),
          ),
      ],
    );
  }
}
