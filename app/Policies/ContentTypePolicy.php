<?php

namespace App\Policies;

use App\Models\ContentType;
use App\Models\User;

class ContentTypePolicy
{
    /**
     * Determine whether the user can view any content types.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the content type.
     */
    public function view(User $user, ContentType $contentType): bool
    {
        return $user->isAdmin()
            || $user->id === $contentType->user_id
            || $contentType->users()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create content types (Super Admin only).
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the content type (Super Admin only).
     */
    public function update(User $user, ContentType $contentType): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the content type (Super Admin only).
     */
    public function delete(User $user, ContentType $contentType): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can toggle the public visibility of the content type.
     */
    public function toggleVisibility(User $user, ContentType $contentType): bool
    {
        return $user->isAdmin()
            || $user->id === $contentType->user_id
            || $contentType->users()->where('users.id', $user->id)->exists();
    }
}
