<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth enforced by route middleware
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'image', 'mimes:jpeg,jpg,png,webp,heif,heic', 'max:20480'],
            'collection' => ['nullable', 'string', Rule::in(['thumbnail', 'hero', 'gallery', 'post_cover', 'library'])],
            'caption' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'content_id' => ['nullable', 'integer', 'exists:contents,id'],
            'mediable_id' => ['nullable', 'integer'],
            'mediable_type' => ['nullable', 'string', Rule::in([
                'App\\Models\\Content',
                'App\\Models\\Project',
                'App\\Models\\Post',
            ])],
        ];
    }
}
