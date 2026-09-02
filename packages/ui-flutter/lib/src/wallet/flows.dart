import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import '../primitives/button.dart';
import '../primitives/feedback.dart';

class ZuniaMnemonicGrid extends StatelessWidget {
  const ZuniaMnemonicGrid({
    super.key,
    required this.words,
    this.columns = 3,
    this.revealed = true,
  });
  final List<String> words;
  final int columns;

  /// When false, each word renders as a mask.
  final bool revealed;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: columns,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 2.4,
      ),
      itemCount: words.length,
      itemBuilder: (context, i) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: s.line),
            color: s.stateHover,
          ),
          child: Row(
            children: [
              Text('${i + 1}', style: zuniaMono(fontSize: 9.5, color: s.fgDim)),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  revealed ? words[i] : '••••',
                  overflow: TextOverflow.ellipsis,
                  style: zuniaMono(
                    fontSize: 12,
                    color: revealed ? s.fg : s.fgDim,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class ZuniaSeedVerifier extends StatelessWidget {
  const ZuniaSeedVerifier({
    super.key,
    required this.options,
    this.selected,
    required this.onSelect,
  });

  final List<String> options;
  final String? selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((w) {
        final isSelected = selected == w;
        return SizedBox(
          width: 100,
          height: 42,
          child: Material(
            color: isSelected ? s.stateSelected : Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: isSelected ? s.accent : s.line),
            ),
            child: InkWell(
              onTap: () => onSelect(w),
              borderRadius: BorderRadius.circular(12),
              child: Center(
                child: Text(w, style: zuniaMono(fontSize: 12, color: isSelected ? s.fg : s.fgMuted)),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class ZuniaPasscodeDots extends StatelessWidget {
  const ZuniaPasscodeDots({super.key, this.length = 6, this.filled = 0});
  final int length;
  final int filled;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(length, (i) {
        final on = i < filled;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 6),
          width: 13,
          height: 13,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: on ? s.fg : Colors.transparent,
            border: Border.all(color: s.lineStrong),
          ),
        );
      }),
    );
  }
}

class ZuniaSigningRequest extends StatelessWidget {
  const ZuniaSigningRequest({
    super.key,
    required this.dapp,
    required this.messages,
    required this.fees,
    this.onReject,
    this.onApprove,
  });

  final String dapp;
  final List<({String type, String summary})> messages;
  final List<({String label, String value})> fees;
  final VoidCallback? onReject;
  final VoidCallback? onApprove;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const ZuniaSectionLabel('Signing request'),
        const SizedBox(height: 8),
        Text(dapp, style: zuniaSans(fontSize: 15, fontWeight: FontWeight.w500, color: s.fg)),
        const SizedBox(height: 16),
        ...messages.asMap().entries.map((e) {
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: s.line),
              color: s.stateHover,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${e.key + 1}. ${e.value.type}', style: zuniaMono(fontSize: 9.5, color: s.fgDim)),
                const SizedBox(height: 4),
                Text(e.value.summary, style: zuniaSans(fontSize: 12.5, color: s.fg)),
              ],
            ),
          );
        }),
        ...fees.map((f) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: ZuniaKeyValueRow(label: f.label, value: f.value),
            )),
        const SizedBox(height: 8),
        const ZuniaCallout(body: 'Simulation returned no errors.'),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ZuniaButton(
                label: 'Reject',
                variant: ZuniaButtonVariant.secondary,
                onPressed: onReject,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 2,
              child: ZuniaButton(label: 'Approve', onPressed: onApprove),
            ),
          ],
        ),
      ],
    );
  }
}

class ZuniaProgressTracker extends StatelessWidget {
  const ZuniaProgressTracker({
    super.key,
    required this.title,
    required this.step,
    required this.total,
    required this.steps,
  });

  final String title;
  final int step;
  final int total;
  final List<({String label, String state})> steps;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: zuniaMono(fontSize: 10.5, color: s.fgMuted)),
            Text('$step/$total', style: zuniaMono(fontSize: 10.5, color: s.fgMuted)),
          ],
        ),
        const SizedBox(height: 9),
        ClipRRect(
          borderRadius: BorderRadius.circular(ZuniaRadii.full),
          child: LinearProgressIndicator(
            value: step / total,
            minHeight: 6,
            backgroundColor: s.stateHover,
            color: s.accent,
          ),
        ),
        const SizedBox(height: 12),
        ...steps.map((st) {
          final done = st.state == 'done';
          final current = st.state == 'current';
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              children: [
                Container(
                  width: 15,
                  height: 15,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: done ? s.fg : Colors.transparent,
                    border: Border.all(
                      color: done || current ? s.fg : s.lineStrong,
                      width: 2,
                    ),
                  ),
                  child: done
                      ? Text('✓', style: TextStyle(fontSize: 8, color: s.bg))
                      : null,
                ),
                const SizedBox(width: 10),
                Text(
                  st.label,
                  style: zuniaMono(
                    fontSize: 10.5,
                    color: st.state == 'pending' ? s.fgDim : s.fg,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}
