import 'package:flutter/material.dart';
import '../primitives/switch.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';

/// Progress rail plus "Step 2 of 4 · Verify" caption.
class ZuniaStepProgress extends StatelessWidget {
  const ZuniaStepProgress({
    super.key,
    required this.current,
    required this.total,
    this.label,
  });

  /// 1-based.
  final int current;
  final int total;
  final String? label;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            for (var i = 0; i < total; i++) ...[
              if (i > 0) const SizedBox(width: 6),
              Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  height: 3,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(2),
                    color: i < current ? s.accent : s.stateHover,
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 10),
        Text(
          label == null
              ? 'STEP $current OF $total'
              : 'STEP $current OF $total · ${label!.toUpperCase()}',
          style: zuniaMono(fontSize: 10, letterSpacing: 1.3, color: s.fgDim),
        ),
      ],
    );
  }
}

/// Step title with optional supporting line.
class ZuniaStepHeading extends StatelessWidget {
  const ZuniaStepHeading({super.key, required this.title, this.subtitle});

  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          title,
          style: zuniaSans(
            fontSize: 24,
            height: 1.15,
            fontWeight: FontWeight.w500,
            letterSpacing: -0.8,
            color: s.fg,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 8),
          Text(
            subtitle!,
            style: zuniaSans(fontSize: 14, height: 1.5, color: s.fgMuted),
          ),
        ],
      ],
    );
  }
}

/// Selectable chain card: logo, name, denom pill, chain id.
enum ZuniaNetworkControl { check, toggle }

class ZuniaNetworkOptionCard extends StatelessWidget {
  const ZuniaNetworkOptionCard({
    super.key,
    required this.name,
    required this.chainId,
    required this.selected,
    required this.onToggle,
    this.symbol,
    this.iconUrl,
    this.testnet = false,
    this.control = ZuniaNetworkControl.check,
  });

  final String name;
  final String chainId;
  final bool selected;
  final VoidCallback onToggle;
  final String? symbol;
  final String? iconUrl;
  final bool testnet;

  /// Onboarding picks several chains at once, so it reads as a checklist.
  /// Post-setup management is one switch per chain.
  final ZuniaNetworkControl control;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Material(
      color: selected ? s.stateSelected : Colors.transparent,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: selected ? s.accent : s.line),
      ),
      child: InkWell(
        onTap: onToggle,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              _Logo(name: name, iconUrl: iconUrl, selected: selected),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            name,
                            overflow: TextOverflow.ellipsis,
                            style: zuniaSans(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: s.fg,
                            ),
                          ),
                        ),
                        if (symbol != null) ...[
                          const SizedBox(width: 6),
                          _Tag(label: symbol!, color: s.fgMuted, border: s.line),
                        ],
                        if (testnet) ...[
                          const SizedBox(width: 6),
                          _Tag(
                            label: 'test',
                            color: s.warning,
                            border: s.warning.withValues(alpha: 0.4),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      chainId,
                      overflow: TextOverflow.ellipsis,
                      style: zuniaMono(fontSize: 11, color: s.fgDim),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              if (control == ZuniaNetworkControl.check)
                _Check(selected: selected)
              else
                ZuniaSwitch(value: selected, onChanged: (_) => onToggle()),
            ],
          ),
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  const _Logo({required this.name, required this.selected, this.iconUrl});

  final String name;
  final bool selected;
  final String? iconUrl;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final fallback = Text(
      name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.toUpperCase(),
      style: zuniaMono(fontSize: 11, color: s.fgMuted),
    );
    return Container(
      width: 38,
      height: 38,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: s.stateHover,
        border: Border.all(color: selected ? s.accent : s.line),
      ),
      clipBehavior: Clip.antiAlias,
      child: iconUrl == null
          ? fallback
          : Image.network(
              iconUrl!,
              fit: BoxFit.cover,
              width: 38,
              height: 38,
              errorBuilder: (_, __, ___) => fallback,
            ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({required this.label, required this.color, required this.border});

  final String label;
  final Color color;
  final Color border;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: border),
      ),
      child: Text(
        label.toUpperCase(),
        style: zuniaMono(fontSize: 9, letterSpacing: 0.6, color: color),
      ),
    );
  }
}

class _Check extends StatelessWidget {
  const _Check({required this.selected});

  final bool selected;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      width: 22,
      height: 22,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: selected ? s.accent : Colors.transparent,
        border: Border.all(color: selected ? s.accent : s.lineStrong),
      ),
      child: selected
          ? Icon(Icons.check, size: 18, color: s.accentFg)
          : const SizedBox.shrink(),
    );
  }
}

/// Search field with a leading glyph, styled for wallet lists.
class ZuniaSearchField extends StatelessWidget {
  const ZuniaSearchField({
    super.key,
    required this.controller,
    required this.onChanged,
    this.hintText,
  });

  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final String? hintText;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return TextField(
      controller: controller,
      onChanged: onChanged,
      autocorrect: false,
      enableSuggestions: false,
      style: zuniaMono(fontSize: 13, color: s.fg),
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: zuniaMono(fontSize: 13, color: s.fgDim),
        prefixIcon: Icon(Icons.search, size: 18, color: s.fgDim),
        filled: true,
        fillColor: s.stateHover,
        contentPadding: const EdgeInsets.symmetric(vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: s.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: s.accent),
        ),
      ),
    );
  }
}
