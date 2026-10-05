<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomFontRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', 'string', Rule::in(['heading', 'sans', 'mono'])],
            'family_name' => ['nullable', 'string', 'max:100'],
            'font_file' => [
                'required',
                'file',
                'max:10240', // Max 10MB
                function ($attribute, $value, $fail) {
                    $ext = strtolower($value->getClientOriginalExtension());
                    if (! in_array($ext, ['woff2', 'woff', 'ttf', 'otf'], true)) {
                        $fail('El archivo debe tener una extensión válida de tipografía: .woff2, .woff, .ttf o .otf.');
                    }
                },
            ],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'role.required' => 'El rol de tipografía es obligatorio (titulares, cuerpo o código).',
            'role.in' => 'El rol tipográfico seleccionado no es válido.',
            'font_file.required' => 'Debes seleccionar un archivo de fuente tipográfica.',
            'font_file.file' => 'El archivo proporcionado no es válido.',
            'font_file.max' => 'El archivo de fuente no debe superar los 10 MB.',
        ];
    }
}
