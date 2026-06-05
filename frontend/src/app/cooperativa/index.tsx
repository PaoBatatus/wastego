import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/theme-context';

export default function CooperativaHome() {
    const { usuario, logout } = useAuth();
    const { colors, scheme, toggleTheme } = useTheme();
    const isDark = scheme === 'dark';

    const [disponiveis, setDisponiveis] = useState(0);
    const [coletasRealizadas, setColetasRealizadas] = useState(0);
    const [carregando, setCarregando] = useState(true);

    const nomeExibicao = usuario?.nome_empresa || usuario?.name || "Cooperativa";

    useEffect(() => {
        setCarregando(true);
        api.get("/residuos")
            .then((res) => {
                const lista = res.data?.data?.data || res.data?.data || res.data || [];
                const disponiveisCount = lista.filter((r: any) => r.status === "disponivel").length;
                const coletadosCount = lista.filter((r: any) => r.status === "coletado").length;
                setDisponiveis(disponiveisCount);
                setColetasRealizadas(coletadosCount);
            })
            .catch(() => {
                setDisponiveis(0);
                setColetasRealizadas(0);
            })
            .finally(() => setCarregando(false));
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Painel Cooperativa</Text>
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
                    <View style={[styles.statCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                        <Text style={[styles.statLabel, { color: '#047857' }]}>Resíduos disponíveis</Text>
                        <Text style={[styles.statValue, { color: '#065f46' }]}>{carregando ? '...' : disponiveis}</Text>
                        <Text style={[styles.statSub, { color: '#059669' }]}>prontos para coleta</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                        <Text style={[styles.statLabel, { color: '#15803d' }]}>Coletas realizadas</Text>
                        <Text style={[styles.statValue, { color: '#166534' }]}>{carregando ? '...' : coletasRealizadas}</Text>
                        <Text style={[styles.statSub, { color: '#16a34a' }]}>concluídas por você</Text>
                    </View>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Ação rápida</Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.actionCard,
                        { backgroundColor: '#16a34a' },
                        pressed && { opacity: 0.8 }
                    ]}
                    onPress={() => router.push('/cooperativa/mural' as any)}
                >
                    <Text style={styles.actionIcon}>📋</Text>
                    <Text style={styles.actionLabel}>Ver Mural de Ofertas</Text>
                </Pressable>
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
    statsRow: { flexDirection: 'column', gap: 12, marginBottom: 24 },
    statCard: { borderRadius: 12, padding: 20, borderWidth: 1 },
    statLabel: { fontSize: 14, fontWeight: '600' },
    statValue: { fontSize: 36, fontWeight: 'bold', marginTop: 4 },
    statSub: { fontSize: 12, marginTop: 4 },
    sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    actionCard: { borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
    actionIcon: { fontSize: 28 },
    actionLabel: { fontSize: 16, fontWeight: '600', color: '#fff' }
});
