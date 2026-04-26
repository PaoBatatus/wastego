<?php

namespace Tests\Unit;

use App\Models\Residuo;
use App\Models\User;
use App\Services\MoedaVerdeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class MoedaVerdeTest extends TestCase
{
    use RefreshDatabase;

    public function test_creditar_pontos_para_residuo_eletronico_retorna_50_pontos(): void
    {
        $service = new MoedaVerdeService();
        $usuario = User::factory()->create();
        $residuo = $this->criarResiduo($usuario, 'eletronico');

        $saldo = $service->creditarPontos($usuario, $residuo);

        $this->assertSame(50, $saldo);
        $this->assertDatabaseHas('pontos_verde', [
            'user_id' => $usuario->id,
            'residuo_id' => $residuo->id,
            'pontos' => 50,
            'tipo' => 'ganho',
        ]);
    }

    public function test_creditar_pontos_para_residuo_de_metal_retorna_30_pontos(): void
    {
        $service = new MoedaVerdeService();
        $usuario = User::factory()->create();
        $residuo = $this->criarResiduo($usuario, 'metal');

        $saldo = $service->creditarPontos($usuario, $residuo);

        $this->assertSame(30, $saldo);
        $this->assertDatabaseHas('pontos_verde', [
            'user_id' => $usuario->id,
            'residuo_id' => $residuo->id,
            'pontos' => 30,
            'tipo' => 'ganho',
        ]);
    }

    public function test_creditar_pontos_para_residuo_comum_retorna_10_pontos(): void
    {
        $service = new MoedaVerdeService();
        $usuario = User::factory()->create();
        $residuo = $this->criarResiduo($usuario, 'plastico');

        $saldo = $service->creditarPontos($usuario, $residuo);

        $this->assertSame(10, $saldo);
        $this->assertDatabaseHas('pontos_verde', [
            'user_id' => $usuario->id,
            'residuo_id' => $residuo->id,
            'pontos' => 10,
            'tipo' => 'ganho',
        ]);
    }

    public function test_resgatar_pontos_com_saldo_suficiente_debita_corretamente(): void
    {
        $service = new MoedaVerdeService();
        $usuario = User::factory()->create();
        $residuo = $this->criarResiduo($usuario, 'eletronico');
        $service->creditarPontos($usuario, $residuo);

        $novoSaldo = $service->resgatarPontos($usuario, 20, 'Troca por benefício');

        $this->assertSame(30, $novoSaldo);
        $this->assertDatabaseHas('pontos_verde', [
            'user_id' => $usuario->id,
            'pontos' => 20,
            'tipo' => 'resgate',
            'descricao' => 'Troca por benefício',
        ]);
    }

    public function test_resgatar_pontos_com_saldo_insuficiente_lanca_excecao(): void
    {
        $service = new MoedaVerdeService();
        $usuario = User::factory()->create();

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Saldo insuficiente para realizar o resgate.');

        $service->resgatarPontos($usuario, 10, 'Resgate inválido');
    }

    public function test_get_saldo_retorna_a_soma_correta_dos_pontos(): void
    {
        $service = new MoedaVerdeService();
        $usuario = User::factory()->create();

        $service->creditarPontos($usuario, $this->criarResiduo($usuario, 'eletronico')); // 50
        $service->creditarPontos($usuario, $this->criarResiduo($usuario, 'metal')); // 30
        $service->resgatarPontos($usuario, 25, 'Resgate parcial'); // -25

        $saldo = $service->getSaldo($usuario);

        $this->assertSame(55, $saldo);
    }

    private function criarResiduo(User $usuario, string $categoria): Residuo
    {
        return Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => $categoria,
            'descricao' => 'Residuo para teste',
            'foto_url' => null,
            'peso_estimado' => 1.50,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'disponivel',
            'janela_inicio' => now(),
            'janela_fim' => now()->addHour(),
        ]);
    }
}
