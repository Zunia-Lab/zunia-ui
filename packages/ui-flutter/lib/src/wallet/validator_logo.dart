/// Validator moniker images, matching `@zunialab/ui` `validatorLogo.ts`.
///
/// Source is Cosmostation's chainlist on GitHub raw. The resolved URL is
/// stored against the validator's Keybase `identity`. A new identity drops
/// the cache and we resolve again.
library;

const validatorLogoCachePrefix = 'zunia.validator.logo.v1:';

class ValidatorLogoInput {
  const ValidatorLogoInput({
    required this.chainId,
    required this.operatorAddress,
    this.chainName,
    this.identity = '',
    this.logoSlugs,
  });

  final String chainId;
  final String? chainName;
  final String operatorAddress;
  final String identity;
  final List<String>? logoSlugs;
}

class ValidatorLogoRecord {
  const ValidatorLogoRecord({
    required this.identity,
    required this.url,
    required this.updatedAt,
  });

  final String identity;
  final String url;
  final int updatedAt;

  Map<String, Object> toJson() => {
        'identity': identity,
        'url': url,
        'updatedAt': updatedAt,
      };

  static ValidatorLogoRecord? tryParse(Object? raw) {
    if (raw is! Map) return null;
    final url = raw['url'] as String? ?? '';
    if (url.isEmpty) return null;
    return ValidatorLogoRecord(
      identity: raw['identity'] as String? ?? '',
      url: url,
      updatedAt: (raw['updatedAt'] as num?)?.toInt() ?? 0,
    );
  }
}

String validatorLogoCacheKey(String chainId, String operatorAddress) =>
    '$validatorLogoCachePrefix$chainId:$operatorAddress';

String? _slug(String? value) {
  final slug = (value ?? '')
      .trim()
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9-]+'), '')
      .replaceAll(RegExp(r'^-+|-+$'), '');
  return slug.isEmpty ? null : slug;
}

List<String> validatorLogoSlugs(
  String chainId, [
  String? chainName,
  List<String>? extra,
  String? operatorAddress,
]) {
  final slugs = <String>[];
  void push(String? value) {
    final slug = _slug(value);
    if (slug != null && !slugs.contains(slug)) slugs.add(slug);
  }

  for (final slug in extra ?? const <String>[]) {
    push(slug);
  }
  final prefix = RegExp(r'^([a-z0-9]+)valoper', caseSensitive: false)
      .firstMatch(operatorAddress ?? '');
  push(prefix?.group(1));
  push(chainName?.replaceAll(RegExp(r'\s+'), ''));
  push(chainName);
  push(chainId.replaceAll(RegExp(r'_\d+-\d+$'), '').replaceAll(RegExp(r'-\d+$'), ''));
  push(chainId);
  return slugs;
}

List<String> validatorLogoCandidates(ValidatorLogoInput input) {
  final operator = input.operatorAddress.trim();
  if (operator.isEmpty) return const [];
  final urls = <String>[];
  for (final slug in validatorLogoSlugs(
    input.chainId,
    input.chainName,
    input.logoSlugs,
    operator,
  )) {
    urls.add(
      'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/$slug/moniker/$operator.png',
    );
    urls.add(
      'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/$slug/moniker/$operator.png',
    );
  }
  return urls;
}
