import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../primitives/button.dart';
import '../primitives/feedback.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import '../wallet/display.dart';
import 'interchain.dart';

/// Resolve an explorer URL for a hash.
///
/// Return null when the host has no explorer for that chain. The tracker then
/// renders the hash as plain selectable text: a link that goes nowhere is worse
/// than no link, and a made-up explorer domain is worse than both.
typedef ZuniaTxUrlResolver = String? Function(String chainId, String txHash);

/// One hop as last observed.
///
/// Field names mirror `RouteHopTrace` in `@zunialab/interchain` (a
/// `PacketHopTrace` plus the escalation fields), so a tracked route's hops can
/// be spread in with only the display extras added.
@immutable
class ZuniaPacketTrackerHop {
  const ZuniaPacketTrackerHop({
    required this.chainId,
    required this.status,
    this.chainName,
    this.counterpartyChainId,
    this.counterpartyChainName,
    this.channelId,
    this.port = 'transfer',
    this.sequence,
    this.sendTxHash,
    this.receiveTxHash,
    this.error,
    this.stalled = false,
  });

  final String chainId;
  final String? chainName;
  final String? counterpartyChainId;
  final String? counterpartyChainName;
  final String? channelId;
  final String port;

  /// Packet sequence as a decimal string; null before the send is indexed.
  final String? sequence;

  final String? sendTxHash;
  final String? receiveTxHash;
  final ZuniaPacketHopStatus status;

  /// Error acknowledgement text when [status] is failed.
  final String? error;

  /// From `RouteHopTrace.stalled`. The engine decides this against a
  /// per-hop-kind threshold; the tracker only renders it. Do not compute it
  /// from a clock here — a swap hop and a forward hop do not take the same
  /// time.
  final bool stalled;

  String get fromLabel =>
      (chainName != null && chainName!.trim().isNotEmpty)
          ? chainName!.trim()
          : chainId;

  String? get toLabel {
    if (counterpartyChainId == null) return null;
    final n = counterpartyChainName?.trim();
    return (n != null && n.isNotEmpty) ? n : counterpartyChainId;
  }
}

/// Hop-by-hop live status for a cross-chain transfer.
///
/// The header is a [ZuniaPacketFundsSummary], not a percentage. A progress bar
/// cannot say the difference between "moving", "stuck but safe", "failed and
/// refunded" and "recoverable, and nothing happens until you claim it" — and the
/// user's next action differs in every one of those. All three products used to
/// render a hardcoded bar here, which said "almost there" while funds sat in a
/// contract waiting for a recover call.
///
/// Every judgement about the chain is made by `@zunialab/interchain` and passed
/// in: `hop.status` and `hop.stalled` from `RouteHopTrace`, [failure] and
/// [recoveryReady] from `RouteTrace`. This widget decides only what those facts
/// should look like and what they should say.
class ZuniaPacketTracker extends StatelessWidget {
  const ZuniaPacketTracker({
    super.key,
    required this.hops,
    this.sourceTxHash,
    this.sourceChainId,
    this.failure,
    this.recoveryReady = false,
    this.onRecover,
    this.recoverLabel = 'Recover funds',
    this.recoverDisabledReason,
    this.txUrl,
    this.onOpenTx,
    this.onCopyTxHash,
    this.loading = false,
    this.error,
    this.onRefresh,
    this.lastUpdatedAt,
    this.compact = false,
    this.title = 'Transfer status',
    this.footer,
  });

  final List<ZuniaPacketTrackerHop> hops;

  /// The tx the user signed — the only hash they recognise.
  final String? sourceTxHash;
  final String? sourceChainId;

  /// From `RouteTrace.failure`. `swapDeliveryFailed` is the one that needs the
  /// user: the swap ran, the outbound transfer did not land, and only the
  /// `local_recovery_addr` can pull the output out with `{"recover":{}}`.
  final ZuniaPacketFailureKind? failure;

  /// `RouteTrace.recovery.msg` is non-null, i.e. a recover message can actually
  /// be built. False means the crosschain-swap contract address is not in host
  /// config; the panel then says so rather than offering a dead button, because
  /// that address is deployment data and must never be a constant.
  final bool recoveryReady;

  final VoidCallback? onRecover;
  final String recoverLabel;

  /// Disable the recover control with a visible reason (e.g. no signer).
  final String? recoverDisabledReason;

  final ZuniaTxUrlResolver? txUrl;

  /// Opens a resolved URL. The package cannot launch URLs itself, so a link is
  /// only tappable when the host supplies this.
  final void Function(String url)? onOpenTx;

  final void Function(String txHash)? onCopyTxHash;

  final bool loading;

  /// The status read failed. Shown instead of stale hops presented as live.
  final String? error;

  final VoidCallback? onRefresh;
  final DateTime? lastUpdatedAt;
  final bool compact;
  final String? title;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);

    if (error != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null) ...[
            ZuniaSectionLabel(title!),
            const SizedBox(height: ZuniaSpace.s3),
          ],
          ZuniaCallout(
            tone: ZuniaCalloutTone.danger,
            title: 'Could not read the transfer status',
            body: '${error!} The transfer itself is unaffected by this — only '
                'our view of it.',
          ),
          if (onRefresh != null) ...[
            const SizedBox(height: ZuniaSpace.s3),
            Align(
              alignment: Alignment.centerLeft,
              child: ZuniaButton(
                label: 'Check again',
                variant: ZuniaButtonVariant.secondary,
                size: ZuniaButtonSize.sm,
                onPressed: onRefresh,
              ),
            ),
          ],
        ],
      );
    }

    if (loading && hops.isEmpty) {
      return Semantics(
        label: 'Reading transfer status',
        liveRegion: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (title != null) ...[
              ZuniaSectionLabel(title!),
              const SizedBox(height: ZuniaSpace.s3),
            ],
            for (var i = 0; i < 2; i++)
              Padding(
                padding: const EdgeInsets.only(bottom: ZuniaSpace.s2),
                child: Container(
                  padding: const EdgeInsets.all(ZuniaSpace.s3),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(ZuniaRadii.lg),
                    border: Border.all(color: s.line),
                  ),
                  child: const Row(
                    children: [
                      ZuniaSkeleton(width: 28, height: 28),
                      SizedBox(width: ZuniaSpace.s3),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ZuniaSkeleton(height: 10),
                            SizedBox(height: ZuniaSpace.s2),
                            ZuniaSkeleton(width: 90, height: 8),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      );
    }

    final resolved = hops
        .map((h) => zuniaResolveHopStatus(h.status, stalled: h.stalled))
        .toList(growable: false);

    final summary = zuniaPacketFundsSummary(
      resolved,
      failure: failure,
      recoveryReady: recoveryReady,
    );
    final summaryTone = zuniaToneStyle(context, summary.tone);
    final clock = _formatClock(context, lastUpdatedAt);

    if (hops.isEmpty && !summary.actionRequired) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null) ...[
            ZuniaSectionLabel(title!),
            const SizedBox(height: ZuniaSpace.s3),
          ],
          ZuniaEmptyState(
            title: summary.title,
            description: summary.detail,
            action: onRefresh == null
                ? null
                : ZuniaButton(
                    label: 'Check again',
                    variant: ZuniaButtonVariant.secondary,
                    size: ZuniaButtonSize.sm,
                    onPressed: onRefresh,
                  ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title != null || clock != null)
          Padding(
            padding: const EdgeInsets.only(bottom: ZuniaSpace.s3),
            child: Row(
              children: [
                if (title != null)
                  Expanded(child: ZuniaSectionLabel(title!))
                else
                  const Spacer(),
                if (clock != null)
                  Text(
                    'read $clock',
                    style: zuniaMono(
                      fontSize: ZuniaType.monoMicro,
                      letterSpacing: 1.2,
                      color: s.fgDim,
                    ),
                  ),
              ],
            ),
          ),

        // One headline that names where the funds are and whose move it is.
        Semantics(
          liveRegion: true,
          label: '${summary.title}. ${summary.detail}',
          child: Container(
            padding: const EdgeInsets.all(ZuniaSpace.s3),
            decoration: BoxDecoration(
              color: summaryTone.bg,
              borderRadius: BorderRadius.circular(ZuniaRadii.lg),
              border: Border.all(color: summaryTone.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 5),
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: summaryTone.fg,
                  ),
                ),
                const SizedBox(width: ZuniaSpace.s2 + 2),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        summary.title,
                        style: zuniaSans(
                          fontSize: ZuniaType.label,
                          fontWeight: FontWeight.w500,
                          color: summaryTone.fg,
                        ),
                      ),
                      const SizedBox(height: ZuniaSpace.s1),
                      Text(
                        summary.detail,
                        style: zuniaSans(
                          fontSize: ZuniaType.caption,
                          height: 1.5,
                          color: s.fgMuted,
                        ),
                      ),
                      if (summary.actionRequired) ...[
                        const SizedBox(height: ZuniaSpace.s2 + 2),
                        ZuniaButton(
                          label: recoverLabel,
                          size: ZuniaButtonSize.sm,
                          onPressed:
                              recoveryReady && recoverDisabledReason == null
                                  ? onRecover
                                  : null,
                        ),
                        if (recoverDisabledReason != null)
                          _RecoverNote(recoverDisabledReason!)
                        else if (!recoveryReady)
                          const _RecoverNote(
                            'No crosschain-swap contract is configured, so the '
                            'recover call cannot be built.',
                          )
                        else if (onRecover == null)
                          const _RecoverNote(
                            'Recovery is not wired up in this build.',
                          ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        if (sourceTxHash != null) ...[
          const SizedBox(height: ZuniaSpace.s3),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: ZuniaSpace.s3,
              vertical: ZuniaSpace.s2,
            ),
            decoration: BoxDecoration(
              color: s.glass,
              borderRadius: BorderRadius.circular(ZuniaRadii.lg),
            ),
            child: _TxRef(
              label: 'signed',
              chainId: sourceChainId ??
                  (hops.isNotEmpty ? hops.first.chainId : ''),
              txHash: sourceTxHash!,
              txUrl: txUrl,
              onOpenTx: onOpenTx,
              onCopyTxHash: onCopyTxHash,
            ),
          ),
        ],

        const SizedBox(height: ZuniaSpace.s3),

        for (var i = 0; i < hops.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: ZuniaSpace.s2),
            child: _HopStatusTile(
              hop: hops[i],
              status: resolved[i],
              compact: compact,
              txUrl: txUrl,
              onOpenTx: onOpenTx,
              onCopyTxHash: onCopyTxHash,
            ),
          ),

        if (onRefresh != null)
          Align(
            alignment: Alignment.centerLeft,
            child: ZuniaButton(
              label: 'Check again',
              variant: ZuniaButtonVariant.secondary,
              size: ZuniaButtonSize.sm,
              loading: loading,
              onPressed: onRefresh,
            ),
          ),

        if (footer != null)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s3),
            child: footer!,
          ),
      ],
    );
  }

  static String? _formatClock(BuildContext context, DateTime? at) {
    if (at == null) return null;
    return TimeOfDay.fromDateTime(at.toLocal()).format(context);
  }
}

class _RecoverNote extends StatelessWidget {
  const _RecoverNote(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: ZuniaSpace.s1),
      child: Text(
        text,
        // fgMuted over a status fill on surface: 8.62:1 light / 9.52:1 dark.
        style: zuniaMono(fontSize: ZuniaType.monoMicro, color: s.fgMuted),
      ),
    );
  }
}

class _TxRef extends StatelessWidget {
  const _TxRef({
    required this.label,
    required this.chainId,
    required this.txHash,
    this.txUrl,
    this.onOpenTx,
    this.onCopyTxHash,
  });

  final String label;
  final String chainId;
  final String txHash;
  final ZuniaTxUrlResolver? txUrl;
  final void Function(String url)? onOpenTx;
  final void Function(String txHash)? onCopyTxHash;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final url = txUrl?.call(chainId, txHash);
    final short = truncateAddress(txHash, left: 6, right: 6);
    final tappable = url != null && onOpenTx != null;

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: ZuniaSpace.s1 + 2,
      children: [
        Text(
          label.toUpperCase(),
          style: zuniaMono(
            fontSize: ZuniaType.monoMicro,
            letterSpacing: 1.2,
            color: s.fgDim,
          ),
        ),
        if (tappable)
          Semantics(
            link: true,
            label: '$label transaction $txHash on $chainId',
            child: InkWell(
              onTap: () => onOpenTx!(url),
              child: Text(
                short,
                style: zuniaMono(
                  fontSize: ZuniaType.monoMicro,
                  color: s.fg,
                ).copyWith(decoration: TextDecoration.underline),
              ),
            ),
          )
        else
          // No explorer configured for this chain, or no opener wired up. Show
          // the hash and let the user take it somewhere themselves rather than
          // inventing a destination.
          SelectableText(
            short,
            style: zuniaMono(fontSize: ZuniaType.monoMicro, color: s.fgMuted),
          ),
        if (onCopyTxHash != null)
          Semantics(
            button: true,
            label: 'Copy $label transaction hash',
            child: InkWell(
              onTap: () => onCopyTxHash!(txHash),
              child: Text(
                'COPY',
                style: zuniaMono(
                  fontSize: ZuniaType.monoMicro,
                  letterSpacing: 1.2,
                  color: s.fgMuted,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _HopStatusTile extends StatelessWidget {
  const _HopStatusTile({
    required this.hop,
    required this.status,
    required this.compact,
    this.txUrl,
    this.onOpenTx,
    this.onCopyTxHash,
  });

  final ZuniaPacketTrackerHop hop;
  final ZuniaPacketHopStatus status;
  final bool compact;
  final ZuniaTxUrlResolver? txUrl;
  final void Function(String url)? onOpenTx;
  final void Function(String txHash)? onCopyTxHash;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final presentation = zuniaPacketStatusPresentation(status);
    final tone = zuniaToneStyle(context, presentation.tone);
    final to = hop.toLabel;
    final heading = to == null ? hop.fromLabel : '${hop.fromLabel} → $to';

    return Container(
      padding: EdgeInsets.all(compact ? 10 : ZuniaSpace.s3),
      decoration: BoxDecoration(
        color: s.glass,
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        border: Border.all(color: s.line),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            alignment: Alignment.center,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: tone.bg,
              border: Border.all(color: tone.border),
            ),
            child: Text(
              presentation.glyph,
              style: TextStyle(fontSize: 11, color: tone.fg),
            ),
          ),
          const SizedBox(width: ZuniaSpace.s2 + 2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: ZuniaSpace.s1 + 2,
                  children: [
                    Text(
                      heading,
                      style: zuniaSans(
                        fontSize: ZuniaType.label,
                        fontWeight: FontWeight.w500,
                        color: s.fg,
                      ),
                    ),
                    // Text label, not colour alone.
                    Text(
                      presentation.label.toUpperCase(),
                      style: zuniaMono(
                        fontSize: ZuniaType.monoMicro,
                        letterSpacing: 1.2,
                        color: tone.fg,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: ZuniaSpace.s1),
                Text(
                  presentation.detail,
                  style: zuniaSans(
                    fontSize: ZuniaType.caption,
                    height: 1.5,
                    color: s.fgMuted,
                  ),
                ),
                if (hop.error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: ZuniaSpace.s1),
                    child: Text(
                      hop.error!,
                      // dangerFg over surface: 7.63:1 light / 11.35:1 dark.
                      style: zuniaMono(
                        fontSize: ZuniaType.monoMicro,
                        height: 1.5,
                        color: s.dangerFg,
                      ),
                    ),
                  ),
                const SizedBox(height: ZuniaSpace.s1 + 2),
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: ZuniaSpace.s3,
                  runSpacing: ZuniaSpace.s1,
                  children: [
                    if (hop.channelId != null && hop.channelId!.isNotEmpty)
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
                          '${hop.port}/${hop.channelId}',
                          style: zuniaMono(
                            fontSize: ZuniaType.monoMicro,
                            color: s.fgMuted,
                          ),
                        ),
                      ),
                    if (hop.sequence != null)
                      Text(
                        'seq ${hop.sequence}',
                        style: zuniaMono(
                          fontSize: ZuniaType.monoMicro,
                          color: s.fgDim,
                        ),
                      ),
                    if (hop.sendTxHash != null)
                      _TxRef(
                        label: 'send',
                        chainId: hop.chainId,
                        txHash: hop.sendTxHash!,
                        txUrl: txUrl,
                        onOpenTx: onOpenTx,
                        onCopyTxHash: onCopyTxHash,
                      ),
                    if (hop.receiveTxHash != null &&
                        hop.counterpartyChainId != null)
                      _TxRef(
                        label: 'recv',
                        chainId: hop.counterpartyChainId!,
                        txHash: hop.receiveTxHash!,
                        txUrl: txUrl,
                        onOpenTx: onOpenTx,
                        onCopyTxHash: onCopyTxHash,
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
