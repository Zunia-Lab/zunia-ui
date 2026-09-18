import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../primitives/avatar.dart';
import '../primitives/feedback.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import 'interchain.dart';

/// One leg of a planned route.
///
/// Field names mirror `RouteHop` in `@zunialab/interchain`, plus the display
/// extras a client resolves (names, icons).
@immutable
class ZuniaRoutePreviewHop {
  const ZuniaRoutePreviewHop({
    required this.chainId,
    required this.channelId,
    this.chainName,
    this.chainIconUrl,
    this.counterpartyChainId,
    this.counterpartyChainName,
    this.counterpartyChainIconUrl,
    this.port = 'transfer',
    this.kind = ZuniaRouteHopKind.transfer,
    this.channelSource = ZuniaChannelSource.discovered,
    this.channelVerified,
    this.channelState,
  });

  /// Chain the hop leaves from.
  final String chainId;

  /// Human name; falls back to [chainId], never to a blank.
  final String? chainName;
  final String? chainIconUrl;

  /// Chain the hop arrives on, or null when the counterparty is unresolved.
  final String? counterpartyChainId;
  final String? counterpartyChainName;
  final String? counterpartyChainIconUrl;

  /// Channel on [chainId]. Empty for a swap that moves no packet.
  final String channelId;
  final String port;

  final ZuniaRouteHopKind kind;

  /// Where the channel id came from. Mirrors `ChannelRouteSource`.
  final ZuniaChannelSource channelSource;

  /// Confirmed open on chain. Null or false renders as NOT verified.
  final bool? channelVerified;

  /// Last observed channel state. Mirrors `IbcChannelState`.
  final ZuniaChannelState? channelState;

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

/// The ordered hops of a planned cross-chain route, with per-hop channel trust.
///
/// The unverified state is loud on purpose. A channel id that looks right but
/// connects somewhere else does not fail: it succeeds, and mints a token the
/// destination chain has no record of. That is the one error in this flow a user
/// cannot undo, so it gets a fill, a border, a glyph and a sentence rather than
/// a grey footnote.
class ZuniaRoutePreview extends StatelessWidget {
  const ZuniaRoutePreview({
    super.key,
    required this.hops,
    this.estimatedDurationSeconds,
    this.warnings = const [],
    this.requiresPfm = false,
    this.requiresIbcHooks = false,
    this.gasChainName,
    this.swapVenueName,
    this.loading = false,
    this.error,
    this.onRetry,
    this.retryLabel = 'Try again',
    this.emptyTitle = 'No route yet',
    this.emptyDescription =
        'Pick a destination chain and an amount to plan a route.',
    this.footer,
    this.compact = false,
    this.title = 'Route',
  });

  final List<ZuniaRoutePreviewHop> hops;

  /// From `RoutePlan.estimatedDurationSeconds`. Omitted rather than guessed.
  final num? estimatedDurationSeconds;

  /// From `RoutePlan.warnings`. Rendered verbatim.
  final List<String> warnings;

  final bool requiresPfm;
  final bool requiresIbcHooks;

  /// Chain the user signs on. When set, the panel states who pays for what.
  final String? gasChainName;

  /// Venue running a contract mid-route, e.g. 'Osmosis'.
  final String? swapVenueName;

  final bool loading;

  /// Planning failed. Shown instead of a route, never alongside a partial one.
  final String? error;

  final VoidCallback? onRetry;
  final String retryLabel;
  final String emptyTitle;
  final String emptyDescription;

  /// Slot under the route, e.g. a "Verify channels" control.
  final Widget? footer;

  /// Tighter rows for a narrow phone or the 360px popup.
  final bool compact;

  /// Pass null to drop the heading inside an already-titled panel.
  final String? title;

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
            title: 'Could not plan this route',
            body: error!,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: ZuniaSpace.s3),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(onPressed: onRetry, child: Text(retryLabel)),
            ),
          ],
        ],
      );
    }

    if (loading) {
      return Semantics(
        label: 'Planning route',
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
                  child: Row(
                    children: [
                      const ZuniaSkeleton(width: 28, height: 28),
                      const SizedBox(width: ZuniaSpace.s3),
                      const Expanded(
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

    if (hops.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (title != null) ...[
            ZuniaSectionLabel(title!),
            const SizedBox(height: ZuniaSpace.s3),
          ],
          ZuniaEmptyState(title: emptyTitle, description: emptyDescription),
        ],
      );
    }

    final trusts = hops
        .map((h) => zuniaChannelTrust(
              verified: h.channelVerified,
              source: h.channelSource,
              state: h.channelState,
            ))
        .toList(growable: false);
    final loudCount = trusts.where((t) => t.loud).length;
    final duration = zuniaFormatApproxDuration(estimatedDurationSeconds);
    final first = hops.first;
    final last = hops.last;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title != null || duration != null)
          Padding(
            padding: const EdgeInsets.only(bottom: ZuniaSpace.s3),
            child: Row(
              children: [
                if (title != null)
                  Expanded(child: ZuniaSectionLabel(title!))
                else
                  const Spacer(),
                if (duration != null)
                  // fgMuted on surface: 9.74:1 light / 10.86:1 dark.
                  Text(
                    '≈ $duration',
                    style: zuniaMono(
                      fontSize: ZuniaType.monoMicro,
                      letterSpacing: 1.2,
                      color: s.fgMuted,
                    ),
                  ),
              ],
            ),
          ),

        // Endpoints first: most users only want to know where it starts and ends.
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: ZuniaSpace.s3,
            vertical: ZuniaSpace.s2 + 2,
          ),
          decoration: BoxDecoration(
            color: s.glass,
            borderRadius: BorderRadius.circular(ZuniaRadii.lg),
          ),
          child: Row(
            children: [
              ZuniaAvatar(
                imageUrl: first.chainIconUrl,
                fallback: first.fromLabel,
                size: 20,
              ),
              const SizedBox(width: ZuniaSpace.s2),
              Expanded(
                child: Text(
                  first.fromLabel,
                  overflow: TextOverflow.ellipsis,
                  style: zuniaSans(
                    fontSize: ZuniaType.label,
                    fontWeight: FontWeight.w500,
                    color: s.fg,
                  ),
                ),
              ),
              Text('→', style: zuniaMono(fontSize: 12, color: s.fgDim)),
              const SizedBox(width: ZuniaSpace.s2),
              Expanded(
                child: Text(
                  last.toLabel ?? last.fromLabel,
                  textAlign: TextAlign.end,
                  overflow: TextOverflow.ellipsis,
                  style: zuniaSans(
                    fontSize: ZuniaType.label,
                    fontWeight: FontWeight.w500,
                    color: s.fg,
                  ),
                ),
              ),
              const SizedBox(width: ZuniaSpace.s2),
              ZuniaAvatar(
                imageUrl: last.counterpartyChainIconUrl,
                fallback: last.toLabel ?? last.fromLabel,
                size: 20,
              ),
            ],
          ),
        ),

        if (loudCount > 0) ...[
          const SizedBox(height: ZuniaSpace.s3),
          ZuniaCallout(
            tone: ZuniaCalloutTone.warning,
            title: loudCount == 1
                ? '1 channel on this route is not verified'
                : '$loudCount channels on this route are not verified',
            body: 'Sending over the wrong channel does not fail — it delivers a '
                'token the destination chain does not recognise, and that cannot '
                'be undone by retrying. Verify each highlighted hop before you '
                'sign.',
          ),
        ],

        const SizedBox(height: ZuniaSpace.s3),

        for (var i = 0; i < hops.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: ZuniaSpace.s2),
            child: _HopTile(
              index: i,
              hop: hops[i],
              trust: trusts[i],
              compact: compact,
            ),
          ),

        if (requiresPfm || requiresIbcHooks)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s1),
            child: Wrap(
              spacing: ZuniaSpace.s2,
              runSpacing: ZuniaSpace.s1,
              children: [
                if (requiresPfm) const _MetaChip('Packet forward'),
                if (requiresIbcHooks) const _MetaChip('Contract call on arrival'),
              ],
            ),
          ),

        if (warnings.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s3),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final w in warnings)
                  Padding(
                    padding: const EdgeInsets.only(bottom: ZuniaSpace.s1),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(top: 7),
                          width: 4,
                          height: 4,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: s.warning,
                          ),
                        ),
                        const SizedBox(width: ZuniaSpace.s2),
                        Expanded(
                          child: Text(
                            w,
                            style: zuniaSans(
                              fontSize: ZuniaType.caption,
                              height: 1.5,
                              color: s.fgMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),

        if (gasChainName != null)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s3),
            child: Text(
              zuniaSourceGasNote(gasChainName!, venueName: swapVenueName),
              style: zuniaSans(
                fontSize: ZuniaType.caption,
                height: 1.5,
                color: s.fgMuted,
              ),
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
}

class _MetaChip extends StatelessWidget {
  const _MetaChip(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: s.glass2,
        borderRadius: BorderRadius.circular(ZuniaRadii.full),
      ),
      child: Text(
        label.toUpperCase(),
        style: zuniaMono(
          fontSize: ZuniaType.monoMicro,
          letterSpacing: 1.2,
          color: s.fgMuted,
        ),
      ),
    );
  }
}

class _HopTile extends StatelessWidget {
  const _HopTile({
    required this.index,
    required this.hop,
    required this.trust,
    required this.compact,
  });

  final int index;
  final ZuniaRoutePreviewHop hop;
  final ZuniaChannelTrust trust;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final tone = zuniaToneStyle(context, trust.tone);
    final to = hop.toLabel;

    return Semantics(
      label: 'Hop ${index + 1}: ${hop.fromLabel} to '
          '${to ?? 'unresolved chain'}, ${hop.port}/${hop.channelId}, '
          '${trust.label}, ${trust.sourceLabel}',
      child: Container(
        padding: EdgeInsets.all(compact ? 10 : ZuniaSpace.s3),
        decoration: BoxDecoration(
          color: trust.loud ? tone.bg : s.glass,
          borderRadius: BorderRadius.circular(ZuniaRadii.lg),
          border: Border.all(color: trust.loud ? tone.border : s.line),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 18,
              height: 18,
              alignment: Alignment.center,
              margin: const EdgeInsets.only(top: 2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: tone.bg,
                border: Border.all(color: tone.border),
              ),
              child: Text(
                '${index + 1}',
                style: zuniaMono(fontSize: 9, color: tone.fg),
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
                    runSpacing: ZuniaSpace.s1,
                    children: [
                      ZuniaAvatar(
                        imageUrl: hop.chainIconUrl,
                        fallback: hop.fromLabel,
                        size: 16,
                      ),
                      Text(
                        hop.fromLabel,
                        style: zuniaSans(
                          fontSize: ZuniaType.label,
                          fontWeight: FontWeight.w500,
                          color: s.fg,
                        ),
                      ),
                      Text('→', style: zuniaMono(fontSize: 11, color: s.fgDim)),
                      ZuniaAvatar(
                        imageUrl: hop.counterpartyChainIconUrl,
                        fallback: to ?? 'unresolved',
                        size: 16,
                      ),
                      Text(
                        to ?? 'Counterparty unresolved',
                        // fgDim on surface: 5.36:1 light / 5.11:1 dark — an
                        // unresolved counterparty stays legible, it just reads
                        // as provisional.
                        style: zuniaSans(
                          fontSize: ZuniaType.label,
                          fontWeight: FontWeight.w500,
                          color: to == null ? s.fgDim : s.fg,
                        ).copyWith(
                          fontStyle: to == null ? FontStyle.italic : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: ZuniaSpace.s1 + 2),
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: ZuniaSpace.s1 + 2,
                    runSpacing: ZuniaSpace.s1,
                    children: [
                      Text(
                        zuniaRouteHopKindLabel(hop.kind).toUpperCase(),
                        style: zuniaMono(
                          fontSize: ZuniaType.monoMicro,
                          letterSpacing: 1.2,
                          color: s.fgMuted,
                        ),
                      ),
                      if (hop.channelId.isNotEmpty)
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
                              color: s.fg,
                            ),
                          ),
                        )
                      else
                        Text(
                          'no packet',
                          style: zuniaMono(
                            fontSize: ZuniaType.monoMicro,
                            color: s.fgDim,
                          ),
                        ),
                      // Text label, not colour alone: the state has to survive a
                      // monochrome or high-contrast rendering.
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: tone.bg,
                          borderRadius: BorderRadius.circular(ZuniaRadii.full),
                          border: Border.all(color: tone.border),
                        ),
                        child: Text(
                          '${trust.level == ZuniaChannelTrustLevel.verified ? '✓' : '!'} '
                          '${trust.label.toUpperCase()}',
                          style: zuniaMono(
                            fontSize: ZuniaType.monoMicro,
                            letterSpacing: 1.1,
                            color: tone.fg,
                          ),
                        ),
                      ),
                      Text(
                        trust.sourceLabel,
                        style: zuniaMono(
                          fontSize: ZuniaType.monoMicro,
                          color: s.fgDim,
                        ),
                      ),
                    ],
                  ),
                  if (trust.loud)
                    Padding(
                      padding: const EdgeInsets.only(top: ZuniaSpace.s1 + 2),
                      child: Text(
                        trust.detail,
                        style: zuniaSans(
                          fontSize: ZuniaType.caption,
                          height: 1.5,
                          color: s.fgMuted,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
