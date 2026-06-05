import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/theme-context';

export default function CidadaoHome() {
    const { usuario, logout } = useAuth();
    const { colors, scheme, toggleTheme } = useTheme();
    const isDark = scheme === 'dark';
    const [saldo, setSaldo] = useState(0);

    useEffect(() => {
        api.get("/pontos")
           .then((res) => setSaldo(res.data.data?.saldo || 0))
           .catch(() => {});
    }, []);

    const acoes = [
        { label: "Anunciar Resíduo", icon: "📦", path: "/cidadao/anunciar", id: 'anunciar' },
        { label: "Ver Mapa", icon: "🗺️", path: "/cidadao/mapa", id: 'mapa' },
        { label: "Fazer Denúncia", icon: "📸", path: "/cidadao/denunciar", id: 'denunciar' },
        { label: "Meus Pontos", icon: "🌿", path: "/cidadao/pontos", id: 'pontos' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>WasteGo</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Olá, {usuario?.nome || usuario?.name}! 👋</Text>
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
                {/* Resumo */}
                <View style={styles.grid2x2}>
                    <Pressable 
                        onPress={() => router.push('/cidadao/pontos' as any)}
                        style={({ pressed }) => [
                            styles.moedaCard,
                            { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
                            pressed && { opacity: 0.8 }
                        ]}
                    >
                        <Text style={styles.moedaLabel}>Moeda Verde</Text>
                        <Text style={styles.moedaValue}>{saldo}</Text>
                        <Text style={styles.moedaSub}>pontos</Text>
                    </Pressable>

                    <View style={[styles.moedaCard, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                        <Text style={[styles.moedaLabel, { color: '#92400e' }]}>Impacto</Text>
                        <Text style={[styles.moedaValue, { color: '#92400e', fontSize: 36, marginTop: 8 }]}>🌍</Text>
                        <Text style={[styles.moedaSub, { color: '#b45309' }]}>você faz a diferença</Text>
                    </View>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Ações rápidas</Text>
                
                <View style={styles.grid}>
                    {acoes.map((acao) => (
                        <Pressable 
                            key={acao.id} 
                            style={({ pressed }) => [
                                styles.actionCard, 
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                pressed && { opacity: 0.7 }
                            ]}
                            onPress={() => router.push(acao.path as any)}
                        >
                            <Text style={styles.actionIcon}>{acao.icon}</Text>
                            <Text style={[styles.actionLabel, { color: colors.text }]}>{acao.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center', 
        padding: 20, 
        paddingTop: 50,
        borderBottomWidth: 1
    },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    iconBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 20 },
    content: { padding: 20 },
    grid2x2: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    moedaCard: { flex: 1, borderRadius: 16, padding: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    moedaLabel: { color: '#166534', fontSize: 14, fontWeight: '600' },
    moedaValue: { color: '#14532d', fontSize: 40, fontWeight: 'bold', marginTop: 4 },
    moedaSub: { color: '#166534', fontSize: 12, marginTop: 4 },
    sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    actionCard: {
        width: '48%',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    actionIcon: { fontSize: 28, marginBottom: 8 },
    actionLabel: { fontSize: 14, fontWeight: '500' }
});
