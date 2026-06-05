<a href="{{ $entity->getUrl() }}" class="grid-card"
   data-entity-type="{{ $entity->getType() }}" data-entity-id="{{ $entity->id }}">
    @if($entity->getType() === 'book')
        <div class="book-3d-container">
            <div class="book-3d">
                <div class="book-3d-front featured-image-container-wrap bg-book">
                    <div class="featured-image-container" @if($entity->coverInfo()->exists()) style="background-image: url('{{ $entity->coverInfo()->getUrl() }}')"@endif></div>
                    @icon('book')
                </div>
                <div class="book-3d-spine">
                    <div class="book-3d-spine-text">{{ $entity->name }}</div>
                </div>
                <div class="book-3d-pages"></div>
                <div class="book-3d-back"></div>
                <div class="book-3d-inner-glow"></div>
            </div>
        </div>
    @elseif($entity->getType() === 'bookshelf')
        <div class="shelf-visual-container">
            <div class="bg-bookshelf featured-image-container-wrap">
                <div class="featured-image-container" @if($entity->coverInfo()->exists()) style="background-image: url('{{ $entity->coverInfo()->getUrl() }}')"@endif></div>
                @icon('bookshelf')
            </div>
            <div class="shelf-wood-board"></div>
        </div>
    @else
        <div class="bg-{{ $entity->getType() }} featured-image-container-wrap">
            <div class="featured-image-container" @if($entity->coverInfo()->exists()) style="background-image: url('{{ $entity->coverInfo()->getUrl() }}')"@endif></div>
            @icon($entity->getType())
        </div>
    @endif
    <div class="grid-card-content">
        <h2 class="text-limit-lines-2">{{ $entity->name }}</h2>
        <p class="text-muted">{{ $entity->getExcerpt(130) }}</p>
    </div>
    <div class="grid-card-footer text-muted ">
        <p>@icon('star')<span title="{{ $dates->absolute($entity->created_at) }}">{{ trans('entities.meta_created', ['timeLength' => $dates->relative($entity->created_at)]) }}</span></p>
        <p>@icon('edit')<span title="{{ $dates->absolute($entity->updated_at) }}">{{ trans('entities.meta_updated', ['timeLength' => $dates->relative($entity->updated_at)]) }}</span></p>
    </div>
</a>