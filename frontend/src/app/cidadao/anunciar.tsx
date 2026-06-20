import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import AlertBox from '../../components/alert-box';
import Button from '../../components/button';
import { useTheme } from '../../context/theme-context';
import api from '../../services/api';

type WasteCategory = 'plastico' | 'papel' | 'vidro' | 'metal' | 'eletronico' | 'organico' | 'entulho' | '';

import { useLocationConfirmation } from '../../context/LocationContext';

const CATEGORIAS = [
    { value: 'plastico', label: 'Plástico' },
    { value: 'papel', label: 'Papel' },
    { value: 'vidro', label: 'Vidro' },
    { value: 'metal', label: 'Metal' },
    { value: 'eletronico', label: 'Eletrônico' },
    { value: 'organico', label: 'Orgânico' },
    { value: 'entulho', label: 'Entulho' },
];

export default function AnunciarScreen() {
    const { colors } = useTheme();
    const { requestConfirmedLocation } = useLocationConfirmation();

    const [categoria, setCategoria] = useState<WasteCategory>('plastico');
    const [descricao, setDescricao] = useState('');
    const [peso, setPeso] = useState('');
    const [janelaInicio, setJanelaInicio] = useState('');
    const [janelaFim, setJanelaFim] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [localizacao, setLocalizacao] = useState<{lat: number, lng: number} | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const capturarLocalizacao = async () => {
        try {
            let location = await requestConfirmedLocation();
            setLocalizacao({ lat: location.coords.latitude, lng: location.coords.longitude });
            setError('');
        } catch (err: any) {
            setError(err.message || 'Falha ao obter localização.');
        }
    };

    const handleSubmit = async () => {
        if (!descricao.trim()) {
            setError('Preencha a descrição.');
            return;
        }
        if (!localizacao) {
            setError('Capture sua localização antes de anunciar.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const payload: any = {
                categoria,
                descricao: descricao.trim(),
                peso_estimado: Number(peso),
                latitude: localizacao.lat,
                longitude: localizacao.lng,
            };
            if (fotoUrl.trim()) payload.foto_url = fotoUrl.trim();
            if (janelaInicio) payload.janela_inicio = janelaInicio;
            if (janelaFim) payload.janela_fim = janelaFim;

            await api.post('/residuos', payload);
            setShowSuccessAlert(true);
            setDescricao('');
            setPeso('');
            setJanelaInicio('');
            setJanelaFim('');
            setFotoUrl('');
        } catch (err) {
            setError('Erro ao criar anúncio. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    const handleAlertClose = () => {
        setShowSuccessAlert(false);
        router.back();
    };

    const catLabel = CATEGORIAS.find(c => c.value === categoria)?.label || '(selecione)';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.headerTitle, { color: colors.primaryDark }]}>Anunciar Resíduo</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: colors.textMuted }]}>CATEGORIA DO RESÍDUO</Text>
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
                    placeholder="Estado do material, observações..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={3}
                    style={[styles.textarea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
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

                <Text style={[styles.label, { color: colors.textMuted }]}>URL DA FOTO (OPCIONAL)</Text>
                <TextInput
                    value={fotoUrl}
                    onChangeText={setFotoUrl}
                    placeholder="Link da imagem..."
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                />

                <Text style={[styles.label, { color: colors.textMuted }]}>PESO ESTIMADO (KG)</Text>
                <TextInput
                    value={peso}
                    onChangeText={setPeso}
                    keyboardType="numeric"
                    placeholder="Ex: 2.5"
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

                <Button label={loading ? "Enviando..." : "Anunciar Resíduo"} onPress={handleSubmit} style={styles.submitBtn} />
            </ScrollView>

            {showSuccessAlert && (
                <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <View style={styles.alertWrapper}>
                        <AlertBox
                            title="Sucesso!"
                            message="Anúncio criado com sucesso!"
                            variant="success"
                            onClose={handleAlertClose}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingTop: 50, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: 20, gap: 10 },
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 6, marginTop: 8 },
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
    submitBtn: { marginTop: 24 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: 20 },
    alertWrapper: { width: '100%' }
});
