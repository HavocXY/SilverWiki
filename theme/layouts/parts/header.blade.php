<header id="header" component="header-mobile-toggle" class="header px-xl grid print-hidden">
    <div class="flex-container-row justify-space-between gap-s items-center">
        <!-- SilverWiki custom brand logo/text -->
        <a href="{{ url('/') }}" class="logo flex-container-row items-center gap-xs" style="text-decoration: none;">
            <span class="material-symbols-outlined" style="color: var(--color-primary); font-size: 22px;">space_dashboard</span>
            <span class="silverwiki-brand-text">SilverWiki</span>
        </a>
        
        <div class="hide-over-l py-s">
            <button type="button"
                    refs="header-mobile-toggle@toggle"
                    title="{{ trans('common.header_menu_expand') }}"
                    aria-expanded="false"
                    class="mobile-menu-toggle" style="background: none; border: none; color: var(--w-text-muted); cursor: pointer;">
                <span class="material-symbols-outlined">more_vert</span>
            </button>
        </div>
    </div>

    <div class="flex-container-column items-center justify-center hide-under-l">
    @if(user()->hasAppAccess())
        @include('layouts.parts.header-search')
    @endif
    </div>

    <nav refs="header-mobile-toggle@menu" class="header-links">
        <div class="links text-center">
            @include('layouts.parts.header-links')
        </div>
        @if(!user()->isGuest())
            @include('layouts.parts.header-user-menu', ['user' => user()])
        @endif
    </nav>
</header>
