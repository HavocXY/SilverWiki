@php
    /**
     * @var \BookStack\Entities\Models\Book $book
     */
@endphp
<a href="{{ $book->getUrl() }}" class="book entity-list-item" data-entity-type="book" data-entity-id="{{$book->id}}">
    <div class="book-list-3d-wrap">
        <div class="book-list-3d-icon">
            <div class="book-list-3d-spine"></div>
            <div class="book-list-3d-cover @if($book->coverInfo()->exists()) has-image @endif" style="background-image: url('{{ $book->coverInfo()->getUrl() }}')">
                @if(!$book->coverInfo()->exists())
                    @icon('book')
                @endif
            </div>
            <div class="book-list-3d-pages"></div>
        </div>
    </div>
    <div class="content">
        <h4 class="entity-list-item-name break-text">{{ $book->name }}</h4>
        <div class="entity-item-snippet">
            <p class="text-muted break-text mb-s text-limit-lines-1">{{ $book->descriptionInfo()->getPlain() }}</p>
        </div>
    </div>
</a>