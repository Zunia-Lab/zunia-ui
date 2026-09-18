import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import '../primitives/button.dart';
import '../primitives/feedback.dart';
import 'display.dart';

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

class ZuniaMessageDecodeList extends StatelessWidget {
  const ZuniaMessageDecodeList({
    super.key,
    required this.messages,
  });

  final List<({String type, String summary})> messages;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < messages.length; i++)
          Container(
            margin: EdgeInsets.only(bottom: i == messages.length - 1 ? 0 : 8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: s.line),
              color: s.stateHover,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${i + 1}. ${messages[i].type}',
                  style: zuniaMono(fontSize: 9.5, color: s.fgDim),
                ),
                const SizedBox(height: 4),
                Text(
                  messages[i].summary,
                  style: zuniaSans(fontSize: 12.5, color: s.fg),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class ZuniaApproveSession extends StatelessWidget {
  const ZuniaApproveSession({
    super.key,
    required this.dappName,
    required this.dappUrl,
    required this.chains,
    required this.permissions,
    this.iconUrl,
    this.loading = false,
    this.onReject,
    this.onApprove,
  });

  final String dappName;
  final String dappUrl;
  final String? iconUrl;
  final List<String> chains;
  final List<String> permissions;
  final bool loading;
  final VoidCallback? onReject;
  final VoidCallback? onApprove;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const ZuniaSectionLabel('Connect request'),
        const SizedBox(height: 8),
        Row(
          children: [
            ClipOval(
              child: SizedBox(
                width: 44,
                height: 44,
                child: iconUrl != null && iconUrl!.isNotEmpty
                    ? Image.network(iconUrl!, fit: BoxFit.cover)
                    : ColoredBox(
                        color: s.stateHover,
                        child: Center(
                          child: Text(
                            dappName.isNotEmpty
                                ? dappName.substring(0, 1).toUpperCase()
                                : '?',
                            style: zuniaSans(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: s.fg,
                            ),
                          ),
                        ),
                      ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dappName,
                    overflow: TextOverflow.ellipsis,
                    style: zuniaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: s.fg,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    dappUrl,
                    overflow: TextOverflow.ellipsis,
                    style: zuniaMono(fontSize: 11, color: s.fgMuted),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const ZuniaSectionLabel('Networks'),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: chains
              .map((c) => ZuniaPill(c, tone: ZuniaPillTone.neutral))
              .toList(),
        ),
        const SizedBox(height: 16),
        const ZuniaSectionLabel('Permissions'),
        const SizedBox(height: 8),
        ...permissions.map(
          (p) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Text(
              '• $p',
              style: zuniaMono(fontSize: 11, color: s.fgMuted),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ZuniaButton(
                label: 'Reject',
                variant: ZuniaButtonVariant.secondary,
                onPressed: loading ? null : onReject,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              flex: 2,
              child: ZuniaButton(
                label: loading ? 'Connecting…' : 'Connect',
                onPressed: loading ? null : onApprove,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class ZuniaTransferSent extends StatelessWidget {
  const ZuniaTransferSent({
    super.key,
    this.title = 'Transfer sent',
    this.hash,
    required this.steps,
    required this.step,
    required this.total,
    this.explorerUrl,
    this.onDone,
    this.onOpenExplorer,
  });

  final String title;
  final String? hash;
  final List<({String label, String state})> steps;
  final int step;
  final int total;
  final String? explorerUrl;
  final VoidCallback? onDone;
  final VoidCallback? onOpenExplorer;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ZuniaProgressTracker(
          title: title,
          step: step,
          total: total,
          steps: steps,
        ),
        if (hash != null && hash!.isNotEmpty) ...[
          const SizedBox(height: 12),
          ZuniaKeyValueRow(label: 'Hash', value: hash!),
        ],
        const SizedBox(height: 16),
        Row(
          children: [
            if (explorerUrl != null || onOpenExplorer != null)
              Expanded(
                child: ZuniaButton(
                  label: 'Explorer',
                  variant: ZuniaButtonVariant.secondary,
                  onPressed: onOpenExplorer,
                ),
              ),
            if (explorerUrl != null || onOpenExplorer != null)
              const SizedBox(width: 8),
            Expanded(
              child: ZuniaButton(label: 'Done', onPressed: onDone),
            ),
          ],
        ),
      ],
    );
  }
}

class ZuniaAccountSwitcher extends StatelessWidget {
  const ZuniaAccountSwitcher({
    super.key,
    required this.accounts,
    this.activeAddress,
    required this.onSelect,
    this.onAdd,
  });

  final List<({String address, String name, String? chainLabel})> accounts;
  final String? activeAddress;
  final ValueChanged<String> onSelect;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const ZuniaSectionLabel('Accounts'),
        const SizedBox(height: 8),
        if (accounts.isEmpty)
          const ZuniaEmptyState(
            title: 'No accounts',
            description: 'Create or import a wallet.',
          )
        else
          for (final a in accounts) ...[
            Material(
              color: a.address == activeAddress ? s.stateSelected : Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: a.address == activeAddress ? s.fg : s.line,
                ),
              ),
              child: InkWell(
                onTap: () => onSelect(a.address),
                borderRadius: BorderRadius.circular(14),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              a.name,
                              style: zuniaSans(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: s.fg,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              truncateAddress(a.address),
                              style: zuniaMono(fontSize: 10, color: s.fgMuted),
                            ),
                          ],
                        ),
                      ),
                      if (a.chainLabel != null)
                        ZuniaPill(a.chainLabel!, tone: ZuniaPillTone.neutral),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        if (onAdd != null)
          ZuniaButton(
            label: 'Add account',
            variant: ZuniaButtonVariant.secondary,
            onPressed: onAdd,
          ),
      ],
    );
  }
}

class ZuniaNetworkPickerSheet extends StatefulWidget {
  const ZuniaNetworkPickerSheet({
    super.key,
    required this.networks,
    this.activeChainId,
    required this.onSelect,
    this.initialSearch = '',
  });

  final List<({String chainId, String name, String? symbol})> networks;
  final String? activeChainId;
  final ValueChanged<String> onSelect;
  final String initialSearch;

  @override
  State<ZuniaNetworkPickerSheet> createState() =>
      _ZuniaNetworkPickerSheetState();
}

class _ZuniaNetworkPickerSheetState extends State<ZuniaNetworkPickerSheet> {
  late String _search = widget.initialSearch;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final q = _search.toLowerCase();
    final filtered = q.isEmpty
        ? widget.networks
        : widget.networks
            .where(
              (n) =>
                  n.name.toLowerCase().contains(q) ||
                  n.chainId.toLowerCase().contains(q) ||
                  (n.symbol ?? '').toLowerCase().contains(q),
            )
            .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const ZuniaSectionLabel('Networks'),
        const SizedBox(height: 8),
        TextField(
          onChanged: (v) => setState(() => _search = v),
          decoration: InputDecoration(
            hintText: 'Search networks',
            hintStyle: zuniaSans(fontSize: 13, color: s.fgDim),
            filled: true,
            fillColor: s.glass,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: s.line),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: s.line),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
          style: zuniaSans(fontSize: 13, color: s.fg),
        ),
        const SizedBox(height: 10),
        ConstrainedBox(
          constraints: const BoxConstraints(maxHeight: 320),
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: filtered.length,
            separatorBuilder: (_, __) => const SizedBox(height: 6),
            itemBuilder: (context, i) {
              final n = filtered[i];
              final selected = n.chainId == widget.activeChainId;
              return Material(
                color: selected ? s.stateSelected : Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: selected ? s.fg : s.line),
                ),
                child: InkWell(
                  onTap: () => widget.onSelect(n.chainId),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                n.name,
                                style: zuniaSans(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: s.fg,
                                ),
                              ),
                              Text(
                                n.chainId,
                                style: zuniaMono(fontSize: 10, color: s.fgMuted),
                              ),
                            ],
                          ),
                        ),
                        if (n.symbol != null)
                          Text(
                            n.symbol!,
                            style: zuniaMono(fontSize: 11, color: s.fgMuted),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class ZuniaTxDetail extends StatelessWidget {
  const ZuniaTxDetail({
    super.key,
    required this.hash,
    required this.status,
    this.chainLabel,
    required this.messages,
    this.fees,
    this.onOpenExplorer,
  });

  final String hash;
  final String status; // pending | success | failed
  final String? chainLabel;
  final List<({String type, String summary})> messages;
  final List<({String label, String value})>? fees;
  final VoidCallback? onOpenExplorer;

  @override
  Widget build(BuildContext context) {
    final tone = status == 'success'
        ? ZuniaCalloutTone.info
        : status == 'failed'
            ? ZuniaCalloutTone.danger
            : ZuniaCalloutTone.warning;
    final label = status == 'pending'
        ? 'Pending confirmation'
        : status == 'success'
            ? 'Confirmed'
            : 'Failed';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            const Expanded(child: ZuniaSectionLabel('Transaction')),
            if (chainLabel != null)
              ZuniaPill(chainLabel!, tone: ZuniaPillTone.neutral),
          ],
        ),
        const SizedBox(height: 12),
        ZuniaCallout(tone: tone, body: label),
        const SizedBox(height: 12),
        ZuniaKeyValueRow(label: 'Hash', value: truncateAddress(hash, left: 10, right: 8)),
        const SizedBox(height: 12),
        ZuniaMessageDecodeList(messages: messages),
        if (fees != null) ...[
          const SizedBox(height: 12),
          for (final f in fees!)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: ZuniaKeyValueRow(label: f.label, value: f.value),
            ),
        ],
        if (onOpenExplorer != null) ...[
          const SizedBox(height: 12),
          ZuniaButton(
            label: 'View on explorer',
            variant: ZuniaButtonVariant.secondary,
            onPressed: onOpenExplorer,
          ),
        ],
      ],
    );
  }
}

class ZuniaAssetDetail extends StatelessWidget {
  const ZuniaAssetDetail({
    super.key,
    required this.name,
    required this.symbol,
    required this.amount,
    this.fiat,
    this.chainLabel,
    this.actions,
  });

  final String name;
  final String symbol;
  final String amount;
  final String? fiat;
  final String? chainLabel;
  final Widget? actions;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: zuniaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                      color: s.fg,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    symbol,
                    style: zuniaMono(fontSize: 11, color: s.fgMuted),
                  ),
                ],
              ),
            ),
            if (chainLabel != null)
              ZuniaPill(chainLabel!, tone: ZuniaPillTone.neutral),
          ],
        ),
        const SizedBox(height: 16),
        ZuniaAmount(value: amount, denom: symbol, hero: true),
        if (fiat != null) ...[
          const SizedBox(height: 6),
          Text(fiat!, style: zuniaMono(fontSize: 12, color: s.fgMuted)),
        ],
        if (actions != null) ...[
          const SizedBox(height: 16),
          actions!,
        ],
      ],
    );
  }
}

class ZuniaValidatorDetail extends StatelessWidget {
  const ZuniaValidatorDetail({
    super.key,
    required this.name,
    this.moniker,
    required this.commission,
    required this.votingPower,
    this.apr,
    this.status,
    this.actions,
  });

  final String name;
  final String? moniker;
  final String commission;
  final String votingPower;
  final String? apr;
  final String? status;
  final Widget? actions;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          name,
          style: zuniaSans(
            fontSize: 18,
            fontWeight: FontWeight.w500,
            color: s.fg,
          ),
        ),
        if (moniker != null) ...[
          const SizedBox(height: 4),
          Text(moniker!, style: zuniaMono(fontSize: 11, color: s.fgMuted)),
        ],
        if (status != null) ...[
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: s.glass,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                status!.toUpperCase(),
                style: zuniaMono(fontSize: 10, color: s.fgMuted),
              ),
            ),
          ),
        ],
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ZuniaKeyValueRow(label: 'Commission', value: commission),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ZuniaKeyValueRow(label: 'Voting power', value: votingPower),
            ),
          ],
        ),
        if (apr != null) ...[
          const SizedBox(height: 8),
          ZuniaKeyValueRow(label: 'APR', value: apr!),
        ],
        if (actions != null) ...[
          const SizedBox(height: 16),
          actions!,
        ],
      ],
    );
  }
}
