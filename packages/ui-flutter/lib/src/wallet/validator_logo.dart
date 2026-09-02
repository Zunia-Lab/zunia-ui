/// Validator moniker images, matching `@zunialab/ui` `validatorLogo.ts`.
///
/// Source is Cosmostation's chainlist on GitHub raw. The resolved URL is
/// stored against the validator's Keybase `identity`. A new identity drops
/// the cache and we resolve again.
library;

const validatorLogoCachePrefix = 'zunia.validator.logo.v1:';

const _slugAliases = <String, String>{
  'cosmoshub-4': 'cosmos',
  'osmosis-1': 'osmosis',
  'celestia': 'celestia',
  'neutron-1': 'neutron',
  'akashnet-2': 'akash',
  'juno-1': 'juno',
  'kaiyo-1': 'kujira',
  'phoenix-1': 'terra',
  'dydx-mainnet-1': 'dydx',
  'injective-1': 'injective',
  'pacific-1': 'sei',
  'core-1': 'persistence',
  'stargaze-1': 'stargaze',
  'stride-1': 'stride',
  'noble-1': 'noble',
  'axelar-dojo-1': 'axelar',
  'evmos_9001-2': 'evmos',
  'safrochain-1': 'safrochain',
  'bbn-1': 'babylon',
  'pio-mainnet-1': 'provenance',
  'laozi-mainnet': 'band',
  'regen-1': 'regen',
  'sommelier-3': 'sommelier',
  'umee-1': 'umee',
  'quicksilver-2': 'quicksilver',
  'chihuahua-1': 'chihuahua',
  'bitcanna-1': 'bitcanna',
  'bitsong-2b': 'bitsong',
  'comdex-1': 'comdex',
  'crescent-1': 'crescent',
  'desmos-mainnet': 'desmos',
  'emoney-3': 'emoney',
  'fetchhub-4': 'fetchai',
  'gravity-bridge-3': 'gravity-bridge',
  'irishub-1': 'iris',
  'kava_2222-10': 'kava',
  'likecoin-mainnet-2': 'likecoin',
  'lum-network-1': 'lum',
  'mantle-1': 'assetmantle',
  'osmosis-testnet': 'osmosis-testnet',
  'theta-testnet-001': 'cosmos-testnet',
};

class ValidatorLogoInput {
  const ValidatorLogoInput({
    required this.chainId,
    required this.operatorAddress,
    this.chainName,
    this.identity = '',
  });

  final String chainId;
  final String? chainName;
  final String operatorAddress;
  final String identity;
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

List<String> validatorLogoSlugs(String chainId, [String? chainName]) {
  final slugs = <String>[];
  void push(String? value) {
    final slug = _slug(value);
    if (slug != null && !slugs.contains(slug)) slugs.add(slug);
  }

  push(_slugAliases[chainId]);
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
  for (final slug in validatorLogoSlugs(input.chainId, input.chainName)) {
    urls.add(
      'https://raw.githubusercontent.com/cosmostation/chainlist/master/chain/$slug/moniker/$operator.png',
    );
    urls.add(
      'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/$slug/moniker/$operator.png',
    );
  }
  return urls;
}
