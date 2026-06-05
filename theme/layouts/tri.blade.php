@extends('layouts.base')

@push('body-class', 'tri-layout ')
@section('content-components', 'tri-layout')

@section('content')

    <div class="tri-layout-mobile-tabs print-hidden">
        <div class="grid half no-break no-gap">
            <button type="button"
                    refs="tri-layout@tab"
                    data-tab="info"
                    aria-label="{{ trans('common.tab_info_label') }}"
                    class="tri-layout-mobile-tab px-m py-m text-link">
                {{ trans('common.tab_info') }}
            </button>
            <button type="button"
                    refs="tri-layout@tab"
                    data-tab="content"
                    aria-label="{{ trans('common.tab_content_label') }}"
                    aria-selected="true"
                    class="tri-layout-mobile-tab px-m py-m text-link active">
                {{ trans('common.tab_content') }}
            </button>
        </div>
    </div>

    <div refs="tri-layout@container" class="tri-layout-container" @yield('container-attrs') >

        <div class="tri-layout-sides print-hidden">
            <div refs="tri-layout@sidebar-scroll-container" class="tri-layout-sides-content">
                <div class="tri-layout-right print-hidden">
                    <aside refs="tri-layout@sidebar-scroll-container" class="tri-layout-right-contents">
                        @yield('right')
                    </aside>
                </div>

                <div class="tri-layout-left print-hidden" id="sidebar">
                    <aside refs="tri-layout@sidebar-scroll-container" class="tri-layout-left-contents">
                        
                        <!-- SilverWiki Categories Sidebar (Shelves) -->
                        <div class="silverwiki-sidebar-categories" style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--w-border-separator);">
                            <div class="sp-eyebrow" style="margin-bottom: 12px; padding: 0 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--w-text-subtle);">
                                {{ trans('settings.categories') }}
                            </div>
                            @php
                                $shelfQueries = app(\BookStack\Entities\Queries\BookshelfQueries::class);
                                $sidebarShelves = $shelfQueries->visibleForList()->orderBy('name', 'asc')->get();
                                $currentShelfId = isset($shelf) ? $shelf->id : null;
                            @endphp
                            @foreach($sidebarShelves as $sidebarShelf)
                                <a href="{{ $sidebarShelf->getUrl() }}" class="sidebar-category-link {{ $currentShelfId === $sidebarShelf->id ? 'active' : '' }}">
                                    <span class="material-symbols-outlined">folder_open</span>
                                    <span>{{ $sidebarShelf->name }}</span>
                                </a>
                            @endforeach
                        </div>

                        <!-- BookStack Native Context Sidebar -->
                        @yield('left')
                    </aside>
                </div>
            </div>
        </div>

        <div class="@yield('body-wrap-classes') tri-layout-middle">
            <div id="main-content" class="tri-layout-middle-contents">
                @yield('body')
            </div>
        </div>
    </div>

@stop
