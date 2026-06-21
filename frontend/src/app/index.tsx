import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Button from '../components/button';
import Input from '../components/input';
import { useTheme } from '../context/theme-context';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { colors, scheme } = useTheme();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const utfprLogoSource = scheme === 'dark'
        ? require('../../assets/utfpr/logo-utfpr-negativa.png')
        : require('../../assets/utfpr/logo-utfpr.png');

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Preencha email e senha');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const usuario = await login(email, password);
            const rotas: Record<string, any> = {
                cidadao: '/cidadao',
                empresa: '/empresa',
                cooperativa: '/cooperativa',
                gestor: '/gestor',
            };
            router.replace(rotas[usuario.perfil] || '/');
        } catch (err) {
            setError('Email ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={[styles.title, {color: colors.primaryDark}]}>
                    WasteGo
                </Text>
                <Text style={[styles.subtitle, {color: colors.textMuted}]}>
                    Conectando cidadãos, empresas, governo e cooperativas.
                </Text>
                <View style={[styles.freeBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.freeBadgeText, { color: colors.primary }]}>
                        Aplicativo 100% Gratuito
                    </Text>
                </View>
            </View>

            <View style={styles.form}>
                <Input
                    label="E-mail"
                    value={email}
                    onChangeText={(text) => { setEmail(text); setError(''); }}
                    keyboardType="email-address"
                    placeholder="exemplo@email.com"
                    autoCapitalize="none"
                />
                <Input
                    label="Senha"
                    value={password}
                    onChangeText={(text) => { setPassword(text); setError(''); }}
                    secureTextEntry
                    placeholder="********"
                />
                {error ? <Text style={{color: '#ef4444', marginBottom: 10, textAlign: 'center'}}>{error}</Text> : null}
            </View>

            <View style={styles.cta}>
                <Button label={loading ? "Entrando..." : "Entrar"} onPress={handleLogin}></Button>
                <Button
                    label="Criar conta"
                    onPress={() => router.push('/cadastro')}
                    variant='ghost'
                    style={{marginTop: 10}}
                />
                <View style={styles.partnerContainer}>
                    <Text style={[styles.partnerText, {color: colors.textMuted}]}>Apoio Institucional</Text>
                    <Image 
                        source={utfprLogoSource} 
                        style={styles.partnerLogo}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 28 },
    header: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    logo: { width: 80, height: 80, marginBottom: 8 },
    title: { fontSize: 32, fontWeight: '700', letterSpacing: -1 },
    subtitle: { fontSize: 14, textAlign: 'center' },
    freeBadge: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    freeBadgeText: { fontSize: 12, fontWeight: '600' },
    form: { flex: 1, justifyContent: 'center' },
    cta: { paddingBottom: 16 },
    partnerContainer: { alignItems: 'center', marginTop: 24 },
    partnerText: { fontSize: 12, marginBottom: 8 },
    partnerLogo: { height: 40, width: 120 },
});
