<?php

namespace App\Http\Controllers\PublicSite;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicSite\StoreContactMessageRequest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;

class ContactController extends Controller
{
    public function index(): View
    {
        return view('contact');
    }

    /**
     * Honeypot + throttle:5,1 (see routes/web.php) provide the anti-spam
     * layer; the FormRequest sanitizes header-injection-prone fields.
     * Messages are attributed to the primary admin user (single-operator setup).
     */
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        Message::create([
            'user_id' => User::query()->oldest()->value('id'), // primary admin
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'budget_range' => $request->validated('budget_range'),
            'message' => $request->validated('message'),
            'ip_address' => $request->ip(),
        ]);

        return redirect()
            ->route('contact')
            ->with('success', 'Thanks — your message has been sent.');
    }
}
