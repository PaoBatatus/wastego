import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/theme-context';

export default function EmpresaHome() {
    const { usuario, logout } = useAuth();
    const { colors, scheme, toggleTheme } = useTheme();
    const isDark = scheme === 'dark';
    
    const [totalResiduos, setTotalResiduos] = useState(0);
    const [totalCertificados, setTotalCertificados] = useState(0);
    const [carregando, setCarregando] = useState(true);

    const nomeExibicao = usuario?.nome_empresa || usuario?.name || "Empresa";

    useEffect(() => {
        Promise.all([
            api.get("/residuos/meus")
               .then((res) => setTotalResiduos(res.data?.data?.data?.length || res.data?.data?.length || res.data?.length || 0))
               .catch(() => setTotalResiduos(0)),
            api.get("/certificados")
               .then((res) => setTotalCertificados(res.data?.data?.length || res.data?.length || 0))
               .catch(() => setTotalCertificados(0))
        ]).finally(() => setCarregando(false));
    }, []);

    const acoes = [
        { label: "Anunciar Lote", icon: "📦", path: "/empresa/anunciar", id: 'anunciar', bg: '#2563eb' },
        { label: "Ver Certificados", icon: "📜", path: "/empresa/certificados", id: 'certificados', bg: '#059669' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Painel Empresa</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Olá, {nomeExibicao}! 👋</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable onPress={toggleTheme} style={styles.iconBtn}>
                        <Text style={{ fontSize: 16 }}>{isDark ? '🌙' : '☀️'}</Text>
                    </Pressable>
                    <Pressable onPress={logout} style={styles.iconBtn}>
                        <Text style={{ fontSize: 16 }}>🚪</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                        <Text style={[styles.statLabel, { color: '#1d4ed8' }]}>Resíduos anunciados</Text>
                        <Text style={[styles.statValue, { color: '#1e40af' }]}>{carregando ? '...' : totalResiduos}</Text>
                        <Text style={[styles.statSub, { color: '#2563eb' }]}>lotes cadastrados</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                        <Text style={[styles.statLabel, { color: '#047857' }]}>Certificados emitidos</Text>
                        <Text style={[styles.statValue, { color: '#065f46' }]}>{carregando ? '...' : totalCertificados}</Text>
                        <Text style={[styles.statSub, { color: '#059669' }]}>CDF disponíveis</Text>
                    </View>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Ações Rápidas</Text>
                
                <View style={styles.grid}>
                    {acoes.map((acao) => (
                        <Pressable 
                            key={acao.id} 
                            style={({ pressed }) => [
                                styles.actionCard, 
                                { backgroundColor: acao.bg },
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={() => router.push(acao.path as any)}
                        >
                            <Text style={styles.actionIcon}>{acao.icon}</Text>
                            <Text style={styles.actionLabel}>{acao.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    iconBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 20 },
    content: { padding: 20 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1 },
    statLabel: { fontSize: 13, fontWeight: '600' },
    statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
    statSub: { fontSize: 11, marginTop: 4 },
    sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    grid: { flexDirection: 'column', gap: 12 },
    actionCard: { borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
    actionIcon: { fontSize: 28 },
    actionLabel: { fontSize: 16, fontWeight: '600', color: '#fff' }
});
