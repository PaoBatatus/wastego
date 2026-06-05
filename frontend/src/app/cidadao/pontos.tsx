import React, { useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Card from '../../components/card';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';

const BENEFICIOS = [
  { titulo: "Desconto em evento cultural", custo: 100 },
  { titulo: "Voucher em comércio parceiro", custo: 200 },
  { titulo: "Crédito na taxa de coleta", custo: 500 },
];

const PONTOS_POR_CATEGORIA = [
  { categoria: "Eletrônico", pontos: 50 },
  { categoria: "Metal", pontos: 30 },
  { categoria: "Vidro", pontos: 20 },
  { categoria: "Outros", pontos: 10 },
];

export default function MoedaVerdeScreen() {
    const { colors } = useTheme();
    const [saldo, setSaldo] = useState(0);
    const [historico, setHistorico] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/pontos").then(res => setSaldo(res.data.data?.saldo ?? 0)),
            api.get("/pontos/historico").then(res => {
                const lista = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
                setHistorico(lista);
            })
        ]).finally(() => setCarregando(false));
    }, []);

    const renderHistoryItem = ({ item }: ListRenderItemInfo<any>) => {
        const isGanho = item.tipo === 'ganho';
        return (
            <Card style={{ padding: 12, marginBottom: 8 }}>
                <View style={styles.histRow}>
                    <View style={[styles.iconBox, { backgroundColor: isGanho ? '#dcfce7' : '#fee2e2' }]}>
                        <Text style={{ fontSize: 16, color: isGanho ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                            {isGanho ? '+' : '-'}
                        </Text>
                    </View>
                    <View style={styles.histTextContainer}>
                        <Text style={[styles.histTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.descricao}
                        </Text>
                        <Text style={[styles.histDate, { color: colors.textMuted }]}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text style={[styles.histPts, { color: isGanho ? '#166534' : '#991b1b' }]}>
                        {isGanho ? '+' : '-'}{Math.abs(item.pontos)} pts
                    </Text>
                </View>
            </Card>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: colors.primary }}>←</Text></Pressable>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Moeda Verde</Text>
            </View>

            <FlatList
                data={historico}
                keyExtractor={item => String(item.id)}
                renderItem={renderHistoryItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={{ color: colors.textMuted, marginTop: 10 }}>Nenhuma movimentação.</Text>}
                ListHeaderComponent={() => (
                    <>
                        <View style={[styles.coinsCard, { backgroundColor: '#059669' }]}>
                            <Text style={styles.coinsLabel}>Seu saldo</Text>
                            <Text style={styles.coinsValue}>{carregando ? '...' : saldo}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>pontos disponíveis</Text>
                        </View>

                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Pontos por categoria</Text>
                        <View style={[styles.pointsTable, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {PONTOS_POR_CATEGORIA.map((p, i) => (
                                <View key={i} style={[styles.pointsRow, i < PONTOS_POR_CATEGORIA.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' }]}>
                                    <Text style={{ color: colors.text }}>{p.categoria}</Text>
                                    <Text style={{ color: '#166534', fontWeight: 'bold' }}>{p.pontos} pts</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>Benefícios disponíveis</Text>
                        <View style={{ marginBottom: 24, gap: 10 }}>
                            {BENEFICIOS.map((b, i) => (
                                <View key={i} style={[styles.benefitRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={{ flex: 1, color: colors.text, fontWeight: '500' }}>{b.titulo}</Text>
                                    <View style={{ backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                                        <Text style={{ color: '#047857', fontWeight: 'bold', fontSize: 12 }}>{b.custo} pts</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Histórico</Text>
                    </>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    list: { padding: 20 },
    coinsCard: { borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    coinsLabel: { color: 'rgba(255,255,255,.8)', fontSize: 14, fontWeight: '600' },
    coinsValue: { color: '#fff', fontSize: 48, fontWeight: 'bold', marginTop: 4 },
    sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    pointsTable: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
    pointsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1 },
    histRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    histTextContainer: { flex: 1 },
    histTitle: { fontSize: 14, fontWeight: '500' },
    histDate: { fontSize: 12, marginTop: 2 },
    histPts: { fontSize: 14, fontWeight: '700' }
});
