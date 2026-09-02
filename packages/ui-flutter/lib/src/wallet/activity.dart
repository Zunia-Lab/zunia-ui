import 'package:flutter/material.dart';
import 'package:zunia_ui/src/theme/zunia_semantics_ext.dart';

/// Structured history kinds shared with the React `@zunialab/ui` activity table.
enum ZuniaActivityKind {
  sent,
  received,
  ibc,
  swap,
  staking,
  claim,
  governance,
  other,
}

/// Icon glyph + colour tone for one activity kind.
class ZuniaActivityPresentation {
  const ZuniaActivityPresentation({
    required this.kind,
    required this.label,
    required this.icon,
    required this.fg,
    required this.bg,
    required this.border,
  });

  final ZuniaActivityKind kind;
  final String label;
  final String icon;
  final Color fg;
  final Color bg;
  final Color border;
}

/// Resolve badge colours + glyph. Failed txs always use danger styling.
ZuniaActivityPresentation zuniaActivityPresentation(
  BuildContext context, {
  ZuniaActivityKind? kind,
  String? kindName,
  bool success = true,
}) {
  final s = ZuniaSemanticsExt.of(context);
  final resolved = kind ?? _parseKind(kindName);

  if (!success) {
    return ZuniaActivityPresentation(
      kind: resolved,
      label: 'Failed',
      icon: '✕',
      fg: s.danger,
      bg: s.dangerFill,
      border: s.dangerLine,
    );
  }

  switch (resolved) {
    case ZuniaActivityKind.sent:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Send',
        icon: '↑',
        fg: s.danger,
        bg: s.dangerFill,
        border: s.dangerLine,
      );
    case ZuniaActivityKind.received:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Receive',
        icon: '↓',
        fg: s.success,
        bg: s.successFill,
        border: s.successLine,
      );
    case ZuniaActivityKind.ibc:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'IBC',
        icon: '⇄',
        fg: s.info,
        bg: s.infoFill,
        border: s.infoLine,
      );
    case ZuniaActivityKind.swap:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Swap',
        icon: '⇅',
        fg: s.accent,
        bg: s.accent.withValues(alpha: 0.16),
        border: s.accent.withValues(alpha: 0.45),
      );
    case ZuniaActivityKind.staking:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Stake',
        icon: '◆',
        fg: s.info,
        bg: s.infoFill,
        border: s.infoLine,
      );
    case ZuniaActivityKind.claim:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Claim',
        icon: '✦',
        fg: s.success,
        bg: s.successFill,
        border: s.successLine,
      );
    case ZuniaActivityKind.governance:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Vote',
        icon: '✓',
        fg: s.info,
        bg: s.infoFill,
        border: s.infoLine,
      );
    case ZuniaActivityKind.other:
      return ZuniaActivityPresentation(
        kind: resolved,
        label: 'Other',
        icon: '·',
        fg: s.fgMuted,
        bg: s.glass2,
        border: s.line,
      );
  }
}

/// Amount colour for inbound / claim success green, otherwise foreground.
Color zuniaActivityAmountColor(
  BuildContext context, {
  ZuniaActivityKind? kind,
  String? kindName,
  bool success = true,
  String? amount,
}) {
  final s = ZuniaSemanticsExt.of(context);
  if (!success) return s.danger;
  final resolved = kind ?? _parseKind(kindName);
  if (resolved == ZuniaActivityKind.received ||
      resolved == ZuniaActivityKind.claim) {
    return s.success;
  }
  if (resolved == ZuniaActivityKind.swap) return s.accent;
  if (amount != null && amount.trim().startsWith('-')) return s.fg;
  return s.fg;
}

/// Best-effort kind from free-form indexer / API copy.
ZuniaActivityKind zuniaInferActivityKind(String summary) {
  final hay = summary.toLowerCase();
  if (RegExp(r'swap|trade|pool').hasMatch(hay)) {
    return ZuniaActivityKind.swap;
  }
  if (RegExp(r'ibc|channel-').hasMatch(hay)) return ZuniaActivityKind.ibc;
  if (RegExp(r'claim|reward').hasMatch(hay)) return ZuniaActivityKind.claim;
  if (RegExp(r'vote|proposal|govern').hasMatch(hay)) {
    return ZuniaActivityKind.governance;
  }
  if (RegExp(r'undelegat|unbond|delegat|redelegat|stake').hasMatch(hay)) {
    return ZuniaActivityKind.staking;
  }
  if (RegExp(r'receive|inbound|deposit').hasMatch(hay)) {
    return ZuniaActivityKind.received;
  }
  if (RegExp(r'send|transfer|withdraw').hasMatch(hay)) {
    return ZuniaActivityKind.sent;
  }
  return ZuniaActivityKind.other;
}

ZuniaActivityKind _parseKind(String? name) {
  switch (name) {
    case 'sent':
      return ZuniaActivityKind.sent;
    case 'received':
      return ZuniaActivityKind.received;
    case 'ibc':
      return ZuniaActivityKind.ibc;
    case 'swap':
      return ZuniaActivityKind.swap;
    case 'staking':
      return ZuniaActivityKind.staking;
    case 'claim':
      return ZuniaActivityKind.claim;
    case 'governance':
      return ZuniaActivityKind.governance;
    default:
      return ZuniaActivityKind.other;
  }
}
