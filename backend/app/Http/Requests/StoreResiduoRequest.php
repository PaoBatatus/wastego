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
            'foto_url' => ['nullable', 'string', 'url'],
            'peso_estimado' => ['nullable', 'numeric', 'min:0'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'janela_inicio' => ['nullable', 'date', 'after:now'],
            'janela_fim' => ['nullable', 'date', 'after:janela_inicio'],
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
            'foto_url.string' => 'A URL da foto deve ser um texto.',
            'foto_url.url' => 'A URL da foto deve ser válida.',
            'peso_estimado.numeric' => 'O peso estimado deve ser numérico.',
            'peso_estimado.min' => 'O peso estimado deve ser maior ou igual a zero.',
            'latitude.required' => 'A latitude é obrigatória.',
            'latitude.numeric' => 'A latitude deve ser numérica.',
            'latitude.between' => 'A latitude deve estar entre -90 e 90.',
            'longitude.required' => 'A longitude é obrigatória.',
            'longitude.numeric' => 'A longitude deve ser numérica.',
            'longitude.between' => 'A longitude deve estar entre -180 e 180.',
            'janela_inicio.date' => 'A janela de início deve ser uma data válida.',
            'janela_inicio.after' => 'A janela de início deve ser uma data futura.',
            'janela_fim.date' => 'A janela de fim deve ser uma data válida.',
            'janela_fim.after' => 'A janela de fim deve ser posterior à janela de início.',
        ];
    }
}
