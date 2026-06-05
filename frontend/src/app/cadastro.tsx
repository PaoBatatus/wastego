import React, { useState, useRef, useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import AlertBox from '../components/alert-box';
import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
    const { colors } = useTheme();
    const { register } = useAuth();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [perfil, setPerfil] = useState('cidadao'); // Default
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [telefone, setTelefone] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const isMounted = useRef(true);
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleRegister = async () => {
        if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }
        if ((perfil === 'empresa' || perfil === 'cooperativa') && !nomeEmpresa.trim()) {
            setError('Nome da Empresa/Cooperativa obrigatório.');
            return;
        }
        if (senha !== confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const payload: any = { nome, email, senha, perfil };
            if (perfil === 'empresa' || perfil === 'cooperativa') {
                payload.nome_empresa = nomeEmpresa;
            }
            if (telefone) payload.telefone = telefone;
            
            await register(payload);
            if (isMounted.current) {
                setShowSuccessAlert(true);
            }
        } catch (err: any) {
            let errorMsg = err.response?.data?.message || 'Erro ao realizar cadastro.';
            if (err.response?.data?.errors) {
                const firstKey = Object.keys(err.response.data.errors)[0];
                errorMsg = err.response.data.errors[firstKey][0];
            }
            if (isMounted.current) setError(errorMsg);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={[styles.title, { color: colors.primaryDark }]}>Criar Conta</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Preencha os dados abaixo</Text>
            </View>

            {showSuccessAlert ? (
                <AlertBox 
                    title="Sucesso"
                    message="Conta criada com sucesso!"
                    variant="success"
                    onClose={() => router.replace('/')} 
                />
            ) : (
                <>
                    <View style={styles.form}>
                        <Input
                            label="Nome Completo"
                            value={nome}
                            onChangeText={(text) => { setNome(text); setError(''); }}
                            placeholder="Digite seu nome"
                        />
                        <Input
                            label="E-mail"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setError(''); }}
                            keyboardType="email-address"
                            placeholder="exemplo@email.com"
                            autoCapitalize="none"
                        />
                        
                        <Text style={[styles.label, { color: colors.textMuted }]}>Perfil</Text>
                        <View style={styles.perfilRow}>
                            {['cidadao', 'empresa', 'cooperativa', 'gestor'].map(p => (
                                <Pressable 
                                    key={p} 
                                    onPress={() => setPerfil(p)}
                                    style={[styles.perfilBtn, perfil === p && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                >
                                    <Text style={[styles.perfilText, perfil === p && { color: '#fff' }]}>
                                        {p === 'cidadao' ? 'Cidadão' : p === 'empresa' ? 'Empresa' : p === 'cooperativa' ? 'Coop.' : 'Gestor'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {(perfil === 'empresa' || perfil === 'cooperativa') && (
                            <Input
                                label={perfil === 'empresa' ? 'Nome da Empresa' : 'Nome da Cooperativa'}
                                value={nomeEmpresa}
                                onChangeText={(text) => { setNomeEmpresa(text); setError(''); }}
                                placeholder="Nome fantasia ou razão social"
                            />
                        )}

                        <Input
                            label="Telefone (opcional)"
                            value={telefone}
                            onChangeText={(text) => { setTelefone(text); setError(''); }}
                            placeholder="(11) 99999-9999"
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Senha"
                            value={senha}
                            onChangeText={(text) => { setSenha(text); setError(''); }}
                            secureTextEntry
                            placeholder="********"
                        />
                        <Input
                            label="Confirmar Senha"
                            value={confirmarSenha}
                            onChangeText={(text) => { setConfirmarSenha(text); setError(''); }}
                            secureTextEntry
                            placeholder="********"
                        />
                        {error ? <Text style={{color: '#ef4444', marginBottom: 10, textAlign: 'center'}}>{error}</Text> : null}
                    </View>

                    <View style={styles.cta}>
                        <Button label={loading ? "Cadastrando..." : "Cadastrar"} onPress={handleRegister} />
                        <Button
                            label="Já tenho uma conta"
                            onPress={() => router.back()}
                            variant="ghost"
                            style={{ marginTop: 10 }}
                        />
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    logo: { width: 80, height: 80, marginBottom: 8 },
    container: { flex: 1 },
    content: { padding: 28, paddingBottom: 50 },
    header: { marginBottom: 32, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
    subtitle: { fontSize: 14 },
    form: { marginBottom: 24 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
    perfilRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    perfilBtn: { flex: 1, minWidth: '40%', borderWidth: 1, borderColor: '#ccc', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
    perfilText: { fontSize: 13, fontWeight: '600', color: '#666' },
    cta: { marginTop: 8 },
});
