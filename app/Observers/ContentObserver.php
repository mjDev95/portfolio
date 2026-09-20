<?php

namespace App\Observers;

use App\Models\Content;
use App\Services\PortfolioCacheService;

class ContentObserver
{
    /**
     * Handle the Content "saved" event.
     */
    public function saved(Content $content): void
    {
        PortfolioCacheService::clearPublicCache();
        PortfolioCacheService::clearDashboardCache($content->user_id);
    }

    /**
     * Handle the Content "deleted" event.
     */
    public function deleted(Content $content): void
    {
        PortfolioCacheService::clearPublicCache();
        PortfolioCacheService::clearDashboardCache($content->user_id);
    }

    /**
     * Handle the Content "restored" event.
     */
    public function restored(Content $content): void
    {
        PortfolioCacheService::clearPublicCache();
        PortfolioCacheService::clearDashboardCache($content->user_id);
    }
}
