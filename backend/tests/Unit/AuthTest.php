<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_com_dados_validos_retorna_201_com_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'nome' => 'Usuario Teste',
            'email' => 'usuario@example.com',
            'senha' => 'password123',
            'perfil' => 'empresa',
            'nome_empresa' => 'Empresa Teste',
            'telefone' => '11999999999',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.usuario.email', 'usuario@example.com')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'usuario',
                    'token',
                ],
                'message',
            ]);
    }

    public function test_registro_com_email_duplicado_retorna_422(): void
    {
        User::factory()->create([
            'email' => 'duplicado@example.com',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'nome' => 'Outro Usuario',
            'email' => 'duplicado@example.com',
            'senha' => 'password123',
            'perfil' => 'cidadao',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registro_com_perfil_invalido_retorna_422(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'nome' => 'Usuario Invalido',
            'email' => 'invalido@example.com',
            'senha' => 'password123',
            'perfil' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['perfil']);
    }

    public function test_login_com_credenciais_corretas_retorna_token(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => bcrypt('password123'),
            'perfil' => 'empresa',
            'nome_empresa' => 'Empresa Login',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'senha' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.usuario.email', 'login@example.com')
            ->assertJsonStructure([
                'success',
                'data' => [
                    'usuario',
                    'token',
                ],
                'message',
            ]);
    }

    public function test_login_com_senha_errada_retorna_401(): void
    {
        User::factory()->create([
            'email' => 'senha-errada@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'senha-errada@example.com',
            'senha' => 'senhaErrada123',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_logout_revoga_o_token(): void
    {
        $usuario = User::factory()->create();
        $tokenPlain = $usuario->createToken('auth_token')->plainTextToken;
        $tokenId = (int) explode('|', $tokenPlain)[0];

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenPlain)
            ->postJson('/api/v1/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $tokenId,
        ]);
    }

    public function test_rota_me_retorna_dados_do_usuario_autenticado(): void
    {
        $usuario = User::factory()->create([
            'email' => 'me@example.com',
        ]);

        $tokenPlain = $usuario->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$tokenPlain)
            ->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'me@example.com');
    }
}
