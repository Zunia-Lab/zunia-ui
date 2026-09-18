import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../primitives/feedback.dart';
import '../primitives/input.dart';
import '../primitives/switch.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import '../wallet/fee_summary.dart';
import 'interchain.dart';

/// One pool leg of a swap route, for display.
@immutable
class ZuniaSwapPoolLeg {
  const ZuniaSwapPoolLeg({required this.poolId, this.tokenOutSymbol});

  final String poolId;
  final String? tokenOutSymbol;
}

/// A priced swap, formatted for display.
///
/// Amounts arrive as strings already scaled to their token's exponent: base
/// units are integers big enough to lose precision as a `double`, and the
/// formatting rules (locale, exponent, symbol) belong to the client that knows
/// the asset. [priceImpact] and [poolFee] are percentages and may be null when
/// the venue did not report them — null renders as "not reported", never as 0.
@immutable
class ZuniaSwapQuoteView {
  const ZuniaSwapQuoteView({
    required this.inputAmount,
    required this.inputSymbol,
    required this.outputAmount,
    required this.outputSymbol,
    this.rate,
    this.minReceived,
    this.priceImpact,
    this.poolFee,
    this.route = const [],
  });

  final String inputAmount;
  final String inputSymbol;
  final String outputAmount;
  final String outputSymbol;

  /// Pre-formatted rate line, e.g. '1 ATOM ≈ 8.42 OSMO'.
  final String? rate;

  /// Guaranteed minimum at the current tolerance, formatted.
  final String? minReceived;

  /// Percentage, e.g. 0.42 for 0.42%. Null when the venue did not say.
  final double? priceImpact;

  /// Percentage of the input taken by pool fees. Null when not reported.
  final double? poolFee;

  /// Pools traversed, in order. Mirrors `SwapQuote.route`.
  final List<ZuniaSwapPoolLeg> route;
}

/// Rate, minimum received, price impact, pool fee, slippage, and who pays gas.
///
/// Two things here are load-bearing rather than decorative. Price impact above
/// the threshold is rendered as a filled, bordered, captioned block, because it
/// is the number that decides whether a swap is a good idea and a muted grey row
/// is how it gets skipped. And the gas line is always present, because "do I
/// need OSMO for this?" is the question this flow generates, and the answer is
/// no: the contract call happens inside packet processing and a relayer pays.
class ZuniaSwapQuotePanel extends StatefulWidget {
  const ZuniaSwapQuotePanel({
    super.key,
    required this.quote,
    required this.gasChainName,
    required this.slippagePercent,
    this.swapVenueName,
    this.gasFeeLabel,
    this.onSlippageChanged,
    this.slippagePresets = const [0.5, 1, 3],
    this.priceImpactWarnAt = kZuniaPriceImpactWarn,
    this.priceImpactHighAt = kZuniaPriceImpactHigh,
    this.loading = false,
    this.error,
    this.onRetry,
    this.compact = false,
    this.title = 'Quote',
    this.footer,
  });

  /// Null while nothing has been quoted yet.
  final ZuniaSwapQuoteView? quote;

  /// Chain the user signs and pays gas on. Required: this panel's job includes
  /// saying that no account is needed at the swap venue.
  final String gasChainName;

  /// Venue running the swap, e.g. 'Osmosis'.
  final String? swapVenueName;

  /// Formatted source-chain fee, e.g. '≈ 0.0021 SAFRO'. Null when unknown.
  final String? gasFeeLabel;

  final double slippagePercent;

  /// Null renders the tolerance read-only.
  final ValueChanged<double>? onSlippageChanged;

  final List<double> slippagePresets;
  final double priceImpactWarnAt;
  final double priceImpactHighAt;

  final bool loading;

  /// Quoting failed. Shown instead of a quote, never alongside a stale one.
  final String? error;

  final VoidCallback? onRetry;
  final bool compact;
  final String? title;
  final Widget? footer;

  @override
  State<ZuniaSwapQuotePanel> createState() => _ZuniaSwapQuotePanelState();
}

class _ZuniaSwapQuotePanelState extends State<ZuniaSwapQuotePanel> {
  late final TextEditingController _custom;

  @override
  void initState() {
    super.initState();
    _custom = TextEditingController(text: _format(widget.slippagePercent));
  }

  @override
  void didUpdateWidget(covariant ZuniaSwapQuotePanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Only overwrite the field when the value changed elsewhere (a preset tap,
    // or the host re-quoting). Rewriting it on every rebuild would fight the
    // user's caret mid-typing.
    if (oldWidget.slippagePercent != widget.slippagePercent) {
      final next = _format(widget.slippagePercent);
      if (_custom.text != next) _custom.text = next;
    }
  }

  @override
  void dispose() {
    _custom.dispose();
    super.dispose();
  }

  static String _format(double v) {
    if (v == v.roundToDouble()) return v.toStringAsFixed(0);
    return v.toString();
  }

  static String? _formatPercent(double? value) {
    if (value == null || !value.isFinite) return null;
    final abs = value.abs();
    final digits = abs >= 10 ? 1 : (abs >= 1 ? 2 : 3);
    return '${value.toStringAsFixed(digits)}%';
  }

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final slippage = zuniaCheckSlippage(widget.slippagePercent);
    final slippageTone = zuniaToneStyle(context, slippage.tone);

    final quote = widget.quote;
    final severity = zuniaPriceImpactSeverity(
      quote?.priceImpact,
      warnAt: widget.priceImpactWarnAt,
      highAt: widget.priceImpactHighAt,
    );

    final children = <Widget>[];

    if (widget.title != null) {
      children
        ..add(ZuniaSectionLabel(widget.title!))
        ..add(const SizedBox(height: ZuniaSpace.s3));
    }

    if (widget.error != null) {
      children
        ..add(ZuniaCallout(
          tone: ZuniaCalloutTone.danger,
          title: 'Could not price this swap',
          body: widget.error!,
        ))
        ..add(const SizedBox(height: ZuniaSpace.s3));
      if (widget.onRetry != null) {
        children
          ..add(Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: widget.onRetry,
              child: const Text('Try again'),
            ),
          ))
          ..add(const SizedBox(height: ZuniaSpace.s3));
      }
    } else if (widget.loading || quote == null) {
      children
        ..add(_placeholderCard(context, loading: widget.loading))
        ..add(const SizedBox(height: ZuniaSpace.s3));
    } else {
      children
        ..add(_quoteCard(context, quote, severity))
        ..add(const SizedBox(height: ZuniaSpace.s3));
    }

    children
      ..add(_slippageControl(context, slippage, slippageTone))
      ..add(const SizedBox(height: ZuniaSpace.s3))
      ..add(_gasBlock(context, s));

    if (widget.footer != null) {
      children
        ..add(const SizedBox(height: ZuniaSpace.s3))
        ..add(widget.footer!);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: children,
    );
  }

  Widget _placeholderCard(BuildContext context, {required bool loading}) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      padding: const EdgeInsets.all(ZuniaSpace.s3),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        border: Border.all(color: s.line),
      ),
      child: loading
          ? Semantics(
              label: 'Pricing swap',
              liveRegion: true,
              child: const Column(
                children: [
                  ZuniaSkeleton(height: 8),
                  SizedBox(height: ZuniaSpace.s2),
                  ZuniaSkeleton(height: 8),
                  SizedBox(height: ZuniaSpace.s2),
                  ZuniaSkeleton(height: 8),
                ],
              ),
            )
          : Text(
              'Enter an amount for a quote.',
              style: zuniaSans(
                fontSize: ZuniaType.caption,
                height: 1.5,
                color: s.fgMuted,
              ),
            ),
    );
  }

  Widget _quoteCard(
    BuildContext context,
    ZuniaSwapQuoteView quote,
    ZuniaPriceImpactSeverity severity,
  ) {
    final s = ZuniaSemanticsExt.of(context);
    final impactText = _formatPercent(quote.priceImpact);
    final feeText = _formatPercent(quote.poolFee);

    return Container(
      padding: EdgeInsets.all(widget.compact ? 10 : ZuniaSpace.s3),
      decoration: BoxDecoration(
        color: s.glass,
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        border: Border.all(color: s.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Text(
                  '${quote.inputAmount} ${quote.inputSymbol}',
                  overflow: TextOverflow.ellipsis,
                  style: zuniaMono(
                    fontSize: ZuniaType.caption,
                    color: s.fgMuted,
                  ),
                ),
              ),
              Text('→', style: zuniaMono(fontSize: 12, color: s.fgDim)),
              const SizedBox(width: ZuniaSpace.s2),
              Expanded(
                child: Text(
                  '${quote.outputAmount} ${quote.outputSymbol}',
                  textAlign: TextAlign.end,
                  overflow: TextOverflow.ellipsis,
                  style: zuniaSans(
                    fontSize: ZuniaType.label,
                    fontWeight: FontWeight.w600,
                    color: s.fg,
                    tabular: const FontFeature.tabularFigures(),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: ZuniaSpace.s3),
          ZuniaFeeSummary(
            rows: [
              if (quote.rate != null)
                ZuniaFeeRow(label: 'Rate', value: quote.rate),
              ZuniaFeeRow(
                label: 'Minimum received',
                value: quote.minReceived == null
                    ? null
                    : '${quote.minReceived} ${quote.outputSymbol}',
                hint: quote.minReceived == null
                    ? 'the venue did not return a floor'
                    : 'at ${_format(widget.slippagePercent)}% slippage',
              ),
              ZuniaFeeRow(label: 'Pool fee', value: feeText),
              // Price impact is the number that decides whether this trade is
              // sane, so above the threshold it leaves the rows entirely.
              if (severity == ZuniaPriceImpactSeverity.low)
                ZuniaFeeRow(label: 'Price impact', value: impactText),
            ],
          ),
          if (severity != ZuniaPriceImpactSeverity.low)
            _impactBlock(context, severity, impactText),
          if (quote.route.isNotEmpty) ...[
            const SizedBox(height: ZuniaSpace.s2),
            Divider(height: 1, color: s.line),
            const SizedBox(height: ZuniaSpace.s2),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: ZuniaSpace.s1 + 2,
              runSpacing: ZuniaSpace.s1,
              children: [
                Text(
                  'POOLS',
                  style: zuniaMono(
                    fontSize: ZuniaType.monoMicro,
                    letterSpacing: 1.2,
                    color: s.fgMuted,
                  ),
                ),
                for (final leg in quote.route)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: s.glass2,
                      borderRadius: BorderRadius.circular(ZuniaRadii.xs),
                    ),
                    child: Text(
                      '#${leg.poolId}'
                      '${leg.tokenOutSymbol == null ? '' : ' → ${leg.tokenOutSymbol}'}',
                      style: zuniaMono(
                        fontSize: ZuniaType.monoMicro,
                        color: s.fgMuted,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _impactBlock(
    BuildContext context,
    ZuniaPriceImpactSeverity severity,
    String? impactText,
  ) {
    final s = ZuniaSemanticsExt.of(context);
    final tone = zuniaToneStyle(context, zuniaPriceImpactTone(severity));
    final high = severity == ZuniaPriceImpactSeverity.high;

    return Container(
      margin: const EdgeInsets.only(top: ZuniaSpace.s1),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: tone.bg,
        borderRadius: BorderRadius.circular(ZuniaRadii.md),
        border: Border.all(color: tone.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  high ? 'HIGH PRICE IMPACT' : 'PRICE IMPACT',
                  style: zuniaMono(
                    fontSize: ZuniaType.monoMicro,
                    letterSpacing: 1.2,
                    color: tone.fg,
                  ),
                ),
              ),
              Text(
                impactText ?? 'not reported',
                style: zuniaMono(
                  fontSize: ZuniaType.label,
                  fontWeight: FontWeight.w700,
                  color: tone.fg,
                ),
              ),
            ],
          ),
          const SizedBox(height: ZuniaSpace.s1),
          Text(
            high
                ? 'This trade moves the pool a long way against you. The pool is '
                    'thin for this size — try a smaller amount or a different route.'
                : 'This trade moves the pool against you by more than a normal '
                    'amount. Check the minimum received before signing.',
            style: zuniaSans(
              fontSize: ZuniaType.caption,
              height: 1.5,
              color: s.fgMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _slippageControl(
    BuildContext context,
    ZuniaSlippageCheck slippage,
    ZuniaToneStyle tone,
  ) {
    final s = ZuniaSemanticsExt.of(context);
    final presets = widget.slippagePresets;
    final presetKey = presets.contains(widget.slippagePercent)
        ? _format(widget.slippagePercent)
        : 'custom';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const ZuniaSectionLabel('Slippage tolerance'),
        const SizedBox(height: ZuniaSpace.s2),
        ZuniaSegmented<String>(
          value: presetKey,
          options: {
            for (final p in presets) _format(p): '${_format(p)}%',
            'custom': 'Custom',
          },
          onChanged: (next) {
            if (next == 'custom') return;
            final parsed = double.tryParse(next);
            if (parsed != null) widget.onSlippageChanged?.call(parsed);
          },
        ),
        const SizedBox(height: ZuniaSpace.s2),
        Semantics(
          textField: true,
          label: 'Custom slippage tolerance, percent',
          child: ZuniaInput(
            controller: _custom,
            hint: '1',
            trailing: Text(
              '%',
              style: zuniaMono(fontSize: 11, color: s.fgMuted),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            errorText: slippage.ok ? null : slippage.message,
            onChanged: (raw) {
              final parsed = double.tryParse(raw.trim());
              // Reject an unparseable field rather than treating it as 0: the
              // contract reads this as a 0-100 percentage and an empty box must
              // not silently become "no slippage allowed".
              if (parsed != null) widget.onSlippageChanged?.call(parsed);
            },
          ),
        ),
        if (slippage.ok && slippage.message != null)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s1),
            child: Text(
              slippage.message!,
              style: zuniaSans(
                fontSize: ZuniaType.monoMicro + 1,
                height: 1.5,
                color: tone.fg,
              ),
            ),
          ),
      ],
    );
  }

  Widget _gasBlock(BuildContext context, ZuniaSemantic s) {
    return Container(
      padding: const EdgeInsets.all(ZuniaSpace.s3),
      decoration: BoxDecoration(
        color: s.glass,
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
      ),
      child: ZuniaFeeSummary(
        rows: [
          ZuniaFeeRow(
            label: 'Network fee',
            value: widget.gasFeeLabel ?? 'estimated at signing',
          ),
        ],
        note: zuniaSourceGasNote(
          widget.gasChainName,
          venueName: widget.swapVenueName,
        ),
      ),
    );
  }
}
