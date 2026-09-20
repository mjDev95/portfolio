<?php

namespace App\Observers;

use App\Models\ContentType;
use App\Services\PortfolioCacheService;

class ContentTypeObserver
{
    /**
     * Handle the ContentType "saved" event.
     */
    public function saved(ContentType $contentType): void
    {
        PortfolioCacheService::clearAdminCache();
        PortfolioCacheService::clearPublicCache();
    }

    /**
     * Handle the ContentType "deleted" event.
     */
    public function deleted(ContentType $contentType): void
    {
        PortfolioCacheService::clearAdminCache();
        PortfolioCacheService::clearPublicCache();
    }
}
