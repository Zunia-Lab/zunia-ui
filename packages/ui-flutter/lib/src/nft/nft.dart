import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:zunia_tokens/zunia_tokens.dart';

import '../primitives/button.dart';
import '../primitives/feedback.dart';
import '../primitives/switch.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import '../wallet/display.dart';
import '../wallet/wallet_avatar.dart';

/// Media policy and placeholder art for NFT surfaces.
///
/// The policy exists because `token_uri` and `image` point at arbitrary hosts
/// chosen by whoever minted the token. Rendering them is a network request from
/// the user's device to a stranger's server, which hands that server the user's
/// IP address and — because the request only happens for tokens they own — the
/// shape of their holdings. So media is off unless the caller turns it on, and
/// that switch is a visible parameter rather than a hidden default.

/// Shown wherever the media switch is offered. Same words in every client.
const String kZuniaNftMediaPrivacyNote =
    'Artwork is fetched from whatever host the token points at, which tells '
    'that host your IP address and which tokens you hold. Nothing is loaded '
    'until you turn this on.';

/// Short form for a toggle label or a card overlay.
const String kZuniaNftMediaLoadLabel = 'Load artwork';

/// What a card is currently showing in its media frame.
enum ZuniaNftMediaState {
  /// Media is off; the placeholder is the final state, not a loading step.
  off,

  /// No URI on the token at all. Nothing to load even if media were on.
  absent,
  loading,
  loaded,

  /// The host refused, timed out, or served something undecodable.
  error,
}

/// Deterministic stand-in art, so a card without media still has an identity.
@immutable
class ZuniaNftPlaceholder {
  const ZuniaNftPlaceholder({
    required this.from,
    required this.to,
    required this.accent,
    required this.monogram,
  });

  final Color from;
  final Color to;
  final Color accent;

  /// One or two characters derived from the token id.
  final String monogram;
}

/// Derive placeholder art from the token's identity.
///
/// Same seed produces the same art in React and Flutter — both use the FNV-1a
/// `hashSeed` and the same palette table — so a token looks the same in the
/// extension and on mobile.
ZuniaNftPlaceholder zuniaNftPlaceholder(String seed) {
  final key = seed.trim().toLowerCase();
  final h = hashSeed(key.isEmpty ? 'nft' : key);
  final palette = kAvatarPalettes[h % kAvatarPalettes.length];
  return ZuniaNftPlaceholder(
    from: palette.mid,
    to: palette.dark,
    accent: palette.accent,
    monogram: zuniaNftMonogram(seed),
  );
}

/// Up to two characters for the placeholder.
///
/// Prefers trailing digits, because a CW721 token id is usually a number and its
/// last digits are what distinguishes one card from its neighbour.
String zuniaNftMonogram(String tokenId) {
  final trimmed = tokenId.trim();
  if (trimmed.isEmpty) return '?';
  final digits = RegExp(r'\d+$').firstMatch(trimmed)?.group(0);
  if (digits != null) {
    return digits.length <= 2 ? digits : digits.substring(digits.length - 2);
  }
  return (trimmed.length <= 2 ? trimmed : trimmed.substring(0, 2))
      .toUpperCase();
}

/// Display title with a sane fallback.
String zuniaNftTitle(String tokenId, String? name) {
  final trimmed = name?.trim();
  if (trimmed != null && trimmed.isNotEmpty) return trimmed;
  return '#$tokenId';
}

/// Art frame with a deterministic fallback (React `NftMedia`).
///
/// The placeholder is always painted underneath, so a slow, blocked, missing or
/// malformed image degrades to a coloured tile with the token's monogram and
/// never to a broken-image glyph. The `Image` is only built when [loadMedia] is
/// true, which is what makes the privacy switch real rather than cosmetic — a
/// hidden image widget still issues the request.
class ZuniaNftMedia extends StatelessWidget {
  const ZuniaNftMedia({
    super.key,
    required this.tokenId,
    this.imageUrl,
    this.loadMedia = false,
    this.onRequestMedia,
    this.semanticLabel,
    this.radius = ZuniaRadii.md,
  });

  /// Seeds the placeholder art; also used for the monogram.
  final String tokenId;

  /// Resolved http(s) URL. Resolving `ipfs://` to a gateway is the host's job.
  final String? imageUrl;

  /// Fetch the artwork. Defaults to **false**; see
  /// [kZuniaNftMediaPrivacyNote].
  final bool loadMedia;

  /// Rendered as a button over the placeholder when media is off.
  final VoidCallback? onRequestMedia;

  final String? semanticLabel;
  final double radius;

  /// Scrim behind any caption drawn over the artwork.
  ///
  /// Fixed dark, in both themes, because what sits underneath is a stranger's
  /// image and not a Zunia surface. Following the theme here put ink-on-dark-art
  /// at 1.15:1 in the light theme. [_mediaChromeFg] over this measures 12.31:1
  /// against the worst placeholder palette colour showing through, and higher
  /// against anything darker.
  static Color get _mediaScrim =>
      ZuniaSemantic.dark.bg.withValues(alpha: 0.85);

  /// Caption colour over [_mediaScrim]. No status hue: one that reads over the
  /// scrim in one theme fails in the other, and the wording carries the meaning.
  static Color get _mediaChromeFg => ZuniaSemantic.dark.fg;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final placeholder = zuniaNftPlaceholder(tokenId);

    final layers = <Widget>[
      Positioned.fill(
        child: DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [placeholder.from, placeholder.to],
            ),
          ),
        ),
      ),
      // Decorative: the card's title and collection carry the identity, and the
      // frame already has an accessible name from the Semantics wrapper below.
      Positioned.fill(
        child: ExcludeSemantics(
          child: Center(
            child: LayoutBuilder(
              builder: (context, c) => Text(
                placeholder.monogram,
                style: zuniaMono(
                  fontSize: math.max(16, c.maxWidth * 0.28),
                  fontWeight: FontWeight.w700,
                  color: placeholder.accent,
                ),
              ),
            ),
          ),
        ),
      ),
    ];

    if (loadMedia && imageUrl != null && imageUrl!.isNotEmpty) {
      layers.add(
        Positioned.fill(
          child: Image.network(
            imageUrl!,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, progress) {
              if (progress == null) return child;
              return _caption('Loading…');
            },
            errorBuilder: (context, error, stack) =>
                _caption('Artwork unavailable'),
          ),
        ),
      );
    } else if (loadMedia) {
      layers.add(_caption('No artwork on this token'));
    } else if (onRequestMedia != null) {
      // A full-width bar rather than an inset pill: a card can be 116dp wide in
      // a two-column grid on a 320dp phone, where an inset button with a real
      // label overflows. The bar also gives the control the same shape as the
      // loading and error captions, so the frame has one language.
      layers.add(
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: Tooltip(
            message: kZuniaNftMediaPrivacyNote,
            child: Semantics(
              button: true,
              label: '$kZuniaNftMediaLoadLabel. $kZuniaNftMediaPrivacyNote',
              child: Material(
                color: _mediaScrim,
                child: InkWell(
                  onTap: onRequestMedia,
                  hoverColor: s.stateHover,
                  splashColor: s.statePress,
                  child: SizedBox(
                    height: ZuniaControls.heightMd,
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: Text(
                          kZuniaNftMediaLoadLabel.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: zuniaMono(
                            fontSize: ZuniaType.monoMicro,
                            letterSpacing: 1.2,
                            color: _mediaChromeFg,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return Semantics(
      label: semanticLabel ?? zuniaNftTitle(tokenId, null),
      image: true,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius),
        child: AspectRatio(
          aspectRatio: 1,
          child: Stack(fit: StackFit.expand, children: layers),
        ),
      ),
    );
  }

  Widget _caption(String text) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        width: double.infinity,
        color: _mediaScrim,
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        child: Text(
          text,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: zuniaMono(
            fontSize: ZuniaType.monoMicro,
            color: _mediaChromeFg,
          ),
        ),
      ),
    );
  }
}

/// One token, shaped like `NftToken` in `@zunialab/interchain` plus the display
/// extras a client resolves (collection name, gateway-resolved image URL).
@immutable
class ZuniaNftCardItem {
  const ZuniaNftCardItem({
    required this.tokenId,
    this.name,
    this.collectionAddress,
    this.collectionName,
    this.chainId,
    this.imageUrl,
  });

  final String tokenId;
  final String? name;
  final String? collectionAddress;
  final String? collectionName;
  final String? chainId;

  /// Already resolved to something the platform can fetch.
  final String? imageUrl;

  String get collectionLabel {
    final n = collectionName?.trim();
    if (n != null && n.isNotEmpty) return n;
    if (collectionAddress != null) {
      return truncateAddress(collectionAddress!, left: 6, right: 4);
    }
    return 'Unknown collection';
  }
}

/// One NFT tile (React `NftCard`).
class ZuniaNftCard extends StatelessWidget {
  const ZuniaNftCard({
    super.key,
    required this.item,
    this.loadMedia = false,
    this.onRequestMedia,
    this.onTap,
    this.selected = false,
    this.badge,
  });

  final ZuniaNftCardItem item;

  /// See [ZuniaNftMedia.loadMedia]. Off by default.
  final bool loadMedia;

  final VoidCallback? onRequestMedia;
  final VoidCallback? onTap;
  final bool selected;

  /// Corner slot, e.g. a "listed" or "in transit" pill.
  final Widget? badge;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final title = zuniaNftTitle(item.tokenId, item.name);

    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          children: [
            ZuniaNftMedia(
              tokenId: item.tokenId,
              imageUrl: item.imageUrl,
              loadMedia: loadMedia,
              onRequestMedia: onRequestMedia,
              semanticLabel: '$title from ${item.collectionLabel}',
            ),
            if (badge != null) Positioned(left: 6, top: 6, child: badge!),
          ],
        ),
        const SizedBox(height: ZuniaSpace.s2),
        Text(
          title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: zuniaSans(
            fontSize: ZuniaType.label,
            fontWeight: FontWeight.w500,
            color: s.fg,
          ),
        ),
        const SizedBox(height: 2),
        Row(
          children: [
            Expanded(
              child: Text(
                item.collectionLabel,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: zuniaMono(
                  fontSize: ZuniaType.monoMicro,
                  color: s.fgMuted,
                ),
              ),
            ),
            const SizedBox(width: ZuniaSpace.s1),
            Text(
              '#${item.tokenId.length > 8 ? '${item.tokenId.substring(0, 8)}…' : item.tokenId}',
              style: zuniaMono(
                fontSize: ZuniaType.monoMicro,
                color: s.fgDim,
              ),
            ),
          ],
        ),
        if (item.chainId != null)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Text(
              item.chainId!,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: zuniaMono(
                fontSize: ZuniaType.monoMicro,
                color: s.fgDim,
              ),
            ),
          ),
      ],
    );

    final decorated = Container(
      padding: const EdgeInsets.all(ZuniaSpace.s2),
      decoration: BoxDecoration(
        color: selected ? s.stateSelected : s.glass,
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        border: Border.all(color: selected ? s.accent : s.line),
      ),
      child: body,
    );

    if (onTap == null) return decorated;

    return Semantics(
      button: true,
      selected: selected,
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(ZuniaRadii.lg),
          hoverColor: s.stateHover,
          splashColor: s.statePress,
          child: decorated,
        ),
      ),
    );
  }
}

/// Responsive gallery of [ZuniaNftCard]s (React `NftGrid`).
///
/// Does not scroll: it shrink-wraps so a screen can put it inside its own
/// scroll view alongside other sections.
///
/// [unsupportedReason] is deliberately separate from [error] and from the empty
/// state. "This chain has no CosmWasm, so there can be no NFTs here" is a
/// different sentence from "you hold none" and from "we could not read". Only
/// 118 of the 332 registry chains declare `cosmwasm`, so this branch is the
/// common one, not an edge case.
class ZuniaNftGrid extends StatelessWidget {
  const ZuniaNftGrid({
    super.key,
    required this.items,
    this.loadMedia = false,
    this.onRequestMedia,
    this.onToggleMedia,
    this.onSelect,
    this.selectedTokenId,
    this.loading = false,
    this.error,
    this.onRetry,
    this.unsupportedReason,
    this.emptyTitle = 'No NFTs here',
    this.emptyDescription = 'Nothing owned by this address on this chain.',
    this.minItemWidth = 132,
    this.title,
  });

  final List<ZuniaNftCardItem> items;

  /// Off by default; applies to every card.
  final bool loadMedia;

  final void Function(ZuniaNftCardItem item)? onRequestMedia;

  /// Turn media on for the whole grid. Rendered as a labelled control.
  final ValueChanged<bool>? onToggleMedia;

  final void Function(ZuniaNftCardItem item)? onSelect;
  final String? selectedTokenId;
  final bool loading;
  final String? error;
  final VoidCallback? onRetry;

  /// The chain cannot hold CW721 tokens (no `cosmwasm` in its registry
  /// features). Pass the reason and the grid explains instead of showing an
  /// empty state that reads as "you own nothing".
  final String? unsupportedReason;

  final String emptyTitle;
  final String emptyDescription;

  /// Narrowest a card may get. 132 keeps two columns at 320dp.
  final double minItemWidth;

  final String? title;

  @override
  Widget build(BuildContext context) {
    final header = <Widget>[];
    if (title != null) {
      header
        ..add(ZuniaSectionLabel(title!))
        ..add(const SizedBox(height: ZuniaSpace.s2));
    }
    if (onToggleMedia != null) {
      header
        ..add(ZuniaCheckbox(
          value: loadMedia,
          onChanged: onToggleMedia,
          label: 'Show artwork',
          description: loadMedia ? null : kZuniaNftMediaPrivacyNote,
        ))
        ..add(const SizedBox(height: ZuniaSpace.s2));
    }

    if (unsupportedReason != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          ...header,
          ZuniaCallout(
            tone: ZuniaCalloutTone.info,
            title: 'NFTs are not available on this chain',
            body: unsupportedReason!,
          ),
        ],
      );
    }

    if (error != null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          ...header,
          ZuniaCallout(
            tone: ZuniaCalloutTone.danger,
            title: 'Could not read this collection',
            body: error!,
          ),
          if (onRetry != null) ...[
            const SizedBox(height: ZuniaSpace.s3),
            Align(
              alignment: Alignment.centerLeft,
              child: ZuniaButton(
                label: 'Try again',
                variant: ZuniaButtonVariant.secondary,
                size: ZuniaButtonSize.sm,
                onPressed: onRetry,
              ),
            ),
          ],
        ],
      );
    }

    if (loading && items.isEmpty) {
      return Semantics(
        label: 'Loading NFTs',
        liveRegion: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            ...header,
            _grid(
              context,
              count: 4,
              builder: (context, i) => const _SkeletonCard(),
            ),
          ],
        ),
      );
    }

    if (items.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          ...header,
          ZuniaEmptyState(title: emptyTitle, description: emptyDescription),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        ...header,
        _grid(
          context,
          count: items.length,
          builder: (context, i) {
            final item = items[i];
            return ZuniaNftCard(
              item: item,
              loadMedia: loadMedia,
              selected: selectedTokenId == item.tokenId,
              onRequestMedia: onRequestMedia == null
                  ? null
                  : () => onRequestMedia!(item),
              onTap: onSelect == null ? null : () => onSelect!(item),
            );
          },
        ),
        if (loading)
          Padding(
            padding: const EdgeInsets.only(top: ZuniaSpace.s2),
            child: Text(
              'LOADING MORE…',
              style: zuniaMono(
                fontSize: ZuniaType.monoMicro,
                letterSpacing: 1.2,
                color: ZuniaSemanticsExt.of(context).fgDim,
              ),
            ),
          ),
      ],
    );
  }

  Widget _grid(
    BuildContext context, {
    required int count,
    required Widget Function(BuildContext, int) builder,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth.isFinite
            ? constraints.maxWidth
            : minItemWidth * 2;
        // At least two columns even on a 320dp phone: a single-column gallery
        // reads as a list and loses the "collection" shape entirely.
        final columns = math.max(2, (width / minItemWidth).floor());
        final tile = (width - (columns - 1) * ZuniaSpace.s2) / columns;
        // Square media plus roughly three text lines under it.
        final aspect = tile / (tile + 62);
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: count,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: columns,
            mainAxisSpacing: ZuniaSpace.s2,
            crossAxisSpacing: ZuniaSpace.s2,
            childAspectRatio: aspect,
          ),
          itemBuilder: builder,
        );
      },
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  const _SkeletonCard();

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    return Container(
      padding: const EdgeInsets.all(ZuniaSpace.s2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ZuniaRadii.lg),
        border: Border.all(color: s.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: s.stateHover,
                borderRadius: BorderRadius.circular(ZuniaRadii.md),
              ),
            ),
          ),
          const SizedBox(height: ZuniaSpace.s2),
          const ZuniaSkeleton(height: 10),
          const SizedBox(height: ZuniaSpace.s1),
          const ZuniaSkeleton(width: 60, height: 8),
        ],
      ),
    );
  }
}

/// Mirrors `NftAttribute` in `@zunialab/interchain`.
@immutable
class ZuniaNftTrait {
  const ZuniaNftTrait({
    required this.traitType,
    required this.value,
    this.displayType,
  });

  final String traitType;
  final String value;
  final String? displayType;
}

/// Full-page view of one token (React `NftDetail`).
class ZuniaNftDetail extends StatelessWidget {
  const ZuniaNftDetail({
    super.key,
    required this.item,
    this.description,
    this.owner,
    this.traits = const [],
    this.loadMedia = false,
    this.onRequestMedia,
    this.tokenUri,
    this.loading = false,
    this.error,
    this.actions,
  });

  final ZuniaNftCardItem item;
  final String? description;
  final String? owner;
  final List<ZuniaNftTrait> traits;

  /// See [ZuniaNftMedia.loadMedia]. Off by default.
  final bool loadMedia;
  final VoidCallback? onRequestMedia;

  /// Raw `token_uri`, shown so the user can see where art would come from.
  final String? tokenUri;

  final bool loading;
  final String? error;

  /// Buttons: transfer, send cross-chain. Disable them with their own reasons.
  final Widget? actions;

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final title = zuniaNftTitle(item.tokenId, item.name);

    if (error != null) {
      return ZuniaCallout(
        tone: ZuniaCalloutTone.danger,
        title: 'Could not load this token',
        body: error!,
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        ZuniaNftMedia(
          tokenId: item.tokenId,
          imageUrl: item.imageUrl,
          loadMedia: loadMedia,
          onRequestMedia: onRequestMedia,
          semanticLabel: title,
          radius: ZuniaRadii.lg,
        ),
        const SizedBox(height: ZuniaSpace.s4),
        Text(
          item.collectionLabel.toUpperCase(),
          style: zuniaMono(
            fontSize: ZuniaType.monoMicro,
            letterSpacing: 1.2,
            color: s.fgMuted,
          ),
        ),
        const SizedBox(height: ZuniaSpace.s1),
        Text(
          title,
          style: zuniaSans(
            fontSize: ZuniaType.title,
            fontWeight: FontWeight.w500,
            letterSpacing: -0.5,
            color: s.fg,
          ),
        ),
        const SizedBox(height: ZuniaSpace.s1),
        Text(
          'Token ${item.tokenId}${item.chainId == null ? '' : ' · ${item.chainId}'}',
          style: zuniaMono(fontSize: ZuniaType.caption, color: s.fgDim),
        ),
        if (loading) ...[
          const SizedBox(height: ZuniaSpace.s3),
          Semantics(
            label: 'Loading token details',
            liveRegion: true,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ZuniaSkeleton(height: 10),
                SizedBox(height: ZuniaSpace.s2),
                ZuniaSkeleton(height: 10),
              ],
            ),
          ),
        ],
        if (description != null) ...[
          const SizedBox(height: ZuniaSpace.s4),
          Text(
            description!,
            style: zuniaSans(
              fontSize: ZuniaType.body,
              height: 1.55,
              color: s.fgMuted,
            ),
          ),
        ],
        if (owner != null) ...[
          const SizedBox(height: ZuniaSpace.s4),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: ZuniaSpace.s3,
              vertical: ZuniaSpace.s2,
            ),
            decoration: BoxDecoration(
              color: s.glass,
              borderRadius: BorderRadius.circular(ZuniaRadii.md),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'OWNER',
                    style: zuniaMono(
                      fontSize: ZuniaType.monoMicro,
                      letterSpacing: 1.2,
                      color: s.fgMuted,
                    ),
                  ),
                ),
                Text(
                  truncateAddress(owner!),
                  style: zuniaMono(fontSize: ZuniaType.caption, color: s.fg),
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: ZuniaSpace.s4),
        const ZuniaSectionLabel('Traits'),
        const SizedBox(height: ZuniaSpace.s2),
        if (traits.isEmpty)
          Text(
            loading
                ? 'Reading metadata…'
                : 'This token\'s metadata extension carries no traits. That is '
                    'normal — the CW721 extension is optional.',
            style: zuniaSans(
              fontSize: ZuniaType.caption,
              height: 1.5,
              color: s.fgMuted,
            ),
          )
        else
          Wrap(
            spacing: ZuniaSpace.s2,
            runSpacing: ZuniaSpace.s2,
            children: [
              for (final t in traits)
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 200),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: ZuniaSpace.s2,
                    ),
                    decoration: BoxDecoration(
                      color: s.glass,
                      borderRadius: BorderRadius.circular(ZuniaRadii.md),
                      border: Border.all(color: s.line),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          t.traitType.toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: zuniaMono(
                            fontSize: ZuniaType.monoMicro,
                            letterSpacing: 1.2,
                            color: s.fgMuted,
                          ),
                        ),
                        const SizedBox(height: ZuniaSpace.s1),
                        Text(
                          t.value,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: zuniaSans(
                            fontSize: ZuniaType.label,
                            fontWeight: FontWeight.w500,
                            color: s.fg,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        if (tokenUri != null) ...[
          const SizedBox(height: ZuniaSpace.s4),
          const ZuniaSectionLabel('Metadata source'),
          const SizedBox(height: ZuniaSpace.s2),
          SelectableText(
            tokenUri!,
            style: zuniaMono(
              fontSize: ZuniaType.monoMicro,
              height: 1.5,
              color: s.fgDim,
            ),
          ),
          if (!loadMedia) ...[
            const SizedBox(height: ZuniaSpace.s2),
            Text(
              kZuniaNftMediaPrivacyNote,
              style: zuniaSans(
                fontSize: ZuniaType.caption,
                height: 1.5,
                color: s.fgMuted,
              ),
            ),
          ],
        ],
        if (actions != null) ...[
          const SizedBox(height: ZuniaSpace.s4),
          actions!,
        ],
      ],
    );
  }
}
