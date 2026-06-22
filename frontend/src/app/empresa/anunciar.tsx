import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AlertBox from '../../components/alert-box';
import Button from '../../components/button';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';
import { useLocationConfirmation } from '../../context/LocationContext';

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
    const { requestConfirmedLocation } = useLocationConfirmation();

    const [categoria, setCategoria] = useState<WasteCategory>('plastico');
    const [descricao, setDescricao] = useState('');
    const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
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

    const tirarFoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setError('Precisamos da permissão da câmera para tirar a foto.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setFoto(result.assets[0]);
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!descricao.trim()) { setError('Preencha a descrição.'); return; }
        if (!foto) { setError('A foto é obrigatória.'); return; }

        setError('');
        setLoading(true);
        try {
            let location;
            try {
                location = await requestConfirmedLocation();
            } catch (err: any) {
                setError(err.message || 'Confirmação de localização cancelada ou falhou.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('categoria', categoria);
            formData.append('descricao', descricao.trim());
            formData.append('latitude', String(location.coords.latitude));
            formData.append('longitude', String(location.coords.longitude));

            const filename = foto.uri.split('/').pop() || 'foto.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('foto', {
                uri: foto.uri,
                name: filename,
                type,
            } as any);

            await api.post('/residuos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowSuccessAlert(true);
            setDescricao('');
            setFoto(null);
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

                <Text style={[styles.label, { color: colors.textMuted }]}>FOTO DO LOTE *</Text>
                <Pressable
                    onPress={tirarFoto}
                    style={({ pressed }) => [
                        styles.photoPressable,
                        { borderColor: '#2563eb', backgroundColor: pressed ? '#eff6ff' : 'transparent', marginBottom: 12, overflow: 'hidden' }
                    ]}
                >
                    {foto ? (
                        <Image source={{ uri: foto.uri }} style={{ width: '100%', height: 150, borderRadius: 8 }} resizeMode="cover" />
                    ) : (
                        <>
                            <Text style={styles.photoIcon}>📷</Text>
                            <Text style={[styles.photoLabel, { color: '#2563eb' }]}>
                                Tirar Foto
                            </Text>
                        </>
                    )}
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
