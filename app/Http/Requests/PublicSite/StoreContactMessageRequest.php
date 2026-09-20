<?php

namespace App\Http\Requests\PublicSite;

use App\Rules\Honeypot;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    /**
     * Public endpoint: anyone may submit the contact form. Real abuse
     * mitigation happens via honeypot + throttle:5,1 on the route.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            // Note: add ",dns" (email:rfc,dns) for stricter MX-record checks in
            // production — omitted here so the form keeps working offline/local.
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'budget_range' => ['nullable', 'string', 'max:60'],
            'message' => ['required', 'string', 'max:5000'],
            // Hidden trap field ("company") must stay empty; real users never see it.
            'company' => ['nullable', new Honeypot],
        ];
    }

    /**
     * Strip control characters (CR/LF/NUL) from single-line fields before
     * validation so a malicious payload can never inject extra SMTP/mail
     * headers when the message is later relayed via Mail::send().
     */
    protected function prepareForValidation(): void
    {
        $strip = fn (?string $value) => $value === null
            ? null
            : trim(preg_replace('/[\r\n\0]+/', ' ', $value));

        $this->merge([
            'name' => $strip($this->input('name')),
            'email' => $strip($this->input('email')),
            'budget_range' => $strip($this->input('budget_range')),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'company.string' => 'Invalid submission.',
        ];
    }
}
