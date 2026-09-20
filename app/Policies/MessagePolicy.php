<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    /**
     * Determine whether the user can view any messages.
     * Index results are further scoped at the query level.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the specific message.
     */
    public function view(User $user, Message $message): bool
    {
        return $user->isAdmin() || ($message->user_id !== null && $user->id === $message->user_id);
    }

    /**
     * Determine whether the user can delete the specific message.
     */
    public function delete(User $user, Message $message): bool
    {
        return $user->isAdmin() || ($message->user_id !== null && $user->id === $message->user_id);
    }
}
