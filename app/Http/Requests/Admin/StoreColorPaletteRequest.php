<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreColorPaletteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    protected function prepareForValidation(): void
    {
        $fields = ['primary_color', 'secondary_color', 'tertiary_color', 'accent_color', 'dark_neutral', 'light_neutral'];
        $merge = [];
        foreach ($fields as $field) {
            if ($this->has($field)) {
                $val = trim((string) $this->input($field));
                $merge[$field] = $val !== '' ? $val : null;
            }
        }
        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:color_palettes,slug'],
            'priority' => ['nullable', 'string', 'max:20'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'theory_title' => ['nullable', 'string', 'max:255'],
            'theory_text' => ['nullable', 'string'],
            'primary_color' => ['required', 'string', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
            'secondary_color' => ['required', 'string', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
            'tertiary_color' => ['nullable', 'string', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
            'accent_color' => ['nullable', 'string', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
            'dark_neutral' => ['nullable', 'string', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
            'light_neutral' => ['nullable', 'string', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
            'colors' => ['nullable', 'array'],
            'is_master' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
