<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResiduoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'categoria' => ['required', Rule::in(['plastico', 'papel', 'vidro', 'metal', 'eletronico', 'organico', 'entulho'])],
            'descricao' => ['required', 'string', 'max:1000'],
            'foto' => ['required', 'image', 'max:5120'], // Max 5MB
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }

    public function messages(): array
    {
        return [
            'categoria.required' => 'A categoria é obrigatória.',
            'categoria.in' => 'A categoria informada é inválida.',
            'descricao.required' => 'A descrição é obrigatória.',
            'descricao.string' => 'A descrição deve ser um texto.',
            'descricao.max' => 'A descrição deve ter no máximo 1000 caracteres.',
            'foto.required' => 'A foto é obrigatória.',
            'foto.image' => 'O arquivo deve ser uma imagem.',
            'foto.max' => 'A foto não pode ter mais que 5MB.',
            'latitude.required' => 'A latitude é obrigatória.',
            'latitude.numeric' => 'A latitude deve ser numérica.',
            'latitude.between' => 'A latitude deve estar entre -90 e 90.',
            'longitude.required' => 'A longitude é obrigatória.',
            'longitude.numeric' => 'A longitude deve ser numérica.',
            'longitude.between' => 'A longitude deve estar entre -180 e 180.',
        ];
    }
}
