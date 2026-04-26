<?php

namespace Tests\Unit;

use App\Models\Certificado;
use App\Models\Residuo;
use App\Models\User;
use App\Services\CertificadoService;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use Barryvdh\DomPDF\PDF as DomPdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Tests\TestCase;

class CertificadoTest extends TestCase
{
    use RefreshDatabase;

    public function test_gerar_certificado_com_dados_validos_cria_registro_no_banco(): void
    {
        Storage::fake('public');
        $this->mockPdfFacade();

        $service = new CertificadoService();
        $contexto = $this->criarContextoDeCertificado();

        $certificado = $service->gerar([
            'anuncio_id' => $contexto['anuncio_id'],
            'empresa_id' => $contexto['empresa']->id,
            'cooperativa_id' => $contexto['cooperativa']->id,
            'nome_empresa' => 'Empresa Verde',
            'nome_cooperativa' => 'Coop Limpa',
            'tipo_residuo' => 'metal',
            'peso_coletado' => 18.40,
            'data_coleta' => now()->toDateTimeString(),
        ]);

        $this->assertDatabaseHas('certificados', [
            'id' => $certificado->id,
            'empresa_id' => $contexto['empresa']->id,
            'cooperativa_id' => $contexto['cooperativa']->id,
            'tipo_residuo' => 'metal',
        ]);
    }

    public function test_gerar_certificado_retorna_objeto_com_numero_certificado_unico(): void
    {
        Storage::fake('public');
        $this->mockPdfFacade();

        $service = new CertificadoService();
        $contexto = $this->criarContextoDeCertificado();

        $certificadoA = $service->gerar([
            'anuncio_id' => $contexto['anuncio_id'],
            'empresa_id' => $contexto['empresa']->id,
            'cooperativa_id' => $contexto['cooperativa']->id,
            'nome_empresa' => 'Empresa A',
            'nome_cooperativa' => 'Coop A',
            'tipo_residuo' => 'plastico',
            'peso_coletado' => 5.00,
            'data_coleta' => now()->toDateTimeString(),
        ]);

        $contextoB = $this->criarContextoDeCertificado();
        $certificadoB = $service->gerar([
            'anuncio_id' => $contextoB['anuncio_id'],
            'empresa_id' => $contextoB['empresa']->id,
            'cooperativa_id' => $contextoB['cooperativa']->id,
            'nome_empresa' => 'Empresa B',
            'nome_cooperativa' => 'Coop B',
            'tipo_residuo' => 'vidro',
            'peso_coletado' => 7.20,
            'data_coleta' => now()->addMinute()->toDateTimeString(),
        ]);

        $this->assertNotEmpty($certificadoA->numero_certificado);
        $this->assertNotEmpty($certificadoB->numero_certificado);
        $this->assertNotSame($certificadoA->numero_certificado, $certificadoB->numero_certificado);
    }

    public function test_gerar_certificado_cria_arquivo_pdf_em_storage(): void
    {
        Storage::fake('public');
        $this->mockPdfFacade();

        $service = new CertificadoService();
        $contexto = $this->criarContextoDeCertificado();

        $certificado = $service->gerar([
            'anuncio_id' => $contexto['anuncio_id'],
            'empresa_id' => $contexto['empresa']->id,
            'cooperativa_id' => $contexto['cooperativa']->id,
            'nome_empresa' => 'Empresa PDF',
            'nome_cooperativa' => 'Coop PDF',
            'tipo_residuo' => 'eletronico',
            'peso_coletado' => 12.00,
            'data_coleta' => now()->toDateTimeString(),
        ]);

        $caminhoArquivo = ltrim(str_replace('/storage/', '', $certificado->pdf_url), '/');
        Storage::disk('public')->assertExists($caminhoArquivo);
    }

    public function test_listar_certificados_retorna_apenas_os_do_usuario_autenticado(): void
    {
        $empresaAutenticada = User::factory()->create(['perfil' => 'empresa']);
        $outraEmpresa = User::factory()->create(['perfil' => 'empresa']);
        $cooperativa = User::factory()->create(['perfil' => 'cooperativa']);
        $residuo = $this->criarResiduo($empresaAutenticada);

        $anuncioId = DB::table('anuncios')->insertGetId([
            'residuo_id' => $residuo->id,
            'cooperativa_id' => $cooperativa->id,
            'status' => 'concluido',
            'observacoes' => 'Coleta concluida',
            'data_coleta' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Certificado::create([
            'anuncio_id' => $anuncioId,
            'empresa_id' => $empresaAutenticada->id,
            'cooperativa_id' => $cooperativa->id,
            'numero_certificado' => 'CERT-A-001',
            'tipo_residuo' => 'metal',
            'peso_coletado' => 10.00,
            'data_coleta' => now(),
            'pdf_url' => '/storage/certificados/CERT-A-001.pdf',
        ]);

        Certificado::create([
            'anuncio_id' => $anuncioId,
            'empresa_id' => $outraEmpresa->id,
            'cooperativa_id' => $cooperativa->id,
            'numero_certificado' => 'CERT-B-001',
            'tipo_residuo' => 'vidro',
            'peso_coletado' => 8.00,
            'data_coleta' => now(),
            'pdf_url' => '/storage/certificados/CERT-B-001.pdf',
        ]);

        Sanctum::actingAs($empresaAutenticada);
        $response = $this->getJson('/api/v1/certificados');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.empresa_id', $empresaAutenticada->id);
    }

    public function test_gestor_consegue_listar_todos_os_certificados(): void
    {
        $gestor = User::factory()->create(['perfil' => 'gestor']);
        $empresaA = User::factory()->create(['perfil' => 'empresa']);
        $empresaB = User::factory()->create(['perfil' => 'empresa']);
        $cooperativa = User::factory()->create(['perfil' => 'cooperativa']);

        $residuo = $this->criarResiduo($empresaA);
        $anuncioId = DB::table('anuncios')->insertGetId([
            'residuo_id' => $residuo->id,
            'cooperativa_id' => $cooperativa->id,
            'status' => 'concluido',
            'observacoes' => 'Coleta concluida',
            'data_coleta' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Certificado::create([
            'anuncio_id' => $anuncioId,
            'empresa_id' => $empresaA->id,
            'cooperativa_id' => $cooperativa->id,
            'numero_certificado' => 'CERT-G-001',
            'tipo_residuo' => 'metal',
            'peso_coletado' => 6.00,
            'data_coleta' => now(),
            'pdf_url' => '/storage/certificados/CERT-G-001.pdf',
        ]);

        Certificado::create([
            'anuncio_id' => $anuncioId,
            'empresa_id' => $empresaB->id,
            'cooperativa_id' => $cooperativa->id,
            'numero_certificado' => 'CERT-G-002',
            'tipo_residuo' => 'papel',
            'peso_coletado' => 11.00,
            'data_coleta' => now(),
            'pdf_url' => '/storage/certificados/CERT-G-002.pdf',
        ]);

        Sanctum::actingAs($gestor);
        $response = $this->getJson('/api/v1/certificados');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 2)
            ->assertJsonCount(2, 'data.data');
    }

    private function mockPdfFacade(): void
    {
        $pdfMock = Mockery::mock(DomPdf::class);
        $pdfMock->shouldReceive('output')->andReturn('pdf-content');

        PDF::shouldReceive('loadHTML')
            ->andReturn($pdfMock);
    }

    private function criarContextoDeCertificado(): array
    {
        $empresa = User::factory()->create(['perfil' => 'empresa']);
        $cooperativa = User::factory()->create(['perfil' => 'cooperativa']);
        $residuo = $this->criarResiduo($empresa);

        $anuncioId = DB::table('anuncios')->insertGetId([
            'residuo_id' => $residuo->id,
            'cooperativa_id' => $cooperativa->id,
            'status' => 'concluido',
            'observacoes' => 'Coleta finalizada',
            'data_coleta' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [
            'empresa' => $empresa,
            'cooperativa' => $cooperativa,
            'anuncio_id' => $anuncioId,
        ];
    }

    private function criarResiduo(User $usuario): Residuo
    {
        return Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => 'metal',
            'descricao' => 'Residuo para certificado',
            'foto_url' => null,
            'peso_estimado' => 2.50,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'coletado',
            'janela_inicio' => now()->subDay(),
            'janela_fim' => now(),
        ]);
    }
}
