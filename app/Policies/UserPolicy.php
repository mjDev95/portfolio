<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the actor can view any users (Super Admin only).
     */
    public function viewAny(User $actor): bool
    {
        return $actor->isAdmin();
    }

    /**
     * Determine whether the actor can view a specific user's details.
     */
    public function view(User $actor, User $user): bool
    {
        return $actor->isAdmin() || $actor->id === $user->id;
    }

    /**
     * Determine whether the actor can create users (Super Admin only).
     */
    public function create(User $actor): bool
    {
        return $actor->isAdmin();
    }

    /**
     * Determine whether the actor can update a specific user.
     */
    public function update(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }

    /**
     * Determine whether the actor can delete a specific user.
     */
    public function delete(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }

    /**
     * Determine whether the actor can toggle account status.
     */
    public function toggleStatus(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }

    /**
     * Determine whether the actor can toggle telemetry monetization.
     */
    public function toggleTelemetry(User $actor, User $user): bool
    {
        return $actor->isAdmin();
    }
}
