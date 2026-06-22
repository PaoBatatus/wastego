<?php

namespace Tests\Unit;

use App\Models\Residuo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResiduoTest extends TestCase
{
    use RefreshDatabase;

    public function test_listar_residuos_disponiveis_retorna_200_com_lista_paginada(): void
    {
        $usuario = User::factory()->create();

        Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => 'metal',
            'descricao' => 'Residuo disponivel',
            'peso_estimado' => 2.00,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'disponivel',
        ]);

        Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => 'plastico',
            'descricao' => 'Residuo reservado',
            'peso_estimado' => 1.00,
            'latitude' => -23.5605200,
            'longitude' => -46.6433080,
            'status' => 'reservado',
        ]);

        $response = $this->getJson('/api/v1/residuos');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonStructure([
                'success',
                'data' => ['data', 'current_page', 'per_page', 'total'],
                'message',
            ]);
    }

    public function test_criar_residuo_com_dados_validos_retorna_201(): void
    {
        $usuario = User::factory()->create(['perfil' => 'cidadao']);
        Sanctum::actingAs($usuario);

        $response = $this->postJson('/api/v1/residuos', [
            'categoria' => 'vidro',
            'descricao' => 'Garrafas para coleta',
            'foto_url' => 'https://example.com/foto.jpg',
            'peso_estimado' => 3.50,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'foto' => \Illuminate\Http\UploadedFile::fake()->image('foto.jpg'),
        ]);
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.categoria', 'vidro');

        $this->assertDatabaseHas('residuos', [
            'user_id' => $usuario->id,
            'categoria' => 'vidro',
            'status' => 'disponivel',
        ]);
    }

    public function test_criar_residuo_sem_autenticacao_retorna_401(): void
    {
        $response = $this->postJson('/api/v1/residuos', [
            'categoria' => 'papel',
            'descricao' => 'Papel para reciclagem',
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
        ]);

        $response->assertStatus(401);
    }

    public function test_buscar_residuo_por_id_retorna_200_com_dados_corretos(): void
    {
        $usuario = User::factory()->create();
        $residuo = Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => 'eletronico',
            'descricao' => 'Notebook antigo',
            'peso_estimado' => 4.20,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'disponivel',
        ]);

        $response = $this->getJson("/api/v1/residuos/{$residuo->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $residuo->id)
            ->assertJsonPath('data.categoria', 'eletronico');
    }

    public function test_atualizar_residuo_pelo_dono_retorna_200(): void
    {
        $usuario = User::factory()->create(['perfil' => 'cidadao']);
        $residuo = Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => 'papel',
            'descricao' => 'Descricao antiga',
            'peso_estimado' => 1.00,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'disponivel',
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->putJson("/api/v1/residuos/{$residuo->id}", [
            'descricao' => 'Descricao atualizada',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.descricao', 'Descricao atualizada');
    }

    public function test_atualizar_residuo_por_outro_usuario_retorna_403(): void
    {
        $dono = User::factory()->create(['perfil' => 'cidadao']);
        $outroUsuario = User::factory()->create(['perfil' => 'cidadao']);

        $residuo = Residuo::create([
            'user_id' => $dono->id,
            'categoria' => 'papel',
            'descricao' => 'Residuo do dono',
            'peso_estimado' => 1.00,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'disponivel',
        ]);

        Sanctum::actingAs($outroUsuario);

        $response = $this->putJson("/api/v1/residuos/{$residuo->id}", [
            'descricao' => 'Tentativa sem permissao',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_deletar_residuo_pelo_dono_retorna_200(): void
    {
        $usuario = User::factory()->create(['perfil' => 'cidadao']);
        $residuo = Residuo::create([
            'user_id' => $usuario->id,
            'categoria' => 'organico',
            'descricao' => 'Residuo para exclusao',
            'peso_estimado' => 2.10,
            'latitude' => -23.5505200,
            'longitude' => -46.6333080,
            'status' => 'disponivel',
        ]);

        Sanctum::actingAs($usuario);

        $response = $this->deleteJson("/api/v1/residuos/{$residuo->id}");

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('residuos', [
            'id' => $residuo->id,
        ]);
    }
}
