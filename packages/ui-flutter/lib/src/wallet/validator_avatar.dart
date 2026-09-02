import 'package:flutter/material.dart';
import '../theme/zunia_semantics_ext.dart';
import '../theme/zunia_theme.dart';
import 'validator_logo.dart';

/// Circular validator moniker. Walks Cosmostation candidates until one loads,
/// then reports the winner so the host can persist it against [identity].
class ZuniaValidatorAvatar extends StatefulWidget {
  const ZuniaValidatorAvatar({
    super.key,
    required this.chainId,
    required this.operatorAddress,
    required this.moniker,
    this.chainName,
    this.identity = '',
    this.size = 28,
    this.cachedUrl,
    this.onResolved,
    this.onCacheInvalid,
  });

  final String chainId;
  final String? chainName;
  final String operatorAddress;
  final String identity;
  final String moniker;
  final double size;
  final String? cachedUrl;
  final ValueChanged<String>? onResolved;
  final VoidCallback? onCacheInvalid;

  @override
  State<ZuniaValidatorAvatar> createState() => _ZuniaValidatorAvatarState();
}

class _ZuniaValidatorAvatarState extends State<ZuniaValidatorAvatar> {
  ImageStream? _stream;
  ImageStreamListener? _listener;
  String? _url;
  int _index = 0;
  bool _failed = false;

  ValidatorLogoInput get _input => ValidatorLogoInput(
        chainId: widget.chainId,
        chainName: widget.chainName,
        operatorAddress: widget.operatorAddress,
        identity: widget.identity,
      );

  List<String> get _candidates => validatorLogoCandidates(_input);

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void didUpdateWidget(covariant ZuniaValidatorAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.chainId != widget.chainId ||
        oldWidget.chainName != widget.chainName ||
        oldWidget.operatorAddress != widget.operatorAddress ||
        oldWidget.identity != widget.identity ||
        oldWidget.cachedUrl != widget.cachedUrl) {
      _detach();
      _url = null;
      _index = 0;
      _failed = false;
      _start();
    }
  }

  @override
  void dispose() {
    _detach();
    super.dispose();
  }

  void _start() {
    final cached = widget.cachedUrl;
    if (cached != null && cached.isNotEmpty) {
      _probe(cached, fromCache: true);
      return;
    }
    _probeNext();
  }

  void _probeNext() {
    if (_index >= _candidates.length) {
      if (mounted) setState(() => _failed = true);
      return;
    }
    _probe(_candidates[_index], fromCache: false);
  }

  void _probe(String url, {required bool fromCache}) {
    _detach();
    final stream = NetworkImage(url).resolve(ImageConfiguration.empty);
    late final ImageStreamListener listener;
    listener = ImageStreamListener(
      (info, sync) {
        if (!mounted) return;
        setState(() {
          _url = url;
          _failed = false;
        });
        widget.onResolved?.call(url);
      },
      onError: (error, stack) {
        if (fromCache) {
          widget.onCacheInvalid?.call();
          _index = 0;
          _probeNext();
          return;
        }
        _index += 1;
        _probeNext();
      },
    );
    stream.addListener(listener);
    _stream = stream;
    _listener = listener;
  }

  void _detach() {
    final stream = _stream;
    final listener = _listener;
    if (stream != null && listener != null) {
      stream.removeListener(listener);
    }
    _stream = null;
    _listener = null;
  }

  @override
  Widget build(BuildContext context) {
    final s = ZuniaSemanticsExt.of(context);
    final initials = widget.moniker.isEmpty
        ? '?'
        : widget.moniker.characters.take(2).toString().toUpperCase();
    return ClipOval(
      child: Container(
        width: widget.size,
        height: widget.size,
        color: s.stateHover,
        alignment: Alignment.center,
        child: _url != null && !_failed
            ? Image.network(
                _url!,
                width: widget.size,
                height: widget.size,
                fit: BoxFit.cover,
                gaplessPlayback: true,
              )
            : Text(
                initials,
                style: zuniaMono(fontSize: widget.size * 0.32, color: s.fgMuted),
              ),
      ),
    );
  }
}
