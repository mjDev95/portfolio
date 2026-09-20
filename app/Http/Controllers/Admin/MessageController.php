<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $perPage = (int) ($user?->getSetting('items_per_page', 20) ?? 20);

        $query = Message::query();

        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $messages = $query
            ->latest()
            ->paginate($perPage, ['id', 'name', 'email', 'budget_range', 'read_at', 'created_at'])
            ->withQueryString();

        $messages->getCollection()->transform(fn ($msg) => [
            'id' => $msg->id,
            'name' => $msg->name,
            'email' => $msg->email,
            'budget_range' => $msg->budget_range,
            'read_at' => $msg->read_at?->toIso8601String(),
            'created_at' => $msg->created_at?->format('d M Y, H:i'),
        ]);

        return Inertia::render('Admin/Messages/Index', [
            'messages' => $messages,
        ]);
    }

    public function show(Message $message): Response
    {
        $this->authorize('view', $message);

        $message->markAsRead();

        return Inertia::render('Admin/Messages/Show', [
            'message' => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'budget_range' => $message->budget_range,
                'message' => $message->message,
                'read_at' => $message->read_at?->toIso8601String(),
                'created_at' => $message->created_at?->format('d M Y, H:i'),
            ],
        ]);
    }

    public function destroy(Message $message): RedirectResponse
    {
        $this->authorize('delete', $message);

        $message->delete();

        return redirect()
            ->route('admin.messages.index')
            ->with('success', 'Message deleted.');
    }
}
