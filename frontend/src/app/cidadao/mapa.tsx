import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';

const TIPOS = [
    { value: '', label: 'Todos os tipos' },
    { value: 'plastico', label: 'Plástico' },
    { value: 'papel', label: 'Papel' },
    { value: 'vidro', label: 'Vidro' },
    { value: 'metal', label: 'Metal' },
    { value: 'eletronico', label: 'Eletrônico' },
];

type Ecoponto = {
    id: number;
    nome: string;
    endereco: string;
    latitude: number;
    longitude: number;
    tipos_residuo: string;
    horario_funcionamento: string;
};

export default function MapaScreen() {
    const { colors } = useTheme();
const [ecopontos, setEcopontos] = useState<Ecoponto[]>([]);
const [posicao, setPosicao] = useState({ latitude: -23.550520, longitude: -46.633308 });
const [filtro, setFiltro] = useState('');
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

useEffect(() => {
    let isMounted = true;

    api.get('/ecopontos')
        .then(res => {
            if (isMounted) setEcopontos(res.data.data || []);
        })
        .catch(() => { });

    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let location = await Location.getCurrentPositionAsync({});
        if (isMounted) {
            setPosicao({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        }
    })();

    return () => {
        isMounted = false;
    };
}, []);

const ecopontosFiltrados = useMemo(() => {
    if (!filtro) return ecopontos;
    return ecopontos.filter(ep => ep.tipos_residuo.includes(filtro));
}, [ecopontos, filtro]);

const initialRegion = {
    latitude: posicao.latitude,
    longitude: posicao.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: colors.primary }}>←</Text></Pressable>
            <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Mapa de Ecopontos</Text>
        </View>

        <View style={styles.filterContainer}>
            <View style={styles.dropdownWrapper}>
                <Pressable
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                    <Text style={{ color: colors.text }}>{TIPOS.find(t => t.value === filtro)?.label || 'Todos os tipos'}</Text>
                    <Text style={{ color: colors.primary }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                </Pressable>
                {isDropdownOpen && (
                    <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {TIPOS.map(t => (
                            <Pressable
                                key={t.value}
                                onPress={() => { setFiltro(t.value); setIsDropdownOpen(false); }}
                                style={styles.dropdownItem}
                            >
                                <Text style={{ color: colors.text }}>{t.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        </View>

        <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={initialRegion}
                showsUserLocation={true}
            >
                {ecopontosFiltrados.map(ep => (
                    <Marker
                        key={ep.id}
                        coordinate={{ latitude: ep.latitude, longitude: ep.longitude }}
                    >
                        <Callout>
                            <View style={{ width: 150, padding: 5 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{ep.nome}</Text>
                                <Text style={{ fontSize: 12 }}>{ep.endereco}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>

        <FlatList
            data={ecopontosFiltrados}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={{ fontWeight: 'bold', color: colors.text, fontSize: 16 }}>{item.nome}</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{item.endereco}</Text>
                    <Text style={{ fontSize: 12, color: colors.primary, marginTop: 8, fontWeight: '600' }}>
                        {item.tipos_residuo.split(',').map(r => r.trim()).join(' • ')}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>🕒 {item.horario_funcionamento}</Text>
                </View>
            )}
        />
    </View>
);
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, zIndex: 2 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    filterContainer: { padding: 20, paddingBottom: 10, zIndex: 10 },
    dropdownWrapper: { zIndex: 10 },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 14 },
    dropdownList: { marginTop: 4, borderWidth: 1.5, borderRadius: 12, overflow: 'hidden', position: 'absolute', top: 50, left: 0, right: 0, zIndex: 20 },
    dropdownItem: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    mapContainer: { height: 250, borderTopWidth: 1, borderBottomWidth: 1 },
    card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 }
});
