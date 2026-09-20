<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class Honeypot implements ValidationRule
{
    /**
     * Fails silently-looking (generic message) when the hidden trap field
     * received any value — only bots that auto-fill every input trigger this.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (filled($value)) {
            $fail('Invalid submission.');
        }
    }
}
