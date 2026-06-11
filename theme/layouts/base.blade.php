<!DOCTYPE html>
<html lang="{{ isset($locale) ? $locale->htmlLang() : config('app.default_locale') }}"
      dir="{{ isset($locale) ? $locale->htmlDirection() : 'auto' }}"
      class="{{ setting()->getForCurrentUser('dark-mode-enabled') ? 'dark-mode ' : '' }}">
<head>
    <title>{{ isset($pageTitle) ? $pageTitle . ' | ' : '' }}{{ setting('app-name', 'SilverWiki') }}</title>

    <!-- Meta -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta name="token" content="{{ csrf_token() }}">
    <meta name="base-url" content="{{ url('/') }}">
    <meta name="theme-color" content="{{(setting()->getForCurrentUser('dark-mode-enabled') ? setting('app-color-dark') : setting('app-color'))}}"/>

    <!-- Social Cards Meta -->
    <meta property="og:title" content="{{ isset($pageTitle) ? $pageTitle . ' | ' : '' }}{{ setting('app-name', 'SilverWiki') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    @stack('social-meta')

    <!-- Styles -->
    <link rel="stylesheet" href="{{ versioned_asset('dist/styles.css') }}">
    <!-- SilverWiki custom styles -->
    <link rel="stylesheet" href="/theme/silverwiki/css/silverwiki.css?v=1.1.1">

    <!-- Icons -->
    <link rel="icon" type="image/png" sizes="256x256" href="{{ setting('app-icon') ?: url('/icon.png') }}">
    <link rel="icon" type="image/png" sizes="180x180" href="{{ setting('app-icon-180') ?: url('/icon-180.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ setting('app-icon-180') ?: url('/icon-180.png') }}">
    <link rel="icon" type="image/png" sizes="128x128" href="{{ setting('app-icon-128') ?: url('/icon-128.png') }}">
    <link rel="icon" type="image/png" sizes="64x64" href="{{ setting('app-icon-64') ?: url('/icon-64.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ setting('app-icon-32') ?: url('/icon-32.png') }}">

    <!-- PWA -->
    <link rel="manifest" href="{{ url('/manifest.json') }}" crossorigin="use-credentials">
    <meta name="mobile-web-app-capable" content="yes">

    <!-- OpenSearch -->
    <link rel="search" type="application/opensearchdescription+xml" title="{{ setting('app-name', 'SilverWiki') }}" href="{{ url('/opensearch.xml') }}">

    <!-- Custom Styles & Head Content -->
    @include('layouts.parts.custom-styles')
    @include('layouts.parts.custom-head')

    @stack('head')

    <!-- Translations for JS -->
    @stack('translations')

    <!-- Avoid Flash of Unstyled Content (FOUC) for SilverWiki settings -->
    <script @if($cspNonce ?? false) nonce="{{ $cspNonce }}" @endif>
        (function() {
            var density = localStorage.getItem('silverwiki_density') || 'normal';
            document.documentElement.classList.add('density-' + density);
            var bg = localStorage.getItem('silverwiki_bg_style') || 'gradient';
            document.documentElement.classList.add('bg-' + bg);
            var preset = localStorage.getItem('silverwiki_theme_preset') || 'standard';
            document.documentElement.classList.add('theme-preset-' + preset);
        })();
    </script>
</head>
<body
    @if(setting()->getForCurrentUser('ui-shortcuts-enabled', false))
        component="shortcuts"
        option:shortcuts:key-map="{{ \BookStack\Settings\UserShortcutMap::fromUserPreferences()->toJson() }}"
    @endif
      class="@stack('body-class')">

    @include('layouts.parts.base-body-start')
    @include('layouts.parts.skip-to-content')
    @include('layouts.parts.notifications')
    @include('layouts.parts.header')

    <div id="content" components="@yield('content-components')" class="block">
        @yield('content')
    </div>

    @include('layouts.parts.footer')

    <div component="back-to-top" class="back-to-top print-hidden">
        <div class="inner">
            @icon('chevron-up') <span>{{ trans('common.back_to_top') }}</span>
        </div>
    </div>

    <!-- Tweaks Panel Button -->
    <button class="silverwiki-tweaks-btn" aria-label="{{ setting('app-name', 'SilverWiki') }} {{ trans('silverwiki.aria_label_tweaks') }}">
        <span class="material-symbols-outlined">settings</span>
    </button>

    <!-- Tweaks Panel Box -->
    <div class="silverwiki-tweaks-panel">
        <div class="tweaks-panel-title">
            <span>{{ setting('app-name', 'SilverWiki') }} {{ trans('silverwiki.tweaks_title') }}</span>
            <span class="material-symbols-outlined">tune</span>
        </div>
        
        <!-- Theme Selection -->
        <div class="tweaks-section">
            <div class="tweaks-section-title">{{ trans('silverwiki.tweaks_section_theme') }}</div>
            <div class="tweaks-options-group">
                <button class="tweaks-option-btn" data-tweak-group="theme" data-tweak-value="dark">{{ trans('common.dark_mode') }}</button>
                <button class="tweaks-option-btn" data-tweak-group="theme" data-tweak-value="light">{{ trans('common.light_mode') }}</button>
            </div>
        </div>
        
        <!-- Design Theme Selection -->
        <div class="tweaks-section">
            <div class="tweaks-section-title">{{ trans('silverwiki.tweaks_section_preset') }}</div>
            <div class="tweaks-options-group">
                <button class="tweaks-option-btn" data-tweak-group="preset" data-tweak-value="standard">{{ trans('silverwiki.tweaks_preset_standard') }}</button>
                <button class="tweaks-option-btn" data-tweak-group="preset" data-tweak-value="linear">{{ trans('silverwiki.tweaks_preset_linear') }}</button>
                <button class="tweaks-option-btn" data-tweak-group="preset" data-tweak-value="claude">{{ trans('silverwiki.tweaks_preset_claude') }}</button>
            </div>
        </div>
        
        <!-- Density Selection -->
        <div class="tweaks-section">
            <div class="tweaks-section-title">{{ trans('silverwiki.tweaks_section_density') }}</div>
            <div class="tweaks-options-group">
                <button class="tweaks-option-btn" data-tweak-group="density" data-tweak-value="normal">{{ trans('silverwiki.tweaks_density_normal') }}</button>
                <button class="tweaks-option-btn" data-tweak-group="density" data-tweak-value="dense">{{ trans('silverwiki.tweaks_density_dense') }}</button>
            </div>
        </div>

        <!-- Background Selection -->
        <div class="tweaks-section">
            <div class="tweaks-section-title">{{ trans('silverwiki.tweaks_section_background') }}</div>
            <div class="tweaks-options-group">
                <button class="tweaks-option-btn" data-tweak-group="bgStyle" data-tweak-value="gradient">{{ trans('silverwiki.tweaks_bg_gradient') }}</button>
                <button class="tweaks-option-btn" data-tweak-group="bgStyle" data-tweak-value="flat">{{ trans('silverwiki.tweaks_bg_flat') }}</button>
            </div>
        </div>
        
        <!-- Chat Layout Selection -->
        <div class="tweaks-section">
            <div class="tweaks-section-title">KI-Chat Layout</div>
            <div class="tweaks-options-group">
                <button class="tweaks-option-btn" data-tweak-group="chatLayout" data-tweak-value="floating">Floating</button>
                <button class="tweaks-option-btn" data-tweak-group="chatLayout" data-tweak-value="drawer">Sidebar</button>
            </div>
        </div>
    </div>

    @if($cspNonce ?? false)
        <script src="{{ versioned_asset('dist/app.js') }}" type="module" nonce="{{ $cspNonce }}"></script>
    @endif
    @stack('body-end')

    @include('layouts.parts.base-body-end')
    
    <!-- SilverWiki AI Chat Integration -->
    @include('layouts.parts.ai-chat')

    <!-- SilverWiki custom logic -->
    <script src="/theme/silverwiki/js/silverwiki.js?v=1.1.1" @if($cspNonce ?? false) nonce="{{ $cspNonce }}" @endif defer></script>
</body>
</html>
