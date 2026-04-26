<?php

namespace App\Services;

use App\Models\Certificado;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class CertificadoService
{
    /**
     * @throws ValidationException
     */
    public function gerar(array $dados): Certificado
    {
        $validados = Validator::make($dados, [
            'anuncio_id' => ['required', 'integer', 'exists:anuncios,id'],
            'empresa_id' => ['required', 'integer', 'exists:users,id'],
            'cooperativa_id' => ['required', 'integer', 'exists:users,id'],
            'nome_empresa' => ['required', 'string', 'max:255'],
            'nome_cooperativa' => ['required', 'string', 'max:255'],
            'tipo_residuo' => ['required', 'string', 'max:255'],
            'peso_coletado' => ['required', 'numeric', 'min:0.01'],
            'data_coleta' => ['required', 'date'],
        ])->validate();

        $numero = (string) Str::uuid();
        $dataColeta = Carbon::parse($validados['data_coleta']);
        $nomeArquivo = "CDF-{$numero}.pdf";
        $caminhoArquivo = "certificados/{$nomeArquivo}";

        $html = $this->montarHtmlCertificado(
            $numero,
            $dataColeta,
            $validados['nome_empresa'],
            $validados['nome_cooperativa'],
            $validados['tipo_residuo'],
            (float) $validados['peso_coletado']
        );

        $pdf = PDF::loadHTML($html);
        Storage::disk('public')->put($caminhoArquivo, $pdf->output());

        return Certificado::create([
            'anuncio_id' => (int) $validados['anuncio_id'],
            'empresa_id' => (int) $validados['empresa_id'],
            'cooperativa_id' => (int) $validados['cooperativa_id'],
            'numero_certificado' => $numero,
            'tipo_residuo' => $validados['tipo_residuo'],
            'peso_coletado' => $validados['peso_coletado'],
            'data_coleta' => $dataColeta,
            'pdf_url' => Storage::url($caminhoArquivo),
        ]);
    }

    private function montarHtmlCertificado(
        string $numero,
        Carbon $dataColeta,
        string $nomeEmpresa,
        string $nomeCooperativa,
        string $tipoResiduo,
        float $pesoColetado
    ): string {
        return <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Certificado Digital de Destino</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; margin: 32px; }
        h1 { font-size: 22px; margin-bottom: 20px; }
        .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 18px; }
        .row { margin-bottom: 10px; }
        .label { font-weight: bold; }
    </style>
</head>
<body>
    <h1>Certificado Digital de Destino (CDF)</h1>
    <div class="box">
        <div class="row"><span class="label">Número do certificado:</span> {$numero}</div>
        <div class="row"><span class="label">Data e hora da coleta:</span> {$dataColeta->format('d/m/Y H:i:s')}</div>
        <div class="row"><span class="label">Empresa geradora:</span> {$nomeEmpresa}</div>
        <div class="row"><span class="label">Cooperativa coletora:</span> {$nomeCooperativa}</div>
        <div class="row"><span class="label">Tipo de resíduo:</span> {$tipoResiduo}</div>
        <div class="row"><span class="label">Peso coletado:</span> {$pesoColetado} kg</div>
    </div>
</body>
</html>
HTML;
    }
}
