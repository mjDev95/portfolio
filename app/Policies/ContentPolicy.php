<?php

namespace App\Policies;

use App\Models\Content;
use App\Models\ContentType;
use App\Models\User;

class ContentPolicy
{
    /**
     * Determine whether the user can view any contents.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the content.
     */
    public function view(User $user, Content $content): bool
    {
        return $user->isAdmin() || $user->id === $content->user_id;
    }

    /**
     * Determine whether the user can create contents for a given ContentType.
     */
    public function create(User $user, ContentType $contentType): bool
    {
        return $user->isAdmin()
            || $user->id === $contentType->user_id
            || $contentType->users()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the content.
     */
    public function update(User $user, Content $content): bool
    {
        return $user->isAdmin() || $user->id === $content->user_id;
    }

    /**
     * Determine whether the user can delete the content.
     */
    public function delete(User $user, Content $content): bool
    {
        return $user->isAdmin() || $user->id === $content->user_id;
    }
}
