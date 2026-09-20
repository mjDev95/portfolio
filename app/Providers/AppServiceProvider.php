<?php

namespace App\Providers;

use App\Models\Content;
use App\Models\ContentType;
use App\Observers\ContentObserver;
use App\Observers\ContentTypeObserver;
use App\Policies\ContentPolicy;
use App\Policies\ContentTypePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(Content::class, ContentPolicy::class);
        Gate::policy(ContentType::class, ContentTypePolicy::class);

        Content::observe(ContentObserver::class);
        ContentType::observe(ContentTypeObserver::class);
    }
}
