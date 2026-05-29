import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import AlertBox from '../../components/alert-box';
import Button from '../../components/button';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';
import * as Location from 'expo-location';

type WasteCategory = 'plastico' | 'papel' | 'vidro' | 'metal' | 'eletronico' | 'organico' | 'entulho' | '';

const CATEGORIAS = [
    { value: 'plastico', label: 'Plástico' },
    { value: 'papel', label: 'Papel' },
    { value: 'vidro', label: 'Vidro' },
    { value: 'metal', label: 'Metal' },
    { value: 'eletronico', label: 'Eletrônico' },
    { value: 'organico', label: 'Orgânico' },
    { value: 'entulho', label: 'Entulho' },
];

export default function AnunciarLoteScreen() {
    const { colors } = useTheme();

    const [categoria, setCategoria] = useState<WasteCategory>('plastico');
    const [descricao, setDescricao] = useState('');
    const [pesoEstimado, setPesoEstimado] = useState('');
    const [janelaInicio, setJanelaInicio] = useState('');
    const [janelaFim, setJanelaFim] = useState('');
    const [localizacao, setLocalizacao] = useState<{lat: number, lng: number} | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const [lotes, setLotes] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const carregarLotes = useCallback(async () => {
        try {
            const { data } = await api.get('/residuos/meus');
            const lista = data?.data?.data || data?.data || data || [];
            setLotes(Array.isArray(lista) ? lista : []);
        } catch {
            setLotes([]);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchLotes = async () => {
            try {
                const { data } = await api.get('/residuos/meus');
                if (isMounted) {
                    const lista = data?.data?.data || data?.data || data || [];
                    setLotes(Array.isArray(lista) ? lista : []);
                }
            } catch {
                if (isMounted) setLotes([]);
            }
        };
        fetchLotes();

        return () => { isMounted = false; };
    }, []);

    const capturarLocalizacao = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permissão de localização negada.');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocalizacao({ lat: location.coords.latitude, lng: location.coords.longitude });
            setError('');
        } catch (err) {
            setError('Falha ao obter localização.');
        }
    };

    const handleSubmit = async () => {
        if (!descricao.trim()) { setError('Preencha a descrição.'); return; }
        if (!pesoEstimado) { setError('Informe o peso estimado.'); return; }
        if (!localizacao) { setError('Capture sua localização antes de anunciar.'); return; }

        setError('');
        setLoading(true);
        try {
            const pesoConvertido = pesoEstimado ? Number(pesoEstimado.replace(',', '.')) : NaN;
            const payload: any = {
                categoria,
                descricao: descricao.trim(),
                latitude: localizacao.lat,
                longitude: localizacao.lng,
                ...(!isNaN(pesoConvertido) ? { peso_estimado: pesoConvertido } : {})
            };
            if (janelaInicio) payload.janela_inicio = janelaInicio;
            if (janelaFim) payload.janela_fim = janelaFim;

            await api.post('/residuos', payload);
            setShowSuccessAlert(true);
            setDescricao('');
            setPesoEstimado('');
            setJanelaInicio('');
            setJanelaFim('');
            setLocalizacao(null);
            carregarLotes();
        } catch (err: any) {
            let errorMsg = 'Erro ao criar anúncio de lote.';
            if (err.response?.data?.errors) {
                const firstKey = Object.keys(err.response.data.errors)[0];
                errorMsg = err.response.data.errors[firstKey][0];
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const catLabel = CATEGORIAS.find(c => c.value === categoria)?.label || '(selecione)';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: '#2563eb' }}>←</Text></Pressable>
                <Text style={[styles.headerTitle, { color: '#1e3a8a' }]}>Anunciar Lote</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: colors.textMuted }]}>CATEGORIA</Text>
                <View style={styles.dropdownWrapper}>
                    <Pressable
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                        <Text style={{ color: colors.text }}>{catLabel}</Text>
                        <Text style={{ color: '#2563eb' }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                    </Pressable>
                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {CATEGORIAS.map(cat => (
                                <Pressable
                                    key={cat.value}
                                    onPress={() => { setCategoria(cat.value as WasteCategory); setIsDropdownOpen(false); }}
                                    style={styles.dropdownItem}
                                >
                                    <Text style={{ color: colors.text }}>{cat.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                <Text style={[styles.label, { color: colors.textMuted }]}>DESCRIÇÃO</Text>
                <TextInput
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Descreva o lote de resíduos..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    style={[styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>PESO ESTIMADO (KG) *</Text>
                <TextInput
                    value={pesoEstimado}
                    onChangeText={setPesoEstimado}
                    keyboardType="numeric"
                    placeholder="Ex: 50.5"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>JANELA DE RETIRADA (INÍCIO) - OPCIONAL</Text>
                <TextInput
                    value={janelaInicio}
                    onChangeText={setJanelaInicio}
                    placeholder="Ex: 2026-05-30T10:00"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>JANELA DE RETIRADA (FIM) - OPCIONAL</Text>
                <TextInput
                    value={janelaFim}
                    onChangeText={setJanelaFim}
                    placeholder="Ex: 2026-05-30T18:00"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>LOCALIZAÇÃO</Text>
                <Pressable
                    onPress={capturarLocalizacao}
                    style={({ pressed }) => [
                        styles.photoPressable,
                        { borderColor: '#2563eb', backgroundColor: pressed ? '#eff6ff' : 'transparent' }
                    ]}
                >
                    <Text style={styles.photoIcon}>📍</Text>
                    <Text style={[styles.photoLabel, { color: '#2563eb' }]}>
                        {localizacao ? 'Localização Capturada' : 'Capturar Localização'}
                    </Text>
                </Pressable>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Pressable 
                    onPress={handleSubmit} 
                    disabled={loading}
                    style={({ pressed }) => [styles.submitBtn, { opacity: pressed || loading ? 0.7 : 1 }]}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                        {loading ? "Enviando..." : "Anunciar Lote"}
                    </Text>
                </Pressable>

                <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 32 }]}>ÚLTIMOS LOTES</Text>
                {lotes.length === 0 ? (
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Nenhum lote anunciado ainda.</Text>
                ) : (
                    lotes.map(item => (
                        <View key={item.id} style={[styles.histCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontWeight: '600', color: colors.text }}>
                                    {CATEGORIAS.find(c => c.value === item.categoria)?.label || item.categoria}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563eb' }}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 13, color: colors.text, marginBottom: 4 }}>{Number(item.peso_estimado)} kg</Text>
                            <Text style={{ fontSize: 12, color: colors.textMuted }}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {showSuccessAlert && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={styles.alertWrapper}>
                        <AlertBox title="Sucesso!" message="Lote anunciado! Cooperativas serão notificadas." variant="success" onClose={() => setShowSuccessAlert(false)} />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: 20, gap: 10 },
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 6, marginTop: 8 },
    sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
    dropdownWrapper: { zIndex: 10, marginBottom: 4 },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 14 },
    dropdownList: { marginTop: 4, borderWidth: 1.5, borderRadius: 12, overflow: 'hidden' },
    dropdownItem: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
    input: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 4 },
    textarea: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 14, textAlignVertical: 'top', height: 90 },
    photoPressable: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8 },
    photoIcon: { fontSize: 24 },
    photoLabel: { fontSize: 15, fontWeight: '600' },
    errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
    submitBtn: { marginTop: 24, backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
    histCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 10 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
    alertWrapper: { width: '100%' }
});
