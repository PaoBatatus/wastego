import React, { useState, useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';

const CATEGORIAS = [
    { value: '', label: 'Todas as categorias' },
    { value: 'plastico', label: 'Plástico' },
    { value: 'papel', label: 'Papel' },
    { value: 'vidro', label: 'Vidro' },
    { value: 'metal', label: 'Metal' },
    { value: 'eletronico', label: 'Eletrônico' },
    { value: 'organico', label: 'Orgânico' },
    { value: 'entulho', label: 'Entulho' },
];

export default function MuralScreen() {
    const { colors } = useTheme();
    const [residuos, setResiduos] = useState<any[]>([]);
    const [filtro, setFiltro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        api.get('/residuos')
            .then(res => {
                const lista = res.data?.data?.data || res.data?.data || res.data || [];
                const disponiveis = lista.filter((r: any) => !r.status || r.status === 'disponivel');
                setResiduos(disponiveis);
            })
            .catch(() => setResiduos([]))
            .finally(() => setCarregando(false));
    }, []);

    const residuosFiltrados = useMemo(() => {
        if (!filtro) return residuos;
        return residuos.filter((r) => r.categoria === filtro);
    }, [residuos, filtro]);

    const renderOferta = ({ item }: any) => (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontWeight: 'bold', color: '#16a34a', fontSize: 14 }}>
                {CATEGORIAS.find(c => c.value === item.categoria)?.label || item.categoria}
            </Text>
            <Text style={{ fontSize: 14, color: colors.text, marginTop: 4 }}>{item.descricao}</Text>
            <Text style={{ fontSize: 13, color: colors.text, marginTop: 8 }}>
                Peso: <Text style={{ fontWeight: 'bold' }}>{item.peso_estimado != null ? Number(item.peso_estimado) + ' kg' : '—'}</Text>
            </Text>
            {(item.janela_inicio || item.janela_fim) && (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                    Retirada: {item.janela_inicio ? new Date(item.janela_inicio).toLocaleString() : 'Livre'} até {item.janela_fim ? new Date(item.janela_fim).toLocaleString() : 'Livre'}
                </Text>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: '#16a34a' }}>←</Text></Pressable>
                <Text style={[styles.headerTitle, { color: '#14532d' }]}>Mural de Ofertas</Text>
            </View>

            <View style={styles.filterContainer}>
                <View style={styles.dropdownWrapper}>
                    <Pressable
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                        <Text style={{ color: colors.text }}>{CATEGORIAS.find(c => c.value === filtro)?.label}</Text>
                        <Text style={{ color: '#16a34a' }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                    </Pressable>
                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {CATEGORIAS.map(cat => (
                                <Pressable
                                    key={cat.value}
                                    onPress={() => { setFiltro(cat.value); setIsDropdownOpen(false); }}
                                    style={styles.dropdownItem}
                                >
                                    <Text style={{ color: colors.text }}>{cat.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <View style={{ height: 250 }}>
                <MapView 
                    style={StyleSheet.absoluteFillObject}
                    initialRegion={{ latitude: -23.550520, longitude: -46.633308, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
                >
                    {residuosFiltrados.filter(r => r.latitude && r.longitude).map(r => (
                        <Marker key={r.id} coordinate={{ latitude: Number(r.latitude), longitude: Number(r.longitude) }}>
                            <Callout>
                                <View style={{ width: 180 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{CATEGORIAS.find(c => c.value === r.categoria)?.label}</Text>
                                    <Text>{r.peso_estimado} kg</Text>
                                    {(r.janela_inicio || r.janela_fim) && (
                                        <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                                            {r.janela_inicio ? String(r.janela_inicio).substring(0, 10) : 'Livre'} a {r.janela_fim ? String(r.janela_fim).substring(0, 10) : 'Livre'}
                                        </Text>
                                    )}
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>

            <FlatList
                data={residuosFiltrados}
                keyExtractor={item => String(item.id)}
                renderItem={renderOferta}
                contentContainerStyle={{ padding: 20 }}
                ListEmptyComponent={<Text style={{ color: colors.textMuted, marginTop: 10 }}>{carregando ? 'Carregando ofertas...' : 'Nenhuma oferta disponível.'}</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, zIndex: 2 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    filterContainer: { padding: 20, paddingBottom: 0, zIndex: 10 },
    dropdownWrapper: { zIndex: 10, marginBottom: 10 },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 14 },
    dropdownList: { marginTop: 4, borderWidth: 1.5, borderRadius: 12, overflow: 'hidden', position: 'absolute', top: 55, left: 0, right: 0, zIndex: 20 },
    dropdownItem: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 }
});
