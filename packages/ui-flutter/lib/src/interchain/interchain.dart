import 'package:flutter/material.dart';

import '../theme/zunia_semantics_ext.dart';

/// Shared vocabulary for cross-chain UI: route hops, packet lifecycle, swaps.
///
/// This is the Dart twin of `interchain.ts` in `@zunialab/ui`. Every enum here
/// mirrors a string union in `@zunialab/interchain`, name for name, so a value
/// decoded from the engine maps onto one of these without a lookup table.
///
/// Colour resolution is split out into [zuniaToneStyle] rather than baked into
/// the presentation records, because the semantic tokens live on the theme and
/// a pure record has no `BuildContext`. That split also keeps this file
/// testable without a widget tree.

/* -------------------------------------------------------------------------- *
 * Tone
 * -------------------------------------------------------------------------- */

/// Status colour roles. The same five words the `ZuniaCallout` tone uses, so
/// one tone name means one thing anywhere in the kit.
enum ZuniaInterchainTone { neutral, info, success, warning, danger }

/// Resolved colours for one tone.
@immutable
class ZuniaToneStyle {
  const ZuniaToneStyle({
    required this.fg,
    required this.bg,
    required this.border,
  });

  /// Glyph / label colour.
  final Color fg;

  /// Soft fill behind a badge.
  final Color bg;

  /// Badge ring.
  final Color border;
}

/// Colours for a tone.
///
/// Each pair is one the `@zunialab/tokens` contrast gate already certifies (a
/// status hue on its own fill over surface), so a widget using this cannot
/// quietly introduce a failing pair.
ZuniaToneStyle zuniaToneStyle(BuildContext context, ZuniaInterchainTone tone) {
  final s = ZuniaSemanticsExt.of(context);
  switch (tone) {
    case ZuniaInterchainTone.neutral:
      return ZuniaToneStyle(fg: s.fgMuted, bg: s.glass2, border: s.line);
    case ZuniaInterchainTone.info:
      return ZuniaToneStyle(fg: s.info, bg: s.infoFill, border: s.infoLine);
    case ZuniaInterchainTone.success:
      return ZuniaToneStyle(
        fg: s.success,
        bg: s.successFill,
        border: s.successLine,
      );
    case ZuniaInterchainTone.warning:
      return ZuniaToneStyle(
        fg: s.warning,
        bg: s.warningFill,
        border: s.warningLine,
      );
    case ZuniaInterchainTone.danger:
      return ZuniaToneStyle(
        fg: s.danger,
        bg: s.dangerFill,
        border: s.dangerLine,
      );
  }
}

/* -------------------------------------------------------------------------- *
 * Channels and routes
 * -------------------------------------------------------------------------- */

/// Mirrors `ChannelRouteSource` in `@zunialab/interchain`.
enum ZuniaChannelSource { discovered, manual, seed }

/// Mirrors `IbcChannelState` in `@zunialab/interchain`.
enum ZuniaChannelState { open, closed, init, tryopen, unknown }

/// Mirrors `RouteHopKind` in `@zunialab/interchain`.
enum ZuniaRouteHopKind { transfer, forward, swap }

/// How much the UI may claim about a channel.
enum ZuniaChannelTrustLevel { verified, unverified, closed }

@immutable
class ZuniaChannelTrust {
  const ZuniaChannelTrust({
    required this.level,
    required this.label,
    required this.detail,
    required this.tone,
    required this.loud,
    required this.sourceLabel,
  });

  final ZuniaChannelTrustLevel level;

  /// Badge text.
  final String label;

  /// One sentence naming the failure mode, shown next to the hop.
  final String detail;

  final ZuniaInterchainTone tone;

  /// True when the hop must be visually obvious rather than merely annotated.
  ///
  /// Sending over the wrong channel mints a token the destination chain has no
  /// record of, and no retry undoes that.
  final bool loud;

  /// Where the id came from. Orthogonal to [level].
  final String sourceLabel;
}

String _sourceLabel(ZuniaChannelSource source) {
  switch (source) {
    case ZuniaChannelSource.manual:
      return 'You entered this';
    case ZuniaChannelSource.discovered:
      return 'Discovered on chain';
    case ZuniaChannelSource.seed:
      return 'Shipped default';
  }
}

String _unverifiedDetail(ZuniaChannelSource source) {
  switch (source) {
    case ZuniaChannelSource.manual:
      return 'You typed this channel id and nothing has confirmed it links these '
          'two chains. The wrong channel mints a token the destination will not '
          'recognise.';
    case ZuniaChannelSource.discovered:
      return 'Read from the source chain\'s channel list but not re-checked '
          'since. Confirm it before signing.';
    case ZuniaChannelSource.seed:
      return 'A default shipped with the app, not confirmed on chain in this '
          'session. Confirm it before signing.';
  }
}

String _channelStateWord(ZuniaChannelState state) {
  switch (state) {
    case ZuniaChannelState.open:
      return 'open';
    case ZuniaChannelState.closed:
      return 'closed';
    case ZuniaChannelState.init:
      return 'init';
    case ZuniaChannelState.tryopen:
      return 'tryopen';
    case ZuniaChannelState.unknown:
      return 'unknown';
  }
}

/// Decide what may be claimed about one channel.
///
/// `verified` is never inferred from the id looking plausible or from the route
/// having been used before: only an explicit `verified: true` from a chain check
/// earns the quiet badge. Everything else is loud.
ZuniaChannelTrust zuniaChannelTrust({
  bool? verified,
  ZuniaChannelSource source = ZuniaChannelSource.discovered,
  ZuniaChannelState? state,
}) {
  final sourceLabel = _sourceLabel(source);

  // A known-but-not-open state is the strongest signal we have, and it beats a
  // stale `verified` flag: the channel was open when we checked and is not now.
  if (state != null &&
      state != ZuniaChannelState.open &&
      state != ZuniaChannelState.unknown) {
    return ZuniaChannelTrust(
      level: ZuniaChannelTrustLevel.closed,
      label: 'Channel not open',
      detail: 'The chain reports this channel as ${_channelStateWord(state)}, '
          'not open. A packet sent over it cannot be delivered.',
      tone: ZuniaInterchainTone.danger,
      loud: true,
      sourceLabel: sourceLabel,
    );
  }

  if (verified == true) {
    return ZuniaChannelTrust(
      level: ZuniaChannelTrustLevel.verified,
      label: 'Verified',
      detail: 'Confirmed open on chain, with a matching counterparty.',
      tone: ZuniaInterchainTone.success,
      loud: false,
      sourceLabel: sourceLabel,
    );
  }

  return ZuniaChannelTrust(
    level: ZuniaChannelTrustLevel.unverified,
    label: 'Not verified',
    detail: _unverifiedDetail(source),
    tone: ZuniaInterchainTone.warning,
    loud: true,
    sourceLabel: sourceLabel,
  );
}

/// Short label for the hop kind, shown on the connector between two chains.
String zuniaRouteHopKindLabel(ZuniaRouteHopKind kind) {
  switch (kind) {
    case ZuniaRouteHopKind.transfer:
      return 'IBC transfer';
    case ZuniaRouteHopKind.forward:
      return 'Forwarded (PFM)';
    case ZuniaRouteHopKind.swap:
      return 'Swap';
  }
}

/* -------------------------------------------------------------------------- *
 * Durations and fee copy
 * -------------------------------------------------------------------------- */

/// Compact duration for an "arrives in about…" line.
///
/// Returns null rather than a zero when the estimate is missing or nonsense:
/// "0s" reads as an answer, and the absence of an estimate is not one.
String? zuniaFormatApproxDuration(num? seconds) {
  if (seconds == null || !seconds.isFinite || seconds <= 0) return null;
  if (seconds < 90) return '${seconds.round()}s';
  final minutes = (seconds / 60).round();
  if (minutes < 60) return '$minutes min';
  final hours = minutes ~/ 60;
  final rest = minutes % 60;
  return rest == 0 ? '$hours h' : '$hours h $rest min';
}

/// The one sentence all three clients must say about who pays for what.
///
/// Protocol fact, not marketing: the user signs one `MsgTransfer` on the source
/// chain and pays gas only there, in that chain's token. Later hops and any
/// contract call are executed by relayers inside packet processing.
String zuniaSourceGasNote(String chainName, {String? venueName}) {
  final base = 'You pay gas only on $chainName, in $chainName\'s own token. '
      'The later hops are carried by relayers, who pay for them.';
  if (venueName == null || venueName.isEmpty) return base;
  return '$base You do not need a $venueName account or $venueName gas — the '
      'swap runs inside packet processing.';
}

/* -------------------------------------------------------------------------- *
 * Packet lifecycle
 * -------------------------------------------------------------------------- */

/// Lifecycle of one hop.
///
/// Everything except [stalled] mirrors `PacketStatus` in
/// `@zunialab/interchain`. `stalled` is a display state folded in by
/// [zuniaResolveHopStatus] from the engine's `RouteHopTrace.stalled` flag: the
/// chain has no such state, and a client must not report it as one.
enum ZuniaPacketHopStatus {
  pending,
  relayed,
  received,
  acknowledged,
  timeout,
  failed,
  stalled,
  unknown,
}

/// Why a transfer stopped. Mirrors `PacketFailureKind` in
/// `@zunialab/interchain`; comes straight off `RouteTrace.failure`.
///
/// Separate from [ZuniaPacketHopStatus] because the status says where the packet
/// is and this says what the user must do.
enum ZuniaPacketFailureKind {
  timeout,
  ackError,
  stalled,
  swapDeliveryFailed,
}

@immutable
class ZuniaPacketStatusPresentation {
  const ZuniaPacketStatusPresentation({
    required this.status,
    required this.label,
    required this.detail,
    required this.tone,
    required this.glyph,
    required this.terminal,
    required this.moving,
  });

  final ZuniaPacketHopStatus status;
  final String label;

  /// One sentence saying where the funds are and whether anything is wrong.
  final String detail;

  final ZuniaInterchainTone tone;
  final String glyph;

  /// No further polling will change this hop.
  final bool terminal;

  /// The packet is making progress right now.
  final bool moving;
}

ZuniaPacketStatusPresentation zuniaPacketStatusPresentation(
  ZuniaPacketHopStatus status,
) {
  switch (status) {
    case ZuniaPacketHopStatus.pending:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.pending,
        label: 'Pending',
        detail: 'Sent from the source chain. No relayer has picked it up yet.',
        tone: ZuniaInterchainTone.info,
        glyph: '◔',
        terminal: false,
        moving: true,
      );
    case ZuniaPacketHopStatus.relayed:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.relayed,
        label: 'Relayed',
        detail: 'A relayer submitted it on the destination chain.',
        tone: ZuniaInterchainTone.info,
        glyph: '◑',
        terminal: false,
        moving: true,
      );
    case ZuniaPacketHopStatus.received:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.received,
        label: 'Received',
        detail:
            'The destination chain wrote the receipt. The funds have landed.',
        tone: ZuniaInterchainTone.success,
        glyph: '◕',
        terminal: false,
        moving: true,
      );
    case ZuniaPacketHopStatus.acknowledged:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.acknowledged,
        label: 'Acknowledged',
        detail: 'The acknowledgement came back to the source chain. '
            'This hop is done.',
        tone: ZuniaInterchainTone.success,
        glyph: '●',
        terminal: true,
        moving: false,
      );
    case ZuniaPacketHopStatus.timeout:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.timeout,
        label: 'Timed out',
        detail: 'The packet expired before a relayer delivered it, and the '
            'escrow refunded the source chain.',
        tone: ZuniaInterchainTone.warning,
        glyph: '⟲',
        terminal: true,
        moving: false,
      );
    case ZuniaPacketHopStatus.failed:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.failed,
        label: 'Failed',
        detail: 'The destination chain rejected the packet, and the escrow '
            'returned the funds on the source chain.',
        tone: ZuniaInterchainTone.danger,
        glyph: '✕',
        terminal: true,
        moving: false,
      );
    case ZuniaPacketHopStatus.stalled:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.stalled,
        label: 'Stalled',
        detail: 'No relayer has moved this for a while. The funds sit in the '
            'channel escrow — not lost, and still deliverable.',
        tone: ZuniaInterchainTone.warning,
        glyph: '◔',
        terminal: false,
        moving: false,
      );
    case ZuniaPacketHopStatus.unknown:
      return const ZuniaPacketStatusPresentation(
        status: ZuniaPacketHopStatus.unknown,
        label: 'Unknown',
        detail: 'No endpoint could answer for this hop. That is not a failure — '
            'it means we do not know yet.',
        tone: ZuniaInterchainTone.neutral,
        glyph: '?',
        terminal: false,
        moving: false,
      );
  }
}

/// Fold the engine's `stalled` flag into the display status.
///
/// Deliberately not a timer. `@zunialab/interchain` already decides this, in
/// `isHopStalled`, against a per-hop-kind threshold (four times the expected
/// duration, floored at five minutes) — a flat clock in the UI would disagree
/// with the engine on the same trace and be wrong more often, since a swap hop
/// and a forward hop do not take the same time. Pass `RouteHopTrace.stalled`
/// through and let the engine own the heuristic.
///
/// Only in-flight hops can stall, matching the engine's own gate: `received`
/// means the funds landed, and a late acknowledgement is not something the user
/// can act on.
ZuniaPacketHopStatus zuniaResolveHopStatus(
  ZuniaPacketHopStatus status, {
  bool stalled = false,
}) {
  if (!stalled) return status;
  if (status == ZuniaPacketHopStatus.pending ||
      status == ZuniaPacketHopStatus.relayed ||
      status == ZuniaPacketHopStatus.unknown) {
    return ZuniaPacketHopStatus.stalled;
  }
  return status;
}

/// Where the money is, in the user's terms.
///
/// These outcomes exist because the user's next action differs in each: wait,
/// wait but check back, nothing (it came back), claim it, or nothing yet known.
/// Collapsing any two of them is what made the old hardcoded progress bars
/// dishonest.
enum ZuniaPacketFundsState {
  inFlight,
  arrived,
  stalled,
  returned,
  recoverable,
  unknown,
}

@immutable
class ZuniaPacketFundsSummary {
  const ZuniaPacketFundsSummary({
    required this.state,
    required this.title,
    required this.detail,
    required this.tone,
    required this.actionRequired,
  });

  final ZuniaPacketFundsState state;
  final String title;
  final String detail;
  final ZuniaInterchainTone tone;

  /// The user must do something; nothing will resolve this on its own.
  final bool actionRequired;
}

/// Aggregate [ZuniaPacketFundsSummary] for a whole route.
///
/// Prefers [failure] from the engine's `RouteTrace`; falls back to the hop
/// statuses so a caller holding only a plain `PacketTrace` still gets an honest
/// headline.
///
/// [recoveryReady] means `RouteTrace.recovery.msg` is non-null, i.e. a recover
/// message can actually be built. False means the crosschain-swap contract
/// address or the recovery address is missing from host config, and the summary
/// says so instead of promising a claim that cannot be made.
ZuniaPacketFundsSummary zuniaPacketFundsSummary(
  List<ZuniaPacketHopStatus> statuses, {
  ZuniaPacketFailureKind? failure,
  bool recoveryReady = false,
}) {
  // Recovery outranks everything: it is the only outcome that stops without the
  // user, so it must not be buried under an earlier hop's happy status.
  if (failure == ZuniaPacketFailureKind.swapDeliveryFailed) {
    return ZuniaPacketFundsSummary(
      state: ZuniaPacketFundsState.recoverable,
      title: 'Recoverable — action needed',
      detail: recoveryReady
          ? 'The swap ran but the final delivery failed, so the contract is '
              'holding the output for your recovery address. Nothing is lost '
              'and nothing is moving: claim it.'
          : 'The swap ran but the final delivery failed, so the contract is '
              'holding the output for your recovery address. The funds are '
              'safe, but this build has no crosschain-swap contract address '
              'configured, so it cannot build the recover call. That is a '
              'configuration gap, not a chain failure.',
      tone: recoveryReady
          ? ZuniaInterchainTone.warning
          : ZuniaInterchainTone.danger,
      actionRequired: true,
    );
  }

  if (failure == ZuniaPacketFailureKind.ackError) return _fundsRejected;
  if (failure == ZuniaPacketFailureKind.timeout) return _fundsTimedOut;
  if (failure == ZuniaPacketFailureKind.stalled) return _fundsStalled;

  if (statuses.isEmpty) {
    return const ZuniaPacketFundsSummary(
      state: ZuniaPacketFundsState.unknown,
      title: 'Nothing to track yet',
      detail: 'No hop has been observed. That is not a failure.',
      tone: ZuniaInterchainTone.neutral,
      actionRequired: false,
    );
  }

  if (statuses.contains(ZuniaPacketHopStatus.failed)) return _fundsRejected;
  if (statuses.contains(ZuniaPacketHopStatus.timeout)) return _fundsTimedOut;
  if (statuses.contains(ZuniaPacketHopStatus.stalled)) return _fundsStalled;

  if (statuses.every((s) => s == ZuniaPacketHopStatus.acknowledged)) {
    return const ZuniaPacketFundsSummary(
      state: ZuniaPacketFundsState.arrived,
      title: 'Arrived',
      detail: 'Every hop completed. The funds are on the destination chain.',
      tone: ZuniaInterchainTone.success,
      actionRequired: false,
    );
  }

  final moving = statuses.any((s) =>
      s == ZuniaPacketHopStatus.pending ||
      s == ZuniaPacketHopStatus.relayed ||
      s == ZuniaPacketHopStatus.received);
  if (moving) {
    return const ZuniaPacketFundsSummary(
      state: ZuniaPacketFundsState.inFlight,
      title: 'Moving',
      detail: 'The transfer is on its way. Nothing to do but wait.',
      tone: ZuniaInterchainTone.info,
      actionRequired: false,
    );
  }

  return const ZuniaPacketFundsSummary(
    state: ZuniaPacketFundsState.unknown,
    title: 'Status unknown',
    detail: 'No endpoint could answer for this transfer. That is not a '
        'failure — try again in a moment.',
    tone: ZuniaInterchainTone.neutral,
    actionRequired: false,
  );
}

const _fundsRejected = ZuniaPacketFundsSummary(
  state: ZuniaPacketFundsState.returned,
  title: 'Failed — funds returned',
  detail: 'A hop was rejected, and the escrow released the funds back on the '
      'source chain. Nothing is stuck.',
  tone: ZuniaInterchainTone.danger,
  actionRequired: false,
);

const _fundsTimedOut = ZuniaPacketFundsSummary(
  state: ZuniaPacketFundsState.returned,
  title: 'Timed out — funds returned',
  detail: 'The packet expired before a relayer delivered it, and the escrow '
      'refunded the source chain. You can try again.',
  tone: ZuniaInterchainTone.warning,
  actionRequired: false,
);

const _fundsStalled = ZuniaPacketFundsSummary(
  state: ZuniaPacketFundsState.stalled,
  title: 'Stuck — funds safe',
  detail: 'A hop has not moved for a while. The funds sit in the channel '
      'escrow, still deliverable, and no action is needed yet.',
  tone: ZuniaInterchainTone.warning,
  actionRequired: false,
);

/* -------------------------------------------------------------------------- *
 * Swap quotes
 * -------------------------------------------------------------------------- */

enum ZuniaPriceImpactSeverity { low, elevated, high }

/// Above 1% the user should see it; above 5% they should have to look at it.
const double kZuniaPriceImpactWarn = 1;
const double kZuniaPriceImpactHigh = 5;

ZuniaPriceImpactSeverity zuniaPriceImpactSeverity(
  double? percent, {
  double warnAt = kZuniaPriceImpactWarn,
  double highAt = kZuniaPriceImpactHigh,
}) {
  if (percent == null || !percent.isFinite) return ZuniaPriceImpactSeverity.low;
  if (percent >= highAt) return ZuniaPriceImpactSeverity.high;
  if (percent >= warnAt) return ZuniaPriceImpactSeverity.elevated;
  return ZuniaPriceImpactSeverity.low;
}

ZuniaInterchainTone zuniaPriceImpactTone(ZuniaPriceImpactSeverity severity) {
  switch (severity) {
    case ZuniaPriceImpactSeverity.high:
      return ZuniaInterchainTone.danger;
    case ZuniaPriceImpactSeverity.elevated:
      return ZuniaInterchainTone.warning;
    case ZuniaPriceImpactSeverity.low:
      return ZuniaInterchainTone.neutral;
  }
}

@immutable
class ZuniaSlippageCheck {
  const ZuniaSlippageCheck({
    required this.ok,
    required this.message,
    required this.tone,
  });

  final bool ok;

  /// Null when there is nothing to say.
  final String? message;

  final ZuniaInterchainTone tone;
}

/// Validate a slippage tolerance against what the contract actually accepts.
///
/// Protocol fact: `slippage_percentage` on the Osmosis swaprouter is a 0-100
/// percentage — the contract divides by 100 itself. Passing 0.005 for "0.5%"
/// asks for 0.005%, and the swap reverts.
ZuniaSlippageCheck zuniaCheckSlippage(double percent) {
  if (!percent.isFinite) {
    return const ZuniaSlippageCheck(
      ok: false,
      message: 'Enter a slippage percentage.',
      tone: ZuniaInterchainTone.danger,
    );
  }
  if (percent < 0 || percent > 100) {
    return const ZuniaSlippageCheck(
      ok: false,
      message: 'Slippage must be between 0 and 100. The contract reads this as '
          'a percentage, not a fraction.',
      tone: ZuniaInterchainTone.danger,
    );
  }
  if (percent == 0) {
    return const ZuniaSlippageCheck(
      ok: true,
      message: '0% leaves no room for the pool to move; most swaps will revert.',
      tone: ZuniaInterchainTone.warning,
    );
  }
  if (percent >= 20) {
    return const ZuniaSlippageCheck(
      ok: true,
      message: 'Above 20% you can lose most of the trade to a bad price.',
      tone: ZuniaInterchainTone.danger,
    );
  }
  if (percent >= 5) {
    return const ZuniaSlippageCheck(
      ok: true,
      message: 'Above 5% is unusual outside a thin pool.',
      tone: ZuniaInterchainTone.warning,
    );
  }
  return const ZuniaSlippageCheck(
    ok: true,
    message: null,
    tone: ZuniaInterchainTone.neutral,
  );
}
