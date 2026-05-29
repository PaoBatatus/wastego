import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/theme-context';
import { BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

function normalizarResumo(data: any) {
    const obj = data?.data ?? data ?? {};
    const totalDenuncias = Object.values(obj.denuncias_por_status ?? {}).reduce((a: any, b: any) => a + b, 0);
    const totalUsuarios = Object.values(obj.usuarios_por_perfil ?? {}).reduce((a: any, b: any) => a + b, 0);
    return {
        totalResiduos: obj.total_residuos_anunciados ?? 0,
        totalDenuncias: Number(totalDenuncias),
        totalUsuarios: Number(totalUsuarios),
        totalCertificados: obj.total_certificados_emitidos ?? 0,
    };
}

const coresStatus: any = { recebida: "#ef4444", em_analise: "#eab308", resolvida: "#22c55e" };

export default function GestorDashboard() {
    const { usuario, logout } = useAuth();
    const { colors, scheme, toggleTheme } = useTheme();
    const isDark = scheme === 'dark';

    const [carregando, setCarregando] = useState(true);
    const [resumo, setResumo] = useState({ totalResiduos: 0, totalDenuncias: 0, totalUsuarios: 0, totalCertificados: 0 });
    const [denunciasMapa, setDenunciasMapa] = useState<any[]>([]);
    const [residuosCategoria, setResiduosCategoria] = useState<{ labels: string[], datasets: any[] }>({ labels: [''], datasets: [{ data: [0] }] });
    const [volumeMensal, setVolumeMensal] = useState<{ labels: string[], datasets: any[] }>({ labels: [''], datasets: [{ data: [0] }] });

    useEffect(() => {
        setCarregando(true);
        Promise.all([
            api.get("/dashboard/resumo").then(res => setResumo(normalizarResumo(res.data))),
            api.get("/dashboard/denuncias-localizacao").then(res => setDenunciasMapa(res.data?.data || res.data || [])),
            api.get("/dashboard/residuos-categoria").then(res => {
                const list = res.data?.data || res.data || [];
                const labels = list.map((item: any) => item.categoria || item.name || '—').slice(0, 6);
                const data = list.map((item: any) => item.total || item.quantidade || item.value || 0).slice(0, 6);
                if (labels.length > 0) setResiduosCategoria({ labels, datasets: [{ data }] });
            }),
            api.get("/dashboard/volume-mensal").then(res => {
                const list = res.data?.data || res.data || [];
                const labels = list.map((item: any) => item.mes || item.mes_label || '—').slice(-6);
                const data = list.map((item: any) => item.volume || item.total || 0).slice(-6);
                if (labels.length > 0) setVolumeMensal({ labels, datasets: [{ data }] });
            })
        ]).finally(() => setCarregando(false));
    }, []);

    const CARDS = [
        { key: "totalResiduos", label: "Resíduos", bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
        { key: "totalDenuncias", label: "Denúncias", bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
        { key: "totalUsuarios", label: "Usuários", bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
        { key: "totalCertificados", label: "Certificados", bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Dashboard Municipal</Text>
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

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.grid2x2}>
                    {CARDS.map(card => (
                        <View key={card.key} style={[styles.summaryCard, { backgroundColor: card.bg, borderColor: card.border }]}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: card.text }}>{card.label}</Text>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: card.text, marginTop: 4 }}>
                                {carregando ? '...' : (resumo as any)[card.key]}
                            </Text>
                        </View>
                    ))}
                </View>

                <Pressable
                    onPress={() => router.push('/gestor/denuncias' as any)}
                    style={({ pressed }) => [
                        { backgroundColor: '#9333ea', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24, flexDirection: 'row', justifyContent: 'center', gap: 10 },
                        pressed && { opacity: 0.8 }
                    ]}
                >
                    <Text style={{ fontSize: 20 }}>🚨</Text>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Gerenciar Denúncias</Text>
                </Pressable>

                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Resíduos por Categoria</Text>
                <View style={[styles.chartWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <BarChart
                        data={residuosCategoria}
                        width={screenWidth - 40}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: colors.surface,
                            backgroundGradientFrom: colors.surface,
                            backgroundGradientTo: colors.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
                            labelColor: (opacity = 1) => colors.textMuted,
                        }}
                        style={{ borderRadius: 12, marginVertical: 8 }}
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Volume Mensal</Text>
                <View style={[styles.chartWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <LineChart
                        data={volumeMensal}
                        width={screenWidth - 40}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: colors.surface,
                            backgroundGradientFrom: colors.surface,
                            backgroundGradientTo: colors.surface,
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                            labelColor: (opacity = 1) => colors.textMuted,
                        }}
                        bezier
                        style={{ borderRadius: 12, marginVertical: 8 }}
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 12 }]}>Mapa de Denúncias</Text>
                <View style={[styles.mapContainer, { borderColor: colors.border }]}>
                    <MapView
                        style={StyleSheet.absoluteFillObject}
                        initialRegion={{ latitude: -23.550520, longitude: -46.633308, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
                    >
                        {denunciasMapa.filter(d => d.latitude && d.longitude).map(d => (
                            <Marker
                                key={d.id}
                                coordinate={{ latitude: Number(d.latitude), longitude: Number(d.longitude) }}
                                pinColor={coresStatus[d.status] || '#6b7280'}
                            >
                                <Callout>
                                    <View style={{ width: 120 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{d.status.toUpperCase()}</Text>
                                        <Text style={{ fontSize: 12 }}>{d.categoria}</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    iconBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 20 },
    content: { padding: 20 },
    grid2x2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    summaryCard: { width: '48%', borderRadius: 12, padding: 16, borderWidth: 1 },
    sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    chartWrapper: { borderRadius: 12, borderWidth: 1, padding: 0, marginBottom: 20, overflow: 'hidden' },
    mapContainer: { height: 300, borderRadius: 12, overflow: 'hidden', borderWidth: 1, marginBottom: 20 }
});
