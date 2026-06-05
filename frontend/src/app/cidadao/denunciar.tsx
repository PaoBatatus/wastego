import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { router } from 'expo-router';
import AlertBox from '../../components/alert-box';
import Button from '../../components/button';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';
import * as Location from 'expo-location';

const CATEGORIAS = [
    { value: 'descarte_irregular', label: 'Descarte irregular' },
    { value: 'lixo_via_publica', label: 'Lixo em via pública' },
    { value: 'entulho', label: 'Entulho' },
    { value: 'poda_fora_calendario', label: 'Poda fora do calendário' },
    { value: 'outro', label: 'Outro' },
];

export default function DenunciarScreen() {
    const { colors } = useTheme();

    const [categoria, setCategoria] = useState('descarte_irregular');
    const [descricao, setDescricao] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [localizacao, setLocalizacao] = useState<{lat: number, lng: number} | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const [historico, setHistorico] = useState<any[]>([]);

    const carregarHistorico = useCallback(async () => {
        try {
            const { data } = await api.get('/denuncias');
            const lista = data?.data?.data ?? data?.data ?? [];
            setHistorico(Array.isArray(lista) ? lista : []);
        } catch {
            setHistorico([]);
        }
    }, []);

    useEffect(() => {
        carregarHistorico();
    }, [carregarHistorico]);

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
        if (!descricao.trim()) {
            setError('Preencha a descrição da denúncia.');
            return;
        }
        if (!localizacao) {
            setError('Capture sua localização antes de denunciar.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const payload: any = {
                categoria,
                descricao: descricao.trim(),
                latitude: localizacao.lat,
                longitude: localizacao.lng,
            };
            if (fotoUrl.trim()) payload.foto_url = fotoUrl.trim();

            await api.post('/denuncias', payload);
            setShowSuccessAlert(true);
            setDescricao('');
            setFotoUrl('');
            setLocalizacao(null);
            carregarHistorico();
        } catch (err: any) {
            let errorMsg = 'Erro ao enviar denúncia.';
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

    const renderHistorico = ({ item }: any) => (
        <View style={[styles.histCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', color: colors.text }}>
                    {CATEGORIAS.find(c => c.value === item.categoria)?.label || item.categoria}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 15 }}><Text style={{ fontSize: 24, color: colors.primary }}>←</Text></Pressable>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Fazer Denúncia</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: colors.textMuted }]}>CATEGORIA</Text>
                <View style={styles.dropdownWrapper}>
                    <Pressable
                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                        <Text style={{ color: colors.text }}>{catLabel}</Text>
                        <Text style={{ color: colors.primary }}>{isDropdownOpen ? '▲' : '▼'}</Text>
                    </Pressable>
                    {isDropdownOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {CATEGORIAS.map(cat => (
                                <Pressable
                                    key={cat.value}
                                    onPress={() => { setCategoria(cat.value); setIsDropdownOpen(false); }}
                                    style={styles.dropdownItem}
                                >
                                    <Text style={{ color: colors.text }}>{cat.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                <Text style={[styles.label, { color: colors.textMuted }]}>DESCRIÇÃO *</Text>
                <TextInput
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Descreva o problema observado..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    style={[styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>URL DA FOTO (OPCIONAL)</Text>
                <TextInput
                    value={fotoUrl}
                    onChangeText={setFotoUrl}
                    placeholder="https://..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>LOCALIZAÇÃO</Text>
                <Pressable
                    onPress={capturarLocalizacao}
                    style={({ pressed }) => [
                        styles.photoPressable,
                        { borderColor: colors.primary, backgroundColor: pressed ? colors.primaryLight : 'transparent' }
                    ]}
                >
                    <Text style={styles.photoIcon}>📍</Text>
                    <Text style={[styles.photoLabel, { color: colors.primary }]}>
                        {localizacao ? 'Localização Capturada' : 'Capturar Minha Localização'}
                    </Text>
                </Pressable>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button label={loading ? "Enviando..." : "Enviar Denúncia"} onPress={handleSubmit} style={styles.submitBtn} />

                <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 32 }]}>MINHAS DENÚNCIAS</Text>
                {historico.length === 0 ? (
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>Nenhuma denúncia enviada ainda.</Text>
                ) : (
                    historico.map(h => renderHistorico({ item: h }))
                )}

            </ScrollView>

            {showSuccessAlert && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={styles.alertWrapper}>
                        <AlertBox title="Sucesso!" message="Denúncia enviada! A prefeitura foi notificada." variant="success" onClose={() => setShowSuccessAlert(false)} />
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
    textarea: { borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 14, textAlignVertical: 'top', height: 110 },
    photoPressable: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8 },
    photoIcon: { fontSize: 24 },
    photoLabel: { fontSize: 15, fontWeight: '600' },
    errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 4, marginLeft: 4 },
    submitBtn: { marginTop: 24 },
    histCard: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 10 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
    alertWrapper: { width: '100%' }
});
